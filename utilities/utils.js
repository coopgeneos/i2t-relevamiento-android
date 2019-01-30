import AppConstans from '../constants/constants'

export function formatDate(date) {
    if(typeof(date.getFullYear) === 'function'){
      var month = date.getMonth() < 10 ? '0'+(date.getMonth()+1) : (date.getMonth()+1).toString();
      var day = date.getDate() < 10 ? '0'+date.getDate() : date.getDate().toString();
      return date.getFullYear()+'/'+month+'/'+day;
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
