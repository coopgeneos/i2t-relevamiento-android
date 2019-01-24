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
      address: event.address+' - '+event.city+'('+event.zipCode+')'
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
            <Text>{this.state.events[i].address+' - '+this.state.events[i].city+'('+this.state.events[i].zipCode+')'}</Text>
            <Text>{this.state.events[i].title}</Text>
          </ListItem>
        )
      } 
    }

    return (
      <Container>
        <Header>
          <Text style={styles.header}>Agenda</Text>
        </Header>
        <Content>
          <Form style={{flexDirection: 'row', justifyContent: 'center'}}>
            
              <Item style={{flexDirection: 'row', justifyContent: 'flex-start', width: '50%'}}>
                <Label>Fecha</Label>
                <Input value={this.state.date} editable={false} />               
              </Item>
              <Item style={{flexDirection: 'row', justifyContent: 'flex-start', width: '30%'}}>               
                <Label>Cercanos</Label>
                <CheckBox checked={this.state.nears} onPress={() => {this.toggleNears()}} />               
              </Item>
            
          </Form>
          <Item style={styles.listContainer}>
            <List scrollEnabled style={styles.list}>
              <ListItem itemHeader first style={styles.listItem}>
                <Text style={styles.listHeaderText}>Eventos</Text>
              </ListItem>
              {itemList}
            </List>
          </Item>
          <Item inlineLabel style={styles.bottomButtons}>
            <Button onPress={() => this.props.navigation.navigate('Home')}>
              <Text>Salir</Text>
            </Button>
            <Button onPress={() => this.props.navigation.navigate('Map')}>
              <Text>Mapa</Text>
            </Button>
          </Item>         
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