import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../config/theme';
import WeeklySummaryService from '../services/weeklySummaryService';

/**
 * Weekly Summary Screen - Zen-like, simple weekly overview
 * Approach 3: Minimal & Focused
 */
export const WeeklySummaryScreen = ({ navigation, route }) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme);
  
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  
  // Get date range from route params, or use last complete week
  const dateRange = route?.params?.dateRange || null;
  
  useEffect(() => {
    loadSummary();
  }, []);
  
  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Determine date range
      let startDate, endDate;
      if (dateRange) {
        startDate = dateRange.start;
        endDate = dateRange.end;
      } else {
        const lastWeek = WeeklySummaryService.getLastCompleteWeek();
        startDate = lastWeek.start;
        endDate = lastWeek.end;
      }
      
      console.log('[WeeklySummary Screen] Loading summary for', startDate, 'to', endDate);
      
      // Generate summary
      const summaryData = await WeeklySummaryService.generateWeeklySummary(startDate, endDate);
      setSummary(summaryData);
    } catch (err) {
      console.error('[WeeklySummary Screen] Error loading summary:', err);
      setError(err.message || 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  };
  
  const handleShare = async () => {
    if (!summary) return;
    
    try {
      const message = formatSummaryForSharing(summary);
      await Share.share({
        message,
        title: 'My Energy Week Summary',
      });
    } catch (error) {
      console.error('Error sharing summary:', error);
    }
  };
  
  const formatSummaryForSharing = (summary) => {
    const dateRange = WeeklySummaryService.getFormattedDateRange(
      summary.dateRange.start,
      summary.dateRange.end
    );
    
    let text = `📊 My Energy Week (${dateRange})\n\n`;
    text += `${summary.weekState.emoji} ${summary.weekState.label}\n`;
    text += `${summary.weekState.description}\n\n`;
    
    if (summary.energy.average !== null) {
      text += `Energy: ${summary.energy.average}/10\n`;
    }
    if (summary.stress.average !== null) {
      text += `Stress: ${summary.stress.average}/10\n`;
    }
    
    if (summary.bestDay) {
      text += `\n💚 Best day: ${summary.bestDay.dayName}\n`;
    }
    
    if (summary.topEnergySources.length > 0) {
      text += `\n⚡ What helped:\n`;
      summary.topEnergySources.forEach(source => {
        text += `  • ${source.label} (${source.count}x)\n`;
      });
    }
    
    text += `\n#EnergyTune`;
    
    return text;
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['top']}>
        <ActivityIndicator size="large" color={theme.colors.systemBlue} />
        <Text style={styles.loadingText}>Preparing your weekly summary...</Text>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['top']}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.systemRed} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSummary}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  if (!summary) {
    return null;
  }
  
  const dateRangeDisplay = WeeklySummaryService.getFormattedDateRange(
    summary.dateRange.start,
    summary.dateRange.end
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color={theme.colors.label} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Week</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={theme.colors.systemBlue} />
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Range */}
        <Text style={styles.dateRange}>{dateRangeDisplay}</Text>
        
        {/* Main State Card */}
        <View style={[styles.mainCard, { backgroundColor: summary.weekState.color }]}>
          <Text style={styles.stateEmoji}>{summary.weekState.emoji}</Text>
          <Text style={styles.stateLabel}>{summary.weekState.label}</Text>
          <Text style={styles.stateDescription}>{summary.weekState.description}</Text>
        </View>
        
        {/* Energy & Stress Levels */}
        {(summary.energy.average !== null || summary.stress.average !== null) && (
          <View style={styles.metricsCard}>
            {summary.energy.average !== null && (
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Energy</Text>
                <View style={styles.metricValue}>
                  {renderStars(summary.energy.average, theme.colors.energy, false, styles)}
                  <Text style={styles.metricNumber}>{summary.energy.average}/10</Text>
                </View>
              </View>
            )}
            
            {summary.stress.average !== null && (
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Stress</Text>
                <View style={styles.metricValue}>
                  {renderStars(summary.stress.average, theme.colors.stress, true, styles)}
                  <Text style={styles.metricNumber}>{summary.stress.average}/10</Text>
                </View>
              </View>
            )}
          </View>
        )}
        
        {/* Best Day */}
        {summary.bestDay && (
          <View style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Ionicons name="sunny" size={24} color={theme.colors.systemGreen} />
              <Text style={styles.dayTitle}>Best day</Text>
            </View>
            <Text style={styles.dayName}>{summary.bestDay.dayName}</Text>
            {summary.bestDay.energySources && (
              <Text style={styles.dayDetail}>{summary.bestDay.energySources}</Text>
            )}
          </View>
        )}
        
        {/* Hardest Day */}
        {summary.hardestDay && summary.hardestDay.date !== summary.bestDay?.date && (
          <View style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Ionicons name="warning-outline" size={24} color={theme.colors.systemOrange} />
              <Text style={styles.dayTitle}>Hardest day</Text>
            </View>
            <Text style={styles.dayName}>{summary.hardestDay.dayName}</Text>
            {summary.hardestDay.stressSources && (
              <Text style={styles.dayDetail}>{summary.hardestDay.stressSources}</Text>
            )}
          </View>
        )}
        
        {/* What Helped You */}
        {summary.topEnergySources.length > 0 && (
          <View style={styles.sourcesCard}>
            <Text style={styles.sourcesTitle}>⚡ What helped you</Text>
            {summary.topEnergySources.map((source, index) => (
              <View key={index} style={styles.sourceItem}>
                <Text style={styles.sourceEmoji}>{source.emoji}</Text>
                <View style={styles.sourceContent}>
                  <Text style={styles.sourceLabel}>{source.label}</Text>
                  <Text style={styles.sourceCount}>({source.count}x)</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {/* What Stressed You */}
        {summary.topStressors.length > 0 && (
          <View style={styles.sourcesCard}>
            <Text style={styles.sourcesTitle}>😰 What stressed you</Text>
            {summary.topStressors.map((source, index) => (
              <View key={index} style={styles.sourceItem}>
                <Text style={styles.sourceEmoji}>{source.emoji}</Text>
                <View style={styles.sourceContent}>
                  <Text style={styles.sourceLabel}>{source.label}</Text>
                  <Text style={styles.sourceCount}>({source.count}x)</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {/* No Data Message */}
        {summary.entriesCount === 0 && (
          <View style={styles.noDataCard}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.secondaryText} />
            <Text style={styles.noDataText}>No entries for this week yet</Text>
            <Text style={styles.noDataSubtext}>
              Keep tracking your energy and stress levels to see your weekly summary
            </Text>
          </View>
        )}
        
        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Render stars for metrics
 */
const renderStars = (value, color, isStress = false, styles) => {
  const filledCount = Math.round(value);
  const totalCount = 10;
  
  return (
    <View style={styles.starsContainer}>
      {[...Array(totalCount)].map((_, index) => {
        const isFilled = index < filledCount;
        const icon = isStress
          ? (isFilled ? 'flash' : 'flash-outline')
          : (isFilled ? 'star' : 'star-outline');
        
        return (
          <Ionicons
            key={index}
            name={icon}
            size={12}
            color={isFilled ? color : '#D1D1D6'}
            style={styles.star}
          />
        );
      })}
    </View>
  );
};

/**
 * Styles
 */
const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primaryBackground,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.secondaryText,
  },
  errorText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.systemRed,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.systemBlue,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.separator,
  },
  closeButton: {
    padding: theme.spacing.xs,
    width: 44,
  },
  headerTitle: {
    fontSize: theme.typography.title3.fontSize,
    fontWeight: theme.typography.title3.fontWeight,
    color: theme.colors.label,
  },
  shareButton: {
    padding: theme.spacing.xs,
    width: 44,
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  dateRange: {
    fontSize: theme.typography.headline.fontSize,
    fontWeight: '600',
    color: theme.colors.label,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  mainCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  stateEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.sm,
  },
  stateLabel: {
    fontSize: theme.typography.title1.fontSize,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: theme.spacing.xs,
  },
  stateDescription: {
    fontSize: theme.typography.body.fontSize,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  metricsCard: {
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  metricRow: {
    marginBottom: theme.spacing.md,
  },
  metricLabel: {
    fontSize: theme.typography.subheadline.fontSize,
    fontWeight: '600',
    color: theme.colors.label,
    marginBottom: theme.spacing.xs,
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  starsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  star: {
    marginRight: 2,
  },
  metricNumber: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.label,
    marginLeft: theme.spacing.sm,
  },
  dayCard: {
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  dayTitle: {
    fontSize: theme.typography.subheadline.fontSize,
    fontWeight: '600',
    color: theme.colors.secondaryText,
    marginLeft: theme.spacing.xs,
  },
  dayName: {
    fontSize: theme.typography.title3.fontSize,
    fontWeight: '700',
    color: theme.colors.label,
    marginBottom: theme.spacing.xs,
  },
  dayDetail: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.secondaryText,
    lineHeight: 20,
  },
  sourcesCard: {
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sourcesTitle: {
    fontSize: theme.typography.headline.fontSize,
    fontWeight: '600',
    color: theme.colors.label,
    marginBottom: theme.spacing.md,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  sourceEmoji: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  sourceContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sourceLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.label,
    flex: 1,
  },
  sourceCount: {
    fontSize: theme.typography.caption1.fontSize,
    color: theme.colors.secondaryText,
    fontWeight: '500',
  },
  noDataCard: {
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  noDataText: {
    fontSize: theme.typography.title3.fontSize,
    fontWeight: '600',
    color: theme.colors.label,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.secondaryText,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: theme.spacing.xl,
  },
});

