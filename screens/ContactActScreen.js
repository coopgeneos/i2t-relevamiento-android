import React from 'react';

import { Container, Header, Content, Footer, FooterTab, Text, Button, Spinner,
         Icon, Form, Item, Label, Input, Left, Title, Body, Right } from 'native-base';

import { StyleSheet, View, Alert, BackHandler} from 'react-native';
import { Table, TableWrapper, Row, Cell } from 'react-native-table-component';
import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';
import {formatDate} from '../utilities/utils';

export default class ContactActScreen extends React.Component {
  
  _didFocusSubscription;
  _willBlurSubscription;

  

  constructor(props) {
    super(props);

    this.contact = this.props.navigation.getParam('contact', '');

    console.log(this.contact);

    this.state = { index_id: '' };

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

    
  // Ver los valores de priority se toma conveción que por ser creada a mano es prioridad baja (Low).

  createActivity(activityType_id, description){
    console.log('activityType_id: ' + activityType_id);
    let fecha = formatDate(new Date());
    let user_id = 1;
    console.log('Info de insert: ' + activityType_id + ' ' + 
    this.contact.id + '-' + user_id  + '-' +  description  + '-' +  fecha  + '-' +  fecha);
    global.DB.transaction(tx => {
      tx.executeSql(
        `INSERT INTO Activity (activityType_id, contact_id, user_id, description, priority, 
          planned_date, exec_date, state, cancellation, notes, percent) 
          values (?, ?, ?, ?, 'Low', ?, ?, 'new', '0', '', 0);`,
        [activityType_id, this.contact.id, user_id, description, fecha, fecha],
        (_, rows) => {
          let lastID = rows.insertId;
          this.goToActivity(lastID, 'new', description);
        },
        (_, err) => {
          console.error(`ERROR consultando DB: ${err}`)
        }
      )
    });
  }


  goToActivity(activity_id, activity_state, activity_desc){
    console.log('activity_id: ' + activity_id);
    this.props.navigation.navigate('Survey', {activity_id: activity_id, activity_state: activity_state, 
      activity_desc: activity_desc, contact_name: this.contact.name, contact_dir: this.contact.dir, 
      contact_city: this.contact.city, onGoBack: () => this.refresh()})

  }
   
  
  go_Survey(index){
    let ind = index - 1;
    this.setState({index_id: index});
    console.log('data index ' + this.state.tableData + ' index ' + ind);
    this.createActivity(this.state.tableData[ind][1], this.state.tableData[ind][0]);
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