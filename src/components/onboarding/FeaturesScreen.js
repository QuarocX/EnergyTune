import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Sources Encouragement Message */}
        <View style={[styles.sourcesMessageContainer, { backgroundColor: `${theme.colors.systemBlue}15` }]}>
          <Text style={[styles.sourcesMessage, { color: theme.colors.systemBlue }]}>
            {onboarding.features.sourcesMessage}
          </Text>
        </View>

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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
  },
  titleContainer: {
    alignItems: 'center',
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
    marginBottom: 20,
  },
  sourcesMessageContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  sourcesMessage: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 8,
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

