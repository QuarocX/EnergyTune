import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayString } from '../utils/helpers';
import * as Sharing from 'expo-sharing';

const STORAGE_KEY = 'energytune_entries';

// Data structure for entries
const createEntry = (date = getTodayString()) => ({
  date,
  energyLevels: {
    morning: null,
    afternoon: null,
    evening: null,
  },
  stressLevels: {
    morning: null,
    afternoon: null,
    evening: null,
  },
  energySources: '',
  stressSources: '',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

class StorageService {
  async getAllEntries() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading entries:', error);
      return {};
    }
  }

  async getEntry(date) {
    try {
      const entries = await this.getAllEntries();
      return entries[date] || createEntry(date);
    } catch (error) {
      console.error('Error loading entry:', error);
      return createEntry(date);
    }
  }

  async saveEntry(date, entryData) {
    try {
      const entries = await this.getAllEntries();
      const existingEntry = entries[date] || createEntry(date);
      
      const updatedEntry = {
        ...existingEntry,
        ...entryData,
        updatedAt: new Date().toISOString(),
      };

      entries[date] = updatedEntry;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      
      return updatedEntry;
    } catch (error) {
      console.error('Error saving entry:', error);
      throw error;
    }
  }

  async updateEnergyLevel(date, period, value) {
    try {
      const entry = await this.getEntry(date);
      entry.energyLevels[period] = value;
      return await this.saveEntry(date, entry);
    } catch (error) {
      console.error('Error updating energy level:', error);
      throw error;
    }
  }

  async updateStressLevel(date, period, value) {
    try {
      const entry = await this.getEntry(date);
      entry.stressLevels[period] = value;
      return await this.saveEntry(date, entry);
    } catch (error) {
      console.error('Error updating stress level:', error);
      throw error;
    }
  }

  async updateEnergySources(date, sources) {
    try {
      const entry = await this.getEntry(date);
      entry.energySources = sources;
      return await this.saveEntry(date, entry);
    } catch (error) {
      console.error('Error updating energy sources:', error);
      throw error;
    }
  }

  async updateStressSources(date, sources) {
    try {
      const entry = await this.getEntry(date);
      entry.stressSources = sources;
      return await this.saveEntry(date, entry);
    } catch (error) {
      console.error('Error updating stress sources:', error);
      throw error;
    }
  }

  async getRecentEntries(days = 7) {
    try {
      const entries = await this.getAllEntries();
      const dates = Object.keys(entries)
        .sort((a, b) => new Date(b) - new Date(a))
        .slice(0, days);
      
      return dates.map(date => entries[date]);
    } catch (error) {
      console.error('Error loading recent entries:', error);
      return [];
    }
  }

  async clearAllData() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  async exportData(format = 'json') {
    try {
      const entries = await this.getAllEntries();
      
      if (!entries || typeof entries !== 'object') {
        throw new Error('Invalid data format in storage');
      }

      const entriesArray = Object.values(entries).filter(entry => 
        entry && entry.date && (
          entry.energyLevels || 
          entry.stressLevels || 
          entry.energySources || 
          entry.stressSources
        )
      );
      
      if (entriesArray.length === 0) {
        throw new Error('No valid entries found to export');
      }

      let exportData;
      let filename;
      let mimeType;

      switch (format) {
        case 'json':
          exportData = JSON.stringify(entriesArray, null, 2);
          filename = `energytune_export_${getTodayString()}.json`;
          mimeType = 'application/json';
          break;
        
        case 'csv':
          exportData = this.convertToCSV(entriesArray);
          filename = `energytune_export_${getTodayString()}.csv`;
          mimeType = 'text/csv';
          break;
        
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      // Validate export data
      if (!exportData || exportData.length === 0) {
        throw new Error('Export generated empty data');
      }

      return { data: exportData, filename, mimeType };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  convertToCSV(entries) {
    if (!entries || entries.length === 0) {
      throw new Error('No entries provided for CSV conversion');
    }

    const headers = [
      'Date', 'Morning Energy', 'Afternoon Energy', 'Evening Energy',
      'Morning Stress', 'Afternoon Stress', 'Evening Stress',
      'Energy Sources', 'Stress Sources', 'Notes'
    ];

    const rows = entries.map(entry => {
      if (!entry || !entry.date) {
        console.warn('Skipping invalid entry:', entry);
        return null;
      }

      return [
        entry.date,
        entry.energyLevels?.morning ?? '',
        entry.energyLevels?.afternoon ?? '',
        entry.energyLevels?.evening ?? '',
        entry.stressLevels?.morning ?? '',
        entry.stressLevels?.afternoon ?? '',
        entry.stressLevels?.evening ?? '',
        entry.energySources ?? '',
        entry.stressSources ?? '',
        entry.notes ?? ''
      ];
    }).filter(row => row !== null);

    if (rows.length === 0) {
      throw new Error('No valid rows to export to CSV');
    }

    return [headers, ...rows]
      .map(row => row.map(cell => {
        // Escape quotes and wrap in quotes if necessary
        const cellStr = String(cell || '');
        const needsQuotes = cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n');
        const escapedCell = cellStr.replace(/"/g, '""');
        return needsQuotes ? `"${escapedCell}"` : escapedCell;
      }).join(','))
      .join('\n');
  }

  async getDataStats() {
    try {
      const entries = await this.getAllEntries();
      
      if (!entries || typeof entries !== 'object') {
        return {
          totalEntries: 0,
          firstEntry: null,
          lastEntry: null,
        };
      }

      const entriesArray = Object.values(entries).filter(entry => 
        entry && entry.date
      );
      
      if (entriesArray.length === 0) {
        return {
          totalEntries: 0,
          firstEntry: null,
          lastEntry: null,
        };
      }

      const sortedDates = entriesArray
        .map(entry => entry.date)
        .filter(date => date) // Filter out null/undefined dates
        .sort();

      return {
        totalEntries: entriesArray.length,
        firstEntry: sortedDates[0] || null,
        lastEntry: sortedDates[sortedDates.length - 1] || null,
      };
    } catch (error) {
      console.error('Error getting data stats:', error);
      return {
        totalEntries: 0,
        firstEntry: null,
        lastEntry: null,
      };
    }
  }

  async importData(fileContent, format = 'json', mode = 'merge') {
    try {
      let importedEntries = [];

      // Parse the file content based on format
      switch (format.toLowerCase()) {
        case 'json':
          importedEntries = this.parseJSONImport(fileContent);
          break;
        case 'csv':
          importedEntries = this.parseCSVImport(fileContent);
          break;
        default:
          throw new Error(`Unsupported import format: ${format}`);
      }

      // Validate imported entries
      const validEntries = this.validateImportedEntries(importedEntries);
      
      if (validEntries.length === 0) {
        throw new Error('No valid entries found in the imported file');
      }

      // Store for preview (don't save yet)
      this._pendingImport = {
        entries: validEntries,
        mode,
      };

      // Get existing entries for conflict detection
      const existingEntries = await this.getAllEntries();
      const existingCount = Object.keys(existingEntries).length;

      return {
        success: true,
        importedCount: validEntries.length,
        totalEntries: mode === 'replace' ? validEntries.length : existingCount + validEntries.length,
        previewData: validEntries,
      };
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  async finalizeImport() {
    if (!this._pendingImport) {
      throw new Error('No pending import found');
    }

    try {
      const { entries: validEntries, mode } = this._pendingImport;
      
      // Get existing entries
      const existingEntries = await this.getAllEntries();
      let finalEntries = { ...existingEntries };

      // Handle import mode
      if (mode === 'replace') {
        finalEntries = {};
      }

      // Add imported entries
      let importedCount = 0;
      for (const entry of validEntries) {
        if (entry.date) {
          finalEntries[entry.date] = {
            ...createEntry(entry.date),
            ...entry,
            updatedAt: new Date().toISOString(),
          };
          importedCount++;
        }
      }

      // Save all entries
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finalEntries));

      // Clear pending import
      this._pendingImport = null;

      return {
        success: true,
        importedCount,
        totalEntries: Object.keys(finalEntries).length,
      };
    } catch (error) {
      console.error('Error finalizing import:', error);
      throw new Error(`Import finalization failed: ${error.message}`);
    }
  }

  parseJSONImport(fileContent) {
    try {
      const data = JSON.parse(fileContent);
      
      // Handle both array format and object format
      if (Array.isArray(data)) {
        return data;
      } else if (typeof data === 'object' && data !== null) {
        // If it's an object, convert to array of entries
        return Object.values(data);
      } else {
        throw new Error('Invalid JSON structure');
      }
    } catch (error) {
      throw new Error('Invalid JSON file format');
    }
  }

  parseCSVImport(fileContent) {
    try {
      const lines = fileContent.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const entries = [];

      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length < headers.length) continue;

        const entry = {
          date: values[0]?.trim(),
          energyLevels: {
            morning: this.parseNumber(values[1]),
            afternoon: this.parseNumber(values[2]),
            evening: this.parseNumber(values[3]),
          },
          stressLevels: {
            morning: this.parseNumber(values[4]),
            afternoon: this.parseNumber(values[5]),
            evening: this.parseNumber(values[6]),
          },
          energySources: values[7]?.trim() || '',
          stressSources: values[8]?.trim() || '',
          notes: values[9]?.trim() || '',
        };

        if (entry.date) {
          entries.push(entry);
        }
      }

      return entries;
    } catch (error) {
      throw new Error('Invalid CSV file format');
    }
  }

  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === '"' && inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else if (char === '"' && inQuotes) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current);
    return values;
  }

  parseNumber(value) {
    if (!value || value.trim() === '') return null;
    const num = parseInt(value.trim(), 10);
    return (num >= 1 && num <= 10) ? num : null;
  }

  validateImportedEntries(entries) {
    return entries.filter(entry => {
      // Must have a valid date
      if (!entry.date || typeof entry.date !== 'string') {
        return false;
      }

      // Date should be in YYYY-MM-DD format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(entry.date)) {
        return false;
      }

      // At least one piece of data should be present
      const hasEnergyData = entry.energyLevels && (
        entry.energyLevels.morning || 
        entry.energyLevels.afternoon || 
        entry.energyLevels.evening
      );
      
      const hasStressData = entry.stressLevels && (
        entry.stressLevels.morning || 
        entry.stressLevels.afternoon || 
        entry.stressLevels.evening
      );
      
      const hasSourceData = entry.energySources || entry.stressSources || entry.notes;

      return hasEnergyData || hasStressData || hasSourceData;
    });
  }
}

// Export a singleton instance
export default new StorageService();
