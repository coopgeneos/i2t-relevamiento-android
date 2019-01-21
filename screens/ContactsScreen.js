import React from 'react';
//import { Button } from 'react-native';
import { Container, Header, Content, Footer, FooterTab, Text, 
  Button, Icon, CheckBox, List, ListItem, Form, Item, Label,
  Input } from 'native-base';

export default class ContactsScreen extends React.Component {
  constructor() {
    super();
    this.dataList = ['Juan Perez / 24945687559 / Buzon 2345','Jose Fantasia / 4654876546 / Segundo sombra 25666'];
    this.state = {
      name: 'Pablocho88'
    };
  }

  render() {
    let itemList = [];
    for(i=0; i< this.dataList.length; i++){
      itemList.push(
        <ListItem onPress={() => this.props.navigation.navigate('Activities')}  key={this.dataList[i]} >
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
              <Label>Nombre</Label>
              <Input value={this.state.name} editable={false}/>
            </Item>
            <Item inlineLabel last>
              <Label>Cercanos</Label>
              <CheckBox checked={true} onPress={() => {alert('No hago naranja'); this.checked = !this.checked}}/>
            </Item>
            <List>
              <ListItem itemHeader first>
                <Text>Contactos</Text>
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