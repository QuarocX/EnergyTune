import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const TrendInsights = ({ insights, selectedPeriod, embedded = false, theme }) => {
  const styles = getStyles(theme);
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
              color={theme.colors.secondaryText} 
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
            <Ionicons name="analytics" size={24} color={theme.colors.text} />
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

const getStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 8,
    padding: 24,
    marginVertical: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  title: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 8,
  },

  subtitle: {
    fontSize: 13,
    color: theme.colors.secondaryText,
    marginBottom: 24,
    lineHeight: 18,
  },

  insightsList: {
    gap: 8,
  },

  embeddedInsightsList: {
    gap: 8,
    marginTop: 0,
  },

  embeddedContainer: {
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
    borderRadius: 0,
  },

  insightCard: {
    backgroundColor: theme.colors.tertiaryBackground,
    borderRadius: 6,
    overflow: 'hidden',
  },

  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
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
    marginRight: 16,
  },

  insightTitleContent: {
    flex: 1,
  },

  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },

  insightSubtitle: {
    fontSize: 12,
    color: theme.colors.secondaryText,
  },

  insightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  confidenceBadge: {
    backgroundColor: theme.colors.systemGray4,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  confidenceText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '600',
  },

  insightContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  insightDescription: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },

  insightData: {
    backgroundColor: theme.colors.systemGray5,
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
  },

  dataPoint: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  dataLabel: {
    fontSize: 13,
    color: theme.colors.secondaryText,
    flex: 1,
  },

  dataValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },

  actionItems: {
    marginTop: 8,
  },

  actionItemsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },

  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  actionText: {
    fontSize: 13,
    color: theme.colors.text,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});
