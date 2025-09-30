import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
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
import { formatDisplayDate, formatDisplayDateWithYear } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { AppearanceSelector } from '../components/ui/AppearanceSelector';
import StorageService from '../services/storage';

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
        <ImportSection />
        <ExportSection />
        <AboutSection />
      </ScrollView>
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
});
