import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';

export const TimeRangeSelector = ({ selectedPeriod, onPeriodChange, loading, theme }) => {
  const styles = getStyles(theme);
  const timeRanges = [
    { key: 7, label: '7D' },
    { key: 14, label: '2W' },
    { key: 30, label: '1M' },
    { key: 60, label: '2M' },
    { key: 90, label: '3M' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Time Period</Text>
      <View style={styles.selector}>
        {timeRanges.map((range) => (
          <TouchableOpacity
            key={range.key}
            style={[
              styles.rangeButton,
              selectedPeriod === range.key && styles.activeRangeButton,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPeriodChange(range.key);
            }}
            disabled={loading}
          >
            {loading && selectedPeriod === range.key ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={[
                styles.rangeText,
                selectedPeriod === range.key && styles.activeRangeText,
              ]}>
                {range.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  title: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },

  selector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  rangeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    minHeight: 36,
  },

  activeRangeButton: {
    backgroundColor: theme.colors.systemBlue,
    shadowColor: theme.colors.systemBlue,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },

  rangeText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },

  activeRangeText: {
    color: '#FFFFFF',
  },
});
