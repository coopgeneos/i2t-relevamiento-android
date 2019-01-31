import { FileSystem } from 'expo'

export default {
  TILE_FOLDER: `${FileSystem.documentDirectory}tiles`,
  MAP_URL_OSM: 'http://c.tile.openstreetmap.org',
  MAP_URL_GOOGLE: 'http://mt1.google.com/vt/lyrs=m',
  PHOTOS_DIR: `${FileSystem.documentDirectory}photos`,
}