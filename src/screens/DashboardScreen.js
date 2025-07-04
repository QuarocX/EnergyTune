import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { theme } from '../config/theme';
import { calculateAverage, formatDisplayDate, getDaysAgo } from '../utils/helpers';
import StorageService from '../services/storage';

const screenWidth = Dimensions.get('window').width;

export const DashboardScreen = ({ navigation }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentEntries();
  }, []);

  const loadRecentEntries = async () => {
    try {
      setLoading(true);
      const recentEntries = await StorageService.getRecentEntries(7);
      setEntries(recentEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = (type = 'energy') => {
    if (entries.length === 0) {
      return {
        labels: ['No data'],
        datasets: [{
          data: [0],
          color: () => theme.colors.systemGray3,
        }],
      };
    }

    // Get last 7 days, fill missing days with null
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = getDaysAgo(i);
      const entry = entries.find(e => e.date === date);
      last7Days.push({
        date,
        entry: entry || null,
      });
    }

    const labels = last7Days.map(({ date }) => {
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
      return dayOfWeek;
    });

    const data = last7Days.map(({ entry }) => {
      if (!entry) return 0;
      
      const levels = type === 'energy' ? entry.energyLevels : entry.stressLevels;
      const values = Object.values(levels).filter(v => v !== null && v !== undefined);
      
      return values.length > 0 ? calculateAverage(values) : 0;
    });

    const color = type === 'energy' ? theme.colors.energy : theme.colors.stress;

    return {
      labels,
      datasets: [{
        data,
        color: () => color,
        strokeWidth: 3,
      }],
    };
  };

  const getTodayStats = () => {
    const todayEntry = entries.find(e => e.date === getDaysAgo(0));
    if (!todayEntry) {
      return { energyAvg: 0, stressAvg: 0, hasData: false };
    }

    const energyValues = Object.values(todayEntry.energyLevels).filter(v => v !== null);
    const stressValues = Object.values(todayEntry.stressLevels).filter(v => v !== null);

    return {
      energyAvg: energyValues.length > 0 ? calculateAverage(energyValues) : 0,
      stressAvg: stressValues.length > 0 ? calculateAverage(stressValues) : 0,
      hasData: energyValues.length > 0 || stressValues.length > 0,
    };
  };

  const chartConfig = {
    backgroundColor: theme.colors.primaryBackground,
    backgroundGradientFrom: theme.colors.primaryBackground,
    backgroundGradientTo: theme.colors.primaryBackground,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.secondaryLabel,
    style: {
      borderRadius: theme.borderRadius.md,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: theme.colors.primaryBackground,
    },
    propsForLabels: {
      fontSize: theme.typography.footnote.fontSize,
    },
  };

  const todayStats = getTodayStats();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Your energy and stress patterns</Text>
        </View>

        {/* Today's Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          {todayStats.hasData ? (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {todayStats.energyAvg.toFixed(1)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.energy }]}>
                  Energy Average
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {todayStats.stressAvg.toFixed(1)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.stress }]}>
                  Stress Average
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noDataText}>
              No data for today. Start tracking your energy and stress levels!
            </Text>
          )}
        </View>

        {/* Energy Trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Energy Trend (7 days)</Text>
          {entries.length > 0 ? (
            <LineChart
              data={getChartData('energy')}
              width={screenWidth - theme.spacing.xl}
              height={200}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              }}
              bezier
              style={styles.chart}
              fromZero
              segments={5}
            />
          ) : (
            <Text style={styles.noDataText}>
              Start tracking to see your energy trends
            </Text>
          )}
        </View>

        {/* Stress Trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stress Trend (7 days)</Text>
          {entries.length > 0 ? (
            <LineChart
              data={getChartData('stress')}
              width={screenWidth - theme.spacing.xl}
              height={200}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
              }}
              bezier
              style={styles.chart}
              fromZero
              segments={5}
            />
          ) : (
            <Text style={styles.noDataText}>
              Start tracking to see your stress trends
            </Text>
          )}
        </View>

        {/* Quick Insights */}
        {entries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Insights</Text>
            <Text style={styles.insightText}>
              📈 You've been tracking for {entries.length} day{entries.length !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.insightText}>
              🎯 Keep it up! Consistent tracking reveals valuable patterns
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondaryBackground,
  },
  
  scrollView: {
    flex: 1,
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
  
  header: {
    padding: theme.spacing.lg,
    alignItems: 'center',
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
  
  section: {
    backgroundColor: theme.colors.primaryBackground,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  
  sectionTitle: {
    fontSize: theme.typography.headline.fontSize,
    fontWeight: theme.typography.headline.fontWeight,
    color: theme.colors.label,
    marginBottom: theme.spacing.md,
  },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  statItem: {
    alignItems: 'center',
  },
  
  statValue: {
    fontSize: theme.typography.title1.fontSize,
    fontWeight: theme.typography.title1.fontWeight,
    color: theme.colors.label,
    marginBottom: theme.spacing.xs,
  },
  
  statLabel: {
    fontSize: theme.typography.footnote.fontSize,
    fontWeight: '500',
  },
  
  chart: {
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  
  noDataText: {
    fontSize: theme.typography.subhead.fontSize,
    color: theme.colors.secondaryLabel,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: theme.spacing.lg,
  },
  
  insightText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.label,
    marginBottom: theme.spacing.sm,
    lineHeight: 22,
  },
  
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});
