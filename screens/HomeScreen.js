import React from 'react';
import { Container, Header, Content, Icon, Text, Button, Item,
        Form, Input, Label, Left, Spinner, Body, Right, Title, Card, CardItem, Thumbnail, } from 'native-base';
import { StyleSheet, Image, View, TouchableOpacity, Alert, ListView, ScrollView} from 'react-native';
import {formatDate} from '../utilities/utils';

import { Grid, Row, Col } from "react-native-easy-grid";
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
        lastSync: loggedUser.lastSync,
        pendingSyncs: loggedUser.pendingSyncs.toString(),
        completeName: loggedUser.name+' '+loggedUser.lastName,
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
                    <Left><Input value={formatDate(this.state.lastSync)} editable={false}/></Left>
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
          <Left>
            <Button transparent>
              <Icon name='yelp' style={{fontSize: 34, color: 'white'}}/>
            </Button>
          </Left>
          <Body>
            <Title>Relevamiento</Title>
          </Body>
        </Header>
        <Content style={{padding: 10}}>
        <Grid style={{ alignItems: 'center', backgroundColor: "#534D64" }}>
          <Row  style={{ height: 120 }}>
            <Col>
            <Button transparent onPress={() => this.props.navigation.navigate('Schedule')} block style={{flex: 1}}>
              <Icon name='list-alt' style={{fontSize: 60, color: 'white'}}/>
            </Button>
            </Col>
            <Col>
            <Button transparent onPress={() => this.props.navigation.navigate('Contacts')} block style={{flex: 1}}>
              <Icon name='address-book' style={{fontSize: 60, color: 'white'}}/>
            </Button>
            </Col>
          </Row>
          <Row  style={{ height: 120 }}>
            <Col>
            <Button transparent onPress={() => this.props.navigation.navigate('Configuration')} block style={{flex: 1}}>
              <Icon name='cog' style={{fontSize: 60, color: 'white'}}/>
            </Button>
            </Col>
            <Col>
            <Button transparent onPress={() => this.props.navigation.navigate('Sincronize')} block style={{flex: 1}}>
              <Icon name='retweet' style={{fontSize: 60, color: 'white'}}/>

            </Button>
            </Col>
          </Row>
        </Grid>

          <Card style={{flex: 0}}>
            <CardItem>
              <Left>
                <Icon active name="user" />
                <Body>
                  <Text>{this.state.user}</Text>
                  <Text note>Info del Usuario</Text>
                </Body>
              </Left>
            </CardItem>
            <CardItem>
              <Left>
                <Icon active name="bookmark" />
                <Body>
                  <Text>
                  Pendientes de Sincronización 
                  </Text>
                  <Text note>[{this.state.pendingSyncs}] Contactos</Text>
                </Body>
              </Left>
            </CardItem>
            <CardItem>
              <Left>
                <Button transparent textStyle={{color: '#87838B'}}>
                  <Icon name="retweet" />
                  <Text style={{fontSize: 12}}>Ultima Sincronización {formatDate(this.state.lastSync)}</Text>
                </Button>
              </Left>
            </CardItem>
          </Card>
        </Content>
      </Container>
    );
  }
}