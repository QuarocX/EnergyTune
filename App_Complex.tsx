// EnergyTune - Main App Component
// Professional React Native app with Apple-style navigation and design excellence

import React, { useEffect, useState } from "react";
import { StatusBar, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

// Import screens
import DashboardScreen from "./src/screens/Dashboard";
import EntryScreen from "./src/screens/Entry";
import TrendsScreen from "./src/screens/Trends";

// Import services and config
import { colors, spacing } from "./config/theme";
import { authHelpers } from "./src/services/supabase";
import { isOnboardingCompleted } from "./src/services/storage";

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab Navigator Component
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Entry":
              iconName = focused ? "add-circle" : "add-circle-outline";
              break;
            case "Trends":
              iconName = focused ? "analytics" : "analytics-outline";
              break;
            default:
              iconName = "home-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingTop: spacing.xs,
          paddingBottom: Platform.OS === "ios" ? spacing.md : spacing.sm,
          height: Platform.OS === "ios" ? 88 : 68,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: "Dashboard",
        }}
      />
      <Tab.Screen
        name="Entry"
        component={EntryScreen}
        options={{
          tabBarLabel: "Entry",
        }}
      />
      <Tab.Screen
        name="Trends"
        component={TrendsScreen}
        options={{
          tabBarLabel: "Trends",
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Component
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Check onboarding status
        const onboardingCompleted = await isOnboardingCompleted();
        setHasCompletedOnboarding(onboardingCompleted);

        // Set up auth state listener
        const { data: authListener } = authHelpers.onAuthStateChange((user) => {
          setIsAuthenticated(!!user);
        });

        // Cleanup function for auth listener
        return () => {
          authListener?.subscription?.unsubscribe?.();
        };
      } catch (error) {
        console.warn("App initialization error:", error);
      }
    }

    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <NavigationContainer
        theme={{
          dark: false,
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.background,
            text: colors.text,
            border: colors.border,
            notification: colors.primary,
          },
          fonts: {
            regular: {
              fontFamily: "System",
              fontWeight: "normal",
            },
            medium: {
              fontFamily: "System",
              fontWeight: "500",
            },
            bold: {
              fontFamily: "System",
              fontWeight: "bold",
            },
            heavy: {
              fontFamily: "System",
              fontWeight: "900",
            },
          },
        }}
      >
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            presentation: "card",
            animation: "slide_from_right",
          }}
        >
          {/* Main Tab Navigator */}
          <Stack.Screen name="MainTabs" component={TabNavigator} />

          {/* Modal Screens */}
          <Stack.Group
            screenOptions={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          >
            <Stack.Screen
              name="EntryModal"
              component={EntryScreen}
              options={{
                headerShown: true,
                headerTitle: "Daily Entry",
                headerTitleStyle: {
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: "600",
                },
                headerStyle: {
                  backgroundColor: colors.background,
                },
                headerTintColor: colors.primary,
              }}
            />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
