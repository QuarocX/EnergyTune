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
}) => {
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false });
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [chartReady, setChartReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const styles = getStyles(theme);
  const chartWidth = screenWidth - 48;

  // Memoized chart configuration for performance
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
    propsForHorizontalLabels: { fontSize: 10 },
    fillShadowGradient: 'transparent',
    fillShadowGradientOpacity: 0,
    segments: Math.min(5, Math.max(3, Math.ceil(data.length / 15))),
  }), [theme, data.length]);

  // Optimized chart data preparation
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Smart label sampling based on screen size and data density
    const maxLabels = screenWidth < 400 ? 5 : 7;
    const labelStep = Math.max(1, Math.ceil(data.length / maxLabels));
    
    const labels = data.map((item, index) => {
      if (index % labelStep !== 0) return '';
      
      const date = new Date(item.date);
      
      // Format based on aggregation type and data density
      switch (aggregationType) {
        case 'weekly':
          return `W${Math.ceil(date.getDate() / 7)}`;
        case 'monthly':
          return date.toLocaleDateString('en-US', { month: 'short' });
        default:
          if (data.length <= 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
          } else if (data.length <= 31) {
            return `${date.getDate()}/${date.getMonth() + 1}`;
          } else {
            return date.getDate().toString();
          }
      }
    });

    const datasets = [];

    // Energy dataset
    if (chartType === 'energy' || chartType === 'both') {
      datasets.push({
        data: data.map(item => item.energy || 0),
        color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
        strokeWidth: data.length > 50 ? 2 : 3,
        withDots: data.length <= 50,
      });
    }

    // Stress dataset
    if (chartType === 'stress' || chartType === 'both') {
      datasets.push({
        data: data.map(item => item.stress || 0),
        color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`,
        strokeWidth: data.length > 50 ? 2 : 3,
        withDots: data.length <= 50,
      });
    }

    return { labels, datasets };
  }, [data, chartType, aggregationType, screenWidth]);

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
    
    if (x < chartStartX || x > chartEndX || data.length === 0) return null;
    
    const relativeX = x - chartStartX;
    const exactIndex = (relativeX / chartDataWidth) * (data.length - 1);
    
    // Adaptive hit threshold based on data density
    const baseThreshold = 25;
    const densityFactor = Math.max(0.5, Math.min(2, 50 / data.length));
    const hitThreshold = baseThreshold * densityFactor;
    
    const pixelsPerPoint = chartDataWidth / (data.length - 1);
    const maxDistance = hitThreshold / pixelsPerPoint;
    
    const closestIndex = Math.round(exactIndex);
    const distance = Math.abs(exactIndex - closestIndex);
    
    if (distance <= maxDistance && closestIndex >= 0 && closestIndex < data.length) {
      return { index: closestIndex, data: data[closestIndex] };
    }
    
    return null;
  }, [data, getChartDimensions]);

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
          x: locationX,
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
          x: locationX,
          y: Math.max(10, locationY - 80),
          visible: true,
        });
        onDataPointSelect?.(dataPoint.data);
      } else if (dataPoint) {
        setTooltipPos({
          x: locationX,
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
    const indicatorX = chartStartX + (selectedIndex / (data.length - 1)) * chartDataWidth;
    
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
  }, [tooltipPos.visible, selectedIndex, enableInteraction, getChartDimensions, data.length, styles]);

  // Enhanced tooltip with better formatting
  const renderTooltip = useCallback(() => {
    if (!tooltipPos.visible || selectedIndex === null || !data[selectedIndex]) return null;
    
    const dataPoint = data[selectedIndex];
    
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
      </Animated.View>
    );
  }, [tooltipPos, selectedIndex, data, chartType, theme, aggregationType, chartWidth, fadeAnim, scaleAnim, styles]);

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
        </Text>
        <Text style={styles.chartSubtitle}>
          {enableInteraction 
            ? 'Touch and drag to explore • Hold to see details' 
            : `${data.length} data points`}
        </Text>
      </View>

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
          data={chartData}
          width={chartWidth}
          height={300}
          chartConfig={chartConfig}
          bezier={data.length <= 31} // Only bezier for smaller datasets
          style={styles.chart}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={data.length <= 50}
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
      {data.length > 100 && (
        <View style={styles.performanceInfo}>
          <Text style={styles.performanceText}>
            🚀 Optimized rendering for {data.length} data points
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
