import React from 'react';

import { Footer, FooterTab, Text, Button, Icon } from 'native-base';


export default class FooterNavBar extends React.Component {
  constructor(props) {
    super(props);
  }

  goToActivities(){
    /* if(this.props.navigation.state.params && this.props.navigation.state.params.onGoBack){
      this.props.navigation.state.params.onGoBack();
    } */
    this.props.navigation.navigate('Schedule', {onGoBack: this.props.onGoBack})
  }

  goToContacts(){
    /* if(this.props.navigation.state.params && this.props.navigation.state.params.onGoBack){
      this.props.navigation.state.params.onGoBack();
    } */
    this.props.navigation.navigate('Contacts', {onGoBack: this.props.onGoBack})
  }

  goToConfiguration(){
    /* if(this.props.navigation.state.params && this.props.navigation.state.params.onGoBack){
      this.props.navigation.state.params.onGoBack();
    } */
    this.props.navigation.navigate('Configuration')
  }

  goToSincronize(){
    /* if(this.props.navigation.state.params && this.props.navigation.state.params.onGoBack){
      this.props.navigation.state.params.onGoBack();
    } */
    this.props.navigation.navigate('Sincronize', {onGoBack: this.props.onGoBack})
  }
  
  render() {
    
    return (
        <Footer>
          <FooterTab>
            <Button vertical { ...{active: this.props.navigation.state.routeName == 'Activities' || this.props.navigation.state.routeName == 'Activity' || this.props.navigation.state.routeName == 'Schedule' ? true : false} } onPress={() => this.goToActivities()}>
              <Icon name="tasks" />
              <Text style= {{ fontSize: 9 }}>Agenda</Text>
            </Button>
            <Button vertical { ...{active: this.props.navigation.state.routeName == 'Contacts' || this.props.navigation.state.routeName == 'ContactAct' || this.props.navigation.state.routeName == 'Survey' ? true : false} }  onPress={() => this.goToContacts()}>
              <Icon name="address-book" />
              <Text style= {{ fontSize: 9 }}>Cont.</Text>
            </Button>
            <Button vertical { ...{active: this.props.navigation.state.routeName == 'Configuration' ? true : false} }  onPress={() => this.goToConfiguration()}>
              <Icon active name="cog" />
              <Text style= {{ fontSize: 9 }}>Config.</Text>
            </Button>
            <Button vertical { ...{active: this.props.navigation.state.routeName == 'Sincronize' ? true : false} }  onPress={() => this.goToSincronize()}>
              <Icon name="retweet" />
              <Text style= {{ fontSize: 9 }}>Sinc.</Text>
            </Button>
          </FooterTab>
        </Footer>
    );
  }  
}