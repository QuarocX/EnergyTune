import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../../config/theme';

export const AnalyticsLoadingState = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.accent} />
      <Text style={styles.loadingText}>Analyzing your patterns...</Text>
    </View>
  );
};

export const AnalyticsEmptyState = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.emptyTitle}>Not Enough Data</Text>
      <Text style={styles.emptyText}>
        Log your energy and stress for a few more days to see meaningful insights.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },

  loadingText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.secondaryLabel,
    marginTop: theme.spacing.md,
  },

  emptyTitle: {
    fontSize: theme.typography.title2.fontSize,
    fontWeight: theme.typography.title2.fontWeight,
    color: theme.colors.label,
    marginBottom: theme.spacing.sm,
  },

  emptyText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 22,
  },
});
