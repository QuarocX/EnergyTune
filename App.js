import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { DashboardScreen } from './src/screens/DashboardScreen';
import { EntryScreen } from './src/screens/EntryScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { theme } from './src/config/theme';

const Tab = createBottomTabNavigator();

const getTabBarIcon = (routeName, focused, color, size) => {
  let iconName;

  switch (routeName) {
    case 'Dashboard':
      iconName = focused ? 'analytics' : 'analytics-outline';
      break;
    case 'Entry':
      iconName = focused ? 'add-circle' : 'add-circle-outline';
      break;
    case 'Profile':
      iconName = focused ? 'person' : 'person-outline';
      break;
    default:
      iconName = 'circle-outline';
  }

  return <Ionicons name={iconName} size={size} color={color} />;
};

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) =>
              getTabBarIcon(route.name, focused, color, size),
            tabBarActiveTintColor: theme.colors.systemBlue,
            tabBarInactiveTintColor: theme.colors.systemGray,
            tabBarStyle: {
              backgroundColor: theme.colors.primaryBackground,
              borderTopColor: theme.colors.separator,
            },
            tabBarLabelStyle: {
              fontSize: theme.typography.caption1.fontSize,
              fontWeight: '500',
            },
            headerStyle: {
              backgroundColor: theme.colors.primaryBackground,
              shadowColor: 'transparent',
              elevation: 0,
            },
            headerTitleStyle: {
              fontSize: theme.typography.headline.fontSize,
              fontWeight: theme.typography.headline.fontWeight,
              color: theme.colors.label,
            },
            headerShown: false, // We handle headers in individual screens
          })}
        >
          <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              tabBarLabel: 'Dashboard',
            }}
          />
          <Tab.Screen
            name="Entry"
            component={EntryScreen}
            options={{
              tabBarLabel: 'Track Energy',
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: 'Profile',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
