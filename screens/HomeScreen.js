import React from 'react';
import { Container, Header, Content, Icon, Text, Button, Item,
        Form, Input, Label, Left, Spinner, Body, Right, Title } from 'native-base';
import {formatDate} from '../utilities/utils';
import { Grid, Row, Col } from "react-native-easy-grid";
// import styles from "./Styles";

export default class HomeScreen extends React.Component { 
  constructor() {
    super();   
    this.state = {
      user: '',
      lastSync : '',
      pendingSyncs : ''
    };    
  }

  // Metodo donde llamar a los WS iniciales
  componentDidMount() {
    //simulo al WS
    setTimeout(() => {
      let loggedUser = {name: 'Luis', lastName: 'Segundo', email: 'luissegundo@unmail.com',lastSync: new Date(), pendingSyncs: 5};
      this.setState ({
        user: loggedUser.email,
        lastSync: formatDate(loggedUser.lastSync),
        pendingSyncs: loggedUser.pendingSyncs.toString(),
        completeName: loggedUser.name+' '+loggedUser.lastName,
      });
    }, 1000);    
  }
  
  render() {
    let formItem;
    if(this.state.user == ''){
      formItem = <Spinner color='blue'/>
    } else {
      formItem = <Form>
                  <Item inlineLabel>
                    <Left style={{flexShrink: 2}}><Label>Usuario</Label></Left>
                    <Left style={{flexGrow: 2}}><Input value={this.state.user} editable={false}/></Left>
                  </Item>
                  <Item inlineLabel>
                    <Left><Label>Ultima sincronización</Label></Left>
                    <Left><Input value={this.state.lastSync} editable={false}/></Left>
                  </Item>
                  <Item inlineLabel last>
                    <Left><Label>Pendientes sincronización</Label></Left>
                    <Left><Input value={this.state.pendingSyncs} editable={false}/></Left>
                  </Item>
                </Form>
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
            <Title>Relevamiento</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name='menu'/>
            </Button>
          </Right>
        </Header>
        <Content style={{padding: 10}}>
        <Grid style={{ alignItems: 'center', backgroundColor: "#534D64" }}>
          <Row  style={{ height: 120 }}>
            <Col>
            <Button transparent onPress={() => this.props.navigation.navigate('Schedule')} block style={{flex: 1, fontSize: 80}}>
              <Icon name='calendar' style={{fontSize: 80}}/>
            </Button>
            </Col>
            <Col>
            <Button transparent onPress={() => this.props.navigation.navigate('Contacts')} block style={{flex: 1}}>
              <Icon name='contact' style={{fontSize: 80}}/>
            </Button>
            </Col>
          </Row>
          <Row  style={{ height: 120 }}>
            <Col>
            <Button transparent onPress={() => alert('No hago nada')} block style={{flex: 1}}>
              <Icon name='settings' style={{fontSize: 80}}/>
            </Button>
            </Col>
            <Col>
            <Button transparent onPress={() => alert('No hago nada')} block style={{flex: 1}}>
              <Icon name='sync' style={{fontSize: 80 }}/>

            </Button>
            </Col>
          </Row>
        </Grid>
        {formItem}
        </Content>
      </Container>
    );
  }
}