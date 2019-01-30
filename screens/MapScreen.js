import React from 'react';
import { StyleSheet, Text, View } from 'react-native'
import { FileSystem, MapView, Constants } from 'expo'
import { Button } from 'react-native-elements'
import AppConstans from '../constants/constants'
import DownloadSettings from '../components/DownloadSettings'
import {formatFolderMap, formatUrlMap} from '../utilities/utils'

export default class MapScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      isOffline: false,
      showDownloadSettings: false,
      urlTemplate: `${AppConstans.MAP_URL_GOOGLE}&x={x}&y={y}&z={z}.png`,
      offlineUrlTemplate: `${AppConstans.TILE_FOLDER}/{x}/{y}/{z}.png`,
      mapRegion: { //Tandil
        latitude: -37.3348,
        longitude: -59.1305,
        latitudeDelta: 1,
        longitudeDelta: 1,
      },
      markers: []
    }
  }
  
  componentDidMount() {
    setTimeout(() => {
      let response = [
        {title: 'Geneos', description: 'Coop de trabajo', coords: { latitude: -37.32655, longitude: -59.13119}},
        {title: 'Plaza', description: 'Lugar de descanso', coords: { latitude: -37.32861, longitude: -59.13709}},
      ];
      this.setState({
        markers: response
      });
    }, 500); 
  }

  clearTiles = async () => {
    try {
      await FileSystem.deleteAsync(AppConstans.TILE_FOLDER)
    } catch (error) {
      console.log('Tiles allready deleted')
    }
  }

  handleMapRegionChange = mapRegion => {
    this.setState({
      mapRegion,
    })
  }

  downloadMaps = () => {
    var old = this.state.showDownloadSettings;
    this.setState({ showDownloadSettings: !old })
  }

  render() {
    const { isOffline, showDownloadSettings } = this.state
    const urlTemplate = isOffline
      ? this.state.offlineUrlTemplate
      : this.state.urlTemplate

    var markers_onMap = []
    this.state.markers.forEach(elem => {
      markers_onMap.push(
        <MapView.Marker key={elem.title}
          coordinate= {elem.coords}
          title = {elem.title}
          description= {elem.description}
        />
      )
    });

    return (
      <View style={styles.container}>
        <View style={styles.actionContainer}>
          <Button
            raised
            borderRadius={5}
            title={'Descargar'}
            onPress={() => this.downloadMaps()}
          />
          <Button
            raised
            borderRadius={5}
            title={'Limpiar mapas'}
            onPress={this.clearTiles}
          />
          <Button
            raised
            borderRadius={5}
            title={isOffline ? 'Online' : 'Offline'}
            onPress={() => {
              isOffline
                ? this.setState({ isOffline: false })
                : this.setState({ isOffline: true })
            }}
          />
        </View>

        <MapView
          style={{ flex: 1 }}
          initialRegion={{ //Tandil
            latitude: -37.3348,
            longitude: -59.1305,
            latitudeDelta: 1,
            longitudeDelta: 1,
          }}
          onRegionChange={this.handleMapRegionChange}>
          <MapView.UrlTile urlTemplate={urlTemplate} zIndex={1} />

          {markers_onMap}

        </MapView>

        {this.state.showDownloadSettings && (
          <DownloadSettings
            mapRegion={this.state.mapRegion}
            onSuccess={() => {
              this.setState({ showDownloadSettings: false })
            }}
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  actionContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 15,
    paddingTop: Constants.statusBarHeight + 15,
    zIndex: 999,
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 10,
  },
  container: {
    flex: 1,
  },
})
