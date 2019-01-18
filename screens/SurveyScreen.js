import React from 'react';
import {Image} from 'react-native'
import { Container, Header, Content, Footer, FooterTab, 
         Text, Button, Icon, CheckBox, List, ListItem,
         Form, Item, Label, Input } from 'native-base';

export default class SurveyScreen extends React.Component {
  constructor(props) {
    super();
    this.state = {
      
    };
  }
  
  render() {
    const { navigation } = this.props;
    const contacto = navigation.getParam('contacto', 'SIN CONTACTO');
    const domicilio = navigation.getParam('domicilio', 'SIN DOMICILIO');
    const detalle = navigation.getParam('detalle', 'SIN DETALLE');

    return (      
      <Container>
        <Header>
          <Text>Relevamiento</Text>
        </Header>
        <Content>         
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
            <Input value={'Foto exterior'} editable={false}/>
          </Item>
          <Item>
            <Image
              style={{width: 150, height: 150}}
              source={{uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png'}}
            />
          </Item>
          <Item inlineLabel last>
            <Button onPress={() => alert('Guardo...')}>
              <Text>Guardar y salir</Text>
            </Button>
            <Button onPress={() => alert('Omitiendo...')}>
              <Text>Omitir</Text>
            </Button>
          </Item> 
          <Button onPress={() => this.props.navigation.navigate('Activities')}>
            <Text>Volver</Text>
          </Button>         
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