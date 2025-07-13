import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';

export const WeeklyInsightsCard = ({ insights }) => {
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  if (!insights) return null;

  const getPerformanceColor = (score) => {
    if (score >= 7) return theme.colors.systemGreen || '#34C759';
    if (score >= 5) return theme.colors.energy;
    return theme.colors.stress;
  };

  const getPerformanceIcon = (score) => {
    if (score >= 7) return 'checkmark-circle-outline';
    if (score >= 5) return 'remove-circle-outline';
    return 'close-circle-outline';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
    } catch {
      return dateString;
    }
  };

  return (
    <View style={[styles.card, styles.weeklyCard]}>
      <TouchableOpacity 
        style={styles.cardHeader}
        onPress={() => setShowMoreDetails(!showMoreDetails)}
        activeOpacity={0.8}
      >
        <View style={styles.weeklyIconContainer}>
          <Ionicons name="calendar" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.cardTitle}>Weekly Overview</Text>
          <Text style={styles.cardSubtitle}>Last 7 days summary</Text>
        </View>
        <View style={styles.expandIcon}>
          <Ionicons 
            name={showMoreDetails ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="rgba(255, 255, 255, 0.8)" 
          />
        </View>
      </TouchableOpacity>

      <View style={styles.weeklyStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Energy Average</Text>
          <Text style={[styles.statValue, styles.energyValue]}>
            {insights.weeklyEnergyAverage.toFixed(1)}/10
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Stress Average</Text>
          <Text style={[styles.statValue, styles.stressValue]}>
            {insights.weeklyStressAverage.toFixed(1)}/10
          </Text>
        </View>
      </View>

      {insights.bestDay && (
        <View style={styles.insight}>
          <View style={[styles.insightIcon, styles.weeklyInsightIcon]}>
            <Ionicons 
              name="checkmark-circle" 
              size={24} 
              color="#FFFFFF" 
            />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Best Day</Text>
            <Text style={styles.insightValue}>
              {insights.bestDay.dayName}
            </Text>
            <Text style={styles.insightDetail}>
              {formatDate(insights.bestDay.date)} • 
              Energy: {insights.bestDay.energyAvg.toFixed(1)} • 
              Stress: {insights.bestDay.stressAvg.toFixed(1)}
            </Text>
          </View>
        </View>
      )}

      {insights.challengingDay && insights.challengingDay.dayScore < insights.bestDay?.dayScore && (
        <View style={styles.insight}>
          <View style={[styles.insightIcon, styles.weeklyInsightIcon]}>
            <Ionicons 
              name="alert" 
              size={24} 
              color="#FFFFFF" 
            />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Most Challenging</Text>
            <Text style={styles.insightValue}>
              {insights.challengingDay.dayName}
            </Text>
            <Text style={styles.insightDetail}>
              {formatDate(insights.challengingDay.date)} • 
              Energy: {insights.challengingDay.energyAvg.toFixed(1)} • 
              Stress: {insights.challengingDay.stressAvg.toFixed(1)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  weeklyCard: {
    backgroundColor: '#34C759',
    borderLeftWidth: 4,
    borderLeftColor: '#28A745',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },

  weeklyIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },

  cardTitle: {
    fontSize: theme.typography.headline.fontSize,
    fontWeight: theme.typography.headline.fontWeight,
    color: '#FFFFFF',
  },

  titleContainer: {
    flex: 1,
  },

  cardSubtitle: {
    fontSize: theme.typography.caption1.fontSize,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },

  expandIcon: {
    padding: theme.spacing.xs,
  },

  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },

  statItem: {
    alignItems: 'center',
  },

  statLabel: {
    fontSize: theme.typography.caption1.fontSize,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },

  statValue: {
    fontSize: theme.typography.title2.fontSize,
    fontWeight: '700',
  },

  energyValue: {
    color: '#FFFFFF',
  },

  stressValue: {
    color: '#FFFFFF',
  },

  insight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },

  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    marginTop: 2,
  },

  weeklyInsightIcon: {
    backgroundColor: theme.colors.accent,
  },

  insightContent: {
    flex: 1,
  },

  insightTitle: {
    fontSize: theme.typography.subheadline.fontSize,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },

  insightValue: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },

  insightDetail: {
    fontSize: theme.typography.caption1.fontSize,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 16,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: theme.borderRadius.sm,
  },

  actionButtonText: {
    fontSize: theme.typography.caption1.fontSize,
    color: '#FFFFFF',
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
});
