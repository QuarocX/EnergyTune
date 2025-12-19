import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import * as Haptics from 'expo-haptics';
import { EnergyStressCorrelation } from './EnergyStressCorrelation';
import { DatePicker } from '../ui/DatePicker';

const { width: screenWidth } = Dimensions.get('window');

/**
 * PeriodInsightsPanel - Simple, grandmother-friendly insights for longer timeframes
 * Shows: Best period, Most challenging period, Overall trend
 * Period details now appear at fingertip (in tooltip) when touching chart
 */
const PeriodInsightsPanel = ({ data, aggregatedData, theme, aggregation, selectedTimeframe }) => {
  // Use daily data for finding best/worst days, aggregated for trends
  const insights = useMemo(() => {
    const dailyData = data || [];
    if (dailyData.length < 3) return null;

    // Find best and most challenging DAYS from the daily data
    let bestDay = null;
    let worstDay = null;
    
    dailyData.forEach((day, index) => {
      if (day.energy !== null && day.stress !== null) {
        const score = day.energy - day.stress;
        
        if (!bestDay || score > (bestDay.energy - bestDay.stress)) {
          bestDay = { ...day, index };
        }
        if (!worstDay || score < (worstDay.energy - worstDay.stress)) {
          worstDay = { ...day, index };
        }
      }
    });

    // Calculate overall trend
    const midpoint = Math.floor(dailyData.length / 2);
    const firstHalf = dailyData.slice(0, midpoint);
    const secondHalf = dailyData.slice(midpoint);
    
    const firstHalfEnergy = firstHalf.filter(d => d.energy !== null)
      .reduce((sum, d, _, arr) => arr.length ? sum + d.energy / arr.length : 0, 0);
    const secondHalfEnergy = secondHalf.filter(d => d.energy !== null)
      .reduce((sum, d, _, arr) => arr.length ? sum + d.energy / arr.length : 0, 0);
    
    const energyTrend = secondHalfEnergy - firstHalfEnergy;
    
    const firstHalfStress = firstHalf.filter(d => d.stress !== null)
      .reduce((sum, d, _, arr) => arr.length ? sum + d.stress / arr.length : 0, 0);
    const secondHalfStress = secondHalf.filter(d => d.stress !== null)
      .reduce((sum, d, _, arr) => arr.length ? sum + d.stress / arr.length : 0, 0);
    
    const stressTrend = secondHalfStress - firstHalfStress;

    return { bestDay, worstDay, energyTrend, stressTrend, totalDays: dailyData.length };
  }, [data]);

  // Format dates based on aggregation type
  const formatDayDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }, []);

  // Get trend description - grandmother friendly!
  const getTrendDescription = () => {
    if (!insights) return { text: "Keep tracking to see trends!", icon: 'time', color: theme.colors.secondaryText };
    
    const energyImproving = insights.energyTrend > 0.3;
    const energyDeclining = insights.energyTrend < -0.3;
    const stressIncreasing = insights.stressTrend > 0.3;
    const stressDecreasing = insights.stressTrend < -0.3;

    if (energyImproving && stressDecreasing) {
      return { text: "You're doing great! Energy up, stress down.", icon: 'sunny', color: theme.colors.systemGreen };
    } else if (energyImproving) {
      return { text: "Your energy is improving over time.", icon: 'trending-up', color: theme.colors.systemGreen };
    } else if (stressDecreasing) {
      return { text: "Your stress levels are going down.", icon: 'happy', color: theme.colors.systemGreen };
    } else if (energyDeclining && stressIncreasing) {
      return { text: "Energy down, stress up. Take care of yourself!", icon: 'alert-circle', color: theme.colors.systemOrange };
    } else if (energyDeclining) {
      return { text: "Your energy has dipped recently.", icon: 'trending-down', color: theme.colors.systemOrange };
    } else if (stressIncreasing) {
      return { text: "Stress has increased. Time for some rest?", icon: 'warning', color: theme.colors.systemOrange };
    } else {
      return { text: "Staying steady - no major changes.", icon: 'remove', color: theme.colors.secondaryText };
    }
  };

  // Get period label based on aggregation
  const getPeriodTypeLabel = () => {
    if (aggregation === 'monthly') return 'Month';
    if (aggregation === 'weekly') return 'Week';
    return 'Day';
  };

  if (!insights || !insights.bestDay || !insights.worstDay) return null;

  const trend = getTrendDescription();
  const periodType = getPeriodTypeLabel();

  return (
    <View style={periodInsightsStyles(theme).container}>
      <Text style={periodInsightsStyles(theme).title}>
        <Ionicons name="bulb-outline" size={16} color={theme.colors.text} /> Quick Insights ({insights.totalDays} days)
      </Text>

      {/* Trend Summary */}
      <View style={periodInsightsStyles(theme).trendCard}>
        <Ionicons name={trend.icon} size={24} color={trend.color} />
        <Text style={[periodInsightsStyles(theme).trendText, { color: trend.color }]}>
          {trend.text}
        </Text>
      </View>

      {/* Best and Challenging Days */}
      <View style={periodInsightsStyles(theme).periodsRow}>
        <View style={periodInsightsStyles(theme).periodCard}>
          <View style={periodInsightsStyles(theme).periodHeader}>
            <Ionicons name="sunny" size={16} color={theme.colors.systemGreen} />
            <Text style={periodInsightsStyles(theme).periodLabel}>Best Day</Text>
          </View>
          <Text style={periodInsightsStyles(theme).periodDate}>
            {formatDayDate(insights.bestDay.date)}
          </Text>
          <Text style={periodInsightsStyles(theme).periodStats}>
            <Text style={{ color: theme.colors.energy }}>⚡ {insights.bestDay.energy?.toFixed(1)}</Text>
            {'  '}
            <Text style={{ color: theme.colors.stress }}>😰 {insights.bestDay.stress?.toFixed(1)}</Text>
          </Text>
        </View>

        <View style={periodInsightsStyles(theme).periodCard}>
          <View style={periodInsightsStyles(theme).periodHeader}>
            <Ionicons name="cloudy" size={16} color={theme.colors.systemOrange} />
            <Text style={periodInsightsStyles(theme).periodLabel}>Tough Day</Text>
          </View>
          <Text style={periodInsightsStyles(theme).periodDate}>
            {formatDayDate(insights.worstDay.date)}
          </Text>
          <Text style={periodInsightsStyles(theme).periodStats}>
            <Text style={{ color: theme.colors.energy }}>⚡ {insights.worstDay.energy?.toFixed(1)}</Text>
            {'  '}
            <Text style={{ color: theme.colors.stress }}>😰 {insights.worstDay.stress?.toFixed(1)}</Text>
          </Text>
        </View>
      </View>

      {/* Touch hint for longer periods */}
      {(aggregation === 'weekly' || aggregation === 'monthly') && (
        <Text style={periodInsightsStyles(theme).touchHint}>
          👆 Touch chart points for {periodType.toLowerCase()} details
        </Text>
      )}
    </View>
  );
};

