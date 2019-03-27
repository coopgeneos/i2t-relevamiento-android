import { FileSystem, SQLite } from 'expo'

export default {
  TILE_FOLDER: `${FileSystem.documentDirectory}tiles`,
  MAP_URL_OSM: 'http://c.tile.openstreetmap.org',
  MAP_URL_GOOGLE: 'http://mt1.google.com/vt/lyrs=m',
  PHOTOS_DIR: `${FileSystem.documentDirectory}photos`,
  PHOTO_DEFAULT: 'https://cdn.dribbble.com/users/634336/screenshots/2246883/_____.png',
  TMP_FOLDER: `${FileSystem.documentDirectory}tmp`,

  ACTIVITY_NEW: 'Not Started',
  ACTIVITY_IN_PROGRESS: 'In Progress',
  ACTIVITY_COMPLETED: 'Completed',
  ACTIVITY_PENDING: 'Pending Input',
  ACTIVITY_CANCELED: 'Rechazada',

  ACTIVITY_PRIORITY_LOW: 'Low',
  ACTIVITY_PRIORITY_MEDIUM: 'Medium',
  ACTIVITY_PRIORITY_HIGH: 'High',
}