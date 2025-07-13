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
import { StressInsightsCard } from '../components/analytics/StressInsightsCard';
import { InteractiveChart } from '../components/trends/InteractiveChart';
import { TimeRangeSelector } from '../components/trends/TimeRangeSelector';
import { TrendInsights } from '../components/trends/TrendInsights';
import { AnalyticsLoadingState, AnalyticsEmptyState } from '../components/analytics/AnalyticsStates';
import StorageService from '../services/storage';

export const AnalyticsScreen = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(14);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);

  const { 
    loading, 
    error, 
    stressInsights, 
    refresh,
  } = useAnalytics();

  // Trends data for detailed analysis
  const {
    trendsData,
    loading: trendsLoading,
    insights: trendInsights,
    updatePeriod,
  } = useTrendsData(selectedPeriod);

  const handleViewStressDetails = (type) => {
    Alert.alert(
      'Coming Soon',
      'Detailed stress analysis will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  const handleDataPointSelect = (dataPoint) => {
    setSelectedDataPoint(dataPoint);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    updatePeriod(period);
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
  const hasData = stressInsights;
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
          
          <View style={styles.timeRangeContainer}>
            <TimeRangeSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
              loading={trendsLoading}
            />
          </View>

          {trendsData && (
            <InteractiveChart
              data={trendsData}
              chartType="both"
              selectedDataPoint={selectedDataPoint}
              onDataPointSelect={handleDataPointSelect}
              loading={trendsLoading}
            />
          )}
        </View>

        {/* Section 2: Insights & Patterns */}
        <View style={styles.mainSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💡 Insights & Patterns</Text>
            <Text style={styles.sectionSubtitle}>What your data reveals</Text>
          </View>
          
          <View style={styles.sectionContent}>
            {trendInsights && (
              <TrendInsights 
                insights={trendInsights}
                selectedPeriod={selectedPeriod}
              />
            )}
          </View>
        </View>

        {/* Section 3: Stress Insights */}
        <View style={styles.bottomSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>😰 Stress Analysis</Text>
            <Text style={styles.sectionSubtitle}>Understanding your stress patterns</Text>
          </View>
          
          <View style={styles.sectionContent}>
            <StressInsightsCard 
              insights={stressInsights} 
              onViewDetails={handleViewStressDetails}
            />
          </View>
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
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
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
    paddingBottom: theme.spacing.md,
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

  bottomSafeArea: {
    height: theme.spacing.xxl,
  },

  // Legacy styles for dev helper
  devHelper: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },

  sampleDataButton: {
    backgroundColor: theme.colors.energy,
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
