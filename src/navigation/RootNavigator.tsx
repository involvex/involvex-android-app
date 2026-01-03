/**
 * RootNavigator
 * Root stack navigator for the app
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabNavigator from './MainTabNavigator';

export type RootStackParamList = {
  MainTabs: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
