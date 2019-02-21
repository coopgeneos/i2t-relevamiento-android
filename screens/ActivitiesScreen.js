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
    this.state = {
      dataSource: [],
      tableHead: ['Actividad', 'Fecha', ''],
    };
  }

  componentDidMount() {
    this.getActivities()
  }

  getActivities() {
    global.DB.transaction(tx => {
      tx.executeSql(
        ` select a.*, actt.description, s.planned_date
          from Activity a 
          inner join ActivityType actt on (actt.id = a.activityType_id) 
          inner join Schedule s on (s.id = a.schedule_id) 
          where a.schedule_id = ?`,
        [global.context.event_id],
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

  getIconBattery(index){
    var percent = this.state.dataSource[index].percent;
    if(percent == 0.0) return 'battery-0';
    if(percent <= 0.25) return 'battery-1';
    if(percent <= 0.5) return 'battery-2';
    if(percent <= 0.75) return 'battery-3';
    if(percent <= 1) return 'battery-4';
  }

  refresh() {
    this.getActivities();
  }

  goToSurvey(activity){
    if(activity.state != 'canceled')
      this.props.navigation.navigate('Survey', 
        {activity: activity, onGoBack: () => this.refresh()})
  }
  
  render() {
    let table;
    const state = this.state;

    const element = (data, index) => {
      if(this.state.dataSource[index].state != 'canceled') {
        return (
          <TouchableOpacity onPress={() => this._alertIndex(index)}>
            <View style={styles.btn_cont}>
              <Button transparent onPress={() => this.props.navigation.navigate('Activity',{activity: this.state.dataSource[index], onGoBack: () => this.refresh()})}>
                <Icon name='edit'/>
              </Button>
              <Button transparent>
                <Icon name={this.getIconBattery(index)}/>
              </Button>
            </View>
          </TouchableOpacity>
        )
      } else {
        return (
          <View style={styles.btn_cont}>
            <Button transparent>
              <Icon name='times-circle'/>
            </Button>
            <Button transparent onPress={() => this.props.navigation.navigate('Activity',{activity: this.state.dataSource[index], onGoBack: () => this.refresh()})}>
            <Icon name='search'/>
            </Button>
          </View>
        )
      }     
    };

    if(!this.state.tableData){
      table = <Spinner/>
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
                              onPress={() => this.goToSurvey(this.state.dataSource[index])}
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
  text: { margin: 6, fontSize: 12},
  text_head: { margin: 6, color: '#FFF',  fontSize: 18},
  row: { flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#778591', height: 40 },
  btn: { width: 58, height: 25, backgroundColor: '#F08377',  borderRadius: 2 },
  btn_cont: { flexDirection: 'row' },
  btnText: { textAlign: 'center', color: '#fff' }
});