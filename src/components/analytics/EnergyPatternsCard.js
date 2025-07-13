import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';

export const EnergyPatternsCard = ({ patterns, currentTimeframe, onTimeframeChange, loading }) => {
  const [expanded, setExpanded] = useState(false);

  if (!patterns) return null;

  const timeframeOptions = [
    { key: '7d', label: '7 Days', days: 7 },
    { key: '14d', label: '14 Days', days: 14 },
    { key: '30d', label: '30 Days', days: 30 },
  ];

  // Get current timeframe key based on days
  const getCurrentTimeframeKey = () => {
    const option = timeframeOptions.find(opt => opt.days === currentTimeframe);
    return option ? option.key : '14d';
  };

  const timeframe = getCurrentTimeframeKey();

  const handleTimeframeChange = async (newTimeframe) => {
    if (onTimeframeChange && newTimeframe.days !== currentTimeframe) {
      await onTimeframeChange(newTimeframe.days);
    }
  };

  const getPeakTimeIcon = (time) => {
    switch (time) {
      case 'morning': return 'sunny-outline';
      case 'afternoon': return 'partly-sunny-outline';
      case 'evening': return 'moon-outline';
      default: return 'time-outline';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return 'trending-up-outline';
      case 'declining': return 'trending-down-outline';
      default: return 'remove-outline';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving': return theme.colors.systemGreen || '#34C759';
      case 'declining': return theme.colors.systemRed || '#FF3B30';
      default: return theme.colors.systemGray;
    }
  };

  const formatTime = (time) => {
    return time.charAt(0).toUpperCase() + time.slice(1);
  };

  return (
    <TouchableOpacity 
      style={[styles.card, styles.energyCard]} 
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.95}
    >
      <View style={styles.cardHeader}>
        <View style={styles.energyIconContainer}>
          <Ionicons name="flash" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.cardTitle}>Energy Patterns</Text>
          <Text style={styles.cardSubtitle}>
            {timeframeOptions.find(opt => opt.key === timeframe)?.label || '14 Days'} overview
          </Text>
        </View>
        <View style={styles.expandIcon}>
          <Ionicons 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="rgba(255, 255, 255, 0.8)" 
          />
        </View>
      </View>

      <View style={styles.insight}>
        <View style={[styles.insightIcon, styles.energyInsightIcon]}>
          <Ionicons 
            name={getPeakTimeIcon(patterns.peakEnergyTime)} 
            size={24} 
            color="#FFFFFF" 
          />
        </View>
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>Peak Energy Time</Text>
          <Text style={styles.insightValue}>
            {formatTime(patterns.peakEnergyTime)} 
            <Text style={styles.insightDetail}>
              {' '}(avg {patterns.averageEnergyByTime[patterns.peakEnergyTime]?.toFixed(1)}/10)
            </Text>
          </Text>
        </View>
      </View>

      {patterns.energyTrend && (
        <View style={styles.insight}>
          <View style={[styles.insightIcon, styles.energyInsightIcon]}>
            <Ionicons 
              name={getTrendIcon(patterns.energyTrend)} 
              size={24} 
              color="#FFFFFF" 
            />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Recent Trend</Text>
            <Text style={[styles.insightValue, { color: getTrendColor(patterns.energyTrend) }]}>
              {patterns.energyTrend === 'improving' ? 'Improving' : 
               patterns.energyTrend === 'declining' ? 'Declining' : 'Stable'}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.averagesContainer}>
        <Text style={styles.averagesTitle}>Daily Averages</Text>
        <View style={styles.averagesRow}>
          {Object.entries(patterns.averageEnergyByTime).map(([time, avg]) => (
            <View key={time} style={styles.averageItem}>
              <Text style={styles.averageTime}>{formatTime(time)}</Text>
              <Text style={styles.averageValue}>{avg.toFixed(1)}</Text>
            </View>
          ))}
        </View>
      </View>

      {expanded && (
        <View style={styles.timeframeSelector}>
          <Text style={styles.selectorTitle}>Time Period</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.loadingText}>Updating...</Text>
            </View>
          ) : (
            <View style={styles.timeframeButtons}>
              {timeframeOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.timeframeButton,
                    timeframe === option.key && styles.activeTimeframeButton
                  ]}
                  onPress={() => handleTimeframeChange(option)}
                >
                  <Text style={[
                    styles.timeframeButtonText,
                    timeframe === option.key && styles.activeTimeframeButtonText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
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

  energyCard: {
    backgroundColor: theme.colors.energy,
    borderLeftWidth: 4,
    borderLeftColor: '#28A745', // Darker green for border
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },

  energyIconContainer: {
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
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },

  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },

  energyInsightIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  },

  insightDetail: {
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
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
    justifyContent: 'space-between',
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
    color: '#FFFFFF',
  },

  timeframeSelector: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },

  selectorTitle: {
    fontSize: theme.typography.caption1.fontSize,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  timeframeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  timeframeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: 2,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },

  activeTimeframeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },

  timeframeButtonText: {
    fontSize: theme.typography.caption1.fontSize,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  activeTimeframeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },

  loadingText: {
    fontSize: theme.typography.caption1.fontSize,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: theme.spacing.sm,
  },
});
