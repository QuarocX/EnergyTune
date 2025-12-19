import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

import { DashboardScreen } from './src/screens/DashboardScreen';
import { EntryScreen } from './src/screens/EntryScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { TrendsDetailScreen } from './src/screens/TrendsDetailScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { getTheme } from './src/config/theme';
import { ToastProvider, useToast } from './src/contexts/ToastContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { Toast } from './src/components/ui/Toast';
import NotificationService from './src/services/notificationService';
import StorageService from './src/services/storage';
import { getTodayString } from './src/utils/helpers';

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
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  
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
      iconName = focused ? 'analytics' : 'analytics-outline';
      break;
    default:
      iconName = 'circle-outline';
  }

  return <Ionicons name={iconName} size={size} color={color} />;
};

// Global Toast Component
const GlobalToast = () => {
  const { currentToast } = useToast();
  
  if (!currentToast) return null;
  
  return <Toast {...currentToast} />;
};

// Main themed app component
const ThemedApp = () => {
  const { isDarkMode } = useTheme();
  const navigationRef = useRef();

  useEffect(() => {
    // Initialize notification service
    const init = async () => {
      try {
        await NotificationService.init();
        
        // Schedule notifications based on saved settings
        const settings = await StorageService.getNotificationSettings();
        if (settings.enabled) {
          await NotificationService.scheduleAllReminders(settings);
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };
    
    init();
    
    // Listen for notification responses (when user taps action or notification)
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        try {
          // Handle the notification response (quick-fill actions)
          await NotificationService.handleNotificationResponse(response);
          
          // If user tapped notification body (not action button), open Entry screen
          const actionId = response.actionIdentifier;
          if (!actionId || actionId === Notifications.DEFAULT_ACTION_IDENTIFIER) {
            const period = response.notification.request.content.data.period;
            
            // Navigate to Entry screen with the relevant period
            if (navigationRef.current) {
              navigationRef.current.navigate('MainTabs', {
                screen: 'Entry',
                params: {
                  date: getTodayString(),
                  focusPeriod: period,
                },
              });
            }
          }
        } catch (error) {
          console.error('Error handling notification response:', error);
        }
      }
    );
    
    return () => subscription.remove();
  }, []);

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationContainer ref={navigationRef}>
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
              gestureEnabled: true,
              gestureDirection: 'vertical',
            }}
          />
        </Stack.Navigator>
        <GlobalToast />
      </NavigationContainer>
    </>
  );
};

// Root App component with providers
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <ThemedApp />
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
