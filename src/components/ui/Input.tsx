// EnergyTune - Core UI Input Component
// Professional text input with Apple-style design

import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from "react-native";
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from "../../../config/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  multiline?: boolean;
  maxLength?: number;
  showCharacterCount?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  containerStyle,
  inputStyle,
  labelStyle,
  multiline = false,
  maxLength,
  showCharacterCount = false,
  value,
  onChangeText,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(value?.length || 0);

  const handleChangeText = (text: string) => {
    setCharCount(text.length);
    onChangeText?.(text);
  };

  const inputContainerStyle = [
    styles.inputContainer,
    isFocused && styles.focused,
    error && styles.error,
    multiline && styles.multiline,
  ];

  const textInputStyle = [
    styles.input,
    multiline && styles.multilineInput,
    inputStyle,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <View style={inputContainerStyle}>
        <TextInput
          style={textInputStyle}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          maxLength={maxLength}
          placeholderTextColor={colors.textSecondary}
          {...props}
        />
      </View>

      <View style={styles.footer}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {hint && !error && <Text style={styles.hintText}>{hint}</Text>}
        {showCharacterCount && maxLength && (
          <Text style={styles.charCount}>
            {charCount}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.background,
  },
  focused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  error: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  multiline: {
    minHeight: 80,
    alignItems: "flex-start",
  },
  input: {
    ...typography.body,
    color: colors.text,
    padding: spacing.md,
    minHeight: 44,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
    minHeight: 16,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    flex: 1,
  },
  hintText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  charCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default Input;
