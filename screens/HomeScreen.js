import React from 'react';
import { Container, Header, Content, Icon, Text, Button, Item,
        Form, Input, Label, Left, Spinner, Body, Right, Title, Card, CardItem, Thumbnail, } from 'native-base';
import {formatDate, formatDatePrint, getLocationAsync, getConfiguration} from '../utilities/utils';
import { Grid, Row, Col } from "react-native-easy-grid";
import { Image } from 'react-native';

import { TouchableHighlight, Modal, View, PermissionsAndroid, Platform } from 'react-native';

import moment from 'moment';

export default class HomeScreen extends React.Component { 
  constructor(props) {
    super(props);
    global.context = {};
    this.state = {
      user: '',
      lastSync : '',
      pendingSyncs : '',
      modalVisible: false,
      permission: '',
      configurationLoaded: false,
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

  setConfigurationLoaded(loaded) {
    this.setState({configurationLoaded: loaded})
  }

  async checkConfiguration() {
    let requiredFields = [
      "USER_NAME","USER_EMAIL","URL_BACKEND","USER_BACKEND",
      "PASS_BACKEND","PROXIMITY_RANGE","SHIPMENTS_SHOW","PROJECTION_AGENDA",
      "CONSULTANT_NUM"
    ];
    
    let promises = [];
    for(i=0; i<requiredFields.length; i++) {
      promises.push(getConfiguration(requiredFields[i]));
    }

    let values = await Promise.all(promises)
      .catch(err => {
        console.error(err)
      })
    for(i=0; i<values.length; i++) {
      if(values[i] == null) {
        this.setConfigurationLoaded(true);
        return
      }
    }
    this.setConfigurationLoaded(false);
    return;
  }

  // Metodo donde llamar a los WS iniciales
  componentDidMount() {
    this.getUserInfo()

    this.checkPermissionGeolocation();
    this.checkConfiguration();

  }

  getUserInfo(){
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

  refresh() {
    this.getUserInfo();
    this.checkPermissionGeolocation();
    this.checkConfiguration();
  }

  goToConfiguration() {
    this.setConfigurationLoaded(false);
    this.props.navigation.navigate('Configuration', {onGoBack: () => this.refresh()});
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
          visible={this.state.modalVisible || this.state.configurationLoaded}
          onRequestClose={() => {
            Alert.alert('Configuración de geolocalización verificada.');
          }}>
          <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#F08377', padding: 100 }}>
              <Text>Para que esta aplicación funcione necesita permisos de acceso a Geolocalización y tener cargada la configuración. Por favor verifique para continuar</Text>

              <Button
                onPress={() => {
                  this.checkPermissionGeolocation();
                }}>
                <Icon name='map-marker'/>
                <Text>Verificar Geolocalización</Text>
              </Button>

              <Button
                onPress={() => {
                  this.goToConfiguration();
                }}>
                <Icon name='cog'/>
                <Text>Verificar Configuración</Text>
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
              onPress={() => this.goToConfiguration()}
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