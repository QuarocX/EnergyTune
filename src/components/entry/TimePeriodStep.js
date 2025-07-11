import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { RatingScale } from '../ui/RatingScale';
import { theme } from '../../config/theme';
import { entry as entryTexts } from '../../config/texts';

// Reusable component for morning, afternoon, evening steps

export const TimePeriodStep = ({ 
  step, 
  stepTitle, 
  entry, 
  onEnergyChange, 
  onStressChange 
}) => {
  const handleEnergyChange = async (value) => {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onEnergyChange(step, value);
  };

  const handleStressChange = async (value) => {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onStressChange(step, value);
  };

  return (
    <View style={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {entryTexts.energy.title(stepTitle)}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {entryTexts.energy.subtitle}
        </Text>
        <RatingScale
          type="energy"
          value={entry?.energyLevels?.[step] ?? null}
          onValueChange={handleEnergyChange}
          style={styles.ratingScale}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {entryTexts.stress.title(stepTitle)}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {entryTexts.stress.subtitle}
        </Text>
        <RatingScale
          type="stress"
          value={entry?.stressLevels?.[step] ?? null}
          onValueChange={handleStressChange}
          style={styles.ratingScale}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  
  section: {
    backgroundColor: theme.colors.primaryBackground,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  
  sectionTitle: {
    fontSize: theme.typography.headline.fontSize,
    fontWeight: theme.typography.headline.fontWeight,
    color: theme.colors.label,
    marginBottom: theme.spacing.xs,
  },
  
  sectionSubtitle: {
    fontSize: theme.typography.subhead.fontSize,
    color: theme.colors.secondaryLabel,
    marginBottom: theme.spacing.md,
  },
  
  ratingScale: {
    marginTop: theme.spacing.sm,
  },
});
