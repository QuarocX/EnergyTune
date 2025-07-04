// EnergyTune - Dashboard Screen
// Professional overview screen with Apple-style design excellence

import React, { useEffect, useState } from "react";
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
import { format } from "date-fns";
import * as Haptics from "expo-haptics";

import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../../config/theme";
import { useEntry } from "../hooks/useEntry";
import { useAnalytics } from "../hooks/useAnalytics";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { TrendChart } from "../components/charts/TrendChart";
import {
  getTodayString,
  getYesterdayString,
  formatDate,
  calculateAverageEnergy,
  calculateAverageStress,
} from "../utils/helpers";

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  navigation,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const {
    entry: todayEntry,
    loadEntry,
    isLoading,
  } = useEntry(getTodayString());
  const {
    trendData,
    insights,
    getAverages,
    loadData,
    isLoading: analyticsLoading,
  } = useAnalytics("7d");

  const averages = getAverages();
  const todayExists = !!todayEntry;
  const todayEnergy = todayEntry ? calculateAverageEnergy(todayEntry) : 0;
  const todayStress = todayEntry ? calculateAverageStress(todayEntry) : 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    await Promise.all([loadEntry(), loadData()]);

    setRefreshing(false);
  };

  const handleQuickEntry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("Entry", { date: getTodayString() });
  };

  const handleViewTrends = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Trends");
  };

  const handleViewYesterday = () => {
    navigation.navigate("Entry", { date: getYesterdayString() });
  };

  useEffect(() => {
    // Auto-refresh when screen comes into focus
    const unsubscribe = navigation.addListener("focus", () => {
      loadEntry();
      loadData();
    });

    return unsubscribe;
  }, [navigation, loadEntry, loadData]);

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
          <Text style={styles.title}>EnergyTune</Text>
          <Text style={styles.subtitle}>{formatDate(new Date(), "full")}</Text>
        </View>

        {/* Today's Entry Status */}
        <Card style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <Text style={styles.cardTitle}>Today's Energy</Text>
            {todayExists && (
              <TouchableOpacity onPress={handleQuickEntry}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {todayExists ? (
            <View style={styles.todayStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{todayEnergy.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Energy</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.stress }]}>
                  {todayStress.toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>Stress</Text>
              </View>
            </View>
          ) : (
            <View style={styles.noEntryContainer}>
              <Text style={styles.noEntryText}>No entry for today yet</Text>
              <Button
                title="Quick Entry"
                onPress={handleQuickEntry}
                variant="primary"
                size="medium"
              />
            </View>
          )}
        </Card>

        {/* 7-Day Overview */}
        <Card style={styles.overviewCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>7-Day Overview</Text>
            <TouchableOpacity onPress={handleViewTrends}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {averages.energy > 0 ? (
            <>
              <View style={styles.averageStats}>
                <View style={styles.averageItem}>
                  <Text style={styles.averageValue}>
                    {averages.energy.toFixed(1)}
                  </Text>
                  <Text style={styles.averageLabel}>Avg Energy</Text>
                </View>
                <View style={styles.averageItem}>
                  <Text style={[styles.averageValue, { color: colors.stress }]}>
                    {averages.stress.toFixed(1)}
                  </Text>
                  <Text style={styles.averageLabel}>Avg Stress</Text>
                </View>
              </View>

              <TrendChart
                data={trendData}
                metric="both"
                timeRange="7d"
                height={180}
                showLabels={false}
              />
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>
                Start tracking to see your trends
              </Text>
            </View>
          )}
        </Card>

        {/* Quick Insights */}
        {insights.length > 0 && (
          <Card style={styles.insightsCard}>
            <Text style={styles.cardTitle}>Quick Insights</Text>
            {insights.slice(0, 2).map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>
                  {insight.description}
                </Text>
              </View>
            ))}
            {insights.length > 2 && (
              <TouchableOpacity onPress={handleViewTrends}>
                <Text style={styles.moreInsightsLink}>
                  View {insights.length - 2} more insights
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        )}

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <Button
              title="Today's Entry"
              onPress={handleQuickEntry}
              variant="primary"
              size="medium"
              fullWidth
            />
            <Button
              title="Yesterday's Entry"
              onPress={handleViewYesterday}
              variant="outline"
              size="medium"
              fullWidth
            />
          </View>
        </Card>

        {/* Bottom spacing for tab bar */}
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
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  todayCard: {
    marginBottom: spacing.lg,
  },
  todayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: "600",
  },
  editLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "500",
  },
  todayStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    ...typography.h1,
    color: colors.energy,
    fontWeight: "700",
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  noEntryContainer: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  noEntryText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  overviewCard: {
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  viewAllLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "500",
  },
  averageStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.lg,
  },
  averageItem: {
    alignItems: "center",
  },
  averageValue: {
    ...typography.h2,
    color: colors.energy,
    fontWeight: "600",
  },
  averageLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  noDataContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  noDataText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  insightsCard: {
    marginBottom: spacing.lg,
  },
  insightItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  insightTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  insightDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  moreInsightsLink: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "500",
    textAlign: "center",
  },
  actionsCard: {
    marginBottom: spacing.lg,
  },
  actionButtons: {
    gap: spacing.md,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});

export default DashboardScreen;
