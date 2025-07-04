import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { theme } from '../config/theme';
import { getTodayString, formatDisplayDate } from '../utils/helpers';

export const EntryScreenTest = ({ navigation }) => {
  const [selectedDate] = useState(getTodayString());

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Energy Check-in</Text>
        <Text style={styles.date}>{formatDisplayDate(selectedDate)}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondaryBackground,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primaryBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },
  title: {
    fontSize: theme.typography.largeTitle.fontSize,
    fontWeight: theme.typography.largeTitle.fontWeight,
    color: theme.colors.label,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  date: {
    fontSize: theme.typography.headline.fontSize,
    color: theme.colors.secondaryLabel,
    textAlign: 'center',
  },
});
