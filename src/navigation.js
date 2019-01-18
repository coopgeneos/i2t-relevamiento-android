import React from 'react';
import { createAppContainer, createStackNavigator, StackActions, NavigationActions } from 'react-navigation'; // Version can be specified in package.json

import HomeScreen from '../screens/HomeScreen'
import DetailsScreen from '../screens/DetailsScreen'
import ScheduleScreen from '../screens/ScheduleScreen'
import ActivitiesScreen from '../screens/ActivitiesScreen'
import SurveyScreen from '../screens/SurveyScreen'

const AppNavigator = createStackNavigator(
  {
    Home: { screen: HomeScreen },
    Details: { screen: DetailsScreen },
    Schedule: { screen: ScheduleScreen },
    Activities: {screen: ActivitiesScreen },
    Survey: {screen: SurveyScreen }
  }, 
  {
    initialRouteName: 'Home',
  });

export default createAppContainer(AppNavigator);