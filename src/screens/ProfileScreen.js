import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  Pressable,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../config/theme';
import { profile, common } from '../config/texts';
import { formatDisplayDate, formatDisplayDateWithYear, hapticFeedback } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { AppearanceSelector } from '../components/ui/AppearanceSelector';
import { PeriodTimeSetting } from '../components/ui/PeriodTimeSetting';
import StorageService from '../services/storage';
import NotificationService from '../services/notificationService';

export const ProfileScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const [dataStats, setDataStats] = useState({
    totalEntries: 0,
    firstEntry: null,
    lastEntry: null,
  });
  const [loading, setLoading] = useState(true);
  const [exportingJSON, setExportingJSON] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showRemoveWarning, setShowRemoveWarning] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [notifSettings, setNotifSettings] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('undetermined');
  const [weeklySummarySettings, setWeeklySummarySettings] = useState(null);

  // Load data stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadDataStats();
      loadNotificationSettings();
      loadWeeklySummarySettings();
    }, [])
  );

  const loadDataStats = async () => {
    try {
      setLoading(true);
      const stats = await StorageService.getDataStats();
      setDataStats(stats);
    } catch (error) {
      console.error('Error loading data stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    if (dataStats.totalEntries === 0) {
      Alert.alert(
        profile.exportSection.exportError,
        profile.exportSection.noDataToExport
      );
      return;
    }

    const setLoadingState = format === 'json' ? setExportingJSON : setExportingCSV;

    try {
      setLoadingState(true);
      
      const { data, filename, mimeType } = await StorageService.exportData(format);
      
      // Create temporary file
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, data, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Check if sharing is available
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing is not available on this device');
      }

      // Share the file
      await Sharing.shareAsync(fileUri, {
        mimeType,
        dialogTitle: profile.exportSection.title,
      });

      // Clean up the temporary file after a short delay
      setTimeout(async () => {
        try {
          await FileSystem.deleteAsync(fileUri, { idempotent: true });
        } catch (cleanupError) {
          console.warn('Failed to clean up temporary file:', cleanupError);
        }
      }, 1000);

    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        profile.exportSection.exportError,
        error.message || 'An error occurred while exporting'
      );
    } finally {
      setLoadingState(false);
    }
  };

  const handleImport = async () => {
    // Prevent multiple concurrent imports
    if (importing) {
      return;
    }

    try {
      setImporting(true);

      // Pick a document
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/csv', 'text/comma-separated-values'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setImporting(false);
        return;
      }

      const file = result.assets[0];
      if (!file) {
        Alert.alert(
          profile.importSection.importError,
          profile.importSection.noFileSelected
        );
        return;
      }

      // Read file content
      const fileContent = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Determine format from file extension or mime type
      let format = 'json';
      if (file.name.endsWith('.csv') || file.mimeType?.includes('csv')) {
        format = 'csv';
      }

      // Parse and validate the import (preview mode)
      const previewResult = await StorageService.importData(fileContent, format, 'merge');
      const existingStats = await StorageService.getDataStats();
      
      // Calculate conflicts
      const importedDates = previewResult.previewData.map(entry => entry.date);
      const existingEntries = await StorageService.getAllEntries();
      const conflictDates = importedDates.filter(date => existingEntries[date]).length;
      const newDates = importedDates.length - conflictDates;

      // Show confirmation with details
      Alert.alert(
        'Confirm Import',
        `Import ${previewResult.importedCount} entries?\n\n` +
        `• ${conflictDates} will overwrite existing entries\n` +
        `• ${newDates} new entries will be added\n` +
        `• Your ${existingStats.totalEntries} existing entries will be preserved`,
        [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => setImporting(false)
          },
          {
            text: 'Import',
            onPress: async () => {
              try {
                setImporting(true); // Keep loading state during finalization
                const finalResult = await StorageService.finalizeImport();
                Alert.alert(
                  profile.importSection.importSuccess(finalResult.importedCount),
                  `Total entries: ${finalResult.totalEntries}`
                );
                loadDataStats();
              } catch (error) {
                Alert.alert(profile.importSection.importError, error.message);
              } finally {
                setImporting(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert(
        profile.importSection.importError,
        error.message || 'An error occurred while importing'
      );
    } finally {
      setImporting(false);
    }
  };

  const handleRemoveAllData = async () => {
    if (dataStats.totalEntries === 0) {
      Alert.alert(
        profile.removeDataSection.removeError,
        profile.removeDataSection.noDataToRemove
      );
      return;
    }

    await hapticFeedback();
    setShowRemoveWarning(true);
  };

  const confirmRemoveAllData = async () => {
    try {
      setRemoving(true);
      await StorageService.clearAllData();
      setShowRemoveWarning(false);
      await loadDataStats();
      Alert.alert(
        profile.removeDataSection.removeSuccess,
        'All your entries have been permanently deleted.'
      );
    } catch (error) {
      console.error('Remove data error:', error);
      Alert.alert(
        profile.removeDataSection.removeError,
        error.message || 'An error occurred while removing data'
      );
    } finally {
      setRemoving(false);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const settings = await StorageService.getNotificationSettings();
      setNotifSettings(settings);
      
      const status = await NotificationService.getPermissionStatus();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const loadWeeklySummarySettings = async () => {
    try {
      const settings = await StorageService.getWeeklySummarySettings();
      setWeeklySummarySettings(settings);
    } catch (error) {
      console.error('Error loading weekly summary settings:', error);
    }
  };

  const handleEnableToggle = async (value) => {
    try {
      if (value) {
        // Request permissions when enabling
        const granted = await NotificationService.requestPermissions();
        if (!granted) {
          Alert.alert(
            'Permissions Required',
            'Please enable notifications in your device settings to use this feature.'
          );
          return;
        }
        setPermissionStatus('granted');
      }

      const updatedSettings = { ...notifSettings, enabled: value };
      setNotifSettings(updatedSettings);
      await StorageService.saveNotificationSettings(updatedSettings);

      // Schedule or cancel notifications
      if (value) {
        await NotificationService.scheduleAllReminders(updatedSettings);
      } else {
        await NotificationService.cancelAllNotifications();
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const handlePeriodToggle = async (period, value) => {
    try {
      const updatedSettings = {
        ...notifSettings,
        periods: {
          ...notifSettings.periods,
          [period]: {
            ...notifSettings.periods[period],
            enabled: value,
          },
        },
      };
      setNotifSettings(updatedSettings);
      await StorageService.saveNotificationSettings(updatedSettings);

      // Reschedule notifications
      if (notifSettings.enabled) {
        await NotificationService.scheduleAllReminders(updatedSettings);
      }
    } catch (error) {
      console.error('Error updating period setting:', error);
    }
  };

  const handleTimeChange = async (period, time) => {
    try {
      const updatedSettings = {
        ...notifSettings,
        periods: {
          ...notifSettings.periods,
          [period]: {
            ...notifSettings.periods[period],
            time: time,
          },
        },
      };
      setNotifSettings(updatedSettings);
      await StorageService.saveNotificationSettings(updatedSettings);

      // Reschedule notifications
      if (notifSettings.enabled) {
        await NotificationService.scheduleAllReminders(updatedSettings);
      }
    } catch (error) {
      console.error('Error updating time:', error);
    }
  };

  // Weekly Summary handlers
  const handleWeeklySummaryToggle = async (value) => {
    try {
      // Request permissions if enabling
      if (value) {
        const hasPermission = await NotificationService.requestPermissions();
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive weekly summaries.'
          );
          return;
        }
        setPermissionStatus('granted');
      }

      const updatedSettings = { ...weeklySummarySettings, enabled: value };
      setWeeklySummarySettings(updatedSettings);
      await StorageService.saveWeeklySummarySettings(updatedSettings);

      // Schedule or cancel weekly notification
      if (value) {
        await NotificationService.scheduleWeeklySummaryNotification(updatedSettings);
      } else {
        await NotificationService.cancelWeeklySummaryNotification();
      }
    } catch (error) {
      console.error('Error toggling weekly summary:', error);
      Alert.alert('Error', 'Failed to update weekly summary setting');
    }
  };

  const handleWeeklySummaryDayChange = async (day) => {
    try {
      const updatedSettings = { ...weeklySummarySettings, day };
      setWeeklySummarySettings(updatedSettings);
      await StorageService.saveWeeklySummarySettings(updatedSettings);

      // Reschedule if enabled
      if (weeklySummarySettings.enabled) {
        await NotificationService.scheduleWeeklySummaryNotification(updatedSettings);
      }
    } catch (error) {
      console.error('Error updating weekly summary day:', error);
    }
  };

  const handleWeeklySummaryTimeChange = async (time) => {
    try {
      const updatedSettings = { ...weeklySummarySettings, time };
      setWeeklySummarySettings(updatedSettings);
      await StorageService.saveWeeklySummarySettings(updatedSettings);

      // Reschedule if enabled
      if (weeklySummarySettings.enabled) {
        await NotificationService.scheduleWeeklySummaryNotification(updatedSettings);
      }
    } catch (error) {
      console.error('Error updating weekly summary time:', error);
    }
  };

  const handleViewLastSummary = () => {
    navigation.navigate('WeeklySummary');
  };

  const handleTestWeeklySummary = async () => {
    try {
      await hapticFeedback('light');
      await NotificationService.scheduleTestWeeklySummary(5);
      Alert.alert(
        'Test Scheduled',
        'You will receive a test weekly summary notification in 5 seconds.'
      );
    } catch (error) {
      console.error('Error scheduling test notification:', error);
      Alert.alert('Error', 'Failed to schedule test notification');
    }
  };


  const DataSection = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.primaryBackground }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.label }]}>{profile.dataSection.title}</Text>
      
      <View style={[styles.dataRow, { borderBottomColor: theme.colors.separator }]}>
        <Text style={[styles.dataLabel, { color: theme.colors.label }]}>{profile.dataSection.totalEntries}</Text>
        <Text style={[styles.dataValue, { color: theme.colors.secondaryLabel }]}>
          {loading ? common.loading : dataStats.totalEntries}
        </Text>
      </View>

      {dataStats.totalEntries > 0 && (
        <>
          <View style={[styles.dataRow, { borderBottomColor: theme.colors.separator }]}>
            <Text style={[styles.dataLabel, { color: theme.colors.label }]}>{profile.dataSection.firstEntry}</Text>
            <Text style={[styles.dataValue, { color: theme.colors.secondaryLabel }]}>
              {formatDisplayDateWithYear(dataStats.firstEntry)}
            </Text>
          </View>

          <View style={[styles.dataRow, { borderBottomColor: theme.colors.separator }]}>
            <Text style={[styles.dataLabel, { color: theme.colors.label }]}>{profile.dataSection.lastEntry}</Text>
            <Text style={[styles.dataValue, { color: theme.colors.secondaryLabel }]}>
              {formatDisplayDateWithYear(dataStats.lastEntry)}
            </Text>
          </View>
        </>
      )}

      {dataStats.totalEntries === 0 && !loading && (
        <Text style={[styles.noDataText, { color: theme.colors.tertiaryLabel }]}>{profile.dataSection.noData}</Text>
      )}
    </View>
  );

  const AppearanceSection = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.primaryBackground }]}>
      <AppearanceSelector />
    </View>
  );

  const ExportSection = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.primaryBackground }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.label }]}>{profile.exportSection.title}</Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.secondaryLabel }]}>
        {profile.exportSection.description}
      </Text>
      
      <View style={styles.exportButtons}>
        <Button
          title={profile.exportSection.exportJSON}
          variant="secondary"
          size="medium"
          onPress={() => handleExport('json')}
          disabled={exportingJSON || exportingCSV || dataStats.totalEntries === 0}
          loading={exportingJSON}
          style={styles.exportButton}
        />
        
        <Button
          title={profile.exportSection.exportCSV}
          variant="secondary"
          size="medium"
          onPress={() => handleExport('csv')}
          disabled={exportingJSON || exportingCSV || dataStats.totalEntries === 0}
          loading={exportingCSV}
          style={styles.exportButton}
        />
      </View>
    </View>
  );

  const NotificationsSection = () => {
    if (!notifSettings) {
      return null;
    }

    return (
      <View style={[styles.section, { backgroundColor: theme.colors.primaryBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.label }]}>
          Daily Reminders
        </Text>
        <Text style={[styles.sectionDescription, { color: theme.colors.secondaryLabel }]}>
          Get notified to check in throughout the day
        </Text>

        {/* Master Toggle */}
        <View style={[styles.settingRow, { borderBottomColor: theme.colors.separator }]}>
          <Text style={[styles.settingLabel, { color: theme.colors.label }]}>
            Enable Reminders
          </Text>
          <Switch
            value={notifSettings.enabled}
            onValueChange={handleEnableToggle}
            trackColor={{ 
              false: theme.colors.systemGray4, 
              true: Platform.OS === 'ios' ? undefined : '#34C759'
            }}
            thumbColor={Platform.OS === 'ios' ? undefined : (notifSettings.enabled ? '#FFFFFF' : theme.colors.systemGray3)}
          />
        </View>

        {/* Conditional: Show time pickers when enabled */}
        {notifSettings.enabled && (
          <>
            {/* Morning */}
            <PeriodTimeSetting
              label="Morning"
              enabled={notifSettings.periods.morning.enabled}
              time={notifSettings.periods.morning.time}
              onToggle={(val) => handlePeriodToggle('morning', val)}
              onTimeChange={(time) => handleTimeChange('morning', time)}
              theme={theme}
            />

            {/* Afternoon */}
            <PeriodTimeSetting
              label="Afternoon"
              enabled={notifSettings.periods.afternoon.enabled}
              time={notifSettings.periods.afternoon.time}
              onToggle={(val) => handlePeriodToggle('afternoon', val)}
              onTimeChange={(time) => handleTimeChange('afternoon', time)}
              theme={theme}
            />

            {/* Evening */}
            <PeriodTimeSetting
              label="Evening"
              enabled={notifSettings.periods.evening.enabled}
              time={notifSettings.periods.evening.time}
              onToggle={(val) => handlePeriodToggle('evening', val)}
              onTimeChange={(time) => handleTimeChange('evening', time)}
              theme={theme}
            />

            {/* Info text */}
            <Text style={[styles.infoText, { color: theme.colors.tertiaryLabel }]}>
              Tap notification actions to quickly log Low (3), Medium (6), or High (8). 
              Refine values in the app anytime.
            </Text>
          </>
        )}

        {/* Permission warning if denied */}
        {permissionStatus === 'denied' && (
          <View style={[styles.warningBox, { backgroundColor: theme.colors.systemOrange + '15' }]}>
            <Ionicons name="warning-outline" size={20} color={theme.colors.systemOrange} />
            <Text style={[styles.warningText, { color: theme.colors.systemOrange }]}>
              Notifications are disabled in Settings. Enable them to receive reminders.
            </Text>
          </View>
        )}
      </View>
    );
  };

  const WeeklySummarySection = () => {
    if (!weeklySummarySettings) {
      return null;
    }

    return (
      <View style={[styles.section, { backgroundColor: theme.colors.primaryBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.label }]}>
          {profile.weeklySummarySection.title}
        </Text>
        <Text style={[styles.sectionDescription, { color: theme.colors.secondaryLabel }]}>
          {profile.weeklySummarySection.description}
        </Text>

        {/* Enable/Disable Toggle */}
        <View style={[styles.settingRow, { borderBottomColor: theme.colors.separator }]}>
          <Text style={[styles.settingLabel, { color: theme.colors.label }]}>
            {profile.weeklySummarySection.enableToggle}
          </Text>
          <Switch
            value={weeklySummarySettings.enabled}
            onValueChange={handleWeeklySummaryToggle}
            trackColor={{ 
              false: theme.colors.systemGray4, 
              true: Platform.OS === 'ios' ? undefined : '#34C759'
            }}
            thumbColor={Platform.OS === 'ios' ? undefined : (weeklySummarySettings.enabled ? '#FFFFFF' : theme.colors.systemGray3)}
          />
        </View>

        {/* Conditional: Show settings when enabled */}
        {weeklySummarySettings.enabled && (
          <>
            {/* Day of Week Picker */}
            <View style={[styles.settingRow, { borderBottomColor: theme.colors.separator }]}>
              <Text style={[styles.settingLabel, { color: theme.colors.label }]}>
                {profile.weeklySummarySection.dayLabel}
              </Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => {
                  Alert.alert(
                    profile.weeklySummarySection.dayLabel,
                    'Select which day to receive your weekly summary',
                    Object.keys(profile.weeklySummarySection.days).map(dayNum => ({
                      text: profile.weeklySummarySection.days[dayNum],
                      onPress: () => handleWeeklySummaryDayChange(parseInt(dayNum)),
                      style: parseInt(dayNum) === weeklySummarySettings.day ? 'destructive' : 'default',
                    })).concat([{ text: 'Cancel', style: 'cancel' }])
                  );
                }}
              >
                <Text style={[styles.pickerButtonText, { color: theme.colors.systemBlue }]}>
                  {profile.weeklySummarySection.days[weeklySummarySettings.day]}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Time Picker */}
            <PeriodTimeSetting
              label={profile.weeklySummarySection.timeLabel}
              enabled={true}
              time={weeklySummarySettings.time}
              onToggle={() => {}}
              onTimeChange={handleWeeklySummaryTimeChange}
              theme={theme}
              hideToggle={true}
            />

            {/* View Last Summary Button */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.systemBlue }]}
              onPress={handleViewLastSummary}
            >
              <Text style={styles.actionButtonText}>
                {profile.weeklySummarySection.viewLastSummary}
              </Text>
            </TouchableOpacity>

            {/* Test Notification Button */}
            <TouchableOpacity
              style={[styles.actionButton, { 
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: theme.colors.systemBlue,
              }]}
              onPress={handleTestWeeklySummary}
            >
              <Text style={[styles.actionButtonText, { color: theme.colors.systemBlue }]}>
                {profile.weeklySummarySection.testNotification}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Permission warning if denied */}
        {permissionStatus === 'denied' && (
          <View style={[styles.warningBox, { backgroundColor: theme.colors.systemOrange + '15' }]}>
            <Ionicons name="warning-outline" size={20} color={theme.colors.systemOrange} />
            <Text style={[styles.warningText, { color: theme.colors.systemOrange }]}>
              Notifications are disabled in Settings. Enable them to receive weekly summaries.
            </Text>
          </View>
        )}
      </View>
    );
  };

  const ImportSection = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.primaryBackground }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.label }]}>{profile.importSection.title}</Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.secondaryLabel }]}>
        {profile.importSection.description}
      </Text>
      
      <Button
        title={profile.importSection.importFile}
        variant="secondary"
        size="medium"
        onPress={handleImport}
        disabled={importing}
        loading={importing}
        style={styles.importButton}
      />
    </View>
  );

  const RemoveDataSection = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.primaryBackground }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.label }]}>{profile.removeDataSection.title}</Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.secondaryLabel }]}>
        {profile.removeDataSection.description}
      </Text>
      
      <TouchableOpacity
        style={[
          styles.removeButton,
          {
            borderColor: theme.colors.systemRed,
            opacity: (removing || dataStats.totalEntries === 0) ? 0.4 : 1,
          }
        ]}
        onPress={handleRemoveAllData}
        disabled={removing || dataStats.totalEntries === 0}
        activeOpacity={0.8}
      >
        <Text style={[styles.removeButtonText, { color: theme.colors.systemRed }]}>
          {profile.removeDataSection.removeButton}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const AboutSection = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.primaryBackground }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.label }]}>{profile.appSection.title}</Text>
      
      <View style={[styles.dataRow, { borderBottomColor: theme.colors.separator }]}>
        <Text style={[styles.dataLabel, { color: theme.colors.label }]}>Version</Text>
        <Text style={[styles.dataValue, { color: theme.colors.secondaryLabel }]}>{profile.appSection.version}</Text>
      </View>
      
      <Text style={[styles.aboutDescription, { color: theme.colors.secondaryLabel }]}>
        {profile.appSection.description}
      </Text>
    </View>
  );

  const WarningModal = () => (
    <Modal
      visible={showRemoveWarning}
      transparent={true}
      animationType="fade"
      onRequestClose={() => !removing && setShowRemoveWarning(false)}
    >
      <Pressable
        style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
        onPress={() => !removing && setShowRemoveWarning(false)}
      >
        <Pressable
          style={[styles.modalContent, { backgroundColor: theme.colors.primaryBackground }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <View style={[styles.warningIconContainer, { backgroundColor: `${theme.colors.systemRed}15` }]}>
              <Ionicons name="warning" size={32} color={theme.colors.systemRed} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.colors.label }]}>
              {profile.removeDataSection.warningTitle}
            </Text>
          </View>
          
          <Text style={[styles.modalMessage, { color: theme.colors.secondaryLabel }]}>
            {profile.removeDataSection.warningMessage}
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel, { 
                borderColor: theme.colors.separator,
                backgroundColor: theme.colors.secondaryBackground 
              }]}
              onPress={() => setShowRemoveWarning(false)}
              disabled={removing}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.label }]}>
                {profile.removeDataSection.cancelButton}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonDelete, { 
                backgroundColor: theme.colors.systemRed,
                opacity: removing ? 0.6 : 1 
              }]}
              onPress={confirmRemoveAllData}
              disabled={removing}
            >
              {removing ? (
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  {profile.removeDataSection.removing}
                </Text>
              ) : (
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  {profile.removeDataSection.confirmButton}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.secondaryBackground }]}>
      {/* Modal Header */}
      <View style={[styles.modalHeader, { 
        backgroundColor: theme.colors.primaryBackground,
        borderBottomColor: theme.colors.separator 
      }]}>
        <View style={[styles.dragHandle, { backgroundColor: theme.colors.systemGray3 }]} />
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.colors.label }]}>{profile.title}</Text>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={theme.colors.label} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <DataSection />
        <AppearanceSection />
        <NotificationsSection />
        <WeeklySummarySection />
        <ImportSection />
        <ExportSection />
        <RemoveDataSection />
        <AboutSection />
      </ScrollView>
      
      <WarningModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalHeader: {
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
    flex: 1,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 12,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dataLabel: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
  },
  dataValue: {
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 22,
  },
  noDataText: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
    textAlign: 'center',
    paddingVertical: 24,
  },
  exportButtons: {
    gap: 8,
  },
  exportButton: {
    marginBottom: 0,
  },
  importButton: {
    marginBottom: 0,
  },
  aboutDescription: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
    marginTop: 8,
  },
  removeButton: {
    marginTop: 8,
    marginBottom: 0,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  removeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  warningIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    borderWidth: 1,
  },
  modalButtonDelete: {
    // Red background handled inline
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
  },
  pickerButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  pickerButtonText: {
    fontSize: 17,
    fontWeight: '500',
  },
  actionButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },
});
