import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../config/theme';
import { profile, common } from '../config/texts';
import { formatDisplayDate } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import StorageService from '../services/storage';

export const ProfileScreen = () => {
  const [dataStats, setDataStats] = useState({
    totalEntries: 0,
    firstEntry: null,
    lastEntry: null,
  });
  const [loading, setLoading] = useState(true);
  const [exportingJSON, setExportingJSON] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [importing, setImporting] = useState(false);

  // Load data stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadDataStats();
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
    try {
      setImporting(true);

      // Pick a document
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/csv', 'text/comma-separated-values'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
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
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            onPress: async () => {
              try {
                const finalResult = await StorageService.finalizeImport();
                Alert.alert(
                  profile.importSection.importSuccess(finalResult.importedCount),
                  `Total entries: ${finalResult.totalEntries}`
                );
                loadDataStats();
              } catch (error) {
                Alert.alert(profile.importSection.importError, error.message);
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

  const DataSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{profile.dataSection.title}</Text>
      
      <View style={styles.dataRow}>
        <Text style={styles.dataLabel}>{profile.dataSection.totalEntries}</Text>
        <Text style={styles.dataValue}>
          {loading ? common.loading : dataStats.totalEntries}
        </Text>
      </View>

      {dataStats.totalEntries > 0 && (
        <>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>{profile.dataSection.firstEntry}</Text>
            <Text style={styles.dataValue}>
              {formatDisplayDate(dataStats.firstEntry)}
            </Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>{profile.dataSection.lastEntry}</Text>
            <Text style={styles.dataValue}>
              {formatDisplayDate(dataStats.lastEntry)}
            </Text>
          </View>
        </>
      )}

      {dataStats.totalEntries === 0 && !loading && (
        <Text style={styles.noDataText}>{profile.dataSection.noData}</Text>
      )}
    </View>
  );

  const ExportSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{profile.exportSection.title}</Text>
      <Text style={styles.sectionDescription}>
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

  const ImportSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{profile.importSection.title}</Text>
      <Text style={styles.sectionDescription}>
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

  const AboutSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{profile.appSection.title}</Text>
      
      <View style={styles.dataRow}>
        <Text style={styles.dataLabel}>Version</Text>
        <Text style={styles.dataValue}>{profile.appSection.version}</Text>
      </View>
      
      <Text style={styles.aboutDescription}>
        {profile.appSection.description}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{profile.title}</Text>
        
        <DataSection />
        <ImportSection />
        <ExportSection />
        <AboutSection />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondaryBackground,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    ...theme.typography.largeTitle,
    color: theme.colors.label,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  section: {
    backgroundColor: theme.colors.primaryBackground,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.headline,
    color: theme.colors.label,
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    ...theme.typography.body,
    color: theme.colors.secondaryLabel,
    marginBottom: theme.spacing.md,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.separator,
  },
  dataLabel: {
    ...theme.typography.body,
    color: theme.colors.label,
  },
  dataValue: {
    ...theme.typography.body,
    color: theme.colors.secondaryLabel,
    fontWeight: '500',
  },
  noDataText: {
    ...theme.typography.body,
    color: theme.colors.tertiaryLabel,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
  exportButtons: {
    gap: theme.spacing.sm,
  },
  exportButton: {
    marginBottom: 0,
  },
  importButton: {
    marginBottom: 0,
  },
  aboutDescription: {
    ...theme.typography.body,
    color: theme.colors.secondaryLabel,
    marginTop: theme.spacing.sm,
    lineHeight: 20,
  },
});
