import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../../config/theme';

export const Toast = ({ message, visible, duration = 2000, onHide }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide && onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim, translateY, duration, onHide]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: theme.spacing?.lg || 24,
    right: theme.spacing?.lg || 24,
    backgroundColor: theme.colors?.secondaryBackground || '#F2F2F7',
    borderRadius: theme.borderRadius?.md || 12,
    paddingHorizontal: theme.spacing?.md || 16,
    paddingVertical: theme.spacing?.sm || 8,
    borderWidth: 1,
    borderColor: theme.colors?.separator || '#3C3C4336',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  message: {
    fontSize: theme.typography?.footnote?.fontSize || 13,
    color: theme.colors?.secondaryLabel || '#3C3C43',
    textAlign: 'center',
  },
});
