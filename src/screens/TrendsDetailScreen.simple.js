import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

export const TrendsDetailScreenSimple = ({ navigation, route }) => {
  const { initialPeriod = 14 } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.label} />
        </TouchableOpacity>
        <Text style={styles.title}>Trends Detail</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.message}>
          Navigation successful! Initial period: {initialPeriod} days
        </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },
  backButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography?.headline?.fontSize || 17,
    fontWeight: theme.typography?.headline?.fontWeight || '600',
    color: theme.colors.label,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  message: {
    fontSize: theme.typography?.body?.fontSize || 17,
    color: theme.colors.label,
    textAlign: 'center',
  },
});
