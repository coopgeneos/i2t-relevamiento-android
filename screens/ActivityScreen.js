import React from 'react';
import { Container, Header, Content, Footer, FooterTab, 
         Text, Button, Icon, CheckBox, Form, Item,
         Label, Input, Textarea } from 'native-base';

export default class ScheduleScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      
    };
  }
  
  saveActivity(){
    //TODO: Implementar save
    //Redirijo
    this.props.navigation.navigate('Activities');
  }

  render() {
    const { navigation } = this.props;
    const contacto = navigation.getParam('contacto', 'SIN CONTACTO');
    const domicilio = navigation.getParam('domicilio', 'SIN DOMICILIO');
    const detalle = navigation.getParam('detalle', 'SIN DETALLE');

    return (
      <Container>
        <Header>
          <Text>Actividad</Text>
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
            <Item>
              <Label>Notas</Label>
              <Textarea rowSpan={5} bordered placeholder="Ingrese sus notas aquí..." />
            </Item>
            <Item>
              <CheckBox checked={false} />
              <Label>Cancelada</Label>  
            </Item>
            <Item>
              <Label>Motivo de cancelación</Label>
              <Textarea rowSpan={3} bordered placeholder="Ingrese sus motivos aquí..." />
            </Item>
            <Button onPress={() => this.props.navigation.navigate('Activities')}>
              <Text>Cancelar</Text>
            </Button>
            <Button onPress={() => this.saveActivity()}>
              <Text>Guardar</Text>
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