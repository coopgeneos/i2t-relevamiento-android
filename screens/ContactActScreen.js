import React from 'react';

import { Container, Header, Content, Footer, FooterTab, Text, Button, Spinner,
         Icon, Form, Item, Label, Input, Left, Title, Body, Right } from 'native-base';

import { StyleSheet, View, Alert, BackHandler} from 'react-native';
import { Table, TableWrapper, Row, Cell } from 'react-native-table-component';
import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';
import { formatDateTo, executeSQL } from '../utilities/utils';
import AppConstans from '../constants/constants';

export default class ContactActScreen extends React.Component {
  
  _didFocusSubscription;
  _willBlurSubscription;

  constructor(props) {
    super(props);

    this.contact = this.props.navigation.getParam('contact', '');

    this.state = { 
      data: '' 
    };

    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
      BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }

  componentDidMount() {
    this.getActivities();
    
    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
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
          this.state.data = rows._array;
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

  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
  }

  onBackButtonPressAndroid = () => {
    this.goBack()
    return true;
  };

  goBack(){
    this.props.navigation.state.params.onGoBack();
    this.props.navigation.goBack()
  }

  _alertIndex(index) {
    Alert.alert(`This is row ${index + 1}`);
  }

  refresh(){
    this.getActivities();
  }
   
  /*
   Por convención toda actividad se crea en:
    estado: 'Not Started'
    priority: 'Low'
  */
  createActivity(index){
    let activityType = this.state.data[index]
    let now = formatDateTo(new Date(), 'YYYY/MM/DD HH:mm:ss');
    global.DB.transaction(tx => {
      tx.executeSql(
        `INSERT INTO Activity (activityType_id, contact_id, description, priority, 
          planned_date, exec_date, state, notes, percent, updated) 
          values (?, ?, ?, ?, ?, ?, ?, '', 0, ?);`,
        [ activityType.id, 
          this.contact.id, 
          activityType.description, 
          AppConstans.ACTIVITY_PRIORITY_LOW, 
          now, 
          now,
          AppConstans.ACTIVITY_NEW,
          now
        ],
        (_, rows) => {
          let lastID = rows.insertId;
          this.goToSurvey(lastID);
        },
        (_, err) => {
          console.error(`ERROR consultando DB: ${err}`)
        }
      )
    });
  }

  goToSurvey(activity_id, activity_state, activity_desc){
    executeSQL('select * from activity where id = ?', [activity_id])
      .then(result => {
        this.props.navigation.navigate('Survey', {activity: result[0], contact: this.contact, onGoBack: () => this.refresh()})
      })
      .catch(err => {
        console.error(err)
      })
  }

  render() {
    let table;

    const state = this.state;

    const element = (data, index) => (
        <View style={styles.btn_cont}>
          <Button style={styles.btn} onPress={() => this.createActivity(index)}>
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

          <Form>
          <Item stackedLabel>
            <Label>Contacto</Label>
            <Input
              value={this.contact.name}
              disabled
              style={{ width: '100%' }}
            />
            <Label>Dirección</Label>
            <Input
              value={ this.contact.address + ' - ' + this.contact.city }
              disabled
              style={{ width: '100%' }}
            />
          </Item>
          </Form>

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