// EnergyTune - Core UI Card Component
// Professional container component with Apple-style design

import React from "react";
import {
  View,
  ViewStyle,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import { colors, spacing, borderRadius, shadows } from "../../../config/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  elevated?: boolean;
  padding?: keyof typeof spacing;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  disabled = false,
  elevated = true,
  padding = "md",
}) => {
  const cardStyle = [
    styles.base,
    { padding: spacing[padding] },
    elevated && shadows.medium,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default Card;
