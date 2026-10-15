/**
 * MainTabNavigator
 * Bottom tab navigation with 4 main screens
 */

import React from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { HackerTheme } from "../theme/colors";
import { Typography } from "../theme/typography";
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import SubscriptionsScreen from "../screens/SubscriptionsScreen";
import SettingsScreen from "../screens/SettingsScreen";

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Subscriptions: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabBarIcon =
  (name: string) =>
  ({ color, size }: { color: string; size: number }) => (
    <Icon name={name} size={size} color={color} />
  );

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: HackerTheme.primary,
        tabBarInactiveTintColor: HackerTheme.lightGrey,
        tabBarStyle: {
          // Near-black surface so the green accent pops; a subtle top border
          // separates it from the content area without a heavy green wash.
          backgroundColor: HackerTheme.darkerGreen,
          borderTopColor: HackerTheme.mediumGrey,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          ...Typography.captionText,
          fontSize: 11,
          lineHeight: 14,
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: HackerTheme.darkerGreen,
          borderBottomColor: HackerTheme.mediumGrey,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
        headerTitleStyle: {
          ...Typography.heading2,
          color: HackerTheme.primary,
          fontSize: 20,
        },
        headerTintColor: HackerTheme.primary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Trending Hub",
          tabBarLabel: "Trending",
          tabBarIcon: TabBarIcon("fire"),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: "Search",
          tabBarIcon: TabBarIcon("magnify"),
        }}
      />
      <Tab.Screen
        name="Subscriptions"
        component={SubscriptionsScreen}
        options={{
          title: "Subscriptions",
          tabBarLabel: "Subs",
          tabBarIcon: TabBarIcon("star"),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          tabBarIcon: TabBarIcon("cog"),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
