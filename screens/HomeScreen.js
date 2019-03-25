import React from 'react';
import { Container, Header, Content, Icon, Text, Button, Item,
        Form, Input, Label, Left, Spinner, Body, Right, Title, Card, CardItem, Thumbnail, } from 'native-base';
import {formatDate, getLocationAsync} from '../utilities/utils';
import { Grid, Row, Col } from "react-native-easy-grid";
import { Permissions } from 'expo';

//const DB = Expo.SQLite.openDatabase('relevamiento.db');

export default class HomeScreen extends React.Component { 
  constructor() {
    super();
    global.context = {};
    this.state = {
      user: '',
      lastSync : '',
      pendingSyncs : '',
      locationAllowed: false
    };    
  }

  // Metodo donde llamar a los WS iniciales
  componentDidMount() {
    
    /* Consulto permisos de localización para activar los botones */
    getLocationAsync()
      .then(loc => {
        this.state.locationAllowed = true;
      })
      .catch(err => {
        this.state.locationAllowed = false;
      })

    global.DB.transaction(tx => {
      tx.executeSql(
        ` select u.* , 
            (SELECT count(a.id) 
              from activity a 
              where a.state != 'Completa'
            ) as pendingSyncs 
          from User u;`,
        [],
        (_, { rows }) => {
          //Me quedo con el primer usuario que encuentro para probar
          var loggedUser = rows._array[0];
          global.context['user'] = loggedUser;
          this.setState ({
            user: loggedUser
          });
        },
        (_, err) => {
          console.error(`ERROR consultando DB: ${err}`)
        }
      )
    });   
  }

  render() {

    let formItem;
    if(this.state.user == ''){
      formItem = <Spinner />
    } else {
      formItem =  <Card style={{flex: 0}}>
                    <CardItem>
                      <Left>
                        <Icon active name="user" />
                        <Body>
                          <Text>{this.state.user.email}</Text>
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
                          <Text note>[{this.state.user.pendingSyncs}] Contactos</Text>
                        </Body>
                      </Left>
                    </CardItem>
                    <CardItem>
                      <Left>
                        <Button transparent textStyle={{color: '#87838B'}}>
                          <Icon name="retweet" />
                          <Text style={{fontSize: 12}}>Ultima Sincronización {this.state.user.lastSync}</Text>
                        </Button>
                      </Left>
                    </CardItem>
                  </Card>
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
            <Button transparent block style={{flex: 1}} 
              onPress={() =>  
                this.state.locationAllowed ? 
                this.props.navigation.navigate('Schedule') : 
                alert("Sin permisos")}
            >
              <Icon name='list-alt' style={{fontSize: 60, color: 'white'}}/>
            </Button>
            </Col>
            <Col>
            <Button transparent block style={{flex: 1}} 
              onPress={() =>  
                this.state.locationAllowed ? 
                this.props.navigation.navigate('Contacts', {user: this.state.user}) : 
                alert("Sin permisos")}
            >
              <Icon name='address-book' style={{fontSize: 60, color: 'white'}}/>
            </Button>
            </Col>
          </Row>
          <Row  style={{ height: 120 }}>
            <Col>
            <Button transparent block style={{flex: 1}} 
              onPress={() =>  
                this.state.locationAllowed ? 
                this.props.navigation.navigate('Configuration') : 
                alert("Sin permisos")}
            >
              <Icon name='cog' style={{fontSize: 60, color: 'white'}}/>
            </Button>
            </Col>
            <Col>
            <Button transparent block style={{flex: 1}} 
              onPress={() =>  
                this.state.locationAllowed ? 
                this.props.navigation.navigate('Sincronize') : 
                alert("Sin permisos")}
            >
              <Icon name='retweet' style={{fontSize: 60, color: 'white'}}/>
            </Button>
            </Col>
          </Row>
        </Grid>

          {formItem}

        </Content>
      </Container>
    );
  }
}