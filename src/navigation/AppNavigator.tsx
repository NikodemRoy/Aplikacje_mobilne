import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CalendarScreen from '../screens/home/CalendarScreen';
import ReportScreen from '../screens/home/ReportScreen';
import ActivityScreen from '../screens/home/ActivityScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

export type HomeStackParamList = {
  Calendar: undefined;
  Report: { year: string; month: string; day: string };
  Activity: { year: string; month: string; day: string };
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator initialRouteName="Calendar">
      <HomeStack.Screen name="Calendar" component={CalendarScreen} />
      <HomeStack.Screen name="Report" component={ReportScreen} />
      <HomeStack.Screen name="Activity" component={ActivityScreen} />
    </HomeStack.Navigator>
  );
}

export type TabParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
