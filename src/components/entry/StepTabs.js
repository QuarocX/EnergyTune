import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { isStepComplete } from '../../utils/entryValidation';

// Tab navigation with completion indicators

export const StepTabs = ({ steps, stepTitles, currentStep, entry, onStepPress, theme }) => {
  return (
    <View style={[styles.tabContainer, { 
      backgroundColor: theme.colors.primaryBackground,
      borderBottomColor: theme.colors.separator,
    }]}>
      {steps.map((step, index) => (
        <TouchableOpacity
          key={step}
          style={[
            styles.tab,
            currentStep === index && { borderBottomColor: theme.colors.systemBlue },
          ]}
          onPress={() => onStepPress(index)}
        >
          <View style={styles.tabContent}>
            <Text style={[
              styles.tabText,
              { color: currentStep === index ? theme.colors.systemBlue : theme.colors.secondaryLabel },
              currentStep === index && styles.activeTabText,
            ]}>
              {stepTitles[index]}
            </Text>
            {isStepComplete(entry, index) && (
              <View style={[styles.completionIndicator, { backgroundColor: theme.colors.systemGreen }]}>
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
    borderBottomWidth: 1,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: 0,
  },

  activeTab: {
  },

  tabContent: {
    alignItems: 'center',
    position: 'relative',
  },

  tabText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    numberOfLines: 1,
    adjustsFontSizeToFit: true,
    minimumFontScale: 0.8,
  },

  activeTabText: {
    fontWeight: '600',
  },

  completionIndicator: {
    position: 'absolute',
    top: -8,
    right: -12,
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
