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

  // Calculate tinted background color
  const getTintedBackground = () => {
    const isDark = theme.colors.secondaryBackground === '#000000';
    // Add 5% white tint in dark mode, 5% black tint in light mode
    return isDark 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.03)';
  };

  return (
    <View style={styles.navigationFooterContainer}>
      <View style={[styles.tintOverlay, { backgroundColor: getTintedBackground() }]} />
      <View style={[styles.navigationFooter, { 
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
    </View>
  );
};

const styles = StyleSheet.create({
  navigationFooterContainer: {
    position: 'relative',
  },

  tintOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },

  navigationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    zIndex: 1,
  },

  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginLeft: -8,
  },

  backButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  navigationSpacer: {
    flex: 1,
  },

  continueButton: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 110,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  continueButtonDisabled: {
    shadowOpacity: 0.05,
  },

  continueButtonText: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: -0.3,
  },

  continueButtonTextDisabled: {
  },

  completeButton: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },

  completeButtonIncomplete: {
    shadowOpacity: 0.15,
  },

  completeButtonText: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  completeButtonTextIncomplete: {
    color: '#fff',
    fontWeight: '600',
  },
});
