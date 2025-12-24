import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme } from '../../config/theme';
import { onboarding } from '../../config/onboardingTexts';
import { ExpandableFeature } from './ExpandableFeature';
import { hapticFeedback } from '../../utils/helpers';

export const FeaturesScreen = ({ onContinue }) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  const handleContinue = async () => {
    await hapticFeedback();
    onContinue();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.secondaryBackground }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.label }]}>
            {onboarding.features.title}
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {onboarding.features.items.map((feature, index) => (
            <ExpandableFeature
              key={feature.label}
              icon={feature.icon}
              label={feature.label}
              description={feature.description}
              expanded={feature.expanded}
              delay={index * 100}
            />
          ))}
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
              {onboarding.features.continueButton}
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
  titleContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
    textAlign: 'center',
  },
  featuresContainer: {
    gap: 8,
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

