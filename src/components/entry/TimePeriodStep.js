import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { RatingScale } from '../ui/RatingScale';
import { entry as entryTexts } from '../../config/texts';

// Reusable component for morning, afternoon, evening steps

export const TimePeriodStep = React.memo(({ 
  step, 
  stepTitle, 
  entry, 
  onEnergyChange, 
  onStressChange,
  theme
}) => {
  const handleEnergyChange = useCallback((value) => {
    // Update state immediately for instant response
    onEnergyChange(step, value);
    
    // Trigger haptic feedback asynchronously (non-blocking)
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [step, onEnergyChange]);

  const handleStressChange = useCallback((value) => {
    // Update state immediately for instant response
    onStressChange(step, value);
    
    // Trigger haptic feedback asynchronously (non-blocking)
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [step, onStressChange]);

  return (
    <View style={styles.content}>
      <View style={[styles.section, styles.firstSection, { backgroundColor: theme.colors.primaryBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.label }]}>
          {entryTexts.energy.title(stepTitle)}
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.secondaryLabel }]}>
          {entryTexts.energy.subtitle}
        </Text>
        <RatingScale
          type="energy"
          value={entry?.energyLevels?.[step] ?? null}
          onValueChange={handleEnergyChange}
          style={styles.ratingScale}
          theme={theme}
        />
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.primaryBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.label }]}>
          {entryTexts.stress.title(stepTitle)}
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.secondaryLabel }]}>
          {entryTexts.stress.subtitle}
        </Text>
        <RatingScale
          type="stress"
          value={entry?.stressLevels?.[step] ?? null}
          onValueChange={handleStressChange}
          style={styles.ratingScale}
          theme={theme}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  
  section: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 24,
    borderRadius: 12,
  },

  firstSection: {
    marginTop: 10,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  sectionSubtitle: {
    fontSize: 15,
    marginBottom: 16,
  },
  
  ratingScale: {
    marginTop: 8,
  },
});
