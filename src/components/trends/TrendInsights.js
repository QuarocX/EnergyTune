import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';

export const TrendInsights = ({ insights, selectedPeriod, embedded = false }) => {
  const [expandedInsight, setExpandedInsight] = useState(null);

  if (!insights || Object.keys(insights).length === 0) {
    return null;
  }

  const toggleInsight = (key) => {
    setExpandedInsight(expandedInsight === key ? null : key);
  };

  const renderInsightCard = (key, insight) => {
    const getInsightIcon = (type) => {
      const icons = {
        correlation: 'analytics-outline',
        pattern: 'time-outline',
        prediction: 'trending-up-outline',
        recommendation: 'bulb-outline',
        achievement: 'trophy-outline',
        warning: 'warning-outline',
      };
      return icons[type] || 'information-circle-outline';
    };

    const getInsightColor = (type) => {
      const colors = {
        correlation: theme.colors.systemBlue || '#007AFF',
        pattern: theme.colors.systemPurple || '#AF52DE',
        prediction: theme.colors.systemGreen || '#34C759',
        recommendation: theme.colors.energy,
        achievement: theme.colors.systemGreen || '#34C759',
        warning: theme.colors.stress,
      };
      return colors[type] || theme.colors.systemGray;
    };

    const isExpanded = expandedInsight === key;

    return (
      <View key={key} style={styles.insightCard}>
        <TouchableOpacity 
          style={styles.insightHeader}
          onPress={() => toggleInsight(key)}
        >
          <View style={styles.insightTitleContainer}>
            <View style={[
              styles.insightIcon,
              { backgroundColor: getInsightColor(insight.type) }
            ]}>
              <Ionicons 
                name={getInsightIcon(insight.type)} 
                size={20} 
                color="#FFFFFF" 
              />
            </View>
            <View style={styles.insightTitleContent}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightSubtitle}>{insight.subtitle}</Text>
            </View>
          </View>
          <View style={styles.insightActions}>
            {insight.confidence && (
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  {Math.round(insight.confidence * 100)}%
                </Text>
              </View>
            )}
            <Ionicons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={theme.colors.secondaryLabel} 
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.insightContent}>
            <Text style={styles.insightDescription}>
              {insight.description}
            </Text>
            
            {insight.data && (
              <View style={styles.insightData}>
                {insight.data.map((dataPoint, index) => (
                  <View key={index} style={styles.dataPoint}>
                    <Text style={styles.dataLabel}>{dataPoint.label}</Text>
                    <Text style={styles.dataValue}>{dataPoint.value}</Text>
                  </View>
                ))}
              </View>
            )}

            {insight.actionItems && insight.actionItems.length > 0 && (
              <View style={styles.actionItems}>
                <Text style={styles.actionItemsTitle}>Suggested Actions:</Text>
                {insight.actionItems.map((action, index) => (
                  <View key={index} style={styles.actionItem}>
                    <Ionicons 
                      name="checkmark-circle-outline" 
                      size={16} 
                      color={theme.colors.systemGreen} 
                    />
                    <Text style={styles.actionText}>{action}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, embedded && styles.embeddedContainer]}>
      {!embedded && (
        <>
          <View style={styles.header}>
            <Ionicons name="analytics" size={24} color={theme.colors.label} />
            <Text style={styles.title}>Insights & Patterns</Text>
          </View>
          <Text style={styles.subtitle}>
            AI-powered analysis of your {selectedPeriod}-day trends
          </Text>
        </>
      )}

      <View style={embedded ? styles.embeddedInsightsList : styles.insightsList}>
        {Object.entries(insights).map(([key, insight]) => 
          renderInsightCard(key, insight)
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },

  title: {
    fontSize: theme.typography.headline.fontSize,
    fontWeight: theme.typography.headline.fontWeight,
    color: theme.colors.label,
    marginLeft: theme.spacing.sm,
  },

  subtitle: {
    fontSize: theme.typography.footnote.fontSize,
    color: theme.colors.secondaryLabel,
    marginBottom: theme.spacing.lg,
    lineHeight: 18,
  },

  insightsList: {
    gap: theme.spacing.sm,
  },

  embeddedInsightsList: {
    gap: theme.spacing.sm,
    marginTop: 0,
  },

  embeddedContainer: {
    backgroundColor: 'transparent',
    padding: 0,
    marginVertical: 0,
    borderRadius: 0,
  },

  insightCard: {
    backgroundColor: theme.colors.primaryBackground,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },

  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },

  insightTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },

  insightTitleContent: {
    flex: 1,
  },

  insightTitle: {
    fontSize: theme.typography.subheadline.fontSize,
    fontWeight: '600',
    color: theme.colors.label,
    marginBottom: theme.spacing.xs,
  },

  insightSubtitle: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.secondaryLabel,
  },

  insightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },

  confidenceBadge: {
    backgroundColor: theme.colors.tertiaryBackground,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },

  confidenceText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.secondaryLabel,
    fontWeight: '600',
  },

  insightContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.separator,
  },

  insightDescription: {
    fontSize: theme.typography.footnote.fontSize,
    color: theme.colors.label,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },

  insightData: {
    backgroundColor: theme.colors.tertiaryBackground,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },

  dataPoint: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },

  dataLabel: {
    fontSize: theme.typography.footnote.fontSize,
    color: theme.colors.secondaryLabel,
    flex: 1,
  },

  dataValue: {
    fontSize: theme.typography.footnote.fontSize,
    fontWeight: '600',
    color: theme.colors.label,
  },

  actionItems: {
    marginTop: theme.spacing.sm,
  },

  actionItemsTitle: {
    fontSize: theme.typography.footnote.fontSize,
    fontWeight: '600',
    color: theme.colors.label,
    marginBottom: theme.spacing.sm,
  },

  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },

  actionText: {
    fontSize: theme.typography.footnote.fontSize,
    color: theme.colors.label,
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
});
