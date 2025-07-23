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
import { useTheme } from '../contexts/ThemeContext';
import { InteractiveChart } from '../components/trends/InteractiveChart';
import { TimeRangeSelector } from '../components/trends/TimeRangeSelector';
import { DataSourcesView } from '../components/trends/DataSourcesView';
import { TrendInsights } from '../components/trends/TrendInsights';
import { useTrendsData } from '../hooks/useTrendsData';

const { width: screenWidth } = Dimensions.get('window');

export const TrendsDetailScreen = ({ navigation, route }) => {
  const theme = useTheme();
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
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },

  backButton: {
    marginRight: 16,
    padding: 4,
  },

  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 17,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  errorText: {
    fontSize: 17,
    marginBottom: 24,
    textAlign: 'center',
  },

  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  chartTypeSelector: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
  },

  chartTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  activeChartTypeButton: {
  },

  chartTypeText: {
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '500',
  },

  activeChartTypeText: {
    color: '#FFFFFF',
  },

  dataPointCard: {
    borderRadius: 16,
    padding: 24,
    marginVertical: 16,
  },

  dataPointDate: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },

  dataPointMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  metric: {
    alignItems: 'center',
  },

  metricLabel: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
  },

  metricValue: {
    fontSize: 22,
    fontWeight: '600',
  },

  bottomSpacing: {
    height: 48,
  },
});
