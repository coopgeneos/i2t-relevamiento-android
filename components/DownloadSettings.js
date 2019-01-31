import React from 'react'
import { StyleSheet, Text, View, Slider, ActivityIndicator } from 'react-native'
import { FileSystem, Constants } from 'expo'
import { Card, Button } from 'react-native-elements'
import { tileGridForRegion } from '../utilities/TileGrid'
import AppConstants from '../constants/constants'
import {formatFolderMap, formatUrlMap} from '../utilities/utils'
import { checkForUpdateAsync } from 'expo/build/Updates/Updates';

export default class DownloadSettings extends React.Component {
  constructor(props) {
    super(props)
    const initialZoom = this._calcZoom(this.props.mapRegion.longitudeDelta)

    this.state = {
      minZoom: initialZoom,
      maxZoom: initialZoom,
      isLoading: false,
      tileGrid: tileGridForRegion(this.props.mapRegion, initialZoom, initialZoom),
    }
  }

  _checkAndCreateFolder = (path) => {
    return new Promise(function(resolve, reject) {
      FileSystem.getInfoAsync(path)
        .then(folder_info => {
          if (!Boolean(folder_info.exists)) {
            FileSystem.makeDirectoryAsync(path, { intermediates: true })
              .then(resp => {
                console.log('Se creó la carpeta '+path)
                resolve('OK')
              })
              .catch (error => {
                // Report folder creation error, include the folder existence before and now
                FileSystem.getInfoAsync(path)
                  .then(new_folder_info => {
                    const debug = `checkAndCreateFolder: ${
                      error.message
                    } old:${JSON.stringify(folder_info)} new:${JSON.stringify(
                      new_folder_info
                    )}`;
                    console.log(debug);
                    //Sentry.captureException(new Error(debug));
                    reject(debug)
                  })
                  .catch(err => {
                    reject(err)
                  })               
              })
          } else {
            resolve('OK, ya existia')
          }
        })
        .catch(err => {
          reject(err)
        })
    })      
  }

  _handleSliderChange = sliderValue => {
    const { mapRegion } = this.props

    const minZoom = this._calcZoom(mapRegion.longitudeDelta)
    const maxZoom = sliderValue
    const tileGrid = tileGridForRegion(mapRegion, minZoom, maxZoom)

    this.setState({ minZoom, maxZoom, tileGrid })
  }

  _fetchTiles = async () => {
    this.setState({ isLoading: true })

    const tiles = this.state.tileGrid

    for(i=0; i<tiles.length; i++){
      await this._checkAndCreateFolder(`${AppConstants.TILE_FOLDER}/${tiles[i].x}/${tiles[i].y}/${tiles[i].z}`)
        .catch(err => {
          console.log('Se produjo un error al crear una carpeta: '+err);
        })
    }
    
    const tile_downloads = tiles.map(tile => {
      const fetchUrl = `${AppConstants.MAP_URL_GOOGLE}&x=${tile.x}&y=${tile.y}&z=${tile.z}.png`
      const localLocation = `${AppConstants.TILE_FOLDER}/${tile.x}/${tile.y}/${tile.z}.png`
      FileSystem.downloadAsync(fetchUrl, localLocation)
        .then(resp => {
          console.log('Se descargo: '+resp)
        })
        .catch(err => {
          console.log('Algo sucedio al descargar mapa '+fetchUrl)
        })
    })

    const fileStatuses = await Promise.all(tile_downloads)
    console.log(`Downloaded ${fileStatuses.length} tiles`)

    this.setState({ isLoading: false })
    this.props.onSuccess()
  }

  _calcZoom = longitudeDelta => {
    return Math.round(Math.log(360 / longitudeDelta) / Math.LN2) + 2
  }

  render() {
    return (
      <Card title={'Nivel de detalle'} containerStyle={styles.container}>
        <Text style={styles.warningMessage}>
          Atención! Un alto nivel de detalle puede utilizar mucho espacion en memoria.
        </Text>

        <Slider
          step={1}
          minimumValue={this.state.minZoom}
          maximumValue={20}
          onValueChange={this._handleSliderChange}
        />

        <Text style={styles.estimate}>
          Tamaño estimado: {this.state.tileGrid.length * 3 / 1000} Mb
        </Text>

        {this.state.isLoading ? (
          <ActivityIndicator />
        ) : (
          <Button raised title="Descargar mapas" onPress={this._fetchTiles} />
        )}
      </Card>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  warningMessage: {
    marginVertical: 10,
    color: '#bbb',
    fontStyle: 'italic',
    fontSize: 10,
    textAlign: 'center',
  },
  estimate: {
    marginVertical: 15,
    textAlign: 'center',
  },
})
