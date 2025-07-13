import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';

export const StressInsightsCard = ({ insights, onViewDetails }) => {
  const [expanded, setExpanded] = useState(false);

  if (!insights) return null;

  const getStressLevelColor = (level) => {
    if (level <= 3) return theme.colors.systemGreen || '#34C759';
    if (level <= 6) return theme.colors.stress;
    return theme.colors.systemRed || '#FF3B30';
  };

  const getStressDescription = (level) => {
    if (level <= 3) return 'Low';
    if (level <= 6) return 'Moderate';
    return 'High';
  };

  const formatTime = (time) => {
    return time.charAt(0).toUpperCase() + time.slice(1);
  };

  return (
    <TouchableOpacity 
      style={[styles.card, styles.stressCard]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.95}
    >
      <View style={styles.cardHeader}>
        <View style={styles.stressIconContainer}>
          <Ionicons name="warning" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.cardTitle}>Stress Insights</Text>
          <Text style={styles.cardSubtitle}>Patterns & triggers</Text>
        </View>
        <View style={styles.expandIcon}>
          <Ionicons 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="rgba(255, 255, 255, 0.8)" 
          />
        </View>
      </View>

      {insights.highStressDays.length > 0 && (
        <View style={styles.insight}>
          <View style={[styles.insightIcon, styles.stressInsightIcon]}>
            <Ionicons 
              name="alert-circle" 
              size={24} 
              color="#FFFFFF" 
            />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>High Stress Days</Text>
            <Text style={styles.insightValue}>
              {insights.highStressDays.length} day{insights.highStressDays.length !== 1 ? 's' : ''} this period
            </Text>
          </View>
        </View>
      )}

      {insights.commonStressSources.length > 0 && (
        <View style={styles.insight}>
          <View style={[styles.insightIcon, styles.stressInsightIcon]}>
            <Ionicons 
              name="list" 
              size={24} 
              color="#FFFFFF" 
            />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Common Sources</Text>
            <View style={styles.sourcesContainer}>
              {insights.commonStressSources.map((source, index) => (
                <View key={index} style={styles.sourceTag}>
                  <Text style={styles.sourceText}>{source}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      <View style={styles.averagesContainer}>
        <Text style={styles.averagesTitle}>Stress Levels by Time</Text>
        <View style={styles.averagesRow}>
          {Object.entries(insights.averageStressByTime).map(([time, avg]) => {
            if (avg === 0) return null;
            return (
              <View key={time} style={styles.averageItem}>
                <Text style={styles.averageTime}>{formatTime(time)}</Text>
                <Text style={[
                  styles.averageValue, 
                  { color: getStressLevelColor(avg) }
                ]}>
                  {avg.toFixed(1)}
                </Text>
                <Text style={styles.stressDescription}>
                  {getStressDescription(avg)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {expanded && insights.commonStressSources.length > 0 && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onViewDetails && onViewDetails('stress-sources')}
        >
          <Ionicons name="search" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>View detailed stress analysis</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
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

  stressCard: {
    backgroundColor: theme.colors.stress,
    borderLeftWidth: 4,
    borderLeftColor: '#CC2E25', // Darker red for border
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },

  stressIconContainer: {
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

  insight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
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

  stressInsightIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  insightContent: {
    flex: 1,
  },

  insightTitle: {
    fontSize: theme.typography.subheadline.fontSize,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },

  insightValue: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  sourcesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.xs,
  },

  sourceTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },

  sourceText: {
    fontSize: theme.typography.caption1.fontSize,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  averagesContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: theme.spacing.md,
  },

  averagesTitle: {
    fontSize: theme.typography.footnote.fontSize,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  averagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  averageItem: {
    alignItems: 'center',
  },

  averageTime: {
    fontSize: theme.typography.caption1.fontSize,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },

  averageValue: {
    fontSize: theme.typography.title3.fontSize,
    fontWeight: '600',
  },

  stressDescription: {
    fontSize: theme.typography.caption2.fontSize,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
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
