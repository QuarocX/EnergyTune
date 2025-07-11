import React, { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { entry as entryTexts, common } from '../config/texts';
import StorageService from '../services/storage';

// This hook manages the entry data for a selected date
// It handles loading, saving, and updating energy/stress levels and sources
// It also provides debounced save functions to minimize storage writes

export const useEntryData = (selectedDate) => {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Debounced save functions
  const saveEnergySourcesDebounced = useRef(null);
  const saveStressSourcesDebounced = useRef(null);

  useEffect(() => {
    loadEntry();
  }, [selectedDate]);

  // Reload data when screen comes into focus (e.g., after import)
  useFocusEffect(
    React.useCallback(() => {
      loadEntry();
    }, [selectedDate])
  );

  useEffect(() => {
    // Create debounced functions
    const debounce = (func, delay) => {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
      };
    };

    saveEnergySourcesDebounced.current = debounce(async (text) => {
      try {
        await StorageService.updateEnergySources(selectedDate, text);
      } catch (error) {
        Alert.alert(common.error, entryTexts.alerts.saveEnergySourcesError);
      }
    }, 500);

    saveStressSourcesDebounced.current = debounce(async (text) => {
      try {
        await StorageService.updateStressSources(selectedDate, text);
      } catch (error) {
        Alert.alert(common.error, entryTexts.alerts.saveStressSourcesError);
      }
    }, 500);
  }, [selectedDate]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      const entryData = await StorageService.getEntry(selectedDate);
      setEntry(entryData);
    } catch (error) {
      console.error('Error loading entry:', error);
      Alert.alert(common.error, entryTexts.alerts.loadError);
    } finally {
      setLoading(false);
    }
  };

  const updateEnergyLevel = async (step, value) => {
    // Update state immediately for instant UI response
    const updatedEntry = {
      ...entry,
      energyLevels: {
        ...entry.energyLevels,
        [step]: value,
      },
    };
    setEntry(updatedEntry);
    
    // Handle storage operation asynchronously
    try {
      setSaving(true);
      await StorageService.updateEnergyLevel(selectedDate, step, value);
      return updatedEntry;
    } catch (error) {
      // Revert state on error
      setEntry(entry);
      Alert.alert('Error', 'Failed to save energy level');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateStressLevel = async (step, value) => {
    // Update state immediately for instant UI response
    const updatedEntry = {
      ...entry,
      stressLevels: {
        ...entry.stressLevels,
        [step]: value,
      },
    };
    setEntry(updatedEntry);
    
    // Handle storage operation asynchronously
    try {
      setSaving(true);
      await StorageService.updateStressLevel(selectedDate, step, value);
      return updatedEntry;
    } catch (error) {
      // Revert state on error
      setEntry(entry);
      Alert.alert('Error', 'Failed to save stress level');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateEnergySources = (text) => {
    setEntry(prev => ({
      ...prev,
      energySources: text,
    }));
    
    if (saveEnergySourcesDebounced.current) {
      saveEnergySourcesDebounced.current(text);
    }
  };

  const updateStressSources = (text) => {
    setEntry(prev => ({
      ...prev,
      stressSources: text,
    }));
    
    if (saveStressSourcesDebounced.current) {
      saveStressSourcesDebounced.current(text);
    }
  };

  const resetEntry = async () => {
    try {
      const freshEntry = {
        date: selectedDate,
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
      };
      
      await StorageService.saveEntry(selectedDate, freshEntry);
      setEntry(freshEntry);
      return freshEntry;
    } catch (error) {
      Alert.alert(common.error, entryTexts.alerts.resetError);
      throw error;
    }
  };

  return {
    entry,
    loading,
    saving,
    updateEnergyLevel,
    updateStressLevel,
    updateEnergySources,
    updateStressSources,
    resetEntry,
  };
};
