// EnergyTune - Trend Chart Component
// Professional Victory Native chart with Apple-style design

import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryTheme,
  VictoryScatter,
  VictoryTooltip,
} from "victory-native";
import { format, parseISO } from "date-fns";
import { colors, spacing, typography } from "../../../config/theme";
import { TrendChartProps } from "../../types";

const { width: screenWidth } = Dimensions.get("window");
const chartWidth = screenWidth - spacing.lg * 2;

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  metric,
  timeRange,
  height = 200,
  showLabels = true,
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  // Prepare data for chart
  const chartData = data.map((item, index) => ({
    x: index,
    y: metric === "energy" ? item.energy : item.stress,
    date: item.date,
    label: `${metric === "energy" ? item.energy : item.stress}/10`,
  }));

  const energyData = data.map((item, index) => ({
    x: index,
    y: item.energy,
    date: item.date,
  }));

  const stressData = data.map((item, index) => ({
    x: index,
    y: item.stress,
    date: item.date,
  }));

  // Format date labels based on time range
  const formatDateLabel = (index: number): string => {
    if (!data[index]) return "";
    const date = parseISO(data[index].date);

    switch (timeRange) {
      case "7d":
        return format(date, "EEE"); // Mon, Tue, etc.
      case "30d":
        return format(date, "M/d"); // 1/15, 2/1, etc.
      case "90d":
        return format(date, "MMM"); // Jan, Feb, etc.
      default:
        return format(date, "M/d");
    }
  };

  const chartTheme = {
    ...VictoryTheme.material,
    axis: {
      style: {
        axis: { stroke: colors.border },
        axisLabel: {
          fontSize: 12,
          fill: colors.textSecondary,
          fontFamily: "System",
        },
        grid: {
          stroke: colors.border,
          strokeOpacity: 0.3,
        },
        tickLabels: {
          fontSize: 11,
          fill: colors.textSecondary,
          fontFamily: "System",
        },
      },
    },
  };

  if (metric === "both") {
    return (
      <View style={styles.container}>
        {showLabels && (
          <View style={styles.header}>
            <Text style={styles.title}>Energy & Stress Trends</Text>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: colors.energy }]}
                />
                <Text style={styles.legendText}>Energy</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: colors.stress }]}
                />
                <Text style={styles.legendText}>Stress</Text>
              </View>
            </View>
          </View>
        )}

        <VictoryChart
          theme={chartTheme}
          width={chartWidth}
          height={height}
          padding={{ left: 40, top: 20, right: 40, bottom: 40 }}
          domain={{ y: [0, 10] }}
        >
          <VictoryAxis
            dependentAxis
            tickCount={6}
            style={{
              grid: { stroke: colors.border, strokeOpacity: 0.3 },
            }}
          />
          <VictoryAxis
            tickFormat={(x) => formatDateLabel(x)}
            style={{
              grid: { stroke: "transparent" },
            }}
          />

          {/* Energy Line */}
          <VictoryArea
            data={energyData}
            style={{
              data: {
                fill: colors.energy,
                fillOpacity: 0.1,
                stroke: colors.energy,
                strokeWidth: 2,
              },
            }}
            animate={{
              duration: 500,
              onLoad: { duration: 300 },
            }}
          />

          {/* Stress Line */}
          <VictoryLine
            data={stressData}
            style={{
              data: {
                stroke: colors.stress,
                strokeWidth: 2,
              },
            }}
            animate={{
              duration: 500,
              onLoad: { duration: 300 },
            }}
          />

          {/* Energy Points */}
          <VictoryScatter
            data={energyData}
            size={3}
            style={{
              data: { fill: colors.energy },
            }}
          />

          {/* Stress Points */}
          <VictoryScatter
            data={stressData}
            size={3}
            style={{
              data: { fill: colors.stress },
            }}
          />
        </VictoryChart>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showLabels && (
        <View style={styles.header}>
          <Text style={styles.title}>
            {metric === "energy" ? "Energy" : "Stress"} Trend
          </Text>
        </View>
      )}

      <VictoryChart
        theme={chartTheme}
        width={chartWidth}
        height={height}
        padding={{ left: 40, top: 20, right: 40, bottom: 40 }}
        domain={{ y: [0, 10] }}
      >
        <VictoryAxis
          dependentAxis
          tickCount={6}
          style={{
            grid: { stroke: colors.border, strokeOpacity: 0.3 },
          }}
        />
        <VictoryAxis
          tickFormat={(x) => formatDateLabel(x)}
          style={{
            grid: { stroke: "transparent" },
          }}
        />

        <VictoryArea
          data={chartData}
          style={{
            data: {
              fill: metric === "energy" ? colors.energy : colors.stress,
              fillOpacity: 0.2,
              stroke: metric === "energy" ? colors.energy : colors.stress,
              strokeWidth: 3,
            },
          }}
          animate={{
            duration: 500,
            onLoad: { duration: 300 },
          }}
        />

        <VictoryScatter
          data={chartData}
          size={4}
          style={{
            data: {
              fill: metric === "energy" ? colors.energy : colors.stress,
            },
          }}
          labelComponent={<VictoryTooltip />}
        />
      </VictoryChart>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 16,
    marginVertical: spacing.md,
    alignItems: "center",
  },
  header: {
    width: "100%",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  legendText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  noDataText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});

export default TrendChart;
