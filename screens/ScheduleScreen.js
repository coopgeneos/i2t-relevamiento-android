import React from 'react';
import { Container, Header, Content, Footer, FooterTab, Text, 
        Button, Icon, CheckBox, List, ListItem, Form, Item, Label,
        Input, Left, Right, Spinner} from 'native-base';
import {formatDate} from '../src/utils';
import styles from "./Styles";

export default class ScheduleScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      date : '',
      nears: false,
      events: null 
    };
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

  render() {
    let itemList
    if(this.state.events == null){
      itemList = <Spinner color='blue'/>
    } else {
      itemList = [];
      for(i=0; i< this.state.events.length; i++){
        itemList.push(
          <ListItem style={styles.listItem} 
            onPress={this.onPressRow.bind(this, this.state.events[i])}
            key={i}>
            <Text>{this.state.events[i].agency}</Text>
            <Text>{this.state.events[i].address+' - '+this.state.events[i].city+' ('+this.state.events[i].zipCode+')'}</Text>
            <Text>{this.state.events[i].title}</Text>
          </ListItem>
        )
      } 
    }

    return (
      <Container>
        <Header>
          <Left>
            <Button transparent>
              <Icon name='book' style={{fontSize: 32, color: 'white'}}/>
            </Button>
          </Left>
          <Body>
            <Title>Agenda</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => this.props.navigation.navigate('Home')}  style={{fontSize: 32}}>
              <Icon name='home'/>
            </Button>
            <Button transparent onPress={() => this.props.navigation.navigate('Map')}   style={{fontSize: 32}}>
              <Icon name='map'/>
            </Button>
          </Right>
        </Header>
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
                  textStyle={{ color: "#F08377" }}
                  placeHolderTextStyle={{ color: "#CCC" }}
                  onDateChange={this.setDate}
                  disabled={false}
                />            
              </Item>
              <Item style={{flexDirection: 'row', justifyContent: 'flex-start', width: '30%'}}>               
                <Label>Cercanos</Label>
                <CheckBox checked={this.state.nears} onPress={() => {this.toggleNears()}} />               
              </Item>
            
          </Form>


          <List
            dataArray={datas}
            renderRow={data =>
              <ListItem thumbnail onPress={()=>{this.props.navigation.navigate('Activities',{agency: data.city})}}>
                <Left>
                  <Thumbnail square source={img_sample} />
                </Left>
                <Body>
                  <Text>
                    {data.agency}
                  </Text>
                  <Text numberOfLines={1} note>
                    {data.address} - {data.city} - {data.zipCode}
                  </Text>
                  <Text numberOfLines={1} note>
                    {data.event}
                  </Text>
                </Body>
                <Right>
                  <Button transparent>
                    <Text>View</Text>
                  </Button>
                </Right>
              </ListItem>}
          />

    
        </Content>
        <Footer>
          <FooterTab>
            <Button vertical onPress={() => this.props.navigation.navigate('Schedule')}>
              <Icon name="calendar" />
              <Text>Agenda</Text>
            </Button>
            <Button vertical onPress={() => this.props.navigation.navigate('Contacts')}>
              <Icon name="person" />
              <Text>Contactos</Text>
            </Button>
            <Button vertical active>
              <Icon active name="settings" />
              <Text>Config</Text>
            </Button>
            <Button vertical>
              <Icon name="sync" />
              <Text>Sinc</Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }  
}