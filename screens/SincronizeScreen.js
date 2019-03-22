import React from 'react';
//import { Button } from 'react-native-elements';
import { Container, Header, Content, Footer, FooterTab, Text, 
  Button, Icon, CheckBox, List, ListItem, Form, Item, Label,
  Input, Spinner, Body, Left, Title, Right, Thumbnail } from 'native-base';
import { getConfiguration, formatDate, executeSQL } from '../utilities/utils'

import { StyleSheet, Image, View, TouchableOpacity, Alert, ListView, ScrollView, Modal} from 'react-native';

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

const contactURL = 'api/proc/ExtraeContactos', 
  activityURL = 'api/proc/ExtraeTareas',
  activityTypeURL = 'api/proc/ExtraeActividades',
  itemActTypeURL = 'api/proc/ExtraeConsignas',
  listItemActURL = 'api/proc/ExtraeReferencias';
export default class SincronizeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.url = null;
    this.username = null;
    this.password = null;
    this.state = {
      modalVisible: false,
      modalMessagge: ""
    };
  }

  async getParams(){
    this.url = this.url == null ? await getConfiguration('URL_BACKEND') : this.url;
    this.username = this.username == null ? await getConfiguration('USER_BACKEND') : this.username;
    this.password = this.password == null ? await getConfiguration('PASS_BACKEND') : this.password;
  }

  async getToken() {
    return new Promise(async (resolve, reject) => {
      if(this.state.token){
        resolve(this.state.token);
      }
      await this.getParams();
      try {
        let response = await fetch(`${this.url}login/`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ usuario: this.username, pass: this.password}),
        });      
        let responseJson = await response.json();
        //this.token = responseJson.dataset[0].jwt;
        this.setState({token: responseJson.dataset[0].jwt});
        resolve(this.state.token);
      } catch (error) {
        console.error(error);
        reject(`ERROR retrieve token: ${error}`)
      }
    }) 
  }

  async getFromWS(url, body){
    var token = await this.getToken();
    try {
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
      return responseJson.dataset;
    } catch (error) {
      console.error(error);
    }
  }

  async syncContacts(from){
    await this.getParams();
    var ctsws = await this.getFromWS(
      this.url+contactURL, 
      {usuario: this.username, FechaDesde: from, Otros: ''});

    //console.log(ctsws);

    return new Promise(function(resolve, reject) {         
      global.DB.transaction(tx => {
        for(i=0; i<ctsws.length; i++){
         tx.executeSql(
            ` insert or replace into Contact(uuid, user_id, name, address, city, zipCode, phone, email, latitude, longitude)  
              values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [ctsws[i].id_contacto, global.context.user.id, ctsws[i].nombre, ctsws[i].primary_address_street, 
            ctsws[i].primary_address_city, ctsws[i].primary_address_postalcode, ctsws[i].phone_mobile, 
            ctsws[i].email_c, ctsws[i].jjwg_maps_lat_c, ctsws[i].jjwg_maps_lng_c],
            (_, rows) => {},
            (_, err) => {
            console.error(`ERROR en una de las sentencias de sincronizacion de contactos ${err}`)
            reject(`ERROR en una de las sentencias ${err}`)
          })
        }
        },
        err => {
          console.error(`ERROR en la transaccion ${err}`)
          reject(`ERROR en una de las transacción ${err}`)
        },
        () => {
          resolve(`${ctsws.length} contactos sincronizados`)
        }
      )
    })
  }

  async syncActivityType(from){
    await this.getParams();
    var acts = await this.getFromWS(
      this.url+activityTypeURL, 
      {usuario: this.username, FechaDesde: from, Otros: ''});
    
    //console.log(acts);
      
    return new Promise(function(resolve, reject) {
      global.DB.transaction(tx => {
        for(i=0; i<acts.length; i++){
          tx.executeSql(
            ` insert or replace into ActivityType (uuid, description) values (?, ?)`,
            [acts[i].id_actividad, acts[i].name],
            (_, rows) => {},
            (_, err) => {
            console.error(`ERROR en una de las sentencias de sincronizacion de ActivityType ${err}`)
            reject(`ERROR en una de las sentencias ${err}`)
          })
        }
        },
        err => {
          console.error(`ERROR en la transaccion ${err}`)
          reject(`ERROR en una de las transacción ${err}`)
        },
        () => {
          resolve(`${acts.length} tipo de actividades sincronizadas`)
        }
      )
    })
  }

  async syncItemActType(from){
    await this.getParams();
    var items = await this.getFromWS(
      this.url+itemActTypeURL, 
      {usuario: this.username, FechaDesde: from, Otros: ''});

    //console.log(items);

    return new Promise(function(resolve, reject) {
      global.DB.transaction(tx => {
          for(i=0; i<items.length; i++){
            tx.executeSql(
              ` insert or replace into ItemActType (uuid, activityType_uuid, description, type, required, reference) 
                values (?, ?, ?, ?, ?, ?);`,
              [ items[i].id_consigna, 
                items[i].id_actividad, 
                items[i].name, 
                items[i].con_tipodato == 'rel_simple' ? 'lista' : items[i].con_tipodato, 
                items[i].con_requerido,
                items[i].con_tablaref
              ],
              (_, rows) => {},
              (_, err) => {
                console.error(`ERROR en una de las sentencias de sincronizacion de ItemActType ${err}`)
                reject(`ERROR en una de las sentencias ${err}`)
              })
          }
        },
        err => {
          console.error(`ERROR en la transaccion ${err}`)
          reject(`ERROR en una de las transacción ${err}`)
        },
        () => {
          resolve(`${items.length} item de tipo de actividades sincronizadas`)
        }
      )
    })
  }

  async syncListItemAct(from){
    await this.getParams();
    var items = await this.getFromWS(
      this.url+listItemActURL, 
      {usuario: this.username, FechaDesde: from, Otros: ''});

    //console.log(items);

    return new Promise(function(resolve, reject) {
      global.DB.transaction(tx => {
          for(i=0; i<items.length; i++){
            let listValues = items[i].ref_valor.split(",");
            for(j=0; j<listValues.length; j++) {
              tx.executeSql(
                ` insert or replace into ListItemAct (uuid, reference, value)  
                  values (?, ?, ?);`,
                [items[i].id_referencias, items[i].ref_tablaref, listValues[j]],
                (_, rows) => {},
                (_, err) => {
                  console.error(`ERROR en una de las sentencias de sincronizacion de ItemActType ${err}`)
                  reject(`ERROR en una de las sentencias ${err}`)
                })
            }
          }
        },
        err => {
          console.error(`ERROR en la transaccion ${err}`)
          reject(`ERROR en una de las transacción ${err}`)
        },
        () => {
          resolve(`${items.length} ListItems de tipo de actividades sincronizados`)
        }
      )
    })
  }

  async syncActivity(from){
    await this.getParams();
    var items = await this.getFromWS(
      this.url+activityURL, 
      {usuario: this.username, FechaDesde: from, Otros: ''});

    //console.log(items);
    
    return new Promise(function(resolve, reject) {
      global.DB.transaction(tx => {
          for(i=0; i<items.length; i++){
            tx.executeSql(
              ` insert or replace into Activity (uuid, contact_uuid, description, activityType_uuid, state, percent, priority, planned_date, exec_date, contact_id, activityType_id) 
                values (?, ?, ?, ?, ?, ?, ?, ?, ?, (select c.id from Contact c where c.uuid = ?), (select a.id from ActivityType a where a.uuid = ?));`,
              [ items[i].id_tarea, 
                items[i].contact_id, 
                items[i].description, 
                items[i].rel_actividades_id_c, 
                items[i].status, 
                0, 
                items[i].priority, 
                items[i].planificacion, 
                items[i].ejecucion,
                items[i].contact_id,
                items[i].rel_actividades_id_c
              ],
              (_, rows) => {},
              (_, err) => {
                console.error(`ERROR en una de las sentencias de sincronizacion de Activity ${err}`)
                reject(`ERROR en una de las sentencias ${err}`)
              })
          }
        },
        err => {
          console.error(`ERROR en la transaccion ${err}`)
          reject(`ERROR en una de las transacción ${err}`)
        },
        () => {
          resolve(`${items.length} actividades sincronizadas`)
        }
      )
    })
  }

  async fixToTest() {
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
          (_, err) => {
            console.error(`ERROR FIXIANDO...`)
            reject(`ERROR en una de las sentencias ${err}`)
          })
        },
        err => {
          console.error(`ERROR en la transaccion ${err}`)
          reject(`ERROR en una de las transacción ${err}`)
        },
        () => {
          resolve(`Actividades fixiadas`)
        }
      )
    })
  }

  showDB () {
    let tables = ["Contact", "Activity", "ActivityType"];
    tables.forEach(async table => {
      let data = await executeSQL(`select * from ${table}`)
        .catch(err => {
          console.log(err)
        })
      console.log(`============================================`)
      console.log(`${table}`)
      console.log(data)
    })
  }

  async syncAll(){
    this.state.modalMessagge = "Sincronizando...";
    this.setModalVisible(true);
    /* El campo from debe ser String con formato yyyy-MM-dd */
    var from = global.context.user.lastSync;
    from = from.replace(/\//g, "-");
    try {
      await this.syncContacts(from).then(msg => this.state.modalMessagge = msg + "\n");
      await this.syncActivityType(from).then(msg => this.state.modalMessagge += msg + "\n");
      await this.syncItemActType(from).then(msg => this.state.modalMessagge += msg + "\n");
      await this.syncListItemAct(from).then(msg => this.state.modalMessagge += msg + "\n");
      await this.syncActivity(from).then(msg => this.state.modalMessagge += msg + "\n");
      await this.fixToTest(); //BORRAR ESTA LINEA CUANDO EL WS FUNCIONE BIEN!!!!
    } catch(err) {
      this.state.modalMessagge = "Error durante la sincronización. Vuelva a intentar";
      console.error(error);
    }

    let nld = formatDate(new Date());
    executeSQL(
      'update user set lastSync = ?',
      [nld]
      ).catch(err => {
        console.error(err);
      })
    global.context.user.lastSync = nld;
    this.setState({ modalMessagge: this.state.modalMessagge });
    
    this.showDB ()
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }
  
  render() {
    const { navigation } = this.props;
    var lastSync = global.context.user.lastSync;

    return (
      <Container>
        <HeaderNavBar navigation={this.props.navigation}  title="Sincronización" />
        <Content>
          <Modal animationType="slide" transparent={false} visible={this.state.modalVisible} 
            onRequestClose={() => {
              Alert.alert(this.state.modalMessagge);
            }}>
              <Text>{this.state.modalMessagge}</Text>
              <Button onPress={() => this.setModalVisible(false)}>
                <Text>Cerrar</Text>
              </Button>
          </Modal>
          <Button onPress={() => this.syncAll()}>
            <Text>Sincronizar</Text>
          </Button>
          <Text>Última sincronización: {global.context.user.lastSync}</Text>
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
  row: { flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#94A6B5', height: 40 },
  cellAction: { margin: 6, width: 100 },
  btn: { height: 28, backgroundColor: '#F08377',  borderRadius: 2, fontSize: 12, color: 'white'},
  btn_cont: { flexDirection: 'row'},
  btn_card: { flexDirection: 'row', justifyContent: 'space-around' },
  btnText: { textAlign: 'center', color: '#fff' }
});