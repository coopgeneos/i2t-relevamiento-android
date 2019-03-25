import React from 'react';

import { Container, Content, Text, Button, Spinner, CheckBox,
          Icon, Label, Left, Body, Right, Card, CardItem, IconNB,
          ListItem, Radio, Segment, Textarea, Form, Item, Input} from 'native-base';

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

    this.activity_id = this.props.navigation.getParam('activity_id', 0);
    this.activity_desc = this.props.navigation.getParam('activity_desc', '');
    this.activity_state = this.props.navigation.getParam('activity_state', '');
    this.contact_name = this.props.navigation.getParam('contact_name', '');
    this.contact_city = this.props.navigation.getParam('contact_city', '');
    this.contact_dir = this.props.navigation.getParam('contact_dir', '');

    this.state = {
      seg: 1,
      seg_max: null,
      activity: null,
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
      checkbox1: false,
    };

    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
      BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );

  };

  toggleSwitch() {
    this.setState({
      checkbox1: !this.state.checkbox1
    });
    //this.state.checkbox1 = !this.state.checkbox1;
    console.info('Estado: ' + this.state.checkbox1);
}

  componentDidMount() {
    
    

    
    this.loadData();

    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }

  
  loadData(){
    global.DB.transaction(tx => {
      tx.executeSql(
        ` select iat.id as itemActType_id, iat.activityType_id, iat.description, iat.type, 
          a.id as answer_id, act.id as activity_id, a.text_val, a.img_val, act.state, iat.required
          from Activity act
          left join ItemActType iat on (iat.activityType_id = act.activityType_id)
          left join Answer a on (act.id = a.activity_id and iat.id = a.itemActType_id)
          where act.id = ?
          --group by act.id, iat.id `,
        [this.activity_id],
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
      var requerido = null;
            
                  
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

        if (item.required === '1'){
          requerido = true
        }else{
          requerido = false
        }
        
        var answer = {
          id: item.answer_id, //Si answer_id viene en null, es porque nunca se respondió.
          activity_id: item.activity_id,
          itemActType_id: item.itemActType_id,
          text_val: item.text_val,
          img_val: item.img_val,
          img_val_change: false,
          type: item.type,
          requerido: requerido,
          notes: item.text_val,
          number: item.text_val,
        }
        answers.push(answer);

      }
      if(item.type === 'lista') {
        card = await this.buildListCard(item.description, answers[i])
          .catch(err => {
            reject(err)
          })
      } else if(item.type === 'condicional') {
        card = this.buildConditionalImageCard(item.description, answers[i])

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
        [this.activity_id],
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
    
    
    this.goBack();
  };



  async loadResumen(data) {
    var completas = await this.getCompletas(data);
    var pendientes = await this.getPendientes(data, '1');
    var pendientes_norequired = await this.getPendientes(data, '0');

    var mensaje = `Tareas Completas: ${completas}\nTareas Pendientes Obligatorias: ${pendientes}\nTareas Pendientes: ${pendientes_norequired}`;

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
    //this.loadData();
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

  async getPendientes(data, required){
    var activity_id = data[0].activity_id;
    return new Promise(async function(resolve, reject) {
      global.DB.transaction(tx => {
        tx.executeSql(
          ` select coalesce(count(*),0) as cantidad
            from Activity act
            left join ItemActType iat on (iat.activityType_id = act.activityType_id)
            left join Answer a on (act.id = a.activity_id and iat.id = a.itemActType_id)
            where act.id = ? and a.id is null and iat.required = ?
            group by act.id`,
          [activity_id, required],
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
      answer.text_val = answer.notes;
    }

    if (answer.type === 'numerico'){
      answer.text_val = answer.number;
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

    this.loadData();

  }


  buildImageCard(title, answer) {

    // if (answer.requerido == 1)
    //   style_status_answer_req = { height: 30, fontSize: 18, textAlign: 'auto', backgroundColor: '#F00', color: '#FFF', paddingLeft: 15, borderLeftWidth: 1 };
    // else
    //   style_status_answer_req = { height: 30, fontSize: 18, textAlign: 'auto', backgroundColor: '#F08377', color: '#FFF', paddingLeft: 15, borderLeftWidth: 1 };

    style_status_answer_req = { height: 30, fontSize: 18, textAlign: 'auto', backgroundColor: '#65727B', color: '#FFF', paddingLeft: 15, borderLeftWidth: 1 };



    return {
      text: title,
      info: <View>
            
            {/* <View style={{ flexDirection: 'row' }}>
              <CheckBox
                checked={answer.requerido}
                disabled={true}
              />
              <Text style={{marginLeft: 10}}> Requerido</Text>
            </View>
            <Text></Text>              */}

            {/* <Text style={{ height: 30, fontSize: 18, textAlign: 'auto', backgroundColor: '#F08377', color: '#FFF', paddingLeft: 15, borderLeftWidth: 1 }} > {title} </Text> */}
            <Text style={ style_status_answer_req } > {title} </Text>
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

  buildConditionalImageCard(title, answer) {

    // if (answer.requerido == 1)
    //   style_status_answer_req = { height: 30, fontSize: 18, textAlign: 'auto', backgroundColor: '#F00', color: '#FFF', paddingLeft: 15, borderLeftWidth: 1 };
    // else
    //   style_status_answer_req = { height: 30, fontSize: 18, textAlign: 'auto', backgroundColor: '#F08377', color: '#FFF', paddingLeft: 15, borderLeftWidth: 1 };

    style_status_answer_req = { height: 30, fontSize: 18, textAlign: 'auto', backgroundColor: '#65727B', color: '#FFF', paddingLeft: 15, borderLeftWidth: 1 };



    return {
      text: title,
      info: <View>
            
            <View style={{ flexDirection: 'row', textAlign: 'left', paddingLeft: 0, marginBottom: 5 }}>
              <CheckBox style={{ backgroundColor: '#65727B', borderColor: '#65727B', borderRadius: 0 }} 
                checked={this.state.checkbox1}
                onPress={() => this.toggleSwitch()}
              />
              <Text style={{marginLeft: 10}}> Ingresa Imagen</Text>
            </View>         
            {this.state.checkbox1 ?               <View>
              <Text style={ style_status_answer_req } > {title} </Text>
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
              </View> : null}



            </View>

    }
  }

  buildNumberCard(title, answer) {

    // if (answer.requerido === 1)
    //   style_status_answer_req = { backgroundColor: '#F00'};
    // else
    //   style_status_answer_req = { };

    style_status_answer_req = { height: 30, fontSize: 18, textAlign: 'auto', backgroundColor: '#65727B', color: '#FFF', paddingLeft: 15, borderLeftWidth: 1 };

    return {
      text: title,
      info: <View>
            {/* <View style={{ flexDirection: 'row' }}>
              <CheckBox
                checked={answer.requerido}
                disabled={true}
              />
              <Text style={{marginLeft: 10}}> Requerido</Text>
            </View>
            <Text></Text> */}

            <Text style={style_status_answer_req}> {title} </Text>
            <Form>
                <Item>
                  <Input 
                    placeholder="Ingrese valor" 
                    bordered keyboardType={'numeric'} 
                    style={{ width: 100 }} 
                    defaultValue={answer.number}
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
    var answers = this.state.answers;
    answers[this.state.seg - 1].notes = event;
    this.setState({ answers: answers});
    this.loadCards(this.state.cardsData, false);
  }  

  handleNumberChange(event){
    var answers = this.state.answers;
    answers[this.state.seg - 1].number = event;
    this.setState({ answers: answers});
    this.loadCards(this.state.cardsData, false);
  }

    
  buildTextCard(title, answer) {

    // if (answer.requerido === 1)
    //   style_status_answer_req = { backgroundColor: '#F00'};
    // else
    //   style_status_answer_req = { };

    style_status_answer_req = { height: 30, fontSize: 18, textAlign: 'auto', backgroundColor: '#65727B', color: '#FFF', paddingLeft: 15, borderLeftWidth: 1 };

    return {
      text: title,
      info: <View>
            {/* <View style={{ flexDirection: 'row' }}>
              <CheckBox
                checked={answer.requerido}
                disabled={true}
              />
              <Text style={{marginLeft: 10}}> Requerido</Text>
            </View>
            <Text></Text> */}

            <Text style={style_status_answer_req}> {title} </Text>
            <Form>
              <Item>
                <Textarea rowSpan={5} bordered placeholder="Ingrese detalle"  
                  defaultValue={answer.notes}
                  onChangeText={this.handleChange.bind(this) }
                  disabled={this.state.buttonSaveEnable}
                />
              </Item>
            </Form>
            </View>
    }
  }

  buildListCard(title, answer) {
    // if (answer.requerido === 1)
    //   style_status_answer_req = { backgroundColor: '#F00'};
    // else
    //   style_status_answer_req = { };

    style_status_answer_req = { backgroundColor: '#65727B'};

    return new Promise(async (resolve, reject) => {
      let listItems = [];
      global.DB.transaction(tx => {
        tx.executeSql(
          ` select * 
            from ListItemAct 
            where reference = (select reference from ItemActType where id = ?))`,
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
                      {/* <View style={{ flexDirection: 'row' }}>
                        <CheckBox
                          checked={answer.requerido}
                          disabled={true}
                        />
                        <Text style={{marginLeft: 10}}> Requerido</Text>
                      </View>
                      <Text></Text> */}
                      <Text style={style_status_answer_req}> {title} </Text>
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
    this.props.navigation.state.params.onGoBack();
    this.props.navigation.goBack()
  }



  render() {
    const {showAlert} = this.state;
    var isThereData = !!this.state.cardsData;

    console.log('Renderizando')

    // // Por defecto el fondo blanco para el estado nueva/en proceso
    // var style_status = {backgroundColor: '#FFF'};
    // console.info(this.activity_state);
    // if(this.activity_state == 'close')
    //   style_status = {backgroundColor: '#91f898'};
    // else if(this.activity_state == 'canceled')
    //   style_status = {backgroundColor: '#f86363'};
    // console.info(style_status);

    return (
      <Container>
        <HeaderNavBar navigation={this.props.navigation}  title="Relevamiento" />
        <Content>


          <Form>
            <Item stackedLabel>
              <Label style= {{ fontWeight: 'bold'}}>ACTIVIDAD DE RELEVAMIENTO</Label>
              {/* <Input
                value={ this.activity_desc }
                disabled
                style={{ width: '100%' }}
              /> */}

              <Text numberOfLines={2} note>
                {this.activity_desc} - {this.contact_name}
              </Text>
              {/* <Input
                value={ this.contact_name }
                disabled
                style={{ width: '100%' }}
              /> */}
              <Text numberOfLines={2} note>
                Dirección: { this.contact_dir } - { this.contact_city }
              </Text>
              <Text note>
                Estado: { this.activity_state }
              </Text>
              {/* <Input
                value={  + ' - ' + this.contact_city }
                disabled
                style={{ width: '100%' }}
              /> */}
            </Item>
          </Form>
          
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
                      {/* <Icon name="save" /> */}
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
  container: { flex: 1, justifyContent: "center", height: '100%', marginBottom: 80, padding: 16, paddingTop: 20, backgroundColor: '#fff' },
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