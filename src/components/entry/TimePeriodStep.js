import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RatingScale } from '../ui/RatingScale';
import { entry as entryTexts } from '../../config/texts';

// Reusable component for morning, afternoon, evening steps

export const TimePeriodStep = React.memo(({ 
  step, 
  stepTitle, 
  entry, 
  onEnergyChange, 
  onStressChange,
  quickEntryMeta,
  onClearQuickFlag,
  theme
}) => {
  const handleEnergyChange = useCallback((value) => {
    // Update state immediately for instant response
    onEnergyChange(step, value);
    
    // Trigger haptic feedback asynchronously (non-blocking)
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [step, onEnergyChange]);

  const handleStressChange = useCallback((value) => {
    // Update state immediately for instant response
    onStressChange(step, value);
    
    // Trigger haptic feedback asynchronously (non-blocking)
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [step, onStressChange]);

  return (
    <View style={styles.content}>
      {/* Quick Entry Badge */}
      {quickEntryMeta?.isQuick && (
        <View style={[styles.quickEntryBadge, { backgroundColor: theme.colors.systemBlue + '15' }]}>
          <View style={styles.quickEntryContent}>
            <Ionicons name="flash" size={16} color={theme.colors.systemBlue} />
            <Text style={[styles.quickEntryText, { color: theme.colors.systemBlue }]}>
              Quick entry saved - Refine or keep as is
            </Text>
          </View>
          <TouchableOpacity onPress={onClearQuickFlag} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.dismissText, { color: theme.colors.systemBlue }]}>
              Dismiss
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.section, styles.firstSection, { backgroundColor: theme.colors.primaryBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.label }]}>
          {entryTexts.energy.title(stepTitle)}
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.secondaryLabel }]}>
          {entryTexts.energy.subtitle}
        </Text>
        <RatingScale
          type="energy"
          value={entry?.energyLevels?.[step] ?? null}
          onValueChange={handleEnergyChange}
          style={styles.ratingScale}
          theme={theme}
        />
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.primaryBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.label }]}>
          {entryTexts.stress.title(stepTitle)}
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.secondaryLabel }]}>
          {entryTexts.stress.subtitle}
        </Text>
        <RatingScale
          type="stress"
          value={entry?.stressLevels?.[step] ?? null}
          onValueChange={handleStressChange}
          style={styles.ratingScale}
          theme={theme}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  
  quickEntryBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },

  quickEntryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },

  quickEntryText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },

  dismissText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  
  section: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 24,
    borderRadius: 12,
  },

  firstSection: {
    marginTop: 10,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  sectionSubtitle: {
    fontSize: 15,
    marginBottom: 16,
  },
  
  ratingScale: {
    marginTop: 8,
  },
});
