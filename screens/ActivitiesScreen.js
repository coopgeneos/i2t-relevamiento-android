import React from 'react';
import { Container, Header, Content, Footer, FooterTab, Text, Button, 
         Icon, Form, Item, Label, Input } from 'native-base';
import { Cell, DataTable, HeaderCell, Row } from 'react-native-data-table';
import { ListView } from 'react-native';
import styles from './Styles';

export default class ActivitiesScreen extends React.Component {
  constructor() {
    super();
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });

    this.state = {
      dataMock: [{contacto: 'Juan Garcia', domicilio: 'Buzini 455'}],
      dataSource: dataSource,
    };

    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  componentWillMount() {
    const data =  [
      {detalle: 'Hola', fecha: '2018-01-01', editar: true},
      {detalle: 'Hola', fecha: '2018-01-01', editar: true}
     ];
    this.setState({
      data: data,
      dataSource: this.state.dataSource.cloneWithRows(data),
    });
}
  
  renderHeader() {
    /*const headerCells = [];
    if (this.state.data && this.state.data.length > 0) {
      const firstObject = this.state.data[0];
      for (const [key] of Object.entries(firstObject)) {
        headerCells.push(
          <HeaderCell
            key={key}
            style={styles.headerCell}
            textStyle={styles.text}
            width={1}
            text={key}
          />
        );
      }
    }
    return (
      <Header style={styles.header}>
        {headerCells}
      </Header>
    );*/
    return (
      <Header style={styles.header}>
        <HeaderCell text={'Detalle'} style={styles.headerCell} textStyle={styles.headerCellText} width={1} />
        <HeaderCell text={'Fecha'} style={styles.headerCell} textStyle={styles.headerCellText} width={1} />
        <HeaderCell text={''} style={styles.headerCell} textStyle={styles.headerCellText} width={1} />
      </Header>
    );
  }

  renderRow(item) {
    /*const cells = [];
    if (this.state.data && this.state.data.length > 0) {
      const firstObject = this.state.data[0];
      for (const [key] of Object.entries(firstObject)) {
        let itemString = item[key]
          && ((typeof item[key] === 'string')
          || (typeof item[key] === 'number')
          || (typeof item[key].getMonth === 'function'))
          && String(item[key]);
        if (!itemString && item[key] && item[key].length) itemString = item[key].length;
        if (typeof item[key] === 'boolean') itemString = item[key] ? 'True' : 'False';
        if (!itemString && item[key] && item[key].id) itemString = item[key].id;
        cells.push(
          <Cell
            key={key}
            style={styles.cell}
            textStyle={styles.text}
            width={1}
          >
            {itemString}
          </Cell>
        );
      }
    }
    return (
      <Row style={styles.row}>
        {cells}
      </Row>
    );*/
    return (
      <Row style={styles.row}>
        <Cell style={styles.cell} textStyle={styles.cellText} width={1} >
            <Text onPress={() => this.props.navigation.navigate('Survey',{contacto: this.state.dataMock[0].contacto, domicilio: this.state.dataMock[0].domicilio, detalle: item.detalle})}>
              {item.detalle}
            </Text>
        </Cell>
        <Cell style={styles.cell} textStyle={styles.cellText} width={1} >
            {item.fecha}
        </Cell>
        <Cell style={styles.cell} textStyle={styles.cellText} width={1} >
          <Item inlineLabel>
            <Icon name='create' onPress={() => this.props.navigation.navigate('Activity',{contacto: this.state.dataMock[0].contacto, domicilio: this.state.dataMock[0].domicilio, detalle: item.detalle})}/>  
            <Icon name='clock'/>
          </Item>
        </Cell>
      </Row>
    );
  }

  render() {
    return (
      <Container>
        <Header>
          <Text style={styles.header}>Actividades</Text>
        </Header>
        <Content>
          <Form>
            <Item inlineLabel>
              <Label>Contacto</Label>
              <Input value={this.state.dataMock[0].contacto} editable={false}/>
            </Item>
            <Item inlineLabel last>
              <Label>Domicilio</Label>
              <Input value={this.state.dataMock[0].domicilio} editable={false}/>
            </Item>
          </Form>
          <Item style={styles.dataTableContainer}>
            <Item style={styles.dataTable}>
              <DataTable  
                dataSource={this.state.dataSource}
                renderRow={this.renderRow}
                renderHeader={this.renderHeader}
              />
            </Item>
          </Item>

          <Button onPress={() => this.props.navigation.navigate('Schedule')}>
            <Text>Volver</Text>
          </Button>
        </Content>
        <Footer>
          <FooterTab>
            <Button vertical onPress={() => this.props.navigation.navigate('Schedule')}>
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