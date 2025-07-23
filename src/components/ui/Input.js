import React, { useState, useEffect, forwardRef } from 'react';
import { TextInput, View, Text, StyleSheet, Animated } from 'react-native';
import { input } from '../../config/texts';
import { getTheme } from '../../config/theme';

export const Input = forwardRef(({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  style,
  containerStyle,
  error,
  showSaveIndicator = false,
  theme,
  ...props
}, ref) => {
  // Provide fallback theme if not passed as prop
  const currentTheme = theme || getTheme(false); // Default to light theme as fallback
  const [saveAnimation] = useState(new Animated.Value(0));
  const [showSaved, setShowSaved] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState(null);

  // Show save indicator when value changes (with debounce)
  useEffect(() => {
    if (showSaveIndicator && value && value.trim().length > 0) {
      // Clear existing timeout
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      // Set new timeout for save indication
      const timeout = setTimeout(() => {
        setShowSaved(true);
        Animated.sequence([
          Animated.timing(saveAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(saveAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowSaved(false);
        });
      }, 1000); // Show "saved" 1 second after user stops typing

      setSaveTimeout(timeout);
    }

    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [value, showSaveIndicator]);
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: currentTheme.colors.label }]}>{label}</Text>
          {showSaved && (
            <Animated.View 
              style={[
                styles.saveIndicator,
                { 
                  opacity: saveAnimation,
                  backgroundColor: currentTheme.colors.systemBlue,
                }
              ]}
            >
              <Text style={[styles.saveText, { color: currentTheme.colors.systemGreen }]}>{input.savedIndicator}</Text>
            </Animated.View>
          )}
        </View>
      )}
      <TextInput
        ref={ref}
        style={[
          styles.input,
          {
            backgroundColor: currentTheme.colors.secondaryBackground,
            color: currentTheme.colors.label,
            borderColor: currentTheme.colors.separator,
          },
          multiline && styles.multilineInput,
          multiline && { height: numberOfLines * 20 + 24 },
          error && { borderColor: currentTheme.colors.systemRed },
          style,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={currentTheme.colors.tertiaryLabel}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...props}
      />
      {error && (
        <Text style={[styles.errorText, { color: currentTheme.colors.systemRed }]}>{error}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  label: {
    fontSize: 15,
    fontWeight: '600',
  },

  saveIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  saveText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  
  input: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 17,
    borderWidth: 1,
    minHeight: 44,
  },
  
  multilineInput: {
    paddingTop: 8,
    textAlignVertical: 'top',
  },
  
  errorInput: {
  },
  
  errorText: {
    fontSize: 13,
    marginTop: 4,
  },
});
