import React from 'react';
import { Container, Content, Text, Button, Icon } from 'native-base';
import { getConfiguration, formatDateTo, executeSQL, showDB } from '../utilities/utils'
import AppConstans from '../constants/constants';
import { StyleSheet, Alert, Modal} from 'react-native';
import { Grid, Row, Col } from "react-native-easy-grid";

import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';

/* 
EQUIVALENCIAS:
LOCAL           WS
̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ 
Contact         Contactos (api/proc/ExtraeContactos)
Activity        Tareas (api/proc/ExtraeTareas)
ActivityType    Actividades (api/proc/ExtraeActividades)
ItemActType     Consigna (api/proc/ExtraeConsignas)
ListItemAct     Referencias (api/proc/ExtraeReferencias)
Answer          Relevamiento
*/

export default class SincronizeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.url = null;
    this.username = null;
    this.password = null;
    this.consultant_num = null;
    this.state = {
      //modalVisible: false,
      modalMessagge: "",
    };
  }

  async getParams(){
    try {// this.url = 'http://tstvar.i2tsa.com.ar:3006'; 
      this.url = this.url == null ? await getConfiguration('URL_BACKEND') : this.url;
      this.username = this.username == null ? await getConfiguration('USER_BACKEND') : this.username;
      this.password = this.password == null ? await getConfiguration('PASS_BACKEND') : this.password;
      this.consultant_num = this.consultant_num == null ? Number(await getConfiguration('CONSULTANT_NUM')) : this.consultant_num;
    } catch (error) {
      throw new Error(error)
    }
  }

  async getToken() {
    return new Promise(async (resolve, reject) => {
      try {
        if(this.state.token){
          return resolve(this.state.token);
        }
  
        this.state.token = await getConfiguration('TOKEN');
        if(this.state.token != null){
          return resolve(this.state.token);
        }

        // console.info(`URL: ${this.url + AppConstans.WS_LOGIN} body: ${JSON.stringify({ usuario: this.username, pass: this.password})}`)

        let response = await fetch(this.url + AppConstans.WS_LOGIN, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ usuario: this.username, pass: this.password}),
        });
        let responseJson = await response.json();
        
        if(responseJson.returnset[0].RCode != 1) {
          return reject(`El par usuario y contraseña no es correcto`)
        }

        await executeSQL(`insert into Configuration (key, value, updated) values (?, ?, ?)`,['TOKEN', responseJson.dataset[0].jwt, formatDateTo(new Date(), 'YYYY/MM/DD HH:mm:ss')])
        this.setState({token: responseJson.dataset[0].jwt});
        resolve(this.state.token);
      } catch (error) {
        reject(`ERROR obteniendo token: ${error}`)
      }
    }) 
  }

  async getFromWS(url, body){
    return new Promise(async (resolve, reject) => {
      try {
        var token = await this.getToken()

        /* let msg = {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': token,
          },
          body: JSON.stringify(body),
        };
        console.log(`MESSAGE: url: ${url} \n ${JSON.stringify(msg)}`) */

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
        // console.log(`RESPONSE: ${JSON.stringify(responseJson)}`)       

        /* 
          Si el token esta vencido, consigo otro.
        */
        if(responseJson.returnset[0].RTxt === "Token inválido") {
          console.info('\x1b[47m\x1b[30mSe vención el token. Se obtendrá uno nuevo\x1b[0m\x1b[40m');
          delete this.state.token;
          await executeSQL('delete from Configuration where key = ?', ["TOKEN"])
          return this.getFromWS(url, body) //invoco nuevamente el metodo, ahora con el nuevo token
        }

        if(responseJson.returnset[0].RCode && responseJson.returnset[0].RCode != 1) {
          console.info(`Falló la consulta al WS. Devolvió ${JSON.stringify(responseJson)}`)
          return reject(`Falló la consulta al WS`)
        }

        return resolve(responseJson);
      } catch (error) {
        reject(error)
      }
    })
  }

  syncContacts(from){
    return new Promise(async (resolve, reject) => { 
      try {
        var ctsws = await this.getFromWS(
          this.url+AppConstans.WS_CONTACT_DOWNLOAD, 
          {usuario: this.username, FechaDesde: from, Otros: ''});

        ctsws = ctsws.dataset
        // console.log(`CONTACTOS: \n ${JSON.stringify(ctsws)}`)
  
        global.DB.transaction(tx => {
          for(i=0; i<ctsws.length; i++){
           tx.executeSql(
              ` insert or replace into Contact(uuid, user_id, name, address, city, zipCode, phone, email, latitude, longitude, updated)  
                values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [ ctsws[i].id_contacto, global.context.user.id, ctsws[i].nombre, 
                ctsws[i].primary_address_street, ctsws[i].primary_address_city, 
                ctsws[i].primary_address_postalcode, ctsws[i].phone_mobile, 
                ctsws[i].email_c, ctsws[i].jjwg_maps_lat_c, ctsws[i].jjwg_maps_lng_c,
                formatDateTo(new Date(), 'YYYY/MM/DD HH:mm:ss')
              ],
              (_, rows) => {},
              (_, err) => {
              //console.error(`ERROR en una de las sentencias de sincronizacion de contactos ${err}`)
              throw new Error(`ERROR en una de las sentencias ${err}`)
            })
          }
          },
          err => {
            //console.error(`ERROR en la transaccion ${err}`)
            throw new Error(`ERROR en una de las transacción ${err}`)
          },
          () => {
            resolve(`${ctsws.length} contactos sincronizados`)
          }
        )     
      } catch (err) {
        reject(err)
      }
    }) 
  }

  syncActivityType(from){        
    return new Promise(async (resolve, reject) => {
      try {
        var acts = await this.getFromWS(
          this.url+AppConstans.WS_ACTIVITYTYPE_DOWNLOAD, 
          {usuario: this.username, FechaDesde: from, Otros: ''})

        acts = acts.dataset;
        // console.log(`ACTIVITY TYPE: \n ${JSON.stringify(acts)}`)
  
        global.DB.transaction(tx => {
          for(i=0; i<acts.length; i++){
            tx.executeSql(
              ` insert or replace into ActivityType (uuid, description, updated) values (?, ?, ?)`,
              [acts[i].id_actividad, acts[i].name, formatDateTo(new Date(), 'YYYY/MM/DD HH:mm:ss')],
              (_, rows) => {},
              (_, err) => {
              //console.error(`ERROR en una de las sentencias de sincronizacion de ActivityType ${err}`)
              throw new Error(`ERROR en una de las sentencias de sincronizacion. ${err}`)
            })
          }
          },
          err => {
            //console.error(`ERROR en la transaccion ${err}`)
            throw new Error(`ERROR en una de las transacción ${err}`)
          },
          () => {
            resolve(`${acts.length} tipo de actividades sincronizadas`)
          }
        )
      } catch (err) {
        reject(err)
      }
    })
  }

  syncItemActType(from){
    return new Promise(async (resolve, reject) => {
      try {
        var items = await this.getFromWS(
          this.url+AppConstans.WS_ITEMACTTYPE_DOWNLOAD, 
          {usuario: this.username, FechaDesde: from, Otros: ''})
          
        items = items.dataset;
        // console.log(`ITEM ACT TYPE: ${JSON.stringify(items)}`)
  
        global.DB.transaction(tx => {
            for(i=0; i<items.length; i++){
              tx.executeSql(
                ` insert or replace into ItemActType (uuid, activityType_id, activityType_uuid, description, type, required, reference, position, state, updated) 
                  values (?, (select at.id from ActivityType at where at.uuid = ?),?, ?, ?, ?, ?, ?, ?, ?);`,
                [ items[i].id_consigna, 
                  items[i].id_actividad, 
                  items[i].id_actividad,
                  items[i].name, 
                  items[i].con_tipodato == 'rel_simple' ? 'lista' : items[i].con_tipodato, 
                  items[i].con_requerido,
                  items[i].con_tablaref,
                  items[i].rca_orden,
                  items[i].con_estado,
                  formatDateTo(new Date(), 'YYYY/MM/DD HH:mm:ss')
                ],
                (_, rows) => {},
                (_, err) => {
                  //console.error(`ERROR en una de las sentencias de sincronizacion de ItemActType ${err}`)
                  throw new Error(`ERROR en una de las sentencias ${err}`)
                })
            }
          },
          err => {
            //console.error(`ERROR en la transaccion ${err}`)
            throw new Error(`ERROR en una de las transacción ${err}`)
          },
          () => {
            resolve(`${items.length} item de tipo de actividades sincronizadas`)
          }
        )
      } catch (err) {
        reject(err)
      }
      
    })
  }

  syncListItemAct(from){
    return new Promise(async (resolve, reject) => {
      try {
        var items = await this.getFromWS(
          this.url+AppConstans.WS_LISTITEMACT_DOWNLOAD, 
          {usuario: this.username, FechaDesde: from, Otros: ''})
          
        items = items.dataset;
        // console.log(`LIST ITEMS: \n ${JSON.stringify(items)}`)
  
        global.DB.transaction(tx => {
            for(i=0; i<items.length; i++){
              let listValues = items[i].ref_valor.split(",");
              for(j=0; j<listValues.length; j++) {
                tx.executeSql(
                  ` insert or replace into ListItemAct (uuid, reference, value, account_id, updated)  
                    values (?, ?, ?, ?, ?);`,
                  [ items[i].id_referencias, items[i].ref_tablaref, listValues[j], 
                    items[i].account_id_c, formatDateTo(new Date(), 'YYYY/MM/DD HH:mm:ss')
                  ],
                  (_, rows) => {},
                  (_, err) => {
                    //console.error(`ERROR en una de las sentencias de sincronizacion de ItemActType ${err}`)
                    throw new Error(`ERROR en una de las sentencias ${err}`)
                  })
              }
            }
          },
          err => {
            //console.error(`ERROR en la transaccion ${err}`)
            throw new Error(`ERROR en una de las transacción ${err}`)
          },
          () => {
            resolve(`${items.length} ListItems de tipo de actividades sincronizados`)
          }
        )
      } catch (err) {
        reject(err)
      }
    })
  }

  syncActivity(from){
    return new Promise(async (resolve, reject) => {
      try {
        var items = await this.getFromWS(
          this.url+AppConstans.WS_ACTIVITY_DOWNLOAD, 
          {usuario: this.username, FechaDesde: from, Otros: ''})
          .catch(err => {reject(err)})
        items = items.dataset;
        // console.log(`ACTIVITY: ${JSON.stringify(items)}`)
  
        global.DB.transaction(tx => {
            for(i=0; i<items.length; i++){
              tx.executeSql(
                ` insert or replace into Activity (uuid, contact_uuid, name, description, activityType_uuid, state, percent, priority, planned_date, exec_date, contact_id, activityType_id, updated) 
                  values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, (select c.id from Contact c where c.uuid = ?), (select a.id from ActivityType a where a.uuid = ?), ?);`,
                [ items[i].id_tarea, 
                  items[i].contact_id,
                  items[i].name,  
                  items[i].description, 
                  items[i].rel_actividades_id_c, 
                  items[i].status, 
                  0, 
                  items[i].priority, 
                  formatDateTo(this.fixDate(items[i].planificacion), 'YYYY/MM/DD HH:mm:ss'), 
                  formatDateTo(this.fixDate(items[i].ejecucion), 'YYYY/MM/DD HH:mm:ss'), 
                  items[i].contact_id,
                  items[i].rel_actividades_id_c,
                  '2000/01/01 00:00:01'
                ],
                (_, rows) => {},
                (_, err) => {
                  //console.error(`ERROR en una de las sentencias de sincronizacion de Activity ${err}`)
                  throw new Error(`ERROR en una de las sentencias ${err}`)
                })
            }
          },
          err => {
            //console.error(`ERROR en la transaccion ${err}`)
            throw new Error(`ERROR en una de las transacción ${err}`)
          },
          () => {
            resolve(`${items.length} actividades sincronizadas`)
          }
        )
      } catch (err) {
        reject(err)
      }     
    })
  }

  fixDate(dateString) {
    if (dateString == null)
      return null; 
    dateString = dateString.replace(/-/g, "/");
    return new Date(dateString).toString();
  }

  fixToTest() {
    return new Promise(function(resolve, reject) {
      global.DB.transaction(tx => {
        tx.executeSql(
          ` update activity set 
              contact_uuid = '9e52fc6e-6381-11e4-8658-94de807927f7', 
              contact_id = (select c.id from Contact c where c.uuid = '9e52fc6e-6381-11e4-8658-94de807927f7') 
            where uuid = '96a6b59c-ceab-c874-de26-5c74557258b9';
          `,
          [],
          (_, rows) => {},
          (_, err) => {}
        )
        /* tx.executeSql(
          ` update contact set 
              latitude = -31.639989, longitude = -60.7069067 
            where uuid = '9e52fc6e-6381-11e4-8658-94de807927f7';
          `,
          [],
          (_, rows) => {},
          (_, err) => {}
        ) */
        },
        err => {
          console.error(`ERROR en la transaccion de FixToTest${err}`)
          reject(`ERROR en una de las transacción ${err}`)
        },
        () => {
          resolve(`Actividades fixiadas`)
        }
      )
    })
  }

  async downloadAll(){
    this.state.modalMessagge = "Sincronizando...";
    try {
      /* El campo from debe ser String con formato YYYY-MM-DD */
      let from = formatDateTo(global.context.user.lastDownload, 'YYYY-MM-DD')
      if(from == null) throw new Error("Error obteniendo la fecha de última descarga.")
      await this.getParams();
      await this.syncContacts(from).then(msg => this.state.modalMessagge = msg + "\n");
      await this.syncActivityType(from);
      await this.syncItemActType(from);
      await this.syncListItemAct(from);
      await this.syncActivity(from).then(msg => this.state.modalMessagge += msg + "\n");
      
      // await this.fixToTest(); //BORRAR ESTA LINEA CUANDO EL WS FUNCIONE BIEN!!!!

      /* Actualizo la fecha de última descarga */
      let nld = formatDateTo(new Date(), 'YYYY/MM/DD HH:mm:ss');
      executeSQL('update user set lastSync = ?, lastDownload = ?', [nld, nld])
      global.context.user.lastSync = nld;
      global.context.user.lastDownload = nld;

    } catch(err) {
      this.state.modalMessagge = `Error durante la sincronización. Vuelva a intentar \n ${err}`;
    }
   
    this.setState({ modalMessagge: this.state.modalMessagge });
  }

  /************** UPLOAD DE RELEVAMIENTOS *******************/

  createObjectBody(table, item) {
    let obj = {};
    switch(table){
      case "Activity":
        let obj = {
          id_movil: this.encodeID(item.id),
          nombre: item.name,
          prioridad: item.priority,
          descripcion: item.description,
          fecha_ult_mod: item.updated,
          fecha_planificacion: item.planned_date,
          fecha_ejecucion: item.exec_date,
          estado_actividad: item.state,
          estado: 0,
          id_contacto: item.contact_uuid,
          id_actividad:item.activityType_uuid
        }
        return obj;
      case "Answer":

        // TODO: Hacer lo de sel_mult

        obj = {
          id_movil: this.encodeID(item.id),
          fecha_ult_mod: item.updated,
          latitud: item.latitude,
          longitud: item.longitude,
          caracter: item.type == "sel_simpl" ? item.text_val : null,
          texto: item.type == "sel_simpl" ? null : item.text_val,
          numero: item.number_val,
          url_imagen: null,
          id_contacto: item.contact_uuid,
          id_consigna: item.itemActType_uuid 
        }
        return obj;
      default:
        console.log("No debería haber default!");    
    }
    return obj;  
  }

  getSQLStatement(table) {
    switch(table){
      case "Activity":
        return `select * from Activity where updated > ?`;
      case "Answer":
        return `select a.*, t.type  
                from Answer a 
                inner join itemActType t on (t.id = a.itemActType_id) 
                where a.updated > ?`;
    }
  }

  getAPIUrl(table) {
    switch(table){
      case "Activity":
        return this.url + AppConstans.WS_ACTIVITY_UPLOAD;
      case "Answer":
        return this.url + AppConstans.WS_ANSWER_UPLOAD;
    }    
  }

  /*
    Esta manera de codificar los identificadores fué propuesta por I2T
  */
  encodeID(id) {
    return this.consultant_num * 1000000 + id;
  }

  decodeID(id) {
    return id - this.consultant_num * 1000000;
  }

  upload(table, from) {
    return new Promise(async (resolve, reject) => {
     
        await this.getParams()
          .catch(err => {
            return reject(err)
          });

        executeSQL(this.getSQLStatement(table), [from])
          .then(async (items) => {

            if(items.length == 0) {
              return resolve({total: 0, synchronized: 0})
            }

            let data = []
            for(i=0; i<items.length; i++){
              let obj = this.createObjectBody(table, items[i])
              data.push(obj)
            }

            let url = this.getAPIUrl(table);
            let uuids = await this.getFromWS(url, {json_in: JSON.stringify(data)});

            /*
              RCode con valor distinto de 1, significa que el WS falló
            */
            if(uuids.returnset[0].RCode != 1){
              return reject({total: items.length, synchronized: 0})
            }

            /*
              En el campo returnset[0].RTxt tiene que venir un String con los uuid separados por coma
            */
            if(uuids.returnset[0].RTxt != null && uuids.returnset[0].RTxt != ""){
              uuids = uuids.returnset[0].RTxt.split(", ");

              /*
                Si todo funciona bien, el tamaño de uuids debe ser el de la cantidad de registros
                insertados en el backend.
                Los registros actualizados no informan nada. MAL!!!!
              */
              global.DB.transaction(tx => {
                  //Lo hago -1 porque desde el WS me mandan algo que termina en coma y espacio
                  for(i=0; i<uuids.length -1; i++){ 
                    let id = Number(uuids[i].substring(0, uuids[i].indexOf(":")));
                    id = this.decodeID(id);

                    tx.executeSql(
                      ` update ${table} set uuid = ? where id = ?`,
                      [uuids[i], id],
                      (_, rows) => {},
                      (_, err) => {
                        throw new Error(`Fallo en una sentencia de la transacción. ${table} : ${id}`);
                      }
                    )
                  }
                },
                err => {
                  //console.error(`ERROR en la transaccion de uploadAll${err}`)
                  throw new Error(`ERROR en una de las transacción ${err}`)
                },
                () => {
                  resolve({total: items.length, synchronized: uuids.length})
                }
              )
            } else {
              resolve({total: items.length, synchronized: 0})
            }        
          })
          .catch(err => {
            reject(err)
          })
    })
  }

  async uploadAll(){
    this.state.modalMessagge = "Sincronizando...";
    
    try {
      let from = global.context.user.lastUpload;
      if(from == null) throw new Error("Error en la fecha de última subida de datos")

      await this.getParams()
      await this.upload("Activity", from)
        .then(msg => {
          this.state.modalMessagge = `Subidas ${msg.synchronized} actividades de ${msg.total}\n`;
        })
      await this.upload("Answer", from)
        .then(msg => {
          this.state.modalMessagge += `Subidas ${msg.synchronized} respuestas de ${msg.total}`;
        })
  
      /*
        Actualizo la fecha de última subida
      */
      let nld = formatDateTo(new Date(), 'YYYY/MM/DD HH:mm:ss');
      await executeSQL('update user set lastSync = ?, lastUpload = ?', [nld, nld])
      global.context.user.lastSync = nld;
      global.context.user.lastUpload = nld;

    } catch(err) {
      this.state.modalMessagge = `Error durante la sincronización. Vuelva a intentar. ${err}`;
    }

    this.setState({ modalMessagge: this.state.modalMessagge });
  }

  // setModalVisible(visible) {
  //   this.setState({modalVisible: visible});
  // }
  
  render() {
    const { navigation } = this.props;
    var lastSync = global.context.user.lastSync;

    return (
      <Container>
        <HeaderNavBar navigation={this.props.navigation}  title="Sincronización" />
        {/* <Modal animationType="slide" transparent={false} visible={this.state.modalVisible} 
          onRequestClose={() => {
            Alert.alert(this.state.modalMessagge);
          }}>
            <Text>{this.state.modalMessagge}</Text>
            <Button onPress={() => this.setModalVisible(false)}>
              <Text>Cerrar</Text>
            </Button>
        </Modal> */}
        <Content style={{padding: 10}}>
        <Grid style={{ alignItems: 'center' }}>
          <Row style={styles.row}>
            <Col style={{ alignItems: 'center' }}>
              <Button onPress={() => this.downloadAll()} block>
              <Icon active name="cloud-download" />
              <Text>Bajar Información</Text>
              </Button>
            </Col>
          </Row>
          <Row style={styles.row}>
            <Col style={{ alignItems: 'center' }}>
              <Button onPress={() => this.uploadAll()} block>
              <Icon active name="cloud-upload" />
              <Text>Subir Información</Text>
              </Button>
            </Col>
          </Row>
          <Row style={styles.row}>
            <Col style={{ alignItems: 'center' }}>
            <Text>Última sincronización: {formatDateTo(global.context.user.lastSync, 'YYYY-MM-DD HH:mm:ss')}</Text>
            </Col>
          </Row>
          <Row style={styles.row}>
            <Col style={{ alignItems: 'center' }}>
            <Text style={styles.textResult}>{this.state.modalMessagge}</Text>
            </Col>
          </Row>
        </Grid>
        </Content>
        <FooterNavBar navigation={this.props.navigation} />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 20, backgroundColor: '#fff' },
  head: { height: 40, backgroundColor: '#94A6B5' },
  text: { margin: 6 },
  row: { flexDirection: 'row', backgroundColor: '#FFF', height: 60 },
  rowResult: { flexDirection: 'row', backgroundColor: '#F08377', color: '#FFF', height: 60 },
  cellAction: { margin: 6, width: 100 },
  btn: { height: 28, backgroundColor: '#F08377',  borderRadius: 2, fontSize: 12, color: 'white'},
  btn_cont: { flexDirection: 'row'},
  btn_card: { flexDirection: 'row', justifyContent: 'space-around' },
  btnText: { textAlign: 'center', color: '#fff' },
  textResult: {fontSize: 16}
});