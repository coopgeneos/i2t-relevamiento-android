import React from 'react';
import { Container, Header, Content, Footer, FooterTab, Text, Button, Spinner,
         Icon, Form, Item, Label, Input, Left, Title, Body, Right } from 'native-base';
import { StyleSheet, View, TouchableOpacity, Alert, BackHandler, ToastAndroid} from 'react-native';
import { Table, TableWrapper, Row, Cell } from 'react-native-table-component';

import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';

export default class ActivitiesScreen extends React.Component {
  constructor(props) {
    super(props);

    this.contact_id = this.props.navigation.getParam('contact_id', 'SIN ACTIVIDAD');
    this.contact_name = this.props.navigation.getParam('contact_name', 'NN');
    this.contact_dir = this.props.navigation.getParam('contact_dir', 'NN');
    this.contact_city = this.props.navigation.getParam('contact_city', 'NN');

    console.info(this.contact_id);

    this.state = {
      dataSource: [],
      tableHead: ['Actividad', 'Fecha', ''],
      visible_button: true,
    };

    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
      BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }

  componentDidMount() {
    this.getActivities()
  }

  getActivities() {
    // Ver como tomo la referencia a limite de tiempo hacia adelante como parámetro de esta consulta.
    // Actividades nuevas / en proceso que den en el margen de tiempo del parametro dias hacia adelante
    global.DB.transaction(tx => {
      tx.executeSql(
        ` select a.*, actt.description 
          from Activity a 
          inner join ActivityType actt on (actt.id = a.activityType_id) 
          where a.contact_id = ? and a.state != 'close' and a.state != 'canceled'`,
        [this.contact_id],
        (_, { rows }) => {
          var resp = rows._array;
          var data = [];
          var visible_button = true;
          resp.forEach(item => {
            var aux = [item.description, item.planned_date, 'A'];
            data.push(aux)
            if (item.state == 'new'){
              visible_button = false;
            }
          });
          this.setState ({
            dataSource: resp,
            tableData: data,
            visible_button: visible_button
          });
        },
        (_, err) => {
          console.error(`ERROR consultando DB: ${err}`)
        }
      )
    });
  }

  onBackButtonPressAndroid = () => {
    this.goBack()
    return true;
  };

  setStateComplet(){
    this.saveComplet();
    this.goBack();
  }

  async saveComplet() {     
    global.DB.transaction(tx => {
      tx.executeSql(
        ` update schedule set state = 'complete' where id = ?`,
        [global.context.event_id],
        (_, { rows }) => {},
        (_, err) => {
          console.error(`ERROR consultando DB: ${err}`)
        }
      );
    });

    ToastAndroid.showWithGravityAndOffset(
      'Los datos se actualizaron correctamente.',
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
    
  }


  getIconBattery(index){
    var percent = this.state.dataSource[index].percent;
    if(percent === 0.0) return 'battery-0';
    if(percent <= 0.25) return 'battery-1';
    if(percent <= 0.5) return 'battery-2';
    if(percent <= 0.75) return 'battery-3';
    if(percent <= 1) return 'battery-4';
  }

  refresh() {
    this.getActivities();
  }

  goToSurvey(activity){
    if(activity.state !== 'canceled')
      this.props.navigation.navigate('Survey',
        {activity: activity, onGoBack: () => this.refresh()})
  }


  goBack(){
    this.props.navigation.state.params.onGoBack();
    this.props.navigation.goBack()
  }

  
  render() {
    let table;
    const state = this.state;

    const element = (data, index) => {
      if(this.state.dataSource[index].state === 'new') {
        return (
          <TouchableOpacity onPress={() => SurveyScreen._alertIndex(index) }>
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
      } if(this.state.dataSource[index].state === 'close') {
        return (
          <TouchableOpacity onPress={() => SurveyScreen._alertIndex(index) }>
            <View style={styles.btn_cont}>
              <Button transparent>
                <Icon name='check'/>
              </Button>
              <Button transparent onPress={() => this.props.navigation.navigate('Activity',{activity: this.state.dataSource[index], onGoBack: () => this.refresh()})}>
              <Icon name='search'/>
              </Button>
            </View>
          </TouchableOpacity>
        )
      } else {
        return (
          <View style={styles.btn_cont}>
            <Button transparent>
              <Icon name='close'/>
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

                <View style={styles.modalContent}  >                  
                  <Button block style={{ marginTop: 10, marginBottom: 10 }}
                    onPress={()=>{this.setStateComplet()}}
                    disabled={!this.state.visible_button}
                    >
                    <Text>Cerrar</Text>
                  </Button>
                </View>

              </View>
    }

    
    return (
      <Container>
        <HeaderNavBar navigation={this.props.navigation}  title="Actividades" />
        <Content>
          
          <Form>
            <Item stackedLabel>
              <Label>Contacto</Label>
              <Input
                value={this.contact_name}
                disabled
                style={{ width: '100%' }}
              />
              <Label>Dirección</Label>
              <Input
                value={ this.contact_dir + ' - ' + this.contact_city }
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
  btn: { width: 58, height: 25, backgroundColor: '#F08377',  borderRadius: 2 },
  btn_cont: { flexDirection: 'row' },
  btnText: { textAlign: 'center', color: '#fff' }
});