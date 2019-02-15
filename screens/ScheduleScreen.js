import React from 'react';
import { Container, Header, Content, Footer, FooterTab, Text, 
        Button, Icon, CheckBox, List, ListItem, Thumbnail, Form, Item, Label,
        Input, Left, Right, Spinner, Title, Body, DatePicker} from 'native-base';
import { Location, Permissions } from 'expo';
import { computeDistanceBetween } from 'spherical-geometry-js';
import { getLocationAsync, isClose, getConfiguration, formatDate } from '../utilities/utils';
import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';

const img_sample = require("../assets/icon.png");

export default class ScheduleScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      nears: false,
      events: null,
      chosenDate: null,
      markers: []
    };
    this.setDate = this.setDate.bind(this);
  }

  componentDidMount() {
    this.getEvents(null, null);
  }

  getEvents(nears, dateFilter) {
    let sql = ` select s.id, c.*     
                from Schedule s
                inner join Contact c on (c.id = s.contact_id)
                where s.state != 'Complete'`;
    if(dateFilter) {
      sql += ` and planned_date = '${formatDate(dateFilter)}'`
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
            var data = rows._array.filter(item => {
              var evLoc = {lat: item.latitude, lng: item.longitude};
              return isClose(myLoc, evLoc, prox_range)
            })
          }
          var markers = [];       
          data.forEach(item => {
            markers.push({title: item.name, description: 'Contacto', coords: { latitude: item.latitude, longitude: item.longitude}});
          })         
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

  toggleNears(){
    this.state.nears = !this.state.nears;
    this.getEvents(this.state.nears, this.state.chosenDate);
  }

  setDate(newDate) {
    this.getEvents(this.state.nears, newDate);
    this.state.chosenDate = newDate;
  }

  goToActivities(params){
    global.context['event_id'] = params.event_id;
    global.context['contact'] = params.contact; 
    this.props.navigation.navigate('Activities');
  }
  
  render() {
    var areThereEvents = this.state.events == null ? false : true;

    return (
      <Container>
        <HeaderNavBar navigation={this.props.navigation} title="Agenda" map={true} markers={this.state.markers} />
        <Content>
          <Form style={{flexDirection: 'row', justifyContent: 'center'}}>
            
              <Item style={{flexDirection: 'row', justifyContent: 'flex-start', width: '50%'}}>
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
                  placeHolderText="Ingresar Fecha"
                  textStyle={{ color: '#F08377' }}
                  placeHolderTextStyle={{ color: '#CCC' }}
                  onDateChange={this.setDate}
                  disabled={false}
                />            
              </Item>
              <Item style={{flexDirection: 'row', justifyContent: 'flex-start', width: '30%'}}>               
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
                          {data.name}
                        </Text>
                        <Text numberOfLines={2} note>
                          {data.address} - {data.city} - {data.zipCode}
                        </Text>
                        <Text numberOfLines={1} note>
                          {data.event}
                        </Text>
                      </Body>
                      <Right>
                        <Button transparent onPress={()=>{this.goToActivities({contact: data, event_id: data.id})}} style={{fontSize: 32}}>
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