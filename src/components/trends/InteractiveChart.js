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
import { theme } from '../../config/theme';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - (theme.spacing.lg * 2);

export const InteractiveChart = ({ 
  data, 
  chartType, 
  selectedDataPoint, 
  onDataPointSelect, 
  loading 
}) => {
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
        color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`, // Orange for energy
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
    backgroundGradientFrom: theme.colors.secondaryBackground,
    backgroundGradientTo: theme.colors.secondaryBackground,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(${theme.colors.labelRGB || '0, 0, 0'}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${theme.colors.secondaryLabelRGB || '128, 128, 128'}, ${opacity})`,
    style: {
      borderRadius: theme.borderRadius.lg,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: theme.colors.primaryBackground,
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

  // Calculate data point position based on touch
  const getDataPointFromTouch = (x) => {
    const chartStartX = 50; // Approximate left padding
    const chartEndX = chartWidth - 50; // Approximate right padding
    const chartDataWidth = chartEndX - chartStartX;
    
    if (x < chartStartX || x > chartEndX) return null;
    
    const relativeX = x - chartStartX;
    const dataIndex = Math.round((relativeX / chartDataWidth) * (data.length - 1));
    
    if (dataIndex >= 0 && dataIndex < data.length) {
      return { index: dataIndex, data: data[dataIndex] };
    }
    
    return null;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const dataPoint = getDataPointFromTouch(locationX);
      
      if (dataPoint) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedIndex(dataPoint.index);
        setTooltipPos({
          x: locationX,
          y: locationY - 60,
          visible: true,
        });
        onDataPointSelect(dataPoint.data);
      }
    },
    
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const dataPoint = getDataPointFromTouch(locationX);
      
      if (dataPoint) {
        setSelectedIndex(dataPoint.index);
        setTooltipPos({
          x: locationX,
          y: locationY - 60,
          visible: true,
        });
        onDataPointSelect(dataPoint.data);
      }
    },
    
    onPanResponderRelease: () => {
      // Keep the selection but hide tooltip after a delay
      setTimeout(() => {
        setTooltipPos(prev => ({ ...prev, visible: false }));
      }, 2000);
    },
  });

  const renderTooltip = () => {
    if (!tooltipPos.visible || selectedIndex === null) return null;
    
    const dataPoint = data[selectedIndex];
    if (!dataPoint) return null;

    return (
      <View 
        style={[
          styles.tooltip,
          {
            left: Math.max(10, Math.min(tooltipPos.x - 50, chartWidth - 110)),
            top: Math.max(10, tooltipPos.y),
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
          <Text style={styles.tooltipValue}>
            Energy: {dataPoint.energy.toFixed(1)}
          </Text>
        )}
        {dataPoint.stress && (chartType === 'stress' || chartType === 'both') && (
          <Text style={styles.tooltipValue}>
            Stress: {dataPoint.stress.toFixed(1)}
          </Text>
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
        <Text style={styles.chartSubtitle}>Tap and drag to explore data points</Text>
      </View>

      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={theme.colors.energy} />
        </View>
      ) : null}

      <View style={styles.chartContainer} {...panResponder.panHandlers}>
        <LineChart
          data={chartData}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={true}
          withShadow={false}
          segments={4}
        />
        {renderTooltip()}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {(chartType === 'energy' || chartType === 'both') && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
            <Text style={styles.legendText}>Energy</Text>
          </View>
        )}
        {(chartType === 'stress' || chartType === 'both') && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
            <Text style={styles.legendText}>Stress</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.md,
  },

  chartHeader: {
    marginBottom: theme.spacing.md,
  },

  chartTitle: {
    fontSize: theme.typography.headline.fontSize,
    fontWeight: theme.typography.headline.fontWeight,
    color: theme.colors.label,
    marginBottom: theme.spacing.xs,
  },

  chartSubtitle: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.secondaryLabel,
  },

  chartContainer: {
    position: 'relative',
    alignItems: 'center',
  },

  chart: {
    borderRadius: theme.borderRadius.md,
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
    borderRadius: theme.borderRadius.lg,
    zIndex: 10,
  },

  tooltip: {
    position: 'absolute',
    backgroundColor: theme.colors.label,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    minWidth: 100,
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
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.primaryBackground,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },

  tooltipValue: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.primaryBackground,
    textAlign: 'center',
  },

  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    gap: theme.spacing.lg,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },

  legendText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.secondaryLabel,
  },

  emptyContainer: {
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginVertical: theme.spacing.md,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.secondaryLabel,
    textAlign: 'center',
  },
});
