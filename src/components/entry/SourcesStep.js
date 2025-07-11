import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input } from '../ui/Input';
import { theme } from '../../config/theme';
import { entry as entryTexts } from '../../config/texts';


// SourcesStep component for energy and stress sources input
// This component allows users to input their energy and stress sources

export const SourcesStep = ({ 
  entry, 
  onEnergySourcesChange, 
  onStressSourcesChange 
}) => {
  return (
    <View style={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{entryTexts.sources.energyTitle}</Text>
        <Text style={styles.sectionSubtitle}>
          {entryTexts.sources.energySubtitle}
        </Text>
        <Input
          placeholder={entryTexts.sources.energyPlaceholder}
          value={entry?.energySources || ''}
          onChangeText={onEnergySourcesChange}
          multiline
          numberOfLines={3}
          showSaveIndicator={true}
          returnKeyType="done"
          blurOnSubmit={true}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{entryTexts.sources.stressTitle}</Text>
        <Text style={styles.sectionSubtitle}>
          {entryTexts.sources.stressSubtitle}
        </Text>
        <Input
          placeholder={entryTexts.sources.stressPlaceholder}
          value={entry?.stressSources || ''}
          onChangeText={onStressSourcesChange}
          multiline
          numberOfLines={3}
          showSaveIndicator={true}
          returnKeyType="done"
          blurOnSubmit={true}
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
});
