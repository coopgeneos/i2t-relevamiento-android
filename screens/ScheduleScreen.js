import React from 'react';
import { Container, Header, Content, Footer, FooterTab, Text, 
         Button, Icon, CheckBox, List, ListItem, Form, Item, Label,
         Input } from 'native-base';

import styles from "./Styles";

export default class ScheduleScreen extends React.Component {
  constructor() {
    super();
    this.dataList = ['Hoy a trabajar','Mañana tambien','Pasado, el doble'];
    this.state = {
      now : '2019-01-05',
      cercanos: true 
    };
  }

  toggleNears(){
    this.setState(prevState => (
      {cercanos: !prevState.cercanos}
    ))
  }

  render() {
    let itemList = [];
    for(i=0; i< this.dataList.length; i++){
      itemList.push(
        <ListItem style={styles.listItem} onPress={() => this.props.navigation.navigate('Activities')} key={this.dataList[i]}>
          <Text>{this.dataList[i]}</Text>
        </ListItem>
      )
    }

    return (
      <Container>
        <Header>
          <Text style={styles.header}>Agenda</Text>
        </Header>
        <Content>
          <Form>
            <Item inlineLabel>
              <Label>Fecha</Label>
              <Input value={this.state.now} editable={false}/>
            </Item>
            <Item inlineLabel>
              <Label>Cercanos</Label>
              <CheckBox checked={this.state.cercanos} onPress={() => {this.toggleNears()}}/>
            </Item>
          </Form>
          <Item style={styles.listContainer}>
            <List style={styles.list}>
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