import React from 'react';
import { Container, Header, Content, Footer, FooterTab, Text, Button, Spinner,
         Icon, Form, Item, Label, Input, Left, Title, Body, Right, Card, CardItem, CheckBox, Textarea } from 'native-base';

import { StyleSheet, View, ToastAndroid } from "react-native"

import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';

import { NavigationActions } from 'react-navigation'; // Version can be specified in package.json


export default class ActivityScreen extends React.Component {
  constructor(props) {
    super(props);
    
    this.activity = this.props.navigation.getParam('activity', 'SIN ACTIVIDAD');
    
    this.state = {
      canceled: this.activity.state == 'canceled' ? true : false,
      cancellation: this.activity.cancellation,
      notes: this.activity.notes,
      disabled: true,
    };
  }

  componentDidMount() {
    global.DB.transaction(tx => {
      tx.executeSql(
        ` select * 
          from activity  
          where id = ?`,
        [this.activity.id],
        (_, { rows }) => {
          this.activity = rows._array[0];
          this.setState({
            canceled: this.activity.state == 'canceled' ? true : false, 
            cancellation: this.activity.cancellation, 
            notes: this.activity.notes,
            disabled: this.activity.state == 'canceled' ? true : false
          });
        },
        (_, err) => {
          console.error(`ERROR consultando DB: ${err}`)
        }
      )
    });
  }

  
  saveActivity(){
    var state = this.state.canceled ? 'canceled' : 'new';
    global.DB.transaction(tx => {
      tx.executeSql(
        ` update activity set state = ?, cancellation = ?, notes = ? where id = ?`,
        [ 
          state, 
          this.state.canceled ? this.state.cancellation : '', 
          this.state.notes, 
          this.activity.id
        ],
        (_, { rows }) => {},
        (_, err) => {
          console.error(`ERROR consultando DB: ${err}`)
        }
      )
    });
    ToastAndroid.showWithGravityAndOffset(
      'Los datos se actualizaron correctamente.',
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
    this.activity.canceled = this.state.canceled;
    /* 
      Para volver en la pila de navegación hay que invocar a onGoBack antes de volver con goBack 
      Notar que en ActivititesScreen al llamar a esta pagina pase el paramtro onGoBack
    */
    this.props.navigation.state.params.onGoBack();
    this.props.navigation.goBack()
  }

  cancelAct() {
    this.setState({canceled: !this.state.canceled});
  }

  render() {
    let cancelArea;

    if(this.state.canceled){
      cancelArea =  <Item>
                      <Textarea rowSpan={3} bordered 
                        placeholder="Ingrese motivos de la cancelación ..." 
                        value={this.state.cancellation}
                        onChangeText={(text) => this.setState({cancellation: text})}
                      />
                    </Item>
    } else {
      cancelArea =  <Item></Item>
    }

    return (
      <Container>
        <HeaderNavBar navigation={this.props.navigation} title="Registro de Actividad" />
        <Content>
          
          <Card>
            <CardItem header>                        
            <Text>Datos de Contacto</Text>
            </CardItem>
            <CardItem>                        
              <Label style={{ width: 80 }}>Contacto</Label><Text>{global.context.contact.name}</Text>
            </CardItem>
            <CardItem>                        
              <Label style={{ width: 80 }}>Domicilio</Label><Text>{global.context.contact.address}</Text>
            </CardItem>
            <CardItem>                        
              <Label style={{ width: 80 }}>Ciudad</Label><Text>{global.context.contact.city}</Text>
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
              <Textarea rowSpan={3} bordered placeholder="Ingrese sus notas aquí ..." 
                value={this.state.notes}
                onChangeText={(text) => this.setState({notes: text})}
              />
            </Item>
            <Item>
              <Label>Cancelada</Label>
              <CheckBox checked={this.state.canceled} onPress={()=>{this.cancelAct()}} disabled={this.state.disabled}/>  
            </Item>

            {cancelArea}
            
            <Item style={styles.btn_cont}>
              <Button onPress={() => this.props.navigation.navigate('Activities')}><Text>Cancelar</Text></Button>
              <Button onPress={() => this.saveActivity()} disabled={this.state.disabled}><Text>Guardar</Text></Button>
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