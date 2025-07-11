import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../config/theme';
import { datePicker, common, dateDisplay } from '../../config/texts';

export const DatePicker = ({ selectedDate, onDateChange, style }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(selectedDate));

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const formatDate = (d) => d.toISOString().split('T')[0];
    
    if (formatDate(date) === formatDate(today)) {
      return dateDisplay.today(date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }));
    } else if (formatDate(date) === formatDate(yesterday)) {
      return dateDisplay.yesterday;
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (selectedDate) {
        const dateString = selectedDate.toISOString().split('T')[0];
        onDateChange(dateString);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    const dateString = tempDate.toISOString().split('T')[0];
    onDateChange(dateString);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempDate(new Date(selectedDate));
    setShowPicker(false);
  };

  const handleTodayShortcut = () => {
    const today = new Date();
    setTempDate(today);
  };

  const handleYesterdayShortcut = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setTempDate(yesterday);
  };

  if (Platform.OS === 'android') {
    return (
      <View style={[styles.container, style]}>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.dateText}>
            {formatDisplayDate(selectedDate)}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        
        {showPicker && (
          <DateTimePicker
            value={new Date(selectedDate)}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.dateText}>
          {formatDisplayDate(selectedDate)}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
      
      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>{common.cancel}</Text>
              </TouchableOpacity>
              
              <Text style={styles.modalTitle}>{datePicker.selectDate}</Text>
              
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>{common.confirm}</Text>
              </TouchableOpacity>
            </View>
            
            {/* Date Shortcuts */}
            <View style={styles.shortcutsContainer}>
              <TouchableOpacity 
                style={styles.shortcutButton}
                onPress={handleTodayShortcut}
              >
                <Text style={styles.shortcutButtonText}>{datePicker.shortcuts.today}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.shortcutButton}
                onPress={handleYesterdayShortcut}
              >
                <Text style={styles.shortcutButtonText}>{datePicker.shortcuts.yesterday}</Text>
              </TouchableOpacity>
            </View>
            
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={new Date()}
              style={styles.picker}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },

  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.tertiaryBackground,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.separator,
  },

  dateText: {
    fontSize: theme.typography.subhead.fontSize,
    color: theme.colors.label,
    marginRight: theme.spacing.xs,
  },

  chevron: {
    fontSize: 18,
    color: theme.colors.systemGray,
    fontWeight: '500',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: theme.colors.primaryBackground,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    paddingBottom: 34, // Safe area bottom
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },

  modalButton: {
    minWidth: 60,
  },

  modalTitle: {
    fontSize: theme.typography.headline.fontSize,
    fontWeight: theme.typography.headline.fontWeight,
    color: theme.colors.label,
  },

  cancelButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.systemBlue,
  },

  confirmButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.systemBlue,
    fontWeight: '600',
    textAlign: 'right',
  },

  picker: {
    height: 200,
  },

  shortcutsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },

  shortcutButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.systemGray6,
    borderRadius: theme.borderRadius.sm,
    minWidth: 80,
    alignItems: 'center',
  },

  shortcutButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.systemBlue,
    fontWeight: '500',
  },
});
