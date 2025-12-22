import React, { useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { DatePicker } from '../ui/DatePicker';

/**
 * TimeFrameSelector - Reusable time frame selector with preset and custom range options
 * Used by both EnhancedAnalyticsPanel and PatternHierarchyCard
 */
export const TimeFrameSelector = ({
  selectedTimeframe,
  onTimeframeChange,
  isCustomRange,
  onCustomRangeToggle,
  customStartDate,
  customEndDate,
  onCustomStartDateChange,
  onCustomEndDateChange,
  loading = false,
  theme,
  // Optional: customize available timeframes
  timeframeOptions = [
    { key: 7, label: '7D', days: 7 },
    { key: 14, label: '2W', days: 14 },
    { key: 30, label: '1M', days: 30 },
    { key: 90, label: '3M', days: 90 },
    { key: 9999, label: 'All', days: 9999 },
  ],
  // Optional: show date range info
  showDateRangeInfo = true,
  dateRangeInfo = null, // { formatted, dataPoints }
}) => {
  const styles = getStyles(theme);
  const customRangeHeight = useRef(new Animated.Value(isCustomRange ? 1 : 0)).current;

  // Handle timeframe change
  const handleTimeframeChange = useCallback((timeframe) => {
    if (timeframe !== selectedTimeframe) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onTimeframeChange(timeframe);
      
      // Animate custom range collapse if it was open
      if (isCustomRange) {
        Animated.timing(customRangeHeight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    }
  }, [selectedTimeframe, isCustomRange, customRangeHeight, onTimeframeChange]);

  // Handle custom range toggle
  const handleCustomRangeToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newIsCustom = !isCustomRange;
    
    if (newIsCustom) {
      // Animate expand
      Animated.timing(customRangeHeight, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }).start();
    } else {
      // Animate collapse
      Animated.timing(customRangeHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    
    onCustomRangeToggle();
  }, [isCustomRange, customRangeHeight, onCustomRangeToggle]);

  // Handle custom date changes
  const handleCustomStartDateChange = useCallback((dateString) => {
    const newDate = new Date(dateString);
    const endDate = new Date(customEndDate);
    
    // Ensure start date is not after end date
    if (newDate > endDate) {
      onCustomEndDateChange(dateString);
    }
    onCustomStartDateChange(dateString);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [customEndDate, onCustomStartDateChange, onCustomEndDateChange]);

  const handleCustomEndDateChange = useCallback((dateString) => {
    const newDate = new Date(dateString);
    const startDate = new Date(customStartDate);
    
    // Ensure end date is not before start date
    if (newDate < startDate) {
      onCustomStartDateChange(dateString);
    }
    onCustomEndDateChange(dateString);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [customStartDate, onCustomStartDateChange, onCustomEndDateChange]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Time Period</Text>
          {showDateRangeInfo && dateRangeInfo && (
            <View style={styles.dateRangeLabel}>
              <Text style={styles.dateRangeText}>{dateRangeInfo.formatted}</Text>
              {dateRangeInfo.dataPoints !== undefined && (
                <Text style={styles.dateRangeSubtext}>
                  {dateRangeInfo.dataPoints} data point{dateRangeInfo.dataPoints !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>
          Choose how much history to view
        </Text>
      </View>
      
      {/* Timeframe Picker */}
      <View style={styles.timeframePicker}>
        {timeframeOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.timeframeOption,
              selectedTimeframe === option.key && !isCustomRange && styles.activeTimeframeOption,
            ]}
            onPress={() => handleTimeframeChange(option.key)}
            disabled={loading}
          >
            <Text style={[
              styles.timeframeLabel,
              selectedTimeframe === option.key && !isCustomRange && styles.activeTimeframeLabel,
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
        
        {/* Custom Range Button */}
        <TouchableOpacity
          style={[
            styles.timeframeOption,
            styles.customRangeOption,
            isCustomRange && styles.activeTimeframeOption,
          ]}
          onPress={handleCustomRangeToggle}
          disabled={loading}
          accessibilityLabel="Custom Date Range"
          accessibilityHint="Tap to select a custom start and end date"
        >
          <View style={styles.customRangeButtonContent}>
            <Text style={[
              styles.customRangeLabel,
              isCustomRange && styles.activeCustomRangeLabel,
            ]}>
              Custom
            </Text>
            <Animated.View
              style={{
                transform: [{
                  rotate: customRangeHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                }],
              }}
            >
              <Ionicons 
                name="chevron-down" 
                size={12} 
                color={isCustomRange ? theme.colors.systemBlue : theme.colors.secondaryText} 
              />
            </Animated.View>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Custom Date Range Inputs */}
      <Animated.View 
        style={[
          styles.customRangeContainer,
          {
            maxHeight: customRangeHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 220],
            }),
            opacity: customRangeHeight,
            marginBottom: customRangeHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 8],
            }),
          }
        ]}
      >
        {isCustomRange && (
          <View style={styles.customRangeContent}>
            <View style={styles.customRangeHeader}>
              <View style={styles.customRangeHeaderLeft}>
                <Ionicons 
                  name="calendar-outline" 
                  size={16} 
                  color={theme.colors.systemBlue} 
                />
                <Text style={styles.customRangeTitle}>Select Date Range</Text>
              </View>
            </View>
            
            <View style={styles.dateInputRow}>
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateInputLabel}>From</Text>
                <DatePicker
                  selectedDate={customStartDate}
                  onDateChange={handleCustomStartDateChange}
                  theme={theme}
                  style={styles.datePicker}
                />
              </View>
              
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateInputLabel}>To</Text>
                <DatePicker
                  selectedDate={customEndDate}
                  onDateChange={handleCustomEndDateChange}
                  theme={theme}
                  style={styles.datePicker}
                />
              </View>
            </View>
            
            <View style={styles.rangeInfo}>
              <Text style={styles.rangeInfoText}>
                {(() => {
                  const start = new Date(customStartDate);
                  const end = new Date(customEndDate);
                  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                  return `${days} day${days !== 1 ? 's' : ''}`;
                })()}
              </Text>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  header: {
    marginBottom: 16,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },

  dateRangeLabel: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },

  dateRangeText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.systemBlue,
    marginBottom: 2,
  },

  dateRangeSubtext: {
    fontSize: 10,
    color: theme.colors.secondaryText,
    fontStyle: 'italic',
  },

  subtitle: {
    fontSize: 14,
    color: theme.colors.secondaryText,
    lineHeight: 20,
  },

  timeframePicker: {
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 16,
    padding: 2,
    flexDirection: 'row',
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  timeframeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 1,
    borderRadius: 14,
    minHeight: 44,
    justifyContent: 'center',
    marginHorizontal: 0.5,
  },

  customRangeOption: {
    flex: 0.9,
    minWidth: 70,
  },

  customRangeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  customRangeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.secondaryText,
  },

  activeCustomRangeLabel: {
    color: theme.colors.systemBlue,
    fontWeight: '700',
  },

  activeTimeframeOption: {
    backgroundColor: theme.colors.systemBackground,
    shadowColor: theme.colors.systemBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ scale: 1.02 }],
    borderWidth: 1.5,
    borderColor: theme.colors.systemBlue,
  },

  timeframeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.secondaryText,
    textAlign: 'center',
  },

  activeTimeframeLabel: {
    color: theme.colors.systemBlue,
    fontWeight: '700',
    fontSize: 14,
  },

  // Custom Range Styles
  customRangeContainer: {
    overflow: 'hidden',
    marginTop: 12,
  },

  customRangeContent: {
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.systemGray5,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  customRangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  customRangeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },

  customRangeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },

  dateInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  dateInputContainer: {
    flex: 1,
  },

  dateInputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.secondaryText,
    marginBottom: 8,
    textAlign: 'center',
  },

  datePicker: {
    width: '100%',
  },

  rangeInfo: {
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.separator,
  },

  rangeInfoText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.systemBlue,
  },
});

export default TimeFrameSelector;

