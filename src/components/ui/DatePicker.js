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
import { datePicker, common } from '../../config/texts';
import {
  formatDate,
  formatDisplayDate,
  parseLocalDate,
  getTodayString,
  getYesterdayString,
} from '../../utils/helpers';

export const DatePicker = ({ selectedDate, onDateChange, style, theme }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(() => parseLocalDate(selectedDate));

  const openPicker = () => {
    setTempDate(parseLocalDate(selectedDate));
    setShowPicker(true);
  };

  const handleDateChange = (event, nextDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (nextDate) {
        onDateChange(formatDate(nextDate));
      }
    } else if (nextDate) {
      setTempDate(nextDate);
    }
  };

  const handleConfirm = () => {
    onDateChange(formatDate(tempDate));
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempDate(parseLocalDate(selectedDate));
    setShowPicker(false);
  };

  const handleTodayShortcut = () => {
    setTempDate(parseLocalDate(getTodayString()));
  };

  const handleYesterdayShortcut = () => {
    setTempDate(parseLocalDate(getYesterdayString()));
  };

  const tempDateString = formatDate(tempDate);
  const isTodaySelected = tempDateString === getTodayString();
  const isYesterdaySelected = tempDateString === getYesterdayString();

  if (Platform.OS === 'android') {
    return (
      <View style={[styles.container, style]}>
        <TouchableOpacity 
          style={[styles.dateButton, { 
            backgroundColor: theme.colors.secondaryBackground,
            borderColor: theme.colors.separator,
          }]}
          onPress={openPicker}
        >
          <Text style={[styles.dateText, { color: theme.colors.label }]}>
            {formatDisplayDate(selectedDate)}
          </Text>
          <Text style={[styles.chevron, { color: theme.colors.secondaryLabel }]}>›</Text>
        </TouchableOpacity>
        
        {showPicker && (
          <DateTimePicker
            value={parseLocalDate(selectedDate)}
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
        style={[styles.dateButton, { 
          backgroundColor: theme.colors.secondaryBackground,
          borderColor: theme.colors.separator,
        }]}
        onPress={openPicker}
      >
        <Text style={[styles.dateText, { color: theme.colors.label }]}>
          {formatDisplayDate(selectedDate)}
        </Text>
        <Text style={[styles.chevron, { color: theme.colors.secondaryLabel }]}>›</Text>
      </TouchableOpacity>
      
      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.primaryBackground }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.separator }]}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={handleCancel}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.systemBlue }]}>{common.cancel}</Text>
              </TouchableOpacity>
              
              <Text style={[styles.modalTitle, { color: theme.colors.label }]}>{datePicker.selectDate}</Text>
              
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={handleConfirm}
              >
                <Text style={[styles.confirmButtonText, { color: theme.colors.systemBlue }]}>{common.confirm}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.shortcutsContainer, { borderBottomColor: theme.colors.separator }]}>
              <TouchableOpacity 
                style={[
                  styles.shortcutButton,
                  {
                    backgroundColor: isTodaySelected
                      ? theme.colors.systemBlue
                      : theme.colors.secondaryBackground,
                  },
                ]}
                onPress={handleTodayShortcut}
              >
                <Text style={[
                  styles.shortcutButtonText,
                  { color: isTodaySelected ? '#FFFFFF' : theme.colors.label },
                ]}>
                  {datePicker.shortcuts.today}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.shortcutButton,
                  {
                    backgroundColor: isYesterdaySelected
                      ? theme.colors.systemBlue
                      : theme.colors.secondaryBackground,
                  },
                ]}
                onPress={handleYesterdayShortcut}
              >
                <Text style={[
                  styles.shortcutButtonText,
                  { color: isYesterdaySelected ? '#FFFFFF' : theme.colors.label },
                ]}>
                  {datePicker.shortcuts.yesterday}
                </Text>
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },

  dateText: {
    fontSize: 15,
    marginRight: 4,
  },

  chevron: {
    fontSize: 18,
    fontWeight: '500',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34, // Safe area bottom
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },

  modalButton: {
    minWidth: 60,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },

  cancelButtonText: {
    fontSize: 17,
  },

  confirmButtonText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'right',
  },

  picker: {
    height: 200,
  },

  shortcutsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
  },

  shortcutButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },

  shortcutButtonText: {
    fontSize: 17,
    fontWeight: '500',
  },
});
