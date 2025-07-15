import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../../config/theme';

export const DataSourceSelector = ({ selectedSource, onSourceChange, loading }) => {
  const dataSources = [
    { key: 'energy', label: '⚡ Energy', icon: '⚡' },
    { key: 'stress', label: '😰 Stress', icon: '😰' },
    { key: 'both', label: '📊 Both', icon: '📊' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Data View</Text>
      <View style={styles.selector}>
        {dataSources.map((source) => (
          <TouchableOpacity
            key={source.key}
            style={[
              styles.sourceButton,
              selectedSource === source.key && styles.activeSourceButton,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSourceChange(source.key);
            }}
            disabled={loading}
          >
            <Text style={[
              styles.sourceText,
              selectedSource === source.key && styles.activeSourceText,
            ]}>
              {source.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    backgroundColor: theme.colors.tertiaryBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.separator,
  },

  sourceButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    minHeight: 36,
  },

  activeSourceButton: {
    backgroundColor: theme.colors.accent,
    shadowColor: theme.colors.accent,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },

  sourceText: {
    fontSize: theme.typography.footnote.fontSize,
    fontWeight: '600',
    color: theme.colors.label,
    textAlign: 'center',
  },

  activeSourceText: {
    color: '#FFFFFF',
  },
});
