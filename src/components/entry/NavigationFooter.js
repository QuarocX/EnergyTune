import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../config/theme';
import { common } from '../../config/texts';
import { canContinueFromStep } from '../../utils/entryValidation';

// Bottom navigation with back/continue/complete buttons

export const NavigationFooter = ({ 
  currentStep, 
  steps, 
  entry, 
  onBack, 
  onContinue, 
  onComplete 
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
    <View style={styles.navigationFooter}>
      {currentStep > 0 && (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>{common.back}</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.navigationSpacer} />
      
      {currentStep < steps.length - 1 ? (
        <TouchableOpacity 
          style={[
            styles.continueButton,
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primaryBackground,
    borderTopWidth: 1,
    borderTopColor: theme.colors.separator,
  },

  backButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },

  backButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.systemBlue,
    fontWeight: '500',
  },

  navigationSpacer: {
    flex: 1,
  },

  continueButton: {
    backgroundColor: theme.colors.systemBlue,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    minWidth: 100,
    alignItems: 'center',
  },

  continueButtonDisabled: {
    backgroundColor: theme.colors.systemGray4,
  },

  continueButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: '#fff',
    fontWeight: '600',
  },

  continueButtonTextDisabled: {
    color: theme.colors.systemGray,
  },

  completeButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    minWidth: 70,
    alignItems: 'center',
  },

  completeButtonIncomplete: {
    backgroundColor: theme.colors.systemGray4,
  },

  completeButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: '#fff',
    fontWeight: '600',
  },

  completeButtonTextIncomplete: {
    color: theme.colors.systemGray,
  },
});
