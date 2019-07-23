import AppConstants from '../constants/constants';
import { getConfiguration, formatDateTo, executeSQL} from '../utilities/utils';

async function getToken() {
  try {
    let token = null;

    // Lo obtengo desde la configuración
    token = await getConfiguration('TOKEN');
    if(token != null){
      return token;
    }

    // Consulto por un nuevo token
    let url = await getConfiguration('URL_BACKEND');
    let username = await getConfiguration('USER_BACKEND');
    let password = await getConfiguration('PASS_BACKEND');

    console.log("Consultando WS con valores", url, username, password)

    let response = await fetch(url + AppConstants.WS_LOGIN, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario: username, pass: password}),
    });

    // Proceso la respuesta que da el WS para verificar que no haya errores
    let responseJson = await response.json();
    if(responseJson.returnset[0].RCode != 1) {
      throw responseJson.returnset[0].RTxt;
    }
    
    // Guardo el nuevo token en la configuración
    await executeSQL(`insert into Configuration (key, value, updated) values (?, ?, ?)`,['TOKEN', responseJson.dataset[0].jwt, formatDateTo(new Date(), 'YYYY/MM/DD HH:mm:ss')])
    return responseJson.dataset[0].jwt;

  } catch (error) {
    throw `ERROR obteniendo token: ${error}`;
  }
}

export async function sendPostTo(url, body){
  try {
    // Obtengo el token
    let token = await getToken();

    // Hago el request al WS
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify(body),
    }); 

    let responseJson = await response.json();
    
    // logResponse(url, body, responseJson)     

    // Si el token esta vencido, consigo otro.
    if(responseJson.returnset[0].RTxt === "Token inválido") {
      console.info('\x1b[47m\x1b[30mSe vención el token. Se obtendrá uno nuevo\x1b[0m\x1b[40m');
      await executeSQL('delete from Configuration where key = ?', ["TOKEN"])
      //invoco nuevamente el metodo, ahora con el nuevo token
      return await sendPostTo(url, body);
    }

    // Chequeo si hubo errores
    if(responseJson.returnset[0].RCode == null || responseJson.returnset[0].RCode == undefined || responseJson.returnset[0].RCode != 0) {
      console.info(`Falló la consulta al WS. Devolvió ${JSON.stringify(responseJson)}`)
      throw reject(`Falló la consulta al WS ${AppConstants.WS_LOGIN}`)
    }

    return responseJson;
    
  } catch (error) {
    throw (error)
  }
}

function logResponse(url, body, response) {
  let msg = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-access-token': token,
    },
    body: JSON.stringify(body),
  };
  console.log(`===================================================`)
  console.log(`MESSAGE: url: ${url} \n ${JSON.stringify(msg)}`) 
  console.log(`---------------------------------------------------`)
  console.log(`RESPONSE: ${JSON.stringify(response)} \n`) 
}

export async function showDatasetResponse(table, dataset) {
  console.log(`============== ${table} ===============`)
  dataset.forEach((data, index) => {
    console.log(`${index}: ${JSON.stringify(data)}`)
  })
  console.log(`================================================`)
}