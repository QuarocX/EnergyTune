import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Animated } from 'react-native';
import { ENERGY_LEVELS, STRESS_LEVELS } from '../../utils/constants';
import { ratingScale } from '../../config/texts';
import { getTheme } from '../../config/theme';

const { width: screenWidth } = Dimensions.get('window');

export const RatingScale = React.memo(({ 
  type = 'energy', 
  value, 
  onValueChange, 
  showLabels = true,
  style,
  theme
}) => {
  // Provide fallback theme if not passed as prop
  const currentTheme = theme || getTheme(false); // Default to light theme as fallback
  const [showFeedback, setShowFeedback] = useState(false);
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const feedbackScale = useRef(new Animated.Value(0.8)).current;
  const levels = type === 'energy' ? ENERGY_LEVELS : STRESS_LEVELS;
  const color = type === 'energy' ? currentTheme.colors.energy : currentTheme.colors.stress;

  const triggerHaptic = useCallback(async () => {
    try {
      const { Haptics } = await import('expo-haptics');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, silently fail
    }
  }, []);

  const showFeedbackAnimation = useCallback(() => {
    setShowFeedback(true);
    
    // Reset values
    feedbackOpacity.setValue(0);
    feedbackScale.setValue(0.8);
    
    // Animate in with smooth spring
    Animated.parallel([
      Animated.spring(feedbackOpacity, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(feedbackScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Auto hide after delay
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(feedbackOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(feedbackScale, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowFeedback(false);
      });
    }, 800);
  }, [feedbackOpacity, feedbackScale]);

  const handlePress = useCallback((rating) => {
    // Update state immediately for instant visual feedback
    onValueChange(rating);
    
    // Trigger haptic and feedback animation asynchronously (non-blocking)
    triggerHaptic();
    showFeedbackAnimation();
  }, [onValueChange, triggerHaptic, showFeedbackAnimation]);

  // Use horizontal scroll for very narrow screens (iPhone SE, etc.)
  const useScrollableLayout = screenWidth < 375;

  const renderRatingButtons = () => {
    return Object.entries(levels).map(([rating, config]) => {
      const isSelected = value === parseInt(rating);
      const isInRange = value && parseInt(rating) <= value;
      
      return (
        <TouchableOpacity
          key={rating}
          style={[
            styles.ratingButton,
            { backgroundColor: currentTheme.colors.tertiaryBackground },
            useScrollableLayout && styles.scrollableButton,
            isSelected && [styles.selectedButton, { backgroundColor: color }],
            isInRange && !isSelected && [styles.inRangeButton, { 
              backgroundColor: `${color}30`,
              borderColor: `${color}50`
            }],
          ]}
          onPress={() => handlePress(parseInt(rating))}
          activeOpacity={0.6}
          delayPressIn={0}
          hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
        >
          <Text style={[
            styles.emoji,
            isSelected && styles.selectedEmoji
          ]}>
            {config.emoji}
          </Text>
          <Text style={[
            styles.ratingNumber,
            { color: currentTheme.colors.secondaryLabel },
            isSelected && { color: '#fff' },
            isInRange && !isSelected && { color: color }
          ]}>
            {rating}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={[styles.container, style]}>
      {useScrollableLayout ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {renderRatingButtons()}
        </ScrollView>
      ) : (
        <View style={styles.scaleContainer}>
          {renderRatingButtons()}
        </View>
      )}
      
      {showLabels && value && levels[value] && (
        <View style={styles.labelContainer}>
          <Text style={styles.inlineLabel}>
            <Text style={[styles.labelTitle, { color }]}>
              {levels[value].label}
            </Text>
            <Text style={[styles.labelSeparator, { color: currentTheme.colors.tertiaryLabel }]}>
              {' • '}
            </Text>
            <Text style={[styles.labelDescription, { color: currentTheme.colors.secondaryLabel }]}>
              {levels[value].description}
            </Text>
          </Text>
        </View>
      )}
      
      {/* Smooth Animated Feedback */}
      {showFeedback && value && levels[value] && (
        <Animated.View 
          style={[
            styles.feedbackContainer,
            {
              opacity: feedbackOpacity,
              transform: [{ scale: feedbackScale }]
            }
          ]}
          pointerEvents="none"
        >
          <View style={[styles.feedbackBubble, { backgroundColor: color }]}>
            <Text style={styles.feedbackEmoji}>{levels[value].emoji}</Text>
            <Text style={styles.feedbackText}>{ratingScale.feedback}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    flexWrap: 'nowrap',
  },

  scrollContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  
  ratingButton: {
    flex: 1,
    minWidth: 28,
    maxWidth: 35,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 1,
    // Optimize for smooth animations
    borderWidth: 0,
  },

  scrollableButton: {
    flex: 0,
    width: 40,
    marginHorizontal: 4,
  },
  
  selectedButton: {
    // Instant visual feedback without transform animation delays
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#ffffff40',
  },
  
  inRangeButton: {
    borderWidth: 1.5,
  },
  
  emoji: {
    fontSize: 12,
    marginBottom: 1,
  },
  
  selectedEmoji: {
    fontSize: 13,
  },
  
  ratingNumber: {
    fontSize: 10,
    fontWeight: '500',
  },
  
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  
  labelContainer: {
    alignItems: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 0,
  },

  inlineLabel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    width: '100%',
    lineHeight: 20,
  },
  
  labelTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },

  labelSeparator: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },
  
  labelDescription: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },

  feedbackContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -20 }],
    zIndex: 1000,
    width: 150,
    alignItems: 'center',
  },

  feedbackBubble: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  feedbackEmoji: {
    fontSize: 16,
    marginRight: 4,
  },

  feedbackText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
