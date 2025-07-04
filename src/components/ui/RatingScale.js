import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { theme } from '../../config/theme';
import { ENERGY_LEVELS, STRESS_LEVELS } from '../../utils/constants';
import { successHaptic } from '../../utils/helpers';

const { width: screenWidth } = Dimensions.get('window');

export const RatingScale = ({ 
  type = 'energy', 
  value, 
  onValueChange, 
  showLabels = true,
  style 
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const levels = type === 'energy' ? ENERGY_LEVELS : STRESS_LEVELS;
  const color = type === 'energy' ? theme.colors.energy : theme.colors.stress;

  const handlePress = async (rating) => {
    await successHaptic();
    onValueChange(rating);
    
    // Show simple feedback without animation
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
    }, 1000);
  };

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
            useScrollableLayout && styles.scrollableButton,
            isSelected && [styles.selectedButton, { backgroundColor: color }],
            isInRange && !isSelected && [styles.inRangeButton, { backgroundColor: `${color}30` }],
          ]}
          onPress={() => handlePress(parseInt(rating))}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.emoji,
            isSelected && styles.selectedEmoji
          ]}>
            {config.emoji}
          </Text>
          <Text style={[
            styles.ratingNumber,
            isSelected && styles.selectedText,
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
          <Text style={[styles.labelTitle, { color }]}>
            {levels[value].label}
          </Text>
          <Text style={styles.labelDescription}>
            {levels[value].description}
          </Text>
        </View>
      )}
      
      {/* Simple Feedback */}
      {showFeedback && value && levels[value] && (
        <View style={styles.feedbackContainer}>
          <View style={[styles.feedbackBubble, { backgroundColor: color }]}>
            <Text style={styles.feedbackEmoji}>{levels[value].emoji}</Text>
            <Text style={styles.feedbackText}>Saved!</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    flexWrap: 'nowrap',
  },

  scrollContainer: {
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
  },
  
  ratingButton: {
    flex: 1,
    minWidth: 28,
    maxWidth: 35,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.tertiaryBackground,
    marginHorizontal: 1,
  },

  scrollableButton: {
    flex: 0,
    width: 40,
    marginHorizontal: theme.spacing.xs,
  },
  
  selectedButton: {
    transform: [{ scale: 1.1 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  inRangeButton: {
    borderWidth: 1,
    borderColor: theme.colors.energy + '60',
  },
  
  emoji: {
    fontSize: 12,
    marginBottom: 1,
  },
  
  selectedEmoji: {
    fontSize: 14,
  },
  
  ratingNumber: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.colors.secondaryLabel,
  },
  
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  
  labelContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  
  labelTitle: {
    fontSize: theme.typography.headline.fontSize,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  
  labelDescription: {
    fontSize: theme.typography.subhead.fontSize,
    color: theme.colors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 20,
  },

  feedbackContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -25 }],
    zIndex: 1000,
  },

  feedbackBubble: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  feedbackEmoji: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },

  feedbackText: {
    color: '#fff',
    fontSize: theme.typography.footnote.fontSize,
    fontWeight: '600',
  },
});
