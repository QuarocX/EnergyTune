import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DatePicker } from '../ui/DatePicker';

// Header with title, date picker, and reset button

export const EntryHeader = ({ selectedDate, onDateChange, onReset, theme }) => {
  return (
    <View style={[styles.header, { 
      backgroundColor: theme.colors.primaryBackground,
      borderBottomColor: theme.colors.separator,
    }]}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: theme.colors.label }]}>Energy Check-in</Text>
          <DatePicker 
            selectedDate={selectedDate}
            onDateChange={onDateChange}
            theme={theme}
          />
        </View>
        <TouchableOpacity 
          style={[styles.resetButton, { backgroundColor: theme.colors.systemRed + '15' }]}
          onPress={onReset}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.resetButtonText, { color: theme.colors.systemRed }]}>↻</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 24,
    borderBottomWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },

  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
