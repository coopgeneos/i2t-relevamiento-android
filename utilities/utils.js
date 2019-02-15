import AppConstans from '../constants/constants';
import { FileSystem, Location, Permissions } from 'expo';
import { computeDistanceBetween } from 'spherical-geometry-js';

export function formatDate(date) {
    if(typeof(date.getFullYear) === 'function'){
      var month = date.getMonth() < 10 ? '0'+(date.getMonth()+1) : (date.getMonth()+1).toString();
      var day = date.getDate() < 10 ? '0'+date.getDate() : date.getDate().toString();
      //console.log(`${date.getFullYear()}/${month}/${day}`);
      return `${date.getFullYear()}/${month}/${day}`;
    }
    return 'Error: is not a Date'
  }

export function formatFolderMap(provider, x, y, z) {
  console.log(`FOLDER ${provider} ${x} ${y} ${z}`)
  if(typeof x === 'number' && typeof y === 'number' && typeof z === 'number' 
    && typeof provider === 'string'){
    switch(provider) {
      case 'OSM':
        return `${AppConstans.TILE_FOLDER}/${z}/${x}/${y}.png`;
      case 'GOOGLE':
        return `${AppConstans.TILE_FOLDER}/${x}/${y}/${z}.png`
      default:
        return null
    }
} else {
    throw new Error('Alguno de los parámetros tiene un formato no válido')
  }
}

export function formatUrlMap(provider, x, y, z) {
  console.log(`URL ${provider} ${x} ${y} ${z}`)
  if(typeof x === 'number' && typeof y === 'number' && typeof z === 'number' 
    && typeof provider === 'string'){
    switch(provider) {
      case 'OSM':
        return `${AppConstans.MAP_URL_OSM}/${z}/${x}/${y}.png`;
      case 'GOOGLE':
        return `${AppConstans.MAP_URL_GOOGLE}&x=${z}&y=${x}&z=${y}.png`;
      default:
        return null
    }
} else {
    throw new Error('Alguno de los parámetros tiene un formato no válido')
  }
}

export async function listFiles(fileUri){
  FileSystem.getInfoAsync(fileUri)
    .then(async item => {
      if(item.isDirectory){
        console.log(`${fileUri} (DIR)`);
        var list = await FileSystem.readDirectoryAsync(fileUri)
        for(i=0; i<list.length; i++){
          await listFiles(`${item.uri}/${list[i]}`)
        }
        return;
      } else {
        return console.log(`${item.uri}`);
      }
    })
    .catch(err => {
      console.error(`ERROR al leer ${err}`)
    })

  /*return new Promise(async function(resolve, reject) {
    console.log(fileUri)
    var list = await FileSystem.readDirectoryAsync(fileUri)
      .catch(err => {
        console.error('No es Directorio')
        resolve('');
      })
    for(i=0; i<list.length; i++){
      var item = await FileSystem.getInfoAsync(`${fileUri}/${list[i]}`)
      if(!item.isDirectory){
        console.log(`${item.uri}`)
      } else {
        await listFiles(`${item.uri}`)
      }
    resolve('OK')
    }
  })*/
}

export function cleanDirectory(folder_path) {
  return new Promise(async function(resolve, reject) {
    //var folder_path = await FileSystem.documentDirectory;
    var folder = FileSystem.getInfoAsync(folder_path);
    if(folder.isDirectory){
      var list = await FileSystem.readDirectoryAsync(folder)
      var promises = [];
      for(i=0; i<list.length; i++){
        promises.push(FileSystem.deleteAsync(`${folder}/${list[i]}`, {idempotent: true}));
      }
      Promise.all(promises)
        .then(values => {
          resolve('Ok');
        })
        .catch(err => {
          console.error(`ERROR al eliminar: ${err}`)
        })
    } else {
      reject('No es carpeta');
    }
  })
}

export function executeSQL(sql, params){
  //var DB = Expo.SQLite.openDatabase('relevamiento.db');
  return new Promise(async function(resolve, reject) {
    global.DB.transaction(tx => {
      tx.executeSql(
        sql,
        params,
        (_, { rows }) => {
          resolve(rows._array)
        },
        (_, err) => {
          reject(err)
        }
      )
    });
  })
}

export async function getLocationAsync(){
  return new Promise(async function(resolve, reject) {
    try {
      let { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status !== 'granted') {
        this.setState({
          errorMessage: 'Permission to access location was denied',
        });
      }
      //let location = await Location.getCurrentPositionAsync({});
      let location = {
        "timestamp":1550166625527,
        "mocked":false,
        "coords":{
          "heading":0,
          "longitude":-59.131096,
          "speed":0,
          "altitude":210.8000030517578,
          "latitude":-37.3266809,
          "accuracy":15.392999649047852
        }
      }
      resolve(location);
    } catch (err) {
      console.log(err)
      reject(err)
    }
  })
}

export function isClose(a, b, distance){
  let distanceBetween = computeDistanceBetween(a,b)
  return (distanceBetween < distance)
}

export async function getConfiguration(key){
  return new Promise(async function(resolve, reject) {
    if(!global.context.conf){
      global.context.conf = {};
    }
    if(global.context.conf[key]) {
      resolve(global.context.conf[key])
    } else {
      global.DB.transaction(tx => {
        tx.executeSql(
          ` select value from Configuration where key = ?`,
          [key],
          (_, { rows }) => {
            global.context.conf[key] = rows._array[0];
            resolve(rows._array[0])
          },
          (_, err) => {
            reject(err)
          }
        )
      });
    }
  })
}

