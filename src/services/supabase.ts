// EnergyTune - Supabase Service Configuration
// Professional-grade database service with error handling and offline support

import { createClient, SupabaseClient, AuthError } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyEntry, User, ApiResponse } from '../types';
import { STORAGE_KEYS, API_CONFIG } from '../utils/constants';
import { safeAsync, retry } from '../utils/helpers';

// Supabase Configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const hasSupabaseCredentials = SUPABASE_URL && SUPABASE_ANON_KEY;

if (!hasSupabaseCredentials) {
  console.warn('⚠️ Supabase credentials not found. Running in offline mode.');
}

// Initialize Supabase client only if credentials are available
export const supabase: SupabaseClient | null = hasSupabaseCredentials 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'X-Client-Info': 'energytune-mobile',
        },
      },
    })
  : null;

// Database Service Class
class DatabaseService {
  private isOnline: boolean = false;

  constructor() {
    this.checkConnection();
  }

  // Connection Management
  private async checkConnection(): Promise<void> {
    if (!supabase) {
      this.isOnline = false;
      return;
    }

    try {
      const { error } = await supabase.from('daily_entries').select('count', { count: 'exact', head: true });
      this.isOnline = !error;
    } catch {
      this.isOnline = false;
    }
  }

  // Authentication Methods
  async signUp(email: string, password: string): Promise<ApiResponse<User>> {
    if (!supabase || !this.isOnline) {
      return { data: null, error: 'Offline - authentication not available', success: false };
    }

    const result = await safeAsync(async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Failed to create user');

      return {
        id: data.user.id,
        email: data.user.email || '',
        created_at: data.user.created_at,
        updated_at: data.user.updated_at || data.user.created_at,
      } as User;
    });

