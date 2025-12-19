import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Platform, Modal, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export const PeriodTimeSetting = ({ label, enabled, time, onToggle, onTimeChange, theme }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempSelectedTime, setTempSelectedTime] = useState(null);

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
      // Android: confirm immediately when time is selected
      setShowPicker(false);
      if (selectedTime) {
        onTimeChange(formatTime(selectedTime));
      }
    } else {
      // iOS: store temporarily, don't confirm yet
      if (selectedTime) {
        setTempSelectedTime(selectedTime);
      }
    }
  };

  const handleIOSConfirm = () => {
    // iOS: confirm the selected time when Done is pressed
    if (tempSelectedTime) {
      onTimeChange(formatTime(tempSelectedTime));
      setTempSelectedTime(null);
    }
    setShowPicker(false);
  };

  const handleIOSCancel = () => {
    // Cancel: reset to original time
    setTempSelectedTime(null);
    setShowPicker(false);
  };

  const handleOpenPicker = () => {
    if (enabled) {
      setTempSelectedTime(null); // Reset temp time when opening
      setShowPicker(true);
    }
  };

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.separator }]}>
      <View style={styles.leftSection}>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ 
            false: theme.colors.systemGray4, 
            true: Platform.OS === 'ios' ? undefined : '#34C759'
          }}
          thumbColor={Platform.OS === 'ios' ? undefined : (enabled ? '#FFFFFF' : theme.colors.systemGray3)}
        />
        <Text style={[styles.label, { color: theme.colors.label, opacity: enabled ? 1 : 0.5 }]}>
          {label}
        </Text>
      </View>
      
      <TouchableOpacity
        onPress={handleOpenPicker}
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

      {/* Time Picker - iOS Native Modal */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={handleIOSCancel}
        >
          <Pressable 
            style={styles.modalBackdrop}
            onPress={handleIOSCancel}
            activeOpacity={1}
          >
            <Pressable 
              style={[styles.pickerContainer, { backgroundColor: theme.colors.primaryBackground }]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={[styles.pickerHeader, { 
                backgroundColor: theme.colors.primaryBackground,
                borderBottomColor: theme.colors.separator 
              }]}>
                <TouchableOpacity onPress={handleIOSCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={[styles.cancelButton, { color: theme.colors.label }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleIOSConfirm} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={[styles.doneButton, { color: theme.colors.systemBlue }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempSelectedTime || parseTime(time)}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                textColor={theme.colors.label}
              />
            </Pressable>
          </Pressable>
        </Modal>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cancelButton: {
    fontSize: 17,
    fontWeight: '400',
  },
  doneButton: {
    fontSize: 17,
    fontWeight: '600',
  },
});

