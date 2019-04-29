import React from 'react';
import { StyleSheet, Text, View, BackHandler } from 'react-native'
import { FileSystem, MapView, Constants } from 'expo'
import { Button } from 'react-native-elements'
import AppConstans from '../constants/constants'
import DownloadSettings from '../components/DownloadSettings'
import {formatFolderMap, formatUrlMap} from '../utilities/utils'

export default class MapScreen extends React.Component {

  _didFocusSubscription;
  _willBlurSubscription;

  constructor(props) {
    super(props);

    this.state = {
      isOffline: false,
      showDownloadSettings: false,
      urlTemplate: `${AppConstans.MAP_URL_GOOGLE}&x={x}&y={y}&z={z}.png`,
      offlineUrlTemplate: `${AppConstans.TILE_FOLDER}/{x}/{y}/{z}.png`,
      mapRegion: {
        latitude: -35.8241454,
        longitude: -59.8613362,
        latitudeDelta: 1,
        longitudeDelta: 1,
      },
      markers: this.props.navigation.getParam('markers', null)
    }

    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
      BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }
  
  componentDidMount() {
    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }

  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
  }

  onBackButtonPressAndroid = () => {
    if(this.props.navigation.state.params && this.props.navigation.state.params.onGoBack){
      this.props.navigation.state.params.onGoBack();
    }

    this.props.navigation.goBack()
    
    return true;
  };

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
    if(this.state.markers) {
      this.state.markers.forEach(elem => {
        markers_onMap.push(
          <MapView.Marker key={elem.key}
            coordinate= {elem.coords}
            title = {elem.title}
            description= {elem.description}
          />
        )
      });
    }

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
          initialRegion={{
            latitude: -34.7973008,
            longitude: -60.9947733,
            latitudeDelta: 6,
            longitudeDelta: 6,
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
