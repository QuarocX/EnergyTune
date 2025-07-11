import { useState, useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, PanResponder, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { isStepComplete } from '../utils/entryValidation';

// step completion validation logic
// This hook manages the step navigation logic for the entry process
// It handles the current step, auto-advances to the next incomplete step,
// and provides methods for navigating between steps via swipes or button presses.

export const useStepNavigation = (entry) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPeriod, setCurrentPeriod] = useState('morning');
  
  const steps = ['morning', 'afternoon', 'evening', 'sources'];
  const screenWidth = Dimensions.get('window').width;
  const scrollX = useRef(new Animated.Value(0)).current;
  const panResponderRef = useRef(null);

  // Auto-advance to next incomplete step on load
  useEffect(() => {
    if (entry) {
      const morningComplete = isStepComplete(entry, 0);
      const afternoonComplete = isStepComplete(entry, 1);
      const eveningComplete = isStepComplete(entry, 2);
      const sourcesComplete = isStepComplete(entry, 3);
      
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

  const autoAdvanceIfComplete = (updatedEntry, step) => {
    setTimeout(() => {
      const stepIndex = steps.indexOf(step);
      if (stepIndex === currentStep) {
        const isComplete = isStepComplete(updatedEntry, stepIndex);
        if (isComplete && stepIndex < steps.length - 1) {
          // Find next incomplete step
          for (let i = stepIndex + 1; i < steps.length; i++) {
            const isNextComplete = isStepComplete(updatedEntry, i);
            if (!isNextComplete) {
              animateToStep(i);
              break;
            }
          }
        }
      }
    }, 300); // Small delay for smooth UX
  };

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 20;
    },
    onPanResponderGrant: (evt, gestureState) => {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      scrollX.setOffset(scrollX._value);
      scrollX.setValue(0);
    },
    onPanResponderMove: (evt, gestureState) => {
      const newValue = gestureState.dx;
      const currentPosition = scrollX._offset;
      const minPosition = -(steps.length - 1) * screenWidth;
      const maxPosition = 0;
      
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
      
      let targetStep = Math.round(-currentPosition / screenWidth);
      
      if (Math.abs(velocity) > 0.6 || Math.abs(displacement) > screenWidth * 0.35) {
        if (velocity < -0.6 || displacement < -screenWidth * 0.35) {
          targetStep = currentStep + 1;
        } else if (velocity > 0.6 || displacement > screenWidth * 0.35) {
          targetStep = currentStep - 1;
        }
      }
      
      targetStep = Math.max(0, Math.min(targetStep, steps.length - 1));
      animateToStep(targetStep);
    },
  });

  panResponderRef.current = panResponder;

  return {
    currentStep,
    currentPeriod,
    steps,
    scrollX,
    panResponder,
    screenWidth,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    animateToStep,
    autoAdvanceIfComplete,
  };
};
