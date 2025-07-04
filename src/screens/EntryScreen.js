import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { RatingScale } from '../components/ui/RatingScale';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { theme } from '../config/theme';
import { TIME_PERIODS } from '../utils/constants';
import { getTodayString, getTimeOfDay, formatDisplayDate } from '../utils/helpers';
import StorageService from '../services/storage';

export const EntryScreen = ({ navigation }) => {
  const [selectedDate] = useState(getTodayString());
  const [currentPeriod, setCurrentPeriod] = useState(getTimeOfDay());
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEntry();
  }, [selectedDate]);

  // Check completion status for all time periods
  useEffect(() => {
    if (entry) {
      const morningComplete = entry.energyLevels.morning !== null && entry.stressLevels.morning !== null;
      const afternoonComplete = entry.energyLevels.afternoon !== null && entry.stressLevels.afternoon !== null;
      const eveningComplete = entry.energyLevels.evening !== null && entry.stressLevels.evening !== null;
      const hasEnergySources = entry.energySources && entry.energySources.trim().length > 0;
      const hasStressSources = entry.stressSources && entry.stressSources.trim().length > 0;
      
      const timePeriodsComplete = [morningComplete, afternoonComplete, eveningComplete].filter(Boolean).length;
      const sourcesComplete = (hasEnergySources && hasStressSources) ? 1 : 0;
      const totalProgress = (timePeriodsComplete + sourcesComplete) / 4; // 3 time periods + 1 sources
      
      // Progress calculation completed - could be used for analytics or other features
    }
  }, [entry]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      console.log('Loading entry for date:', selectedDate);
      const entryData = await StorageService.getEntry(selectedDate);
      console.log('Entry loaded:', entryData);
      setEntry(entryData);
    } catch (error) {
      console.error('Error loading entry:', error);
      Alert.alert('Error', 'Failed to load entry data');
    } finally {
      setLoading(false);
    }
  };

  const updateEnergyLevel = async (value) => {
    try {
      setSaving(true);
      
      // Add haptic feedback
      if (Platform.OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      await StorageService.updateEnergyLevel(selectedDate, currentPeriod, value);
      setEntry(prev => ({
        ...prev,
        energyLevels: {
          ...prev.energyLevels,
          [currentPeriod]: value,
        },
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to save energy level');
    } finally {
      setSaving(false);
    }
  };

  const updateStressLevel = async (value) => {
    try {
      setSaving(true);
      
      // Add haptic feedback
      if (Platform.OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      await StorageService.updateStressLevel(selectedDate, currentPeriod, value);
      setEntry(prev => ({
        ...prev,
        stressLevels: {
          ...prev.stressLevels,
          [currentPeriod]: value,
        },
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to save stress level');
    } finally {
      setSaving(false);
    }
  };

  const updateEnergySources = async (text) => {
    try {
      await StorageService.updateEnergySources(selectedDate, text);
      setEntry(prev => ({
        ...prev,
        energySources: text,
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to save energy sources');
    }
  };

  const updateStressSources = async (text) => {
    try {
      await StorageService.updateStressSources(selectedDate, text);
      setEntry(prev => ({
        ...prev,
        stressSources: text,
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to save stress sources');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No entry data</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Energy Check-in</Text>
            <Text style={styles.date}>{formatDisplayDate(selectedDate)}</Text>
            
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Daily Progress</Text>
              <View style={styles.timePeriodsProgress}>
                {['morning', 'afternoon', 'evening'].map((period) => {
                  const isComplete = entry && 
                    entry.energyLevels[period] !== null && 
                    entry.stressLevels[period] !== null;
                  const isCurrent = period === currentPeriod;
                  
                  return (
                    <View key={period} style={styles.periodIndicator}>
                      <View style={[
                        styles.periodDot,
                        isComplete && styles.periodDotComplete,
                        isCurrent && styles.periodDotCurrent,
                      ]}>
                        {isComplete && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text style={[
                        styles.periodLabel,
                        isCurrent && styles.periodLabelCurrent,
                      ]}>
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </Text>
                    </View>
                  );
                })}
              </View>
              
              {/* Sources Progress */}
              <View style={styles.sourcesProgress}>
                <View style={[
                  styles.sourcesDot,
                  entry && entry.energySources && entry.energySources.trim() && 
                  entry.stressSources && entry.stressSources.trim() && styles.sourcesDotComplete,
                ]}>
                  {entry && entry.energySources && entry.energySources.trim() && 
                   entry.stressSources && entry.stressSources.trim() && 
                   <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.sourcesLabel}>Energy & Stress Sources</Text>
              </View>
            </View>
          </View>

          {/* Time Period Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time of Day</Text>
            <View style={styles.periodSelector}>
              {Object.values(TIME_PERIODS).map((period) => (
                <Button
                  key={period}
                  title={period.charAt(0).toUpperCase() + period.slice(1)}
                  variant={currentPeriod === period ? 'primary' : 'tertiary'}
                  size="small"
                  onPress={() => setCurrentPeriod(period)}
                  style={styles.periodButton}
                />
              ))}
            </View>
          </View>

          {/* Energy Level */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Energy Level</Text>
            <Text style={styles.sectionSubtitle}>
              How energized do you feel right now?
            </Text>
            <RatingScale
              type="energy"
              value={entry.energyLevels[currentPeriod]}
              onValueChange={updateEnergyLevel}
              style={styles.ratingScale}
            />
          </View>

          {/* Stress Level */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stress Level</Text>
            <Text style={styles.sectionSubtitle}>
              How stressed do you feel right now?
            </Text>
            <RatingScale
              type="stress"
              value={entry.stressLevels[currentPeriod]}
              onValueChange={updateStressLevel}
              style={styles.ratingScale}
            />
          </View>

          {/* Energy Sources */}
          <View style={styles.section}>
            <View style={styles.sharedSectionHeader}>
              <Text style={styles.sharedSectionTitle}>Daily Energy & Stress Sources</Text>
              <Text style={styles.sharedSectionSubtitle}>
                These apply to your entire day (morning, afternoon & evening)
              </Text>
            </View>
            
            <Input
              label="💪 Energy Sources"
              placeholder="What's giving you energy today? (e.g., good sleep, coffee, exercise)"
              value={entry.energySources}
              onChangeText={updateEnergySources}
              multiline
              numberOfLines={3}
              showSaveIndicator={true}
            />
          </View>

          {/* Stress Sources */}
          <View style={styles.section}>
            <Input
              label="😰 Stress Sources"
              placeholder="What's causing you stress today? (e.g., deadlines, interruptions, technical issues)"
              value={entry.stressSources}
              onChangeText={updateStressSources}
              multiline
              numberOfLines={3}
              showSaveIndicator={true}
            />
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondaryBackground,
  },

  keyboardAvoidingView: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.secondaryLabel,
  },
  
  header: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.primaryBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },
  
  title: {
    fontSize: theme.typography.largeTitle.fontSize,
    fontWeight: theme.typography.largeTitle.fontWeight,
    color: theme.colors.label,
    marginBottom: theme.spacing.xs,
  },
  
  date: {
    fontSize: theme.typography.subhead.fontSize,
    color: theme.colors.secondaryLabel,
    marginBottom: theme.spacing.md,
  },

  progressContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    width: '100%',
  },

  progressLabel: {
    fontSize: theme.typography.footnote.fontSize,
    color: theme.colors.secondaryLabel,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },

  timePeriodsProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },

  periodIndicator: {
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
  },

  periodDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.systemGray5,
    borderWidth: 2,
    borderColor: theme.colors.systemGray4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },

  periodDotComplete: {
    backgroundColor: theme.colors.energy,
    borderColor: theme.colors.energy,
  },

  periodDotCurrent: {
    borderColor: theme.colors.systemBlue,
    borderWidth: 3,
  },

  periodLabel: {
    fontSize: theme.typography.caption1.fontSize,
    color: theme.colors.secondaryLabel,
    fontWeight: '500',
  },

  periodLabelCurrent: {
    color: theme.colors.systemBlue,
    fontWeight: '600',
  },

  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  sourcesProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.separator,
  },

  sourcesDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.systemGray5,
    borderWidth: 2,
    borderColor: theme.colors.systemGray4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },

  sourcesDotComplete: {
    backgroundColor: theme.colors.stress,
    borderColor: theme.colors.stress,
  },

  sourcesLabel: {
    fontSize: theme.typography.caption1.fontSize,
    color: theme.colors.secondaryLabel,
    fontWeight: '500',
  },
  
  section: {
    backgroundColor: theme.colors.primaryBackground,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },

  sharedSectionHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },

  sharedSectionTitle: {
    fontSize: theme.typography.title3.fontSize,
    fontWeight: theme.typography.title3.fontWeight,
    color: theme.colors.label,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },

  sharedSectionSubtitle: {
    fontSize: theme.typography.footnote.fontSize,
    color: theme.colors.secondaryLabel,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  sectionTitle: {
    fontSize: theme.typography.headline.fontSize,
    fontWeight: theme.typography.headline.fontWeight,
    color: theme.colors.label,
    marginBottom: theme.spacing.xs,
  },
  
  sectionSubtitle: {
    fontSize: theme.typography.subhead.fontSize,
    color: theme.colors.secondaryLabel,
    marginBottom: theme.spacing.md,
  },
  
  ratingScale: {
    marginTop: theme.spacing.sm,
  },
  
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  
  periodButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});
