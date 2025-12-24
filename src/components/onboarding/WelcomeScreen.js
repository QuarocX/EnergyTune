import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme } from '../../config/theme';
import { onboarding } from '../../config/onboardingTexts';
import { AnimatedWaves } from './AnimatedWaves';
import { hapticFeedback } from '../../utils/helpers';

export const WelcomeScreen = ({ onContinue }) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  // Animation refs
  const wavesOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.8)).current;
  const hookOpacity = useRef(new Animated.Value(0)).current;
  const hookTranslateY = useRef(new Animated.Value(10)).current;
  const storyOpacity = useRef(new Animated.Value(0)).current;
  const storyTranslateY = useRef(new Animated.Value(20)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      // Waves fade in (faster)
      Animated.timing(wavesOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Title with bounce
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(titleScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Hook line
      Animated.parallel([
        Animated.timing(hookOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(hookTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Story card slides up
      Animated.parallel([
        Animated.timing(storyOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(storyTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Button fades in with scale
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleContinue = async () => {
    await hapticFeedback();
    onContinue();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.secondaryBackground }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Animated Waves Illustration */}
        <Animated.View style={[styles.illustrationContainer, { opacity: wavesOpacity }]}>
          <AnimatedWaves height={160} />
        </Animated.View>

        {/* Title Section with staggered animations */}
        <View style={styles.titleContainer}>
          <Animated.Text
            style={[
              styles.title,
              {
                color: theme.colors.label,
                opacity: titleOpacity,
                transform: [{ scale: titleScale }],
              },
            ]}
          >
            {onboarding.welcome.title}
          </Animated.Text>
          
          {/* Hook Line */}
          <Animated.Text
            style={[
              styles.hook,
              {
                color: theme.colors.systemBlue,
                opacity: hookOpacity,
                transform: [{ translateY: hookTranslateY }],
              },
            ]}
          >
            {onboarding.welcome.hook}
          </Animated.Text>
        </View>

        {/* Personal Story */}
        <Animated.View
          style={[
            styles.storyContainer,
            {
              backgroundColor: theme.colors.primaryBackground,
              opacity: storyOpacity,
              transform: [{ translateY: storyTranslateY }],
            },
          ]}
        >
          <Text style={[styles.story, { color: theme.colors.secondaryLabel }]}>
            {onboarding.welcome.story}
          </Text>
        </Animated.View>

        {/* Spacer to push button to bottom */}
        <View style={styles.spacer} />

        {/* Continue Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonOpacity,
              transform: [{ scale: buttonScale }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: theme.colors.systemBlue }]}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>
              {onboarding.welcome.continueButton}
            </Text>
          </TouchableOpacity>
        </Animated.View>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
    marginBottom: 12,
    textAlign: 'center',
  },
  hook: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
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

