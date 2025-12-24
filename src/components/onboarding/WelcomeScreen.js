import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme } from '../../config/theme';
import { onboarding } from '../../config/onboardingTexts';
import { AnimatedWaves } from './AnimatedWaves';
import { hapticFeedback } from '../../utils/helpers';

export const WelcomeScreen = ({ onContinue }) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  const handleContinue = async () => {
    await hapticFeedback();
    onContinue();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.secondaryBackground }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Animated Waves Illustration */}
        <View style={styles.illustrationContainer}>
          <AnimatedWaves height={130} />
        </View>

        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.label }]}>
            {onboarding.welcome.title}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.secondaryLabel }]}>
            {onboarding.welcome.subtitle}
          </Text>
        </View>

        {/* Personal Story */}
        <View style={[styles.storyContainer, { backgroundColor: theme.colors.primaryBackground }]}>
          <Text style={[styles.story, { color: theme.colors.secondaryLabel }]}>
            {onboarding.welcome.story}
          </Text>
        </View>

        {/* Spacer to push button to bottom */}
        <View style={styles.spacer} />

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: theme.colors.systemBlue }]}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>
              {onboarding.welcome.continueButton}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  illustrationContainer: {
    marginTop: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 25,
    textAlign: 'center',
  },
  storyContainer: {
    padding: 20,
    borderRadius: 16,
  },
  story: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 24,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

