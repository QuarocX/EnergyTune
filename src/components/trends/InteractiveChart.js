import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

export const InteractiveChart = ({ 
  data, 
  chartType, 
  selectedDataPoint, 
  onDataPointSelect, 
  loading,
  theme
}) => {
  const styles = getStyles(theme);
  const chartWidth = screenWidth - 48; // 24px margin on each side
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false });
  const [selectedIndex, setSelectedIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available for the selected period</Text>
      </View>
    );
  }

  // Prepare chart data based on selected type
  const prepareChartData = () => {
    const labels = data.map(item => {
      const date = new Date(item.date);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      return `${day}/${month}`;
    });

    const datasets = [];

    if (chartType === 'energy' || chartType === 'both') {
      datasets.push({
        data: data.map(item => item.energy || 0),
        color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`, // Green for energy
        strokeWidth: 3,
      });
    }

    if (chartType === 'stress' || chartType === 'both') {
      datasets.push({
        data: data.map(item => item.stress || 0),
        color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`, // Red for stress  
        strokeWidth: 3,
      });
    }

    return {
      labels: labels.length > 14 ? labels.filter((_, index) => index % 2 === 0) : labels,
      datasets,
    };
  };

  const chartData = prepareChartData();

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: theme.colors.cardBackground,
    backgroundGradientTo: theme.colors.cardBackground,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(${theme.colors.labelRGB || '0, 0, 0'}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${theme.colors.secondaryLabelRGB || '128, 128, 128'}, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '7',
      strokeWidth: '3',
      stroke: theme.colors.cardBackground,
    },
    propsForVerticalLabels: {
      fontSize: 12,
    },
    propsForHorizontalLabels: {
      fontSize: 12,
    },
    fillShadowGradient: 'transparent',
    fillShadowGradientOpacity: 0,
  };

  // Calculate data point position based on touch with improved hit area
  const getDataPointFromTouch = (x) => {
    const chartStartX = 50; // Approximate left padding
    const chartEndX = chartWidth - 50; // Approximate right padding
    const chartDataWidth = chartEndX - chartStartX;
    
    if (x < chartStartX || x > chartEndX) return null;
    
    const relativeX = x - chartStartX;
    const exactIndex = (relativeX / chartDataWidth) * (data.length - 1);
    
    // Find the closest data point within a reasonable hit area
    const hitRadius = 30; // Increased hit area for better touch response on larger chart
    const pixelsPerPoint = chartDataWidth / (data.length - 1);
    const maxIndexDistance = hitRadius / pixelsPerPoint;
    
    let closestIndex = Math.round(exactIndex);
    const indexDistance = Math.abs(exactIndex - closestIndex);
    
    // Only select if within hit area
    if (indexDistance <= maxIndexDistance && closestIndex >= 0 && closestIndex < data.length) {
      return { index: closestIndex, data: data[closestIndex] };
    }
    
    return null;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false, // Don't allow other gestures to interrupt
    
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const dataPoint = getDataPointFromTouch(locationX);
      
      if (dataPoint) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedIndex(dataPoint.index);
        setTooltipPos({
          x: locationX,
          y: Math.max(10, locationY - 80), // Better vertical positioning
          visible: true,
        });
        onDataPointSelect(dataPoint.data);
      }
    },
    
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const dataPoint = getDataPointFromTouch(locationX);
      
      if (dataPoint && dataPoint.index !== selectedIndex) {
        // Only trigger haptic feedback when moving to a new point
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedIndex(dataPoint.index);
        setTooltipPos({
          x: locationX,
          y: Math.max(10, locationY - 80),
          visible: true,
        });
        onDataPointSelect(dataPoint.data);
      } else if (dataPoint) {
        // Update tooltip position even for the same point
        setTooltipPos({
          x: locationX,
          y: Math.max(10, locationY - 80),
          visible: true,
        });
      }
    },
    
    onPanResponderRelease: () => {
      // Keep the selection visible for longer
      setTimeout(() => {
        setTooltipPos(prev => ({ ...prev, visible: false }));
      }, 3000);
    },
  });

  const renderVerticalIndicator = () => {
    if (!tooltipPos.visible || selectedIndex === null) return null;
    
    // Calculate precise indicator position based on the chart layout
    const chartStartX = 50; // Approximate left padding
    const chartEndX = chartWidth - 50; // Approximate right padding
    const chartDataWidth = chartEndX - chartStartX;
    const indicatorX = chartStartX + (selectedIndex / (data.length - 1)) * chartDataWidth;
    
    return (
      <View 
        style={[
          styles.verticalIndicator,
          {
            left: indicatorX - 1, // Center the 2px wide line
            top: 15, // Start slightly below the top
            height: 290, // Cover the expanded chart area (320 - 30 for padding)
          }
        ]}
      />
    );
  };

  const renderTooltip = () => {
    if (!tooltipPos.visible || selectedIndex === null) return null;
    
    const dataPoint = data[selectedIndex];
    if (!dataPoint) return null;

    // Safely ensure sources are arrays
    const energySources = Array.isArray(dataPoint.energySources) 
      ? dataPoint.energySources 
      : (dataPoint.energySources && typeof dataPoint.energySources === 'string')
        ? dataPoint.energySources.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [];
    
    const stressSources = Array.isArray(dataPoint.stressSources)
      ? dataPoint.stressSources
      : (dataPoint.stressSources && typeof dataPoint.stressSources === 'string')
        ? dataPoint.stressSources.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [];

    return (
      <View 
        style={[
          styles.tooltip,
          {
            left: Math.max(5, Math.min(tooltipPos.x - 75, chartWidth - 155)),
            top: tooltipPos.y,
          }
        ]}
      >
        <Text style={styles.tooltipDate}>
          {new Date(dataPoint.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </Text>
        
        {dataPoint.energy && (chartType === 'energy' || chartType === 'both') && (
          <View style={styles.tooltipSection}>
            <Text style={styles.tooltipValue}>
              Energy: {dataPoint.energy.toFixed(1)}
            </Text>
            {energySources.length > 0 && (
              <Text style={styles.tooltipSources}>
                {energySources.slice(0, 2).join(', ')}
                {energySources.length > 2 ? '...' : ''}
              </Text>
            )}
          </View>
        )}
        
        {dataPoint.stress && (chartType === 'stress' || chartType === 'both') && (
          <View style={styles.tooltipSection}>
            <Text style={styles.tooltipValue}>
              Stress: {dataPoint.stress.toFixed(1)}
            </Text>
            {stressSources.length > 0 && (
              <Text style={styles.tooltipSources}>
                {stressSources.slice(0, 2).join(', ')}
                {stressSources.length > 2 ? '...' : ''}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>
          {chartType === 'both' ? 'Energy & Stress Trends' :
           chartType === 'energy' ? 'Energy Trends' : 'Stress Trends'}
        </Text>
        <Text style={styles.chartSubtitle}>Touch and drag to explore data points • Tap to see details</Text>
      </View>

      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={theme.colors.systemBlue} />
        </View>
      ) : null}

      <View style={styles.chartContainer} {...panResponder.panHandlers}>
        <LineChart
          data={chartData}
          width={chartWidth}
          height={320}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={true}
          withShadow={false}
          segments={4}
        />
        {renderVerticalIndicator()}
        {renderTooltip()}
      </View>

      {/* Legend */}
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
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginVertical: 16,
  },

  chartHeader: {
    marginBottom: 16,
  },

  chartTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },

  chartSubtitle: {
    fontSize: 12,
    color: theme.colors.secondaryText,
  },

  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    paddingVertical: 16,
  },

  chart: {
    borderRadius: 12,
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    zIndex: 10,
  },

  tooltip: {
    position: 'absolute',
    backgroundColor: theme.colors.text,
    borderRadius: 8,
    padding: 8,
    minWidth: 150,
    maxWidth: 200,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  tooltipDate: {
    fontSize: 12,
    color: theme.colors.background,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },

  tooltipSection: {
    marginBottom: 4,
  },

  tooltipValue: {
    fontSize: 12,
    color: theme.colors.background,
    textAlign: 'center',
    fontWeight: '600',
  },

  tooltipSources: {
    fontSize: 10,
    color: theme.colors.background,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
  },

  verticalIndicator: {
    position: 'absolute',
    width: 2,
    backgroundColor: theme.colors.systemBlue,
    borderRadius: 1,
    opacity: 0.9,
    zIndex: 15,
    shadowColor: theme.colors.systemBlue,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },

  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
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
    marginRight: 4,
  },

  legendText: {
    fontSize: 12,
    color: theme.colors.secondaryText,
  },

  emptyContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    padding: 32,
    marginVertical: 16,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 17,
    color: theme.colors.secondaryText,
    textAlign: 'center',
  },
});
