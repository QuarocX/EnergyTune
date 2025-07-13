import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { theme } from '../config/theme';
import { dashboard, common, chart } from '../config/texts';
import { calculateAverage, formatDisplayDate, getDaysAgo } from '../utils/helpers';
import { useAnalytics } from '../hooks/useAnalytics';
import { WeeklyInsightsCard } from '../components/analytics/WeeklyInsightsCard';
import { EnergyPatternsCard } from '../components/analytics/EnergyPatternsCard';
import { Toast } from '../components/ui/Toast';
import StorageService from '../services/storage';

const screenWidth = Dimensions.get('window').width;

export const DashboardScreen = ({ navigation }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  // Analytics hook for weekly insights and energy patterns
  const { 
    weeklyInsights, 
    energyPatterns, 
    energyTimeframe,
    energyPatternsLoading,
    updateEnergyTimeframe
  } = useAnalytics();

  // Load data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadRecentEntries();
    }, [])
  );

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

  const handleTimeframeChange = async (days) => {
    await updateEnergyTimeframe(days);
    setShowToast(true);
  };

  const getChartData = (type = 'energy') => {
    if (entries.length === 0) {
      return {
        labels: [chart.noDataLabel],
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
    const todayDate = getDaysAgo(0);
    const todayEntry = entries.find(e => e.date === todayDate);
    
    if (!todayEntry) {
      return { energyAvg: 0, stressAvg: 0, hasData: false };
    }

    const energyValues = Object.values(todayEntry.energyLevels).filter(v => v !== null && v !== undefined);
    const stressValues = Object.values(todayEntry.stressLevels).filter(v => v !== null && v !== undefined);

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
          <Text style={styles.loadingText}>{common.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{dashboard.title}</Text>
            <Text style={styles.subtitle}>{dashboard.subtitle}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton} 
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={30} color={theme.colors.systemBlue} />
          </TouchableOpacity>
        </View>

        {/* Weekly Insights */}
        <WeeklyInsightsCard 
          insights={weeklyInsights} 
        />

        {/* Energy Patterns */}
        <EnergyPatternsCard 
          patterns={energyPatterns} 
          currentTimeframe={energyTimeframe}
          onTimeframeChange={handleTimeframeChange}
          loading={energyPatternsLoading}
        />

        {/* Today's Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{dashboard.todayOverview.title}</Text>
          {todayStats.hasData ? (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {todayStats.energyAvg.toFixed(1)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.energy }]}>
                  {dashboard.todayOverview.energyAverage}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {todayStats.stressAvg.toFixed(1)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.stress }]}>
                  {dashboard.todayOverview.stressAverage}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noDataText}>
              {dashboard.todayOverview.noDataMessage}
            </Text>
          )}
        </View>

        {/* Energy Trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{dashboard.trends.energyTitle}</Text>
          {entries.length > 0 ? (
            <LineChart
              data={getChartData('energy')}
              width={screenWidth - theme.spacing.xl}
              height={200}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`, // Green for energy
              }}
              bezier
              style={styles.chart}
              fromZero
              segments={5}
            />
          ) : (
            <Text style={styles.noDataText}>
              {dashboard.trends.noEnergyData}
            </Text>
          )}
        </View>

        {/* Stress Trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{dashboard.trends.stressTitle}</Text>
          {entries.length > 0 ? (
            <LineChart
              data={getChartData('stress')}
              width={screenWidth - theme.spacing.xl}
              height={200}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`, // Red for stress
              }}
              bezier
              style={styles.chart}
              fromZero
              segments={5}
            />
          ) : (
            <Text style={styles.noDataText}>
              {dashboard.trends.noStressData}
            </Text>
          )}
        </View>

        {/* Quick Insights */}
        {entries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{dashboard.insights.title}</Text>
            <Text style={styles.insightText}>
              {dashboard.insights.trackingDays(entries.length)}
            </Text>
            <Text style={styles.insightText}>
              {dashboard.insights.encouragement}
            </Text>
          </View>
        )}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },

  headerText: {
    flex: 1,
  },

  profileButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.md,
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
