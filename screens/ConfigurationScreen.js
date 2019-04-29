import React from 'react';
import { Container, Content, Text, Button, Form, Item, Label } from 'native-base';
import {StyleSheet, TextInput, ToastAndroid, Modal, View, BackHandler} from 'react-native';
import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';

import ValidationComponent from 'react-native-form-validator';
import { formatDateTo } from '../utilities/utils';



export default class ConfigurationScreen extends ValidationComponent {

  _didFocusSubscription;
  _willBlurSubscription;

  constructor(props) {
    super(props);
    this.state = {
      user_name: '',
      user_email: '',
      url_backend: '',
      user_backend: '',
      pass_backend: '',
      proximity_range: '',
      shipments_show: '',
      projection_agenda: '',
      consultant_num: '',
      history_size: '',
      showToast: false,
      modalVisible: false,
      error_msg: '',
    };

  this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
    BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
  );
  }

  onBackButtonPressAndroid = () => {
    this.goBack()
    return true;
  };

  componentDidMount() {
    this.getParameters();

    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }

  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
  }

  getParameters = () => {
    global.DB.transaction(tx => {
      tx.executeSql(
        'select key, value from Configuration',
        [],
        (tx, results) => {
          var len = results.rows.length;
          var data = results.rows._array;
          if (len > 0) {
            var fieldName = '';
            data.forEach(item => {
              fieldName = String(item.key);
              switch (fieldName) {
                case 'USER_NAME':
                  this.setState({user_name:item.value,});
                  break;
                case 'USER_EMAIL':
                  this.setState({user_email:item.value,});
                  break;
                case 'URL_BACKEND':
                  this.setState({url_backend:item.value,});
                  break;
                case 'USER_BACKEND':
                  this.setState({user_backend:item.value,});
                  break;
                case 'PASS_BACKEND':
                  this.setState({pass_backend:item.value,});
                  break;
                case 'PROXIMITY_RANGE':
                  this.setState({proximity_range:item.value,});
                  break;
                case 'SHIPMENTS_SHOW':
                  this.setState({shipments_show:item.value,});
                  break;
                case 'PROJECTION_AGENDA':
                  this.setState({projection_agenda:item.value,});
                  break;
                case 'CONSULTANT_NUM':
                  this.setState({consultant_num:item.value,});
                  break;
                case 'HISTORY_SIZE':
                  this.setState({history_size:item.value,});
                  break;
                default:
                  console.info(`el fieldname ${fieldName} no existe!`);
              }
            })
          }else{
            console.log('no existen datos en la base');
            this.setState({
              user_name: '',
              user_email: '',
              url_backend: '',
              user_backend: '',
              pass_backend: '',
              proximity_range: '',
              shipments_show: '',
              projection_agenda: '',
              consultant_num: '',
              history_size:''
            });
          }
        }
      );
    });
  };


  setParameters = () => {
    this.state.error_msg = '';

    if(!this.validate({user_name: {/* minlength:3, maxlength:100, */ required: true}})){ 
      this.state.error_msg += "Error en Nombre y Apellido es de carga obligatoria.\n";
    }
    if(!this.validate({user_backend: {/* minlength:3, maxlength:15, */ required: true}})){ 
      this.state.error_msg += "Error en Usuario Backend es de carga obligatoria.\n";
    }
    if(!this.validate({pass_backend: {/* minlength:6, maxlength:8, */ required: true}})){ 
      this.state.error_msg += "Error en Password Backend es de carga obligatoria.\n";
    } 
    if(!this.validate({url_backend: {required: true}})){ 
      this.state.error_msg += "Error en URL, el campo URL es de carga obligatoria.\n";
    }
    if(!this.validate({user_email: {email: true, required: true}})){ 
      this.state.error_msg += "Error en el formato del email. El campo es de carga obligatoria.\n";
    }
    if(!this.validate({proximity_range: {numbers: true, required: true}}) || this.state.proximity_range <= 0){
      this.state.error_msg += "Error en el campo Distancia cercanos. Debe ser numérico y mayor a 0.\n";
    }
    if(!this.validate({range_days: {numbers: true, required: true}}) || this.state.range_days <= 0){
      this.state.error_msg += "Error en el campo Proyección de agenda. Debe ser numérico y mayor a 0.\n";      
    }    
    if(!this.validate({shipments_show: {numbers: true, required: true}}) || this.state.shipments_show <= 0){
      this.state.error_msg += "Error en el campo Tamaño del paquete. Debe ser numérico y mayor a 0.\n";
    }
    if(!this.validate({consultant_num: {numbers: true, required: true}}) || this.state.consultant_num <= 0){
      this.state.error_msg += "Error en el campo número de asesor. Debe ser numérico y mayor a 0.\n";
    }
    if(!this.validate({history_size: {numbers: true, required: true}}) || this.state.history_size <= 0){ 
      this.state.error_msg += "Error en el campo tamaño de histórico. Debe ser numérico y mayor a 0.\n";
    }

    if(this.state.error_msg.length > 0) {
      
      this.setModalVisible(true);
      // ToastAndroid.showWithGravity(
      //   'Validar datos \n' + String(error_msg),
      //   ToastAndroid.LONG,
      //   ToastAndroid.BOTTOM,
      // );
      return;
    }

    const { user_name } = this.state;
    const { user_email } = this.state;
    const { url_backend } = this.state;
    const { user_backend } = this.state;
    const { pass_backend } = this.state;
    const { proximity_range } = this.state;
    const { shipments_show } = this.state;
    const { projection_agenda } = this.state;
    const { consultant_num } = this.state;
    const { history_size } = this.state;
    const campos = ['user_name','user_email','url_backend','user_backend',
      'pass_backend','proximity_range','shipments_show','projection_agenda', 'consultant_num',
      'history_size']
    var errordb = false;
    var item_ = '';
    let user = {};
    global.DB.transaction(tx => {
      campos.forEach(item_campo => {
        switch (item_campo) {
          case 'user_name':
            item_ = user_name;
            user.name = user_name;
            break;
          case 'user_email':
            item_ = user_email;
            user.email = user_email;
            break;
          case 'url_backend':
            item_ = url_backend;
            break;
          case 'user_backend':
            item_ = user_backend;
            user.username = user_backend;
            break;
          case 'pass_backend':
            item_ = pass_backend;
            user.password = pass_backend;
            break;
          case 'proximity_range':
            item_ = proximity_range;
            break;
          case 'shipments_show':
            item_ = shipments_show;
            break;
          case 'projection_agenda':
            item_ = projection_agenda;
            break;
          case 'consultant_num':
            item_ = consultant_num;
            break;
          case 'history_size':
            item_ = history_size;
            break;
          default:
            console.error( 'el fieldname no existe!' );
        }

        tx.executeSql(
          'insert or replace into Configuration(key, value, updated) values (?, ?, ?)',
          [String(item_campo).toLocaleUpperCase(), item_, formatDateTo(new Date(), 'YYYY/MM/DD HH:mm:ss')],
          (tx, results) => {},
          (tx, err) => {
            console.error(`ERROR actualizando la DB: ${err}`)
            errordb = true;
          }
        );
      });

      tx.executeSql(
        `UPDATE User set email = ?, name = ?, username = ?, password = ?, updated = ? `,
        [user.email, user.name, user.username, user.password, formatDateTo(new Date(), 'YYYY/MM/DD HH:mm:ss')],
        (tx, results) => {},
        (tx, err) => {
          console.error(`ERROR actualizando el usuario: ${err}`)
          errordb = true;
        }
      );

    });

    if (!errordb){
      ToastAndroid.showWithGravityAndOffset(
        'Los datos se actualizaron correctamente.',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
      // this.goBack();
    }

    this.goBack();

  };

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  };

  goBack(){
    if(this.props.navigation.state.params && this.props.navigation.state.params.onGoBack){
      this.props.navigation.state.params.onGoBack();
    }
    this.props.navigation.goBack()
  }

  render() {
    const { navigation } = this.props;

    return (
      <Container>
        <HeaderNavBar navigation={this.props.navigation} title="Configuraciones" />
        <Content>
        <Modal
          animationType="slide"
          class={styles.modalError}
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
          }}>
          <View style={styles.modalContent}>
              <Text style={styles.textModalContent}> { this.state.error_msg } </Text>
              <Button block style={{ marginTop: 10, marginBottom: 10 }}
                onPress={()=>{this.setModalVisible(false)}}>
                <Text>Cerrar</Text>
              </Button>
          </View>
        </Modal>

        <Form>
          <Item stackedLabel>
            <Label>Nombre y Apellido</Label>
            <TextInput
              value={this.state.user_name}
              onChangeText={user_name => this.setState({ user_name })}
              style={{width: '100%',  margin: 6}}
              keyboardType={'default'}
              placeholder="Ingrese nombre y apellido"
            />
          </Item>
          <Item stackedLabel>
            <Label>Email</Label>
            <TextInput
              value={this.state.user_email}
              onChangeText={user_email => this.setState({ user_email })}
              style={{width: '100%',  margin: 6}}
              keyboardType={'email-address'}
              placeholder="Ingrese el mail"
            />
          </Item>
          <Item stackedLabel>
            <Label>Numero de asesor</Label>
            <TextInput
              value={this.state.consultant_num}
              onChangeText={consultant_num => this.setState({ consultant_num })}
              style={{width: '100%',  margin: 6}}
              keyboardType={'numeric'}
              placeholder="Ingrese su número de asesor"
            />
          </Item>
          <Item stackedLabel>
            <Label>URL Backend</Label>
            <TextInput
              value={this.state.url_backend}
              onChangeText={url_backend => this.setState({ url_backend })}
              style={{width: '100%',  margin: 6}}
              keyboardType={'url'}
              placeholder="Ingrese direccion del servidor"
            />
          </Item>
          <Item stackedLabel>
            <Label>Usuario Backend</Label>
            <TextInput
              value={this.state.user_backend}
              onChangeText={user_backend => this.setState({ user_backend })}
              style={{width: '100%',  margin: 6}}
              keyboardType={'default'}
              placeholder="Ingrese nombre de usuario para login"
              textContentType={'username'}
            />
          </Item>
          <Item stackedLabel>
            <Label>Password Backend</Label>
            <TextInput
              value={this.state.pass_backend}
              onChangeText={pass_backend => this.setState({ pass_backend })}
              style={{width: '100%',  margin: 6}}
              keyboardType={'default'}
              placeholder="Ingrese contraseña para login"
              secureTextEntry={true}
            />
          </Item>
          <Item stackedLabel>
            <Label>Distancia a Cercanos (en metros)</Label>
            <TextInput
              value={this.state.proximity_range}
              onChangeText={proximity_range => this.setState({ proximity_range })}
              style={{width: '100%',  margin: 6}}
              keyboardType={'numeric'}
              placeholder="Ingrese la distancia de cercanos (en metros)"
            />
          </Item>
          <Item stackedLabel>
            <Label>Días de proyección de Agenda</Label>
            <TextInput
              value={this.state.projection_agenda}
              onChangeText={projection_agenda => this.setState({ projection_agenda })}
              style={{width: '100%',  margin: 6}}
              keyboardType={'numeric'}
              placeholder="Ingrese la cantidad de dias"
            />
          </Item>
          <Item stackedLabel>
            <Label>Tamaño del paquete de envío</Label>
            <TextInput
              value={this.state.shipments_show}
              onChangeText={shipments_show => this.setState({ shipments_show })}
              style={{width: '100%',  margin: 6}}
              keyboardType={'numeric'}
              placeholder="Ingrese el tamaño del paquete de envío"
            />
          </Item>
          <Item stackedLabel>
            <Label>Tamaño del histórico</Label>
            <TextInput
              value={this.state.history_size}
              onChangeText={history_size => this.setState({ history_size })}
              style={{width: '100%',  margin: 6}}
              keyboardType={'numeric'}
              placeholder="Ingrese la cantidad de registros del historíco"
            />
          </Item>
        </Form>
        <Button block style={{ margin: 15, marginTop: 50, marginBottom: 80 }}
                onPress={()=>{this.setParameters()}}>
          <Text>Guardar</Text>
        </Button>


        </Content>
        {/*<FooterNavBar navigation={this.props.navigation} />*/}
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
  btn: { height: 28, backgroundColor: '#F08377',  borderRadius: 2, fontSize: 12, color: 'white'},
  btn_cont: { flexDirection: 'row'},
  btn_card: { flexDirection: 'row', justifyContent: 'space-around' },
  btnText: { textAlign: 'center', color: '#fff' },
  modalContent: {
    backgroundColor: '#5D5670',
    color: 'white',
    fontSize: 14,
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  textModalContent: {
    color: '#FFF',
    fontSize: 18,
  },
  bottomModal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  scrollableModal: {
    height: 300,
  },
  modalError: {
    width: 300,
    height: 300,
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -150,
    marginTop: -150,
  }
});