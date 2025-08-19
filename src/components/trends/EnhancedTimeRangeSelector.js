import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Modal,
  ScrollView,
} from 'react-native';
import { DatePicker } from '../ui/DatePicker';
import * as Haptics from 'expo-haptics';

export const EnhancedTimeRangeSelector = ({ 
  selectedPeriod, 
  onPeriodChange, 
  loading, 
  theme,
  customRangeEnabled = true 
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [isCustomRange, setIsCustomRange] = useState(false);

  const styles = getStyles(theme);

  const predefinedRanges = [
    { key: 1, label: '1D', description: 'Today', icon: '📅' },
    { key: 7, label: '1W', description: 'Last 7 days', icon: '📆' },
    { key: 14, label: '2W', description: 'Last 2 weeks', icon: '🗓️' },
    { key: 30, label: '1M', description: 'Last month', icon: '📊' },
    { key: 60, label: '2M', description: 'Last 2 months', icon: '📈' },
    { key: 90, label: '3M', description: 'Last quarter', icon: '📉' },
    { key: 180, label: '6M', description: 'Last 6 months', icon: '📋' },
    { key: 365, label: '1Y', description: 'Last year', icon: '🗂️' },
  ];

  const handlePredefinedRange = (range) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsCustomRange(false);
    onPeriodChange(range.key);
  };

  const handleCustomRange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCustomModal(true);
  };

  const applyCustomRange = () => {
    const diffTime = Math.abs(customEndDate - customStartDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    setIsCustomRange(true);
    setShowCustomModal(false);
    onPeriodChange({
      type: 'custom',
      days: diffDays,
      startDate: customStartDate,
      endDate: customEndDate,
      label: `${diffDays}D Custom`
    });
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getCurrentRangeInfo = () => {
    if (isCustomRange && typeof selectedPeriod === 'object') {
      return {
        label: selectedPeriod.label,
        description: `${selectedPeriod.startDate.toLocaleDateString()} - ${selectedPeriod.endDate.toLocaleDateString()}`,
        icon: '🎯'
      };
    }
    
    const range = predefinedRanges.find(r => r.key === selectedPeriod);
    return range || predefinedRanges[1]; // Default to 1W
  };

  const currentRange = getCurrentRangeInfo();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Time Period</Text>
      
      {/* Current Selection Display */}
      <View style={styles.currentSelection}>
        <Text style={styles.currentIcon}>{currentRange.icon}</Text>
        <View style={styles.currentInfo}>
          <Text style={styles.currentLabel}>{currentRange.label}</Text>
          <Text style={styles.currentDescription}>{currentRange.description}</Text>
        </View>
        {loading && (
          <ActivityIndicator size="small" color={theme.colors.systemBlue} />
        )}
      </View>

      {/* Predefined Range Grid */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.rangeScroll}
        contentContainerStyle={styles.rangeContainer}
      >
        {predefinedRanges.map((range) => (
          <TouchableOpacity
            key={range.key}
            style={[
              styles.rangeButton,
              !isCustomRange && selectedPeriod === range.key && styles.activeRangeButton,
            ]}
            onPress={() => handlePredefinedRange(range)}
            disabled={loading}
          >
            <Text style={styles.rangeIcon}>{range.icon}</Text>
            <Text style={[
              styles.rangeText,
              !isCustomRange && selectedPeriod === range.key && styles.activeRangeText,
            ]}>
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
        
        {/* Custom Range Button */}
        {customRangeEnabled && (
          <TouchableOpacity
            style={[
              styles.rangeButton,
              styles.customRangeButton,
              isCustomRange && styles.activeRangeButton,
            ]}
            onPress={handleCustomRange}
            disabled={loading}
          >
            <Text style={styles.rangeIcon}>🎯</Text>
            <Text style={[
              styles.rangeText,
              isCustomRange && styles.activeRangeText,
            ]}>
              Custom
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Custom Range Modal */}
      <Modal
        visible={showCustomModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowCustomModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Custom Range</Text>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={applyCustomRange}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Apply</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.dateSection}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <DatePicker
                date={customStartDate}
                onDateChange={setCustomStartDate}
                theme={theme}
                mode="date"
              />
            </View>

            <View style={styles.dateSection}>
              <Text style={styles.dateLabel}>End Date</Text>
              <DatePicker
                date={customEndDate}
                onDateChange={setCustomEndDate}
                theme={theme}
                mode="date"
                minimumDate={customStartDate}
              />
            </View>

            <View style={styles.rangePreview}>
              <Text style={styles.previewLabel}>Selected Range</Text>
              <Text style={styles.previewText}>
                {Math.ceil(Math.abs(customEndDate - customStartDate) / (1000 * 60 * 60 * 24)) + 1} days
              </Text>
              <Text style={styles.previewDates}>
                {customStartDate.toLocaleDateString()} - {customEndDate.toLocaleDateString()}
              </Text>
            </View>

            {/* Quick Presets in Modal */}
            <View style={styles.quickPresets}>
              <Text style={styles.presetsTitle}>Quick Presets</Text>
              <View style={styles.presetsGrid}>
                {[
                  { label: 'Last 30 days', days: 30 },
                  { label: 'Last 60 days', days: 60 },
                  { label: 'Last 90 days', days: 90 },
                  { label: 'This year', days: Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24)) },
                ].map((preset, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.presetButton}
                    onPress={() => {
                      const endDate = new Date();
                      const startDate = new Date();
                      if (preset.label === 'This year') {
                        startDate.setMonth(0, 1);
                      } else {
                        startDate.setDate(endDate.getDate() - preset.days + 1);
                      }
                      setCustomStartDate(startDate);
                      setCustomEndDate(endDate);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={styles.presetButtonText}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Smart Recommendations */}
      {!loading && (
        <View style={styles.recommendations}>
          <Text style={styles.recommendationText}>
            💡 {getSmartRecommendation(selectedPeriod, isCustomRange)}
          </Text>
        </View>
      )}
    </View>
  );
};

// Smart recommendations based on selected timeframe
const getSmartRecommendation = (selectedPeriod, isCustomRange) => {
  if (isCustomRange) {
    return "Custom range selected - perfect for analyzing specific periods or events.";
  }

  const recommendations = {
    1: "Daily view - ideal for detailed analysis and pattern spotting.",
    7: "Weekly view - great for identifying weekly patterns and trends.",
    14: "2-week view - perfect balance of detail and trend visibility.",
    30: "Monthly view - excellent for spotting monthly cycles and habits.",
    60: "2-month view - ideal for comparing recent changes over time.",
    90: "Quarterly view - great for identifying seasonal patterns.",
    180: "6-month view - perfect for tracking long-term progress.",
    365: "Yearly view - excellent for annual reviews and major trend analysis."
  };

  return recommendations[selectedPeriod] || "Select a timeframe to see smart recommendations.";
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  title: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },

  currentSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  currentIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  currentInfo: {
    flex: 1,
  },

  currentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },

  currentDescription: {
    fontSize: 13,
    color: theme.colors.secondaryText,
    marginTop: 2,
  },

  rangeScroll: {
    marginBottom: 16,
  },

  rangeContainer: {
    paddingRight: 16,
  },

  rangeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 70,
    minHeight: 70,
  },

  activeRangeButton: {
    backgroundColor: theme.colors.systemBlue,
    shadowColor: theme.colors.systemBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  customRangeButton: {
    borderWidth: 2,
    borderColor: theme.colors.systemBlue,
    borderStyle: 'dashed',
  },

  rangeIcon: {
    fontSize: 16,
    marginBottom: 4,
  },

  rangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },

  activeRangeText: {
    color: '#FFFFFF',
  },

  recommendations: {
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 8,
    padding: 12,
  },

  recommendationText: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },

  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  modalButtonPrimary: {
    backgroundColor: theme.colors.systemBlue,
  },

  modalButtonText: {
    fontSize: 16,
    color: theme.colors.systemBlue,
  },

  modalButtonTextPrimary: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  modalContent: {
    flex: 1,
    padding: 16,
  },

  dateSection: {
    marginBottom: 24,
  },

  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },

  rangePreview: {
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },

  previewLabel: {
    fontSize: 14,
    color: theme.colors.secondaryText,
    marginBottom: 4,
  },

  previewText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },

  previewDates: {
    fontSize: 13,
    color: theme.colors.secondaryText,
  },

  quickPresets: {
    marginBottom: 24,
  },

  presetsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },

  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  presetButton: {
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },

  presetButtonText: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '500',
  },
});
