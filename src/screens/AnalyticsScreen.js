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
import { EnergyPatternsCard } from '../components/analytics/EnergyPatternsCard';
import { StressInsightsCard } from '../components/analytics/StressInsightsCard';
import { WeeklyInsightsCard } from '../components/analytics/WeeklyInsightsCard';
import { AnalyticsLoadingState, AnalyticsEmptyState } from '../components/analytics/AnalyticsStates';
import { Toast } from '../components/ui/Toast';
import StorageService from '../services/storage';

export const AnalyticsScreen = ({ navigation }) => {
  const { 
    loading, 
    energyPatternsLoading,
    error, 
    energyPatterns, 
    stressInsights, 
    weeklyInsights, 
    energyTimeframe,
    refresh,
    updateEnergyTimeframe
  } = useAnalytics();

  const [showToast, setShowToast] = useState(false);

  const handleTimeframeChange = async (days) => {
    await updateEnergyTimeframe(days);
    setShowToast(true);
  };

  const handleViewStressDetails = (type) => {
    Alert.alert(
      'Coming Soon',
      'Detailed stress analysis will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  const handleViewTrends = () => {
    navigation.navigate('TrendsDetail', { initialPeriod: 14 });
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>
        <AnalyticsLoadingState />
      </SafeAreaView>
    );
  }

  // Show empty state if no data
  const hasData = energyPatterns || stressInsights || weeklyInsights;
  if (!hasData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      >
        <WeeklyInsightsCard 
          insights={weeklyInsights} 
          onViewTrends={handleViewTrends}
        />
        <EnergyPatternsCard 
          patterns={energyPatterns} 
          currentTimeframe={energyTimeframe}
          onTimeframeChange={handleTimeframeChange}
          loading={energyPatternsLoading}
        />
        <StressInsightsCard 
          insights={stressInsights} 
          onViewDetails={handleViewStressDetails}
        />
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Toast
        message={`Energy patterns updated for ${energyTimeframe} days`}
        visible={showToast}
        onHide={() => setShowToast(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primaryBackground,
  },

  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },

  headerTitle: {
    fontSize: theme.typography.largeTitle.fontSize,
    fontWeight: theme.typography.largeTitle.fontWeight,
    color: theme.colors.label,
  },

  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },

  bottomSpacing: {
    height: theme.spacing.xl,
  },

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
