import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../config/theme';
import { useAnalytics } from '../hooks/useAnalytics';
import { useTrendsData } from '../hooks/useTrendsData';

import { AnalyticsLoadingState, AnalyticsEmptyState } from '../components/analytics/AnalyticsStates';
import AIInsightsCard from '../components/analytics/AIInsightsCard';
import { EnhancedAnalyticsPanel } from '../components/analytics/EnhancedAnalyticsPanel';

import StorageService from '../services/storage';

export const AnalyticsScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [aiInsights, setAIInsights] = useState(null);

  const { 
    loading, 
    error, 
    refresh,
  } = useAnalytics();

  // Trends data for detailed analysis - load ALL data, let EnhancedAnalyticsPanel filter by timeframe
  const {
    trendsData,
    loading: trendsLoading,
    entries, // Add entries for AI analysis
  } = useTrendsData(9999); // 9999 = load all available data

  const handleDataPointSelect = (dataPoint) => {
    setSelectedDataPoint(dataPoint);
  };



  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Analytics</Text>
          <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>Your patterns and insights</Text>
        </View>
        <AnalyticsLoadingState theme={theme} />
      </SafeAreaView>
    );
  }

  // Show empty state if no data
  const hasData = trendsData && trendsData.length > 0;
  console.log('AnalyticsScreen: hasData =', hasData, 'trendsData length =', trendsData?.length || 0);
  
  if (!hasData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Analytics</Text>
          <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>Your patterns and insights</Text>
        </View>
        <AnalyticsEmptyState theme={theme} />
        
        {/* Development helper */}
        <View style={styles.devHelper}>
          <TouchableOpacity 
            style={[styles.sampleDataButton, { backgroundColor: theme.colors.systemBlue }]}
            onPress={async () => {
              console.log('Generating sample data...');
              await StorageService.generateSampleData(90);
              console.log('Sample data generated, refreshing...');
              refresh();
            }}
          >
            <Text style={styles.sampleDataButtonText}>Generate 3 Months Sample Data</Text>
          </TouchableOpacity>
          
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView 
        style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Analytics</Text>
          <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>Your patterns and insights</Text>
        </View>



        {/* Enhanced Analytics Panel */}
        <EnhancedAnalyticsPanel 
          data={trendsData || []}
          loading={trendsLoading}
          theme={theme}
          onDataPointSelect={handleDataPointSelect}
          selectedDataPoint={selectedDataPoint}
        />

        {/* AI Insights Section */}
        <AIInsightsCard 
          entries={entries || []}
          onInsightsUpdate={setAIInsights}
          theme={theme}
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
    overflow: 'hidden',
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
