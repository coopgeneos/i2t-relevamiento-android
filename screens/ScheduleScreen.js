import React from 'react';
import { Container, Content, Text, Button, Icon, CheckBox, List, ListItem, Thumbnail,
  Form, Item, Label, Left, Right, Spinner, Body, DatePicker} from 'native-base';
import { getLocationAsync, isClose, getConfiguration, formatDate } from '../utilities/utils';
import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';
import {StyleSheet} from "react-native";

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
    this.getEvents(null, null);
  }

  getEvents(nears, dateFilter) {
    let sql = ` select a.id as activity_id, a.description as description, c.*     
                from Activity a 
                inner join Contact c on (c.id = a.contact_id)
                where a.state != 'complete'`;
    if(dateFilter) {
      sql += ` and a.planned_date = '${formatDate(dateFilter)}'`
    }
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

  refresh() {
    this.getEvents(null,null);
  }

  toggleNears(){
    this.state.nears = !this.state.nears;
    this.getEvents(this.state.nears, this.state.chosenDate);
  }

  setDate(newDate) {
    this.getEvents(this.state.nears, newDate);
    this.state.chosenDate = newDate;
  }

  clearDate(){
    this.getEvents(this.state.nears, null);
    this.state.chosenDate = null;
  }

  goToActivities(params){
    //global.context['event_id'] = params.event_id;
    global.context['activity_id'] = params.activity_id;
    global.context['contact'] = params.contact; 
    this.props.navigation.navigate('Activities', {onGoBack: () => this.refresh()})
  }
  
  render() {
    var areThereEvents = this.state.events != null;

    return (
      <Container>
        <HeaderNavBar navigation={this.props.navigation} title="Agenda" map={true} markers={this.state.markers} />
        <Content>
          <Form style={{flexDirection: 'row', justifyContent: 'center'}}>
            
              <Item style={{flexDirection: 'row', justifyContent: 'flex-start', width: '60%'}}>
                <Label>Fecha</Label>
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
                <Button
                  style={{ height: 25, backgroundColor: '#F08377', color: 'white', marginTop: 6}}
                  onPress={() => { this.clearDate() }}
                ><Text>Reset</Text>
                </Button>

              </Item>

              <Item style={{flexDirection: 'row', justifyContent: 'flex-start', width: '40%'}}>
                <Label>Cercanos</Label>
                <CheckBox checked={this.state.nears} onPress={() => {this.toggleNears()}} />               
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
                      <Left>
                        <Thumbnail square source={img_sample} />
                      </Left>
                      <Body>
                        <Text>
                          {data.description}
                        </Text>
                        <Text numberOfLines={2} note>
                          {data.address} - {data.city} - {data.zipCode}
                        </Text>
                        <Text numberOfLines={1} note>
                          {data.event}
                        </Text>
                      </Body>
                      <Right>
                        <Button transparent onPress={()=>{this.goToActivities({contact: data, activity_id: data.activity_id})}} style={{fontSize: 32}}>
                          <Icon name='search'/>
                        </Button>
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

