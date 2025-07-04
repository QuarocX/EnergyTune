// EnergyTune - Entry Screen
// Professional data entry screen with Apple-style design excellence

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { format, parseISO } from "date-fns";
import * as Haptics from "expo-haptics";

import { colors, spacing, typography } from "../../config/theme";
import { DailyEntry, EnergyLevel, StressLevel } from "../types";
import { useEntry } from "../hooks/useEntry";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { EnergyRating } from "../components/forms/EnergyRating";
import { StressRating } from "../components/forms/StressRating";
import {
  getTodayString,
  formatDate,
  getDateLabel,
  validateDailyEntry,
} from "../utils/helpers";
import {
  COMMON_ENERGY_SOURCES,
  COMMON_STRESS_SOURCES,
} from "../utils/constants";

interface EntryScreenProps {
  navigation: any;
  route: {
    params?: {
      date?: string;
    };
  };
}

export const EntryScreen: React.FC<EntryScreenProps> = ({
  navigation,
  route,
}) => {
  const entryDate = route.params?.date || getTodayString();
  const {
    entry,
    saveEntry,
    updateEntry,
    isSaving,
    error,
    clearError,
    hasUnsavedChanges,
  } = useEntry(entryDate);

  // Form state
  const [energyLevels, setEnergyLevels] = useState<EnergyLevel>({ morning: 5 });
  const [stressLevels, setStressLevels] = useState<StressLevel>({ morning: 5 });
  const [energySources, setEnergySources] = useState("");
  const [stressSources, setStressSources] = useState("");
  const [notes, setNotes] = useState("");
  const [activeTimeSlot, setActiveTimeSlot] = useState<
    "morning" | "afternoon" | "evening"
  >("morning");

  // Initialize form with existing entry data
  useEffect(() => {
    if (entry) {
      setEnergyLevels(entry.energyLevels);
      setStressLevels(entry.stressLevels);
      setEnergySources(entry.energySources?.day || "");
      setStressSources(entry.stressSources?.day || "");
      setNotes(entry.notes || "");
    }
  }, [entry]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const entryData: Partial<DailyEntry> = {
      energyLevels,
      stressLevels,
      energySources: { day: energySources.trim() },
      stressSources: { day: stressSources.trim() },
      notes: notes.trim() || undefined,
    };

    // Validate before saving
    const validation = validateDailyEntry(entryData);
    if (!validation.isValid) {
      Alert.alert("Validation Error", validation.errors.join("\n"));
      return;
    }

    const success = await saveEntry(entryData);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Entry Saved",
        "Your energy and stress data has been saved successfully.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Save Failed",
        error || "Failed to save entry. Please try again."
      );
    }
  };

  const handleEnergyChange = (value: number) => {
    setEnergyLevels((prev) => ({
      ...prev,
      [activeTimeSlot]: value,
    }));
  };

  const handleStressChange = (value: number) => {
    setStressLevels((prev) => ({
      ...prev,
      [activeTimeSlot]: value,
    }));
  };

  const addTimeSlot = (slot: "afternoon" | "evening") => {
    if (slot === "afternoon" && !energyLevels.afternoon) {
      setEnergyLevels((prev) => ({ ...prev, afternoon: 5 }));
      setStressLevels((prev) => ({ ...prev, afternoon: 5 }));
    } else if (slot === "evening" && !energyLevels.evening) {
      setEnergyLevels((prev) => ({ ...prev, evening: 5 }));
      setStressLevels((prev) => ({ ...prev, evening: 5 }));
    }
    setActiveTimeSlot(slot);
  };

  const isToday = entryDate === getTodayString();
  const dateLabel = getDateLabel(entryDate);
  const formattedDate = formatDate(parseISO(entryDate), "display");

  const canSave =
    energySources.trim() &&
    stressSources.trim() &&
    Object.values(energyLevels).some((val) => val !== undefined) &&
    Object.values(stressLevels).some((val) => val !== undefined);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isToday ? "Today's Entry" : `Entry for ${dateLabel}`}
            </Text>
            <Text style={styles.subtitle}>{formattedDate}</Text>
          </View>

          {/* Time Slot Selector */}
          <Card style={styles.timeSlotsCard}>
            <Text style={styles.sectionTitle}>Time of Day</Text>
            <View style={styles.timeSlots}>
              <Button
                title="Morning"
                onPress={() => setActiveTimeSlot("morning")}
                variant={activeTimeSlot === "morning" ? "primary" : "outline"}
                size="small"
              />
              <Button
                title="Afternoon"
                onPress={() => addTimeSlot("afternoon")}
                variant={activeTimeSlot === "afternoon" ? "primary" : "outline"}
                size="small"
              />
              <Button
                title="Evening"
                onPress={() => addTimeSlot("evening")}
                variant={activeTimeSlot === "evening" ? "primary" : "outline"}
                size="small"
              />
            </View>
          </Card>

          {/* Energy Rating */}
          <Card style={styles.ratingCard}>
            <EnergyRating
              value={energyLevels[activeTimeSlot] || 5}
              onValueChange={handleEnergyChange}
              label="Energy Level"
              type="energy"
              timeOfDay={activeTimeSlot}
            />
          </Card>

          {/* Stress Rating */}
          <Card style={styles.ratingCard}>
            <StressRating
              value={stressLevels[activeTimeSlot] || 5}
              onValueChange={handleStressChange}
              label="Stress Level"
              type="stress"
              timeOfDay={activeTimeSlot}
            />
          </Card>

          {/* Energy Sources */}
          <Card style={styles.inputCard}>
            <Text style={styles.sectionTitle}>Energy Sources</Text>
            <Input
              value={energySources}
              onChangeText={setEnergySources}
              placeholder="What gave you energy today? (e.g., good sleep, exercise, coffee, team collaboration)"
              multiline
              maxLength={500}
              showCharacterCount
              hint="Identify what energizes you to build better habits"
            />

            {/* Quick suggestions */}
            <View style={styles.suggestions}>
              <Text style={styles.suggestionsTitle}>Quick Add:</Text>
              <View style={styles.suggestionButtons}>
                {COMMON_ENERGY_SOURCES.slice(0, 4).map((source, index) => (
                  <Button
                    key={index}
                    title={source}
                    onPress={() => {
                      const current = energySources.trim();
                      const newValue = current
                        ? `${current}, ${source.toLowerCase()}`
                        : source.toLowerCase();
                      setEnergySources(newValue);
                    }}
                    variant="ghost"
                    size="small"
                  />
                ))}
              </View>
            </View>
          </Card>

          {/* Stress Sources */}
          <Card style={styles.inputCard}>
            <Text style={styles.sectionTitle}>Stress Sources</Text>
            <Input
              value={stressSources}
              onChangeText={setStressSources}
              placeholder="What caused stress today? (e.g., deadlines, meetings, technical issues, personal concerns)"
              multiline
              maxLength={500}
              showCharacterCount
              hint="Understanding stress sources helps prevent future overwhelm"
            />

            {/* Quick suggestions */}
            <View style={styles.suggestions}>
              <Text style={styles.suggestionsTitle}>Quick Add:</Text>
              <View style={styles.suggestionButtons}>
                {COMMON_STRESS_SOURCES.slice(0, 4).map((source, index) => (
                  <Button
                    key={index}
                    title={source}
                    onPress={() => {
                      const current = stressSources.trim();
                      const newValue = current
                        ? `${current}, ${source.toLowerCase()}`
                        : source.toLowerCase();
                      setStressSources(newValue);
                    }}
                    variant="ghost"
                    size="small"
                  />
                ))}
              </View>
            </View>
          </Card>

          {/* Optional Notes */}
          <Card style={styles.inputCard}>
            <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional context, insights, or observations about your day..."
              multiline
              maxLength={1000}
              showCharacterCount
            />
          </Card>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Save Button */}
          <View style={styles.saveContainer}>
            <Button
              title={entry ? "Update Entry" : "Save Entry"}
              onPress={handleSave}
              variant="primary"
              size="large"
              fullWidth
              loading={isSaving}
              disabled={!canSave || isSaving}
            />
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  title: {
    ...typography.h1,
    color: colors.text,
    fontWeight: "700",
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  timeSlotsCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  timeSlots: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  ratingCard: {
    marginBottom: spacing.lg,
  },
  inputCard: {
    marginBottom: spacing.lg,
  },
  suggestions: {
    marginTop: spacing.md,
  },
  suggestionsTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: "500",
  },
  suggestionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  errorContainer: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.error,
    borderRadius: 8,
  },
  errorText: {
    ...typography.body,
    color: colors.background,
    textAlign: "center",
  },
  saveContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});

export default EntryScreen;
