import * as Expo from "expo";
import React, { Component } from "react";
import { StyleProvider } from "native-base";
import { listFiles } from '../utilities/utils'
import sql_file from '../relevamiento.sql'

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
    await this.createDatabase();
    //await listFiles(Expo.FileSystem.documentDirectory);
    //this.testDatabase()
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
    return new Promise(async function(resolve, reject) {
      /**** Activar la siguiente linea si se quiere recrear la base desde cero ****/
      //await Expo.FileSystem.deleteAsync(`${Expo.FileSystem.documentDirectory}/SQLite`, {idempotent: true});
      
      Expo.FileSystem.getInfoAsync(`${Expo.FileSystem.documentDirectory}/SQLite/relevamiento.db`)
        .then(async db_file => {
          if(!db_file.exists){
            console.info('Se va a crear la base (/SQLite/relevamiento.db)');
            global.DB = Expo.SQLite.openDatabase('relevamiento.db');
            DB.transaction(tx => {
                var list = sql_file.SCHEMA;
                for(i=0; i<list.length; i++){
                  tx.executeSql(list[i],
                    [],
                    (_, rows) => {},
                    (_, err) => {
                    console.error(`ERROR en una de las sentencias ${err}`)
                    reject(`ERROR en una de las sentencias ${err}`)
                  })
                }
              },
              err => {
                console.error(`ERROR en la transaccion ${err}`)
                reject(`ERROR en una de las transacción ${err}`)
              },
              () => {
                console.info('Base de datos creada correctamente')
                resolve('Creada')
              }
            )                         
          } else {
            console.info('Se estableció correctamente la base de datos');
            global.DB = Expo.SQLite.openDatabase('relevamiento.db');
            resolve('Instaciada')
          }
        })
        .catch(err => {
          console.error(`Ocurrio un error consultando existencia de la base ${err}`)
          reject(err)
        })
    })
  }

  testDatabase(){
    var DB = Expo.SQLite.openDatabase('relevamiento.db');
    DB.transaction(tx => {
      tx.executeSql(
        `select * from User;`,
        [],
        (_, { rows }) => {
          console.log(JSON.stringify(rows))
        },
        (_, err) => {
          console.error(5);
          console.error(err)
        }
      )
    });
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