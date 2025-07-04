// EnergyTune - Local Storage Service
// Professional offline storage with sync capabilities

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyEntry, LocalStorageData, User } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { safeAsync } from '../utils/helpers';

class StorageService {
  // Entry Management
  async saveEntry(entry: DailyEntry): Promise<boolean> {
    const result = await safeAsync(async () => {
      const existing = await this.getEntries();
      const entries = existing || [];
      
      // Replace existing entry for the same date or add new one
      const existingIndex = entries.findIndex(e => e.date === entry.date);
      if (existingIndex >= 0) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }

      // Sort by date (newest first)
      entries.sort((a, b) => b.date.localeCompare(a.date));

      await AsyncStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(entries));
      return true;
    });

    return result.data || false;
  }

  async getEntries(): Promise<DailyEntry[] | null> {
    const result = await safeAsync(async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.entries);
      return stored ? JSON.parse(stored) : [];
    });

    return result.data;
  }

  async getEntry(date: string): Promise<DailyEntry | null> {
    const entries = await this.getEntries();
    if (!entries) return null;
    
    return entries.find(entry => entry.date === date) || null;
  }

  async deleteEntry(date: string): Promise<boolean> {
    const result = await safeAsync(async () => {
      const entries = await this.getEntries();
      if (!entries) return false;
      
      const filtered = entries.filter(entry => entry.date !== date);
      await AsyncStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(filtered));
      return true;
    });

    return result.data || false;
  }

  async clearAllEntries(): Promise<boolean> {
    const result = await safeAsync(async () => {
      await AsyncStorage.removeItem(STORAGE_KEYS.entries);
      return true;
    });

    return result.data || false;
  }

  // User Session Management
  async saveUserId(userId: string): Promise<boolean> {
    const result = await safeAsync(async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.userId, userId);
      return true;
    });

    return result.data || false;
  }

  async getUserId(): Promise<string | null> {
    const result = await safeAsync(async () => {
      return await AsyncStorage.getItem(STORAGE_KEYS.userId);
    });

    return result.data;
  }

  async clearUserId(): Promise<boolean> {
    const result = await safeAsync(async () => {
      await AsyncStorage.removeItem(STORAGE_KEYS.userId);
      return true;
    });

    return result.data || false;
  }

  // Sync Management
  async updateLastSync(): Promise<boolean> {
    const result = await safeAsync(async () => {
      const timestamp = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.lastSync, timestamp);
      return true;
    });

    return result.data || false;
  }

  async getLastSync(): Promise<string | null> {
    const result = await safeAsync(async () => {
      return await AsyncStorage.getItem(STORAGE_KEYS.lastSync);
    });

    return result.data;
  }

  // Preferences Management
  async savePreferences(preferences: Record<string, any>): Promise<boolean> {
    const result = await safeAsync(async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(preferences));
      return true;
    });

    return result.data || false;
  }

  async getPreferences(): Promise<Record<string, any> | null> {
    const result = await safeAsync(async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.preferences);
      return stored ? JSON.parse(stored) : {};
    });

    return result.data;
  }

  async setPreference(key: string, value: any): Promise<boolean> {
    const result = await safeAsync(async () => {
      const preferences = await this.getPreferences() || {};
      preferences[key] = value;
      await this.savePreferences(preferences);
      return true;
    });

    return result.data || false;
  }

  async getPreference(key: string, defaultValue?: any): Promise<any> {
    const preferences = await this.getPreferences();
    return preferences?.[key] ?? defaultValue;
  }

  // Onboarding Management
  async setOnboardingCompleted(): Promise<boolean> {
    const result = await safeAsync(async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.onboarding, 'true');
      return true;
    });

    return result.data || false;
  }

  async isOnboardingCompleted(): Promise<boolean> {
    const result = await safeAsync(async () => {
      const completed = await AsyncStorage.getItem(STORAGE_KEYS.onboarding);
      return completed === 'true';
    });

    return result.data || false;
  }

  // Data Export/Import
  async exportData(): Promise<LocalStorageData | null> {
    const result = await safeAsync(async () => {
      const entries = await this.getEntries() || [];
      const lastSync = await this.getLastSync() || '';
      const userId = await getUserId() || undefined;

      return {
        entries,
        lastSync,
        userId,
      } as LocalStorageData;
    });

    return result.data;
  }

  async importData(data: LocalStorageData): Promise<boolean> {
    const result = await safeAsync(async () => {
      if (data.entries) {
        await AsyncStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(data.entries));
      }
      
      if (data.lastSync) {
        await AsyncStorage.setItem(STORAGE_KEYS.lastSync, data.lastSync);
      }
      
      if (data.userId) {
        await AsyncStorage.setItem(STORAGE_KEYS.userId, data.userId);
      }

      return true;
    });

    return result.data || false;
  }

  // Utility Methods
  async getStorageSize(): Promise<number> {
    const result = await safeAsync(async () => {
      const keys = await AsyncStorage.getAllKeys();
      const energyTuneKeys = keys.filter(key => key.startsWith('energytune_'));
      
      let totalSize = 0;
      for (const key of energyTuneKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
      
      return totalSize;
    });

    return result.data || 0;
  }

  async clearAllData(): Promise<boolean> {
    const result = await safeAsync(async () => {
      const keys = await AsyncStorage.getAllKeys();
      const energyTuneKeys = keys.filter(key => key.startsWith('energytune_'));
      await AsyncStorage.multiRemove(energyTuneKeys);
      return true;
    });

    return result.data || false;
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    const result = await safeAsync(async () => {
      // Test write and read
      const testKey = 'energytune_health_check';
      const testValue = 'test';
      
      await AsyncStorage.setItem(testKey, testValue);
      const retrieved = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);
      
      return retrieved === testValue;
    });

    return result.data || false;
  }

  // Migration Support
  async migrateData(fromVersion: string, toVersion: string): Promise<boolean> {
    const result = await safeAsync(async () => {
      // Future migration logic can be added here
      console.log(`Migrating data from ${fromVersion} to ${toVersion}`);
      return true;
    });

    return result.data || false;
  }
}

// Export singleton instance
export const storage = new StorageService();

// Export convenient helper functions
export const saveEntry = (entry: DailyEntry) => storage.saveEntry(entry);
export const getEntries = () => storage.getEntries();
export const getEntry = (date: string) => storage.getEntry(date);
export const deleteEntry = (date: string) => storage.deleteEntry(date);
export const saveUserId = (userId: string) => storage.saveUserId(userId);
export const getUserId = () => storage.getUserId();
export const clearUserId = () => storage.clearUserId();
export const updateLastSync = () => storage.updateLastSync();
export const getLastSync = () => storage.getLastSync();
export const setOnboardingCompleted = () => storage.setOnboardingCompleted();
export const isOnboardingCompleted = () => storage.isOnboardingCompleted();
export const exportData = () => storage.exportData();
export const importData = (data: LocalStorageData) => storage.importData(data);

export default storage;
