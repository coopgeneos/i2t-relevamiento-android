import React from 'react';
import { Container, Header, Content, Footer, FooterTab, Text, Button, Spinner,
         Icon, Form, Item, Label, Input, Left, Title, Body, Right, Card, CardItem, CheckBox, Textarea } from 'native-base';

import { StyleSheet, View, ToastAndroid, Modal } from "react-native"

import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';

import ValidationComponent from 'react-native-form-validator';

import { NavigationActions } from 'react-navigation'; // Version can be specified in package.json


export default class ActivityScreen extends ValidationComponent {
  constructor(props) {
    super(props);
    
    //this.activity = this.props.navigation.getParam('activity_id', 'SIN ACTIVIDAD');
    this.activity_id = this.props.navigation.getParam('activity_id', 'SIN ACTIVIDAD');
    this.activity_desc = this.props.navigation.getParam('activity_desc', 'SIN ACTIVIDAD');
    this.contact_name = this.props.navigation.getParam('contact_name', 'NN');
    this.contact_dir = this.props.navigation.getParam('contact_dir', 'NN');
    this.contact_city = this.props.navigation.getParam('contact_city', 'NN');
    
    this.state = {
      canceled: false,
      //cancellation: this.activity.cancellation,
      cancellation: '',
      name: '',
      notes: '',
      disabled: true,
      error_msg: '',
      modalVisible: false,
    };
  }


  componentDidMount() {
    global.DB.transaction(tx => {
      tx.executeSql(
        ` select * 
          from activity  
          where id = ?`,
        [this.activity_id],
        (_, { rows }) => {
          this.activity = rows._array[0];
          this.setState({
            canceled: this.activity.state == 'canceled' ? true : false, 
            cancellation: this.activity.cancellation, 
            notes: this.activity.notes,
            name: this.activity.description,
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

    if(this.state.canceled) {
      console.log("canceled");

      if(this.state.cancellation === "" || !this.state.cancellation) {
        this.state.error_msg += "Completar motivo de cancelación.\n";
        this.setModalVisible(true);
        return;
      } else {
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
      }

    } else {
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
    }

    
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

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  };

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
            <Label>Contacto</Label>
            <Input
              value={this.contact_name_activity}
              disabled
              style={{ width: '100%' }}
            />
            <Label>Dirección</Label>
            <Input
              value={ this.contact_dir + ' - ' + this.contact_city }
              disabled
              style={{ width: '100%' }}
            />
          </Item>
          </Form>

          <Form>
            <Item>
              <Text style={{fontSize: 18}}>Registro {this.activity_desc}</Text>
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
  btn_cont: { flexDirection: 'row', justifyContent:'space-around'},
  modalContent: {
    backgroundColor: '#5D5670',
    color: '#FFF',
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