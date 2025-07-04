// EnergyTune - Entry Management Hook
// Professional React hook for daily entry operations

import { useState, useEffect, useCallback } from 'react';
import { DailyEntry, ApiResponse } from '../types';
import { db } from '../services/supabase';
import { storage, getUserId } from '../services/storage';
import { getTodayString, validateDailyEntry } from '../utils/helpers';

interface UseEntryState {
  entry: DailyEntry | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
}

interface UseEntryActions {
  loadEntry: (date?: string) => Promise<void>;
  saveEntry: (entryData: Partial<DailyEntry>) => Promise<boolean>;
  updateEntry: (updates: Partial<DailyEntry>) => void;
  deleteEntry: (date?: string) => Promise<boolean>;
  refreshEntry: () => Promise<void>;
  clearError: () => void;
}

export const useEntry = (initialDate?: string): UseEntryState & UseEntryActions => {
  const [state, setState] = useState<UseEntryState>({
    entry: null,
    isLoading: false,
    isSaving: false,
    error: null,
    hasUnsavedChanges: false,
  });

  const [currentDate, setCurrentDate] = useState(initialDate || getTodayString());

  // Load entry for a specific date
  const loadEntry = useCallback(async (date?: string) => {
    const targetDate = date || currentDate;
    setCurrentDate(targetDate);

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const userId = await getUserId();
      let result: ApiResponse<DailyEntry>;

      if (userId) {
        // Try to load from server first, then fallback to local
        result = await db.getEntry(userId, targetDate);
        if (!result.success || !result.data) {
          const localEntry = await storage.getEntry(targetDate);
          result = {
            data: localEntry,
            error: null,
            success: localEntry !== null,
          };
        }
      } else {
        // Load from local storage only
        const localEntry = await storage.getEntry(targetDate);
        result = {
          data: localEntry,
          error: null,
          success: localEntry !== null,
        };
      }

      setState(prev => ({
        ...prev,
        entry: result.data,
        isLoading: false,
        error: result.error,
        hasUnsavedChanges: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load entry',
      }));
    }
  }, [currentDate]);

  // Save entry (create or update)
  const saveEntry = useCallback(async (entryData: Partial<DailyEntry>): Promise<boolean> => {
    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      const userId = await getUserId();
      
      // Create complete entry object
      const completeEntry: DailyEntry = {
        id: state.entry?.id || `local_${Date.now()}`,
        user_id: userId || 'anonymous',
        date: currentDate,
        energyLevels: entryData.energyLevels || { morning: 5 },
        stressLevels: entryData.stressLevels || { morning: 5 },
        energySources: entryData.energySources || { day: '' },
        stressSources: entryData.stressSources || { day: '' },
        workContext: entryData.workContext,
        lifeContext: entryData.lifeContext,
        notes: entryData.notes,
        created_at: state.entry?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...entryData,
      };

      // Validate entry
      const validation = validateDailyEntry(completeEntry);
      if (!validation.isValid) {
        setState(prev => ({
          ...prev,
          isSaving: false,
          error: validation.errors.join(', '),
        }));
        return false;
      }

      // Save to local storage first (for offline support)
      const localSaved = await storage.saveEntry(completeEntry);
      
      // Try to save to server if online and authenticated
      let serverResult: ApiResponse<DailyEntry> = { data: null, error: null, success: true };
      if (userId && userId !== 'anonymous') {
        if (state.entry?.id && !state.entry.id.startsWith('local_')) {
          // Update existing server entry
          serverResult = await db.updateEntry(state.entry.id, entryData);
        } else {
          // Create new server entry
          const entryForServer = { ...completeEntry };
          delete entryForServer.id; // Let server generate ID
          serverResult = await db.createEntry(entryForServer);
        }
      }

      if (localSaved) {
        setState(prev => ({
          ...prev,
          entry: serverResult.data || completeEntry,
          isSaving: false,
          hasUnsavedChanges: false,
          error: serverResult.error,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isSaving: false,
          error: 'Failed to save entry locally',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Failed to save entry',
      }));
      return false;
    }
  }, [currentDate, state.entry]);

  // Update entry locally (without saving)
  const updateEntry = useCallback((updates: Partial<DailyEntry>) => {
    setState(prev => ({
      ...prev,
      entry: prev.entry ? { ...prev.entry, ...updates } : null,
      hasUnsavedChanges: true,
    }));
  }, []);

  // Delete entry
  const deleteEntry = useCallback(async (date?: string): Promise<boolean> => {
    const targetDate = date || currentDate;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Delete from local storage
      const localDeleted = await storage.deleteEntry(targetDate);
      
      // Delete from server if authenticated
      const userId = await getUserId();
      if (userId && state.entry?.id && !state.entry.id.startsWith('local_')) {
        // Server deletion would need to be implemented in the database service
        // For now, we'll just mark it as deleted locally
      }

      if (localDeleted) {
        setState(prev => ({
          ...prev,
          entry: null,
          isLoading: false,
          hasUnsavedChanges: false,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to delete entry',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete entry',
      }));
      return false;
    }
  }, [currentDate, state.entry]);

  // Refresh entry from server
  const refreshEntry = useCallback(async () => {
    await loadEntry(currentDate);
  }, [loadEntry, currentDate]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load entry on mount and when date changes
  useEffect(() => {
    loadEntry(currentDate);
  }, [currentDate]);

  return {
    // State
    entry: state.entry,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    error: state.error,
    hasUnsavedChanges: state.hasUnsavedChanges,
    
    // Actions
    loadEntry,
    saveEntry,
    updateEntry,
    deleteEntry,
    refreshEntry,
    clearError,
  };
};

export default useEntry;
