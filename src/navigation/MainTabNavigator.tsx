/**
 * MainTabNavigator
 * Bottom tab navigation with 4 main screens
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HackerTheme } from '../theme/colors';
import { Typography } from '../theme/typography';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Subscriptions: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabBarIcon = ({
  name,
  color,
  size,
}: {
  name: string;
  color: string;
  size: number;
}) => <Icon name={name} size={size} color={color} />;

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: HackerTheme.primary,
        tabBarInactiveTintColor: HackerTheme.lightGrey,
        tabBarStyle: {
          backgroundColor: HackerTheme.darkerGreen,
          borderTopColor: HackerTheme.darkGreen,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          ...Typography.captionText,
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: HackerTheme.darkerGreen,
          borderBottomColor: HackerTheme.darkGreen,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          ...Typography.heading2,
          color: HackerTheme.primary,
        },
        headerTintColor: HackerTheme.primary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Trending Hub',
          tabBarLabel: 'Trending',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="fire" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="magnify" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Subscriptions"
        component={SubscriptionsScreen}
        options={{
          title: 'Subscriptions',
          tabBarLabel: 'Subs',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="star" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
