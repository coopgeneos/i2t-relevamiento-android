import React from 'react';
import { Container, Header, Content, Footer, FooterTab, Text, Button, Spinner,
         Icon, Form, Item, Label, Input, Left, Title, Body, Right, Card, CardItem, CheckBox, Textarea } from 'native-base';

import { StyleSheet, View, ToastAndroid, Modal, BackHandler } from "react-native"

import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';

import ValidationComponent from 'react-native-form-validator';

import { NavigationActions } from 'react-navigation'; // Version can be specified in package.json
import AppConstans from '../constants/constants';
import { formatDateTo, executeSQL } from '../utilities/utils'

export default class ActivityScreen extends ValidationComponent {

  _didFocusSubscription;
  _willBlurSubscription;

  constructor(props) {
    super(props);
    
    this.activity = this.props.navigation.getParam('activity', null);
    this.contact = this.props.navigation.getParam('contact', null);
    
    this.state = {
      canceled: false,
      cancellation: '',
      name: '',
      notes: '',
      disabled: true,
      error_msg: '',
      modalVisible: false,
    };

    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
      BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }

  onBackButtonPressAndroid = () => {
    this.goBack();
    return true;
  };

  componentDidMount() {
    this.getActivity()
      .then(() => {
        this.setState({});
      })
      .catch((err) => {
        ToastAndroid.showWithGravityAndOffset(
          'Hubo un error al obtener la tarea',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
          25,
          50
        );
      })

    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
    BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }

  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
  }

  getActivity() {
    return new Promise((resolve, reject) => {
      global.DB.transaction(tx => {
        tx.executeSql(
          ` select * 
            from activity  
            where id = ?`,
          [this.activity.id],
          (_, { rows }) => {
            this.activity = rows._array[0];
            this.state.canceled = this.activity.status == AppConstans.ACTIVITY_CANCELED ? true : false, 
            this.state.cancellation = this.activity.cancellation, 
            this.state.notes = this.activity.notes,
            this.state.name = this.activity.description,
            this.state.disabled = this.activity.status == AppConstans.ACTIVITY_CANCELED ? true : false;
            resolve("Ok")
          },
          (_, err) => {
            reject(`ERROR consultando DB: ${err}`)
          }
        )
      })
    })
  }
 
  saveActivity(){
    if(this.state.canceled) {
      if(this.state.cancellation === "" || !this.state.cancellation) {
        this.state.error_msg += "Completar motivo de cancelación.\n";
        this.setModalVisible(true);
        return;
      }
    }

    let status = this.state.canceled ? AppConstans.ACTIVITY_CANCELED : this.activity.status;

    executeSQL("update activity set status = ?, cancellation = ?, notes = ? , updated = ? where id = ?", 
              [ status, 
                this.state.canceled ? this.state.cancellation : '', 
                this.state.notes,
                formatDateTo(new Date(), 'YYYY/MM/DD HH:mm:ss'), 
                this.activity.id])
      .then(() => {
        return ToastAndroid.showWithGravityAndOffset(
          'Los datos se actualizaron correctamente.',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
          25,
          50
        );
      })
      .then(() => {
        return this.goBack()
      })
      .catch(err => {
        ToastAndroid.showWithGravityAndOffset(
          'Ocurrió un error al guardar los cambios.',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
          25,
          50
        );
      })
  }

  goBack() {
    if(this.props.navigation.state.params && this.props.navigation.state.params.onGoBack){
      this.props.navigation.state.params.onGoBack();
    }
    this.props.navigation.goBack()
  }

  cancelAct() {
    this.setState({canceled: !this.state.canceled});
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  };

  refresh() {
    this.getActivity()
      .then(() => {
        this.setState({});
      })
      .catch((err) => {
        ToastAndroid.showWithGravityAndOffset(
          'Hubo un error al obtener la tarea',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
          25,
          50
        );
      })
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
            <Textarea rowSpan={2}  
                value={this.contact.name}
                disabled
                style={{ marginLeft: 10, fontSize: 16 }}
              />
            <Label>Dirección</Label>
            <Textarea rowSpan={2} 
                value={ this.contact.address + ' - ' + this.contact.city }
                disabled
                style={{ marginLeft: 10, fontSize: 16 }}
              />
          </Item>
          </Form>

          <Form>
            <Item>
              <Textarea rowSpan={2} 
                value={ 'REGISTRO: ' + this.activity.description }
                disabled
                style={{ fontSize: 16, padding: 0 }}
              />
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
              <Button onPress={() => this.props.navigation.navigate('Schedule')}><Text>Cancelar</Text></Button>
              <Button onPress={() => this.saveActivity()} disabled={this.state.disabled}><Text>Guardar</Text></Button>
            </Item>         
          </Form>
        
        </Content>
        
        <FooterNavBar navigation={this.props.navigation} onGoBack={this.refresh.bind(this)}/>
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