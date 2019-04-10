import React from 'react';

import { Footer, FooterTab, Text, Button, Icon } from 'native-base';


export default class FooterNavBar extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    
    return (
        <Footer>
          <FooterTab>
            <Button vertical { ...{active: this.props.navigation.state.routeName == 'Activities' || this.props.navigation.state.routeName == 'Activity' || this.props.navigation.state.routeName == 'Schedule' ? true : false} } onPress={() => this.props.navigation.navigate('Schedule')}>
              <Icon name="tasks" />
              <Text style= {{ fontSize: 9 }}>Agenda</Text>
            </Button>
            <Button vertical { ...{active: this.props.navigation.state.routeName == 'Contacts' || this.props.navigation.state.routeName == 'ContactAct' || this.props.navigation.state.routeName == 'Survey' ? true : false} }  onPress={() => this.props.navigation.navigate('Contacts')}>
              <Icon name="address-book" />
              <Text style= {{ fontSize: 9 }}>Contactos</Text>
            </Button>
            <Button vertical { ...{active: this.props.navigation.state.routeName == 'Configuration' ? true : false} }  onPress={() => this.props.navigation.navigate('Configuration')}>
              <Icon active name="cog" />
              <Text style= {{ fontSize: 9 }}>Config</Text>
            </Button>
            <Button vertical { ...{active: this.props.navigation.state.routeName == 'Sincronize' ? true : false} }  onPress={() => this.props.navigation.navigate('Sincronize')}>
              <Icon name="retweet" />
              <Text style= {{ fontSize: 9 }}>Sinc</Text>
            </Button>
          </FooterTab>
        </Footer>
    );
  }  
}