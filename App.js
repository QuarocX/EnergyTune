import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { DashboardScreen } from './src/screens/DashboardScreen';
import { EntryScreen } from './src/screens/EntryScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { TrendsDetailScreen } from './src/screens/TrendsDetailScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { theme } from './src/config/theme';
import { ToastProvider, useToast } from './src/contexts/ToastContext';
import { Toast } from './src/components/ui/Toast';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Analytics Stack Navigator
const AnalyticsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AnalyticsMain" component={AnalyticsScreen} />
      <Stack.Screen name="TrendsDetail" component={TrendsDetailScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator (without Profile)
const MainTabs = () => {
  return (
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
          fontSize: theme.typography?.caption1?.fontSize || 12,
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
        headerShown: false,
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
          tabBarLabel: 'Add Entry',
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsStack}
        options={{
          tabBarLabel: 'Analytics',
        }}
      />
    </Tab.Navigator>
  );
};

const getTabBarIcon = (routeName, focused, color, size) => {
  let iconName;

  switch (routeName) {
    case 'Dashboard':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Entry':
      iconName = focused ? 'add-circle' : 'add-circle-outline';
      break;
    case 'Analytics':
      iconName = focused ? 'bar-chart' : 'bar-chart-outline';
      break;
    default:
      iconName = 'circle-outline';
  }

  return <Ionicons name={iconName} size={size} color={color} />;
};

// Global Toast Component that uses context
const GlobalToast = () => {
  const { toast, hideToast } = useToast();
  
  return (
    <Toast
      message={toast.message}
      visible={toast.visible}
      type={toast.type}
      duration={2000}
      onHide={hideToast}
    />
  );
};

export default function App() {
  return (
    <ToastProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* Main app with tab navigation */}
          <Stack.Screen name="MainTabs" component={MainTabs} />
          
          {/* Profile screen as modal */}
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack.Navigator>
        <GlobalToast />
      </NavigationContainer>
    </ToastProvider>
  );
}
