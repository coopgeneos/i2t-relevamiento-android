import React from 'react';

import { Container, Header, Content, Footer, FooterTab, Text, Button, Spinner,
         Icon, Form, Item, Label, Input, Left, Title, Body, Right, Card, CardItem} from 'native-base';

import { StyleSheet, View, TouchableOpacity, Alert, ListView, ScrollView} from 'react-native';

import { Table, TableWrapper, Row, Cell } from 'react-native-table-component';

import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';

export default class ActivitiesScreen extends React.Component {
  constructor(props) {
    super(props);
     
    /*const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });*/

    this.state = {
      dataSource: [],
      tableHead: ['Actividad', 'Fecha', ''],
    };
  }

  componentDidMount() {
    var event = this.props.navigation.getParam('event_id', null);
    global.DB.transaction(tx => {
      tx.executeSql(
        ` select a.id as activity_id, actt.id as actType_id, actt.description, s.planned_date
          from Activity a 
          inner join ActivityType actt on (actt.id = a.activityType_id) 
          inner join Schedule s on (s.id = a.schedule_id) 
          where a.schedule_id = ?`,
        [event],
        (_, { rows }) => {
          var resp = rows._array;
          var data = []
          resp.forEach(item => {
            var aux = [item.description, item.planned_date, 'A'];
            data.push(aux)
          })
          this.setState ({
            dataSource: resp,
            tableData: data
          });
        },
        (_, err) => {
          console.error(`ERROR consultando DB: ${err}`)
        }
      )
    });
  }
  
  render() {
    let table;
    const state = this.state;

    //En esta vista es necesario que las props recibidas sean parte del state
    const { navigation } = this.props;
    const contact = navigation.getParam('agency', 'SIN CONTACTO');
    const address = navigation.getParam('address', 'SIN DOMICILIO');
    const city = navigation.getParam('city', 'SIN CONTACTO');

    const element = (data, index) => (
      <TouchableOpacity onPress={() => this._alertIndex(index)}>
        <View style={styles.btn_cont}>
            <Button transparent onPress={() => this.props.navigation.navigate('Activity',{contact: 'JUAN', address: 'ALBERDI', detail: 'MAS O MENOS'})}>
            <Icon name='edit'/>
            </Button>
            <Button transparent>
            <Icon name='battery-2'/>
            </Button>
        </View>
      </TouchableOpacity>
    );

    if(!this.state.tableData){
      table = <Spinner color='blue'/>
    } else {
      table = <View style={styles.container}>
                <Table borderStyle={{borderColor: 'transparent'}}>
                  <Row data={state.tableHead} style={styles.head} textStyle={styles.text_head} />
                  {
                    state.tableData.map((rowData, index) => (
                      <TableWrapper key={index} style={styles.row}>
                        {
                          rowData.map((cellData, cellIndex) => (
                            <Cell key={cellIndex} 
                              data={cellIndex === 2 ? element(cellData, index) : cellData} 
                              textStyle={cellIndex === 2 ? styles.text_head : styles.text}
                              onPress={() => 
                                this.props.navigation.navigate('Survey', 
                                  {
                                    agency: contact,
                                    address: address,
                                    city: city,
                                    detail: cellData,
                                    acttype_id: this.state.dataSource[index].actType_id,
                                    activity_id: this.state.dataSource[index].activity_id
                                  })
                              }
                            />
                          ))
                        }
                      </TableWrapper>
                    ))
                  }
                </Table>
              </View>
    }

    return (
      <Container>
        <HeaderNavBar navigation={this.props.navigation}  title="Actividades" />
        <Content>
          
          <Card>
            <CardItem header>                        
            <Text>Datos de Contacto</Text>
            </CardItem>

            <CardItem>                        
            <Label style={{ width: 80 }}>Contacto</Label><Text>{contact}</Text>
            </CardItem>
            <CardItem>                        
            <Label style={{ width: 80 }}>Domicilio</Label><Text>{address}</Text>
            </CardItem>
            <CardItem>                        
            <Label style={{ width: 80 }}>Ciudad</Label><Text>{city}</Text>
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
  text: { margin: 6, fontSize: 12},
  text_head: { margin: 6, fontSize: 16, color: '#FFF',  fontSize: 18},
  row: { flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#778591', height: 40 },
  btn: { width: 58, height: 25, backgroundColor: '#F08377',  borderRadius: 2 },
  btn_cont: { flexDirection: 'row' },
  btnText: { textAlign: 'center', color: '#fff' }
});