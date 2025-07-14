import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, InputAccessoryView, KeyboardAvoidingView } from 'react-native';
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
  const energyInputRef = useRef(null);
  const stressInputRef = useRef(null);

  const energyAccessoryViewID = 'energyNavigation';
  const stressAccessoryViewID = 'stressNavigation';

  const renderEnergyAccessoryView = () => {
    if (Platform.OS !== 'ios') return null;
    
    return (
      <InputAccessoryView nativeID={energyAccessoryViewID}>
        <View style={styles.inputAccessory}>
          <View style={styles.navigationButtons}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => energyInputRef.current?.focus()}
            >
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => stressInputRef.current?.focus()}
            >
              <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => {
              energyInputRef.current?.blur();
              stressInputRef.current?.blur();
            }}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </InputAccessoryView>
    );
  };

  const renderStressAccessoryView = () => {
    if (Platform.OS !== 'ios') return null;
    
    return (
      <InputAccessoryView nativeID={stressAccessoryViewID}>
        <View style={styles.inputAccessory}>
          <View style={styles.navigationButtons}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => energyInputRef.current?.focus()}
            >
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => stressInputRef.current?.focus()}
            >
              <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => {
              energyInputRef.current?.blur();
              stressInputRef.current?.blur();
            }}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </InputAccessoryView>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      {renderEnergyAccessoryView()}
      {renderStressAccessoryView()}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{entryTexts.sources.energyTitle}</Text>
        <Text style={styles.sectionSubtitle}>
          {entryTexts.sources.energySubtitle}
        </Text>
        <Input
          ref={energyInputRef}
          placeholder={entryTexts.sources.energyPlaceholder}
          value={entry?.energySources || ''}
          onChangeText={onEnergySourcesChange}
          multiline
          numberOfLines={3}
          showSaveIndicator={true}
          inputAccessoryViewID={Platform.OS === 'ios' ? energyAccessoryViewID : undefined}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{entryTexts.sources.stressTitle}</Text>
        <Text style={styles.sectionSubtitle}>
          {entryTexts.sources.stressSubtitle}
        </Text>
        <Input
          ref={stressInputRef}
          placeholder={entryTexts.sources.stressPlaceholder}
          value={entry?.stressSources || ''}
          onChangeText={onStressSourcesChange}
          multiline
          numberOfLines={3}
          showSaveIndicator={true}
          inputAccessoryViewID={Platform.OS === 'ios' ? stressAccessoryViewID : undefined}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  section: {
    backgroundColor: theme.colors.primaryBackground,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  sectionTitle: {
    fontSize: theme.typography.headline.fontSize,
    fontWeight: theme.typography.headline.fontWeight,
    color: theme.colors.label,
    flex: 1,
  },

  nextButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.systemBlue,
    borderRadius: theme.borderRadius.sm,
  },

  nextButtonText: {
    fontSize: theme.typography.subhead.fontSize,
    color: '#fff',
    fontWeight: '600',
  },
  
  sectionSubtitle: {
    fontSize: theme.typography.subhead.fontSize,
    color: theme.colors.secondaryLabel,
    marginBottom: theme.spacing.md,
  },

  // Input Accessory View Styles (iOS keyboard toolbar)
  inputAccessory: {
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#d0d0d0',
  },

  navigationButtons: {
    flexDirection: 'row',
  },

  navButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },

  navButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.systemBlue,
    fontWeight: '500',
  },

  doneButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },

  doneButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.systemBlue,
    fontWeight: '600',
  },

  // Debug styles - remove after testing
  debugButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.md,
    backgroundColor: '#f0f0f0',
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },

  debugButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.systemBlue,
    borderRadius: theme.borderRadius.sm,
  },
});
