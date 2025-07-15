import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../../config/theme';

export const Toast = ({ message, visible, type = 'success', duration = 2000, onHide }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      // Show animation - gentle scale and fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide && onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim, scaleAnim, duration, onHide]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        styles[`${type}Container`],
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Text style={[styles.message, styles[`${type}Text`]]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: 280,
    zIndex: 1000,
    // Apple-like blur effect simulation
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  successContainer: {
    backgroundColor: 'rgba(52, 199, 89, 0.95)', // iOS green with transparency
  },

  infoContainer: {
    backgroundColor: 'rgba(142, 142, 147, 0.95)', // iOS gray with transparency
  },

  message: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: -0.2,
  },

  successText: {
    color: '#FFFFFF',
  },

  infoText: {
    color: '#FFFFFF',
  },
});