// Styles for PeriodInsightsPanel
const periodInsightsStyles = (theme) => StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  trendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  trendText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  periodsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  periodCard: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 12,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  periodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.secondaryText,
  },
  periodDate: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  periodStats: {
    fontSize: 12,
    fontWeight: '500',
  },
  touchHint: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export const EnhancedAnalyticsPanel = ({ 
  data = [], 
  loading = false, 
  theme, 
  onDataPointSelect,
  selectedDataPoint 
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(7); // Default to 7 days
  const [selectedDataSource, setSelectedDataSource] = useState('both');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('all'); // 'all', 'morning', 'afternoon', 'evening'
  const [chartType, setChartType] = useState('line'); // 'line' or 'area'
  const [selectedDataPointIndex, setSelectedDataPointIndex] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [detailedData, setDetailedData] = useState(null);
  
  // Custom date range state
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  const tooltipScale = useRef(new Animated.Value(0.8)).current;
  const customRangeHeight = useRef(new Animated.Value(0)).current;

  const styles = getStyles(theme);
  const chartWidth = screenWidth - 48;

  // Timeframe options with proper date-based filtering
  const timeframeOptions = [
    { key: 7, label: '7D', aggregation: 'none', days: 7 },
    { key: 14, label: '2W', aggregation: 'none', days: 14 },
    { key: 30, label: '1M', aggregation: 'daily', days: 30 },
    { key: 365, label: '1Y', aggregation: 'monthly', days: 365 },
    { key: 9999, label: 'All', aggregation: 'monthly', days: 9999 },
  ];

  // Data source options
  const dataSourceOptions = [
    { key: 'energy', label: 'Energy', color: theme.colors.energy },
    { key: 'stress', label: 'Stress', color: theme.colors.stress },
    { key: 'both', label: 'Both', color: theme.colors.systemBlue },
  ];

  // Time period options
  const timePeriodOptions = [
    { key: 'all', label: 'All', icon: '🌅🌞🌙', description: 'Average of all periods' },
    { key: 'morning', label: 'AM', icon: '🌅', description: 'Morning values only' },
    { key: 'afternoon', label: 'PM', icon: '☀️', description: 'Afternoon values only' },
    { key: 'evening', label: 'EVE', icon: '🌙', description: 'Evening values only' },
  ];

  // Chart type options
  const chartTypeOptions = [
    { key: 'line', label: 'Line', icon: '📈' },
    { key: 'area', label: 'Area', icon: '📊' },
  ];

  // Filter data by time period
  const filterByTimePeriod = useCallback((rawData, timePeriod) => {
    return rawData.map(item => {
      let energy = null;
      let stress = null;
      let energyLevels = item.energyLevels || {};
      let stressLevels = item.stressLevels || {};

      if (timePeriod === 'all') {
        // Use existing averaged values or calculate from individual periods
        if (item.energy !== null && item.energy !== undefined) {
          energy = item.energy;
        } else if (energyLevels) {
          const energyValues = Object.values(energyLevels).filter(val => val !== null && val !== undefined);
          energy = energyValues.length > 0 
            ? energyValues.reduce((sum, val) => sum + val, 0) / energyValues.length 
            : null;
        }

        if (item.stress !== null && item.stress !== undefined) {
          stress = item.stress;
        } else if (stressLevels) {
          const stressValues = Object.values(stressLevels).filter(val => val !== null && val !== undefined);
          stress = stressValues.length > 0 
            ? stressValues.reduce((sum, val) => sum + val, 0) / stressValues.length 
            : null;
        }
      } else {
        // Use specific time period values
        energy = energyLevels[timePeriod] !== null && energyLevels[timePeriod] !== undefined 
          ? energyLevels[timePeriod] 
          : null;
        stress = stressLevels[timePeriod] !== null && stressLevels[timePeriod] !== undefined 
          ? stressLevels[timePeriod] 
          : null;
      }

      return {
        ...item,
        energy,
        stress,
        timePeriod,
        energyLevels,
        stressLevels,
      };
    });
  }, []);

  // Aggregate data by day (for monthly views)
  const aggregateDaily = useCallback((rawData) => {
    const grouped = {};
    rawData.forEach(item => {
      const date = new Date(item.date);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      if (!grouped[dayKey]) {
        grouped[dayKey] = {
          date: dayKey,
          energyValues: [],
          stressValues: [],
          entries: []
        };
      }
      
      if (item.energy !== null && item.energy !== undefined) {
        grouped[dayKey].energyValues.push(item.energy);
      }
      if (item.stress !== null && item.stress !== undefined) {
        grouped[dayKey].stressValues.push(item.stress);
      }
      grouped[dayKey].entries.push(item);
    });

    return Object.values(grouped).map(group => ({
      date: group.date,
      energy: group.energyValues.length > 0 
        ? group.energyValues.reduce((sum, val) => sum + val, 0) / group.energyValues.length 
        : null,
      stress: group.stressValues.length > 0 
        ? group.stressValues.reduce((sum, val) => sum + val, 0) / group.stressValues.length 
        : null,
      entriesCount: group.entries.length,
      originalEntries: group.entries,
      energyLevels: group.entries[0]?.energyLevels || {},
      stressLevels: group.entries[0]?.stressLevels || {},
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, []);

  // Aggregate data by week (for quarterly views)
  const aggregateWeekly = useCallback((rawData) => {
    const grouped = {};
    rawData.forEach(item => {
      const date = new Date(item.date);
      // Calculate start of week (Sunday)
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      // Use ISO date string as unique week key (YYYY-MM-DD of week start)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!grouped[weekKey]) {
        grouped[weekKey] = {
          date: weekKey,
          energyValues: [],
          stressValues: [],
          entries: []
        };
      }
      
      if (item.energy !== null && item.energy !== undefined) {
        grouped[weekKey].energyValues.push(item.energy);
      }
      if (item.stress !== null && item.stress !== undefined) {
        grouped[weekKey].stressValues.push(item.stress);
      }
      grouped[weekKey].entries.push(item);
    });

    return Object.values(grouped).map(group => ({
      date: group.date,
      energy: group.energyValues.length > 0 
        ? group.energyValues.reduce((sum, val) => sum + val, 0) / group.energyValues.length 
        : null,
      stress: group.stressValues.length > 0 
        ? group.stressValues.reduce((sum, val) => sum + val, 0) / group.stressValues.length 
        : null,
      entriesCount: group.entries.length,
      originalEntries: group.entries,
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, []);

  // Aggregate data by month (for yearly views)
  const aggregateMonthly = useCallback((rawData) => {
    const grouped = {};
    rawData.forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          date: `${monthKey}-01`,
          energyValues: [],
          stressValues: [],
          entries: []
        };
      }
      
      if (item.energy !== null && item.energy !== undefined) {
        grouped[monthKey].energyValues.push(item.energy);
      }
      if (item.stress !== null && item.stress !== undefined) {
        grouped[monthKey].stressValues.push(item.stress);
      }
      grouped[monthKey].entries.push(item);
    });

    return Object.values(grouped).map(group => ({
      date: group.date,
      energy: group.energyValues.length > 0 
        ? group.energyValues.reduce((sum, val) => sum + val, 0) / group.energyValues.length 
        : null,
      stress: group.stressValues.length > 0 
        ? group.stressValues.reduce((sum, val) => sum + val, 0) / group.stressValues.length 
        : null,
      entriesCount: group.entries.length,
      originalEntries: group.entries,
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, []);

  // Filter data by date range (before aggregation)
  const filteredDailyData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let filteredData;

    if (isCustomRange) {
      // Custom date range filtering
      const startDate = new Date(customStartDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);

      filteredData = data.filter(item => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate >= startDate && itemDate <= endDate;
      }).sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
      // Preset timeframe filtering
      const currentOption = timeframeOptions.find(opt => opt.key === selectedTimeframe);
      if (!currentOption) return [];

      if (currentOption.days === 9999) {
        filteredData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
      } else {
        const now = new Date();
        const cutoffDate = new Date(now);
        cutoffDate.setDate(cutoffDate.getDate() - (currentOption.days - 1));
        cutoffDate.setHours(0, 0, 0, 0);

        filteredData = data.filter(item => {
          const itemDate = new Date(item.date);
          itemDate.setHours(0, 0, 0, 0);
          return itemDate >= cutoffDate;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
      }
    }

    // Apply time period filtering
    return filterByTimePeriod(filteredData, selectedTimePeriod);
  }, [data, selectedTimeframe, selectedTimePeriod, timeframeOptions, filterByTimePeriod, isCustomRange, customStartDate, customEndDate]);

  // Smart data aggregation with proper date-based filtering
  const aggregatedData = useMemo(() => {
    if (!filteredDailyData || filteredDailyData.length === 0) return [];

    // For custom ranges, determine aggregation based on date range length
    if (isCustomRange) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      
      if (daysDiff <= 14) {
        return filteredDailyData; // No aggregation for short ranges
      } else if (daysDiff <= 90) {
        return aggregateDaily(filteredDailyData); // Daily aggregation
      } else if (daysDiff <= 365) {
        return aggregateWeekly(filteredDailyData); // Weekly aggregation
      } else {
        return aggregateMonthly(filteredDailyData); // Monthly aggregation
      }
    }

    // Preset timeframe aggregation
    const currentOption = timeframeOptions.find(opt => opt.key === selectedTimeframe);
    if (!currentOption) return [];

    // Apply aggregation if needed
    switch (currentOption.aggregation) {
      case 'daily':
        return aggregateDaily(filteredDailyData);
      case 'weekly':
        return aggregateWeekly(filteredDailyData);
      case 'monthly':
        return aggregateMonthly(filteredDailyData);
      default:
        return filteredDailyData;
    }
  }, [filteredDailyData, selectedTimeframe, timeframeOptions, aggregateDaily, aggregateWeekly, aggregateMonthly, isCustomRange, customStartDate, customEndDate]);

  // Calculate actual date range being displayed
  const dateRange = useMemo(() => {
    if (!aggregatedData || aggregatedData.length === 0) return null;

    let startDate, endDate;

    if (isCustomRange) {
      // Use custom date range
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
    } else {
      // Use preset timeframe
      const currentOption = timeframeOptions.find(opt => opt.key === selectedTimeframe);
      if (!currentOption) return null;

      // Get the actual first and last dates from the filtered data
      const sortedData = [...aggregatedData].sort((a, b) => new Date(a.date) - new Date(b.date));
      startDate = new Date(sortedData[0].date);
      endDate = new Date(sortedData[sortedData.length - 1].date);
    }

    // Format dates for display
    const formatDateRange = (start, end) => {
      const isSameYear = start.getFullYear() === end.getFullYear();
      const isSameMonth = isSameYear && start.getMonth() === end.getMonth();
      const isSameDay = isSameMonth && start.getDate() === end.getDate();

      if (isSameDay) {
        return start.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: start.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
      }

      const startFormat = {
        month: 'short',
        day: 'numeric',
        year: isSameYear ? undefined : 'numeric'
      };

      const endFormat = {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      };

      return `${start.toLocaleDateString('en-US', startFormat)} - ${end.toLocaleDateString('en-US', endFormat)}`;
    };

      return {
        startDate,
        endDate,
        formatted: formatDateRange(startDate, endDate),
        dataPoints: aggregatedData.length
      };
    }, [aggregatedData, selectedTimeframe, timeframeOptions, isCustomRange, customStartDate, customEndDate]);

  // Format labels with enhanced date formatting - clearer month indicators
  const formatLabel = useCallback((dateString, aggregation) => {
    const date = new Date(dateString);
    
    switch (aggregation) {
      case 'weekly':
        // For weekly view, show month and day range start
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      case 'monthly':
        // For monthly view, clearly show month name
        return date.toLocaleDateString('en-US', { 
          month: 'short',
          year: '2-digit'
        });
      default:
        const currentOption = timeframeOptions.find(opt => opt.key === selectedTimeframe);
        const days = currentOption?.days || selectedTimeframe;
        
        if (days <= 7) {
          return date.toLocaleDateString('en-US', { 
            weekday: 'short',
            day: 'numeric'
          });
        } else if (days <= 14) {
          return date.toLocaleDateString('en-US', { 
            weekday: 'short',
            day: 'numeric'
          });
        } else {
          // For 1M view, show day and month
          return date.toLocaleDateString('en-US', { 
            day: 'numeric',
            month: 'short'
          });
        }
    }
  }, [selectedTimeframe, timeframeOptions]);

  // Extract aggregation info for use in render - account for custom ranges
  const getEffectiveAggregation = useCallback(() => {
    if (isCustomRange) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      
      if (daysDiff <= 14) {
        return 'none'; // No aggregation for short ranges
      } else if (daysDiff <= 90) {
        return 'daily'; // Daily aggregation
      } else if (daysDiff <= 365) {
        return 'weekly'; // Weekly aggregation
      } else {
        return 'monthly'; // Monthly aggregation
      }
    }
    const currentOption = timeframeOptions.find(opt => opt.key === selectedTimeframe);
    return currentOption?.aggregation || 'none';
  }, [isCustomRange, customStartDate, customEndDate, selectedTimeframe, timeframeOptions]);

  const aggregation = getEffectiveAggregation();
  const isNonAggregated = aggregation === 'none';
  
  // For longer periods (1M+ or custom ranges > 30 days), we show additional insights below the chart
  const showPeriodInsights = useMemo(() => {
    if (isCustomRange) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      return daysDiff >= 30;
    }
    return selectedTimeframe >= 30;
  }, [isCustomRange, customStartDate, customEndDate, selectedTimeframe]);

  // Prepare chart data with enhanced date labeling
  const chartData = useMemo(() => {
    console.log('EnhancedAnalyticsPanel: Preparing chart data, aggregatedData length:', aggregatedData?.length || 0);
    if (!aggregatedData || aggregatedData.length === 0) {
      console.log('EnhancedAnalyticsPanel: No aggregated data, returning empty chart');
      return { labels: [], datasets: [] };
    }

    // Smart label generation with clear month indicators
    let labels;
    if (isNonAggregated && aggregatedData.length <= 14) {
      // Use empty labels, we'll overlay custom ones
      labels = aggregatedData.map(() => '');
    } else {
      // Use smart sampling for aggregated or dense data
      const maxLabels = screenWidth < 400 ? 5 : 7;
      const labelStep = Math.max(1, Math.ceil(aggregatedData.length / maxLabels));
      
      labels = aggregatedData.map((item, index) => {
        // Always show first and last labels for context
        const isFirst = index === 0;
        const isLast = index === aggregatedData.length - 1;
        const isStepLabel = index % labelStep === 0;
        
        if (isFirst || isLast || isStepLabel) {
          return formatLabel(item.date, aggregation);
        }
        return '';
      });
    }

    const datasets = [];

    if (selectedDataSource === 'energy' || selectedDataSource === 'both') {
      // Ensure we have valid data points - use null instead of 0 for missing data
      const energyData = aggregatedData.map(item => {
        if (item.energy !== null && item.energy !== undefined) {
          return item.energy;
        }
        // Check if we have energy levels to calculate from
        if (item.energyLevels) {
          const energyValues = Object.values(item.energyLevels).filter(val => val !== null && val !== undefined);
          return energyValues.length > 0 
            ? energyValues.reduce((sum, val) => sum + val, 0) / energyValues.length 
            : null;
        }
        return null;
      });
      
      // Replace null values with 0 for chart display, but ensure we have at least some valid data
      const processedEnergyData = energyData.map(val => val === null ? 0 : val);
      const hasValidEnergyData = energyData.some(val => val !== null);
      
      if (hasValidEnergyData) {
        datasets.push({
          data: processedEnergyData,
          color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
          strokeWidth: 3,
          withDots: aggregatedData.length <= 31, // Only show dots for smaller datasets
        });
      }
    }

    if (selectedDataSource === 'stress' || selectedDataSource === 'both') {
      // Ensure we have valid data points - use null instead of 0 for missing data
      const stressData = aggregatedData.map(item => {
        if (item.stress !== null && item.stress !== undefined) {
          return item.stress;
        }
        // Check if we have stress levels to calculate from
        if (item.stressLevels) {
          const stressValues = Object.values(item.stressLevels).filter(val => val !== null && val !== undefined);
          return stressValues.length > 0 
            ? stressValues.reduce((sum, val) => sum + val, 0) / stressValues.length 
            : null;
        }
        return null;
      });
      
      // Replace null values with 0 for chart display, but ensure we have at least some valid data
      const processedStressData = stressData.map(val => val === null ? 0 : val);
      const hasValidStressData = stressData.some(val => val !== null);
      
      if (hasValidStressData) {
        datasets.push({
          data: processedStressData,
          color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`,
          strokeWidth: 3,
          withDots: aggregatedData.length <= 31, // Only show dots for smaller datasets
        });
      }
    }

    return { labels, datasets, isNonAggregated, dataLength: aggregatedData.length };
  }, [aggregatedData, selectedDataSource, selectedTimeframe, screenWidth, formatLabel, timeframeOptions, isNonAggregated]);

  // Chart configuration with enhanced label styling and smart rotation
  const chartConfig = useMemo(() => ({
    backgroundColor: 'transparent',
    backgroundGradientFrom: theme.colors.cardBackground,
    backgroundGradientTo: theme.colors.cardBackground,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(${theme.colors.labelRGB || '0, 0, 0'}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${theme.colors.secondaryLabelRGB || '128, 128, 128'}, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: aggregatedData.length > 31 ? '0' : '4',
      strokeWidth: '2',
      stroke: theme.colors.cardBackground,
    },
    propsForVerticalLabels: { 
      fontSize: 10,
      fontWeight: '500'
    },
    propsForHorizontalLabels: { 
      fontSize: (() => {
        // Optimized font size for compact labels
        const { isNonAggregated, dataLength } = chartData;
        return (isNonAggregated && dataLength <= 14) ? 9 : 9;
      })(),
      fontWeight: '500',
      textAlign: 'center',
    },

    fillShadowGradient: chartType === 'area' ? theme.colors.systemBlue : 'transparent',
    fillShadowGradientOpacity: chartType === 'area' ? 0.1 : 0,
    segments: Math.min(4, Math.max(2, Math.ceil(aggregatedData.length / 10))),
  }), [theme, chartType, aggregatedData.length, selectedTimeframe, timeframeOptions, chartData]);

  // Handle timeframe change
  const handleTimeframeChange = useCallback((timeframe) => {
    if (timeframe !== selectedTimeframe) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedTimeframe(timeframe);
      setIsCustomRange(false);
      setSelectedDataPointIndex(null);
      setTooltipVisible(false);
      
      // Animate custom range collapse
      Animated.timing(customRangeHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [selectedTimeframe, customRangeHeight]);

  // Handle custom range toggle
  const handleCustomRangeToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newIsCustom = !isCustomRange;
    setIsCustomRange(newIsCustom);
    
    if (newIsCustom) {
      // Animate expand
      Animated.timing(customRangeHeight, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }).start();
    } else {
      // Animate collapse
      Animated.timing(customRangeHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isCustomRange, customRangeHeight]);

  // Handle custom date changes
  const handleCustomStartDateChange = useCallback((dateString) => {
    const newDate = new Date(dateString);
    const endDate = new Date(customEndDate);
    
    // Ensure start date is not after end date
    if (newDate > endDate) {
      setCustomEndDate(dateString);
    }
    setCustomStartDate(dateString);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [customEndDate]);

  const handleCustomEndDateChange = useCallback((dateString) => {
    const newDate = new Date(dateString);
    const startDate = new Date(customStartDate);
    
    // Ensure end date is not before start date
    if (newDate < startDate) {
      setCustomStartDate(dateString);
    }
    setCustomEndDate(dateString);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [customStartDate]);

  // Handle data source change
  const handleDataSourceChange = useCallback((source) => {
    if (source !== selectedDataSource) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedDataSource(source);
    }
  }, [selectedDataSource]);

  // Handle chart type change
  const handleChartTypeChange = useCallback((type) => {
    if (type !== chartType) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setChartType(type);
    }
  }, [chartType]);

  // Handle time period change
  const handleTimePeriodChange = useCallback((period) => {
    if (period !== selectedTimePeriod) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedTimePeriod(period);
      setSelectedDataPointIndex(null);
      setTooltipVisible(false);
    }
  }, [selectedTimePeriod]);

  // Calculate chart dimensions for touch handling
  const getChartDimensions = useCallback(() => {
    // More accurate padding based on react-native-chart-kit internals
    const leftPadding = 55; // Slightly more to account for Y-axis labels
    const rightPadding = 20; // Less padding on right
    const topPadding = 20;
    const bottomPadding = 40;
    
    return {
      leftPadding,
      rightPadding,
      topPadding,
      bottomPadding,
      chartStartX: leftPadding,
      chartEndX: chartWidth - rightPadding,
      chartStartY: topPadding,
      chartEndY: 280 - bottomPadding,
      get chartDataWidth() {
        return this.chartEndX - this.chartStartX;
      },
      get chartDataHeight() {
        return this.chartEndY - this.chartStartY;
      }
    };
  }, [chartWidth]);

  // Get data point from touch coordinates with improved precision
  const getDataPointFromTouch = useCallback((x, y) => {
    const { chartStartX, chartEndX, chartDataWidth } = getChartDimensions();
    
    if (x < chartStartX || x > chartEndX || !aggregatedData || aggregatedData.length === 0) {
      return null;
    }
    
    const relativeX = x - chartStartX;
    const exactIndex = (relativeX / chartDataWidth) * (aggregatedData.length - 1);
    
    // More precise hit detection with smaller threshold
    const baseThreshold = 20; // Reduced from 30
    const densityFactor = Math.max(0.6, Math.min(1.5, 40 / aggregatedData.length));
    const hitThreshold = baseThreshold * densityFactor;
    
    const pixelsPerPoint = chartDataWidth / Math.max(1, aggregatedData.length - 1);
    const maxDistance = hitThreshold / pixelsPerPoint;
    
    const closestIndex = Math.round(exactIndex);
    const distance = Math.abs(exactIndex - closestIndex);
    
    if (distance <= maxDistance && closestIndex >= 0 && closestIndex < aggregatedData.length) {
      // Calculate precise X position for the data point
      const preciseX = chartStartX + (closestIndex / Math.max(1, aggregatedData.length - 1)) * chartDataWidth;
      
      return { 
        index: closestIndex, 
        data: aggregatedData[closestIndex],
        touchX: preciseX, // Use calculated position instead of touch position
        touchY: y
      };
    }
    
    return null;
  }, [aggregatedData, getChartDimensions]);

  // Show detailed tooltip with enhanced error handling
  const showDetailedTooltip = useCallback((dataPoint, touchX, touchY) => {
    try {
      // Validate inputs
      if (!dataPoint || !dataPoint.data || typeof touchX !== 'number' || typeof touchY !== 'number') {
        return;
      }

      // Use requestAnimationFrame to ensure we're not in render phase
      requestAnimationFrame(() => {
        try {
          setSelectedDataPointIndex(dataPoint.index);
          setDetailedData(dataPoint.data);
          setTooltipPosition({ x: touchX, y: touchY });
          setTooltipVisible(true);
          
          // Animate tooltip appearance
          Animated.parallel([
            Animated.timing(tooltipOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.spring(tooltipScale, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start();

          // Call parent callback if provided
          if (onDataPointSelect) {
            onDataPointSelect(dataPoint.data);
          }
        } catch (error) {
          console.warn('Error in tooltip RAF callback:', error);
        }
      });
    } catch (error) {
      console.warn('Show tooltip error:', error);
    }
  }, [onDataPointSelect, tooltipOpacity, tooltipScale]);

  // Hide tooltip with enhanced error handling
  const hideTooltip = useCallback(() => {
    try {
      // Use requestAnimationFrame to ensure we're not in render phase
      requestAnimationFrame(() => {
        try {
          Animated.parallel([
            Animated.timing(tooltipOpacity, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(tooltipScale, {
              toValue: 0.8,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Use another requestAnimationFrame for state updates
            requestAnimationFrame(() => {
              try {
                setTooltipVisible(false);
                setSelectedDataPointIndex(null);
                setDetailedData(null);
                setTooltipPosition(null);
              } catch (error) {
                console.warn('Hide tooltip state update error:', error);
              }
            });
          });
        } catch (error) {
          console.warn('Hide tooltip animation error:', error);
          // Fallback: directly hide without animation
          requestAnimationFrame(() => {
            setTooltipVisible(false);
            setSelectedDataPointIndex(null);
            setDetailedData(null);
            setTooltipPosition(null);
          });
        }
      });
    } catch (error) {
      console.warn('Critical hide tooltip error:', error);
      // Emergency fallback
      setTooltipVisible(false);
      setSelectedDataPointIndex(null);
      setDetailedData(null);
      setTooltipPosition(null);
    }
  }, [tooltipOpacity, tooltipScale]);

  // Pan responder for touch interactions with better error handling
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    
    onPanResponderGrant: (evt) => {
      try {
        const { locationX, locationY } = evt.nativeEvent;
        
        // Enhanced validation with NaN checks and wider bounds
        if (typeof locationX !== 'number' || typeof locationY !== 'number' || 
            isNaN(locationX) || isNaN(locationY) ||
            locationX < -50 || locationY < -50 || 
            locationX > chartWidth + 50 || locationY > 450) {
          return;
        }
        
        const dataPoint = getDataPointFromTouch(locationX, locationY);
        
        if (dataPoint) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          showDetailedTooltip(dataPoint, locationX, locationY);
        } else {
          hideTooltip();
        }
      } catch (error) {
        console.warn('Pan responder grant error:', error);
      }
    },
    
    onPanResponderMove: (evt) => {
      try {
        const { locationX, locationY } = evt.nativeEvent;
        
        // Enhanced validation with NaN checks and wider bounds for smoother interaction
        if (typeof locationX !== 'number' || typeof locationY !== 'number' || 
            isNaN(locationX) || isNaN(locationY) ||
            locationX < -100 || locationY < -100 || 
            locationX > chartWidth + 100 || locationY > 500) {
          hideTooltip();
          return;
        }
        
        const dataPoint = getDataPointFromTouch(locationX, locationY);
        
        if (dataPoint && dataPoint.index !== selectedDataPointIndex) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          showDetailedTooltip(dataPoint, locationX, locationY);
        } else if (dataPoint) {
          // Update tooltip position for same point - direct update without animation frame
          if (tooltipVisible) {
            setTooltipPosition({ x: locationX, y: locationY });
          }
        } else {
          hideTooltip();
        }
      } catch (error) {
        console.warn('Pan responder move error:', error);
        hideTooltip();
      }
    },
    
    onPanResponderRelease: () => {
      try {
        // Use requestAnimationFrame for delayed hiding
        requestAnimationFrame(() => {
          setTimeout(() => {
            hideTooltip();
          }, 3000); // Reduced timeout for better UX
        });
      } catch (error) {
        console.warn('Pan responder release error:', error);
        hideTooltip();
      }
    },
  }), [getDataPointFromTouch, selectedDataPointIndex, showDetailedTooltip, hideTooltip, chartWidth, tooltipVisible]);

  // Render weekend highlights - only for daily views (7D, 2W, 1M), not for weekly/monthly aggregation
  const renderWeekendHighlights = useCallback(() => {
    // Don't show weekend highlights for weekly or monthly aggregation - it doesn't make sense
    if (aggregation === 'weekly' || aggregation === 'monthly') return null;
    if (!aggregatedData || aggregatedData.length === 0) return null;
    
    const { chartStartX, chartDataWidth } = getChartDimensions();
    const pointWidth = chartDataWidth / Math.max(1, aggregatedData.length - 1);
    
    return aggregatedData.map((item, index) => {
      const date = new Date(item.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      if (!isWeekend) return null;
      
      const x = chartStartX + (index / Math.max(1, aggregatedData.length - 1)) * chartDataWidth;
      
      return (
        <View
          key={`weekend-${index}`}
          style={[
            styles.weekendHighlight,
            {
              left: x - pointWidth / 2,
              width: Math.max(pointWidth, 20),
            }
          ]}
        />
      );
    });
  }, [aggregatedData, getChartDimensions, styles]);

  // Render detailed tooltip - different views for daily vs aggregated data
  const renderDetailedTooltip = useCallback(() => {
    if (!tooltipVisible || !detailedData || !tooltipPosition) return null;

    const data = detailedData;
    const effectiveAggregation = getEffectiveAggregation();
    const isAggregatedView = effectiveAggregation === 'weekly' || effectiveAggregation === 'monthly' || effectiveAggregation === 'daily';
    const chartWidth = screenWidth - 48;

    // Format date based on aggregation type - synchronized with chart labels
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const effectiveAggregation = getEffectiveAggregation();
      
      // Get the actual date range length for custom ranges
      let daysInRange = null;
      if (isCustomRange) {
        const startDate = new Date(customStartDate);
        const endDate = new Date(customEndDate);
        daysInRange = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      } else {
        const currentOption = timeframeOptions.find(opt => opt.key === selectedTimeframe);
        daysInRange = currentOption?.days || selectedTimeframe;
      }
      
      if (effectiveAggregation === 'monthly') {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      } else if (effectiveAggregation === 'weekly') {
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 6);
        return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else if (effectiveAggregation === 'daily') {
        // For daily aggregation (1M view), show day and month
        return date.toLocaleDateString('en-US', { 
          day: 'numeric',
          month: 'short',
          year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
      } else {
        // No aggregation - show detailed date based on range length
        if (daysInRange <= 7) {
          return date.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
          });
        } else if (daysInRange <= 14) {
          return date.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
          });
        } else {
          return date.toLocaleDateString('en-US', { 
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
          });
        }
      }
    };

    // For 1M+ (aggregated views): Show period details tooltip at fingertip
    if (showPeriodInsights) {
      const periodWidth = 260;
      let periodX = tooltipPosition.x - periodWidth / 2;
      let periodY = tooltipPosition.y - 280; // Position above finger (more space for sources)
      
      // Boundary checks
      if (periodX < -24) periodX = -24;
      if (periodX + periodWidth > chartWidth + 24) periodX = chartWidth - periodWidth + 24;
      if (periodY < -300) periodY = tooltipPosition.y + 30; // Show below if too high

      const getPeriodLabel = () => {
        if (effectiveAggregation === 'monthly') return 'Month';
        if (effectiveAggregation === 'weekly') return 'Week';
        if (effectiveAggregation === 'daily') return 'Day';
        return 'Day';
      };

      // Extract and count top sources from original entries
      const getTopSources = (entries, sourceKey) => {
        const sourceCounts = {};
        entries?.forEach(entry => {
          let sources = entry[sourceKey];
          if (!sources) return;
          if (typeof sources === 'string') {
            sources = sources.split(/[,;.]/).map(s => s.trim()).filter(s => s.length > 0);
          }
          if (Array.isArray(sources)) {
            sources.forEach(source => {
              if (source && source.length > 0) {
                sourceCounts[source] = (sourceCounts[source] || 0) + 1;
              }
            });
          }
        });
        return Object.entries(sourceCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([source]) => source);
      };

      const topEnergySources = getTopSources(data.originalEntries, 'energySources');
      const topStressSources = getTopSources(data.originalEntries, 'stressSources');
      const hasSources = topEnergySources.length > 0 || topStressSources.length > 0;

      return (
        <Animated.View 
          style={[
            styles.periodTooltip,
            {
              left: periodX,
              top: periodY,
              opacity: tooltipOpacity,
              transform: [{ scale: tooltipScale }],
            }
          ]}
        >
          {/* Period Date - Clean header */}
          <Text style={styles.periodTooltipDate}>{formatDate(data.date)}</Text>
          
          {/* Stats Row */}
          <View style={styles.periodTooltipStats}>
            {(selectedDataSource === 'energy' || selectedDataSource === 'both') && (
              <View style={styles.periodStatItem}>
                <Text style={[styles.periodStatValue, { color: theme.colors.energy }]}>
                  {data.energy?.toFixed(1) || '--'}
                </Text>
                <Text style={styles.periodStatLabel}>Energy</Text>
              </View>
            )}
            {(selectedDataSource === 'stress' || selectedDataSource === 'both') && (
              <View style={styles.periodStatItem}>
                <Text style={[styles.periodStatValue, { color: theme.colors.stress }]}>
                  {data.stress?.toFixed(1) || '--'}
                </Text>
                <Text style={styles.periodStatLabel}>Stress</Text>
              </View>
            )}
            <View style={styles.periodStatItem}>
              <Text style={styles.periodStatValue}>
                {data.entriesCount || '--'}
              </Text>
              <Text style={styles.periodStatLabel}>Days</Text>
            </View>
          </View>

          {/* Top Sources - Expanded view */}
          {hasSources && (
            <View style={styles.periodSourcesContainer}>
              {topEnergySources.length > 0 && (selectedDataSource === 'energy' || selectedDataSource === 'both') && (
                <View style={styles.periodSourceSection}>
                  <Text style={[styles.periodSourceLabel, { color: theme.colors.energy }]}>Energy from</Text>
                  <View style={styles.periodSourceTags}>
                    {topEnergySources.map((source, idx) => (
                      <View key={idx} style={[styles.periodSourceTag, { borderColor: theme.colors.energy + '40' }]}>
                        <Text style={styles.periodSourceTagText}>{source}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {topStressSources.length > 0 && (selectedDataSource === 'stress' || selectedDataSource === 'both') && (
                <View style={styles.periodSourceSection}>
                  <Text style={[styles.periodSourceLabel, { color: theme.colors.stress }]}>Stress from</Text>
                  <View style={styles.periodSourceTags}>
                    {topStressSources.map((source, idx) => (
                      <View key={idx} style={[styles.periodSourceTag, { borderColor: theme.colors.stress + '40' }]}>
                        <Text style={styles.periodSourceTagText}>{source}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </Animated.View>
      );
    }

    // For 7D/2W (non-aggregated): Show full detailed tooltip
    const energyLevels = data.energyLevels || {};
    const stressLevels = data.stressLevels || {};
    
    const processSources = (sources) => {
      if (!sources) return [];
      if (Array.isArray(sources)) return sources;
      return sources.split(/[,;.]/).map(s => s.trim()).filter(s => s.length > 0);
    };

    const energySources = processSources(data.energySources);
    const stressSources = processSources(data.stressSources);

    const tooltipWidth = 280;
    const tooltipMaxHeight = 240;
    
    let adjustedX = tooltipPosition.x - tooltipWidth / 2;
    let adjustedY = -tooltipMaxHeight - 80;
    
    if (adjustedX < -24) adjustedX = -24;
    if (adjustedX + tooltipWidth > chartWidth + 24) adjustedX = chartWidth - tooltipWidth + 24;

    return (
      <Animated.View 
        style={[
          styles.detailedTooltip,
          {
            left: adjustedX,
            top: adjustedY,
            opacity: tooltipOpacity,
            transform: [{ scale: tooltipScale }],
          }
        ]}
      >
        {/* Header */}
        <View style={styles.tooltipHeader}>
          <Text style={styles.tooltipDate}>{formatDate(data.date)}</Text>
          {data.entriesCount > 1 && (
            <Text style={styles.tooltipAggregation}>
              📊 {data.entriesCount} entries
            </Text>
          )}
        </View>

        {/* Energy Levels Breakdown */}
        {(selectedDataSource === 'energy' || selectedDataSource === 'both') && (
          <View style={styles.tooltipSection}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: theme.colors.energy }]} />
              <Text style={styles.sectionTitle}>Energy Levels</Text>
            </View>
            
            <View style={styles.levelsGrid}>
              {['morning', 'afternoon', 'evening'].map((period) => (
                <View key={period} style={styles.levelItem}>
                  <Text style={styles.levelPeriod}>
                    {period === 'morning' ? '🌅' : period === 'afternoon' ? '☀️' : '🌙'} {period}
                  </Text>
                  <Text style={styles.levelValue}>
                    {energyLevels[period] ? `${energyLevels[period]}/10` : '--'}
                  </Text>
                </View>
              ))}
            </View>

            {energySources.length > 0 && (
              <View style={styles.sourcesContainer}>
                <Text style={styles.sourcesTitle}>Energy Sources:</Text>
                <Text style={styles.sourcesText} numberOfLines={3}>
                  {energySources.slice(0, 5).join(', ')}
                  {energySources.length > 5 ? '...' : ''}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Stress Levels Breakdown */}
        {(selectedDataSource === 'stress' || selectedDataSource === 'both') && (
          <View style={styles.tooltipSection}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: theme.colors.stress }]} />
              <Text style={styles.sectionTitle}>Stress Levels</Text>
            </View>
            
            <View style={styles.levelsGrid}>
              {['morning', 'afternoon', 'evening'].map((period) => (
                <View key={period} style={styles.levelItem}>
                  <Text style={styles.levelPeriod}>
                    {period === 'morning' ? '🌅' : period === 'afternoon' ? '☀️' : '🌙'} {period}
                  </Text>
                  <Text style={styles.levelValue}>
                    {stressLevels[period] ? `${stressLevels[period]}/10` : '--'}
                  </Text>
                </View>
              ))}
            </View>

            {stressSources.length > 0 && (
              <View style={styles.sourcesContainer}>
                <Text style={styles.sourcesTitle}>Stress Sources:</Text>
                <Text style={styles.sourcesText} numberOfLines={3}>
                  {stressSources.slice(0, 5).join(', ')}
                  {stressSources.length > 5 ? '...' : ''}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Average Summary */}
        <View style={styles.summarySection}>
          {data.energy && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Avg Energy</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.energy }]}>
                {data.energy.toFixed(1)}/10
              </Text>
            </View>
          )}
          {data.stress && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Avg Stress</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.stress }]}>
                {data.stress.toFixed(1)}/10
              </Text>
            </View>
          )}
        </View>

        {/* Touch indicator - always show since tooltip is at top */}
        <View style={[styles.touchIndicator, {
          left: Math.max(8, Math.min(tooltipPosition.x - adjustedX - 4, tooltipWidth - 16)),
          bottom: -6,
        }]} />
      </Animated.View>
    );
  }, [tooltipVisible, detailedData, tooltipPosition, selectedDataSource, theme, tooltipOpacity, tooltipScale, screenWidth, styles, aggregation, getEffectiveAggregation, isCustomRange, customStartDate, customEndDate, selectedTimeframe, timeframeOptions]);

  // Render vertical indicator line and connection to tooltip
  const renderVerticalIndicator = useCallback(() => {
    if (!tooltipVisible || selectedDataPointIndex === null) return null;
    
    const { chartStartX, chartDataWidth } = getChartDimensions();
    const indicatorX = chartStartX + (selectedDataPointIndex / Math.max(1, aggregatedData.length - 1)) * chartDataWidth;
    
    return (
      <>
        {/* Main vertical indicator on chart */}
        <View 
          style={[
            styles.verticalIndicator,
            {
              left: indicatorX - 1,
              top: 20,
              height: 240,
            }
          ]}
        />
        
        {/* Connection line from chart to tooltip */}
        <View 
          style={[
            styles.connectionLine,
            {
              left: indicatorX - 1,
              top: -340, // Connect to tooltip area
              height: 80, // Length of connection line
            }
          ]}
        />
      </>
    );
  }, [tooltipVisible, selectedDataPointIndex, getChartDimensions, aggregatedData.length, styles]);

  // Performance summary for current view
  const performanceSummary = useMemo(() => {
    if (!aggregatedData || aggregatedData.length === 0) return null;

    const energyValues = aggregatedData.filter(d => d.energy !== null).map(d => d.energy);
    const stressValues = aggregatedData.filter(d => d.stress !== null).map(d => d.stress);

    const avgEnergy = energyValues.length > 0 
      ? energyValues.reduce((sum, val) => sum + val, 0) / energyValues.length 
      : null;
    const avgStress = stressValues.length > 0 
      ? stressValues.reduce((sum, val) => sum + val, 0) / stressValues.length 
      : null;

    return { avgEnergy, avgStress, dataPoints: aggregatedData.length };
  }, [aggregatedData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.systemBlue} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Data Available</Text>
        <Text style={styles.emptyDescription}>
          Start tracking your energy and stress levels to see analytics here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {selectedDataSource === 'energy' ? '⚡ Energy Analytics' :
             selectedDataSource === 'stress' ? '😰 Stress Analytics' : 
             '📊 Energy & Stress Analytics'}
            {selectedTimePeriod !== 'all' && (
              <Text style={styles.titlePeriod}>
                {' '}• {timePeriodOptions.find(opt => opt.key === selectedTimePeriod)?.icon}
              </Text>
            )}
          </Text>
          <Text style={styles.subtitle}>
            {selectedTimePeriod === 'all' 
              ? (selectedDataSource === 'energy' ? 'Track your energy patterns and sources' :
                 selectedDataSource === 'stress' ? 'Monitor stress levels and triggers' :
                 'Comprehensive energy and stress insights')
              : `Analyzing ${selectedTimePeriod} ${selectedDataSource === 'both' ? 'energy & stress' : selectedDataSource} patterns`
            }
          </Text>
        </View>

      {/* Enhanced Timeframe Selector */}
      <View style={styles.timeframeContainer}>
        <View style={styles.timeframeHeader}>
          <View style={styles.timeframeTitleRow}>
            <Text style={styles.timeframeTitle}>Time Period</Text>
            {dateRange && (
              <View style={styles.dateRangeLabel}>
                <Text style={styles.dateRangeText}>{dateRange.formatted}</Text>
                <Text style={styles.dateRangeSubtext}>
                  {dateRange.dataPoints} data point{dateRange.dataPoints !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.timeframeSubtitle}>
            Choose how much history to view
          </Text>
        </View>
        
        <View style={styles.timeframePicker}>
          {timeframeOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.timeframeOption,
                selectedTimeframe === option.key && !isCustomRange && styles.activeTimeframeOption,
              ]}
              onPress={() => handleTimeframeChange(option.key)}
              disabled={loading}
            >
              <Text style={[
                styles.timeframeLabel,
                selectedTimeframe === option.key && !isCustomRange && styles.activeTimeframeLabel,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
          
          {/* Custom Range Button */}
          <TouchableOpacity
            style={[
              styles.timeframeOption,
              styles.customRangeOption,
              isCustomRange && styles.activeTimeframeOption,
            ]}
            onPress={handleCustomRangeToggle}
            disabled={loading}
            accessibilityLabel="Custom Date Range"
            accessibilityHint="Tap to select a custom start and end date"
          >
            <View style={styles.customRangeButtonContent}>
              <Text style={[
                styles.customRangeLabel,
                isCustomRange && styles.activeCustomRangeLabel,
              ]}>
                Custom
              </Text>
              <Animated.View
                style={{
                  transform: [{
                    rotate: customRangeHeight.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg'],
                    }),
                  }],
                }}
              >
                <Ionicons 
                  name="chevron-down" 
                  size={12} 
                  color={isCustomRange ? theme.colors.systemBlue : theme.colors.secondaryText} 
                />
              </Animated.View>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Custom Date Range Inputs */}
        <Animated.View 
          style={[
            styles.customRangeContainer,
            {
              maxHeight: customRangeHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 220],
              }),
              opacity: customRangeHeight,
              marginBottom: customRangeHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 8],
              }),
            }
          ]}
        >
          {isCustomRange && (
            <View style={styles.customRangeContent}>
              <View style={styles.customRangeHeader}>
                <View style={styles.customRangeHeaderLeft}>
                  <Ionicons 
                    name="calendar-outline" 
                    size={16} 
                    color={theme.colors.systemBlue} 
                  />
                  <Text style={styles.customRangeTitle}>Select Date Range</Text>
                </View>
              </View>
              
              <View style={styles.dateInputRow}>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>From</Text>
                  <DatePicker
                    selectedDate={customStartDate}
                    onDateChange={handleCustomStartDateChange}
                    theme={theme}
                    style={styles.datePicker}
                  />
                </View>
                
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>To</Text>
                  <DatePicker
                    selectedDate={customEndDate}
                    onDateChange={handleCustomEndDateChange}
                    theme={theme}
                    style={styles.datePicker}
                  />
                </View>
              </View>
              
              <View style={styles.rangeInfo}>
                <Text style={styles.rangeInfoText}>
                  {(() => {
                    const start = new Date(customStartDate);
                    const end = new Date(customEndDate);
                    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                    return `${days} day${days !== 1 ? 's' : ''}`;
                  })()}
                </Text>
              </View>
            </View>
          )}
        </Animated.View>
        
        {/* Data Source Toggle */}
        <View style={styles.dataSourceContainer}>
          <View style={styles.dataSourceButtons}>
            {dataSourceOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.dataSourceButton,
                  selectedDataSource === option.key && styles.activeDataSourceButton,
                ]}
                onPress={() => handleDataSourceChange(option.key)}
                disabled={loading}
              >
                <View style={[styles.dataSourceIndicator, { backgroundColor: option.color }]} />
                <Text style={[
                  styles.dataSourceText,
                  selectedDataSource === option.key && styles.activeDataSourceText,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Period Selector */}
        <View style={styles.timePeriodContainer}>
          <View style={styles.timePeriodButtons}>
            {timePeriodOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.timePeriodButton,
                  selectedTimePeriod === option.key && styles.activeTimePeriodButton,
                ]}
                onPress={() => handleTimePeriodChange(option.key)}
                disabled={loading}
              >
                <Text style={styles.timePeriodIcon}>{option.icon}</Text>
                <Text style={[
                  styles.timePeriodText,
                  selectedTimePeriod === option.key && styles.activeTimePeriodText,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Performance Summary */}
      {performanceSummary && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {performanceSummary.avgEnergy?.toFixed(1) || '--'}
            </Text>
            <Text style={styles.summaryLabel}>Avg Energy</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {performanceSummary.avgStress?.toFixed(1) || '--'}
            </Text>
            <Text style={styles.summaryLabel}>Avg Stress</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {performanceSummary.dataPoints}
            </Text>
            <Text style={styles.summaryLabel}>Data Points</Text>
          </View>
        </View>
      )}

      {/* Touch instruction */}
      {!tooltipVisible && chartData.labels.length > 0 && (
        <View style={styles.touchInstruction}>
          <Text style={styles.touchInstructionText}>
            Touch chart for details
          </Text>
        </View>
      )}

      {/* Chart Container */}
      <View style={styles.chartContainer}>
          {chartData.labels.length > 0 ? (
            <View style={styles.interactiveChartWrapper} {...panResponder.panHandlers}>
              <LineChart
                data={chartData}
                width={chartWidth}
                height={280}
                chartConfig={chartConfig}
                bezier={aggregatedData.length <= 31} // Only use bezier for smaller datasets
                style={styles.chart}
                withVerticalLines={false}
                withHorizontalLines={true}
                withDots={aggregatedData.length <= 31}
                withShadow={false}
                segments={chartConfig.segments}
              />
              
              {/* Custom Two-Row Date Labels Overlay */}
              {isNonAggregated && aggregatedData.length <= 14 && (
                <View style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 50,
                  right: 20,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  height: 35,
                  backgroundColor: 'transparent',
                }}>
                  {aggregatedData.map((item, index) => {
                    const date = new Date(item.date);
                    const day = date.getDate();
                    const month = date.toLocaleDateString('en-US', { month: 'short' });
                    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
                    
                    // Smart sampling logic
                    let shouldShow = false;
                    if (aggregatedData.length <= 7) {
                      shouldShow = true;
                    } else if (aggregatedData.length <= 10) {
                      shouldShow = index % 2 === 0;
                    } else {
                      shouldShow = index % 3 === 0;
                    }
                    
                    if (!shouldShow) {
                      return <View key={index} style={{ flex: 1 }} />;
                    }
                    
                    return (
                      <View key={index} style={{ 
                        flex: 1, 
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingBottom: 5,
                      }}>
                        <Text style={{
                          fontSize: 9,
                          fontWeight: '600',
                          color: theme.colors.text,
                          textAlign: 'center',
                          marginBottom: 1,
                        }}>
                          {weekday.slice(0, 3)}
                        </Text>
                        <Text style={{
                          fontSize: 8,
                          fontWeight: '500',
                          color: theme.colors.secondaryText,
                          textAlign: 'center',
                        }}>
                          {day} {month.slice(0, 3)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
              
              {renderVerticalIndicator()}
              {renderDetailedTooltip()}
              {renderWeekendHighlights()}
            </View>
          ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No data for selected period</Text>
          </View>
        )}
      </View>

      {/* Enhanced Legend */}
      <View style={styles.legend}>
          {/* Data source indicators */}
          {selectedDataSource === 'both' && (
            <>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.energy }]} />
                <Text style={styles.legendText}>Energy</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.stress }]} />
                <Text style={styles.legendText}>Stress</Text>
              </View>
            </>
          )}
          
          {/* Weekend indicator - only show for daily views, not weekly/monthly */}
          {aggregation !== 'weekly' && aggregation !== 'monthly' && aggregatedData && aggregatedData.some(item => {
            const date = new Date(item.date);
            const dayOfWeek = date.getDay();
            return dayOfWeek === 0 || dayOfWeek === 6;
          }) && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { 
                backgroundColor: theme.colors.systemOrange,
                opacity: 0.6
              }]} />
              <Text style={styles.legendText}>Weekend</Text>
            </View>
          )}
        </View>

      {/* Simple chart explanation for longer periods */}
      {showPeriodInsights && (
        <View style={styles.chartExplanation}>
          <Text style={styles.chartExplanationText}>
            {aggregation === 'weekly' ? '📊 Each dot = one week average' : 
             aggregation === 'monthly' ? '📊 Each dot = one month average' : 
             '📊 Each dot = one day average'}
          </Text>
          {/* Show actual data range with months */}
          {dateRange && (
            <Text style={styles.dataAvailabilityText}>
              Showing: {dateRange.formatted}
            </Text>
          )}
        </View>
      )}

      {/* Period Insights - Simple highlights for longer timeframes (moved above correlation) */}
      {showPeriodInsights && filteredDailyData.length >= 3 && (
        <PeriodInsightsPanel 
          data={filteredDailyData}
          aggregatedData={aggregatedData}
          theme={theme}
          aggregation={aggregation}
          selectedTimeframe={selectedTimeframe}
        />
      )}

      {/* Energy-Stress Correlation Analysis */}
      {selectedDataSource === 'both' && aggregatedData.length >= 3 && (
        <EnergyStressCorrelation 
          data={aggregatedData}
          theme={theme}
          timeframe={selectedTimeframe}
          showExpanded={false}
        />
      )}
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    marginHorizontal: 24,
    marginVertical: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  header: {
    padding: 24,
    paddingBottom: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },

  titlePeriod: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.systemBlue,
  },

  subtitle: {
    fontSize: 15,
    color: theme.colors.secondaryText,
  },

  // Enhanced Timeframe Selector Styles
  timeframeContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },

  timeframeHeader: {
    marginBottom: 16,
  },

  timeframeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },

  timeframeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },

  dateRangeLabel: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },

  dateRangeText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.systemBlue,
    marginBottom: 2,
  },

  dateRangeSubtext: {
    fontSize: 10,
    color: theme.colors.secondaryText,
    fontStyle: 'italic',
  },

  timeframeSubtitle: {
    fontSize: 14,
    color: theme.colors.secondaryText,
    lineHeight: 20,
  },

  timeframePicker: {
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 16,
    padding: 2,
    flexDirection: 'row',
    marginBottom: 20,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  timeframeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 1,
    borderRadius: 14,
    minHeight: 44,
    justifyContent: 'center',
    marginHorizontal: 0.5,
  },

  customRangeOption: {
    flex: 0.9,
    minWidth: 70,
  },

  customRangeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  customRangeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.secondaryText,
  },

  activeCustomRangeLabel: {
    color: theme.colors.systemBlue,
    fontWeight: '700',
  },

  activeTimeframeOption: {
    backgroundColor: theme.colors.systemBackground,
    shadowColor: theme.colors.systemBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ scale: 1.02 }],
    borderWidth: 1.5,
    borderColor: theme.colors.systemBlue,
  },

  timeframeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.secondaryText,
    textAlign: 'center',
  },

  activeTimeframeLabel: {
    color: theme.colors.systemBlue,
    fontWeight: '700',
    fontSize: 14,
  },

  // Custom Range Styles
  customRangeContainer: {
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 8,
  },

  customRangeContent: {
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.systemGray5,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  customRangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  customRangeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },

  customRangeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },

  dateInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  dateInputContainer: {
    flex: 1,
  },

  dateInputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.secondaryText,
    marginBottom: 8,
    textAlign: 'center',
  },

  datePicker: {
    width: '100%',
  },

  rangeInfo: {
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.separator,
  },

  rangeInfoText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.systemBlue,
  },

  // Data Source Styles
  dataSourceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.systemGray5,
  },

  dataSourceButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  dataSourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  activeDataSourceButton: {
    backgroundColor: theme.colors.cardBackground,
    borderColor: theme.colors.systemGray4,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  dataSourceIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  dataSourceText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.secondaryText,
  },

  activeDataSourceText: {
    color: theme.colors.text,
    fontWeight: '600',
  },

  // Time Period Selector Styles (matching dataSourceContainer design)
  timePeriodContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.systemGray5,
    marginTop: 16,
  },

  timePeriodButtons: {
    flexDirection: 'row',
    gap: 6,
  },

  timePeriodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 50,
  },

  activeTimePeriodButton: {
    backgroundColor: theme.colors.cardBackground,
    borderColor: theme.colors.systemGray4,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  timePeriodIcon: {
    fontSize: 11,
    marginRight: 3,
  },

  timePeriodText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.secondaryText,
  },

  activeTimePeriodText: {
    color: theme.colors.text,
    fontWeight: '600',
  },

  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 16,
    justifyContent: 'space-around',
  },

  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },

  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },

  summaryLabel: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    marginTop: 2,
  },

  chartContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    overflow: 'visible',
  },

  interactiveChartWrapper: {
    position: 'relative',
    alignItems: 'center',
    zIndex: 1,
    overflow: 'visible',
  },

  chart: {
    borderRadius: 12,
  },

  verticalIndicator: {
    position: 'absolute',
    width: 2,
    backgroundColor: theme.colors.systemBlue,
    borderRadius: 1,
    opacity: 0.8,
    zIndex: 10,
    shadowColor: theme.colors.systemBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },

  connectionLine: {
    position: 'absolute',
    width: 2,
    backgroundColor: theme.colors.systemBlue,
    borderRadius: 1,
    opacity: 0.6,
    zIndex: 9,
  },

  weekendHighlight: {
    position: 'absolute',
    top: 15,
    height: 265,
    backgroundColor: theme.colors.systemOrange,
    opacity: 0.1,
    zIndex: 1,
    borderRadius: 4,
  },

  detailedTooltip: {
    position: 'absolute',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    minWidth: 260,
    maxWidth: 280,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
    borderWidth: 1,
    borderColor: theme.colors.separator,
  },

  // Compact tooltip for aggregated views (1M+) - appears at fingertip
  compactTooltip: {
    position: 'absolute',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    minWidth: 140,
    maxWidth: 180,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 15,
    borderWidth: 1,
    borderColor: theme.colors.separator,
    alignItems: 'center',
  },

  compactTooltipTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },

  compactTooltipStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },

  compactStatItem: {
    alignItems: 'center',
  },

  compactStatValue: {
    fontSize: 18,
    fontWeight: '700',
  },

  compactTooltipSubtext: {
    fontSize: 11,
    color: theme.colors.secondaryText,
    marginTop: 6,
    textAlign: 'center',
  },

  // Period details tooltip for aggregated views (1M+) - full details at fingertip
  periodTooltip: {
    position: 'absolute',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    minWidth: 240,
    maxWidth: 280,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
    borderWidth: 1,
    borderColor: theme.colors.separator,
  },

  periodTooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },

  periodTooltipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.systemBlue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  periodTooltipDate: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },

  periodTooltipStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  periodStatItem: {
    alignItems: 'center',
    flex: 1,
  },

  periodStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 4,
  },

  periodStatLabel: {
    fontSize: 10,
    color: theme.colors.secondaryText,
    marginTop: 2,
    textTransform: 'uppercase',
  },

  periodSourcesContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.separator,
    gap: 10,
  },

  periodSourceSection: {
    gap: 6,
  },

  periodSourceLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  periodSourceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  periodSourceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: theme.colors.systemGray6,
    borderWidth: 1,
  },

  periodSourceTagText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500',
  },

  tooltipHeader: {
    marginBottom: 12,
    alignItems: 'center',
  },

  tooltipDate: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },

  tooltipAggregation: {
    fontSize: 11,
    color: theme.colors.secondaryText,
    fontStyle: 'italic',
  },

  tooltipSection: {
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },

  levelsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  levelItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  levelPeriod: {
    fontSize: 11,
    color: theme.colors.secondaryText,
    marginBottom: 2,
    textAlign: 'center',
  },

  levelValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },

  sourcesContainer: {
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 8,
    padding: 8,
  },

  sourcesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },

  sourcesText: {
    fontSize: 11,
    color: theme.colors.secondaryText,
    lineHeight: 14,
  },

  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.separator,
  },

  summaryItem: {
    alignItems: 'center',
  },

  summaryLabel: {
    fontSize: 11,
    color: theme.colors.secondaryText,
    marginBottom: 2,
  },

  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },

  touchIndicator: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.systemBlue,
    zIndex: 101,
    shadowColor: theme.colors.systemBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 21,
  },



  touchInstruction: {
    marginHorizontal: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 0,
  },

  touchInstructionText: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 16,
  },

  noDataContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 12,
    width: '100%',
  },

  noDataText: {
    fontSize: 16,
    color: theme.colors.secondaryText,
  },

  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 24,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  legendText: {
    fontSize: 13,
    color: theme.colors.secondaryText,
  },

  chartExplanation: {
    marginHorizontal: 24,
    marginBottom: 8,
    alignItems: 'center',
  },

  chartExplanationText: {
    fontSize: 13,
    color: theme.colors.secondaryText,
    fontWeight: '500',
  },

  dataAvailabilityText: {
    fontSize: 12,
    color: theme.colors.tertiaryText || theme.colors.secondaryText,
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Aggregation Explanation Styles
  aggregationExplanation: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    backgroundColor: theme.colors.systemBlue + '10',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.systemBlue + '20',
  },

  aggregationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  aggregationIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  aggregationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },

  aggregationDescription: {
    fontSize: 14,
    color: theme.colors.secondaryText,
    lineHeight: 20,
  },

  loadingContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    marginHorizontal: 24,
    marginVertical: 16,
    padding: 48,
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: theme.colors.secondaryText,
    marginTop: 16,
  },

  emptyContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    marginHorizontal: 24,
    marginVertical: 16,
    padding: 48,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },

  emptyDescription: {
    fontSize: 15,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
  },
});
