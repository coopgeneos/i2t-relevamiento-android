import React from 'react';
import { Container, Header, Content, Icon, Text, Button, Item,
         Form, Input, Label } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';

import styles from "./Styles"

export default class HomeScreen extends React.Component { 
  constructor() {
    super();
    this.state = {
      user: 'Luis Segundo',
      lastSync: '2019-01-05 10:55',
      pendingSyncs: '5'
    };
  }
  
  /*render() {
    return (
      <Container>
        <Header>
          <Text style={styles.header}>Este seria el header</Text>
        </Header>
        <Content >
          <Grid style={styles.homeContainerIcons}>
            <Col>
              <Row >
                <Button iconCenter transparent block onPress={() => this.props.navigation.navigate('Schedule')}>
                  <Icon name='calendar' style={styles.homeButtonIcons}/>       
                </Button>
              </Row>
              <Row>
                <Button iconCenter transparent block onPress={() => this.props.navigation.navigate('Contacts')}>                 
                  <Icon name='contact' style={styles.homeButtonIcons}/>
                </Button>
              </Row>
            </Col>
            <Col>
              <Row>
                <Button iconCenter transparent block onPress={() => alert('No hago nada')}>
                  <Icon name='settings' style={styles.homeButtonIcons}/>                 
                </Button>
              </Row>
              <Row>
                <Button iconCenter transparent block onPress={() => alert('No hago nada')}>                      
                  <Icon name='sync' style={styles.homeButtonIcons}/>
                </Button>
              </Row>
            </Col>
          </Grid>
        </Content>
      </Container>
    );
  }*/
  
  render() {
    return (
      <Container>
        <Header>
          <Text style={styles.header}>App's de Relevamiento</Text>
        </Header>
        <Content>
          <Item style={styles.homeContainerIcons}>
            <Button style={styles.homeButton} transparent onPress={() => this.props.navigation.navigate('Schedule')}>
              <Icon name='calendar' style={styles.homeButtonIcons}/>       
            </Button>
            <Button style={styles.homeButton} transparent onPress={() => this.props.navigation.navigate('Contacts')}>                 
              <Icon name='contact' style={styles.homeButtonIcons}/>
            </Button>
            <Button style={styles.homeButton}  transparent onPress={() => alert('No hago nada')}>
              <Icon name='settings' style={styles.homeButtonIcons}/>                 
            </Button>       
            <Button style={styles.homeButton} transparent onPress={() => alert('No hago nada')}>                      
              <Icon name='sync' style={styles.homeButtonIcons}/>
            </Button>
          </Item>
          <Form>
            <Item inlineLabel>
              <Label>Usuario</Label>
              <Input value={this.state.user} editable={false} style={{textAlign: 'right'}}/>
            </Item>
            <Item inlineLabel>
              <Label>Ultima sincronización</Label>
              <Input value={this.state.lastSync} editable={false}/>
            </Item>
            <Item inlineLabel last>
              <Label>Pendientes sincronización</Label>
              <Input value={this.state.pendingSyncs} editable={false}/>
            </Item>
          </Form>
        </Content>
      </Container>
    );
  }
}