import React from 'react';
import { Container, Header, Content, Icon, Text, Button, Item,
        Form, Input, Label, Left, Spinner, Body, Right, Title, Card, CardItem, Thumbnail, } from 'native-base';
import {formatDate, formatDatePrint, getLocationAsync} from '../utilities/utils';
import { Grid, Row, Col } from "react-native-easy-grid";
import { Image } from 'react-native';

import { TouchableHighlight, Modal, View, PermissionsAndroid, Platform } from 'react-native';

import moment from 'moment';

export default class HomeScreen extends React.Component { 
  constructor() {
    super();
    global.context = {};
    this.state = {
      user: '',
      lastSync : '',
      pendingSyncs : '',
      modalVisible: false,
      permission: ''
    };    
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  checkPermissionGeolocation() {
    getLocationAsync()
      .then(loc => {
          checkPermission = () => {
          navigator.geolocation.getCurrentPosition(
            () => this.setState({permission: 'GRANTED'}),
            () => this.setState({permission: 'DENIED'})
          );
        }
        if(this.state.permission === 'DENIED') {
          this.setModalVisible(true);
        } else {
          this.setModalVisible(false);
        }
      })
      .catch(err => {
        console.info("Location active");
        this.setModalVisible(true);
      })
  }

  // Metodo donde llamar a los WS iniciales
  componentDidMount() {

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

    this.checkPermissionGeolocation();

  }

  render() {

    let formItem;
    if(this.state.user == ''){
      formItem = <Spinner />
    } else {
      formItem =  <Card style={{flex: 0}}>
                    <CardItem>
                      <Left>
                        <Icon active name="user" style={{ color: '#65727B'}} />
                        <Body>
                          <Text>{this.state.user.email}</Text>
                          <Text note>Info del Usuario</Text>
                        </Body>
                      </Left>
                    </CardItem>
                    <CardItem>
                      <Left>
                        <Icon active name="bookmark" style={{ color: '#65727B'}} />
                        <Body>
                          <Text>
                            Pendientes de Sincronización 
                          </Text>
                          <Text note>[{this.state.user.pendingSyncs}] Relevamientos</Text>
                        </Body>
                      </Left>
                    </CardItem>
                    <CardItem>
                      <Left>
                        <Button transparent textStyle={{color: '#87838B'}}>
                          <Icon name="retweet" />
                          <Text style={{fontSize: 12}}>Ultima Sincronización {formatDatePrint(this.state.user.lastSync)}</Text>
                        </Button>
                      </Left>
                    </CardItem>
                  </Card>
    }

    return (
      <Container>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert('Configuración de geolocalización verificada.');
          }}>
          <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#F08377', padding: 100 }}>
              <Text>Permisos de acceso a Geolocalización desactivados. Por favor verifique para continuar</Text>

              <Button
                onPress={() => {
                  this.checkPermissionGeolocation();
                }}>
                <Icon name='map-marker'/>
                <Text>Verificar Geolocalización</Text>
              </Button>
          </View>
        </Modal>
        <Header>
          <Left style={{width: 200}}>
            <Button transparent>
            <Image source={require("../assets/i2tbco.png")} style={{width: 193, height: 80}} />
            </Button>
          </Left>
          <Right>
            <Title></Title>
          </Right>
        </Header>
        <Content style={{padding: 10}}>
        <Grid style={{ alignItems: 'center', backgroundColor: "#65727B" }}>
          <Row  style={{ height: 120 }}>
            <Col>
            <Button transparent block style={{flex: 1}} 
              onPress={() => this.props.navigation.navigate('Schedule')}
            >
              <Icon name='list-alt' style={{fontSize: 60, color: 'white'}}/>
            </Button>
            </Col>
            <Col>
            <Button transparent block style={{flex: 1}} 
              onPress={() => this.props.navigation.navigate('Contacts', {user: this.state.user})}
            >
              <Icon name='address-book' style={{fontSize: 60, color: 'white'}}/>
            </Button>
            </Col>
          </Row>
          <Row  style={{ height: 120 }}>
            <Col>
            <Button transparent block style={{flex: 1}} 
              onPress={() => this.props.navigation.navigate('Configuration')}
            >
              <Icon name='cog' style={{fontSize: 60, color: 'white'}}/>
            </Button>
            </Col>
            <Col>
            <Button transparent block style={{flex: 1}} 
              onPress={() => this.props.navigation.navigate('Sincronize')}
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