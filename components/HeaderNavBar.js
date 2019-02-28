import React from 'react';

import { Header, Left, Title, Body, Right, Text, Button, Icon } from 'native-base';


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
  
  render() {
    var map = this.props.map;
    if(map){
      map = <Button transparent onPress={() => this.props.navigation.navigate('Map', {markers: this.props.markers})}   style={{fontSize: 40}}>
              <Icon name='map-marker'/>
            </Button>
    }

    return (
        <Header>
          <Left>
            <Button transparent>
              <Icon name='yelp' style={{fontSize: 40, color: 'white'}}/>
            </Button>
          </Left>
          <Body>
            <Title>{this.props.title}</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => this.goBack()} style={{fontSize: 40}}>
              <Icon name='angle-double-left'/>
            </Button>
            <Button transparent onPress={() => this.props.navigation.navigate('Home')}  style={{fontSize: 40}}>
              <Icon name='home'/>
            </Button>
            {map}
          </Right>
        </Header>    );
  }  
}