import React from 'react';
import { Container, Header, Content, Footer, FooterTab, Text, 
  Button, Icon, CheckBox, List, ListItem, Form, Item, Label,
  Input, Spinner, Body, Left, Title, Right, Thumbnail } from 'native-base';
import { getLocationAsync, isClose, getConfiguration } from '../utilities/utils';
import { StyleSheet, TextInput, BackHandler} from 'react-native';

import FooterNavBar from '../components/FooterNavBar';
import HeaderNavBar from '../components/HeaderNavBar';

const img_sample = require("../assets/icon.png");

export default class ContactsScreen extends React.Component {

  _didFocusSubscription;
  _willBlurSubscription;

  constructor(props) {
    super(props);
    this.state = {
      contacts: [],
      name: global.context.user.name,
      nears: false,
      markers: null,
      user_search: null
    };

    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }

  onBackButtonPressAndroid = () => {
    this.goBack()
    return true;
  };

  goBack() {
    if(this.props.navigation.state.params && this.props.navigation.state.params.onGoBack){
      this.props.navigation.state.params.onGoBack();
    }
    this.props.navigation.goBack()
  }

  componentDidMount() {
    this.getContacts(null, null)
      .then(() => {
        this.setState({});
      })
    
    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }

  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
  }

  getContacts(nears, name) {
    return new Promise((resolve, reject) => {
      let sql = `select * from Contact where state != 1 order by name limit 25;`

      if(name) {
        sql = `select * from Contact where state != 1 and name like '%${name}%' order by name limit 25;`
      } 

      global.DB.transaction(tx => {
        tx.executeSql(
          sql,
          [],
          async (_, { rows }) => {
            var data = rows._array;
            if(nears === true){
              var myLocation = await getLocationAsync();
              var myLoc = {lat: myLocation.coords.latitude, lng: myLocation.coords.longitude};
              var prox_range = await getConfiguration('PROXIMITY_RANGE');
              var data = rows._array.filter(item => {
                var ctLoc = {lat: item.latitude, lng: item.longitude};
                return isClose(myLoc, ctLoc, prox_range)
              })
            }
            var markers = [];       
            data.forEach((item, index) => {
              if(item.latitude != null && item.longitude != null)
                markers.push({title: item.name, description: item.address+' - '+item.city, coords: { latitude: item.latitude, longitude: item.longitude}, key: index});
            })
            /* 
              Elimino los repetidos para evitar problemas de key repetidas en el mapa
              y evitar solapamientos en pines
            */
            this.removeDuplicated(markers, this.markerEquals);
            /* this.setState ({
              contacts: data,
              markers: markers
            }); */
            this.state.contacts = data;
            this.state.markers = markers;
            resolve("Ok")
          },
          (_, err) => {
            reject(`ERROR consultando DB: ${err}`)
          }
        )
      });
    })
  }

  /* Dos marcadores son iguales si tienen la misma latitud y longitud */
  markerEquals(m1, m2) {
    return (m1.coords.latitude == m2.coords.latitude) && (m1.coords.longitude == m2.coords.longitude)
  }

  removeDuplicated(array, areEquals) {
    for(i=0; i<(array.length - 1); i++) {
      for(j=i+1; j<array.length; j++) {
        if(this.markerEquals(array[i], array[j])){
          array.splice(j, 1);
          j--; // Retrocedo un casillero porque el arreglo se acaba de achicar
        }
      }
    }
    return array;
  }

  toggleNears(){
    this.state.nears = !this.state.nears;
    this.getContacts(this.state.nears, null)
      .then(() => {
        this.setState({});
      })
  }

  onPressRow(contact){ 
    this.props.navigation.navigate('ContactAct', {onGoBack: this.refresh.bind(this)})
  }

  goToContactActivities(contact){
    this.props.navigation.navigate('ContactAct', {contact: contact.contact, onGoBack: this.refresh.bind(this)})
  }

  refresh(){
    this.getContacts(null, null)
      .then(() => {
        this.setState({});
      })
      .catch(err => {
        console.error("Error obteniendo datos para página de contactos")
      })
  }

  filterByName(name) {
    this.getContacts(null, name)
      .then(() => {
        this.setState({});
      })
      .catch(err => {
        console.error("Error obteniendo datos para página de contactos")
      })
  }

  render() {
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
          <HeaderNavBar navigation={this.props.navigation} title="Actividades" map={true} markers={this.state.markers} />
          <Content>
          <Form style={{flexDirection: 'row'}}>
            
              <Item style={{flexDirection: 'row', justifyContent: 'flex-start', width: '50%'}}>
                <Label>Nombre</Label>
                <TextInput
                  value={this.state.user_search}
                  onChangeText={(user_search) => this.filterByName(user_search)}
                  style={{width: '60%', marginTop: 0}}
                  keyboardType={'default'}
                  placeholder="Ingrese nombre"
                />           
              </Item>
              <Item style={{flexDirection: 'row', justifyContent: 'flex-start', width: '50%'}}>               
                <Label>Cercanos</Label>
                <CheckBox checked={this.state.nears} onPress={() => {this.toggleNears()}} />               
              </Item>
            
          </Form>

            <List
              dataArray={this.state.contacts}
              renderRow={data =>
              <ListItem thumbnail>
                {/* <Left>
                  <Thumbnail square source={img_sample} />
                </Left> */}
                <Body>
                  <Text>
                    {data.name}
                  </Text>
                  <Text numberOfLines={1} note>
                    {data.address} - {data.city} - {data.zipCode}
                  </Text>
                  <Text numberOfLines={5} note>
                    {data.description}
                  </Text>
                </Body>
                <Right>
                  <Button transparent style={styles.btn} onPress={() => {this.goToContactActivities({contact: data})}}>
                    <Text>+ ACT</Text>
                  </Button>
                </Right>
              </ListItem>}
            />
        </Content>
        <FooterNavBar navigation={this.props.navigation} onGoBack={this.refresh.bind(this)}/>
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