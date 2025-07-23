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
import { useTheme } from '../contexts/ThemeContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { useTrendsData } from '../hooks/useTrendsData';
import { InteractiveChart } from '../components/trends/InteractiveChart';
import { TimeRangeSelector } from '../components/trends/TimeRangeSelector';
import { DataSourceSelector } from '../components/trends/DataSourceSelector';
import { TrendInsights } from '../components/trends/TrendInsights';
import { AnalyticsLoadingState, AnalyticsEmptyState } from '../components/analytics/AnalyticsStates';
import { AIInsightsCard } from '../components/analytics/AIInsightsCard';
import StorageService from '../services/storage';

export const AnalyticsScreen = ({ navigation }) => {
  const theme = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState(14);
  const [selectedDataSource, setSelectedDataSource] = useState('both');
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [aiInsights, setAIInsights] = useState(null);

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
    entries, // Add entries for AI analysis
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

        {/* AI Insights Section */}
        <AIInsightsCard 
          entries={entries || []}
          onInsightsUpdate={setAIInsights}
        />

        <View style={styles.bottomSafeArea} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  header: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },

  title: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 17,
  },

  // Main sections (Trends & Insights & Patterns)
  mainSection: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  // Bottom section (Stress Insights)
  bottomSection: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  sectionHeader: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 13,
  },

  sectionContent: {
    padding: 24,
  },

  timeRangeContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },

  controlsContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },

  chartContainer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },

  correlationInsight: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  aiInsightsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  bottomSafeArea: {
    height: 40,
  },

  // Legacy styles for dev helper
  devHelper: {
    padding: 24,
    alignItems: 'center',
  },

  sampleDataButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },

  sampleDataButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
