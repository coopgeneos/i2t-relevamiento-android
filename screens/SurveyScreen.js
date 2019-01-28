import React from 'react';

import {Image} from 'react-native'

import { Container, Header, Content, Footer, FooterTab, Text, 
        Button, Icon, CheckBox, List, ListItem, Thumbnail, Form, Item, Label,
        Input, Left, Right, Spinner, Title, Body, DatePicker} from 'native-base';

export default class SurveyScreen extends React.Component {
  constructor() {
    super();

    this.state = {
      step: 0,
    };

    this.save = this.save.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      let response = [
        {title: 'Foto exterior', type: 'image', img_uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png', button_msg: 'Guardar y seguir'},
        {title: 'Foto interior', type: 'image', img_uri: 'https://xeelha.files.wordpress.com/2017/01/img_2477.jpg?w=600', button_msg: 'Guardar y seguir'},
        {title: 'Uso del Display', type: 'radio', values: ['No usa', 'Usa el de CAS', 'Usa otro'], button_msg: 'Guardar y seguir'},
        {title: 'Uso del espacio', type: 'radio', values: ['100%', '80% - 20%', '50% - 50%', '20% - 80%', '0%'], button_msg: 'Guardar y salir'}
      ];
      this.setState({
        dataSource: response,
        max_step: response.length - 1
      });
    }, 1000); 
  }
  
  save() {
    if(this.state.max_step && this.state.step == this.state.max_step){
      return this.props.navigation.navigate('Activities');
    }

    this.setState(prevState => (
      {step: prevState.step + 1}
    ))   
  }
  
  render() {
    const { navigation } = this.props;
    const contact = navigation.getParam('contact', 'SIN CONTACTO');
    const address = navigation.getParam('address', 'SIN DOMICILIO');
    const detail = navigation.getParam('detail', 'SIN DETALLE');

    let blockWithData;
    if(!this.state.dataSource){
      blockWithData = <Spinner color='blue'/>
    } else {
      let field;
      if(this.state.dataSource[this.state.step].type == 'image') {
        field = <Item key={'image'}><Image style={{width: 150, height: 150}} source={{uri: this.state.dataSource[this.state.step].img_uri}} /></Item>
      } else {
        field = []; 
        for(i=0; i<this.state.dataSource[this.state.step].values.length; i++){
          field.push( 
            <ListItem selected={false} key={this.state.dataSource[this.state.step].values[i]}>
              <Left>
                <Radio
                  color={"#f0ad4e"}
                  selectedColor={"#5cb85c"}
                  selected={false}
                />
              </Left>
              <Right>
                <Text>{this.state.dataSource[this.state.step].values[i]}</Text>
              </Right>
            </ListItem>
          );
        }
      }

      blockWithData = [];
      blockWithData.push(
        <Item inlineLabel last key={'title'}>
          <Label>title</Label>
          <Input value={this.state.dataSource[this.state.step].title} editable={false}/>
        </Item>);
      blockWithData.push(
        field
      );
      blockWithData.push(
        <Item inlineLabel last key={'buttons_act'}>
          <Button onPress={() => this.save()}>
            <Text>{this.state.dataSource[this.state.step].button_msg}</Text>
          </Button>
          <Button onPress={() => alert('Omitiendo...')}>
            <Text>Omitir</Text>
          </Button>
        </Item> 
      );
      blockWithData.push(
        <Button onPress={() => this.props.navigation.navigate('Activities')} key={'button_back'}>
          <Text>Volver</Text>
        </Button>
      );
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
            <Title>Encuesta</Title>
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
          <Form>         
            <Item inlineLabel>
              <Label>Contacto</Label>
              <Input value={contact} editable={false}/>
            </Item>
            <Item inlineLabel last>
              <Label>Domicilio</Label>
              <Input value={address} editable={false}/>
            </Item>
            <Item inlineLabel last>
              <Label>Detalle</Label>
              <Input value={detail} editable={false}/>
            </Item>

            {blockWithData}

          </Form>        
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