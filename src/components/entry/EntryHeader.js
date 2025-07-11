import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DatePicker } from '../ui/DatePicker';
import { theme } from '../../config/theme';

// Header with title, date picker, and reset button

export const EntryHeader = ({ selectedDate, onDateChange, onReset }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Energy Check-in</Text>
          <DatePicker 
            selectedDate={selectedDate}
            onDateChange={onDateChange}
          />
        </View>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={onReset}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.resetButtonText}>↻</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primaryBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLeft: {
    flex: 1,
    alignItems: 'center',
  },

  resetButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.systemGray6,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },

  resetButtonText: {
    fontSize: 16,
    color: theme.colors.systemGray,
    fontWeight: '500',
  },
  
  title: {
    fontSize: theme.typography.largeTitle.fontSize,
    fontWeight: theme.typography.largeTitle.fontWeight,
    color: theme.colors.label,
    marginBottom: theme.spacing.xs,
  },
});
