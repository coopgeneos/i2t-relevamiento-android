import React from 'react';
import { Container, Header, Content, Footer, FooterTab, Text, Button, Icon, CheckBox, List, ListItem } from 'native-base';

export default class ScheduleScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      now : new Date(),
      dataList: ['Hoy a trabajar','Mañana tambien','Pasado, el doble','...']
    };
  }
  
  render() {
    return (
      <Container>
        <Header>
          <Text>Agenda</Text>
        </Header>
        <Content>
          <Text>Fecha: {this.state.now.toString()}</Text>
          <CheckBox checked={true} onPress={() => {alert('No hago naranja'); this.checked = !this.checked}}/>
          <Text>Cercanos</Text>
          <Text>DEBERIA SER ENCABEZADO AGENDA</Text>
          <List 
            dataArray={this.state.dataList}
            renderRow={(item) =>
              <ListItem onPress={() => this.props.navigation.navigate('Activities')}>
                <Text>{item}</Text>
              </ListItem>
            }
          >
          </List>
          <Button onPress={() => this.props.navigation.navigate('Home')}>
            <Text>Salir</Text>
          </Button>
          <Button onPress={() => alert('MAPA')}>
            <Text>Mapa</Text>
          </Button>
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