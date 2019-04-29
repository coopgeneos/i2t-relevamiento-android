import React from 'react';

import { Container, Content, Text, Button, Spinner, CheckBox,
          Icon, Label, Left, Body, Right, Card, CardItem, IconNB,
          ListItem, Radio, Segment, Textarea, Form, Item, Input, DatePicker} from 'native-base';

import {StyleSheet, Image, View, Alert, BackHandler, ToastAndroid, DatePickerAndroid } from 'react-native';
import { ImagePicker, Permissions, FileSystem } from 'expo';
import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';
import AppConstants from '../constants/constants'
import AwesomeAlert from 'react-native-awesome-alerts';
import {getConfiguration, showDB, executeSQL, formatDateTo, getLocationAsync} from "../utilities/utils";
import AppConstans from '../constants/constants';

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

    this.activity = this.props.navigation.getParam('activity', null);
    this.contact = this.props.navigation.getParam('contact', null);
    
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
      completas: 0,
      completas_norequired: 0,
      pendientes: 0,
      pendientes_norequired: 0
    };

    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
      BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );

    this.setDate = this.setDate.bind(this);

  };

  toggleSwitch() {
    this.state.answers[this.state.seg - 1].img_condition = this.state.answers[this.state.seg - 1].img_condition == 1 ? 0 : 1;
    this.loadCards(this.state.cardsData, false)
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
        ` select iat.id as itemActType_id, iat.uuid as itemActType_uuid, 
          iat.activityType_id, at.uuid as activityType_uuid, 
          iat.description, iat.type, iat.position, 
          act.id as activity_id, act.uuid as activity_uuid, 
          c.id as contact_id, c.uuid as contact_uuid,  
          a.id as answer_id, a.text_val, a.img_val, a.img_val_change, a.number_val, a.latitude, a.longitude, a.img_condition,  
          act.state, act.status, iat.required
          from Activity act 
          inner join ActivityType at on (at.id = act.activityType_id) 
          inner join ItemActType iat on (iat.activityType_id = act.activityType_id) 
          inner join Contact c on (c.id = act.contact_id) 
          left join Answer a on (act.id = a.activity_id and iat.id = a.itemActType_id) 
          where act.id = ? 
          order by iat.position
          --group by act.id, iat.id `,
        [this.activity.id],
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
    if (data[0].status === AppConstans.ACTIVITY_COMPLETED){
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
      // console.log(`TARJETA: ${JSON.stringify(data[i])}`)
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
        
        var answer = {
          id: item.answer_id, //Si answer_id viene en null, es porque nunca se respondió.
          activity_id: item.activity_id,
          activity_uuid: item.activity_uuid,
          itemActType_id: item.itemActType_id,
          itemActType_uuid: item.itemActType_uuid,
          contact_id: item.contact_id,
          contact_uuid: item.contact_uuid,
          type: item.type,
          required: item.required === 1 ? true : false,
          text_val: item.text_val,
          img_val: item.img_val,
          img_val_change: 0, // el cambio de imagen es 0 cada vez que se crea la tarjeta en memoria
          img_condition: item.img_condition != null ? item.img_condition : 1,
          number_val: item.number_val,         
          latitude: item.latitude,
          longitude: item.longitude  
        }
        answers.push(answer);

      }
      if(item.type === AppConstans.ITEM_TYPE_CHOICE || item.type === AppConstans.ITEM_TYPE_CHOICE_MULT) {
        card = await this.buildListCard(item.description, answers[i])
          .catch(err => {
            reject(err)
          })
      } else if(item.type === AppConstans.ITEM_TYPE_CONDITIONAL_IMAGE) {
        card = this.buildConditionalImageCard(item.description, answers[i])

      } else if(item.type === AppConstans.ITEM_TYPE_IMAGE) {
        card = this.buildImageCard(item.description, answers[i])
        
      } else if(item.type === AppConstans.ITEM_TYPE_NUMBER) {
        //this.setState({ number: item.number_val });
        card = this.buildNumberCard(item.description, answers[i])
          
      } else if(item.type === AppConstans.ITEM_TYPE_DATE) {
        //this.setState({ number: item.number_val });
        card = this.buildDateCard(item.description, answers[i])
          
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

    let status = this.state.pendientes > 0 ? AppConstans.ACTIVITY_PENDING : AppConstans.ACTIVITY_COMPLETED;

    var sql = `update Activity set status = ?, updated = ?  
               where id = ?;`;
    global.DB.transaction(tx => {
      tx.executeSql(
        sql,
        [status, formatDateTo(new Date(), 'YYYY/MM/DD HH:mm:ss'), this.activity.id],
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

    this.state.completas = await this.getCompletas(data, 1);
    this.state.completas_norequired = await this.getCompletas(data, 0);
    this.state.pendientes = await this.getPendientes(data, 1);
    this.state.pendientes_norequired = await this.getPendientes(data, 0);

    var mensaje = `CONSIGNAS REQUERIDAS COMPLETAS: ${this.state.completas}\nCONSIGNAS REQUERIDAS PENDIENTES: ${this.state.pendientes}\nCONSIGNAS OPCIONALES COMPLETAS: ${this.state.completas_norequired}\nCONSIGNAS OPCIONALES PENDIENTES: ${this.state.pendientes_norequired}`;

    this.setState({
      mensaje: mensaje
    });

    /* if (this.state.pendientes === 0){
      this.setState({
        showButtonConfirm: true
      });
    }else{
      this.setState({
        showButtonConfirm: false
      });
    } */

    //Siempre muestro el boton para poder poner la actividad en estado pendiente
    this.setState({ showButtonConfirm: true }); 

    this.showAlert();
    //this.loadData();
  }


  async getCompletas(data, required){
    var activity_id = data[0].activity_id;
    return new Promise(async function(resolve, reject) {
      global.DB.transaction(tx => {
        tx.executeSql(
          ` select coalesce(count(*),0) as cantidad
            from Activity act
            inner join ItemActType iat on (iat.activityType_id = act.activityType_id)
            left join Answer a on (act.id = a.activity_id and iat.id = a.itemActType_id)
            where act.id = ? and a.id is not null and iat.required = ? 
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

  async getPendientes(data, required){
    var activity_id = data[0].activity_id;
    return new Promise(async function(resolve, reject) {
      global.DB.transaction(tx => {
        tx.executeSql(
          ` select coalesce(count(*),0) as cantidad   
            from Activity act 
            inner join ItemActType iat on (iat.activityType_id = act.activityType_id) 
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
    try {
      let statusCameraRoll = null;
      let statusCamera = null;

      if(!this.state.permissionsCameraRoll){
        statusCameraRoll = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        this.state.permissionsCameraRoll = statusCameraRoll.status === 'granted';
      }

      if(!this.state.permissionsCamera){
        statusCamera = await Permissions.askAsync(Permissions.CAMERA)
        this.state.permissionsCamera = statusCamera.status === 'granted';
      }

      return (this.state.permissionsCameraRoll && this.state.permissionsCamera)
    } catch(error) {
      throw error
    }
  }

  async pickImage(takePhoto) {
    try {
      let permissions = await this.grantPermissions();
      if(permissions){
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
          this.state.answers[this.state.seg - 1].img_val_change = 1;
          this.loadCards(this.state.cardsData, false);
        }
      } else { 
        this.state.permissionsCameraRoll = false;
        this.state.permissionsCamera = false;   
        ToastAndroid.showWithGravityAndOffset(
          'Alguno de los permisos de cámara falló',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
          25,
          50,
        );  
      }
    } catch(error) {
      throw error;
    }
  };

  /* deleteImage() {
    this.state.answers[this.state.seg - 1].img_val = null;
    this.state.answers[this.state.seg - 1].img_val_change = 1;
    this.loadCards(this.state.cardsData, false);
  } */

  async saveAnswer() {
    try{
      let answer = this.state.answers[this.state.seg - 1];

      // console.log(`ANSWER: ${JSON.stringify(answer)}`)

      /*
        Si el campo númerico viene con valor "", lo traduzco en null
      */
      if(answer.type === AppConstans.ITEM_TYPE_NUMBER && answer.number_val) {
        if (answer.number_val === "") {
          answer.number_val = null;
        } else if(answer.number_val.toString().includes(".")){
          /*
            Aqui puede que el usuario ingrese algo del tipo 123.2556.2556.2
            Solo me quedo con la primer parte y armo un entero.
          */
          let parts = answer.number_val.split(".");
          answer.number_val = Number(parts[0]);
        }
      }

      /*
        Si la imagen es condicional y el tilde esta sin activar, se descarte la imagen
        Si el tilde está activo y no hay imagen, eso es un error
      */
      if (answer.type === AppConstans.ITEM_TYPE_CONDITIONAL_IMAGE) {
        if(answer.img_condition == 0) {
          answer.img_val_change = 0;
          answer.img_val = null;
        } else if(/* answer.img_condition == 1 &&  */answer.img_val == null) {
          answer.img_condition = 0;
          ToastAndroid.showWithGravityAndOffset(
            'La imagen esta vacía. Se descarta la selección',
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM,
            25,
            50,
          );
        }
      } else {
        answer.img_condition = 0;
      }

      /*
        Solo se crea una respuesta si la imagen, el texto o el numero vienen con algo.
        Si la respuesta ya tiene id (ya existia de antes), se actualiza.
        Si la respuesta es una imagen condicional, siempre se guarda.
      */
      if( answer.img_val || answer.text_val || answer.number_val || answer.id != null || 
          answer.type === AppConstans.ITEM_TYPE_CONDITIONAL_IMAGE) {
        // console.log(`GUARDANDO: ${JSON.stringify(answer)}`);
        let base64 = null;
        if(answer.img_val && answer.img_val_change == 1){ //Solo se guarda si
          base64 = await FileSystem.readAsStringAsync(answer.img_val, {encoding: FileSystem.EncodingTypes.Base64})
            .catch(err => {
              console.log(`ERROR LEYENDO COMO BASE 64: ${err}`);
            })
        }
        let position = await getLocationAsync()
          .catch(err => {
            throw new Error("Error obteniendo la posición del dispositivo")
          })
        
        let sql = '';
        let text_val = answer.text_val ? `'${answer.text_val}'` : null;
        if(answer.id){
          let upd_img = '';
          if(answer.img_val_change == 1){
            upd_img = `img_val = '${base64}', img_val_change = 1, `
          }       
          sql = ` update Answer set ${upd_img} text_val = ${text_val}, 
                    number_val = ${answer.number_val}, 
                    updated = '${formatDateTo(new Date(), 'YYYY/MM/DD HH:mm:ss')}',
                    latitude = ${position.coords.latitude}, longitude = ${position.coords.longitude},
                    type = '${answer.type}', img_condition = ${answer.img_condition} 
                  where id = ${answer.id}`;
        } else {
          let fields = "";
          let values_fields = "";
          if(answer.img_val_change == 1){
            fields = "img_val, img_val_change, ";
            values_fields = `'${base64}', ${answer.img_val_change},`;
          }
          sql = ` insert into Answer (activity_id, activity_uuid, 
                    itemActType_id, itemActType_uuid,
                    contact_id, contact_uuid, 
                    text_val, ${fields} number_val, updated, latitude, longitude, 
                    type, img_condition) 
                  values (${answer.activity_id}, '${answer.activity_uuid}',
                    ${answer.itemActType_id}, '${answer.itemActType_uuid}',
                    ${answer.contact_id}, '${answer.contact_uuid}', 
                    ${text_val}, ${values_fields} ${answer.number_val}, 
                    '${formatDateTo(new Date(), 'YYYY/MM/DD HH:mm:ss')}',
                    ${position.coords.latitude}, ${position.coords.longitude}, '${answer.type}',
                    ${answer.img_condition} 
                  )`;
        }

        // console.log(`SQL= ${sql}`)

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
                    (select count(iat.id) from ItemActType iat where iat.activityType_id = (
                      select act.activityType_id from Activity act where act.id = ?
                    ))*1.0   
                    when 0 then 0 
                    else (
                      (select count(ans.id) from Answer ans where ans.activity_id = ?)*1.0 / 
                      (select count(iat.id) from ItemActType iat where iat.activityType_id = (
                        select act.activityType_id from Activity act where act.id = ?
                      ))*1.0
                    )       
                  end percent 
              ), status = ?, updated = ?   
              where id = ?;`,
            [ 
              answer.activity_id,
              answer.activity_id,
              answer.activity_id,
              AppConstans.ACTIVITY_IN_PROGRESS,
              formatDateTo(new Date(), 'YYYY/MM/DD HH:mm:ss'),
              answer.activity_id
            ],
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

      //this.loadData();
    } catch(error) {
      ToastAndroid.showWithGravityAndOffset(
        'No se pudieron guardar los cambios',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
    }   
  }

  omitAnswer() {
    if ((this.state.seg) === this.state.seg_max-1 && this.activity.status != AppConstans.ACTIVITY_COMPLETED){
      this.loadResumen(this.state.cardsData);
    }

    this.setState(prevState => ({seg: prevState.seg + 1}))

    //this.loadData();
  }


  buildImageCard(title, answer) {
    style_status_answer_req = { height: 30, fontSize: 18, textAlign: 'auto', backgroundColor: '#65727B', color: '#FFF', paddingLeft: 15, borderLeftWidth: 1 };
    return {
      text: title,
      info: <View>
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
    style_status_answer_req = { height: 30, fontSize: 18, textAlign: 'auto', backgroundColor: '#65727B', color: '#FFF', paddingLeft: 15, borderLeftWidth: 1 };
    
    return {
      text: title,
      info: <View>
            
            <View style={{ flexDirection: 'row', textAlign: 'left', paddingLeft: 0, marginBottom: 5 }}>
              <CheckBox style={{ backgroundColor: '#65727B', borderColor: '#65727B', borderRadius: 0 }} 
                checked={answer.img_condition == 1}
                onPress={() => this.toggleSwitch()}
              />
              <Text style={{marginLeft: 10}}> Ingresa Imagen</Text>
            </View>         
            {answer.img_condition == 1 ?               
              <View>
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
    style_status_answer_req = { height: 30, fontSize: 18, textAlign: 'auto', backgroundColor: '#65727B', color: '#FFF', paddingLeft: 15, borderLeftWidth: 1 };

    return {
      text: title,
      info: <View>
            <Text style={style_status_answer_req}> {title} </Text>
            <Form>
                <Item>
                  <Input 
                    placeholder="Ingrese valor" 
                    bordered keyboardType={'numeric'} 
                    style={{ width: 100 }} 
                    defaultValue={answer.number_val ? answer.number_val.toString() : ""}
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
    answers[this.state.seg - 1].text_val = event;
    this.setState({ answers: answers});
    this.loadCards(this.state.cardsData, false);
  }  

  handleNumberChange(event){
    var answers = this.state.answers;
    answers[this.state.seg - 1].number_val = event;
    this.setState({ answers: answers});
    this.loadCards(this.state.cardsData, false);
  }
  
  buildTextCard(title, answer) {
    style_status_answer_req = { height: 30, fontSize: 18, textAlign: 'auto', backgroundColor: '#65727B', color: '#FFF', paddingLeft: 15, borderLeftWidth: 1 };

    return {
      text: title,
      info: <View>
            <Text style={style_status_answer_req}> {title} </Text>
            <Form>
              <Item>
                <Textarea rowSpan={5} bordered placeholder="Ingrese detalle"  
                  defaultValue={answer.text_val}
                  onChangeText={this.handleChange.bind(this) }
                  disabled={this.state.buttonSaveEnable}
                />
              </Item>
            </Form>
            </View>
    }
  }

  buildDateCard(title, answer) {
    style_status_answer_req = { height: 30, fontSize: 18, textAlign: 'auto', backgroundColor: '#65727B', color: '#FFF', paddingLeft: 15, borderLeftWidth: 1 };
    let dateValue = answer.text_val ? formatDateTo(answer.text_val, 'DD/MM/YYYY') : "Fecha ..."
    // console.log(`buildDateCard ${answer.text_val} ${dateValue}`)
    return {
      text: title,
      info: <View>
            <Text style={style_status_answer_req}> {title} </Text>
            <Form>
              <Item>
                {/* <DatePicker
                  defaultDate={null}
                  minimumDate={new Date(2018, 1, 1)}
                  maximumDate={new Date(2050, 12, 31)}
                  locale={"es"}
                  timeZoneOffsetInMinutes={undefined}
                  modalTransparent={false}
                  animationType={"fade"}
                  androidMode={"default"}
                  placeHolderText={dateValue}
                  textStyle={{ color: '#F08377' }}
                  placeHolderTextStyle={{ color: '#CCC' }}
                  onDateChange={this.setDate}
                  disabled={false}
                /> */}
                <Text
                  onPress={this.openAndroidDatePicker.bind(this)}
                  style={{ marginTop: 10, marginRight:12, color: '#F08377' }}
                >
                  {answer.text_val
                    ? formatDateTo(answer.text_val, 'DD/MM/YYYY')
                    : "Seleccione..."}
                </Text>
                <Button onPress={() => {this.clearDate()}} transparent style={styles.btnTextHeader} >
                  <Icon name='close' style={styles.btnIcon}/>
                </Button>
              </Item>
            </Form>
            </View>
    }
  }

  async openAndroidDatePicker() {
    try {
      const newDate = await DatePickerAndroid.open({
        date: this.state.answers[this.state.seg - 1].text_val
          ? this.state.answers[this.state.seg - 1].text_val
          : new Date(),
        minDate: new Date(2018, 1, 1),
        maxDate: new Date(2050, 18, 31),
        mode: this.props.androidMode
      });
      const { action, year, month, day } = newDate;
      if (action === "dateSetAction") {
        let selectedDate = new Date(year, month, day);
        this.state.answers[this.state.seg - 1].text_val = selectedDate;
        this.setDate(selectedDate)
      }
    } catch ({ code, message }) {
      console.warn("Cannot open date picker", message);
    }
  }

  setDate(newDate) {
    this.state.answers[this.state.seg - 1].text_val = formatDateTo(newDate, 'YYYY/MM/DD HH:mm:ss');
    this.loadCards(this.state.cardsData, false)
  }

  clearDate(){
    this.state.answers[this.state.seg - 1].text_val = null;
    this.loadCards(this.state.cardsData, false) 
  }

  elementList(answer, reg) {
    if(answer.type == AppConstans.ITEM_TYPE_CHOICE)
      return  <Radio
                selected={answer.text_val == reg.code ? true : false }
                onPress={() => {this.chooseOption(reg.code)}}
                disabled={this.state.buttonSaveEnable}
              />;
    
    if(answer.type == AppConstans.ITEM_TYPE_CHOICE_MULT) {
      return  <CheckBox 
                checked={this.checkIfSelected(answer, reg.code)} 
                onPress={() => {this.selectCheckBox(answer, reg.code)}}
              />;
    }
  }

  checkIfSelected(answer, value) {
    if(!answer.text_val) {
      return false
    } else {
      const sel_opts = answer.text_val.split(",");
      const opt = sel_opts.find(option => {
        return option === value
      })
      return opt != null; 
    }
  }

  cutFromString(str, value) {
    str = str.substring(0, str.indexOf(value)) + 
          str.substring(str.indexOf(value) + value.length + 1, str.length);
    str = str.length == 0 ? null : str
    return str;
  }

  selectCheckBox(answer, value) {    
    let new_v = "";
    if(answer.text_val && answer.text_val.includes(value)) {
      new_v = this.cutFromString(answer.text_val, value)
    } else {
      new_v = answer.text_val ? answer.text_val + ',' + value : value;
    }

    this.state.answers[this.state.seg - 1].text_val = new_v;
    this.loadCards(this.state.cardsData, false)
  }

  buildListCard(title, answer) {
    style_status_answer_req = { height: 30, fontSize: 18, textAlign: 'auto', backgroundColor: '#65727B', color: '#FFF', paddingLeft: 15, borderLeftWidth: 1 };

    return new Promise(async (resolve, reject) => {
      let listItems = [];
      global.DB.transaction(tx => {
        tx.executeSql(
          ` select * 
            from ListItemAct 
            where reference = (select reference from ItemActType where id = ?)`,
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
                    {this.elementList(answer, reg)}
                  </Right>
                </ListItem>
              )
            });
            resolve({
              text: title,
              info: <View>
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

    return (
      <Container>
        <HeaderNavBar navigation={this.props.navigation}  title="Relevamiento" />
        <Content>


          <Form>
            <Item stackedLabel>
              <Label style= {{ fontWeight: 'bold'}}>ACTIVIDAD DE RELEVAMIENTO</Label>
             
              <Text numberOfLines={2} note>
                Referencia: {this.activity.description} - {this.contact.name}
              </Text> 
              <Text numberOfLines={2} note>
                Dirección: { this.contact.address } - { this.contact.city }
              </Text>
              <Text note>
                Estado: { this.activity.status }
              </Text>
             
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
                      onPress={() => this.omitAnswer()}
                    >
                      <Text>OMITIR</Text>
                    </Button>
                    <Button
                      first
                      active={this.state.seg === this.state.seg_max ? false : true}
                      disabled={this.state.seg === this.state.seg_max ? true : false || this.state.buttonSaveEnable}
                      onPress={() => this.saveAnswer()}
                    >
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
        
        {/* Comentado para que no aparezca durante la carga del relevamiento 
        <FooterNavBar navigation={this.props.navigation} /> */}

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