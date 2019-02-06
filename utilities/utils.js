import AppConstans from '../constants/constants';
import { FileSystem } from 'expo';

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

