import React from 'react';
import {Image} from 'react-native'
import { Container, Header, Content, Footer, FooterTab, 
         Text, Button, Icon, CheckBox, List, ListItem,
         Form, Item, Label, Input, Left, Right, Radio } from 'native-base';

export default class SurveyScreen extends React.Component {
  constructor(props) {
    super();

    this.data = [
      {consigna: 'Foto exterior', tipo: 'imagen', img_uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png', boton: 'Guardar y seguir'},
      {consigna: 'Foto interior', tipo: 'imagen', img_uri: 'https://xeelha.files.wordpress.com/2017/01/img_2477.jpg?w=600', boton: 'Guardar y seguir'},
      {consigna: 'Uso del Display', tipo: 'radio', values: ['No usa', 'Usa el de CAS', 'Usa otro'], boton: 'Guardar y seguir'},
      {consigna: 'Uso del espacio', tipo: 'radio', values: ['100%', '80% - 20%', '50% - 50%', '20% - 80%', '0%'], boton: 'Guardar y salir'}
    ]

    this.state = {
      paso: 0,
      max_paso : this.data.length
    };

    this.save = this.save.bind(this);
  }
  
  save() {
    this.setState(prevState => (
      {paso: prevState.paso + 1}
    ))
  }
  
  render() {
    const { navigation } = this.props;
    const contacto = navigation.getParam('contacto', 'SIN CONTACTO');
    const domicilio = navigation.getParam('domicilio', 'SIN DOMICILIO');
    const detalle = navigation.getParam('detalle', 'SIN DETALLE');

    let field;
    if(this.state.paso >= this.state.max_paso){
      return this.props.navigation.navigate('Activities');
    }

    if(this.data[this.state.paso].tipo == 'imagen') {
      field = <Item><Image style={{width: 150, height: 150}} source={{uri: this.data[this.state.paso].img_uri}} /></Item>
    } else {
      field = [];
      for(i=0; i<this.data[this.state.paso].values.length; i++){
        field.push( 
          <ListItem selected={false} key={this.data[this.state.paso].values[i]}>
            <Left>
              <Radio
                color={"#f0ad4e"}
                selectedColor={"#5cb85c"}
                selected={false}
              />
            </Left>
            <Right>
              <Text>{this.data[this.state.paso].values[i]}</Text>
            </Right>
          </ListItem>
        );
      }
    }
    
    return (      
      <Container>
        <Header>
          <Text>Relevamiento</Text>
        </Header>
        <Content>
          <Form>         
            <Item inlineLabel>
              <Label>Contacto</Label>
              <Input value={contacto} editable={false}/>
            </Item>
            <Item inlineLabel last>
              <Label>Domicilio</Label>
              <Input value={domicilio} editable={false}/>
            </Item>
            <Item inlineLabel last>
              <Label>Detalle</Label>
              <Input value={detalle} editable={false}/>
            </Item>

            <Item inlineLabel last>
              <Label>Consigna</Label>
              <Input value={this.data[this.state.paso].consigna} editable={false}/>
            </Item>
            
            {field}

            <Item inlineLabel last>
              <Button onPress={() => this.save()}>
                <Text>{this.data[this.state.paso].boton}</Text>
              </Button>
              <Button onPress={() => alert('Omitiendo...')}>
                <Text>Omitir</Text>
              </Button>
            </Item> 
            <Button onPress={() => this.props.navigation.navigate('Activities')}>
              <Text>Volver</Text>
            </Button>
          </Form>        
        </Content>
        <Footer>
          <FooterTab>
            <Button vertical onPress={() => this.props.navigation.navigate('Home')}>
              <Icon name="calendar" />
              <Text>Agenda</Text>
            </Button>
            <Button vertical>
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