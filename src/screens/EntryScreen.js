import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../config/theme';
import { entry as entryTexts, common } from '../config/texts';
import { getTodayString, getTimeOfDay } from '../utils/helpers';
import { canContinueFromStep } from '../utils/entryValidation';
import { setCelebrationState } from '../utils/celebrationState';
import { useEntryData } from '../hooks/useEntryData';
import { useStepNavigation } from '../hooks/useStepNavigation';
import { useToast } from '../contexts/ToastContext';
import { EntryHeader } from '../components/entry/EntryHeader';
import { StepTabs } from '../components/entry/StepTabs';
import { TimePeriodStep } from '../components/entry/TimePeriodStep';
import { SourcesStep } from '../components/entry/SourcesStep';
import { NavigationFooter } from '../components/entry/NavigationFooter';
import StorageService from '../services/storage';

export const EntryScreen = ({ navigation, route }) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const [selectedDate, setSelectedDate] = useState(route.params?.date || getTodayString());
  const { showToast } = useToast();
  const sourcesScrollViewRef = useRef(null);
  const [quickEntryMeta, setQuickEntryMeta] = useState(null);

  // Custom hooks
  const {
    entry,
    loading,
    updateEnergyLevel,
    updateStressLevel,
    updateEnergySources,
    updateStressSources,
    resetEntry,
  } = useEntryData(selectedDate);

  const {
    currentStep,
    steps,
    scrollX,
    panResponder,
    screenWidth,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    autoAdvanceIfComplete,
    handleTextInputFocus,
    handleTextInputBlur,
  } = useStepNavigation(entry);

  const stepTitles = [
    entryTexts.periods.morning, 
    entryTexts.periods.afternoon, 
    entryTexts.periods.evening, 
    entryTexts.periods.sources
  ];

  // Update date when route params change (e.g., navigating from Dashboard badge)
  useEffect(() => {
    if (route.params?.date && route.params.date !== selectedDate) {
      setSelectedDate(route.params.date);
    }
  }, [route.params?.date]);

  // Load quick entry metadata when date changes
  useEffect(() => {
    const loadQuickMeta = async () => {
      try {
        const quickEntries = await StorageService.getQuickEntries(selectedDate);
        setQuickEntryMeta(quickEntries);
      } catch (error) {
        console.error('Error loading quick entry metadata:', error);
      }
    };
    loadQuickMeta();
  }, [selectedDate, entry]);

  // Wrapper function to dismiss keyboard when switching tabs
  const handleStepPress = (stepIndex) => {
    Keyboard.dismiss();
    goToStep(stepIndex);
  };

  // Wrapper functions to dismiss keyboard when navigating
  const handleGoToNextStep = () => {
    Keyboard.dismiss();
    goToNextStep();
  };

  const handleGoToPreviousStep = () => {
    Keyboard.dismiss();
    goToPreviousStep();
  };

  const handleEnergyLevelChange = (step, value) => {
    // Update immediately for instant UI response
    updateEnergyLevel(step, value).then((updatedEntry) => {
      autoAdvanceIfComplete(updatedEntry, step);
    }).catch((error) => {
      // Error already handled in hook
    });
  };

  const handleStressLevelChange = (step, value) => {
    // Update immediately for instant UI response
    updateStressLevel(step, value).then((updatedEntry) => {
      autoAdvanceIfComplete(updatedEntry, step);
    }).catch((error) => {
      // Error already handled in hook
    });
  };

  const handleCompleteCheckIn = async () => {
    const isComplete = canContinueFromStep(entry, steps.length - 1, steps);
    const actuallyComplete = Boolean(isComplete);
    
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Set global celebration state
    setCelebrationState(true, actuallyComplete ? 'complete' : 'partial');
    
    // Simple approach: just go back
    navigation.goBack();
    
    // Show appropriate toast message after navigation
    setTimeout(() => {
      if (actuallyComplete) {
        showToast('Check-in completed! 🎉', 'success');
      } else {
        showToast('Check-in saved', 'info');
      }
    }, 100);
  };

  const handleResetDay = () => {
    Alert.alert(
      entryTexts.alerts.resetConfirmTitle,
      entryTexts.alerts.resetConfirmMessage,
      [
        {
          text: common.cancel,
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetEntry();
              
              if (Platform.OS === 'ios') {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
            } catch (error) {
              // Error already handled in hook
            }
          },
        },
      ]
    );
  };

  const scrollToStressSource = () => {
    if (sourcesScrollViewRef.current) {
      // Scroll down to show the stress source field
      // Using a timeout to ensure the keyboard has opened
      setTimeout(() => {
        sourcesScrollViewRef.current.scrollTo({
          y: 800, // Scroll down to show the stress source field above keyboard
          animated: true,
        });
      }, 300); // Delay to ensure keyboard is fully open
    }
  };

  const clearQuickFlag = async (period) => {
    try {
      await StorageService.clearQuickEntryFlag(selectedDate, period);
      // Reload quick entry metadata
      const quickEntries = await StorageService.getQuickEntries(selectedDate);
      setQuickEntryMeta(quickEntries);
    } catch (error) {
      console.error('Error clearing quick entry flag:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.secondaryBackground }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.secondaryLabel }]}>{common.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.secondaryBackground }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.secondaryLabel }]}>No entry data</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.secondaryBackground }]} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -80 : 0}
      >
        <EntryHeader 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onReset={handleResetDay}
          theme={theme}
        />

        <StepTabs 
          steps={steps}
          stepTitles={stepTitles}
          currentStep={currentStep}
          entry={entry}
          onStepPress={handleStepPress}
          theme={theme}
        />

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
                ref={index === 3 ? sourcesScrollViewRef : null}
                style={styles.scrollView} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
                scrollEnabled={true}
                keyboardDismissMode="interactive"
              >
                {index < 3 ? (
                  <TimePeriodStep
                    step={step}
                    stepTitle={stepTitles[index]}
                    entry={entry}
                    onEnergyChange={handleEnergyLevelChange}
                    onStressChange={handleStressLevelChange}
                    quickEntryMeta={quickEntryMeta?.[step]}
                    onClearQuickFlag={() => clearQuickFlag(step)}
                    theme={theme}
                  />
                ) : (
                  <SourcesStep
                    entry={entry}
                    onEnergySourcesChange={updateEnergySources}
                    onStressSourcesChange={updateStressSources}
                    onTextInputFocus={handleTextInputFocus}
                    onTextInputBlur={handleTextInputBlur}
                    onStressSourceFocus={scrollToStressSource}
                    theme={theme}
                  />
                )}
              </ScrollView>
            </View>
          ))}
        </Animated.View>

        <NavigationFooter 
          currentStep={currentStep}
          steps={steps}
          entry={entry}
          onBack={handleGoToPreviousStep}
          onContinue={handleGoToNextStep}
          onComplete={handleCompleteCheckIn}
          theme={theme}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingTop: 2,
    paddingBottom: 24,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 17,
  },
});
