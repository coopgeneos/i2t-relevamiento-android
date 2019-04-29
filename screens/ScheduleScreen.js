import React from 'react';
import { Container, Content, Text, Button, Icon, CheckBox, List, ListItem, Thumbnail,
  Form, Item, Label, Left, Right, Spinner, Body, DatePicker} from 'native-base';
import { getLocationAsync, isClose, getConfiguration, formatDateTo, formatDatePrint, showDB } from '../utilities/utils';
import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';
import {StyleSheet, TouchableOpacity, View, BackHandler, DatePickerAndroid } from "react-native";
import AppConstans from '../constants/constants';

const img_sample = require("../assets/icon.png");

export default class ScheduleScreen extends React.Component {

  _didFocusSubscription;
  _willBlurSubscription;

  constructor(props) {
    super(props);
    this.state = {
      nears: false,
      events: null,
      chosenDate: null,
      markers: [],
    };
    this.setDate = this.setDate.bind(this);

    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }

  onBackButtonPressAndroid = () => {
    this.goBack()
    return true;
  };

  goBack() {
    if(this.props.navigation.state.params && this.props.navigation.state.params.onGoBack){
      this.props.navigation.state.params.onGoBack();
    }
    this.props.navigation.goBack()
  }

  componentDidMount() {
    this.getActivities(null, null).
      then(() => {
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

  getActivities(nears, dateFilter) {
    return new Promise((resolve, reject) => {
      let sql = ` select a.id, a.planned_date, a.state, a.status, a.exec_date, a.percent,
                  actt.description, c.id as contact_id, c.name, c.address, c.city, 
                  c.latitude, c.longitude 
                  from Activity a 
                  inner join ActivityType actt on (actt.id = a.activityType_id)
                  inner join Contact c on (c.id = a.contact_id)
                  where a.status != '${AppConstans.ACTIVITY_COMPLETED}' 
                  and a.state != 1
                `;

      if(dateFilter) {
        let endDate = new Date(dateFilter.getTime()+86399000); //le sumo 23 hs 59 mins y 59 segs
        endDate = formatDateTo(endDate, 'YYYY/MM/DD HH:mm:ss');
        sql += ` and planned_date between '${formatDateTo(dateFilter, 'YYYY/MM/DD HH:mm:ss')}' and '${endDate}'`
      }

      sql += ` order by planned_date asc`;

      global.DB.transaction(tx => {
        tx.executeSql(
          sql,
          [],
          async (_, { rows }) => {
            var data = rows._array;
            if(nears === true){
              var myLocation = await getLocationAsync();
              var myLoc = {lat: myLocation.coords.latitude, lng: myLocation.coords.longitude};
              var prox_range = await getConfiguration('PROXIMITY_RANGE');
              data = rows._array.filter(item => {
                var evLoc = {lat: item.latitude, lng: item.longitude};
                return isClose(myLoc, evLoc, prox_range)
              })
            }
            var markers = [];       
            data.forEach((item, index) => {
              if(item.latitude != null && item.longitude != null)
                markers.push({title: item.name, description: item.address+' - '+item.city, coords: { latitude: item.latitude, longitude: item.longitude}, key: index});
            });
            /* 
              Elimino los repetidos para evitar problemas de key repetidas en el mapa
              y evitar solapamientos en pines
            */
            this.removeDuplicated(markers, this.markerEquals);
            /* this.setState ({
              events: data,
              markers: markers
            }); */
            this.state.events = data;
            this.state.markers = markers;
            resolve("Ok")
          },
          (_, err) => {
            reject(`ERROR consultando DB: ${err}`)
          }
        )
      });
    })
  }

  /* Dos marcadores son iguales si tienen la misma latitud y longitud */
  markerEquals(m1, m2) {
    return (m1.coords.latitude == m2.coords.latitude) && (m1.coords.longitude == m2.coords.longitude)
  }

  removeDuplicated(array, areEquals) {
    for(i=0; i<(array.length - 1); i++) {
      for(j=i+1; j<array.length; j++) {
        if(this.markerEquals(array[i], array[j])){
          array.splice(j, 1);
          j--; // Retrocedo un casillero porque el arreglo se acaba de achicar
        }
      }
    }
    return array;
  }

  getIconBattery(percent){
    if(percent === 0.0) return 'battery-0';
    if(percent <= 0.25) return 'battery-1';
    if(percent <= 0.5) return 'battery-2';
    if(percent <= 0.75) return 'battery-3';
    if(percent <= 1) return 'battery-4';
  }

  /*
    Para poder hacer setState en una funcion de refresh, al pasarla como parametro
    en la navegacion, se debe pasar bindeada
  */
  refresh() {
    this.getActivities(null,null)
      .then(() => {
        this.setState({})
      })
      .catch(err => {
        console.error("Error obteniendo datos para página de contactos")
      })
  }

  toggleNears(){
    this.state.nears = !this.state.nears;
    this.getActivities(this.state.nears, this.state.chosenDate)
      .then(() => {
        this.setState({});
      })
  }

  async openAndroidDatePicker() {
    try {
      const newDate = await DatePickerAndroid.open({
        date: this.state.chosenDate
          ? this.state.chosenDate
          : new Date(),
        minDate: new Date(2018, 1, 1),
        maxDate: new Date(2050, 18, 31),
        mode: this.props.androidMode
      });
      const { action, year, month, day } = newDate;
      if (action === "dateSetAction") {
        let selectedDate = new Date(year, month, day);
        this.state.chosenDate = selectedDate;
        this.setDate(selectedDate)
      }
    } catch ({ code, message }) {
      console.warn("Cannot open date picker", message);
    }
  }

  setDate(newDate) {
    this.state.chosenDate = newDate;
    this.getActivities(this.state.nears, newDate)
      .then(() => {
        this.setState({});
      })   
  }

  clearDate(){
    this.state.chosenDate = null;
    this.getActivities(this.state.nears, null)
      .then(() => {
        this.setState({});
      }) 
  }

  getGoToParams(row){
    let activity = {
      id: row.id,
      planned_date: row.planned_date,
      state: row.state,
      status: row.status,
      exec_date: row.exec_date,
      percent: row.percent, 
      description: row.description, 
    };
    let contact = {
      id: row.contact_id,
      name: row.name,
      address: row.address,
      city: row.city,
      latitude: row.latitude,
      longitude: row.longitude
    }
    return {activity: activity, contact: contact}
  }

  /* 
    IMPORTANTE!!!!!!!

    A la hora de manejar la navegación y mandar un parametro del estilo onGoBack y poder hacer un 
    setState() dentro de dicho método, es necesario usar bind()

    leer: https://github.com/react-navigation/react-navigation/issues/922#issuecomment-344752635
  */
  goToActivities(row){
    let params = this.getGoToParams(row);
    this.props.navigation.navigate('Activities',{contact: params.contact, onGoBack: this.refresh.bind(this)})
  }

  goToActivity(row){
    let params = this.getGoToParams(row);
    this.props.navigation.navigate('Activity',{activity: params.activity, contact: params.contact, onGoBack: this.refresh.bind(this)})
  }

  goToSurvey(row){
    let params = this.getGoToParams(row);
    this.props.navigation.navigate('Survey',{activity: params.activity, contact: params.contact, onGoBack: this.refresh.bind(this)})
  }
  
  render() {
    var areThereEvents = this.state.events != null;

    return (
      <Container>
        <HeaderNavBar navigation={this.props.navigation} title="Agenda" map={true} markers={this.state.markers} />
        <Content>
          <Form style={{flexDirection: 'row', justifyContent: 'center'}}>
            
              <Item style={{flexDirection: 'row', justifyContent: 'flex-start', width: '60%'}}>
                <Label style={{ marginTop: 9 }}>Fecha</Label>
                <Text
                  onPress={this.openAndroidDatePicker.bind(this)}
                  style={{ marginTop: 10, marginRight:12, color: '#F08377' }}
                >
                  {this.state.chosenDate
                    ? formatDateTo(this.state.chosenDate, 'DD/MM/YYYY')
                    : "Seleccione..."}
                </Text>
                <Button  onPress={() => {this.clearDate()}}  transparent style={styles.btnTextHeader} onPress={() => { this.clearDate() }}>
                  <Icon name='close'  style={styles.btnIcon}/>
                </Button>

              </Item>

              <Item style={{flexDirection: 'row', justifyContent: 'flex-start', width: '40%'}}>
                <Label style={{ marginTop: 9 }}>Cercanos</Label>
                <CheckBox style={{ marginTop: 9 }} checked={this.state.nears} onPress={() => {this.toggleNears()}} />               
              </Item>
            
          </Form>

          {
            !areThereEvents ? 
              (<Spinner />)
              : (
                <List
                  dataArray={this.state.events}
                  renderRow={data =>
                    <ListItem thumbnail>
                      <Body>
                        <Text>
                          {data.description} - {data.name}
                        </Text>
                        <Text numberOfLines={2} note>
                          {data.address} - {data.city}
                        </Text>
                        <Text numberOfLines={1} note>
                          Fecha: {formatDatePrint(new Date(data.planned_date))}
                        </Text>
                      </Body>
                      <Right>
                        { ( data.status == AppConstans.ACTIVITY_NEW || 
                            data.status == AppConstans.ACTIVITY_IN_PROGRESS ||
                            data.status == AppConstans.ACTIVITY_PENDING ) && 
                            <TouchableOpacity>
                              <View style={styles.btn_cont}>
                                <Button transparent style={styles.btnText} onPress={() => this.goToActivities(data)}>
                                  <Icon name='user' style={styles.btnIcon}/>
                                </Button>
                                <Button transparent style={styles.btnText} onPress={() => this.goToActivity(data)}>
                                  <Icon name='edit' style={styles.btnIcon}/>
                                </Button>
                                <Button transparent style={styles.btnText} onPress={() => this.goToSurvey(data)}>
                                  <Icon name={this.getIconBattery(data.percent)} style={styles.btnIcon}/>
                                </Button>
                              </View>
                            </TouchableOpacity>
                        }
                        { data.status == AppConstans.ACTIVITY_COMPLETED && 
                            <TouchableOpacity>
                            <View style={styles.btn_cont}>
                              <Button transparent style={styles.btnText} onPress={() => this.goToActivities(data)}>
                                  <Icon name='user' style={styles.btnIcon}/>
                                </Button>
                              <Button transparent style={styles.btnText}>
                                <Icon name='check' style={styles.btnIcon}/>
                              </Button>
                              <Button transparent style={styles.btnText} onPress={() => this.goToSurvey(data)}>
                              <Icon name='search' style={styles.btnIcon}/>
                              </Button>
                            </View>
                            </TouchableOpacity>
                        }
                        { data.status == AppConstans.ACTIVITY_CANCELED && 
                            <TouchableOpacity onPress={() => SurveyScreen._alertIndex(index) }>
                            <View style={styles.btn_cont}>
                              <Button transparent style={styles.btnText} onPress={() => this.goToActivities(data)}>
                                  <Icon name='user' style={styles.btnIcon}/>
                                </Button>
                              <Button transparent style={styles.btnText}>
                                <Icon name='close' style={styles.btnIcon}/>
                              </Button>
                              <Button transparent style={styles.btnText} onPress={() => this.goToActivity(data)}>
                                <Icon name='search' style={styles.btnIcon}/>
                              </Button>
                            </View>
                            </TouchableOpacity>
                        }
                      </Right>
                    </ListItem>}
                />
            )
          }    
        </Content>
        <FooterNavBar navigation={this.props.navigation} onGoBack={this.refresh.bind(this)}/>
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
  btn_cont: { flexDirection: 'row', width: 120, justifyContent: 'flex-start' },

  btnText: { width: 40 },
  btnTextHeader: { width: 40, marginTop: 9, padding: 0, height: 26},
  btnIcon: { width: 40, marginLeft: 0 }
});
