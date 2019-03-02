import React from 'react';

import { Container, Content, Text, Button, Spinner,
          Icon, Label, Left, Body, Right, Card, CardItem, IconNB,
          ListItem, Radio, Segment, TextInput, Textarea, Form, Item, Input} from 'native-base';

import {StyleSheet, Image, View, Alert, BackHandler, ToastAndroid } from 'react-native';
import { ImagePicker, Permissions, FileSystem } from 'expo';
import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';
import AppConstants from '../constants/constants'
import AwesomeAlert from 'react-native-awesome-alerts';
import {getConfiguration} from "../utilities/utils";

export default class SurveyScreen extends React.Component {
  /* 
  Estas 2 variables se usan para sobreescribir el funcionamiento del 
  boton back de android
  Ademas se agregaron las siguientes funcionalidades:
    * componentWillUnmount
    * onBackButtonPressAndroid
  y se modificaron:
    * Constructor
    * ComponentDidMount
  Mas info: https://reactnavigation.org/docs/en/custom-android-back-button-handling.html
  */
  _didFocusSubscription;
  _willBlurSubscription;

  constructor(props) {
    super(props);

    this.state = {
      seg: 1,
      seg_max: null,
      activity: this.props.navigation.getParam('activity', null),
      cardsData: null,
      cards: [],
      answers: null,
      permissionsCamera: false,
      permissionsCameraRoll: false,
      showAlert: false,
      mensaje: null,
      cant: 0,
      showButtonConfirm: false,
      buttonSaveEnable: false,
      notes: null,
      number: null,
    };

    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
      BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );

  };

  componentDidMount() {
    global.DB.transaction(tx => {
      tx.executeSql(
        ` select iat.id as itemActType_id, iat.activityType_id, iat.description, iat.type, 
          a.id as answer_id, act.id as activity_id, a.text_val, a.img_val, act.state
          from Activity act
          left join ItemActType iat on (iat.activityType_id = act.activityType_id)
          left join Answer a on (act.id = a.activity_id and iat.id = a.itemActType_id)
          where act.id = ?
          --group by act.id, iat.id `,
        [this.state.activity.id],
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

    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }

  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
  }

  onBackButtonPressAndroid = () => {
    this.goBack()
    return true;
  };

  async loadCards(data, firstTime) {
    var cards = [];
    var answers = this.state.answers;
    
    //si la activity esta cerrada, desactivo el button de grabar
    if (data[0].state === 'close'){
      this.setState ({
        buttonSaveEnable: true
      });
    }   
        
    /*Si es la primera vez que entro (cuando creo la vista), 
      entonces creo en memoria el arreglo de respuestas*/
    if(firstTime) {
      answers = [];
    }
    
    var card = null;

    for(i=0; i<data.length; i++) {
      var item = data[i];
      var activity_id = item.activity_id.toString();
      var itemActType_id = item.itemActType_id.toString();
            
      if(firstTime){
        if(item.img_val){
          var name = '';
          name = 'temp_' + activity_id + '_' + itemActType_id;
          FileSystem.writeAsStringAsync(`${AppConstants.TMP_FOLDER}/${name}.jpg`, item.img_val, {encoding: FileSystem.EncodingTypes.Base64})
            .catch(err => {
              console.log(`ERROR creando archivo temporal: ${err}`)
            })
          item.img_val = `${AppConstants.TMP_FOLDER}/${name}.jpg`;
        }

        var answer = {
          id: item.answer_id, //Si answer_id viene en null, es porque nunca se respondió.
          activity_id: item.activity_id,
          itemActType_id: item.itemActType_id,
          text_val: item.text_val,
          img_val: item.img_val,
          img_val_change: false,
          type: item.type,
        }
        answers.push(answer);

      }
      if(item.type === 'lista') {
        card = await this.buildListCard(item.description, answers[i])
          .catch(err => {
            reject(err)
          })
      } else if(item.type === 'imagen') {
        card = this.buildImageCard(item.description, answers[i])
        
      } else if(item.type === 'numerico') {
        this.setState({ number: item.text_val });
        card = this.buildNumberCard(item.description, answers[i])
          
      } else {
        this.setState({ notes: item.text_val });
        card = this.buildTextCard(item.description, answers[i])
          
      }
      cards.push(card);
    }


    this.setState({
      cards: cards,
      answers: answers
    });

  }


  showAlert = () => {
    this.setState({
      showAlert: true
    });
  };

  hideAlert = () => {
    this.setState({
      showAlert: false
    });
  };


  ConfirmAlert = () => {
    this.setState({
      showAlert: false
    });

    var sql = `update Activity set state = 'close'
               where id = ?;`;
    global.DB.transaction(tx => {
      tx.executeSql(
        sql,
        [this.state.activity.id],
        (_, {rows}) => {
        },
        (_, err) => {
          console.error(`ERROR consultando DB: ${err}`)
        }
      );
    });

    ToastAndroid.showWithGravityAndOffset(
      'Los datos se actualizaron correctamente.',
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
    
    this.props.navigation.navigate('Schedule',{onGoBack: () => this.refresh()});

  };



  async loadResumen(data) {
    var completas = await this.getCompletas(data);
    var pendientes = await this.getPendientes(data);
    var mensaje = `Tareas Completas: ${completas}\nTareas Pendientes: ${pendientes}`;

    this.setState({
      mensaje: mensaje
    });

    if (pendientes === 0){
      this.setState({
        showButtonConfirm: true
      });
    }else{
      this.setState({
        showButtonConfirm: false
      });
    }

    this.showAlert();
  }


  async getCompletas(data){
    var activity_id = data[0].activity_id;
    return new Promise(async function(resolve, reject) {
      global.DB.transaction(tx => {
        tx.executeSql(
          ` select coalesce(count(*),0) as cantidad
            from Activity act
            left join ItemActType iat on (iat.activityType_id = act.activityType_id)
            left join Answer a on (act.id = a.activity_id and iat.id = a.itemActType_id)
            where act.id = ? and a.id is not null
            group by act.id`,
          [activity_id],
          (_, { rows }) => {
            var cantidad = 0;
            if (rows.length > 0){
              cantidad = rows._array[0].cantidad;
            }
            resolve(cantidad);
          },
          (_, err) => {
            reject(err)
          }
        )
      });
    })
  }

  async getPendientes(data){
    var activity_id = data[0].activity_id;
    return new Promise(async function(resolve, reject) {
      global.DB.transaction(tx => {
        tx.executeSql(
          ` select coalesce(count(*),0) as cantidad
            from Activity act
            left join ItemActType iat on (iat.activityType_id = act.activityType_id)
            left join Answer a on (act.id = a.activity_id and iat.id = a.itemActType_id)
            where act.id = ? and a.id is null
            group by act.id`,
          [activity_id],
          (_, { rows }) => {
            var cantidad = 0;
            if (rows.length > 0){
              cantidad = rows._array[0].cantidad;
            }
            resolve(cantidad);
          },
          (_, err) => {
            reject(err)
          }
        )
      });
    })
  }


  static _alertIndex(index) {
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
        base64: true,
        quality: 0.2,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
          base64: true,
          quality: 0.2,
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

    if (answer.type === 'texto'){
      answer.text_val = this.state.notes;
    }

    if (answer.type === 'numerico'){
      answer.text_val = this.state.number;
    }

   
    if(answer.img_val || answer.text_val) {//Solo se crea una respuesta si la imagen o el texto vienen con algo
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
        );
        tx.executeSql(
          ` update activity set percent = (
              select 
                case 
                  count(iat.id) when 0 then 0 else count(a.id)*1.0/count(iat.id)*1.0   
                end percent 
              from ItemActType iat 
              left join answer a on (a.itemActType_id = iat.id) 
              where iat.activityType_id = activity.activityType_id 
            )
            where id = ?;`,
          [answer.activity_id],
          (_, { rows }) => {},
          (_, err) => {
            console.error(`ERROR consultando DB: ${err}`)
          }
        );
      });
    }
    

    if ((this.state.seg) === this.state.seg_max-1){
      this.loadResumen(this.state.cardsData);
    }

    this.setState(prevState => ({seg: prevState.seg + 1}))

  }


  buildImageCard(title, answer) {
    return {
      text: title,
      info: <View>
            <Text style={{ height: 30, width: '80%', fontSize: 18, textAlign: 'auto', backgroundColor: '#F08377', color: '#FFF', paddingLeft: 15, borderLeftWidth: 1 }} > {title} </Text>
            <CardItem>
              <Left>
                <Image style={{width: 150, height: 150}} 
                  source={{ uri: answer.img_val ? answer.img_val : AppConstants.PHOTO_DEFAULT }} />
              </Left>
              <Body></Body>
              <Right>
                <Button 
                  transparent 
                  onPress={() => this.pickImage(true)}
                  disabled={this.state.buttonSaveEnable}
                >
                  <Icon name='camera' style={{fontSize: 26, color:'#F08377'}}/>
                </Button>
                <Button 
                  transparent 
                  onPress={() => {this.pickImage(false)}}
                  disabled={this.state.buttonSaveEnable}
                >
                  <Icon name='folder' style={{fontSize: 26, color:'#F08377'}}/>
                </Button>
              </Right>
            </CardItem>
            </View>

    }
  }

  buildNumberCard(title, answer) {
    return {
      text: title,
      info: <View>
            <Text> {title} </Text>
            <Form>
                <Item>
                  <Input 
                    placeholder="Ingrese valor" 
                    bordered keyboardType={'numeric'} 
                    style={{ width: 100 }} 
                    defaultValue={this.state.number}
                    onChangeText={this.handleNumberChange.bind(this)}
                    disabled={this.state.buttonSaveEnable}
                  />
                  <Icon active name="calculator" />
                </Item>
            </Form>
            </View>
    }
  }

  
  handleChange(event) {
    this.setState({ notes: event});
  }  

  handleNumberChange(event){
    this.setState({ number: event});
  }

    
  buildTextCard(title, answer) {
    return {
      text: title,
      info: <View>
            <Text> {title} </Text>
            <Form>
              <Item>
                <Textarea rowSpan={5} bordered placeholder="Ingrese detalle"  
                  defaultValue={this.state.notes}
                  onChangeText={this.handleChange.bind(this)}
                  disabled={this.state.buttonSaveEnable}
                />
              </Item>
            </Form>
            </View>
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
            var r = rows._array;
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
                      disabled={this.state.buttonSaveEnable}
                    />
                  </Right>
                </ListItem>
              )
            });
            resolve({
              text: title,
              info: <View>
                      <Text> {title} </Text>
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

  goBack(){
    this.props.navigation.goBack()
  }



  render() {
    const {showAlert} = this.state;
    var isThereData = !!this.state.cardsData;

    return (
      <Container>
        <HeaderNavBar navigation={this.props.navigation}  title="Relevamiento" />
        <Content>
          
          <Card>
            <CardItem header>                        
              <Text>Resumen de Relevamiento</Text>
            </CardItem>

            <CardItem>                        
              <Label style={{ width: 120 }}>Contacto</Label><Text>{global.context.contact.name}</Text>
            </CardItem>
            <CardItem>                        
              <Label style={{ width: 120 }}>Domicilio</Label><Text>{global.context.contact.address}</Text>
            </CardItem>
            <CardItem>                        
              <Label style={{ width: 120 }}>Ciudad</Label><Text>{global.context.contact.city}</Text>
            </CardItem>
            <CardItem>                        
              <Label style={{ width: 120 }}>Detalle</Label><Text>{this.state.activity.description}</Text>
            </CardItem>
            <CardItem>                        
              <Label style={{ width: 120 }}>Estado</Label><Text>{this.state.activity.state == 'close' ? 'Cerrada' : 'Nueva' }</Text>
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
                    disabled={this.state.seg === this.state.seg_max ? true : false || this.state.buttonSaveEnable}
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

        <AwesomeAlert
          show={showAlert}
          showProgress={false}
          title="Resumen de Relevamiento"
          message={this.state.mensaje}
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={true}
          showConfirmButton={this.state.showButtonConfirm}
          cancelText="Cancelar"
          confirmText="Confirmar"
          confirmButtonColor="#DD6B55"
          onCancelPressed={() => {
            this.hideAlert();
          }}
          onConfirmPressed={() => {
            this.ConfirmAlert();
          }}
        />
        
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
  btn: { height: 28, backgroundColor: '#F08377',  borderRadius: 2},
  btn_cont: { flexDirection: 'row'},
  btn_card: { flexDirection: 'row', justifyContent: 'space-around' },
  btnText: { textAlign: 'center', color: '#fff', fontSize: 14, alignSelf: "center",
  borderRadius: 0,
  paddingTop: 3,
  paddingBottom: 3,
  paddingLeft: 5,
  paddingRight: 5,
  height: 30,
  width: 100,
  backgroundColor: "transparent",
  borderWidth: 0,
  borderLeftWidth: 0,}
});