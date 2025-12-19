import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export const PeriodTimeSetting = ({ label, enabled, time, onToggle, onTimeChange, theme }) => {
  const [showPicker, setShowPicker] = useState(false);

  // Parse time string (HH:MM) to Date object
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(num => parseInt(num, 10));
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Format Date object to time string (HH:MM)
  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedTime) {
      onTimeChange(formatTime(selectedTime));
    }
  };

  const handleIOSConfirm = () => {
    setShowPicker(false);
  };

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.separator }]}>
      <View style={styles.leftSection}>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ 
            false: theme.colors.systemGray4, 
            true: theme.colors.systemBlue + '80' 
          }}
          thumbColor={enabled ? theme.colors.systemBlue : theme.colors.systemGray3}
        />
        <Text style={[styles.label, { color: theme.colors.label, opacity: enabled ? 1 : 0.5 }]}>
          {label}
        </Text>
      </View>
      
      <TouchableOpacity
        onPress={() => enabled && setShowPicker(true)}
        disabled={!enabled}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.timeText, { 
          color: theme.colors.systemBlue, 
          opacity: enabled ? 1 : 0.4 
        }]}>
          {time}
        </Text>
      </TouchableOpacity>

      {/* Time Picker */}
      {showPicker && Platform.OS === 'ios' && (
        <View style={[styles.pickerContainer, { backgroundColor: theme.colors.secondaryBackground }]}>
          <View style={[styles.pickerHeader, { 
            backgroundColor: theme.colors.primaryBackground,
            borderBottomColor: theme.colors.separator 
          }]}>
            <TouchableOpacity onPress={handleIOSConfirm}>
              <Text style={[styles.doneButton, { color: theme.colors.systemBlue }]}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={parseTime(time)}
            mode="time"
            display="spinner"
            onChange={handleTimeChange}
            textColor={theme.colors.label}
          />
        </View>
      )}

      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={parseTime(time)}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
  },
  timeText: {
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 22,
  },
  pickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  doneButton: {
    fontSize: 17,
    fontWeight: '600',
  },
});

