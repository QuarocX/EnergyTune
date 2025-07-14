import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../config/theme';
import { entry as entryTexts, common } from '../config/texts';
import { getTodayString, getTimeOfDay, showSuccessToast } from '../utils/helpers';
import { useEntryData } from '../hooks/useEntryData';
import { useStepNavigation } from '../hooks/useStepNavigation';
import { EntryHeader } from '../components/entry/EntryHeader';
import { StepTabs } from '../components/entry/StepTabs';
import { TimePeriodStep } from '../components/entry/TimePeriodStep';
import { SourcesStep } from '../components/entry/SourcesStep';
import { NavigationFooter } from '../components/entry/NavigationFooter';

export const EntryScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Toast animation refs
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-50)).current;

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
  } = useStepNavigation(entry);

  const stepTitles = [
    entryTexts.periods.morning, 
    entryTexts.periods.afternoon, 
    entryTexts.periods.evening, 
    entryTexts.periods.sources
  ];

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
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    navigation.goBack();
    showSuccessToast(setShowSuccessToast, toastOpacity, toastTranslateY);
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{common.loading}</Text>
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
        keyboardVerticalOffset={0}
      >
        <EntryHeader 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onReset={handleResetDay}
        />

        <StepTabs 
          steps={steps}
          stepTitles={stepTitles}
          currentStep={currentStep}
          entry={entry}
          onStepPress={handleStepPress}
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
                style={styles.scrollView} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
                scrollEnabled={true}
              >
                {index < 3 ? (
                  <TimePeriodStep
                    step={step}
                    stepTitle={stepTitles[index]}
                    entry={entry}
                    onEnergyChange={handleEnergyLevelChange}
                    onStressChange={handleStressLevelChange}
                  />
                ) : (
                  <SourcesStep
                    entry={entry}
                    onEnergySourcesChange={updateEnergySources}
                    onStressSourcesChange={updateStressSources}
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
        />

        {/* Success Toast */}
        {showSuccessToast && (
          <Animated.View
            style={[
              styles.successToast,
              {
                opacity: toastOpacity,
                transform: [{ translateY: toastTranslateY }],
              },
            ]}
          >
            <Text style={styles.successToastText}>Check-in completed! 🎉</Text>
          </Animated.View>
        )}
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

  successToast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },

  successToastText: {
    fontSize: theme.typography.body.fontSize,
    color: '#fff',
    fontWeight: '600',
  },
});
