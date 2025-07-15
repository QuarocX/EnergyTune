import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { theme } from '../config/theme';
import { useAnalytics } from '../hooks/useAnalytics';
import { useTrendsData } from '../hooks/useTrendsData';
import { InteractiveChart } from '../components/trends/InteractiveChart';
import { TimeRangeSelector } from '../components/trends/TimeRangeSelector';
import { DataSourceSelector } from '../components/trends/DataSourceSelector';
import { TrendInsights } from '../components/trends/TrendInsights';
import { AnalyticsLoadingState, AnalyticsEmptyState } from '../components/analytics/AnalyticsStates';
import StorageService from '../services/storage';

export const AnalyticsScreen = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(14);
  const [selectedDataSource, setSelectedDataSource] = useState('both');
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);

  const { 
    loading, 
    error, 
    refresh,
  } = useAnalytics();

  // Trends data for detailed analysis
  const {
    trendsData,
    loading: trendsLoading,
    insights: trendInsights,
    updatePeriod,
  } = useTrendsData(selectedPeriod);

  const handleDataPointSelect = (dataPoint) => {
    setSelectedDataPoint(dataPoint);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    updatePeriod(period);
  };

  const handleDataSourceChange = (source) => {
    setSelectedDataSource(source);
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Your patterns and insights</Text>
        </View>
        <AnalyticsLoadingState />
      </SafeAreaView>
    );
  }

  // Show empty state if no data
  const hasData = trendsData && trendsData.length > 0;
  if (!hasData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Your patterns and insights</Text>
        </View>
        <AnalyticsEmptyState />
        
        {/* Development helper */}
        <View style={styles.devHelper}>
          <TouchableOpacity 
            style={styles.sampleDataButton}
            onPress={async () => {
              await StorageService.generateSampleData(14);
              refresh();
            }}
          >
            <Text style={styles.sampleDataButtonText}>Generate Sample Data</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Your patterns and insights</Text>
        </View>

        {/* Section 1: Trends */}
        <View style={styles.mainSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📈 Trends</Text>
            <Text style={styles.sectionSubtitle}>Energy and stress over time</Text>
          </View>
          
          <View style={styles.controlsContainer}>
            <DataSourceSelector
              selectedSource={selectedDataSource}
              onSourceChange={handleDataSourceChange}
              loading={trendsLoading}
            />
            <TimeRangeSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
              loading={trendsLoading}
            />
          </View>

          {trendsData && (
            <View style={styles.chartContainer}>
              <InteractiveChart
                data={trendsData}
                chartType={selectedDataSource}
                selectedDataPoint={selectedDataPoint}
                onDataPointSelect={handleDataPointSelect}
                loading={trendsLoading}
              />
            </View>
          )}

          {/* Energy-Stress Relationship */}
          {trendInsights && trendInsights.correlation && selectedDataSource === 'both' && (
            <View style={styles.correlationInsight}>
              <TrendInsights 
                insights={{ correlation: trendInsights.correlation }}
                selectedPeriod={selectedPeriod}
                embedded={true}
              />
            </View>
          )}
        </View>

        <View style={styles.bottomSafeArea} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primaryBackground,
  },

  scrollView: {
    flex: 1,
  },

  header: {
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },

  title: {
    fontSize: theme.typography.largeTitle.fontSize,
    fontWeight: theme.typography.largeTitle.fontWeight,
    color: theme.colors.label,
    marginBottom: theme.spacing.xs,
  },

  subtitle: {
    fontSize: theme.typography.subhead.fontSize,
    color: theme.colors.secondaryLabel,
  },

  // Main sections (Trends & Insights & Patterns)
  mainSection: {
    backgroundColor: theme.colors.secondaryBackground,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  // Bottom section (Stress Insights)
  bottomSection: {
    backgroundColor: theme.colors.secondaryBackground,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  sectionHeader: {
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },

  sectionTitle: {
    fontSize: theme.typography.title2.fontSize,
    fontWeight: theme.typography.title2.fontWeight,
    color: theme.colors.label,
    marginBottom: theme.spacing.xs,
  },

  sectionSubtitle: {
    fontSize: theme.typography.footnote.fontSize,
    color: theme.colors.secondaryLabel,
  },

  sectionContent: {
    padding: theme.spacing.lg,
  },

  timeRangeContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },

  controlsContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },

  chartContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },

  correlationInsight: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },

  bottomSafeArea: {
    height: theme.spacing.xxl,
  },

  // Legacy styles for dev helper
  devHelper: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },

  sampleDataButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },

  sampleDataButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
});
