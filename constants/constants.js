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

  ITEM_TYPE_IMAGE: 'imagen',
  ITEM_TYPE_TEXT: 'texto',
  ITEM_TYPE_CHOICE: 'sel_simpl',
  ITEM_TYPE_CHOICE_MULT: 'sel_mult',
  ITEM_TYPE_NUMBER: 'number',
  ITEM_TYPE_CONDITIONAL_IMAGE: 'conditional',
  ITEM_TYPE_CHARACTER: 'caracter',

  WS_LOGIN: '/login/',
  WS_CONTACT_DOWNLOAD: '/api/proc/ExtraeContactos', 
  WS_ACTIVITY_DOWNLOAD: '/api/proc/ExtraeTareas',
  WS_ACTIVITYTYPE_DOWNLOAD: '/api/proc/ExtraeActividades',
  WS_ITEMACTTYPE_DOWNLOAD: '/api/proc/ExtraeConsignas',
  WS_LISTITEMACT_DOWNLOAD: '/api/proc/ExtraeReferencias',
  WS_ACTIVITY_UPLOAD: '/api/proc/tasksINS',
  WS_ANSWER_UPLOAD: '/api/proc/relevamientoINS',
  WS_IMAGE_UPLOAD: '/api/imagenes/attachments',
  WS_IMAGE_LINKING: '/api/proc/actualizarURLImagenUPD'
  
}