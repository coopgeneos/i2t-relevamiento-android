import React from 'react';
import { Container, Header, Content, Footer, FooterTab, Text, 
        Button, Icon, CheckBox, List, ListItem, Thumbnail, Form, Item, Label,
        Input, Left, Right, Spinner, Title, Body, DatePicker} from 'native-base';
import {formatDate} from '../utilities/utils';
import styles from "./Styles";

import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';

const img_sample = require("../assets/icon.png");


// Ver como meter datas adentro de la llamada a los WS

const datas = [
  {agency: 'Agencia 99999/99', address: 'San Juan 465', city: 'Tandil', zipCode: '6546', title: 'Evento 1'},
  {agency: 'Agencia 99999/99', address: 'San Juan 465', city: 'Ayacucho', zipCode: '6546', title: 'Evento 2'},
  {agency: 'Agencia 99999/99', address: 'San Juan 465', city: '9 de Julio', zipCode: '7866', title: 'Evento 3'},
  {agency: 'Agencia 99999/99', address: 'San Juan 465', city: 'Azul', zipCode: '4567', title: 'Evento 4'},
  {agency: 'Agencia 99999/99', address: 'San Juan 465', city: 'Olavarria', zipCode: '4546', title: 'Evento 5'},
];

export default class ScheduleScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      date : '',
      nears: false,
      events: null,
      chosenDate: new Date() 
    };
    this.setDate = this.setDate.bind(this);
  }

  // Metodo donde llamar a los WS iniciales
  componentDidMount() {
    //simulo al WS
    setTimeout(() => {
      let response = {
        date: new Date(),
        nears: true,
        events: [
          {agency: 'Agencia 99999/99', address: 'San Juan 465', city: 'Tandil', zipCode: '6546', title: 'Evento 1'},
          {agency: 'Agencia 99999/99', address: 'San Juan 465', city: 'Ayacucho', zipCode: '6546', title: 'Evento 2'},
          {agency: 'Agencia 99999/99', address: 'San Juan 465', city: '9 de Julio', zipCode: '7866', title: 'Evento 3'},
          {agency: 'Agencia 99999/99', address: 'San Juan 465', city: 'Azul', zipCode: '4567', title: 'Evento 4'},
          {agency: 'Agencia 99999/99', address: 'San Juan 465', city: 'Olavarria', zipCode: '4546', title: 'Evento 5'},
        ]
      };
      this.setState ({
        date: formatDate(response.date),
        nears: response.nears,
        events: response.events
      });
    }, 1000);
  }

  toggleNears(){
    this.setState(prevState => (
      {nears: !prevState.nears}
    ))
  }

  onPressRow(event){
    this.props.navigation.navigate('Activities', {
      agency: event.agency, 
      address: event.address+' - '+event.city+' ('+event.zipCode+')'
    })
  }

  setDate(newDate) {
    this.setState({ chosenDate: newDate });
  }

  render() {
    var areThereEvents = this.state.events == null ? false : true;

    return (
      <Container>
        <HeaderNavBar navigation={this.props.navigation}  title="Agenda" />
        <Content>
          <Form style={{flexDirection: 'row', justifyContent: 'center'}}>
            
              <Item style={{flexDirection: 'row', justifyContent: 'flex-start', width: '50%'}}>
                <Label>Fecha</Label> 
                <DatePicker
                  defaultDate={new Date(2018, 4, 4)}
                  minimumDate={new Date(2018, 1, 1)}
                  maximumDate={new Date(2018, 12, 31)}
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
              (<Spinner color='blue'/>)
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
                          {data.agency}
                        </Text>
                        <Text numberOfLines={2} note>
                          {data.address} - {data.city} - {data.zipCode}
                        </Text>
                        <Text numberOfLines={1} note>
                          {data.event}
                        </Text>
                      </Body>
                      <Right>
                        <Button transparent onPress={()=>{this.props.navigation.navigate('Activities',{agency: data.agency, city: data.city, address: data.address})}} style={{fontSize: 32}}>
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