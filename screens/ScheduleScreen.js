import React from 'react';
import { Container, Header, Content, Footer, FooterTab, Text, 
         Button, Icon, CheckBox, List, ListItem, Form, Item, Label,
         Input } from 'native-base';

export default class ScheduleScreen extends React.Component {
  constructor() {
    super();
    this.dataList = ['Hoy a trabajar','Mañana tambien','Pasado, el doble','...'];
    this.state = {
      now : new Date(), 
    };
  }

  render() {
    let itemList = [];
    for(i=0; i< this.dataList.length; i++){
      itemList.push(
        <ListItem onPress={() => this.props.navigation.navigate('Activities')} key={this.dataList[i]}>
          <Text>{this.dataList[i]}</Text>
        </ListItem>
      )
    }

    return (
      <Container>
        <Header>
          <Text>Agenda</Text>
        </Header>
        <Content>
          <Form>
            <Item inlineLabel last>
              <Label>Fecha</Label>
              <Input value={this.state.now.toString()} editable={false}/>
            </Item>
            <Item inlineLabel last>
              <Label>Cercanos</Label>
              <CheckBox checked={true} onPress={() => {alert('No hago naranja'); this.checked = !this.checked}}/>
            </Item>
            <List>
              <ListItem itemHeader first>
                <Text>Agenda</Text>
              </ListItem>
              {itemList}
            </List>
            <Item inlineLabel last>
              <Button onPress={() => this.props.navigation.navigate('Home')}>
                <Text>Salir</Text>
              </Button>
              <Button onPress={() => alert('MAPA')}>
                <Text>Mapa</Text>
              </Button>
            </Item>
          </Form>
        </Content>
        <Footer>
          <FooterTab>
            <Button vertical onPress={() => this.props.navigation.navigate('Home')}>
              <Icon name="calendar" />
              <Text>Agenda</Text>
            </Button>
            <Button vertical>
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