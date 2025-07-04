// EnergyTune - Theme Configuration
// Apple-style design system with professional color palette

import { ThemeColors, Spacing, Typography } from '../types';

export const colors: ThemeColors = {
  // Primary Colors (Following Apple Design Guidelines)
  primary: '#007AFF',      // Blue for energy
  secondary: '#FF9500',    // Orange for stress
  
  // Background Colors
  background: '#FFFFFF',
  surface: '#F2F2F7',      // Light gray backgrounds
  
  // Text Colors
  text: '#000000',
  textSecondary: '#8E8E93',
  
  // Metric Colors
  energy: '#007AFF',       // Blue for energy
  stress: '#FF9500',       // Orange for stress
  
  // Status Colors
  success: '#34C759',      // Green
  warning: '#FF9500',      // Orange
  error: '#FF3B30',        // Red
  
  // Border Colors
  border: '#E5E5EA',
};

export const darkColors: ThemeColors = {
  primary: '#0A84FF',
  secondary: '#FF9F0A',
  
  background: '#000000',
  surface: '#1C1C1E',
  
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  
  energy: '#0A84FF',
  stress: '#FF9F0A',
  
  success: '#32D74B',
  warning: '#FF9F0A',
  error: '#FF453A',
  
  border: '#38383A',
};

export const spacing: Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography: Typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
};

// Animation durations (in milliseconds)
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Border radius values
export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 24,
};

// Shadow configurations for iOS-style elevation
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Haptic feedback types
export const hapticTypes = {
  light: 'light' as const,
  medium: 'medium' as const,
  heavy: 'heavy' as const,
  success: 'notificationSuccess' as const,
  warning: 'notificationWarning' as const,
  error: 'notificationError' as const,
};

export default {
  colors,
  darkColors,
  spacing,
  typography,
  animations,
  borderRadius,
  shadows,
  hapticTypes,
};
