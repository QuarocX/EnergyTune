import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../config/theme';
import { isStepComplete } from '../../utils/entryValidation';

// Tab navigation with completion indicators

export const StepTabs = ({ steps, stepTitles, currentStep, entry, onStepPress }) => {
  return (
    <View style={styles.tabContainer}>
      {steps.map((step, index) => (
        <TouchableOpacity
          key={step}
          style={[
            styles.tab,
            currentStep === index && styles.activeTab,
          ]}
          onPress={() => onStepPress(index)}
        >
          <View style={styles.tabContent}>
            <Text style={[
              styles.tabText,
              currentStep === index && styles.activeTabText,
            ]}>
              {stepTitles[index]}
            </Text>
            {isStepComplete(entry, index) && (
              <View style={styles.completionIndicator}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primaryBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },

  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: 0,
  },

  activeTab: {
    borderBottomColor: theme.colors.systemBlue,
  },

  tabContent: {
    alignItems: 'center',
    position: 'relative',
  },

  tabText: {
    fontSize: theme.typography.footnote.fontSize,
    fontWeight: '500',
    color: theme.colors.secondaryLabel,
    textAlign: 'center',
    numberOfLines: 1,
    adjustsFontSizeToFit: true,
    minimumFontScale: 0.8,
  },

  activeTabText: {
    color: theme.colors.systemBlue,
    fontWeight: '600',
  },

  completionIndicator: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: theme.colors.energy,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkmark: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
