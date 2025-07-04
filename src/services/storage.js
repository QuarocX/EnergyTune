import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayString } from '../utils/helpers';

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
}

export default new StorageService();
