import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';
import { InteractiveChart } from '../components/trends/InteractiveChart';
import { TimeRangeSelector } from '../components/trends/TimeRangeSelector';
import { DataSourcesView } from '../components/trends/DataSourcesView';
import { TrendInsights } from '../components/trends/TrendInsights';
import { useTrendsData } from '../hooks/useTrendsData';

const { width: screenWidth } = Dimensions.get('window');

export const TrendsDetailScreen = ({ navigation, route }) => {
  const { initialPeriod = 14 } = route.params || {};
  
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [chartType, setChartType] = useState('both'); // 'energy', 'stress', 'both'
  
  const {
    trendsData,
    loading,
    error,
    insights,
    dataSources,
    updatePeriod,
  } = useTrendsData(selectedPeriod);

  useEffect(() => {
    updatePeriod(selectedPeriod);
  }, [selectedPeriod]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleDataPointSelect = (dataPoint) => {
    setSelectedDataPoint(dataPoint);
  };

  const chartTypes = [
    { key: 'both', label: 'Both', icon: 'analytics' },
    { key: 'energy', label: 'Energy', icon: 'flash' },
    { key: 'stress', label: 'Stress', icon: 'warning' },
  ];

  if (loading && !trendsData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.label} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detailed Trends</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading trends...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.label} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detailed Trends</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load trends data</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => updatePeriod(selectedPeriod)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.label} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detailed Trends</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Time Range Selector */}
        <TimeRangeSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          loading={loading}
        />

        {/* Chart Type Selector */}
        <View style={styles.chartTypeSelector}>
          {chartTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.chartTypeButton,
                chartType === type.key && styles.activeChartTypeButton
              ]}
              onPress={() => setChartType(type.key)}
            >
              <Ionicons 
                name={type.icon} 
                size={16} 
                color={chartType === type.key ? '#FFFFFF' : theme.colors.secondaryLabel} 
              />
              <Text style={[
                styles.chartTypeText,
                chartType === type.key && styles.activeChartTypeText
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Interactive Chart */}
        {trendsData && (
          <InteractiveChart
            data={trendsData}
            chartType={chartType}
            selectedDataPoint={selectedDataPoint}
            onDataPointSelect={handleDataPointSelect}
            loading={loading}
          />
        )}

        {/* Selected Data Point Details */}
        {selectedDataPoint && (
          <View style={styles.dataPointCard}>
            <Text style={styles.dataPointDate}>
              {new Date(selectedDataPoint.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            <View style={styles.dataPointMetrics}>
              {selectedDataPoint.energy && (
                <View style={styles.metric}>
                  <Ionicons name="flash" size={20} color={theme.colors.energy} />
                  <Text style={styles.metricLabel}>Energy</Text>
                  <Text style={styles.metricValue}>
                    {selectedDataPoint.energy.toFixed(1)}/10
                  </Text>
                </View>
              )}
              {selectedDataPoint.stress && (
                <View style={styles.metric}>
                  <Ionicons name="warning" size={20} color={theme.colors.stress} />
                  <Text style={styles.metricLabel}>Stress</Text>
                  <Text style={styles.metricValue}>
                    {selectedDataPoint.stress.toFixed(1)}/10
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Trend Insights */}
        {insights && (
          <TrendInsights 
            insights={insights}
            selectedPeriod={selectedPeriod}
          />
        )}

        {/* Data Sources */}
        {dataSources && (
          <DataSourcesView 
            dataSources={dataSources}
            selectedPeriod={selectedPeriod}
          />
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primaryBackground,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },

  backButton: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.xs,
  },

  headerTitle: {
    fontSize: theme.typography.largeTitle.fontSize,
    fontWeight: theme.typography.largeTitle.fontWeight,
    color: theme.colors.label,
  },

  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.secondaryLabel,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },

  errorText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.secondaryLabel,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },

  retryButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },

  chartTypeSelector: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
  },

  chartTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },

  activeChartTypeButton: {
    backgroundColor: theme.colors.accent,
  },

  chartTypeText: {
    fontSize: theme.typography.footnote.fontSize,
    color: theme.colors.secondaryLabel,
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },

  activeChartTypeText: {
    color: '#FFFFFF',
  },

  dataPointCard: {
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.md,
  },

  dataPointDate: {
    fontSize: theme.typography.headline.fontSize,
    fontWeight: theme.typography.headline.fontWeight,
    color: theme.colors.label,
    marginBottom: theme.spacing.md,
  },

  dataPointMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  metric: {
    alignItems: 'center',
  },

  metricLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.secondaryLabel,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },

  metricValue: {
    fontSize: theme.typography.title2.fontSize,
    fontWeight: theme.typography.title2.fontWeight,
    color: theme.colors.label,
  },

  bottomSpacing: {
    height: theme.spacing.xl * 2,
  },
});
