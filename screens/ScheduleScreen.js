import React from 'react';
import { Container, Content, Text, Button, Icon, CheckBox, List, ListItem, Thumbnail,
  Form, Item, Label, Left, Right, Spinner, Body, DatePicker} from 'native-base';
import { getLocationAsync, isClose, getConfiguration, formatDate, formatDatePrint } from '../utilities/utils';
import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';
import {StyleSheet, TouchableOpacity, View} from "react-native";
import AppConstans from '../constants/constants';

const img_sample = require("../assets/icon.png");

export default class ScheduleScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      nears: false,
      events: null,
      chosenDate: null,
      markers: [],
    };
    this.setDate = this.setDate.bind(this);
  }

  componentDidMount() {
    this.getActivities(null, null);
  }

  getActivities(nears, dateFilter) {
    
    let sql = ` select a.id, a.planned_date, a.state, a.exec_date, a.percent,
                actt.description, c.id as contact_id, c.name, c.address, c.city, 
                c.latitude, c.longitude 
                from Activity a 
                inner join ActivityType actt on (actt.id = a.activityType_id)
                inner join Contact c on (c.id = a.contact_id)
                where a.state != '${AppConstans.ACTIVITY_COMPLETED}'`;

    if(dateFilter) {
      let endDate = new Date(dateFilter.getTime()+86399000); //le sumo 23 hs 59 mins y 59 segs
      sql += ` and planned_date between '${dateFilter}' and '${endDate}'`
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
          data.forEach(item => {
            markers.push({title: item.name, description: 'Contacto', coords: { latitude: item.latitude, longitude: item.longitude}});
          });
          this.setState ({
            events: data,
            markers: markers
          });
        },
        (_, err) => {
          console.error(`ERROR consultando DB: ${err}`)
        }
      )
    });
  }

  getIconBattery(percent){
    if(percent === 0.0) return 'battery-0';
    if(percent <= 0.25) return 'battery-1';
    if(percent <= 0.5) return 'battery-2';
    if(percent <= 0.75) return 'battery-3';
    if(percent <= 1) return 'battery-4';
  }

  refresh() {
    this.getActivities(null,null);
  }

  toggleNears(){
    this.state.nears = !this.state.nears;
    this.getActivities(this.state.nears, this.state.chosenDate);
  }

  setDate(newDate) {
    this.getActivities(this.state.nears, newDate);
    this.state.chosenDate = newDate;
  }

  clearDate(){
    this.state.chosenDate = null;
    this.getActivities(this.state.nears, null);   
  }

  getGoToParams(row){
    let activity = {
      id: row.id,
      planned_date: row.planned_date,
      state: row.state,
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

  goToActivities(row){
    let params = this.getGoToParams(row);
    this.props.navigation.navigate('Activities',{contact: params.contact, onGoBack: () => this.refresh()})
  }

  goToActivity(row){
    let params = this.getGoToParams(row);
    this.props.navigation.navigate('Activity',{activity: params.activity, contact: params.contact, onGoBack: () => this.refresh()})
  }

  goToSurvey(row){
    let params = this.getGoToParams(row);
    this.props.navigation.navigate('Survey',{activity: params.activity, contact: params.contact, onGoBack: () => this.refresh()})
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
                <DatePicker
                  defaultDate={null}
                  minimumDate={new Date(2018, 1, 1)}
                  maximumDate={new Date(2050, 12, 31)}
                  locale={"es"}
                  timeZoneOffsetInMinutes={undefined}
                  modalTransparent={false}
                  animationType={"fade"}
                  androidMode={"default"}
                  placeHolderText="Fecha ..."
                  textStyle={{ color: '#F08377' }}
                  placeHolderTextStyle={{ color: '#CCC' }}
                  onDateChange={this.setDate}
                  disabled={false}
                />
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
                        { data.state == AppConstans.ACTIVITY_NEW && 
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
                        { data.state == AppConstans.ACTIVITY_COMPLETED && 
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
                        { data.state == AppConstans.ACTIVITY_CANCELED && 
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
  btn_cont: { flexDirection: 'row', width: 120, justifyContent: 'flex-start' },

  btnText: { width: 40 },
  btnTextHeader: { width: 40, marginTop: 9, padding: 0, height: 26},
  btnIcon: { width: 40, marginLeft: 0 }
});
