import React from 'react';

import { Container, Header, Content, Footer, FooterTab, Text, Button, Spinner,
         Icon, Form, Item, Label, Input, Left, Title, Body, Right, Card, CardItem} from 'native-base';

import { StyleSheet, View, Alert} from 'react-native';
import { Table, TableWrapper, Row, Cell } from 'react-native-table-component';
import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';
import {formatDate} from '../utilities/utils';

export default class ContactActScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = { index_id: '' };
  }

  componentDidMount() {
    this.getActivities();   
  }


  getActivities(){
    global.DB.transaction(tx => {
      tx.executeSql(
        ` select ate.id, ate.description
          from ActivityType ate ;`,
        [],
        (_, { rows }) => {
          var tableHead = ['Actividad', ''];
          var tableData = [];
          rows._array.forEach(item => {
            tableData.push([item.description, item.id ])
          })
          this.setState ({
            tableHead: tableHead,
            tableData: tableData
          });
        },
        (_, err) => {
          console.error(`ERROR consultando DB: ${err}`)
        }
      )
    });
  }


  _alertIndex(index) {
    Alert.alert(`This is row ${index + 1}`);
  }

  refresh(){
    this.getActivities();
  }

    
  createSchedule(user_id, contact_id, activityType_id, latitude, longitude){   
    let fecha = formatDate(new Date());
    global.DB.transaction(tx => {
      tx.executeSql(
        `INSERT INTO Schedule(user_id, contact_id, type, priority, planned_date, 
          observations, state, exec_date, latitude, longitude)
          values (?, ?,'Comun', 1, ?, '', 'Sin visitar', ?, ?, ?);`,
        [user_id, contact_id, fecha, fecha, latitude, longitude],
        (_, rows) => {
          let lastID = rows.insertId;
          this.createActivity(lastID, contact_id, activityType_id); 
        },
        (_, err) => {
          console.error(`ERROR consultando DB: ${err}`)
        }
      )
    });     
  }

  
  createActivity(schedule_id, contact_id, activityType_id){
    global.DB.transaction(tx => {
      tx.executeSql(
        `INSERT INTO Activity (schedule_id, contact_id, activityType_id, state, percent) 
          values (?, ?, ?, 'new', 0.0);`,
        [schedule_id, contact_id, activityType_id],
        (_, rows) => {
          let lastID = rows.insertId;
          this.Activity_get_lastID(lastID);
        },
        (_, err) => {
          console.error(`ERROR consultando DB: ${err}`)
        }
      )
    });     
  }

  Activity_get_lastID(activity_lastId){
    let activity = {
      'id': activity_lastId,
      'description': this.state.tableData[this.state.index_id][0],
    };

    this.props.navigation.navigate('Survey',
        {activity: activity, onGoBack: () => this.refresh()})
  }
   
  
  go_Survey(data, index){
    this.setState({index_id: index});
    let user_id = global.context.contact.user_id;
    let contact_id = global.context.contact.id;
    let latitude = global.context.contact.latitude;
    let longitude = global.context.contact.longitude;
    this.createSchedule(user_id, contact_id, data, latitude, longitude);
  }

  render() {
    let table;

    const state = this.state;

    const element = (data, index) => (
        <View style={styles.btn_cont}>
          <Button style={styles.btn} onPress={() => this.go_Survey(data, index)}>
            <Text>Iniciar</Text>
          </Button>
        </View>
    );

    


    if(!this.state.tableData){
      table = <Spinner/>
    } else {
      if(this.state.tableData.length > 0){
        table = <View style={styles.container}>
                  <Table borderStyle={{borderColor: 'transparent'}}>
                    <Row data={state.tableHead} style={styles.head} textStyle={styles.text_head}/>
                    {
                      state.tableData.map((rowData, index) => (
                        <TableWrapper key={index} style={styles.row}>
                          {
                            rowData.map((cellData, cellIndex) => (
                              <Cell key={cellIndex} data={cellIndex === 1 ? element(cellData, index) : cellData} textStyle={styles.text}/>
                            ))
                          }
                        </TableWrapper>
                      ))
                    }
                  </Table>
                </View>
      } else {
        table = <Text>No hay actividades para agregar</Text>
      }     
    }

    return (
      <Container>
        <HeaderNavBar navigation={this.props.navigation} title="Actividades Disponibles" />
        <Content>
          
          <Card>
            <CardItem header>                        
            <Text>Datos de Contacto</Text>
            </CardItem>

            <CardItem>                        
            <Label style={{ width: 80 }}>Contacto</Label><Text>{global.context.contact.name}</Text>
            </CardItem>
            <CardItem>                        
            <Label style={{ width: 80 }}>Domicilio</Label><Text>{global.context.contact.address}</Text>
            </CardItem>
            <CardItem>                        
            <Label style={{ width: 80 }}>Ciudad</Label><Text>{global.context.contact.city}</Text>
            </CardItem>

            <CardItem footer>                        
            <Text></Text>
            </CardItem>
          </Card>

          {table}

        </Content>
        <FooterNavBar navigation={this.props.navigation} />
      </Container>
    );
  }  
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 20, backgroundColor: '#fff' },
  head: { height: 40, backgroundColor: '#778591' },
  text: { margin: 6, fontSize: 14},
  text_head: { margin: 6, color: '#FFF',  fontSize: 18},
  row: { flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#778591', height: 40 },
  btn: { height: 22, backgroundColor: '#F08377',  borderRadius: 2, fontSize: 12},
  btn_cont: { flexDirection: 'row'},
  btnText: { textAlign: 'center', color: '#fff'}
});