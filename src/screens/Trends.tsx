// EnergyTune - Trends Screen
// Professional analytics screen with Apple-style design excellence

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { colors, spacing, typography, borderRadius } from "../../config/theme";
import { TimeRange } from "../types";
import { useAnalytics } from "../hooks/useAnalytics";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { TrendChart } from "../components/charts/TrendChart";
import { formatDate, getDateLabel } from "../utils/helpers";

interface TrendsScreenProps {
  navigation: any;
}

export const TrendsScreen: React.FC<TrendsScreenProps> = ({ navigation }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("7d");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<
    "energy" | "stress" | "both"
  >("both");

  const {
    trendData,
    insights,
    getAverages,
    getTopSources,
    getPatterns,
    loadData,
    refreshData,
    isLoading,
    lastUpdated,
  } = useAnalytics(selectedTimeRange);

  const averages = getAverages(selectedTimeRange);
  const patterns = getPatterns();
  const topEnergySources = getTopSources("energy", 3);
  const topStressSources = getTopSources("stress", 3);

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refreshData();
    setRefreshing(false);
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    if (range === selectedTimeRange) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTimeRange(range);
    loadData(range);
  };

  const handleMetricChange = (metric: "energy" | "stress" | "both") => {
    if (metric === selectedMetric) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMetric(metric);
  };

  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "Data export feature coming soon. Your data will be available in CSV format.",
      [{ text: "OK" }]
    );
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      refreshData();
    });

    return unsubscribe;
  }, [navigation, refreshData]);

  const getRangeLabel = (range: TimeRange): string => {
    switch (range) {
      case "7d":
        return "Last 7 Days";
      case "30d":
        return "Last 30 Days";
      case "90d":
        return "Last 90 Days";
      default:
        return "Last 7 Days";
    }
  };

  const getInsightIcon = (type: string): string => {
    switch (type) {
      case "pattern":
        return "📊";
      case "peak":
        return "⬆️";
      case "dip":
        return "⬇️";
      case "trigger":
        return "⚠️";
      case "recommendation":
        return "💡";
      default:
        return "📈";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics & Trends</Text>
          {lastUpdated && (
            <Text style={styles.subtitle}>
              Last updated: {formatDate(new Date(lastUpdated), "short")}
            </Text>
          )}
        </View>

        {/* Time Range Selector */}
        <Card style={styles.selectorCard}>
          <Text style={styles.sectionTitle}>Time Range</Text>
          <View style={styles.timeRangeButtons}>
            {(["7d", "30d", "90d"] as TimeRange[]).map((range) => (
              <Button
                key={range}
                title={getRangeLabel(range)}
                onPress={() => handleTimeRangeChange(range)}
                variant={selectedTimeRange === range ? "primary" : "outline"}
                size="small"
              />
            ))}
          </View>
        </Card>

        {/* Metric Selector */}
        <Card style={styles.selectorCard}>
          <Text style={styles.sectionTitle}>View</Text>
          <View style={styles.metricButtons}>
            {(["both", "energy", "stress"] as const).map((metric) => (
              <Button
                key={metric}
                title={
                  metric === "both"
                    ? "Both"
                    : metric === "energy"
                    ? "Energy"
                    : "Stress"
                }
                onPress={() => handleMetricChange(metric)}
                variant={selectedMetric === metric ? "primary" : "outline"}
                size="small"
              />
            ))}
          </View>
        </Card>

        {/* Main Chart */}
        <Card style={styles.chartCard}>
          <TrendChart
            data={trendData}
            metric={selectedMetric}
            timeRange={selectedTimeRange}
            height={250}
            showLabels={true}
          />
        </Card>

        {/* Statistics Summary */}
        {averages.energy > 0 && (
          <Card style={styles.statsCard}>
            <Text style={styles.sectionTitle}>
              {getRangeLabel(selectedTimeRange)} Summary
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {averages.energy.toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>Avg Energy</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.stress }]}>
                  {averages.stress.toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>Avg Stress</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{trendData.length}</Text>
                <Text style={styles.statLabel}>Days Tracked</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {patterns.bestDay ? getDateLabel(patterns.bestDay) : "--"}
                </Text>
                <Text style={styles.statLabel}>Best Day</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Top Sources */}
        {(topEnergySources.length > 0 || topStressSources.length > 0) && (
          <Card style={styles.sourcesCard}>
            <Text style={styles.sectionTitle}>Top Sources</Text>

            {topEnergySources.length > 0 && (
              <View style={styles.sourceSection}>
                <Text style={styles.sourceTitle}>🔋 Energy Boosters</Text>
                {topEnergySources.map((source, index) => (
                  <Text key={index} style={styles.sourceItem}>
                    • {source}
                  </Text>
                ))}
              </View>
            )}

            {topStressSources.length > 0 && (
              <View style={styles.sourceSection}>
                <Text style={styles.sourceTitle}>⚡ Stress Triggers</Text>
                {topStressSources.map((source, index) => (
                  <Text key={index} style={styles.sourceItem}>
                    • {source}
                  </Text>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <Card style={styles.insightsCard}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightIcon}>
                    {getInsightIcon(insight.type)}
                  </Text>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                </View>
                <Text style={styles.insightDescription}>
                  {insight.description}
                </Text>
                {insight.actionable && (
                  <View style={styles.actionableBadge}>
                    <Text style={styles.actionableText}>Actionable</Text>
                  </View>
                )}
              </View>
            ))}
          </Card>
        )}

        {/* Export Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Data Export</Text>
          <Button
            title="Export Data (CSV)"
            onPress={handleExportData}
            variant="outline"
            size="medium"
            fullWidth
          />
        </Card>

        {/* No Data State */}
        {trendData.length === 0 && !isLoading && (
          <Card style={styles.noDataCard}>
            <Text style={styles.noDataTitle}>No Data Available</Text>
            <Text style={styles.noDataText}>
              Start tracking your energy and stress levels to see trends and
              insights.
            </Text>
            <Button
              title="Create Entry"
              onPress={() => navigation.navigate("Entry")}
              variant="primary"
              size="medium"
            />
          </Card>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  title: {
    ...typography.h1,
    color: colors.text,
    fontWeight: "700",
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  selectorCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  timeRangeButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  metricButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  chartCard: {
    marginBottom: spacing.lg,
    padding: 0,
  },
  statsCard: {
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    width: "48%",
    marginBottom: spacing.md,
  },
  statValue: {
    ...typography.h2,
    color: colors.energy,
    fontWeight: "700",
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  sourcesCard: {
    marginBottom: spacing.lg,
  },
  sourceSection: {
    marginBottom: spacing.md,
  },
  sourceTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  sourceItem: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginLeft: spacing.sm,
  },
  insightsCard: {
    marginBottom: spacing.lg,
  },
  insightItem: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  insightIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  insightTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
    flex: 1,
  },
  insightDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  actionableBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
  },
  actionableText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: "600",
  },
  actionsCard: {
    marginBottom: spacing.lg,
  },
  noDataCard: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  noDataTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  noDataText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});

export default TrendsScreen;
