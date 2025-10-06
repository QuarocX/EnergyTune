import React, { useRef } from 'react';
import { View, Text, StyleSheet, Keyboard } from 'react-native';
import { Input } from '../ui/Input';
import { entry as entryTexts } from '../../config/texts';


// SourcesStep component for energy and stress sources input
// This component allows users to input their energy and stress sources

export const SourcesStep = ({ 
  entry, 
  onEnergySourcesChange, 
  onStressSourcesChange,
  onTextInputFocus,
  onTextInputBlur,
  onStressSourceFocus,
  theme
}) => {
  const energyInputRef = useRef(null);
  const stressInputRef = useRef(null);

  const handleDone = () => {
    // Dismiss keyboard
    Keyboard.dismiss();
  };

  const handleStressSourceFocus = () => {
    onTextInputFocus();
    if (onStressSourceFocus) {
      onStressSourceFocus();
    }
  };

  return (
    <View style={styles.container}>
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
          onFocus={onTextInputFocus}
          onBlur={onTextInputBlur}
          multiline
          numberOfLines={3}
          showSaveIndicator={true}
          returnKeyType="done"
          blurOnSubmit={true}
          onSubmitEditing={handleDone}
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
          onFocus={handleStressSourceFocus}
          onBlur={onTextInputBlur}
          multiline
          numberOfLines={3}
          showSaveIndicator={true}
          returnKeyType="done"
          blurOnSubmit={true}
          onSubmitEditing={handleDone}
          theme={theme}
        />
      </View>
    </View>
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
});
