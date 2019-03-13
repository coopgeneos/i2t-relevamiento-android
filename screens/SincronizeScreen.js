import React from 'react';
//import { Button } from 'react-native-elements';
import { Container, Header, Content, Footer, FooterTab, Text, 
  Button, Icon, CheckBox, List, ListItem, Form, Item, Label,
  Input, Spinner, Body, Left, Title, Right, Thumbnail } from 'native-base';
import { getConfiguration, formatDate, executeSQL } from '../utilities/utils'

import { StyleSheet, Image, View, TouchableOpacity, Alert, ListView, ScrollView} from 'react-native';

import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';

/* 
EQUIVALENCIAS:
LOCAL           WS
̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ ̄ 
Contact         Contactos (api/proc/ExtraeContactos )
Activity        Tareas (api/proc/ExtraeTareas)
ActivityType    Actividades (api/proc/ExtraeActividades)
ItemActType     Consigna (api/proc/ExtraeConsignas)
Answer          Referencias (api/proc/ExtraeReferencias)
*/

export default class SincronizeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.url = null;
    this.username = null;
    this.password = null;
    this.state = {
      
    };
  }

  async getParams(){
    this.url = this.url == null ? await getConfiguration('URL_BACKEND') : this.url;
    this.username = this.username == null ? await getConfiguration('USER_BACKEND') : this.username;
    this.password = this.password == null ? await getConfiguration('PASS_BACKEND') : this.password;
  }

  async getToken() {
    if(this.state.token){
      return this.state.token;
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
      return this.state.token;
    } catch (error) {
      console.error(error);
    }
  }

  /*async getContactsFromWS(from, others){
    from = formatDate(from);
    from = new Date(from)//'2019-01-01 18:23:48'
    from = ''
    console.log(from)
    await this.getParams();
    var tk = await this.getToken();
    try {
      let response = await fetch(`${this.url}api/proc/ExtraeContactos`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': tk,
        },
        body: JSON.stringify({ usuario: this.username, FechaDesde: from, Otros: others}),
      });      
      let responseJson = await response.json();
      console.log(JSON.stringify(responseJson.dataset))
      return responseJson.dataset;
    } catch (error) {
      console.error(error);
    }
  }*/

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
      `${this.url}api/proc/ExtraeContactos`, 
      {usuario: this.username, FechaDesde: from, Otros: ''});

    console.log(ctsws);

    return new Promise(function(resolve, reject) {         
      global.DB.transaction(tx => {
        for(i=0; i<ctsws.length; i++){
         tx.executeSql(
            ` insert or replace into Contact(user_id, id, name, address, city, zipCode, phone, email, latitude, longitude)  
              values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [global.context.user.id, ctsws[i].id_contacto, ctsws[i].nombre, ctsws[i].primary_address_street, 
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
      `${this.url}api/proc/ExtraeActividades`, 
      {usuario: this.username, FechaDesde: from, Otros: ''});
    
    //console.log(acts);
      
    return new Promise(function(resolve, reject) {
      global.DB.transaction(tx => {
        for(i=0; i<acts.length; i++){
          tx.executeSql(
            ` insert or replace into ActivityType (id, description) values (?, ?)`,
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
      `${this.url}api/proc/ExtraeConsignas`, 
      {usuario: this.username, FechaDesde: from, Otros: ''});

    //console.log(items);

    return new Promise(function(resolve, reject) {
      global.DB.transaction(tx => {
          for(i=0; i<items.length; i++){
            tx.executeSql(
              ` insert or replace into ItemActType (id, activityType_id, description, type, required) 
                values (?, ?, ?, ?, ?);`,
              [items[i].id_consigna, items[i].id_actividad, items[i].name, items[i].con_tipodato, items[i].con_requerido],
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

  async syncActivity(from){
    await this.getParams();
    var items = await this.getFromWS(
      `${this.url}api/proc/ExtraeTareas`, 
      {usuario: this.username, FechaDesde: from, Otros: ''});

    //console.log(items);
    
    return new Promise(function(resolve, reject) {
      global.DB.transaction(tx => {
          for(i=0; i<items.length; i++){
            tx.executeSql(
              ` insert or replace into Activity (id, contact_id, description, activityType_id, state, percent, priority, planned_date, exec_date) 
                values (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
              [items[i].id_tarea, items[i].contact_id, items[i].description, items[i].rel_actividades_id_c, items[i].status, 0, items[i].priority, items[i].planificacion, items[i].ejecucion],
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

  /*async syncSchedule(from){
    return new Promise(function(resolve, reject) {
      global.DB.transaction(tx => {
          tx.executeSql(
            ` INSERT INTO Schedule(user_id, contact_id, type, priority, planned_date, 
              observations, state, exec_date, latitude, longitude)
              values (1, '5884a484-cdbf-a730-d2b9-5c74536f09e3' ,'Comun', 1, '2019/03/06', '', 'Sin visitar', '2019/03/10', -37.353535, -59.125458);`,
            [],
            (_, rows) => {},
            (_, err) => {
              console.error(`ERROR en una de las sentencias de sincronizacion de Schedule ${err}`)
              reject(`ERROR en una de las sentencias ${err}`)
            })
        },
        err => {
          console.error(`ERROR en la transaccion ${err}`)
          reject(`ERROR en una de las transacción ${err}`)
        },
        () => {
          resolve('Agenda sincronizada')
        }
      )
    })
  }*/

  async syncAll(){
    var from = global.context.user.lastSync;
    from = '';
    try {
      await this.syncContacts(from).then(msg => console.log(msg));
      await this.syncActivityType(from).then(msg => console.log(msg));
      await this.syncItemActType(from).then(msg => console.log(msg));
      //await this.syncSchedule(from).then(msg => console.log(msg));
      await this.syncActivity(from).then(msg => console.log(msg));
    } catch(err) {
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
  }
  
  render() {
    const { navigation } = this.props;
    var lastSync = global.context.user.lastSync;
    let tk = this.state.token ? <Text>{this.state.token}</Text> : <Text>Sin token</Text>
    return (
      <Container>
        <HeaderNavBar navigation={this.props.navigation}  title="Sincronización" />
        <Content>
          <Button onPress={() => this.syncAll()}>
            <Text>Sincronizar</Text>
          </Button>
          
          {tk}
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