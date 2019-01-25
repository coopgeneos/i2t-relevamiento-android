import React from 'react';

import { Container, Header, Content, Footer, FooterTab, Text, Button, 
         Icon, Form, Item, Label, Input, Left, Title, Body, Right, Card, CardItem} from 'native-base';

import { Cell, DataTable, HeaderCell, Row } from 'react-native-data-table';
import { ListView } from 'react-native';
import styles from './Styles';

export default class ActivitiesScreen extends React.Component {
  constructor(props) {
    super(props);
    //En esta vista es necesario que las props recibidas sean parte del state
    const { navigation } = this.props;
    const contact = navigation.getParam('agency', 'SIN CONTACTO');
    const address = navigation.getParam('address', 'SIN DOMICILIO');
    const city = navigation.getParam('city', 'SIN CONTACTO');

    console.log(contact);
    console.log(address);
    
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });

    this.state = {
      contact: contact,
      address: address,
      city: city,
      dataSource: dataSource
    };

    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      let response = [
        {detail: 'Actividad 1', date: '2018-01-01', state: 'completed'},
        {detail: 'Actividad 2', date: '2018-01-01', state: 'draft'}
      ];
      this.setState({
        data: response,
        dataSource: this.state.dataSource.cloneWithRows(response),
      });
    }, 2000); 
  }
  
  renderHeader() {
    return (
      <Header style={styles.header}>
        <HeaderCell text={'Detalle'} style={styles.headerCell} textStyle={styles.headerCellText} width={1} />
        <HeaderCell text={'Fecha'} style={styles.headerCell} textStyle={styles.headerCellText} width={1} />
        <HeaderCell text={''} style={styles.headerCell} textStyle={styles.headerCellText} width={1} />
      </Header>
    );
  }

  renderRow(item) {
    let action = [];
    if(item.state == 'draft'){
      action.push(<Icon key={item.detail+'_create'} name='create' onPress={() => this.props.navigation.navigate('Activity',{contact: this.state.contact, address: this.state.address, detail: item.detail})}/>);
      action.push(<Icon key={item.detail+'_clock'} name='clock'/>);
    }
    if(item.state == 'completed')
      action.push(<Icon key={item.detail+'_check'} name='md-checkmark-circle'/>)

    return (
      <Row style={styles.row} key={item.detail}>
        <Cell style={styles.cell} textStyle={styles.cellText} width={1} >
            <Text onPress={() => this.props.navigation.navigate('Survey',{contact: this.state.contact, address: this.state.address, detail: item.detail})}>
              {item.detail}
            </Text>
        </Cell>
        <Cell style={styles.cell} textStyle={styles.cellText} width={1} >
            {item.date}
        </Cell>
        <Cell style={styles.cell} textStyle={styles.cellText} width={1} >
          <Item inlineLabel>
            {action}
          </Item>
        </Cell>
      </Row>
    );
  }

  render() {
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent>
              <Icon name='book' style={{fontSize: 32, color: 'white'}}/>
            </Button>
          </Left>
          <Body>
            <Title>Actividades</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => this.props.navigation.navigate('Home')}  style={{fontSize: 32}}>
              <Icon name='home'/>
            </Button>
            <Button transparent onPress={() => this.props.navigation.navigate('Map')}   style={{fontSize: 32}}>
              <Icon name='map'/>
            </Button>
          </Right>
        </Header>
        <Content>
          
          <Card>
            <CardItem header style={{color:'#534D64', backgroundColor: '#778591'}}>                        
            <Text>Datos de Contacto</Text>
            </CardItem>

            <CardItem>                        
            <Label style={{ width: 80 }}>Contacto</Label><Text>{this.state.contact}</Text>
            </CardItem>
            <CardItem>                        
            <Label style={{ width: 80 }}>Domicilio</Label><Text>{this.state.address}</Text>
            </CardItem>
            <CardItem>                        
            <Label style={{ width: 80 }}>Ciudad</Label><Text>{this.state.city}</Text>
            </CardItem>

            <CardItem footer style={{ height: 10, backgroundColor: '#94A6B5'}}>                        
            <Text></Text>
            </CardItem>
          </Card>

          <Item style={styles.dataTableContainer}>
            <Item style={styles.dataTable}>
              <DataTable  
                dataSource={this.state.dataSource}
                renderRow={this.renderRow}
                renderHeader={this.renderHeader}
              />
            </Item>
          </Item>

        </Content>
        <Footer>
          <FooterTab>
            <Button vertical onPress={() => this.props.navigation.navigate('Schedule')}>
              <Icon name="calendar" />
              <Text>Agenda</Text>
            </Button>
            <Button vertical>
              <Icon name="person" onPress={() => this.props.navigation.navigate('Contact')}/>
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