import React from 'react';

import { Header, Left, Title, Body, Right, Text, Button, Icon, View } from 'native-base';
import { Image } from 'react-native';

import { executeSQL } from '../utilities/utils'


export default class HeaderNavBar extends React.Component {
  constructor(props) {
    super(props);
  }

  goBack(){
    if(this.props.navigation.state.params && this.props.navigation.state.params.onGoBack){
      this.props.navigation.state.params.onGoBack();
    }
    this.props.navigation.goBack()
  }

  goHome(){ 
    if(this.props.navigation.state.params && this.props.navigation.state.params.onGoBack){
      this.props.navigation.state.params.onGoBack();
    }

    /* Envío como parámetro un objeto vacío, para que al cargar la página llame al render() */
    this.props.navigation.navigate('Home', {})
  }
  
  
  render() {
    var map = this.props.map;
    if(map){
      map = <Button transparent onPress={() => this.props.navigation.navigate('Map', {markers: this.props.markers})}   style={{fontSize: 50}}>
              <Icon name='map-marker'/>
            </Button>
    }

    return (
        <Header>
          <Left style={{width: 200}}>
            <Button transparent>
            <Image source={require("../assets/i2tbco.png")} style={{width: 193, height: 80}} />
            </Button>
          </Left>
          <Right>
            {/* <Title>{this.props.title}</Title> */}
            <Button transparent onPress={() => this.goBack()} style={{fontSize: 50}}>
              <Icon name='angle-double-left'/>
            </Button>
            <Button transparent onPress={() => this.goHome()}  style={{fontSize: 50}}>
              <Icon name='home'/>
            </Button>
            {map}
          </Right>
        </Header>    );
  }  
}