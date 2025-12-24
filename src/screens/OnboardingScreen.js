import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../config/theme';
import { WelcomeScreen } from '../components/onboarding/WelcomeScreen';
import { FeaturesScreen } from '../components/onboarding/FeaturesScreen';
import { SetupScreen } from '../components/onboarding/SetupScreen';
import StorageService from '../services/storage';

export const OnboardingScreen = ({ onComplete, isTest = false }) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const [currentScreen, setCurrentScreen] = useState(0);

  const handleWelcomeContinue = () => {
    setCurrentScreen(1);
  };

  const handleFeaturesContinue = () => {
    setCurrentScreen(2);
  };

  const handleComplete = async () => {
    try {
      // Mark onboarding as completed
      await StorageService.setOnboardingCompleted(true);
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still complete even if storage fails
      onComplete();
    }
  };

  const handleSkip = async () => {
    try {
      // Mark onboarding as completed even if skipped
      await StorageService.setOnboardingCompleted(true);
      onComplete();
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      // Still complete even if storage fails
      onComplete();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.secondaryBackground }]}>
      {currentScreen === 0 && (
        <WelcomeScreen onContinue={handleWelcomeContinue} />
      )}
      {currentScreen === 1 && (
        <FeaturesScreen onContinue={handleFeaturesContinue} />
      )}
      {currentScreen === 2 && (
        <SetupScreen onComplete={handleComplete} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

