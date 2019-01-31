import React from 'react';
import { Container, Header, Content, Footer, FooterTab, Text, Button, Spinner,
         Icon, Form, Item, Label, Input, Left, Title, Body, Right, Card, CardItem, CheckBox, Textarea } from 'native-base';

import { StyleSheet, View } from "react-native"

import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';

export default class ScheduleScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      cancelAr: false
      
    };
  }
  
  saveActivity(){
    //TODO: Implementar save
    //Redirijo
    this.props.navigation.navigate('Activities');
  }

  cancelAr() {

    this.setState({cancelAr: !this.state.cancelAr});

  }

  render() {
    const { navigation } = this.props;
    const contact = navigation.getParam('contact', 'SIN CONTACTO');
    const address = navigation.getParam('address', 'SIN DOMICILIO');
    const detail = navigation.getParam('detail', 'SIN DETALLE');

    let cancelArea;

    if(this.state.cancelAr){
      cancelArea =  <Item>
                      <Textarea rowSpan={3} bordered placeholder="Ingrese motivos de la cancelación ..." />
                    </Item>
    } else {
      cancelArea =  <Item>
                    </Item>

    }

    return (
      <Container>
        <HeaderNavBar navigation={this.props.navigation}  title="Registro de Actividad" />
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
            <Label style={{ width: 80 }}>Ciudad</Label><Text>{this.state.city}</Text>
            </CardItem>

            <CardItem footer>                        
            <Text></Text>
            </CardItem>
          </Card>


          <Form>

            <Item>
              <Text style={{fontSize: 18}}>Registro de Actividad</Text>
            </Item>
            <Item>
              <Textarea rowSpan={3} bordered placeholder="Ingrese sus notas aquí ..." />
            </Item>
            <Item>
              <Label>Cancelada</Label>
              <CheckBox checked={this.state.cancelAr} onPress={()=>{this.cancelAr()}}/>  
            </Item>


            {cancelArea}
            
            <Item style={styles.btn_cont}>
              <Button onPress={() => this.props.navigation.navigate('Activities')}><Text>Cancelar</Text></Button>
              <Button onPress={() => this.saveActivity()}><Text>Guardar</Text></Button>
            </Item>

          
          </Form>
        
        </Content>
        
        <FooterNavBar navigation={this.props.navigation} />
      </Container>
    );
  }

}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
  head: { height: 40, backgroundColor: '#808B97' },
  text: { margin: 6 },
  row: { flexDirection: 'row', backgroundColor: '#FFF1C1' },
  btnText: { textAlign: 'center', color: '#fff' },
  btn_cont: { flexDirection: 'row', justifyContent:'space-around'}
});