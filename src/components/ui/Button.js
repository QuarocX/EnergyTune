import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme } from '../../config/theme';
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
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  const handlePress = async () => {
    await hapticFeedback();
    onPress && onPress();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.systemBlue,
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.systemBlue,
        };
      case 'tertiary':
        return {
          backgroundColor: theme.colors.systemGray6,
        };
      default:
        return {};
    }
  };

  const getTextStyles = () => {
    const baseStyle = {
      textAlign: 'center',
      fontWeight: '600',
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          color: '#FFFFFF',
        };
      case 'secondary':
        return {
          ...baseStyle,
          color: theme.colors.systemBlue,
        };
      case 'tertiary':
        return {
          ...baseStyle,
          color: theme.colors.label,
        };
      default:
        return baseStyle;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 16,
          paddingVertical: 4,
          minHeight: 32,
        };
      case 'medium':
        return {
          paddingHorizontal: 24,
          paddingVertical: 8,
          minHeight: 44,
        };
      case 'large':
        return {
          paddingHorizontal: 32,
          paddingVertical: 16,
          minHeight: 50,
        };
      default:
        return {};
    }
  };

  const getTextSizeStyles = () => {
    switch (size) {
      case 'small':
        return { fontSize: 15 };
      case 'medium':
        return { fontSize: 17 };
      case 'large':
        return { fontSize: 18 };
      default:
        return {};
    }
  };

  const buttonStyles = [
    styles.base,
    getVariantStyles(),
    getSizeStyles(),
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    getTextStyles(),
    getTextSizeStyles(),
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  disabledText: {
    opacity: 0.4,
  },
});
