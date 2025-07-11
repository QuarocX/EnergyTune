import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../../config/theme';

export const TimeRangeSelector = ({ selectedPeriod, onPeriodChange, loading }) => {
  const timeRanges = [
    { key: 7, label: '7D', fullLabel: '7 Days' },
    { key: 14, label: '2W', fullLabel: '2 Weeks' },
    { key: 30, label: '1M', fullLabel: '1 Month' },
    { key: 60, label: '2M', fullLabel: '2 Months' },
    { key: 90, label: '3M', fullLabel: '3 Months' },
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
              <>
                <Text style={[
                  styles.rangeText,
                  selectedPeriod === range.key && styles.activeRangeText,
                ]}>
                  {range.label}
                </Text>
                <Text style={[
                  styles.rangeSubtext,
                  selectedPeriod === range.key && styles.activeRangeSubtext,
                ]}>
                  {range.fullLabel}
                </Text>
              </>
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
    minHeight: 60,
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
    marginBottom: theme.spacing.xs,
  },

  activeRangeText: {
    color: '#FFFFFF',
  },

  rangeSubtext: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.secondaryLabel,
  },

  activeRangeSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
