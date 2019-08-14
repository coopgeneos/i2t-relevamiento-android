import { CameraRoll } from 'react-native';
import { MediaLibrary, FileSystem } from 'expo';

export function executeSQL(sql, params){
  return new Promise(async function(resolve, reject) {
    global.DB.transaction(tx => {
      tx.executeSql(
        sql,
        params,
        (_, { rows }) => {
          resolve(rows._array)
        },
        (_, err) => {
          reject(err)
        }
      )
    });
  })
}

export function executeSQLUPSERT(insertSQL, insertParams, updateSQL, updateParams){
  return new Promise(async function(resolve, reject) {
    let error_msg = ""
    global.DB.transaction(
      tx => {
        tx.executeSql(
          insertSQL,
          insertParams,
          (_, { rows }) => {
            resolve(rows._array);
          },
          (_tx, err) => {
            if(err.toString().includes("code 2067")){
              console.log("Fallo al insertar y se va actualizar el registro", err)
              _tx.executeSql(
                updateSQL,
                updateParams,
                (_, { rows }) => {
                  resolve(rows._array)
                },
                (_, err) => {
                  console.log("Fallo el UPSERT: Fallo al actualizar", err)
                  reject(err)
                }
              )
            }
          }
        )
      }
    );
  })
}

export async function showDB (tables) {
  if(typeof tables != "object")
    return
  tables.forEach(async table => {
    let data = await executeSQL(`select * from ${table}`)
      .catch(err => {
        console.log(err)
      })
    console.log(`============================================`)
    console.log(`${table}`)
    console.log(`============================================`)
    console.log(data)
  })
}

/*
  Esta manera de codificar los identificadores fué propuesta por I2T
*/
let consultant_num = -1;
async function getConsultantNumber() {
  if(consultant_num < 0) 
    consultant_num = Number(await getConfiguration('CONSULTANT_NUM'));
  return consultant_num;
}

export async function encodeID(id) {
  return (await getConsultantNumber()) * 1000000 + id;
}

export async function decodeID(id) {
  return id - (await getConsultantNumber()) * 1000000;
}

export async function exportDB() {
  try {
    /* La exportación la hago llevando la base al album */
    const asset = await MediaLibrary.createAssetAsync(`${FileSystem.documentDirectory}SQLite/relevamiento.db`);
    let album = await MediaLibrary.getAlbumAsync("Relevamiento");
    // Si no existe el album lo creo
    if(album == null) {
      album = await MediaLibrary.createAlbumAsync("Relevamiento", asset, true)
    } else {
      // Si ya existía, solo guardo la base en el album
      const assets = [asset];
      MediaLibrary.addAssetsToAlbumAsync(assets, album, true);
    }
    return "La base se exportó en el albúm Relevamiento";
  } catch(error) {
    console.log("Error exportando la base:",error);
    return "Error exportando la base: " + error;
  }     
}