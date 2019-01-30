import React from 'react';

import { Container, Header, Content, Footer, FooterTab, Text, Button, Spinner,
          Icon, Form, Item, Label, Input, Left, Title, Body, Right, Card, CardItem, IconNB,
          DeckSwiper, Thumbnail, List, ListItem, Radio} from 'native-base';

import { StyleSheet, Image, View, TouchableOpacity, Alert, ListView, ScrollView} from 'react-native';

export default class ContactActScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  };

  componentDidMount() {
    //simulo al WS
    setTimeout(() => {
      let response = {
        ext_img_uri: ''
      };
      this.setState ({
        ext_img_uri: 'https://cdn.dribbble.com/users/634336/screenshots/2246883/_____.png',
        int_img_uri: 'https://cdn.dribbble.com/users/634336/screenshots/2246883/_____.png',
        display_use: 'No usa',
        space_use: '50-50'
      });
    }, 1500);
  }

  setDisplay(value){
    this.setState({display_use: value})
  }

  setSpace(value){
    this.setState({space_use: value})
  }

  _alertIndex(index) {
    Alert.alert(`This is row ${index + 1}`);
  }

  render() {
    const state = this.state;

    const cardOne = require("../assets/icon.png");
    const cardTwo = require("../assets/icon.png");
    const cardThree = require("../assets/icon.png");
    const cardFour = require("../assets/icon.png");

    let cards = [
      {
        text: "Foto de Frente",
        info: <CardItem><Image style={{width: 150, height: 150}} source={{uri: this.state.ext_img_uri ? this.state.ext_img_uri : 'https://cdn.dribbble.com/users/634336/screenshots/2246883/_____.png'}} /></CardItem>,
        image: cardOne
      },
      {
        text: "Foto de Interior",
        info: <CardItem><Image style={{width: 150, height: 150}} source={{uri: this.state.int_img_uri ? this.state.int_img_uri : 'https://cdn.dribbble.com/users/634336/screenshots/2246883/_____.png'}} /></CardItem>,
        image: cardTwo
      },
      {
        text: "Uso de Display",
        info: <View>
                <ListItem>
                  <Left>
                    <Text>No usa.</Text>
                  </Left>
                  <Right>
                    <Radio
                      selected={this.state.display_use === 'No usa' ? true : false }
                      onPress={() => this.setDisplay('No usa')}
                    />
                  </Right>
                </ListItem>
                <ListItem>
                  <Left>
                    <Text>Usa el de CAS.</Text>
                  </Left>
                  <Right>
                    <Radio
                      selected={this.state.display_use === 'Usa CAS' ? true : false }
                      onPress={() => this.setDisplay('Usa CAS')}
                    />
                  </Right>
                </ListItem>
                <ListItem>
                  <Left>
                    <Text>Usa uno propio.</Text>
                  </Left>
                  <Right>
                    <Radio
                      selected={this.state.display_use === 'Usa propio' ? true : false }
                      onPress={() => this.setDisplay('Usa propio')}
                    />
                  </Right>
                </ListItem>
              </View>,
        image: cardThree
      },
      {
        text: "Uso de Espacio",
        info: <View>
                <ListItem>
                  <Left>
                    <Text>100%</Text>
                  </Left>
                  <Right>
                    <Radio
                      selected={this.state.space_use == '100'}
                      onPress={() => this.setSpace('100')}
                    />
                  </Right>
                </ListItem>
                <ListItem>
                  <Left>
                    <Text>80% - 20%</Text>
                  </Left>
                  <Right>
                    <Radio
                      selected={this.state.space_use == '80-20'}
                      onPress={() => this.setSpace('80-20')}
                    />
                  </Right>
                </ListItem>
                <ListItem>
                  <Left>
                    <Text>50% - 50%</Text>
                  </Left>
                  <Right>
                    <Radio
                      selected={this.state.space_use == '50-50'}
                      onPress={() => this.setSpace('50-50')}
                    />
                  </Right>
                </ListItem>
                <ListItem>
                  <Left>
                    <Text>20% - 80%</Text>
                  </Left>
                  <Right>
                    <Radio
                      selected={this.state.space_use == '20-80'}
                      onPress={() => this.setSpace('20-80')}
                    />
                  </Right>
                </ListItem>
                <ListItem>
                  <Left>
                    <Text>Mínimo</Text>
                  </Left>
                  <Right>
                    <Radio
                      selected={this.state.space_use == '0'}
                      onPress={() => this.setSpace('0')}
                    />
                  </Right>
                </ListItem>
              </View>,
        image: cardFour
      }
    ];

    const { navigation } = this.props;
    const contact = navigation.getParam('agency', 'SIN CONTACTO');
    const address = navigation.getParam('address', 'SIN DOMICILIO');
    const city = navigation.getParam('city', 'SIN CONTACTO');
    const detail = navigation.getParam('detail', 'SIN DETALLE');

    var areData = this.state.ext_img_uri ? true : false

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
          <Right>
            <Button transparent onPress={() => this.props.navigation.navigate('Home')}  style={{fontSize: 32}}>
              <Icon name='home'/>
            </Button>
            <Button transparent onPress={() => this.props.navigation.navigate('Map')}   style={{fontSize: 32}}>
              <Icon name='map-marker'/>
            </Button>
          </Right>
        </Header>

        <Content>
          
          <Card>
            <CardItem header>                        
              <Text>Datos de Contacto</Text>
            </CardItem>

            <CardItem>                        
              <Label style={{ width: 80 }}>Contacto</Label><Text>{contact}</Text>
            </CardItem>
            <CardItem>                        
              <Label style={{ width: 80 }}>Domicilio</Label><Text>{address}</Text>
            </CardItem>
            <CardItem>                        
              <Label style={{ width: 80 }}>Ciudad</Label><Text>{city}</Text>
            </CardItem>
            <CardItem>                        
              <Label style={{ width: 80 }}>Detalle</Label><Text>{detail}</Text>
            </CardItem>

            <CardItem footer>                        
              <Text></Text>
            </CardItem>
          </Card>

          {
            !areData ? 
              (<Spinner color='blue'/>)
              : (
                <View style={{ height: 430, backgroundColor: '#778591', flex: 1, padding: 12 }}>
                  <DeckSwiper
                    ref={mr => (this._deckSwiper = mr)}
                    dataSource={cards}
                    looping={false}
                    renderEmpty={() =>
                      <View style={{ alignSelf: "center" }}>
                        <View>
                        <CardItem>
                        <Text style={{fontSize: 16}}>Fin del Relevamiento</Text>
                        </CardItem>
                        <CardItem>
                        <Text>(X) Items Completos - </Text><Text style={{color: '#F00'}}>(X) Items Incompletos</Text>
                        </CardItem>
                        <CardItem  style={styles.btn_card}>
                        <Button style={styles.btn} onPress={() => this.props.navigation.navigate('ContactAct')}>
                          <Text>Volver al Contacto</Text>
                          <Icon name="chevron-right" />
                        </Button>              
                        </CardItem>
                        </View>
                      </View>}
                    renderItem={item =>
                      <Card style={{ elevation: 3, height: 400 }}>
                        <CardItem>
                          <Left>
                            <Body>
                              <Text>
                                Consigna: {item.text}
                              </Text>
                            </Body>
                          </Left>
                        </CardItem>

                        {item.info}

                      <CardItem style={styles.btn_card}>
                        <Button style={styles.btn} onPress={() => this._deckSwiper._root.swipeLeft()}>
                          <Icon name="chevron-left" />
                        </Button>
                        <Button style={styles.btn} iconRight onPress={() => this._deckSwiper._root.swipeRight()}>
                          <Text>Omitir</Text>
                          <Icon name="chevron-right" />
                        </Button>
                        <Button style={styles.btn} onPress={() => this._deckSwiper._root.swipeRight()}>
                          <Icon name="save" />
                          <Icon name="chevron-right" />
                        </Button>              
                      </CardItem>
                      </Card>}
                  />
                </View>
              )
          }
          
        </Content>
        
        <Footer>
          <FooterTab>
            <Button vertical onPress={() => this.props.navigation.navigate('Schedule')}>
              <Icon name="tasks" />
              <Text>Agenda</Text>
            </Button>
            <Button vertical active>
              <Icon name="address-book" onPress={() => this.props.navigation.navigate('Contacts')}/>
              <Text>Contactos</Text>
            </Button>
            <Button vertical>
              <Icon active name="cog" />
              <Text>Config</Text>
            </Button>
            <Button vertical>
              <Icon name="retweet" />
              <Text>Sinc</Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }  
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 20, backgroundColor: '#fff' },
  head: { height: 40, backgroundColor: '#94A6B5' },
  text: { margin: 6 },
  row: { flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#94A6B5', height: 40 },
  cellAction: { margin: 6, width: 100 },
  btn: { height: 28, backgroundColor: '#F08377',  borderRadius: 2, fontSize: 12},
  btn_cont: { flexDirection: 'row'},
  btn_card: { flexDirection: 'row', justifyContent: 'space-around' },
  btnText: { textAlign: 'center', color: '#fff' }
});