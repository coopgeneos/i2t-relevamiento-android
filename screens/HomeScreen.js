import React from 'react';
import { Container, Header, Content, Icon, Text, Button, Item,
        Form, Input, Label, Left, Spinner, Body, Right, Title, Card, CardItem, Thumbnail, } from 'native-base';
import {formatDate} from '../utilities/utils';
import { Grid, Row, Col } from "react-native-easy-grid";

//const DB = Expo.SQLite.openDatabase('relevamiento.db');

export default class HomeScreen extends React.Component { 
  constructor() {
    super();
    global.context = {}
    this.state = {
      user: '',
      lastSync : '',
      pendingSyncs : ''
    };    
  }

  // Metodo donde llamar a los WS iniciales
  componentDidMount() {
    global.DB.transaction(tx => {
      tx.executeSql(
        ` select u.*, count(s.id) as pendingSyncs 
          from user u
          inner join schedule s on (u.id =s.user_id)
          where s.state != 'Completa'`,
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
                          <Text style={{fontSize: 12}}>Ultima Sincronización {formatDate(this.state.user.lastSync)}</Text>
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
            <Button transparent onPress={() => this.props.navigation.navigate('Schedule')} block style={{flex: 1}}>
              <Icon name='list-alt' style={{fontSize: 60, color: 'white'}}/>
            </Button>
            </Col>
            <Col>
            <Button transparent onPress={() => this.props.navigation.navigate('Contacts', {user: this.state.user})} block style={{flex: 1}}>
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

          {formItem}

        </Content>
      </Container>
    );
  }
}