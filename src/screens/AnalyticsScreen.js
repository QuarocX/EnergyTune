import React, { useState, useRef } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../config/theme';
import { useAnalytics } from '../hooks/useAnalytics';
import { useTrendsData } from '../hooks/useTrendsData';

import { AnalyticsLoadingState, AnalyticsEmptyState, MINIMUM_ENTRIES_REQUIRED } from '../components/analytics/AnalyticsStates';
import { EnhancedAnalyticsPanel } from '../components/analytics/EnhancedAnalyticsPanel';
import { PatternHierarchyCard } from '../components/analytics/PatternHierarchyCard';

export const AnalyticsScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  const [selectedDataPoint, setSelectedDataPoint] = useState(null);

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
    refresh: refreshTrendsData,
  } = useTrendsData(9999); // 9999 = load all available data

  // Store refresh function in ref to avoid continuous re-renders
  const refreshRef = useRef(refreshTrendsData);
  refreshRef.current = refreshTrendsData;

  // Refresh data when screen comes into focus (e.g., after adding an entry)
  useFocusEffect(
    React.useCallback(() => {
      refreshRef.current();
    }, []) // Empty deps - only run on focus events
  );

  // Ensure entries is always an array for PatternHierarchyCard
  const safeEntries = Array.isArray(entries) ? entries : (entries ? [entries] : []);

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

  // Show empty state if not enough data (need at least 3 entries for meaningful analytics)
  const currentEntryCount = entries?.length || 0;
  const hasEnoughData = currentEntryCount >= MINIMUM_ENTRIES_REQUIRED;
  
  if (!hasEnoughData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Analytics</Text>
          <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>Your patterns and insights</Text>
        </View>
        <AnalyticsEmptyState 
          theme={theme} 
          currentEntryCount={currentEntryCount}
          navigation={navigation}
        />
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

        {/* Pattern Hierarchy Card - Stress/Energy patterns with sub-patterns */}
        <PatternHierarchyCard
          entries={safeEntries}
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
});
