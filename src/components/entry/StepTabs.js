import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { isStepComplete } from '../../utils/entryValidation';

// Tab navigation with completion indicators
// Option 3: Underline + Subtle Card - State-of-the-art hybrid design

export const StepTabs = ({ steps, stepTitles, currentStep, entry, onStepPress, theme }) => {
  const handleTabPress = (index) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onStepPress(index);
  };

  // Calculate subtle card background
  const getSubtleCardBackground = () => {
    const isDark = theme.colors.secondaryBackground === '#000000';
    // Add 3% white tint in dark mode, 3% white tint in light mode for subtle card
    return isDark 
      ? 'rgba(255, 255, 255, 0.03)' 
      : 'rgba(255, 255, 255, 0.5)';
  };

  return (
    <View style={styles.tabContainerWrapper}>
      <View style={[styles.cardOverlay, { backgroundColor: getSubtleCardBackground() }]} />
      <View style={[styles.tabContainer, { 
        borderTopColor: theme.colors.separator,
      }]}>
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isComplete = isStepComplete(entry, index);
          
          return (
            <TouchableOpacity
              key={step}
              style={[
                styles.tab,
                isActive && { 
                  borderBottomColor: theme.colors.systemBlue,
                },
              ]}
              onPress={() => handleTabPress(index)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Text style={[
                  styles.tabText,
                  { color: isActive ? theme.colors.systemBlue : theme.colors.tertiaryLabel },
                  isActive && styles.activeTabText,
                ]}>
                  {stepTitles[index]}
                </Text>
                {isComplete && (
                  <View style={[
                    styles.completionIndicator, 
                    { 
                      backgroundColor: theme.colors.systemGreen,
                      shadowColor: theme.colors.systemGreen,
                    }
                  ]}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainerWrapper: {
    position: 'relative',
  },

  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },

  tabContainer: {
    flexDirection: 'row',
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    zIndex: 1,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    minWidth: 0,
  },

  tabContent: {
    alignItems: 'center',
    position: 'relative',
  },

  tabText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    numberOfLines: 1,
    adjustsFontSizeToFit: true,
    minimumFontScale: 0.8,
    letterSpacing: -0.3,
  },

  activeTabText: {
    fontWeight: '600',
  },

  completionIndicator: {
    position: 'absolute',
    top: -11,
    right: -16,
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },

  checkmark: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
