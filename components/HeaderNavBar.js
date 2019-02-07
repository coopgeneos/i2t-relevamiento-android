import React from 'react';

import { Header, Left, Title, Body, Right, Text, Button, Icon } from 'native-base';


export default class HeaderNavBar extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
        <Header>
          <Left>
            <Button transparent>
              <Icon name='yelp' style={{fontSize: 34, color: 'white'}}/>
            </Button>
          </Left>
          <Body>
            <Title>{this.props.title}</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => this.props.navigation.navigate('Home')}  style={{fontSize: 30}}>
              <Icon name='home'/>
            </Button>
            <Button transparent onPress={() => this.props.navigation.navigate('Map', {markers: this.props.markers})}   style={{fontSize: 30}}>
              <Icon name='map-marker'/>
            </Button>
          </Right>
        </Header>    );
  }  
}