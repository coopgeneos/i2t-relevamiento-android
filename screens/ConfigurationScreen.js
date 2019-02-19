import React from 'react';
//import { Button } from 'react-native';
import { Container, Header, Content, Footer, FooterTab, Text,
  Button, Icon, CheckBox, List, ListItem, Form, Item, Label,
  Input, Spinner, Body, Left, Title, Right, Thumbnail } from 'native-base';

import { StyleSheet, TextInput, Image, View, TouchableOpacity, Alert, ListView, ScrollView} from 'react-native';
import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';



export default class ConfigurationScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }


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
              style={{width: '100%',  margin: 6}}
              keyboardType={'default'}
              placeholder="Ingrese nombre y apellido"
            />
          </Item>
          <Item stackedLabel>
            <Label>Email</Label>
            <TextInput
              style={{width: '100%',  margin: 6}}
              keyboardType={'email-address'}
              placeholder="Ingrese el mail"
            />
          </Item>
          <Item stackedLabel>
            <Label>URL Backend</Label>
            <TextInput
              style={{width: '100%',  margin: 6}}
              keyboardType={'url'}
              placeholder="Ingrese direccion del servidor"
            />
          </Item>
          <Item stackedLabel>
            <Label>Usuario Backend</Label>
            <TextInput
              style={{width: '100%',  margin: 6}}
              keyboardType={'default'}
              placeholder="Ingrese nombre de usuario para loguear"
              textContentType={'username'}
            />
          </Item>
          <Item stackedLabel>
            <Label>Password Backend</Label>
            <TextInput
              style={{width: '100%',  margin: 6}}
              keyboardType={'default'}
              placeholder="Ingrese contraseña para loguear"
              secureTextEntry={true}
            />
          </Item>
          <Item stackedLabel>
            <Label>Distancia a Cercanos</Label>
            <TextInput
              style={{width: '100%',  margin: 6}}
              keyboardType={'numeric'}
              placeholder="Ingrese la distancia de cercanos"
            />
          </Item>
          <Item stackedLabel>
            <Label># Envíos a mostrar</Label>
            <TextInput
              style={{width: '100%',  margin: 6}}
              keyboardType={'numeric'}
              placeholder="Ingrese la cantidad de envios"
            />
          </Item>
          <Item stackedLabel>
            <Label>Días de proyección de Agenda</Label>
            <TextInput
              style={{width: '100%',  margin: 6}}
              keyboardType={'numeric'}
              placeholder="Ingrese la cantidad de dias"
            />
          </Item>
        </Form>
        <Button block style={{ margin: 15, marginTop: 50, marginBottom: 80 }}>
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