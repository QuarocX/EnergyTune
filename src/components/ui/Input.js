import React, { useState, useEffect } from 'react';
import { TextInput, View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../../config/theme';
import { input } from '../../config/texts';

export const Input = ({
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
  ...props
}) => {
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
          <Text style={styles.label}>{label}</Text>
          {showSaved && (
            <Animated.View 
              style={[
                styles.saveIndicator,
                { opacity: saveAnimation }
              ]}
            >
              <Text style={styles.saveText}>{input.savedIndicator}</Text>
            </Animated.View>
          )}
        </View>
      )}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          multiline && { height: numberOfLines * 20 + 24 },
          error && styles.errorInput,
          style,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.tertiaryLabel}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...props}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  label: {
    fontSize: theme.typography.subhead.fontSize,
    fontWeight: '600',
    color: theme.colors.label,
  },

  saveIndicator: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    backgroundColor: theme.colors.systemBlue,
    borderRadius: theme.borderRadius.sm,
  },

  saveText: {
    fontSize: theme.typography.caption1.fontSize,
    color: '#fff',
    fontWeight: '500',
  },
  
  input: {
    backgroundColor: theme.colors.tertiaryBackground,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.label,
    borderWidth: 1,
    borderColor: theme.colors.separator,
    minHeight: 44,
  },
  
  multilineInput: {
    paddingTop: theme.spacing.sm,
    textAlignVertical: 'top',
  },
  
  errorInput: {
    borderColor: theme.colors.stress,
  },
  
  errorText: {
    fontSize: theme.typography.footnote.fontSize,
    color: theme.colors.stress,
    marginTop: theme.spacing.xs,
  },
});
