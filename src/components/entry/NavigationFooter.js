import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
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
  
  // Animation references
  const completeButtonScale = useRef(new Animated.Value(1)).current;
  const completeButtonOpacity = useRef(new Animated.Value(1)).current;

  // For sources step: show finish button with encouraging text
  const getFinishButtonText = () => {
    if (canContinue) {
      return common.complete;
    }
    return common.finishAnyway;
  };

  // Apple-style celebration animation
  const handleCompletePress = () => {
    // More impactful haptic feedback for button press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Quick, subtle button animation (150ms total)
    Animated.sequence([
      // Quick press down
      Animated.parallel([
        Animated.timing(completeButtonScale, {
          toValue: 0.95,
          duration: 75,
          useNativeDriver: true,
        }),
        Animated.timing(completeButtonOpacity, {
          toValue: 0.8,
          duration: 75,
          useNativeDriver: true,
        }),
      ]),
      // Quick release with slight bounce
      Animated.parallel([
        Animated.timing(completeButtonScale, {
          toValue: 1,
          duration: 75,
          useNativeDriver: true,
        }),
        Animated.timing(completeButtonOpacity, {
          toValue: 1,
          duration: 75,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Navigate immediately after animation
      onComplete();
    });
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
        <Animated.View
          style={{
            transform: [{ scale: completeButtonScale }],
            opacity: completeButtonOpacity,
          }}
        >
          <TouchableOpacity 
            style={[
              styles.completeButton,
              { backgroundColor: canContinue ? theme.colors.systemGreen : theme.colors.systemOrange },
              !canContinue && styles.completeButtonIncomplete
            ]}
            onPress={handleCompletePress}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.completeButtonText,
              !canContinue && styles.completeButtonTextIncomplete
            ]}>
              {getFinishButtonText()}
            </Text>
          </TouchableOpacity>
        </Animated.View>
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
