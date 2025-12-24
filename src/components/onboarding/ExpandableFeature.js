import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme } from '../../config/theme';
import { hapticFeedback } from '../../utils/helpers';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const ExpandableFeature = ({ icon, label, description, expanded, delay = 0 }) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial fade-in and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: delay,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleToggle = async () => {
    await hapticFeedback();
    
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);

    // Smooth layout animation
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });

    // Rotate chevron
    Animated.timing(rotateAnim, {
      toValue: toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Fade in/out content
    Animated.timing(contentOpacity, {
      toValue: toValue,
      duration: 300,
      delay: toValue ? 150 : 0,
      useNativeDriver: true,
    }).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const getFeatureIcon = (index) => {
    const icons = ['checkmark-circle', 'flash', 'trending-up', 'analytics'];
    return icons[index % icons.length];
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.primaryBackground,
            borderColor: isExpanded ? theme.colors.systemBlue : 'transparent',
            borderWidth: isExpanded ? 1 : 0,
          },
        ]}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <View style={[
            styles.iconContainer,
            {
              backgroundColor: isExpanded
                ? `${theme.colors.systemBlue}25`
                : `${theme.colors.systemBlue}15`,
            },
          ]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.label, { color: theme.colors.label }]}>{label}</Text>
            <Text style={[styles.description, { color: theme.colors.secondaryLabel }]}>
              {description}
            </Text>
          </View>
          <Animated.View style={[styles.chevronContainer, { transform: [{ rotate }] }]}>
            <Ionicons 
              name="chevron-down" 
              size={22} 
              color={isExpanded ? theme.colors.systemBlue : theme.colors.secondaryLabel} 
            />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <Animated.View
          style={[
            styles.expandedContent,
            {
              opacity: contentOpacity,
              backgroundColor: theme.colors.primaryBackground,
            },
          ]}
        >
          <View style={styles.expandedInner}>
            {expanded.map((item, index) => (
              <View key={index} style={styles.expandedItem}>
                <View style={[
                  styles.badgeContainer,
                  {
                    backgroundColor: index % 2 === 0
                      ? `${theme.colors.systemBlue}15`
                      : `${theme.colors.systemOrange}15`,
                  },
                ]}>
                  <Ionicons
                    name={getFeatureIcon(index)}
                    size={16}
                    color={index % 2 === 0 ? theme.colors.systemBlue : theme.colors.systemOrange}
                  />
                </View>
                <Text style={[styles.expandedText, { color: theme.colors.secondaryLabel }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    borderRadius: 16,
    padding: 18,
    transition: 'all 0.3s ease',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 4,
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },
  chevronContainer: {
    padding: 4,
  },
  expandedContent: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  expandedInner: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 20,
  },
  expandedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  expandedText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
});

