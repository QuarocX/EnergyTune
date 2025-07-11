import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

export const AnalyticsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.comingSoonCard}>
          <Ionicons name="analytics-outline" size={48} color={theme.colors.systemBlue} />
          <Text style={styles.comingSoonTitle}>Analytics Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            Weekly insights, pattern recognition, and personalized recommendations will appear here.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primaryBackground,
  },

  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },

  headerTitle: {
    fontSize: theme.typography.largeTitle.fontSize,
    fontWeight: theme.typography.largeTitle.fontWeight,
    color: theme.colors.label,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },

  comingSoonCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.secondaryGroupedBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginHorizontal: theme.spacing.md,
  },

  comingSoonTitle: {
    fontSize: theme.typography.title1.fontSize,
    fontWeight: theme.typography.title1.fontWeight,
    color: theme.colors.label,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },

  comingSoonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 22,
  },
});