    return {
      data: result.data,
      error: result.error,
      success: result.data !== null,
    };
  }

  async signIn(email: string, password: string): Promise<ApiResponse<User>> {
    if (!this.isOnline) {
      return { data: null, error: 'Offline - authentication not available', success: false };
    }

    const result = await safeAsync(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Authentication failed');

      return {
        id: data.user.id,
        email: data.user.email || '',
        created_at: data.user.created_at,
        updated_at: data.user.updated_at || data.user.created_at,
      } as User;
    });

    return {
      data: result.data,
      error: result.error,
      success: result.data !== null,
    };
  }

  async signOut(): Promise<ApiResponse<null>> {
    if (!this.isOnline) {
      // Clear local session data
      await AsyncStorage.removeItem(STORAGE_KEYS.userId);
      return { data: null, error: null, success: true };
    }

    const result = await safeAsync(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      return null;
    });

    // Clear local data regardless
    await AsyncStorage.removeItem(STORAGE_KEYS.userId);

    return {
      data: result.data,
      error: result.error,
      success: result.error === null,
    };
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const result = await safeAsync(async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw new Error(error.message);
      if (!user) return null;

      return {
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at,
      } as User;
    });

    return {
      data: result.data,
      error: result.error,
      success: result.data !== null,
    };
  }

  // Daily Entry Methods
  async createEntry(entry: Omit<DailyEntry, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<DailyEntry>> {
    if (!this.isOnline) {
      // Store locally and sync later
      return this.storeEntryLocally(entry);
    }

    const result = await safeAsync(async () => {
      return retry(async () => {
        const { data, error } = await supabase
          .from('daily_entries')
          .insert([entry])
          .select()
          .single();

        if (error) throw new Error(error.message);
        return data as DailyEntry;
      }, API_CONFIG.retryAttempts, API_CONFIG.retryDelay);
    });

    // Also store locally for offline access
    if (result.data) {
      await this.storeEntryLocally(result.data);
    }

    return {
      data: result.data,
      error: result.error,
      success: result.data !== null,
    };
  }

  async updateEntry(id: string, updates: Partial<DailyEntry>): Promise<ApiResponse<DailyEntry>> {
    if (!this.isOnline) {
      return { data: null, error: 'Offline - updates will sync when online', success: false };
    }

    const result = await safeAsync(async () => {
      return retry(async () => {
        const { data, error } = await supabase
          .from('daily_entries')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw new Error(error.message);
        return data as DailyEntry;
      }, API_CONFIG.retryAttempts, API_CONFIG.retryDelay);
    });

    return {
      data: result.data,
      error: result.error,
      success: result.data !== null,
    };
  }

  async getEntries(userId: string, limit?: number): Promise<ApiResponse<DailyEntry[]>> {
    if (!this.isOnline) {
      return this.getEntriesLocally();
    }

    const result = await safeAsync(async () => {
      let query = supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw new Error(error.message);
      return data as DailyEntry[];
    });

    // Store locally for offline access
    if (result.data) {
      await this.storeEntriesLocally(result.data);
    }

    return {
      data: result.data,
      error: result.error,
      success: result.data !== null,
    };
  }

  async getEntry(userId: string, date: string): Promise<ApiResponse<DailyEntry>> {
    if (!this.isOnline) {
      return this.getEntryLocallyByDate(date);
    }

    const result = await safeAsync(async () => {
      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(error.message);
      }

      return data as DailyEntry | null;
    });

    return {
      data: result.data,
      error: result.error,
      success: result.error === null,
    };
  }

  // Local Storage Methods (for offline support)
  private async storeEntryLocally(entry: DailyEntry | Omit<DailyEntry, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<DailyEntry>> {
    try {
      const localEntries = await this.getEntriesLocally();
      const entries = localEntries.data || [];
      
      const entryWithDefaults = {
        ...entry,
        id: entry.id || `local_${Date.now()}`,
        created_at: entry.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as DailyEntry;

      // Replace existing entry for the same date or add new one
      const existingIndex = entries.findIndex(e => e.date === entryWithDefaults.date);
      if (existingIndex >= 0) {
        entries[existingIndex] = entryWithDefaults;
      } else {
        entries.push(entryWithDefaults);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(entries));
      
      return { data: entryWithDefaults, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to store locally', 
        success: false 
      };
    }
  }

  private async storeEntriesLocally(entries: DailyEntry[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(entries));
    } catch (error) {
      console.warn('Failed to store entries locally:', error);
    }
  }

  private async getEntriesLocally(): Promise<ApiResponse<DailyEntry[]>> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.entries);
      const entries = stored ? JSON.parse(stored) : [];
      return { data: entries, error: null, success: true };
    } catch (error) {
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Failed to load local entries', 
        success: false 
      };
    }
  }

  private async getEntryLocallyByDate(date: string): Promise<ApiResponse<DailyEntry>> {
    try {
      const localEntries = await this.getEntriesLocally();
      const entries = localEntries.data || [];
      const entry = entries.find(e => e.date === date);
      
      return { data: entry || null, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to load local entry', 
        success: false 
      };
    }
  }

  // Sync Methods
  async syncLocalEntries(userId: string): Promise<ApiResponse<number>> {
    if (!this.isOnline) {
      return { data: 0, error: 'Offline - cannot sync', success: false };
    }

    const result = await safeAsync(async () => {
      const localEntries = await this.getEntriesLocally();
      const entries = localEntries.data || [];
      
      // Filter entries that need syncing (those with local IDs)
      const localOnlyEntries = entries.filter(entry => 
        entry.id.startsWith('local_') || !entry.id
      );

      let syncedCount = 0;
      for (const entry of localOnlyEntries) {
        const { error } = await this.createEntry({
          ...entry,
          user_id: userId,
        });
        
        if (!error) {
          syncedCount++;
        }
      }

      // Update last sync timestamp
      await AsyncStorage.setItem(STORAGE_KEYS.lastSync, new Date().toISOString());
      
      return syncedCount;
    });

    return {
      data: result.data || 0,
      error: result.error,
      success: result.error === null,
    };
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await supabase.from('daily_entries').select('count', { count: 'exact', head: true });
      this.isOnline = !error;
      return this.isOnline;
    } catch {
      this.isOnline = false;
      return false;
    }
  }

  // Getters
  get connectionStatus(): boolean {
    return this.isOnline;
  }
}

// Export singleton instance
export const db = new DatabaseService();

// Export auth helpers
export const authHelpers = {
  onAuthStateChange: (callback: (user: User | null) => void) => {
    if (!supabase) {
      // Return a mock subscription for offline mode
      callback(null);
      return { 
        data: { 
          subscription: { 
            unsubscribe: () => {} 
          } 
        } 
      };
    }

    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email || '',
          created_at: session.user.created_at,
          updated_at: session.user.updated_at || session.user.created_at,
        });
      } else {
        callback(null);
      }
    });
  },
};

export default db;
