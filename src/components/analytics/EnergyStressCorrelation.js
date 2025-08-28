import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

export const EnergyStressCorrelation = ({ 
  data = [], 
  theme, 
  timeframe = 'all',
  showExpanded = false,
  onToggleExpanded,
}) => {
  const [isExpanded, setIsExpanded] = useState(showExpanded);
  const styles = getStyles(theme);

  // Calculate correlation analysis
  const correlationInsight = useMemo(() => {
    return analyzeEnergyStressCorrelation(data, timeframe);
  }, [data, timeframe]);

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggleExpanded?.(newExpanded);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (!correlationInsight) {
    return null;
  }

  const getCorrelationColor = (correlation) => {
    const strength = Math.abs(correlation);
    if (strength > 0.7) return theme.colors.systemRed;
    if (strength > 0.4) return theme.colors.systemOrange;
    return theme.colors.systemGray;
  };

  const getCorrelationIcon = (correlation) => {
    const strength = Math.abs(correlation);
    if (correlation < -0.4) return 'trending-down';
    if (correlation > 0.4) return 'trending-up';
    return 'remove';
  };

  const renderCorrelationVisual = () => {
    if (!correlationInsight.data) return null;

    const correlationValue = parseFloat(correlationInsight.data.find(d => d.label === 'Correlation Coefficient')?.value || '0');
    const strength = Math.abs(correlationValue);
    const isNegative = correlationValue < 0;
    
    return (
      <View style={styles.correlationVisual}>
        <View style={styles.visualHeader}>
          <Text style={styles.visualTitle}>Relationship Strength</Text>
          <View style={[
            styles.correlationBadge,
            { backgroundColor: getCorrelationColor(correlationValue) }
          ]}>
            <Ionicons 
              name={getCorrelationIcon(correlationValue)} 
              size={16} 
              color="#FFFFFF" 
            />
            <Text style={styles.correlationValue}>
              {Math.abs(correlationValue).toFixed(2)}
            </Text>
          </View>
        </View>
        
        <View style={styles.strengthIndicator}>
          <View style={styles.strengthBar}>
            <View 
              style={[
                styles.strengthFill,
                { 
                  width: `${strength * 100}%`,
                  backgroundColor: getCorrelationColor(correlationValue),
                }
              ]}
            />
          </View>
          <Text style={styles.strengthLabel}>
            {strength > 0.7 ? 'Strong' : strength > 0.4 ? 'Moderate' : 'Weak'}
            {isNegative && correlationValue < -0.1 ? ' (Inverse)' : ''}
          </Text>
        </View>

        <View style={styles.interpretationBox}>
          <Ionicons 
            name="information-circle" 
            size={16} 
            color={theme.colors.systemBlue} 
            style={styles.interpretationIcon}
          />
          <Text style={styles.interpretationText}>
            {isNegative && strength > 0.3 
              ? "When stress increases, energy tends to decrease"
              : !isNegative && strength > 0.3
              ? "Energy and stress levels move in the same direction"
              : "Energy and stress levels appear independent"
            }
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.systemBlue }
            ]}>
              <Ionicons 
                name="analytics-outline" 
                size={20} 
                color="#FFFFFF" 
              />
            </View>
            <View style={styles.titleContent}>
              <Text style={styles.title}>{correlationInsight.title}</Text>
              <Text style={styles.subtitle}>{correlationInsight.subtitle}</Text>
              {data && data.length > 0 && (
                <Text style={styles.dateRangeInfo}>
                  {(() => {
                    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
                    if (sortedData.length === 0) return '';
                    
                    const startDate = new Date(sortedData[0].date);
                    const endDate = new Date(sortedData[sortedData.length - 1].date);
                    
                    const isSameDay = startDate.toDateString() === endDate.toDateString();
                    
                    if (isSameDay) {
                      return startDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: startDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                      });
                    }
                    
                    const isSameYear = startDate.getFullYear() === endDate.getFullYear();
                    const startFormat = {
                      month: 'short',
                      day: 'numeric',
                      year: isSameYear ? undefined : 'numeric'
                    };
                    
                    const endFormat = {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    };
                    
                    return `${startDate.toLocaleDateString('en-US', startFormat)} - ${endDate.toLocaleDateString('en-US', endFormat)}`;
                  })()}
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.headerActions}>
            {correlationInsight.confidence !== undefined && (
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  {Math.round(correlationInsight.confidence * 100)}%
                </Text>
              </View>
            )}
            <Ionicons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={theme.colors.secondaryText} 
            />
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.description}>
            {correlationInsight.description}
          </Text>
          
          {renderCorrelationVisual()}
          
          {correlationInsight.data && correlationInsight.data.length > 0 && (
            <View style={styles.dataSection}>
              <Text style={styles.dataSectionTitle}>Analysis Details</Text>
              <View style={styles.dataGrid}>
                {correlationInsight.data.map((dataPoint, index) => (
                  <View key={index} style={styles.dataPoint}>
                    <Text style={styles.dataLabel}>{dataPoint.label}</Text>
                    <Text style={styles.dataValue}>{dataPoint.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}


        </View>
      )}
    </View>
  );
};

// Analyze correlation between energy and stress (extracted from useTrendsData)
const analyzeEnergyStressCorrelation = (data, period) => {
  const validData = data.filter(d => d.energy !== null && d.stress !== null);
  const expectedDays = period === 'all' ? data.length : (typeof period === 'number' ? period : data.length);
  
  // Require at least 3 data points for any meaningful correlation analysis
  if (validData.length < 3) {
    return {
      type: 'correlation',
      title: 'Energy-Stress Relationship',
      subtitle: 'Insufficient data for analysis',
      description: 'Track your energy and stress for at least 3 days to see correlation patterns. Keep logging your daily data to unlock this insight.',
      confidence: 0,
      data: [
        { label: 'Data Points Available', value: `${validData.length} days` },
        { label: 'Expected Period', value: `${expectedDays} days` },
        { label: 'Required Minimum', value: '3 days' },
      ],

    };
  }

  // Calculate Pearson correlation coefficient
  const n = validData.length;
  const sumEnergy = validData.reduce((sum, d) => sum + d.energy, 0);
  const sumStress = validData.reduce((sum, d) => sum + d.stress, 0);
  const sumEnergySquared = validData.reduce((sum, d) => sum + d.energy * d.energy, 0);
  const sumStressSquared = validData.reduce((sum, d) => sum + d.stress * d.stress, 0);
  const sumProduct = validData.reduce((sum, d) => sum + d.energy * d.stress, 0);

  const numerator = n * sumProduct - sumEnergy * sumStress;
  const denominator = Math.sqrt((n * sumEnergySquared - sumEnergy * sumEnergy) * (n * sumStressSquared - sumStress * sumStress));
  
  // Handle edge case where denominator is 0 (no variance in data)
  if (denominator === 0) {
    const dataCompleteness = n < expectedDays ? ` (${expectedDays - n} days missing from selected period)` : '';
    
    return {
      type: 'correlation',
      title: 'Energy-Stress Relationship',
      subtitle: 'No variance detected',
      description: `Your energy and stress levels have been very consistent during this period. This could indicate a stable routine or limited data variation.${dataCompleteness ? ' Continue tracking daily to capture more patterns.' : ''}`,
      confidence: 0.5,
      data: [
        { label: 'Sample Size', value: `${n} of ${expectedDays} days${dataCompleteness}` },
        { label: 'Data Variance', value: 'Low' },
      ],

    };
  }
  
  const correlation = numerator / denominator;
  const strength = Math.abs(correlation);

  // Adjust confidence based on sample size - smaller samples get lower confidence
  let baseConfidence = 0.6;
  if (n >= 7) baseConfidence = 0.8;
  if (n >= 14) baseConfidence = 0.9;
  
  // Reduce confidence if we have significantly less data than expected
  const completenessRatio = n / expectedDays;
  if (completenessRatio < 0.7) {
    baseConfidence *= 0.8; // Reduce confidence by 20% for incomplete data
  }
  
  const confidence = Math.min(baseConfidence + (strength * 0.2), 1);

  let description = '';
  let strengthLabel = '';
  
  if (strength > 0.7) {
    strengthLabel = 'Strong';
    description = correlation < 0 
      ? 'Strong negative correlation: When your stress increases, your energy significantly decreases.'
      : 'Strong positive correlation: Interestingly, your energy and stress levels move together.';
  } else if (strength > 0.4) {
    strengthLabel = 'Moderate';
    description = correlation < 0 
      ? 'Moderate negative correlation: Higher stress tends to reduce your energy levels.'
      : 'Moderate positive correlation: Your energy and stress levels show some connection.';
  } else {
    strengthLabel = 'Weak';
    description = 'Weak correlation: Your energy and stress levels appear to be largely independent during this period.';
  }

  // Add context about sample size and completeness
  if (n < expectedDays && typeof expectedDays === 'number') {
    const missingDays = expectedDays - n;
    description += ` Note: Analysis based on ${n} days of the selected ${expectedDays}-day period (${missingDays} days missing data).`;
  } else if (n < 7) {
    description += ' Note: This analysis is based on a smaller time window - patterns may become clearer with more data.';
  }

  // Prepare sample size label with completeness info
  const sampleSizeLabel = (n < expectedDays && typeof expectedDays === 'number')
    ? `${n} of ${expectedDays} days` 
    : `${n} days`;

  return {
    type: 'correlation',
    title: 'Energy-Stress Relationship',
    subtitle: `${strengthLabel} correlation detected`,
    description,
    confidence,
    data: [
      { label: 'Correlation Coefficient', value: correlation.toFixed(2) },
      { label: 'Sample Size', value: sampleSizeLabel },
      { label: 'Relationship Strength', value: strengthLabel },
    ],

  };
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

  header: {
    padding: 20,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  titleContent: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    color: theme.colors.secondaryText,
  },

  dateRangeInfo: {
    fontSize: 11,
    color: theme.colors.systemBlue,
    fontWeight: '500',
    marginTop: 2,
    fontStyle: 'italic',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  confidenceBadge: {
    backgroundColor: theme.colors.systemGray4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  confidenceText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '600',
  },

  expandedContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.separator,
  },

  description: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: 20,
  },

  correlationVisual: {
    backgroundColor: theme.colors.tertiaryBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },

  visualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  visualTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },

  correlationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },

  correlationValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  strengthIndicator: {
    marginBottom: 16,
  },

  strengthBar: {
    height: 6,
    backgroundColor: theme.colors.systemGray5,
    borderRadius: 3,
    marginBottom: 8,
  },

  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },

  strengthLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.secondaryText,
    textAlign: 'center',
  },

  interpretationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.systemBlue + '10',
    borderRadius: 8,
    padding: 12,
  },

  interpretationIcon: {
    marginTop: 1,
    marginRight: 8,
  },

  interpretationText: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
    flex: 1,
  },

  dataSection: {
    marginBottom: 20,
  },

  dataSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },

  dataGrid: {
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 8,
    padding: 16,
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
});
