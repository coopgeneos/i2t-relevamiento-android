import React from 'react';
import { Container, Content, Text, Button, Form, Item, Label } from 'native-base';
import {StyleSheet, TextInput, ToastAndroid} from 'react-native';
import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';



export default class ConfigurationScreen extends React.Component {
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
    };
  }

  componentDidMount() {
    this.getParameters();
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
                default:
                  console.error( 'el fieldname no existe!' );
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
            });
          }
        }
      );
    });
  };


  setParameters = () => {
    const { user_name } = this.state;
    const { user_email } = this.state;
    const { url_backend } = this.state;
    const { user_backend } = this.state;
    const { pass_backend } = this.state;
    const { proximity_range } = this.state;
    const { shipments_show } = this.state;
    const { projection_agenda } = this.state;
    var errordb = false;
    global.DB.transaction(tx => {
      tx.executeSql(
        'UPDATE Configuration set value=? where key=?',
        [user_name, 'USER_NAME'],
        (tx, results) => {},
        (tx, err) => {
          console.error(`ERROR actualizando la DB: ${err}`)
          errordb = true;
        }
      );
      tx.executeSql(
        'UPDATE Configuration set value=? where key=?',
        [user_email, 'USER_EMAIL'],
        (tx, results) => {},
        (tx, err) => {
          console.error(`ERROR actualizando la DB: ${err}`)
          errordb = true;
        }
      );
      tx.executeSql(
        'UPDATE Configuration set value=? where key=?',
        [url_backend, 'URL_BACKEND'],
        (tx, results) => {},
        (tx, err) => {
          console.error(`ERROR actualizando la DB: ${err}`)
          errordb = true;
        }
      );
      tx.executeSql(
        'UPDATE Configuration set value=? where key=?',
        [user_backend, 'USER_BACKEND'],
        (tx, results) => {},
        (tx, err) => {
          console.error(`ERROR actualizando la DB: ${err}`)
          errordb = true;
        }
      );
      tx.executeSql(
        'UPDATE Configuration set value=? where key=?',
        [pass_backend, 'PASS_BACKEND'],
        (tx, results) => {},
        (tx, err) => {
          console.error(`ERROR actualizando la DB: ${err}`)
          errordb = true;
        }
      );
      tx.executeSql(
        'UPDATE Configuration set value=? where key=?',
        [proximity_range, 'PROXIMITY_RANGE'],
        (tx, results) => {},
        (tx, err) => {
          console.error(`ERROR actualizando la DB: ${err}`)
          errordb = true;
        }
      );
      tx.executeSql(
        'UPDATE Configuration set value=? where key=?',
        [shipments_show, 'SHIPMENTS_SHOW'],
        (tx, results) => {},
        (tx, err) => {
          console.error(`ERROR actualizando la DB: ${err}`)
          errordb = true;
        }
      );
      tx.executeSql(
        'UPDATE Configuration set value=? where key=?',
        [projection_agenda, 'PROJECTION_AGENDA'],
        (tx, results) => {},
        (tx, err) => {
          console.error(`ERROR actualizando la DB: ${err}`)
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
      this.props.navigation.goBack();
    }

  };



  render() {
    const { navigation } = this.props;

    return (
      <Container>
        <HeaderNavBar navigation={this.props.navigation} title="Configuraciones" />
        <Content>

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
            <Label>Distancia a Cercanos</Label>
            <TextInput
              value={this.state.proximity_range}
              onChangeText={proximity_range => this.setState({ proximity_range })}
              style={{width: '100%',  margin: 6}}
              keyboardType={'numeric'}
              placeholder="Ingrese la distancia de cercanos"
            />
          </Item>
          <Item stackedLabel>
            <Label># Envíos a mostrar</Label>
            <TextInput
              value={this.state.shipments_show}
              onChangeText={shipments_show => this.setState({ shipments_show })}
              style={{width: '100%',  margin: 6}}
              keyboardType={'numeric'}
              placeholder="Ingrese la cantidad de envios"
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
        </Form>
        <Button block style={{ margin: 15, marginTop: 50, marginBottom: 80 }}
                onPress={()=>{this.setParameters()}}>
          <Text>Guardar</Text>
        </Button>


        </Content>
        <FooterNavBar navigation={this.props.navigation} />
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
});