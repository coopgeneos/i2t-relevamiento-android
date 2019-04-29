import React from 'react';
import { Container, Header, Content, Footer, FooterTab, Text, Button, Spinner,
         Icon, Form, Item, Label, Input, Left, Title, Body, Right, Textarea } from 'native-base';
import { StyleSheet, View, TouchableOpacity, Alert, BackHandler, ToastAndroid} from 'react-native';
import { Table, TableWrapper, Row, Cell } from 'react-native-table-component';
import { formatDatePrint, getConfiguration } from '../utilities/utils';
import AppConstans from '../constants/constants';

import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';

export default class ActivitiesScreen extends React.Component {

  _didFocusSubscription;
  _willBlurSubscription;

  constructor(props) {
    super(props);

    this.contact = this.props.navigation.getParam('contact', null);

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
      .then(() => {
        this.setState({});
      })

    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
    BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }

  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
  }

  getActivities() {
    return new Promise((resolve, reject) => {
      getConfiguration("HISTORY_SIZE")
        .then(history_size => {
          history_size = (history_size == null || history_size == 0) ? 10 : history_size;
          global.DB.transaction(tx => {
            tx.executeSql(
              ` select a.*, actt.short_name 
                from Activity a 
                inner join ActivityType actt on (actt.id = a.activityType_id) 
                where a.contact_id = ? 
                and a.state != 1 
                order by a.updated desc 
                limit ?
              `,
              [this.contact.id, history_size],
              (_, { rows }) => {
                var resp = rows._array;
                var data = [];
                var visible_button = true;
                for(i=0; i<resp.length; i++) {
                  var aux = [resp[i].short_name, formatDatePrint(new Date(resp[i].planned_date)), 'A'];
                  data.push(aux)
                  if (resp[i].state == AppConstans.ACTIVITY_NEW){
                    visible_button = false;
                  }
                }
                /* this.setState ({
                  dataSource: resp,
                  tableData: data,
                  visible_button: visible_button
                }); */
                this.state.dataSource = resp,
                this.state.tableData = data,
                this.state.visible_button = visible_button

                resolve("Ok")
              },
              (_, err) => {
                reject(`ERROR consultando DB: ${err}`)
              }
            )
          });
        })
        .catch(err => {
          reject(err)
        })
    })
    
  }

  onBackButtonPressAndroid = () => {
    this.goBack()
    return true;
  };

  setStateComplet(){
    this.goBack();
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
    this.getActivities()
      .then(() => {
        this.setState({})
      })
      .catch(err => {
        console.error("Error obteniendo datos para página de tareas del contacto")
      })
  }

  goToSurvey(activity){
    if(activity.state !== AppConstans.ACTIVITY_CANCELED) {
      this.props.navigation.navigate('Survey',
        {activity: activity, contact: this.contact, onGoBack: this.refresh.bind(this)})
    }
  }

  goToActivity(activity){  
    this.props.navigation.navigate('Activity',
      {activity: activity, contact: this.contact, onGoBack: this.refresh.bind(this)})
    
  }

  goBack() {
    if(this.props.navigation.state.params && this.props.navigation.state.params.onGoBack){
      this.props.navigation.state.params.onGoBack();
    }
    this.props.navigation.goBack()
  }

  render() {
    let table;
    const state = this.state;

    const element = (data, index) => {
      if( this.state.dataSource[index].status === AppConstans.ACTIVITY_NEW ||
          this.state.dataSource[index].status === AppConstans.ACTIVITY_IN_PROGRESS ||
          this.state.dataSource[index].status === AppConstans.ACTIVITY_PENDING) {
        return (
          <TouchableOpacity onPress={() => SurveyScreen._alertIndex(index) }>
            <View style={styles.btn_cont}>
              <Button transparent onPress={() => this.goToActivity(this.state.dataSource[index])}>
                <Icon name='edit'/>
              </Button>
              <Button transparent onPress={() => this.goToSurvey(this.state.dataSource[index])}>
                <Icon name={this.getIconBattery(index)}/>
              </Button>
            </View>
          </TouchableOpacity>
        )
      } if(this.state.dataSource[index].status === AppConstans.ACTIVITY_COMPLETED) {
        return (
          <TouchableOpacity onPress={() => SurveyScreen._alertIndex(index) }>
            <View style={styles.btn_cont}>
              <Button transparent onPress={() => this.goToActivity(this.state.dataSource[index])}>
                <Icon name='edit'/>
              </Button>
              <Button transparent onPress={() => this.goToSurvey(this.state.dataSource[index])}>
                <Icon name='check'/>
              </Button>
              {/*<Button transparent onPress={() => this.goToSurvey(this.state.dataSource[index])}>
                <Icon name='search'/>
              </Button>*/}
            </View>
          </TouchableOpacity>
        )
      } else {
        return (
          <View style={styles.btn_cont}>
            <Button transparent onPress={() => this.goToActivity(this.state.dataSource[index])}>
                <Icon name='edit'/>
              </Button>
            <Button transparent>
              <Icon name='close'/>
            </Button>
            {/*<Button transparent onPress={() => this.goToSurvey(this.state.dataSource[index])}>
              <Icon name='search'/>
            </Button>*/}
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
                            />
                          ))
                        }
                      </TableWrapper>
                    ))
                  }
                </Table>

                {/*<View style={styles.modalContent}  >                  
                  <Button block style={{ marginTop: 10, marginBottom: 10 }}
                    onPress={()=>{this.setStateComplet()}}
                    disabled={!this.state.visible_button}
                    >
                    <Text>Cerrar</Text>
                  </Button>
                </View>*/}

              </View>
    }

    
    return (
      <Container>
        <HeaderNavBar navigation={this.props.navigation} title="Actividades" />
        <Content>
          
        <Form>
          <Item stackedLabel>
            <Label>Contacto</Label>
            <Textarea rowSpan={2}  
                value={this.contact.name}
                disabled
                style={{ marginLeft: 10, fontSize: 16 }}
              />
            <Label>Dirección</Label>
            <Textarea rowSpan={2} 
                value={ this.contact.address + ' - ' + this.contact.city }
                disabled
                style={{ marginLeft: 10, fontSize: 16 }}
              />
          </Item>
        </Form>

          {table}

        </Content>

        <FooterNavBar navigation={this.props.navigation} onGoBack={this.refresh.bind(this)}/>

      </Container>
    );
  }  
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 5, paddingTop: 20, backgroundColor: '#fff' },
  head: { height: 40, backgroundColor: '#778591' },
  text: { margin: 6, fontSize: 16},
  text_head: { margin: 6, color: '#FFF',  fontSize: 18},
  row: { flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#778591', height: 50 },
  btn: { height: 25, backgroundColor: '#F08377',  borderRadius: 2, fontSize: 12},
  btn_cont: { flexDirection: 'row' },
  btnText: { textAlign: 'center', color: '#fff'},
  row_data: {width: 250 },
  row_btn: { width: 100 }
});