import React from 'react';
//import { View, Text, Button } from 'react-native';
//import { StackActions, NavigationActions } from 'react-navigation';
import { Container, Header, Content, Icon, Text, Button } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';

import styles from "./Styles"

export default class HomeScreen extends React.Component { 
  constructor() {
    super();
    this.state = {
      locura: 'Agenda'
    };
  }
  
  render() {
    return (
      <Container>
        <Header>
          <Text style={styles.header}>Este seria el header</Text>
        </Header>
        <Content >
          <Grid style={{alignItems: 'center'}}>
            <Col >
              <Row >
                <Button iconLeft transparent block onPress={() => this.props.navigation.navigate('Schedule')}>
                  <Icon name='calendar' />
                  <Text>Agenda</Text>
                </Button>
              </Row>
              <Row>
                <Button iconRight transparent block onPress={() => this.props.navigation.navigate('Contacts')}>
                  <Text>Contactos</Text>
                  <Icon name='contact'/>
                </Button>
              </Row>
            </Col>
            <Col>
              <Row>
                <Button iconLeft transparent block onPress={() => alert('No hago nada')}>
                  <Icon name='settings' />
                  <Text>Configuracion</Text>
                </Button>
              </Row>
              <Row>
                <Button iconRight transparent block onPress={() => alert('No hago nada')}>      
                  <Text>Sincronizacion</Text>
                  <Icon name='sync' />
                </Button>
              </Row>
            </Col>
          </Grid>
        </Content>
      </Container>
    );
  }  
}