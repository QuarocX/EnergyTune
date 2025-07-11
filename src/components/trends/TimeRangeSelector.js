import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../../config/theme';

export const TimeRangeSelector = ({ selectedPeriod, onPeriodChange, loading }) => {
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

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },

  title: {
    fontSize: theme.typography.headline.fontSize,
    fontWeight: theme.typography.headline.fontWeight,
    color: theme.colors.label,
    marginBottom: theme.spacing.md,
  },

  selector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
  },

  rangeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    minHeight: 44,
  },

  activeRangeButton: {
    backgroundColor: theme.colors.energy,
    shadowColor: theme.colors.energy,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  rangeText: {
    fontSize: theme.typography.subheadline.fontSize,
    fontWeight: '600',
    color: theme.colors.label,
  },

  activeRangeText: {
    color: '#FFFFFF',
  },
});
