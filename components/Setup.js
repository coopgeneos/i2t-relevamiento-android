import * as Expo from "expo";
import React, { Component } from "react";
import { StyleProvider } from "native-base";
import { listFiles } from '../utilities/utils'

import Navigation from "../navigation/navigation";
import getTheme from "../native-base-theme/components";
import variables from "../native-base-theme/variables/commonColor";

export default class Setup extends Component {
  constructor() {
    super();
    this.state = {
      isReady: false
    };
  }

  async componentWillMount() {
    this.loadFonts();
    //await this.createDatabase();
    //await listFiles(Expo.FileSystem.documentDirectory);
  }

  async loadFonts() {
    await Expo.Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      Ionicons: require("@expo/vector-icons/fonts/Ionicons.ttf")
    });
    this.setState({ isReady: true });
  }

  async createDatabase(){
    await Expo.FileSystem.deleteAsync(`${Expo.FileSystem.documentDirectory}/SQLite`, {idempotent: true});
    Expo.FileSystem.getInfoAsync(`${Expo.FileSystem.documentDirectory}/SQLite/relevamiento.db`)
      .then(async db_file => {
        if(!db_file.exists){
          //TODO: ver como crear la estructura de tablas
          console.log('Se va a crear la base (/SQLite/relevamiento.db)');
          await Expo.FileSystem.makeDirectoryAsync(`${Expo.FileSystem.documentDirectory}/SQLite`)
            .catch(err => {
              console.error(1)
            })
          await Expo.FileSystem.copyAsync({from: '../relevamiento.sql', to: `${Expo.FileSystem.documentDirectory}/SQLite/relevamiento.sql`})
            .catch(err => {
              console.error(2)
            })
          global.DB = Expo.SQLite.openDatabase('relevamiento.db');
          DB.transaction(tx => {
            tx.executeSql(
              `.read relevamiento.sql`,
              [],
              (_, err) => {},
              (_, err) => {
                console.error(3);
                console.error(err)
              }
            )
          });
        }
      })
      .catch(err => {
        console.error('Ocurrio un error consultando existencia de la base')
      })
  }

  render() {
    if (!this.state.isReady) {
      return <Expo.AppLoading />;
    }
    return (
      <StyleProvider style={getTheme(variables)}>
        <Navigation />
      </StyleProvider>
    );
  }
}