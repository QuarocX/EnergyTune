import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, InputAccessoryView, KeyboardAvoidingView } from 'react-native';
import { Input } from '../ui/Input';
import { entry as entryTexts } from '../../config/texts';


// SourcesStep component for energy and stress sources input
// This component allows users to input their energy and stress sources

export const SourcesStep = ({ 
  entry, 
  onEnergySourcesChange, 
  onStressSourcesChange,
  theme
}) => {
  const energyInputRef = useRef(null);
  const stressInputRef = useRef(null);

  const energyAccessoryViewID = 'energyNavigation';
  const stressAccessoryViewID = 'stressNavigation';

  const renderEnergyAccessoryView = () => {
    if (Platform.OS !== 'ios') return null;
    
    return (
      <InputAccessoryView nativeID={energyAccessoryViewID}>
        <View style={[styles.inputAccessory, { backgroundColor: theme.colors.tertiaryBackground }]}>
          <View style={styles.navigationButtons}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => energyInputRef.current?.focus()}
            >
              <Text style={[styles.navButtonText, { color: theme.colors.systemBlue }]}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => stressInputRef.current?.focus()}
            >
              <Text style={[styles.navButtonText, { color: theme.colors.systemBlue }]}>Next</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => {
              energyInputRef.current?.blur();
              stressInputRef.current?.blur();
            }}
          >
            <Text style={[styles.doneButtonText, { color: theme.colors.systemBlue }]}>Done</Text>
          </TouchableOpacity>
        </View>
      </InputAccessoryView>
    );
  };

  const renderStressAccessoryView = () => {
    if (Platform.OS !== 'ios') return null;
    
    return (
      <InputAccessoryView nativeID={stressAccessoryViewID}>
        <View style={[styles.inputAccessory, { backgroundColor: theme.colors.tertiaryBackground }]}>
          <View style={styles.navigationButtons}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => energyInputRef.current?.focus()}
            >
              <Text style={[styles.navButtonText, { color: theme.colors.systemBlue }]}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => stressInputRef.current?.focus()}
            >
              <Text style={[styles.navButtonText, { color: theme.colors.systemBlue }]}>Next</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => {
              energyInputRef.current?.blur();
              stressInputRef.current?.blur();
            }}
          >
            <Text style={[styles.doneButtonText, { color: theme.colors.systemBlue }]}>Done</Text>
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
      
      <View style={[styles.section, { backgroundColor: theme.colors.primaryBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.label }]}>{entryTexts.sources.energyTitle}</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.secondaryLabel }]}>
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
          theme={theme}
        />
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.primaryBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.label }]}>{entryTexts.sources.stressTitle}</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.secondaryLabel }]}>
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
          theme={theme}
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
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    borderRadius: 12,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },

  nextButton: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
  },

  nextButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  
  sectionSubtitle: {
    fontSize: 15,
    marginBottom: 16,
  },

  // Input Accessory View Styles (iOS keyboard toolbar)
  inputAccessory: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#d0d0d0',
  },

  navigationButtons: {
    flexDirection: 'row',
  },

  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginRight: 8,
  },

  navButtonText: {
    fontSize: 17,
    fontWeight: '500',
  },

  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },

  doneButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },

  // Debug styles - remove after testing
  debugButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#f0f0f0',
    margin: 16,
    borderRadius: 8,
  },

  debugButton: {
    padding: 8,
    borderRadius: 8,
  },

  debugButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
