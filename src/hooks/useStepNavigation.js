import { useState, useEffect, useRef, useCallback } from 'react';
import { Animated, Dimensions, Easing, PanResponder, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { isStepComplete } from '../utils/entryValidation';

/**
 * Step Navigation Hook
 * 
 * This hook manages the step navigation logic for the entry process.
 * It ensures that the navigation tabs and content panel stay perfectly synchronized.
 * 
 * Key principles:
 * 1. Single source of truth: currentStep drives both tabs and content
 * 2. No automatic jumps: Manual user actions always take precedence
 * 3. Auto-advance only happens after completing current step
 * 4. Initial navigation only happens once on mount
 */

// Steps array defined outside hook to maintain referential equality
const STEPS = ['morning', 'afternoon', 'evening', 'sources'];

export const useStepNavigation = (entry) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPeriod, setCurrentPeriod] = useState('morning');
  const [isTextInputFocused, setIsTextInputFocused] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const steps = STEPS; // Use constant reference
  const screenWidth = Dimensions.get('window').width;
  const scrollX = useRef(new Animated.Value(0)).current;
  const panResponderRef = useRef(null);
  
  // Track if user has manually navigated to prevent auto-navigation interference
  const userNavigatedRef = useRef(false);
  const currentStepRef = useRef(currentStep);

  // Update ref whenever currentStep changes
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  /**
   * Initial navigation - Find first incomplete step on mount ONLY
   * This runs only once when the component mounts or entry first becomes available
   */
  useEffect(() => {
    console.log('🔍 useEffect triggered - entry:', !!entry, 'isInitialized:', isInitialized, 'currentStep:', currentStep);
    
    if (entry && !isInitialized) {
      console.log('🚀 Initializing navigation...');
      // Only auto-navigate on initial mount, not on every entry change
      const morningComplete = isStepComplete(entry, 0);
      const afternoonComplete = isStepComplete(entry, 1);
      const eveningComplete = isStepComplete(entry, 2);
      const sourcesComplete = isStepComplete(entry, 3);
      
      let targetStep = 0;
      
      if (!morningComplete) {
        targetStep = 0;
      } else if (!afternoonComplete) {
        targetStep = 1;
      } else if (!eveningComplete) {
        targetStep = 2;
      } else if (!sourcesComplete) {
        targetStep = 3;
      } else {
        // All steps complete, stay on first step
        targetStep = 0;
      }
      
      console.log('📍 Initial target step:', targetStep);
      
      // Set step and period synchronously
      setCurrentStep(targetStep);
      if (targetStep < 3) {
        setCurrentPeriod(steps[targetStep]);
      }
      
      // Initialize scroll position without animation
      scrollX.setValue(-targetStep * screenWidth);
      
      setIsInitialized(true);
    }
  }, [entry, isInitialized, screenWidth, scrollX]);

  /**
   * Animate to a specific step - Core navigation function
   * This ensures tabs and content are always synchronized
   */
  const animateToStep = useCallback((stepIndex) => {
    console.log('🎬 animateToStep called:', stepIndex, 'current:', currentStepRef.current);
    
    // Validate step index
    if (stepIndex < 0 || stepIndex >= steps.length) {
      return;
    }

    // Update state first (synchronous) - this updates the tabs immediately
    setCurrentStep(stepIndex);
    
    // Update period if it's a time period step
    if (stepIndex < 3) {
      setCurrentPeriod(steps[stepIndex]);
    }
    
    // Then animate the content to match
    Animated.timing(scrollX, {
      toValue: -stepIndex * screenWidth,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    
    // Mark that user has manually navigated
    userNavigatedRef.current = true;
  }, [screenWidth, scrollX]);

  /**
   * Navigate to next step
   */
  const goToNextStep = useCallback(() => {
    if (currentStepRef.current < steps.length - 1) {
      const nextStep = currentStepRef.current + 1;
      animateToStep(nextStep);
    }
  }, [steps.length, animateToStep]);

  /**
   * Navigate to previous step
   */
  const goToPreviousStep = useCallback(() => {
    if (currentStepRef.current > 0) {
      const prevStep = currentStepRef.current - 1;
      animateToStep(prevStep);
    }
  }, [animateToStep]);

  /**
   * Navigate to specific step (used by tab bar)
   */
  const goToStep = useCallback((stepIndex) => {
    animateToStep(stepIndex);
  }, [animateToStep]);

  /**
   * Auto-advance logic - Only advances if current step is complete
   * This is called after user makes a selection (energy/stress level)
   */
  const autoAdvanceIfComplete = useCallback((updatedEntry, step) => {
    console.log('⏩ autoAdvanceIfComplete called for step:', step);
    
    // Small delay for smooth UX
    setTimeout(() => {
      const stepIndex = steps.indexOf(step);
      console.log('⏩ stepIndex:', stepIndex, 'currentStepRef.current:', currentStepRef.current);
      
      // Only auto-advance if we're still on the same step
      if (stepIndex !== currentStepRef.current) {
        console.log('⏩ Skipping auto-advance - user navigated away');
        return;
      }
      
      // Check if current step is now complete
      const isComplete = isStepComplete(updatedEntry, stepIndex);
      console.log('⏩ Is step complete?', isComplete);
      
      if (isComplete && stepIndex < steps.length - 1) {
        // Current step is complete, find next incomplete step
        for (let i = stepIndex + 1; i < steps.length; i++) {
          const isNextComplete = isStepComplete(updatedEntry, i);
          console.log('⏩ Checking step', i, 'complete:', isNextComplete);
          if (!isNextComplete) {
            // Found next incomplete step, navigate to it
            console.log('⏩ Auto-advancing to step:', i);
            animateToStep(i);
            break;
          }
        }
      }
    }, 300);
  }, [animateToStep]);

  /**
   * Text input focus handlers
   */
  const handleTextInputFocus = useCallback(() => {
    setIsTextInputFocused(true);
  }, []);

  const handleTextInputBlur = useCallback(() => {
    setIsTextInputFocused(false);
  }, []);

  /**
   * Pan responder for swipe gestures
   * Handles horizontal swipes between steps
   */
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Don't capture gestures if text input is focused
      if (isTextInputFocused) {
        return false;
      }
      
      // On sources step, don't capture gestures in the input areas
      if (currentStepRef.current === 3) {
        const { pageY } = evt.nativeEvent;
        const screenHeight = Dimensions.get('window').height;
        
        // Energy sources field area
        const energyAreaStart = screenHeight * 0.4;
        const energyAreaEnd = screenHeight * 0.5;
        
        // Stress sources field area
        const stressAreaStart = screenHeight * 0.6;
        const stressAreaEnd = screenHeight * 0.8;
        
        if ((pageY >= energyAreaStart && pageY <= energyAreaEnd) || 
            (pageY >= stressAreaStart && pageY <= stressAreaEnd)) {
          return false;
        }
      }
      
      // Only capture horizontal swipes for navigation
      const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      const hasSignificantMovement = Math.abs(gestureState.dx) > 20;
      
      return isHorizontalSwipe && hasSignificantMovement;
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
      
      // Add resistance at boundaries
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
      
      // Calculate target step based on velocity and displacement
      let targetStep = Math.round(-currentPosition / screenWidth);
      
      // High velocity or large displacement triggers step change
      if (Math.abs(velocity) > 0.6 || Math.abs(displacement) > screenWidth * 0.35) {
        if (velocity < -0.6 || displacement < -screenWidth * 0.35) {
          targetStep = currentStepRef.current + 1;
        } else if (velocity > 0.6 || displacement > screenWidth * 0.35) {
          targetStep = currentStepRef.current - 1;
        }
      }
      
      // Clamp to valid range
      targetStep = Math.max(0, Math.min(targetStep, steps.length - 1));
      
      // Animate to target step (this will sync tabs and content)
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
    handleTextInputFocus,
    handleTextInputBlur,
  };
};
