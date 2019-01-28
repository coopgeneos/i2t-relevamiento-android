import React from 'react';
//import { Button } from 'react-native';
import { Container, Header, Content, Footer, FooterTab, Text, 
  Button, Icon, CheckBox, List, ListItem, Form, Item, Label,
  Input, Spinner, Body, Left, Title, Right, Thumbnail } from 'native-base';


const img_sample = require("../assets/icon.png");

// Ver como meter datas adentro de la llamada a los WS

const datas = [
  {agency: 'Agencia 99999/99', address: 'San Juan 465', city: 'Tandil', zipCode: '6546', title: 'Evento 1'},
  {agency: 'Agencia 99999/99', address: 'San Juan 465', city: 'Ayacucho', zipCode: '6546', title: 'Evento 2'},
  {agency: 'Agencia 99999/99', address: 'San Juan 465', city: '9 de Julio', zipCode: '7866', title: 'Evento 3'},
  {agency: 'Agencia 99999/99', address: 'San Juan 465', city: 'Azul', zipCode: '4567', title: 'Evento 4'},
  {agency: 'Agencia 99999/99', address: 'San Juan 465', city: 'Olavarria', zipCode: '4546', title: 'Evento 5'},
];


export default class ContactsScreen extends React.Component {
  constructor(props) {
    super(props);

    
    //const nears = navigation.getParam('nears', false);

    //this.state.contacts = ['Juan Perez / 24945687559 / Buzon 2345','Jose Fantasia / 4654876546 / Segundo sombra 25666'];
    this.state = {
      name: 'Adrian',
      nears: false,
    };
  }

  componentDidMount() {
    //simulo al WS
    setTimeout(() => {
      let response = {
        contacts: [
          {agency: 'Agencia 99999/99', address: 'San Juan 465', city: 'Tandil', zipCode: '6546', phone: '+5496549876521', email: 'other@unmail.com'},
          {agency: 'Agencia 99999/99', address: 'San Juan 465', city: 'Ayacucho', zipCode: '6546', phone: '+5496549876521', email: 'other@unmail.com'},
          {agency: 'Agencia 99999/99', address: 'San Juan 465', city: '9 de Julio', zipCode: '7866', phone: '+5496549876521', email: 'other@unmail.com'},
          {agency: 'Agencia 99999/99', address: 'San Juan 465', city: 'Azul', zipCode: '4567', phone: '+5496549876521', email: 'other@unmail.com'},
          {agency: 'Agencia 99999/99', address: 'San Juan 465', city: 'Olavarria', zipCode: '4546', phone: '+5496549876521', email: 'other@unmail.com'},
        ]
      }
      this.setState ({
        contacts: response.contacts
      });
    }, 1000);    
  }

  toggleNears(){
    this.setState(prevState => (
      {nears: !prevState.nears}
    ))
  }

  onPressRow(contact){ 
    this.props.navigation.navigate('ContactAct')
  }

  render() {
    const { navigation } = this.props;
    const name = navigation.getParam('name', 'SIN NOMBRE');

    let list;
    if(this.state.contacts){
      let itemList = [];
      for(i=0; i< this.state.contacts.length; i++){
        itemList.push(
          <ListItem style={styles.listItem} key={'item_'+i}  
            onPress={this.onPressRow.bind(this, this.state.contacts[i])} >
            <Text>{this.state.contacts[i].agency}</Text>
            <Text>{this.state.contacts[i].address+' - '+this.state.contacts[i].city+' ('+this.state.contacts[i].zipCode+')'}</Text>
            <Text>{this.state.contacts[i].phone+' - '+this.state.contacts[i].email}</Text>
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
      list = <Spinner color='blue'/>
    }    

    return (
      <Container>
        <Header>
          <Left>
            <Button transparent>
              <Icon name='book' style={{fontSize: 32, color: 'white'}}/>
            </Button>
          </Left>
          <Body>
            <Title>Contactos</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => this.props.navigation.navigate('Home')}  style={{fontSize: 32}}>
              <Icon name='home'/>
            </Button>
            <Button transparent onPress={() => this.props.navigation.navigate('Map')}   style={{fontSize: 32}}>
              <Icon name='map'/>
            </Button>
          </Right>
        </Header>
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
              dataArray={datas}
              renderRow={data =>
              <ListItem thumbnail>
                <Left>
                  <Thumbnail square source={img_sample} />
                </Left>
                <Body>
                  <Text>
                    {data.agency}
                  </Text>
                  <Text numberOfLines={1} note>
                    {data.address} - {data.city} - {data.zipCode}
                  </Text>
                  <Text numberOfLines={1} note>
                    {data.event}
                  </Text>
                </Body>
                <Right>
                  <Button transparent>
                    <Text>View</Text>
                  </Button>
                </Right>
              </ListItem>}
            />

        </Content>
        <Footer>
          <FooterTab>
            <Button vertical onPress={() => this.props.navigation.navigate('Schedule')}>
              <Icon name="calendar" />
              <Text>Agenda</Text>
            </Button>
            <Button vertical onPress={() => this.props.navigation.navigate('Contacts')}>
              <Icon name="person" />
              <Text>Contactos</Text>
            </Button>
            <Button vertical active>
              <Icon active name="settings" />
              <Text>Config</Text>
            </Button>
            <Button vertical>
              <Icon name="sync" />
              <Text>Sinc</Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}