import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

export const EnhancedInteractiveChart = ({ 
  data = [], 
  chartType = 'both', 
  selectedDataPoint, 
  onDataPointSelect, 
  loading = false,
  theme,
  aggregationType = 'none',
  showAnimation = true,
  enableInteraction = true,
  timePeriod = 'all', // 'all', 'morning', 'afternoon', 'evening'
  onTimePeriodChange,
}) => {
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false });
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [chartReady, setChartReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const styles = getStyles(theme);
  const chartWidth = screenWidth - 48;

  // Time period options
  const timePeriodOptions = [
    { key: 'all', label: 'All', icon: '🌅🌞🌙' },
    { key: 'morning', label: 'AM', icon: '🌅' },
    { key: 'afternoon', label: 'PM', icon: '☀️' },
    { key: 'evening', label: 'EVE', icon: '🌙' },
  ];

  // Enhanced chart configuration with smart rotation
  const chartConfig = useMemo(() => ({
    backgroundColor: 'transparent',
    backgroundGradientFrom: theme.colors.cardBackground,
    backgroundGradientTo: theme.colors.cardBackground,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(${theme.colors.labelRGB || '0, 0, 0'}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${theme.colors.secondaryLabelRGB || '128, 128, 128'}, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: data.length > 50 ? '0' : '5', // Hide dots for large datasets
      strokeWidth: '2',
      stroke: theme.colors.cardBackground,
    },
    propsForVerticalLabels: { fontSize: 11 },
    propsForHorizontalLabels: { 
      fontSize: (() => {
        // Optimized font size for compact labels
        const { isNonAggregated, filteredData } = chartData;
        return (isNonAggregated && filteredData && filteredData.length <= 14) ? 9 : 10;
      })(),
      textAlign: 'center',
    },

    fillShadowGradient: 'transparent',
    fillShadowGradientOpacity: 0,
    segments: Math.min(5, Math.max(3, Math.ceil(data.length / 15))),
  }), [theme, data.length, chartData]);

  // Filter data by time period
  const filterDataByTimePeriod = useCallback((rawData, selectedTimePeriod) => {
    return rawData.map(item => {
      let energy = null;
      let stress = null;
      const energyLevels = item.energyLevels || {};
      const stressLevels = item.stressLevels || {};

      if (selectedTimePeriod === 'all') {
        // Use existing averaged values or calculate from individual periods
        if (item.energy !== null && item.energy !== undefined) {
          energy = item.energy;
        } else {
          const energyValues = Object.values(energyLevels).filter(val => val !== null && val !== undefined);
          energy = energyValues.length > 0 
            ? energyValues.reduce((sum, val) => sum + val, 0) / energyValues.length 
            : null;
        }

        if (item.stress !== null && item.stress !== undefined) {
          stress = item.stress;
        } else {
          const stressValues = Object.values(stressLevels).filter(val => val !== null && val !== undefined);
          stress = stressValues.length > 0 
            ? stressValues.reduce((sum, val) => sum + val, 0) / stressValues.length 
            : null;
        }
      } else {
        // Use specific time period values
        energy = energyLevels[selectedTimePeriod] !== null && energyLevels[selectedTimePeriod] !== undefined 
          ? energyLevels[selectedTimePeriod] 
          : null;
        stress = stressLevels[selectedTimePeriod] !== null && stressLevels[selectedTimePeriod] !== undefined 
          ? stressLevels[selectedTimePeriod] 
          : null;
      }

      return {
        ...item,
        energy,
        stress,
        energyLevels,
        stressLevels,
      };
    });
  }, []);

  // Enhanced chart data preparation with detailed date labels
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Apply time period filtering
    const filteredData = filterDataByTimePeriod(data, timePeriod);
    const isNonAggregated = aggregationType === 'none';

    // Simplified labels for chart (empty for custom overlay)
    let labels;
    if (isNonAggregated && filteredData.length <= 14) {
      // Use empty labels, we'll overlay custom ones
      labels = filteredData.map(() => '');
    } else {
      // Use existing smart sampling for aggregated or dense data
      const maxLabels = screenWidth < 400 ? 5 : 7;
      const labelStep = Math.max(1, Math.ceil(filteredData.length / maxLabels));
      
      labels = filteredData.map((item, index) => {
        if (index % labelStep !== 0) return '';
        
        const date = new Date(item.date);
        
        // Format based on aggregation type and data density
        switch (aggregationType) {
          case 'weekly':
            return `W${Math.ceil(date.getDate() / 7)}`;
          case 'monthly':
            return date.toLocaleDateString('en-US', { month: 'short' });
          default:
            if (filteredData.length <= 7) {
              return date.toLocaleDateString('en-US', { weekday: 'short' });
            } else if (filteredData.length <= 31) {
              return `${date.getDate()}/${date.getMonth() + 1}`;
            } else {
              return date.getDate().toString();
            }
        }
      });
    }

    const datasets = [];

    // Energy dataset
    if (chartType === 'energy' || chartType === 'both') {
      datasets.push({
        data: filteredData.map(item => item.energy || 0),
        color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
        strokeWidth: filteredData.length > 50 ? 2 : 3,
        withDots: filteredData.length <= 50,
      });
    }

    // Stress dataset
    if (chartType === 'stress' || chartType === 'both') {
      datasets.push({
        data: filteredData.map(item => item.stress || 0),
        color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`,
        strokeWidth: filteredData.length > 50 ? 2 : 3,
        withDots: filteredData.length <= 50,
      });
    }

    return { labels, datasets, filteredData, isNonAggregated };
  }, [data, chartType, aggregationType, screenWidth, timePeriod, filterDataByTimePeriod]);

  // Enhanced touch handling with precise hit detection
  const getChartDimensions = useCallback(() => {
    const leftPadding = 50;
    const rightPadding = 44;
    
    return {
      leftPadding,
      rightPadding,
      chartStartX: leftPadding,
      chartEndX: chartWidth - rightPadding,
      get chartDataWidth() {
        return this.chartEndX - this.chartStartX;
      }
    };
  }, [chartWidth]);

  const getDataPointFromTouch = useCallback((x) => {
    const { chartStartX, chartEndX, chartDataWidth } = getChartDimensions();
    const { filteredData } = chartData;
    
    if (x < chartStartX || x > chartEndX || !filteredData || filteredData.length === 0) return null;
    
    const relativeX = x - chartStartX;
    const exactIndex = (relativeX / chartDataWidth) * (filteredData.length - 1);
    
    // More precise hit threshold for better responsiveness
    const baseThreshold = 18; // Reduced for better precision
    const densityFactor = Math.max(0.6, Math.min(1.5, 40 / filteredData.length));
    const hitThreshold = baseThreshold * densityFactor;
    
    const pixelsPerPoint = chartDataWidth / Math.max(1, filteredData.length - 1);
    const maxDistance = hitThreshold / pixelsPerPoint;
    
    const closestIndex = Math.round(exactIndex);
    const distance = Math.abs(exactIndex - closestIndex);
    
    if (distance <= maxDistance && closestIndex >= 0 && closestIndex < filteredData.length) {
      // Calculate precise X position for the data point
      const preciseX = chartStartX + (closestIndex / Math.max(1, filteredData.length - 1)) * chartDataWidth;
      
      return { 
        index: closestIndex, 
        data: filteredData[closestIndex],
        preciseX: preciseX // Include precise position
      };
    }
    
    return null;
  }, [chartData, getChartDimensions]);

  // Optimized pan responder with debouncing
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => enableInteraction,
    onMoveShouldSetPanResponder: () => enableInteraction,
    onPanResponderTerminationRequest: () => false,
    
    onPanResponderGrant: (evt) => {
      if (!enableInteraction) return;
      
      const { locationX, locationY } = evt.nativeEvent;
      const dataPoint = getDataPointFromTouch(locationX);
      
      if (dataPoint) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedIndex(dataPoint.index);
        setTooltipPos({
          x: dataPoint.preciseX || locationX, // Use precise position if available
          y: Math.max(10, locationY - 80),
          visible: true,
        });
        onDataPointSelect?.(dataPoint.data);
      }
    },
    
    onPanResponderMove: (evt) => {
      if (!enableInteraction) return;
      
      const { locationX, locationY } = evt.nativeEvent;
      const dataPoint = getDataPointFromTouch(locationX);
      
      if (dataPoint && dataPoint.index !== selectedIndex) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedIndex(dataPoint.index);
        setTooltipPos({
          x: dataPoint.preciseX || locationX, // Use precise position if available
          y: Math.max(10, locationY - 80),
          visible: true,
        });
        onDataPointSelect?.(dataPoint.data);
      } else if (dataPoint) {
        setTooltipPos({
          x: dataPoint.preciseX || locationX, // Use precise position if available
          y: Math.max(10, locationY - 80),
          visible: true,
        });
      } else {
        setTooltipPos(prev => ({ ...prev, visible: false }));
      }
    },
    
    onPanResponderRelease: () => {
      setTimeout(() => {
        setTooltipPos(prev => ({ ...prev, visible: false }));
      }, 2500);
    },
  }), [enableInteraction, getDataPointFromTouch, selectedIndex, onDataPointSelect]);

  // Chart ready animation
  const onChartLoad = useCallback(() => {
    if (!chartReady && showAnimation) {
      setChartReady(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [chartReady, showAnimation, fadeAnim, scaleAnim]);

  // Vertical indicator for selected data point
  const renderVerticalIndicator = useCallback(() => {
    if (!tooltipPos.visible || selectedIndex === null || !enableInteraction) return null;
    
    const { chartStartX, chartDataWidth } = getChartDimensions();
    const { filteredData } = chartData;
    
    if (!filteredData || filteredData.length === 0) return null;
    
    const indicatorX = chartStartX + (selectedIndex / (filteredData.length - 1)) * chartDataWidth;
    
    return (
      <View 
        style={[
          styles.verticalIndicator,
          {
            left: indicatorX - 1,
            top: 15,
            height: 280,
          }
        ]}
      />
    );
  }, [tooltipPos.visible, selectedIndex, enableInteraction, getChartDimensions, chartData, styles]);

  // Enhanced tooltip with better formatting
  const renderTooltip = useCallback(() => {
    const { filteredData } = chartData;
    
    if (!tooltipPos.visible || selectedIndex === null || !filteredData || !filteredData[selectedIndex]) return null;
    
    const dataPoint = filteredData[selectedIndex];
    
    // Smart source processing
    const processSource = (source) => {
      if (!source) return [];
      if (Array.isArray(source)) return source;
      return source.split(/[,;.]/).map(s => s.trim()).filter(s => s.length > 0);
    };

    const energySources = processSource(dataPoint.energySources);
    const stressSources = processSource(dataPoint.stressSources);

    const tooltipWidth = 160;
    const leftPosition = Math.max(5, Math.min(tooltipPos.x - tooltipWidth / 2, chartWidth - tooltipWidth - 5));

    return (
      <Animated.View 
        style={[
          styles.tooltip,
          {
            left: leftPosition,
            top: tooltipPos.y,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <Text style={styles.tooltipDate}>
          {new Date(dataPoint.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            ...(aggregationType === 'weekly' && { week: 'numeric' }),
            ...(aggregationType === 'monthly' && { year: 'numeric' }),
          })}
        </Text>
        
        {dataPoint.energy && (chartType === 'energy' || chartType === 'both') && (
          <View style={styles.tooltipSection}>
            <View style={styles.tooltipRow}>
              <View style={[styles.tooltipDot, { backgroundColor: theme.colors.energy }]} />
              <Text style={styles.tooltipValue}>
                Energy: {dataPoint.energy.toFixed(1)}/10
              </Text>
            </View>
            {energySources.length > 0 && (
              <Text style={styles.tooltipSources} numberOfLines={2}>
                {energySources.slice(0, 3).join(', ')}
                {energySources.length > 3 ? '...' : ''}
              </Text>
            )}
          </View>
        )}
        
        {dataPoint.stress && (chartType === 'stress' || chartType === 'both') && (
          <View style={styles.tooltipSection}>
            <View style={styles.tooltipRow}>
              <View style={[styles.tooltipDot, { backgroundColor: theme.colors.stress }]} />
              <Text style={styles.tooltipValue}>
                Stress: {dataPoint.stress.toFixed(1)}/10
              </Text>
            </View>
            {stressSources.length > 0 && (
              <Text style={styles.tooltipSources} numberOfLines={2}>
                {stressSources.slice(0, 3).join(', ')}
                {stressSources.length > 3 ? '...' : ''}
              </Text>
            )}
          </View>
        )}

        {/* Additional context for aggregated data */}
        {dataPoint.entriesCount > 1 && (
          <Text style={styles.tooltipAggregation}>
            📊 {dataPoint.entriesCount} entries averaged
          </Text>
        )}

        {/* Time period context */}
        {timePeriod !== 'all' && (
          <Text style={styles.tooltipTimePeriod}>
            {timePeriodOptions.find(opt => opt.key === timePeriod)?.icon} {timePeriod} only
          </Text>
        )}
      </Animated.View>
    );
  }, [tooltipPos, selectedIndex, chartData, chartType, theme, aggregationType, chartWidth, fadeAnim, scaleAnim, styles, timePeriod, timePeriodOptions]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.systemBlue} />
        <Text style={styles.loadingText}>Loading chart data...</Text>
      </View>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>No Data Available</Text>
        <Text style={styles.emptyText}>
          Start tracking your energy and stress to see trends here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Chart Header */}
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>
          {chartType === 'both' ? '⚡ Energy & 😰 Stress Trends' :
           chartType === 'energy' ? '⚡ Energy Trends' : '😰 Stress Trends'}
          {timePeriod !== 'all' && (
            <Text style={styles.chartTitlePeriod}>
              {' '}• {timePeriodOptions.find(opt => opt.key === timePeriod)?.icon}
            </Text>
          )}
        </Text>
        <Text style={styles.chartSubtitle}>
          {timePeriod === 'all'
            ? (enableInteraction 
                ? 'Touch and drag to explore • Hold to see details' 
                : `${data.length} data points`)
            : `Showing ${timePeriod} values • ${enableInteraction ? 'Interactive' : `${chartData.filteredData?.length || 0} points`}`
          }
        </Text>
      </View>

      {/* Time Period Selector */}
      {onTimePeriodChange && (
        <View style={styles.timePeriodSelector}>
          <View style={styles.timePeriodButtons}>
            {timePeriodOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.timePeriodButton,
                  timePeriod === option.key && styles.activeTimePeriodButton,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onTimePeriodChange(option.key);
                }}
                disabled={loading}
              >
                <Text style={styles.timePeriodIcon}>{option.icon}</Text>
                <Text style={[
                  styles.timePeriodText,
                  timePeriod === option.key && styles.activeTimePeriodText,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Chart Container */}
      <Animated.View 
        style={[
          styles.chartContainer,
          showAnimation && {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
        {...(enableInteraction ? panResponder.panHandlers : {})}
      >
        <LineChart
          data={{ labels: chartData.labels, datasets: chartData.datasets }}
          width={chartWidth}
          height={300}
          chartConfig={chartConfig}
          bezier={(chartData.filteredData?.length || 0) <= 31} // Only bezier for smaller datasets
          style={styles.chart}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={(chartData.filteredData?.length || 0) <= 50}
          withShadow={false}
          segments={chartConfig.segments}
          onDataPointClick={(dataPoint) => {
            if (enableInteraction) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              // Handle direct point click if needed
            }
          }}
          onLayout={onChartLoad}
        />
        
        {/* Custom Two-Row Date Labels Overlay */}
        {aggregationType === 'none' && chartData.filteredData && chartData.filteredData.length <= 14 && (
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
            {chartData.filteredData.map((item, index) => {
              const date = new Date(item.date);
              const day = date.getDate();
              const month = date.toLocaleDateString('en-US', { month: 'short' });
              const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
              
              // Smart sampling logic
              let shouldShow = false;
              if (chartData.filteredData.length <= 7) {
                shouldShow = true;
              } else if (chartData.filteredData.length <= 10) {
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
        {renderTooltip()}
      </Animated.View>

      {/* Chart Legend */}
      <View style={styles.legend}>
        {(chartType === 'energy' || chartType === 'both') && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.energy }]} />
            <Text style={styles.legendText}>Energy</Text>
          </View>
        )}
        {(chartType === 'stress' || chartType === 'both') && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.stress }]} />
            <Text style={styles.legendText}>Stress</Text>
          </View>
        )}
      </View>

      {/* Performance Info */}
      {(chartData.filteredData?.length || 0) > 100 && (
        <View style={styles.performanceInfo}>
          <Text style={styles.performanceText}>
            🚀 Optimized rendering for {chartData.filteredData?.length || 0} data points
          </Text>
        </View>
      )}
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  chartHeader: {
    padding: 20,
    paddingBottom: 12,
  },

  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },

  chartSubtitle: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    lineHeight: 16,
  },

  chartTitlePeriod: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.systemBlue,
  },

  // Time Period Selector Styles (unified design)
  timePeriodSelector: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
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

  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
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
    zIndex: 15,
    shadowColor: theme.colors.systemBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },

  tooltip: {
    position: 'absolute',
    backgroundColor: theme.colors.text,
    borderRadius: 12,
    padding: 12,
    minWidth: 150,
    maxWidth: 200,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  tooltipDate: {
    fontSize: 12,
    color: theme.colors.background,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },

  tooltipSection: {
    marginBottom: 6,
  },

  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },

  tooltipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  tooltipValue: {
    fontSize: 12,
    color: theme.colors.background,
    fontWeight: '600',
    flex: 1,
  },

  tooltipSources: {
    fontSize: 10,
    color: theme.colors.background,
    opacity: 0.8,
    marginLeft: 12,
    lineHeight: 12,
    fontStyle: 'italic',
  },

  tooltipAggregation: {
    fontSize: 9,
    color: theme.colors.background,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },

  tooltipTimePeriod: {
    fontSize: 9,
    color: theme.colors.background,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
  },

  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    fontWeight: '500',
  },

  performanceInfo: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    alignItems: 'center',
  },

  performanceText: {
    fontSize: 10,
    color: theme.colors.secondaryText,
    fontStyle: 'italic',
  },

  loadingContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    marginVertical: 8,
  },

  loadingText: {
    fontSize: 14,
    color: theme.colors.secondaryText,
    marginTop: 12,
  },

  emptyContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    marginVertical: 8,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
});
