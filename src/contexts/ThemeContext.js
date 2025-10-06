import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState('system');
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  // Debug: Log the raw color scheme value like in Expo docs
  useEffect(() => {
  }, [systemColorScheme, themePreference, isDarkMode]);

  // Load saved preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Update dark mode when system changes or preference changes
  useEffect(() => {
    
    if (themePreference === 'system') {
      const newDarkMode = systemColorScheme === 'dark';
      setIsDarkMode(newDarkMode);
    } else {
      const newDarkMode = themePreference === 'dark';
      setIsDarkMode(newDarkMode);
    }
  }, [systemColorScheme, themePreference]);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem('themePreference');
      if (saved) {
        setThemePreference(saved);
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
    }
  };

  const setTheme = async (preference) => {
    try {
      await AsyncStorage.setItem('themePreference', preference);
      setThemePreference(preference);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  const value = {
    isDarkMode,
    themePreference,
    setTheme,
    toggleTheme: () => {
      const newPreference = themePreference === 'dark' ? 'light' : 'dark';
      setTheme(newPreference);
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
