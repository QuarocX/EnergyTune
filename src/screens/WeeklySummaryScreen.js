import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
  Modal,
  Pressable,
  PanResponder,
  Animated,
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
  const [selectedPattern, setSelectedPattern] = useState(null);
  
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
              <TouchableOpacity
                key={index}
                style={styles.sourceItem}
                onPress={() => setSelectedPattern({ ...source, type: 'energy' })}
                activeOpacity={0.7}
              >
                <Text style={styles.sourceEmoji}>{source.emoji}</Text>
                <View style={styles.sourceContent}>
                  <Text style={styles.sourceLabel}>{source.label}</Text>
                  <View style={styles.sourceMetaContainer}>
                    <Text style={styles.sourceCount}>({source.count}x)</Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.secondaryText} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* What Stressed You */}
        {summary.topStressors.length > 0 && (
          <View style={styles.sourcesCard}>
            <Text style={styles.sourcesTitle}>😰 What stressed you</Text>
            {summary.topStressors.map((source, index) => (
              <TouchableOpacity
                key={index}
                style={styles.sourceItem}
                onPress={() => setSelectedPattern({ ...source, type: 'stress' })}
                activeOpacity={0.7}
              >
                <Text style={styles.sourceEmoji}>{source.emoji}</Text>
                <View style={styles.sourceContent}>
                  <Text style={styles.sourceLabel}>{source.label}</Text>
                  <View style={styles.sourceMetaContainer}>
                    <Text style={styles.sourceCount}>({source.count}x)</Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.secondaryText} />
                  </View>
                </View>
              </TouchableOpacity>
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
      
      {/* Pattern Detail Bottom Sheet */}
      <PatternDetailModal
        pattern={selectedPattern}
        visible={selectedPattern !== null}
        onClose={() => setSelectedPattern(null)}
        weekEntries={summary?.weekEntries || []}
        theme={theme}
        styles={styles}
      />
    </SafeAreaView>
  );
};

/**
 * Pattern Detail Modal (Centered Popup)
 * Shows detailed information about a specific pattern (energy source or stressor)
 */
const PatternDetailModal = ({ pattern, visible, onClose, weekEntries, theme, styles }) => {
  // Reset on open
  useEffect(() => {
    if (visible && pattern) {
      // Ready to show
    }
  }, [visible, pattern]);

  // Now we can safely return null if no pattern
  if (!pattern) return null;

  // The pattern object from hierarchicalPatternService includes a 'sources' array
  // that contains all the actual mentions with their dates and text.
  // We should use those dates to find the relevant entries.
  
  // Get unique dates from pattern sources (if available from the full pattern data)
  // For now, we'll filter entries by checking if any content from this pattern appears
  const relevantEntries = [];
  const entriesByDate = {};
  
  // Create a map of entries by date for quick lookup
  weekEntries.forEach(entry => {
    entriesByDate[entry.date] = entry;
  });
  
  // If the pattern has the full source data with dates, use that
  // Otherwise fall back to text matching
  if (pattern.dates && pattern.dates.length > 0) {
    // Use the dates directly from the pattern
    pattern.dates.forEach(date => {
      if (entriesByDate[date]) {
        relevantEntries.push(entriesByDate[date]);
      }
    });
  } else {
    // Fallback: filter by text matching (less accurate)
    weekEntries.forEach(entry => {
      const sourceText = pattern.type === 'energy' ? entry.energySources : entry.stressSources;
      if (!sourceText) return;
      
      // Check if any word from pattern label appears in the source text
      const lowerText = sourceText.toLowerCase();
      const labelWords = pattern.label.toLowerCase().split(' ');
      
      // Match if any significant word from the label appears
      const matches = labelWords.some(word => {
        if (word.length < 3) return false; // Skip short words
        return lowerText.includes(word);
      });
      
      if (matches) {
        relevantEntries.push(entry);
      }
    });
  }
  
  // Sort by date (most recent first)
  relevantEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Use the actual number of unique days (relevantEntries.length) instead of pattern.count
  // because pattern.count is the total frequency of mentions, not unique days
  const uniqueDaysCount = relevantEntries.length;

  // Calculate average energy/stress for days with this pattern
  const calculateAverage = (entries, type) => {
    const allValues = [];
    entries.forEach(entry => {
      const levels = type === 'energy' ? entry.energyLevels : entry.stressLevels;
      if (levels) {
        Object.values(levels).forEach(val => {
          if (val !== null && val !== undefined && val > 0) {
            allValues.push(val);
          }
        });
      }
    });
    
    if (allValues.length === 0) return null;
    return Math.round((allValues.reduce((sum, val) => sum + val, 0) / allValues.length) * 10) / 10;
  };

  const avgEnergy = calculateAverage(relevantEntries, 'energy');
  const avgStress = calculateAverage(relevantEntries, 'stress');

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T12:00:00');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.secondaryBackground }]}>
        {/* Header with close button */}
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderLeft} />
          <Text style={[styles.modalHeaderTitle, { color: theme.colors.label }]}>
            {pattern.emoji} {pattern.label}
          </Text>
          <TouchableOpacity 
            onPress={onClose}
            style={styles.modalHeaderClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.modalHeaderCloseText, { color: theme.colors.systemBlue }]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.modalScrollView}
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          {/* Summary Section */}
          <View style={[styles.detailSummaryCard, { backgroundColor: theme.colors.primaryBackground }]}>
            <Text style={[styles.detailSummaryLabel, { color: theme.colors.secondaryText }]}>
              Appeared {uniqueDaysCount} {uniqueDaysCount === 1 ? 'time' : 'times'} this week
            </Text>
            {(avgEnergy !== null || avgStress !== null) && (
              <View style={styles.detailMetrics}>
                {avgEnergy !== null && (
                  <View style={styles.detailMetric}>
                    <Ionicons name="flash" size={16} color={theme.colors.energy} />
                    <Text style={[styles.detailMetricText, { color: theme.colors.label }]}>
                      Avg Energy: {avgEnergy}/10
                    </Text>
                  </View>
                )}
                {avgStress !== null && (
                  <View style={styles.detailMetric}>
                    <Ionicons name="alert-circle" size={16} color={theme.colors.stress} />
                    <Text style={[styles.detailMetricText, { color: theme.colors.label }]}>
                      Avg Stress: {avgStress}/10
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Timeline Section */}
          <View style={styles.detailTimelineSection}>
            <Text style={[styles.detailTimelineTitle, { color: theme.colors.secondaryText }]}>
              TIMELINE
            </Text>
            
            {relevantEntries.map((entry, index) => {
                const energyValues = Object.values(entry.energyLevels || {})
                  .filter(v => v !== null && v !== undefined && v > 0);
                const stressValues = Object.values(entry.stressLevels || {})
                  .filter(v => v !== null && v !== undefined && v > 0);
                
                const energyAvg = energyValues.length > 0
                  ? Math.round((energyValues.reduce((sum, v) => sum + v, 0) / energyValues.length) * 10) / 10
                  : null;
                const stressAvg = stressValues.length > 0
                  ? Math.round((stressValues.reduce((sum, v) => sum + v, 0) / stressValues.length) * 10) / 10
                  : null;

                const sourceText = pattern.type === 'energy' ? entry.energySources : entry.stressSources;

              return (
                <View 
                  key={entry.date} 
                  style={[styles.detailDayCard, { backgroundColor: theme.colors.primaryBackground }]}
                >
                  <Text style={[styles.detailDayDate, { color: theme.colors.label }]}>
                    {formatDate(entry.date)}
                  </Text>
                  
                  {sourceText && (
                    <View style={[styles.detailQuoteContainer, { backgroundColor: theme.colors.secondaryBackground }]}>
                      <Text style={[styles.detailQuoteText, { color: theme.colors.label }]}>
                        {sourceText}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.detailDayMetrics}>
                    {energyAvg !== null && (
                      <View style={styles.detailDayMetric}>
                        <Ionicons name="flash" size={14} color={theme.colors.energy} />
                        <Text style={[styles.detailDayMetricText, { color: theme.colors.secondaryText }]}>
                          Energy {energyAvg}/10
                        </Text>
                      </View>
                    )}
                    {stressAvg !== null && (
                      <View style={styles.detailDayMetric}>
                        <Ionicons name="alert-circle" size={14} color={theme.colors.stress} />
                        <Text style={[styles.detailDayMetricText, { color: theme.colors.secondaryText }]}>
                          Stress {stressAvg}/10
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
  modalCloseButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 10,
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
  sourceMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  
  // Modal styles (iOS native full-screen sheet)
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.separator,
  },
  modalHeaderLeft: {
    width: 50,
  },
  modalHeaderTitle: {
    fontSize: theme.typography.headline.fontSize,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  modalHeaderClose: {
    width: 50,
    alignItems: 'flex-end',
  },
  modalHeaderCloseText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: theme.spacing.lg,
  },
  detailSummaryCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  detailSummaryLabel: {
    fontSize: theme.typography.subheadline.fontSize,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  detailMetrics: {
    gap: theme.spacing.sm,
  },
  detailMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  detailMetricText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
  },
  detailTimelineSection: {
    marginBottom: theme.spacing.lg,
  },
  detailTimelineTitle: {
    fontSize: theme.typography.caption1.fontSize,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.md,
  },
  detailDayCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  detailDayDate: {
    fontSize: theme.typography.headline.fontSize,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  detailQuoteContainer: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  detailQuoteText: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: 22,
  },
  detailDayMetrics: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  detailDayMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  detailDayMetricText: {
    fontSize: theme.typography.subheadline.fontSize,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.separator,
  },
  sheetEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.xs,
  },
  sheetTitle: {
    fontSize: theme.typography.title2.fontSize,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: theme.typography.subheadline.fontSize,
    textAlign: 'center',
  },
  impactCard: {
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  impactTitle: {
    fontSize: theme.typography.subheadline.fontSize,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  impactText: {
    fontSize: theme.typography.body.fontSize,
    marginBottom: theme.spacing.xs,
  },
  timelineSection: {
    paddingHorizontal: theme.spacing.lg,
  },
  timelineTitle: {
    fontSize: theme.typography.subheadline.fontSize,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  timelineItem: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  timelineItemLast: {
    borderBottomWidth: 0,
  },
  timelineDate: {
    marginBottom: theme.spacing.xs,
  },
  timelineDateText: {
    fontSize: theme.typography.subheadline.fontSize,
    fontWeight: '600',
  },
  timelineQuote: {
    fontSize: theme.typography.body.fontSize,
    fontStyle: 'italic',
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
  timelineMetrics: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  timelineMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timelineMetricText: {
    fontSize: theme.typography.caption1.fontSize,
    fontWeight: '500',
  },
});

