import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  PanResponder,
  Animated,
  Dimensions,
  Easing,
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
  const [currentStep, setCurrentStep] = useState(0); // 0: morning, 1: afternoon, 2: evening, 3: sources
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const steps = ['morning', 'afternoon', 'evening', 'sources'];
  const stepTitles = ['Morning', 'Afternoon', 'Evening', 'Sources'];

  // Animation setup
  const screenWidth = Dimensions.get('window').width;
  const scrollX = useRef(new Animated.Value(0)).current;
  const panResponderRef = useRef(null);

  useEffect(() => {
    loadEntry();
  }, [selectedDate]);

  // Auto-advance to next incomplete step on load
  useEffect(() => {
    if (entry) {
      // Find first incomplete step
      const morningComplete = entry.energyLevels.morning !== null && entry.stressLevels.morning !== null;
      const afternoonComplete = entry.energyLevels.afternoon !== null && entry.stressLevels.afternoon !== null;
      const eveningComplete = entry.energyLevels.evening !== null && entry.stressLevels.evening !== null;
      const sourcesComplete = entry.energySources?.trim() && entry.stressSources?.trim();
      
      if (!morningComplete) {
        setCurrentStep(0);
        setCurrentPeriod('morning');
      } else if (!afternoonComplete) {
        setCurrentStep(1);
        setCurrentPeriod('afternoon');
      } else if (!eveningComplete) {
        setCurrentStep(2);
        setCurrentPeriod('evening');
      } else if (!sourcesComplete) {
        setCurrentStep(3);
      }
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

  const updateEnergyLevelForStep = async (step, value) => {
    try {
      setSaving(true);
      
      // Add haptic feedback
      if (Platform.OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      await StorageService.updateEnergyLevel(selectedDate, step, value);
      setEntry(prev => ({
        ...prev,
        energyLevels: {
          ...prev.energyLevels,
          [step]: value,
        },
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to save energy level');
    } finally {
      setSaving(false);
    }
  };

  const updateStressLevelForStep = async (step, value) => {
    try {
      setSaving(true);
      
      // Add haptic feedback
      if (Platform.OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      await StorageService.updateStressLevel(selectedDate, step, value);
      setEntry(prev => ({
        ...prev,
        stressLevels: {
          ...prev.stressLevels,
          [step]: value,
        },
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to save stress level');
    } finally {
      setSaving(false);
    }
  };

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      animateToStep(nextStep);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      animateToStep(prevStep);
    }
  };

  const goToStep = (stepIndex) => {
    animateToStep(stepIndex);
  };

  const animateToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
    if (stepIndex < 3) {
      setCurrentPeriod(steps[stepIndex]);
    }
    
    Animated.timing(scrollX, {
      toValue: -stepIndex * screenWidth,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const isStepComplete = (stepIndex) => {
    if (!entry) return false;
    
    if (stepIndex === 0) { // morning
      return entry.energyLevels.morning !== null && entry.stressLevels.morning !== null;
    } else if (stepIndex === 1) { // afternoon
      return entry.energyLevels.afternoon !== null && entry.stressLevels.afternoon !== null;
    } else if (stepIndex === 2) { // evening
      return entry.energyLevels.evening !== null && entry.stressLevels.evening !== null;
    } else if (stepIndex === 3) { // sources
      return entry.energySources?.trim() && entry.stressSources?.trim();
    }
    return false;
  };

  const canContinue = () => {
    if (currentStep < 3) {
      // For time periods, both energy and stress must be filled
      const period = steps[currentStep];
      return entry && entry.energyLevels[period] !== null && entry.stressLevels[period] !== null;
    } else {
      // For sources, both fields must have content
      return entry && entry.energySources?.trim() && entry.stressSources?.trim();
    }
  };

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to horizontal swipes that are significant
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 20;
    },
    onPanResponderGrant: (evt, gestureState) => {
      // Add haptic feedback on gesture start for iOS
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      // Set the initial value to current scroll position
      scrollX.setOffset(scrollX._value);
      scrollX.setValue(0);
    },
    onPanResponderMove: (evt, gestureState) => {
      // Move content with finger - limit to reasonable bounds
      const newValue = gestureState.dx;
      const currentPosition = scrollX._offset;
      const minPosition = -(steps.length - 1) * screenWidth;
      const maxPosition = 0;
      
      // Apply resistance at boundaries
      let resistedValue = newValue;
      if (currentPosition + newValue > maxPosition) {
        const overshoot = (currentPosition + newValue) - maxPosition;
        resistedValue = newValue - overshoot * 0.7;
      } else if (currentPosition + newValue < minPosition) {
        const overshoot = minPosition - (currentPosition + newValue);
        resistedValue = newValue + overshoot * 0.7;
      }
      
      scrollX.setValue(resistedValue);
    },
    onPanResponderRelease: (evt, gestureState) => {
      scrollX.flattenOffset();
      
      const velocity = gestureState.vx;
      const displacement = gestureState.dx;
      const currentPosition = scrollX._value;
      
      // More conservative target calculation
      let targetStep = Math.round(-currentPosition / screenWidth);
      
      // Only adjust for strong gestures
      if (Math.abs(velocity) > 0.6 || Math.abs(displacement) > screenWidth * 0.35) {
        if (velocity < -0.6 || displacement < -screenWidth * 0.35) {
          // Swipe left - next step
          targetStep = currentStep + 1;
        } else if (velocity > 0.6 || displacement > screenWidth * 0.35) {
          // Swipe right - previous step
          targetStep = currentStep - 1;
        }
      }
      
      // Clamp to valid range
      targetStep = Math.max(0, Math.min(targetStep, steps.length - 1));
      
      // Animate to target step
      animateToStep(targetStep);
    },
  });

  panResponderRef.current = panResponder;

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Energy Check-in</Text>
          <Text style={styles.date}>{formatDisplayDate(selectedDate)}</Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {steps.map((step, index) => (
            <TouchableOpacity
              key={step}
              style={[
                styles.tab,
                currentStep === index && styles.activeTab,
              ]}
              onPress={() => goToStep(index)}
            >
              <View style={styles.tabContent}>
                <Text style={[
                  styles.tabText,
                  currentStep === index && styles.activeTabText,
                ]}>
                  {stepTitles[index]}
                </Text>
                {isStepComplete(index) && (
                  <View style={styles.completionIndicator}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Animated Content Container */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              transform: [{ translateX: scrollX }],
              width: screenWidth * steps.length,
            }
          ]}
          {...panResponder.panHandlers}
        >
          {steps.map((step, index) => (
            <View key={step} style={[styles.stepContainer, { width: screenWidth }]}>
              <ScrollView 
                style={styles.scrollView} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
                scrollEnabled={true}
              >
                {index < 3 ? (
                  // Time period content (Morning/Afternoon/Evening)
                  <View style={styles.content}>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>
                        {stepTitles[index]} Energy Level
                      </Text>
                      <Text style={styles.sectionSubtitle}>
                        How energized do you feel?
                      </Text>
                      <RatingScale
                        type="energy"
                        value={entry?.energyLevels?.[step] ?? null}
                        onValueChange={(value) => updateEnergyLevelForStep(step, value)}
                        style={styles.ratingScale}
                      />
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>
                        {stepTitles[index]} Stress Level
                      </Text>
                      <Text style={styles.sectionSubtitle}>
                        How stressed do you feel?
                      </Text>
                      <RatingScale
                        type="stress"
                        value={entry?.stressLevels?.[step] ?? null}
                        onValueChange={(value) => updateStressLevelForStep(step, value)}
                        style={styles.ratingScale}
                      />
                    </View>
                  </View>
                ) : (
                  // Sources content
                  <View style={styles.content}>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Daily Energy Sources</Text>
                      <Text style={styles.sectionSubtitle}>
                        What's giving you energy today?
                      </Text>
                      <Input
                        placeholder="e.g., good sleep, coffee, exercise, accomplishments"
                        value={entry?.energySources || ''}
                        onChangeText={updateEnergySources}
                        multiline
                        numberOfLines={3}
                        showSaveIndicator={true}
                      />
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Daily Stress Sources</Text>
                      <Text style={styles.sectionSubtitle}>
                        What's causing you stress today?
                      </Text>
                      <Input
                        placeholder="e.g., deadlines, interruptions, technical issues"
                        value={entry?.stressSources || ''}
                        onChangeText={updateStressSources}
                        multiline
                        numberOfLines={3}
                        showSaveIndicator={true}
                      />
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          ))}
        </Animated.View>

        {/* Navigation Footer */}
        <View style={styles.navigationFooter}>
          {currentStep > 0 && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={goToPreviousStep}
            >
              <Text style={styles.backButtonText}>‹ Back</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.navigationSpacer} />
          
          {currentStep < steps.length - 1 && (
            <TouchableOpacity 
              style={[
                styles.continueButton,
                !canContinue() && styles.continueButtonDisabled
              ]}
              onPress={goToNextStep}
              disabled={!canContinue()}
            >
              <Text style={[
                styles.continueButtonText,
                !canContinue() && styles.continueButtonTextDisabled
              ]}>
                Continue ›
              </Text>
            </TouchableOpacity>
          )}
        </View>
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

  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },

  stepContainer: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: theme.spacing.xl,
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
  },

  // Tab Navigation Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primaryBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },

  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: 0, // Allow shrinking
  },

  activeTab: {
    borderBottomColor: theme.colors.systemBlue,
  },

  tabContent: {
    alignItems: 'center',
    position: 'relative',
  },

  tabText: {
    fontSize: theme.typography.footnote.fontSize,
    fontWeight: '500',
    color: theme.colors.secondaryLabel,
    textAlign: 'center',
    numberOfLines: 1,
    adjustsFontSizeToFit: true,
    minimumFontScale: 0.8,
  },

  activeTabText: {
    color: theme.colors.systemBlue,
    fontWeight: '600',
  },

  completionIndicator: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: theme.colors.energy,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkmark: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Content Styles
  content: {
    flex: 1,
  },
  
  section: {
    backgroundColor: theme.colors.primaryBackground,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
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

  // Navigation Footer Styles
  navigationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primaryBackground,
    borderTopWidth: 1,
    borderTopColor: theme.colors.separator,
  },

  backButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },

  backButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.systemBlue,
    fontWeight: '500',
  },

  navigationSpacer: {
    flex: 1,
  },

  continueButton: {
    backgroundColor: theme.colors.systemBlue,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    minWidth: 100,
    alignItems: 'center',
  },

  continueButtonDisabled: {
    backgroundColor: theme.colors.systemGray4,
  },

  continueButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: '#fff',
    fontWeight: '600',
  },

  continueButtonTextDisabled: {
    color: theme.colors.systemGray,
  },
});
