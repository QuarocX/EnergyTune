// EnergyTune - Energy Rating Component
// Professional button-based rating with Apple-style interactions

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, spacing, typography } from "../../../config/theme";
import { ENERGY_SCALE } from "../../utils/constants";
import { RatingSliderProps } from "../../types";

export const EnergyRating: React.FC<RatingSliderProps> = ({
  value,
  onValueChange,
  label,
  type,
  timeOfDay,
  disabled = false,
}) => {
  const handleValueChange = (newValue: number) => {
    if (disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onValueChange(newValue);
  };

  const currentScale = ENERGY_SCALE[value as keyof typeof ENERGY_SCALE];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>
          {label} {timeOfDay && `(${timeOfDay})`}
        </Text>
        <View style={styles.valueContainer}>
          <Text style={styles.emoji}>{currentScale.emoji}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>

      <Text style={styles.description}>{currentScale.description}</Text>

      {/* Rating Scale Buttons */}
      <View style={styles.scaleContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.ratingButton,
              value === rating && styles.selectedRating,
              disabled && styles.disabledButton,
            ]}
            onPress={() => handleValueChange(rating)}
            disabled={disabled}
          >
            <Text
              style={[
                styles.ratingText,
                value === rating && styles.selectedRatingText,
              ]}
            >
              {rating}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.scaleLabels}>
        <Text style={styles.scaleLabel}>Low Energy</Text>
        <Text style={styles.scaleLabel}>High Energy</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.body,
    fontWeight: "600",
    color: colors.text,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  emoji: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  value: {
    ...typography.h2,
    color: colors.energy,
    fontWeight: "700",
    minWidth: 30,
    textAlign: "center",
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  scaleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  ratingButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedRating: {
    backgroundColor: colors.energy,
    borderColor: colors.energy,
  },
  disabledButton: {
    opacity: 0.5,
  },
  ratingText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  selectedRatingText: {
    color: colors.background,
    fontWeight: "600",
  },
  scaleLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  scaleLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default EnergyRating;
