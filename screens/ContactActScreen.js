import React from 'react';

import { Container, Header, Content, Footer, FooterTab, Text, Button, Spinner,
         Icon, Form, Item, Label, Input, Left, Title, Body, Right, Card, CardItem} from 'native-base';

import { StyleSheet, View, TouchableOpacity, Alert, ListView, ScrollView} from 'react-native';

import { Table, TableWrapper, Row, Cell } from 'react-native-table-component';

import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';

export default class ContactActScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.getActivities();   
  }


  getActivities(){
    global.DB.transaction(tx => {
      tx.executeSql(
        ` select a.id as activity_id, a.contact_id, ate.description, 
          case a.state when 'close' then 'CERRADA' when 'new' then 'ABIERTA' else '' end as estado
          from Activity a
          left join ActivityType ate on (ate.id = a.activityType_id)
          where a.contact_id = ?;`,
        [global.context.contact.id],
        (_, { rows }) => {
          var tableHead = ['Actividad', 'Estado', ''];
          var tableData = [];
          rows._array.forEach(item => {
            tableData.push([item.description, item.estado, item.activity_id ])
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

  go_Survey(index){
    var activity = {
      'id': this.state.tableData[index][2],
      'description': this.state.tableData[index][0],
    };
  
    this.props.navigation.navigate('Survey',
        {activity: activity, onGoBack: () => this.refresh()})
    
  }

  render() {
    let table;

    const state = this.state;

    const element = (data, index) => (
        <View style={styles.btn_cont}>
          <Button style={styles.btn} onPress={() => this.go_Survey(index)}>
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
                              <Cell key={cellIndex} data={cellIndex === 2 ? element(cellData, index) : cellData} textStyle={styles.text}/>
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