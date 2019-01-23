import React from 'react';
import { createAppContainer, createStackNavigator, StackActions, NavigationActions } from 'react-navigation'; // Version can be specified in package.json

import HomeScreen from '../screens/HomeScreen'
import ContactsScreen from '../screens/ContactsScreen'
import ScheduleScreen from '../screens/ScheduleScreen'
import ActivitiesScreen from '../screens/ActivitiesScreen'
import SurveyScreen from '../screens/SurveyScreen'
import ActivityScreen from '../screens/ActivityScreen'
import MapScreen from '../screens/MapScreen'

const AppNavigator = createStackNavigator(
  {
    Home: { screen: HomeScreen },
    Contacts: { screen: ContactsScreen },
    Schedule: { screen: ScheduleScreen },
    Activities: {screen: ActivitiesScreen },
    Survey: {screen: SurveyScreen },
    Activity: {screen: ActivityScreen },
    Map: {screen: MapScreen }
  }, 
  {
    initialRouteName: 'Home',
  });

export default createAppContainer(AppNavigator);