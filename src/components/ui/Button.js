import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../../config/theme';
import { hapticFeedback } from '../../utils/helpers';

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  ...props 
}) => {
  const handlePress = async () => {
    await hapticFeedback();
    onPress && onPress();
  };

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? '#fff' : theme.colors.systemBlue} 
          size="small" 
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Apple's minimum touch target
  },
  
  // Variants
  primary: {
    backgroundColor: theme.colors.systemBlue,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.systemBlue,
  },
  tertiary: {
    backgroundColor: theme.colors.systemGray6,
  },
  
  // Sizes
  small: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  large: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    minHeight: 50,
  },
  
  disabled: {
    opacity: 0.4,
  },
  
  // Text styles
  baseText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
    fontSize: theme.typography.body.fontSize,
  },
  secondaryText: {
    color: theme.colors.systemBlue,
    fontSize: theme.typography.body.fontSize,
  },
  tertiaryText: {
    color: theme.colors.label,
    fontSize: theme.typography.body.fontSize,
  },
  smallText: {
    fontSize: theme.typography.footnote.fontSize,
  },
  mediumText: {
    fontSize: theme.typography.body.fontSize,
  },
  largeText: {
    fontSize: theme.typography.headline.fontSize,
  },
  disabledText: {
    opacity: 0.6,
  },
});
