import React from 'react';
import { Container, Header, Content, Footer, FooterTab, Text, 
         Button, Icon, CheckBox, List, ListItem, Form, Item, Label,
         Input } from 'native-base';
import MapView from 'react-native-maps';

import styles from "./Styles";

export default class MapScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      region: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
    };
  }

  getInitialState() {
    return {
      region: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
    };
  }
  
  onRegionChange(region) {
    this.setState({ region });
  }

  render() {
    return (
      <Container>
        <Header>
          <Text style={styles.header}>Mapa</Text>
        </Header>
        <Content>
          <MapView
            region={this.state.region}
            onRegionChange={this.onRegionChange}
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