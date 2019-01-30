import React from 'react';

import { Container, Header, Content, Footer, FooterTab, Text, Button, Spinner,
         Icon, Form, Item, Label, Input, Left, Title, Body, Right, Card, CardItem} from 'native-base';

import { StyleSheet, View, TouchableOpacity, Alert, ListView, ScrollView} from 'react-native';

import { Table, TableWrapper, Row, Cell } from 'react-native-table-component';

export default class ActivitiesScreen extends React.Component {
  constructor(props) {
    super(props);
    //En esta vista es necesario que las props recibidas sean parte del state
    const { navigation } = this.props;
    const contact = navigation.getParam('agency', 'SIN CONTACTO');
    console.log(contact);
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
      dataSource: dataSource,
      tableHead: ['Actividad', 'Fecha', ''],
      tableData: [
        ['Relevamiento fotográfico', '28/02/2019', 'A'],
        ['Encuesta de calidad', '28/03/2019', 'A'],
        ['Encuesta de satisfacción', '28/04/2019', 'A'],
        ['Relevamiento fotográfico', '28/02/2019', 'A'],
        ['Encuesta de calidad', '28/03/2019', 'A'],
        ['Encuesta de satisfacción', '28/04/2019', 'A'],
        ['Relevamiento fotográfico', '28/02/2019', 'A'],
        ['Encuesta de calidad', '28/03/2019', 'A'],
        ['Encuesta de satisfacción', '28/04/2019', 'A'],
        ['Relevamiento fotográfico', '28/02/2019', 'A'],
        ['Encuesta de calidad', '28/03/2019', 'A'],
        ['Encuesta de satisfacción', '28/04/2019', 'A']
      ]

    };

  }

  
  

  render() {

    let table;

    const state = this.state;

    const element = (data, index) => (
      <TouchableOpacity onPress={() => this._alertIndex(index)}>
        <View style={styles.btn_cont}>
            <Button transparent onPress={() => this.props.navigation.navigate('Activity',{contact: 'JUAN', address: 'ALBERDI', detail: 'MAS O MENOS'})}>
            <Icon name='edit'/>
            </Button>
            <Button transparent>
            <Icon name='battery-2'/>
            </Button>
        </View>
      </TouchableOpacity>
    );


    if(!this.state.tableData){
      table = <Spinner/>
    } else {
      table = <View style={styles.container}>
                <Table borderStyle={{borderColor: 'transparent'}}>
                  <Row data={state.tableHead} style={styles.head} textStyle={styles.text}/>
                  {
                    state.tableData.map((rowData, index) => (
                      <TableWrapper key={index} style={styles.row}>
                        {
                          rowData.map((cellData, cellIndex) => (
                            <Cell key={cellIndex} data={cellIndex === 2 ? element(cellData, index) : cellData} textStyle={cellIndex === 2 ? styles.text_head : styles.text}/>
                          ))
                        }
                      </TableWrapper>
                    ))
                  }
                </Table>
              </View>
    }

    return (
      <Container>
        <Header>
          <Left>
            <Button transparent>
              <Icon name='yelp' style={{fontSize: 34, color: 'white'}}/>
            </Button>
          </Left>
          <Body>
            <Title>Actividades</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => this.props.navigation.navigate('Home')}  style={{fontSize: 30}}>
              <Icon name='home'/>
            </Button>
            <Button transparent onPress={() => this.props.navigation.navigate('Map')}   style={{fontSize: 30}}>
              <Icon name='map-marker'/>
            </Button>
          </Right>
        </Header>
        <Content>
          
          <Card>
            <CardItem header>                        
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

            <CardItem footer>                        
            <Text></Text>
            </CardItem>
          </Card>


          {table}


        </Content>

        <Footer>
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
        </Footer>
      </Container>
    );
  }  
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 20, backgroundColor: '#fff' },
  head: { height: 40, backgroundColor: '#778591' },
  text: { margin: 6, fontSize: 12},
  text_head: { margin: 6, fontSize: 16, color: '#FFF',  fontSize: 18},
  row: { flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#778591', height: 40 },
  btn: { width: 58, height: 25, backgroundColor: '#F08377',  borderRadius: 2 },
  btn_cont: { flexDirection: 'row' },
  btnText: { textAlign: 'center', color: '#fff' }
});