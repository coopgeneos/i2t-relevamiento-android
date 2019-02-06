import React from 'react';

import { Container, Header, Content, Footer, FooterTab, Text, Button, Spinner,
          Icon, Form, Item, Label, Input, Left, Title, Body, Right, Card, CardItem, IconNB,
          DeckSwiper, Thumbnail, List, ListItem, Radio, Segment} from 'native-base';

import { StyleSheet, Image, View, TouchableOpacity, Alert, ListView, ScrollView} from 'react-native';
import { ImagePicker } from 'expo';

import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';

import AppConstants from '../constants/constants'
import { Divider } from 'react-native-elements';

export default class ContactActScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      seg: 1
    }
  };

  componentDidMount() {
    //simulo al WS
    setTimeout(() => {
      let response = {
        ext_img_uri: ''
      };
      this.setState ({
        ext_img_uri: 'http://www.ellitoral.com/diarios/2011/09/29/sucesos/SUCE-02-web-images/3_dc_fmt.jpeg',
        int_img_uri: AppConstants.PHOTO_DEFAULT,
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

  pickImage = async (callFrom) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.cancelled) {
      switch(callFrom){
        case 'exterior':
          this.setState({ ext_img_uri: result.uri });
          break;
        case 'interior':
          this.setState({ int_img_uri: result.uri });
          break;
      }  
    }
  };

  render() {
    const state = this.state;

    const cardOne = require("../assets/icon.png");
    const cardTwo = require("../assets/icon.png");
    const cardThree = require("../assets/icon.png");
    const cardFour = require("../assets/icon.png");

    const { navigation } = this.props;
    const extImg = navigation.getParam('extImg', null);
    const intImg = navigation.getParam('intImg', null);

    let cards = [
      {
        text: "Foto de Frente",
        info: <CardItem>
                <Left>
                  <Image style={{width: 150, height: 150}} 
                    source={{uri: extImg ? extImg : (this.state.ext_img_uri ? this.state.ext_img_uri : AppConstants.PHOTO_DEFAULT) }} />
                </Left>
                <Body></Body>
                <Right>
                  <Button transparent onPress={() => this.props.navigation.navigate('Camera', {callFrom: 'exterior'})}  style={{fontSize: 32}}>
                    <Icon name='camera'/>
                  </Button>
                  <Button transparent onPress={() => {this.pickImage('exterior')}}  style={{fontSize: 32}}>
                    <Icon name='folder'/>
                  </Button>
                </Right>
              </CardItem>,
        image: cardOne
      },
      {
        text: "Foto de Interior",
        info: <CardItem>
                <Left>
                  <Image style={{width: 150, height: 150}} 
                    source={{uri: intImg ? intImg : (this.state.int_img_uri ? this.state.int_img_uri : AppConstants.PHOTO_DEFAULT) }} />
                </Left>
                <Body></Body>
                <Right>
                  <Button transparent onPress={() => this.props.navigation.navigate('Camera', {callFrom: 'interior'})}  style={{fontSize: 32}}>
                    <Icon name='camera'/>
                  </Button>
                  <Button transparent onPress={() => {this.pickImage('interior')}}  style={{fontSize: 32}}>
                    <Icon name='folder'/>
                  </Button>
                </Right>
              </CardItem>,
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

    const contact = navigation.getParam('agency', 'SIN CONTACTO');
    const address = navigation.getParam('address', 'SIN DOMICILIO');
    const city = navigation.getParam('city', 'SIN CONTACTO');
    const detail = navigation.getParam('detail', 'SIN DETALLE');

    var areData = this.state.ext_img_uri ? true : false

    console.log("Leña para el carbón: " + this.state.seg);

    return (
      <Container>
        <HeaderNavBar navigation={this.props.navigation}  title="Relevamiento" />
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
              (<Spinner />)
              : (
                <View style={styles.container}>

                <Segment>
                  <Button
                    last
                    active={this.state.seg === 1 ? false : true}
                    onPress={() => this.setState(prevState => ({seg: prevState.seg - 1}))}
                    disabled={this.state.seg === 1 ? true : false}
                  >
                    <Icon name="arrow-circle-left" />
                  </Button>
                  <Button
                    first
                    active={this.state.seg === 4 ? false : true}
                    disabled={this.state.seg === 4 ? true : false}
                    onPress={() => this.setState(prevState => ({seg: prevState.seg + 1}))}
                  >
                    <Text>OMITIR</Text>
                  </Button>
                  <Button
                    first
                    active={this.state.seg === 4 ? false : true}
                    disabled={this.state.seg === 4 ? true : false}
                    onPress={() => this.setState(prevState => ({seg: prevState.seg + 1}))}
                  >
                    <Icon name="save" />
                    <Icon name="arrow-circle-right" />
                  </Button>

                </Segment>
                <Content padder>
                  {this.state.seg === 1 && cards[0].info}
                  {this.state.seg === 2 && cards[1].info}
                  {this.state.seg === 3 && cards[2].info}
                  {this.state.seg === 4 && cards[3].info}
                </Content>

                </View>
              )
          }
          
        </Content>
        
        <FooterNavBar navigation={this.props.navigation} />

      </Container>
    );
  }  
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", marginBottom: 80, padding: 16, paddingTop: 20, backgroundColor: '#fff' },
  head: { height: 40, backgroundColor: '#94A6B5' },
  text: { margin: 6 },
  row: { flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#94A6B5', height: 40 },
  cellAction: { margin: 6, width: 100 },
  btn: { height: 28, backgroundColor: '#F08377',  borderRadius: 2, fontSize: 12},
  btn_cont: { flexDirection: 'row'},
  btn_card: { flexDirection: 'row', justifyContent: 'space-around' },
  btnText: { textAlign: 'center', color: '#fff' }
});