import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

export const DataSourceSelector = ({ selectedSource, onSourceChange, loading, theme }) => {
  const styles = getStyles(theme);
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

  sourceButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    minHeight: 36,
  },

  activeSourceButton: {
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

  sourceText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },

  activeSourceText: {
    color: '#FFFFFF',
  },
});
