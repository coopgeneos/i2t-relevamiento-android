import React from 'react';

import { Container,Footer, FooterTab, Text, Button, Icon } from 'native-base';


export default class FooterNavBar extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    
    return (
      <Container>
          <FooterTab>
            <Button vertical active onPress={() => this.props.navigation.navigate('Schedule')}>
              <Icon name="tasks" />
              <Text>Agenda</Text>
            </Button>
            <Button vertical>
              <Icon name="address-book" onPress={() => this.props.navigation.navigate('Contacts')}/>
              <Text>Contactos</Text>
            </Button>
            <Button vertical>
              <Icon active name="cog" />
              <Text>Config</Text>
            </Button>
            <Button vertical>
              <Icon name="retweet" />
              <Text>Sinc</Text>
            </Button>
          </FooterTab>
        </Container>
    );
  }  
}