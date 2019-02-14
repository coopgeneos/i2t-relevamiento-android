import React from 'react';
//import { Button } from 'react-native';
import { Container, Header, Content, Footer, FooterTab, Text, 
  Button, Icon, CheckBox, List, ListItem, Form, Item, Label,
  Input, Spinner, Body, Left, Title, Right, Thumbnail } from 'native-base';

import { StyleSheet, Image, View, TouchableOpacity, Alert, ListView, ScrollView} from 'react-native';

import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';

const img_sample = require("../assets/icon.png");

export default class ContactsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contacts: [],
      name: global.context.user.name,
      nears: false,
    };
  }

  componentDidMount() {
    global.DB.transaction(tx => {
      tx.executeSql(
        ` select * 
          from Contact;`,
        [],
        (_, { rows }) => {
          this.setState ({
            contacts: rows._array
          });
        },
        (_, err) => {
          console.error(`ERROR consultando DB: ${err}`)
        }
      )
    });
  }

  toggleNears(){
    this.setState(prevState => (
      {nears: !prevState.nears}
    ))
  }

  onPressRow(contact){ 
    this.props.navigation.navigate('ContactAct')
  }

  goToContactActivities(params){
    global.context['contact'] = params.contact;
    this.props.navigation.navigate('ContactAct')
  }

  render() {
    var areThereContacts = this.state.contacts == null ? false : true;

    var markers = [];
    if (areThereContacts) {
      this.state.contacts.forEach(item => {
        markers.push({title: item.name, description: 'Contacto', coords: { latitude: item.latitude, longitude: item.longitude}});
      })
    }

    let list;
    if(this.state.contacts){
      let itemList = [];
      for(i=0; i< this.state.contacts.length; i++){
        itemList.push(
          <ListItem key={'item_'+i}  
            onPress={this.onPressRow.bind(this, this.state.contacts[i])} >
            <Text>{this.state.contacts[i].name}</Text>
            <Text>{this.state.contacts[i].address}</Text>
            <Text>{this.state.contacts[i].city}</Text>
          </ListItem>
        )
      }
      list = [];
      list.push(<ListItem itemHeader first key={'listHeader2'}>
                  <Text>Contactos</Text>
                </ListItem>                 
      );
      list.push(itemList);
    } else {
      list = <Spinner />
    }    

    return (
      <Container>
          <HeaderNavBar navigation={this.props.navigation} title="Actividades" markers={markers} navBack={{to: 'Home', params:{}}} />
          <Content>
          <Form style={{flexDirection: 'row', justifyContent: 'center'}}>
            
              <Item style={{flexDirection: 'row', justifyContent: 'flex-start', width: '50%'}}>
                <Label>Nombre</Label>
                <Input value={this.state.name} editable={false}/>           
              </Item>
              <Item style={{flexDirection: 'row', justifyContent: 'flex-start', width: '30%'}}>               
                <Label>Cercanos</Label>
                <CheckBox checked={this.state.nears} onPress={() => {this.toggleNears()}} />               
              </Item>
            
          </Form>

            <List
              dataArray={this.state.contacts}
              renderRow={data =>
              <ListItem thumbnail>
                <Left>
                  <Thumbnail square source={img_sample} />
                </Left>
                <Body>
                  <Text>
                    {data.name}
                  </Text>
                  <Text numberOfLines={2} note>
                    {data.address} - {data.city} - {data.zipCode}
                  </Text>
                  <Text numberOfLines={1} note>
                    {data.event}
                  </Text>
                </Body>
                <Right>
                  <Button transparent style={styles.btn} onPress={() => {this.goToContactActivities({contact: data})}}>
                    <Text>+ Actividad</Text>
                  </Button>
                </Right>
              </ListItem>}
            />
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
  btnText: { textAlign: 'center', color: '#fff' }
});