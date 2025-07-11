import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';

export const DataSourcesView = ({ dataSources, selectedPeriod }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  if (!dataSources || (!dataSources.energySources?.length && !dataSources.stressSources?.length)) {
    return null;
  }

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderSourcesList = (sources, type) => {
    if (!sources || sources.length === 0) return null;

    const getSourceIcon = (source, type) => {
      if (type === 'energy') {
        const energyIcons = {
          'good sleep': 'bed-outline',
          'exercise': 'fitness-outline',
          'meditation': 'flower-outline',
          'coffee': 'cafe-outline',
          'social': 'people-outline',
          'music': 'musical-notes-outline',
          'nature': 'leaf-outline',
          'achievement': 'trophy-outline',
        };
        return energyIcons[source.toLowerCase()] || 'flash-outline';
      } else {
        const stressIcons = {
          'work': 'briefcase-outline',
          'deadline': 'alarm-outline',
          'meeting': 'people-outline',
          'email': 'mail-outline',
          'traffic': 'car-outline',
          'money': 'card-outline',
          'health': 'medical-outline',
          'family': 'home-outline',
          'technical': 'construct-outline',
        };
        return stressIcons[source.toLowerCase()] || 'warning-outline';
      }
    };

    const getFrequencyColor = (frequency) => {
      if (frequency >= 0.7) return theme.colors.systemRed || '#FF3B30';
      if (frequency >= 0.4) return theme.colors.systemOrange || '#FF9500';
      return theme.colors.systemGreen || '#34C759';
    };

    return (
      <View style={styles.sourcesList}>
        {sources.map((source, index) => (
          <View key={index} style={styles.sourceItem}>
            <View style={styles.sourceHeader}>
              <View style={styles.sourceIcon}>
                <Ionicons 
                  name={getSourceIcon(source.name, type)} 
                  size={20} 
                  color={type === 'energy' ? theme.colors.energy : theme.colors.stress} 
                />
              </View>
              <View style={styles.sourceContent}>
                <Text style={styles.sourceName}>{source.name}</Text>
                <Text style={styles.sourceDescription}>
                  {source.count} occurrences • {(source.frequency * 100).toFixed(0)}% of days
                </Text>
              </View>
              <View style={[
                styles.frequencyIndicator,
                { backgroundColor: getFrequencyColor(source.frequency) }
              ]} />
            </View>
            
            {source.examples && source.examples.length > 0 && (
              <View style={styles.sourceExamples}>
                <Text style={styles.examplesTitle}>Recent mentions:</Text>
                {source.examples.slice(0, 3).map((example, exIndex) => (
                  <Text key={exIndex} style={styles.exampleText}>
                    "{example.text}" • {new Date(example.date).toLocaleDateString()}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="document-text-outline" size={24} color={theme.colors.label} />
        <Text style={styles.title}>Data Sources Analysis</Text>
      </View>
      <Text style={styles.subtitle}>
        Insights from your energy and stress entries over the last {selectedPeriod} days
      </Text>

      {/* Energy Sources */}
      {dataSources.energySources && dataSources.energySources.length > 0 && (
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('energy')}
          >
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.sectionIcon, { backgroundColor: theme.colors.energy }]}>
                <Ionicons name="flash" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.sectionTitle}>Energy Sources</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>
                  {dataSources.energySources.length}
                </Text>
              </View>
            </View>
            <Ionicons 
              name={expandedSection === 'energy' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={theme.colors.secondaryLabel} 
            />
          </TouchableOpacity>
          
          {expandedSection === 'energy' && renderSourcesList(dataSources.energySources, 'energy')}
        </View>
      )}

      {/* Stress Sources */}
      {dataSources.stressSources && dataSources.stressSources.length > 0 && (
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('stress')}
          >
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.sectionIcon, { backgroundColor: theme.colors.stress }]}>
                <Ionicons name="warning" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.sectionTitle}>Stress Sources</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>
                  {dataSources.stressSources.length}
                </Text>
              </View>
            </View>
            <Ionicons 
              name={expandedSection === 'stress' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={theme.colors.secondaryLabel} 
            />
          </TouchableOpacity>
          
          {expandedSection === 'stress' && renderSourcesList(dataSources.stressSources, 'stress')}
        </View>
      )}
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

  section: {
    marginBottom: theme.spacing.md,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.primaryBackground,
    borderRadius: theme.borderRadius.md,
  },

  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },

  sectionTitle: {
    fontSize: theme.typography.subheadline.fontSize,
    fontWeight: '600',
    color: theme.colors.label,
    flex: 1,
  },

  sectionBadge: {
    backgroundColor: theme.colors.tertiaryBackground,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },

  sectionBadgeText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.secondaryLabel,
    fontWeight: '600',
  },

  sourcesList: {
    marginTop: theme.spacing.sm,
  },

  sourceItem: {
    backgroundColor: theme.colors.primaryBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },

  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sourceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.tertiaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },

  sourceContent: {
    flex: 1,
  },

  sourceName: {
    fontSize: theme.typography.subheadline.fontSize,
    fontWeight: '600',
    color: theme.colors.label,
    marginBottom: theme.spacing.xs,
    textTransform: 'capitalize',
  },

  sourceDescription: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.secondaryLabel,
  },

  frequencyIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: theme.spacing.sm,
  },

  sourceExamples: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.separator,
  },

  examplesTitle: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
    color: theme.colors.secondaryLabel,
    marginBottom: theme.spacing.sm,
  },

  exampleText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.tertiaryLabel,
    marginBottom: theme.spacing.xs,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});
