import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { common } from '../../config/texts';
import { canContinueFromStep } from '../../utils/entryValidation';

// Bottom navigation with back/continue/complete buttons

export const NavigationFooter = ({ 
  currentStep, 
  steps, 
  entry, 
  onBack, 
  onContinue, 
  onComplete,
  theme
}) => {
  const canContinue = canContinueFromStep(entry, currentStep, steps);
  const isSourcesStep = currentStep === steps.length - 1;

  // For sources step: show finish button with encouraging text
  const getFinishButtonText = () => {
    if (canContinue) {
      return common.complete;
    }
    return "Finish anyway";
  };

  return (
    <View style={[styles.navigationFooter, { 
      backgroundColor: theme.colors.primaryBackground,
      borderTopColor: theme.colors.separator,
    }]}>
      {currentStep > 0 && (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.systemBlue }]}>{common.back}</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.navigationSpacer} />
      
      {currentStep < steps.length - 1 ? (
        <TouchableOpacity 
          style={[
            styles.continueButton,
            { backgroundColor: canContinue ? theme.colors.systemBlue : theme.colors.systemGray4 },
            !canContinue && styles.continueButtonDisabled
          ]}
          onPress={onContinue}
          disabled={!canContinue}
        >
          <Text style={[
            styles.continueButtonText,
            !canContinue && styles.continueButtonTextDisabled
          ]}>
            {common.continue}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[
            styles.completeButton,
            { backgroundColor: canContinue ? theme.colors.systemGreen : theme.colors.systemOrange },
            !canContinue && styles.completeButtonIncomplete
          ]}
          onPress={onComplete}
        >
          <Text style={[
            styles.completeButtonText,
            !canContinue && styles.completeButtonTextIncomplete
          ]}>
            {getFinishButtonText()}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  navigationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
  },

  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  backButtonText: {
    fontSize: 17,
    fontWeight: '500',
  },

  navigationSpacer: {
    flex: 1,
  },

  continueButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },

  continueButtonDisabled: {
  },

  continueButtonText: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '600',
  },

  continueButtonTextDisabled: {
  },

  completeButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },

  completeButtonIncomplete: {
  },

  completeButtonText: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '600',
  },

  completeButtonTextIncomplete: {
    color: '#fff',
  },
});
