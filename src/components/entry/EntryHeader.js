import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DatePicker } from '../ui/DatePicker';

// Header with title, date picker, and reset button
// State-of-the-art Apple minimalist design - matches Dashboard/Analytics aesthetic

export const EntryHeader = ({ selectedDate, onDateChange, onReset, theme }) => {
  const handleResetPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onReset();
  };

  return (
    <View style={[styles.header, { 
      backgroundColor: theme.colors.secondaryBackground,
    }]}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: theme.colors.label }]}>Energy Check-in</Text>
        <TouchableOpacity 
          style={[styles.resetButton, { 
            backgroundColor: theme.colors.tertiaryBackground,
            borderColor: theme.colors.separator,
          }]}
          onPress={handleResetPress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.6}
        >
          <Text style={[styles.resetButtonText, { color: theme.colors.systemRed }]}>↻</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.datePickerRow}>
        <DatePicker 
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          theme={theme}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 4,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  title: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    flex: 1,
  },

  datePickerRow: {
    alignItems: 'center',
    paddingBottom: 8,
  },

  resetButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    marginLeft: 12,
  },

  resetButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
