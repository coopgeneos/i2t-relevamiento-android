import React from 'react';
import { Container, Header, Content, Icon, Text, Button, Item,
        Form, Input, Label, Left, Spinner } from 'native-base';
import {formatDate} from '../src/utils';
// import styles from "./Styles";

export default class HomeScreen extends React.Component { 
  constructor() {
    super();   
    this.state = {
      user: '',
      lastSync : '',
      pendingSyncs : ''
    };    
  }

  // Metodo donde llamar a los WS iniciales
  componentDidMount() {
    //simulo al WS
    setTimeout(() => {
      let loggedUser = {name: 'Luis', lastName: 'Segundo', email: 'luissegundo@unmail.com',lastSync: new Date(), pendingSyncs: 5};
      this.setState ({
        user: loggedUser.email,
        lastSync: formatDate(loggedUser.lastSync),
        pendingSyncs: loggedUser.pendingSyncs.toString()
      });
    }, 1000);    
  }
  
  render() {
    let formItem;
    if(this.state.user == ''){
      formItem = <Spinner color='blue'/>
    } else {
      formItem = <Form>
                  <Item inlineLabel>
                    <Left style={{flexShrink: 2}}><Label>Usuario</Label></Left>
                    <Left style={{flexGrow: 2}}><Input value={this.state.user} editable={false}/></Left>
                  </Item>
                  <Item inlineLabel>
                    <Left><Label>Ultima sincronización</Label></Left>
                    <Left><Input value={this.state.lastSync} editable={false}/></Left>
                  </Item>
                  <Item inlineLabel last>
                    <Left><Label>Pendientes sincronización</Label></Left>
                    <Left><Input value={this.state.pendingSyncs} editable={false}/></Left>
                  </Item>
                </Form>
    }

    return (
      <Container>
        <Header>
          <Text >App's de Relevamiento</Text>
        </Header>
        <Content>
          <Item>
            <Button transparent onPress={() => this.props.navigation.navigate('Schedule')}>
              <Icon name='calendar'/>       
            </Button>
            <Button transparent onPress={() => this.props.navigation.navigate('Contacts')}>                 
              <Icon name='contact'/>
            </Button>
            <Button transparent onPress={() => alert('No hago nada')}>
              <Icon name='settings'/>                 
            </Button>       
            <Button transparent onPress={() => alert('No hago nada')}>                      
              <Icon name='sync'/>
            </Button>
          </Item>
          {formItem}
        </Content>
      </Container>
    );
  }
}