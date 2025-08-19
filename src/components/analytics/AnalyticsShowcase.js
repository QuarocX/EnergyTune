import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { EnhancedAnalyticsPanel } from './EnhancedAnalyticsPanel';
import { EnhancedTimeRangeSelector } from '../trends/EnhancedTimeRangeSelector';
import { EnhancedInteractiveChart } from '../trends/EnhancedInteractiveChart';
import { useEnhancedAnalytics } from '../../hooks/useEnhancedAnalytics';
import * as Haptics from 'expo-haptics';

/**
 * Analytics Showcase Component
 * 
 * Demonstrates all the new enhanced analytics features:
 * - Smart data aggregation for long timeframes
 * - Apple-style interactive controls
 * - Performance-optimized charts
 * - Mobile-first design with one-thumb operation
 * - Custom range selection
 * - Real-time performance monitoring
 */
export const AnalyticsShowcase = ({ theme, navigation }) => {
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [showcaseMode, setShowcaseMode] = useState('overview'); // 'overview', 'timeframe', 'chart', 'performance'

  const {
    data,
    loading,
    error,
    performanceMetrics,
    currentPeriod,
    updatePeriod,
    refresh,
    getOptimizationRecommendations,
    exportData,
    getDataSummary,
    isReady,
  } = useEnhancedAnalytics(30); // Start with 30 days

  const styles = getStyles(theme);

  const handleDataPointSelect = (dataPoint) => {
    setSelectedDataPoint(dataPoint);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleExportData = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const csvData = await exportData('csv');
      Alert.alert(
        'Export Successful',
        `Data exported with ${data.length} data points.\n\nFirst few lines:\n${csvData.split('\n').slice(0, 3).join('\n')}...`,
        [
          { text: 'OK', style: 'default' },
          { text: 'Copy to Clipboard', onPress: () => {
            // In a real app, you'd use Clipboard.setString(csvData)
            console.log('CSV Data:', csvData);
          }}
        ]
      );
    } catch (err) {
      Alert.alert('Export Failed', err.message);
    }
  };

  const renderShowcaseSection = () => {
    switch (showcaseMode) {
      case 'timeframe':
        return (
          <View style={styles.showcaseSection}>
            <Text style={styles.showcaseTitle}>🕐 Enhanced Timeframe Selector</Text>
            <Text style={styles.showcaseDescription}>
              Features custom ranges, smart recommendations, and Apple-style design
            </Text>
            <EnhancedTimeRangeSelector
              selectedPeriod={currentPeriod}
              onPeriodChange={updatePeriod}
              loading={loading}
              theme={theme}
              customRangeEnabled={true}
            />
          </View>
        );

      case 'chart':
        return (
          <View style={styles.showcaseSection}>
            <Text style={styles.showcaseTitle}>📊 Interactive Chart</Text>
            <Text style={styles.showcaseDescription}>
              Touch-optimized with smooth animations and performance optimization
            </Text>
            <EnhancedInteractiveChart
              data={data}
              chartType="both"
              selectedDataPoint={selectedDataPoint}
              onDataPointSelect={handleDataPointSelect}
              loading={loading}
              theme={theme}
              showAnimation={true}
              enableInteraction={true}
            />
          </View>
        );

      case 'performance':
        return (
          <View style={styles.showcaseSection}>
            <Text style={styles.showcaseTitle}>🚀 Performance Metrics</Text>
            <Text style={styles.showcaseDescription}>
              Real-time performance monitoring and optimization insights
            </Text>
            {performanceMetrics && (
              <View style={styles.metricsContainer}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{performanceMetrics.dataPoints}</Text>
                  <Text style={styles.metricLabel}>Data Points</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{performanceMetrics.processingTime}ms</Text>
                  <Text style={styles.metricLabel}>Processing Time</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{performanceMetrics.performanceGrade}</Text>
                  <Text style={styles.metricLabel}>Performance Grade</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{performanceMetrics.cacheHits}</Text>
                  <Text style={styles.metricLabel}>Cache Entries</Text>
                </View>
              </View>
            )}
            
            {getOptimizationRecommendations().map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationIcon}>{rec.icon}</Text>
                <Text style={styles.recommendationText}>{rec.message}</Text>
              </View>
            ))}
          </View>
        );

      default: // overview
        return (
          <View style={styles.showcaseSection}>
            <Text style={styles.showcaseTitle}>📈 Enhanced Analytics Overview</Text>
            <Text style={styles.showcaseDescription}>
              Complete analytics solution with smart aggregation and mobile-first design
            </Text>
            <EnhancedAnalyticsPanel
              data={data}
              loading={loading}
              theme={theme}
              onDataPointSelect={handleDataPointSelect}
              selectedDataPoint={selectedDataPoint}
            />
          </View>
        );
    }
  };

  const dataSummary = getDataSummary();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Analytics Showcase</Text>
        <Text style={styles.subtitle}>
          Demonstrating enhanced analytics features with real-time performance monitoring
        </Text>
      </View>

      {/* Mode Selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.modeSelector}
        contentContainerStyle={styles.modeSelectorContent}
      >
        {[
          { key: 'overview', label: 'Overview', icon: '📈' },
          { key: 'timeframe', label: 'Timeframe', icon: '🕐' },
          { key: 'chart', label: 'Chart', icon: '📊' },
          { key: 'performance', label: 'Performance', icon: '🚀' },
        ].map((mode) => (
          <TouchableOpacity
            key={mode.key}
            style={[
              styles.modeButton,
              showcaseMode === mode.key && styles.activeModeButton,
            ]}
            onPress={() => {
              setShowcaseMode(mode.key);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={styles.modeIcon}>{mode.icon}</Text>
            <Text style={[
              styles.modeText,
              showcaseMode === mode.key && styles.activeModeText,
            ]}>
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <View style={[styles.statusDot, { 
            backgroundColor: isReady ? theme.colors.systemGreen : 
                           loading ? theme.colors.systemOrange : 
                           theme.colors.systemRed 
          }]} />
          <Text style={styles.statusText}>
            {isReady ? 'Ready' : loading ? 'Loading' : 'Error'}
          </Text>
        </View>
        
        {dataSummary && (
          <>
            <View style={styles.statusItem}>
              <Text style={styles.statusValue}>{dataSummary.totalDataPoints}</Text>
              <Text style={styles.statusText}>Points</Text>
            </View>
            
            {dataSummary.energyStats && (
              <View style={styles.statusItem}>
                <Text style={styles.statusValue}>{dataSummary.energyStats.average.toFixed(1)}</Text>
                <Text style={styles.statusText}>Avg Energy</Text>
              </View>
            )}
            
            {performanceMetrics && (
              <View style={styles.statusItem}>
                <Text style={styles.statusValue}>{performanceMetrics.processingTime}ms</Text>
                <Text style={styles.statusText}>Load Time</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Showcase Content */}
      {renderShowcaseSection()}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryButton]}
          onPress={refresh}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>🔄 Refresh Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleExportData}
          disabled={loading || !isReady}
        >
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>📤 Export CSV</Text>
        </TouchableOpacity>
      </View>

      {/* Features List */}
      <View style={styles.featuresList}>
        <Text style={styles.featuresTitle}>✨ Key Features Demonstrated</Text>
        {[
          '📱 Mobile-first design with one-thumb operation',
          '🚀 <200ms response times with smart caching',
          '📊 Automatic data aggregation for long timeframes',
          '🎯 Custom date range selection with presets',
          '✨ Smooth animations and haptic feedback',
          '📈 Interactive touch controls with precise hit detection',
          '💾 Efficient memory usage and performance monitoring',
          '🎨 Apple-style design system integration',
        ].map((feature, index) => (
          <Text key={index} style={styles.featureItem}>{feature}</Text>
        ))}
      </View>

      <View style={styles.bottomSafeArea} />
    </ScrollView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  header: {
    padding: 24,
    paddingBottom: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: theme.colors.secondaryText,
    lineHeight: 20,
  },

  modeSelector: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },

  modeSelectorContent: {
    paddingRight: 24,
  },

  modeButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    minWidth: 80,
  },

  activeModeButton: {
    backgroundColor: theme.colors.systemBlue,
    shadowColor: theme.colors.systemBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  modeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },

  modeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },

  activeModeText: {
    color: '#FFFFFF',
  },

  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.systemGray6,
    marginHorizontal: 24,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },

  statusItem: {
    alignItems: 'center',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },

  statusValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },

  statusText: {
    fontSize: 11,
    color: theme.colors.secondaryText,
  },

  showcaseSection: {
    marginHorizontal: 24,
    marginBottom: 24,
  },

  showcaseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },

  showcaseDescription: {
    fontSize: 14,
    color: theme.colors.secondaryText,
    marginBottom: 16,
    lineHeight: 18,
  },

  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  metricItem: {
    alignItems: 'center',
  },

  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },

  metricLabel: {
    fontSize: 11,
    color: theme.colors.secondaryText,
    marginTop: 2,
  },

  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },

  recommendationIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  recommendationText: {
    fontSize: 13,
    color: theme.colors.text,
    flex: 1,
  },

  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  primaryButton: {
    backgroundColor: theme.colors.systemBlue,
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.systemBlue,
  },

  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  secondaryButtonText: {
    color: theme.colors.systemBlue,
  },

  featuresList: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },

  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },

  featureItem: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 8,
    lineHeight: 18,
  },

  bottomSafeArea: {
    height: 40,
  },
});
