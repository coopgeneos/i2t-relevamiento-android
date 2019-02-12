import React from 'react';

import { Container, Header, Content, Footer, FooterTab, Text, Button, Spinner,
          Icon, Form, Item, Label, Input, Left, Title, Body, Right, Card, CardItem, IconNB,
          DeckSwiper, Thumbnail, List, ListItem, Radio, Segment} from 'native-base';

import { StyleSheet, Image, View, TouchableOpacity, Alert, ListView, ScrollView} from 'react-native';
import { ImagePicker, Permissions, FileSystem } from 'expo';

import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';

import AppConstants from '../constants/constants'
import { Divider } from 'react-native-elements';

export default class ContactActScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      seg: 1,
      seg_max: null,
      activity_id: this.props.navigation.getParam('activity_id', null),
      cardsData: null,
      cards: [],
      answers: null,
      permissionsCamera: false,
      permissionsCameraRoll: false
    }
  };

  componentDidMount() {
    var acttype_id = this.props.navigation.getParam('acttype_id', null);
    global.DB.transaction(tx => {
      tx.executeSql(
        ` select iat.id as itemActType_id, iat.activityType_id, iat.description, iat.type, a.id as answer_id, a.activity_id, a.text_val, a.img_val 
          from ItemActType iat 
          left join Answer a on (iat.id = a.itemActType_id) 
          where iat.activityType_id = ?`,
        [acttype_id],
        (_, { rows }) => {
          this.loadCards(rows._array, true)
          this.setState ({
            cardsData: rows._array,
            seg_max: rows._array.length + 1
          });
        },
        (_, err) => {
          console.error(`ERROR consultando DB: ${err}`)
        }
      )
    });
  }

  async loadCards(data, firstTime) {
    var cards = [];
    
    var answers = this.state.answers;
    /*Si es la primera vez que entro (cuando creo la vista), 
      entonces creo en memoria el arreglo de respuestas*/
    if(firstTime) {
      answers = [];
    }
    
    for(i=0; i<data.length; i++) {
      var item = data[i];
      var card = null;
      if(firstTime){
        if(item.img_val){
          var name = new Date();
          name = name.getTime().toString()
          FileSystem.writeAsStringAsync(`${FileSystem.documentDirectory}photos/${name}.jpg`, item.img_val, {encoding: FileSystem.EncodingTypes.Base64})
            .catch(err => {
              console.log(`ERROR creando archivo temporal: ${err}`)
            })
          item.img_val = `${FileSystem.documentDirectory}photos/${name}.jpg`;
        }

        var answer = {
          id: item.answer_id, //Si answer_id viene en null, es porque nunca se respondió.
          activity_id: this.state.activity_id,
          itemActType_id: item.itemActType_id,
          text_val: item.text_val,
          img_val: item.img_val,
          img_val_change: false
        }
        answers.push(answer);
      }
      if(item.type == 'lista') {
        card = await this.buildListCard(item.description, answers[i])
          .catch(err => {
            reject(err)
          })
      }
      if(item.type == 'imagen') {
        card = this.buildImageCard(item.description, answers[i])
          
      }
      cards.push(card);
    }
    /*Promise.all(promises)
      .then(values => {
        values.forEach(item => {
          cards.push(item)
        })
      })*/ 
    this.setState({
      cards: cards,
      answers: answers
    });
    return;
  }

  _alertIndex(index) {
    Alert.alert(`This is row ${index + 1}`);
  }

  async grantPermissions() {
    var statusCameraRoll = null;
    var statusCamera = null;
    if(!this.state.permissionsCameraRoll){
      statusCameraRoll = await Permissions.askAsync(Permissions.CAMERA_ROLL)
        .catch(err => {
          console.log(`PERMISSION ERROR: ${err}`)
        })
    }
    if(!this.state.permissionsCamera){
      statusCamera = await Permissions.askAsync(Permissions.CAMERA)
        .catch(err => {
          console.log(`PERMISSION ERROR: ${err}`)
        })
    }
    this.setState({ 
      permissionsCameraRoll: statusCameraRoll === 'granted', 
      permissionsCamera: statusCamera === 'granted'});
    return (statusCameraRoll && statusCamera)
  }

  async pickImage(takePhoto) {
    if(this.grantPermissions()){
      let result = null;
      if(takePhoto){
        result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
        });
      }
      if (!result.cancelled) {
        this.state.answers[this.state.seg - 1].img_val = result.uri;
        this.state.answers[this.state.seg - 1].img_val_change = true;
        this.loadCards(this.state.cardsData, false);
      }
    }
  };

  async saveAnswer() {
    var answer = this.state.answers[this.state.seg - 1];
    var base64 = null;
    if(answer.img_val && answer.img_val_change){ //Solo se guarda si
      base64 = await FileSystem.readAsStringAsync(answer.img_val, {encoding: FileSystem.EncodingTypes.Base64})
        .catch(err => {
          console.log(`ERROR LEYENDO COMO BASE 64: ${err}`);
        })
    }

    var sql = '';
    if(answer.id){
      var upd_img = '';
      if(answer.img_val_change){
        upd_img = `img_val = '${base64}',`
      }
      sql = `update Answer set ${upd_img} text_val = '${answer.text_val}' where id = ${answer.id}`;
    } else {
      sql = `insert into Answer (activity_id, itemActType_id, text_val, img_val) values (${answer.activity_id}, ${answer.itemActType_id}, '${answer.text_val}', '${base64}')`;
    }
    
    global.DB.transaction(tx => {
      tx.executeSql(
        sql,
        [],
        (_, { rows }) => {},
        (_, err) => {
          console.error(`ERROR consultando DB: ${err}`)
        }
      )
    });
    this.setState(prevState => ({seg: prevState.seg + 1}))
  }

  buildImageCard(title, answer) {
    return {
      text: title,
      info: <CardItem>
              <Left>
                <Image style={{width: 150, height: 150}} 
                  source={{ uri: answer.img_val ? answer.img_val : AppConstants.PHOTO_DEFAULT }} />
              </Left>
              <Body></Body>
              <Right>
                <Button transparent onPress={() => this.pickImage(true)}  style={{fontSize: 32}}>
                  <Icon name='camera'/>
                </Button>
                <Button transparent onPress={() => {this.pickImage(false)}}  style={{fontSize: 32}}>
                  <Icon name='folder'/>
                </Button>
              </Right>
            </CardItem>
    }
  }

  buildListCard(title, answer) {
    return new Promise(async (resolve, reject) => {
      let listItems = [];
      global.DB.transaction(tx => {
        tx.executeSql(
          ` select * 
            from ListItemAct 
            where itemActType_id = ?`,
          [answer.itemActType_id],
          (_, { rows }) => {
            var r = rows._array
            r.forEach(reg => {
              listItems.push(
                <ListItem key={reg.value}>
                  <Left>
                    <Text>{reg.value}</Text>
                  </Left>
                  <Right>
                    <Radio
                      selected={answer.text_val == reg.value ? true : false }
                      onPress={() => {this.chooseOption(reg.value)}}
                    />
                  </Right>
                </ListItem>
              )
            })
            resolve({
              text: title,
              info: <View>
                      {listItems}
                    </View>         
            })
          },
          (_, err) => {
            console.error(`ERROR consultando DB: ${err}`)
            reject(err)
          }
        )
      });
    })
  }

  chooseOption(value, index) {
    this.state.answers[this.state.seg - 1].text_val = value;
    this.loadCards(this.state.cardsData, false)
  }

  render() {
    const { navigation } = this.props;
    const contact = navigation.getParam('agency', 'SIN CONTACTO');
    const address = navigation.getParam('address', 'SIN DOMICILIO');
    const city = navigation.getParam('city', 'SIN CIUDAD');
    const detail = navigation.getParam('detail', 'SIN DETALLE');

    var isThereData = this.state.cardsData ? true : false;

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
            !isThereData ? 
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
                    active={this.state.seg === this.state.seg_max ? false : true}
                    disabled={this.state.seg === this.state.seg_max ? true : false}
                    onPress={() => this.setState(prevState => ({seg: prevState.seg + 1}))}
                  >
                    <Text>OMITIR</Text>
                  </Button>
                  <Button
                    first
                    active={this.state.seg === this.state.seg_max ? false : true}
                    disabled={this.state.seg === this.state.seg_max ? true : false}
                    onPress={() => this.saveAnswer()}
                  >
                    <Icon name="save" />
                    <Icon name="arrow-circle-right" />
                  </Button>

                </Segment>
                <Content padder>                  
                  {this.state.cards.length > 0 && this.state.cards[this.state.seg - 1] && this.state.cards[this.state.seg - 1].info}                
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