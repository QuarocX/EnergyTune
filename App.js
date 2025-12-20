import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, LogBox, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

// Suppress specific warnings that don't affect functionality
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// Global error handler for uncaught errors (visible in production)
if (__DEV__) {
  // In development, errors will show in the red box
} else {
  // In production, catch errors and show alert
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('Global error caught:', error, 'isFatal:', isFatal);
    // Show alert for critical errors
    if (isFatal) {
      Alert.alert(
        'Unexpected Error',
        `Error: ${error?.message || 'Unknown error'}\n\nPlease restart the app.`,
        [{ text: 'OK' }]
      );
    }
    originalHandler(error, isFatal);
  });
}

import { DashboardScreen } from './src/screens/DashboardScreen';
import { EntryScreen } from './src/screens/EntryScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { WeeklySummaryScreen } from './src/screens/WeeklySummaryScreen';
import { getTheme } from './src/config/theme';
import { ToastProvider, useToast } from './src/contexts/ToastContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { Toast } from './src/components/ui/Toast';
import NotificationService from './src/services/notificationService';
import StorageService from './src/services/storage';
import { getTodayString } from './src/utils/helpers';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
        component={AnalyticsScreen}
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
    let subscription = null;
    
    // Initialize notification service
    const init = async () => {
      try {
        await NotificationService.init();
        
        // Schedule notifications based on saved settings
        const settings = await StorageService.getNotificationSettings();
        if (settings && settings.enabled) {
          await NotificationService.scheduleAllReminders(settings);
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
        // Don't crash the app if notifications fail
      }
    };
    
    // Run initialization
    init().catch(error => {
      console.error('Failed to initialize app:', error);
    });
    
    // Listen for notification responses (when user taps action or notification)
    try {
      subscription = Notifications.addNotificationResponseReceivedListener(
        async (response) => {
          try {
            // Handle the notification response (quick-fill actions)
            await NotificationService.handleNotificationResponse(response);
            
            // If user tapped notification body (not action button), handle navigation
            const actionId = response.actionIdentifier;
            const notificationType = response?.notification?.request?.content?.data?.type;
            
            if (!actionId || actionId === Notifications.DEFAULT_ACTION_IDENTIFIER) {
              // Check notification type
              if (notificationType === 'weekly_summary') {
                // Navigate to Weekly Summary screen
                if (navigationRef.current) {
                  navigationRef.current.navigate('WeeklySummary');
                }
              } else {
                // Original energy/stress check-in navigation
                const period = response?.notification?.request?.content?.data?.period;
                
                if (navigationRef.current && period) {
                  navigationRef.current.navigate('MainTabs', {
                    screen: 'Entry',
                    params: {
                      date: getTodayString(),
                      focusPeriod: period,
                    },
                  });
                }
              }
            }
          } catch (error) {
            console.error('Error handling notification response:', error);
          }
        }
      );
    } catch (error) {
      console.error('Error setting up notification listener:', error);
    }
    
    return () => {
      if (subscription) {
        try {
          subscription.remove();
        } catch (error) {
          console.error('Error removing subscription:', error);
        }
      }
    };
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
          
          {/* Weekly Summary screen */}
          <Stack.Screen 
            name="WeeklySummary" 
            component={WeeklySummaryScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'vertical',
            }}
          />
          
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

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaProvider>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Something went wrong</Text>
            <Text style={{ fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
              {this.state.error?.message || 'Unknown error'}
            </Text>
            <TouchableOpacity
              onPress={() => this.setState({ hasError: false, error: null })}
              style={{ padding: 15, backgroundColor: '#007AFF', borderRadius: 8 }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaProvider>
      );
    }

    return this.props.children;
  }
}

// Root App component with providers
export default function App() {
  try {
    return (
      <ErrorBoundary>
        <SafeAreaProvider>
          <ThemeProvider>
            <ToastProvider>
              <ThemedApp />
            </ToastProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Error rendering App:', error);
    Alert.alert('Startup Error', `Failed to start app: ${error?.message || 'Unknown error'}`);
    return null;
  }
}
