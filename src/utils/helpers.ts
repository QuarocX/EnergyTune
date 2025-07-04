// EnergyTune - Helper Utilities
// Professional utility functions for data processing and validation

import { format, parseISO, isToday, isYesterday, subDays, startOfDay } from 'date-fns';
import { DailyEntry, TrendData, ValidationResult } from '../types';
import { DATE_FORMATS, VALIDATION_RULES } from './constants';

// Date Utilities
export const formatDate = (date: Date | string, formatType: keyof typeof DATE_FORMATS = 'display'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, DATE_FORMATS[formatType]);
};

export const getTodayString = (): string => {
  return format(new Date(), DATE_FORMATS.api);
};

export const getYesterdayString = (): string => {
  return format(subDays(new Date(), 1), DATE_FORMATS.api);
};

export const getDateLabel = (dateString: string): string => {
  const date = parseISO(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return formatDate(date, 'short');
};

export const getDaysAgo = (days: number): string => {
  return format(subDays(new Date(), days), DATE_FORMATS.api);
};

export const getDateRange = (days: number): string[] => {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(getDaysAgo(i));
  }
  return dates;
};

// Data Processing Utilities
export const calculateAverageEnergy = (entry: DailyEntry): number => {
  const { energyLevels } = entry;
  const values = [
    energyLevels.morning,
    energyLevels.afternoon,
    energyLevels.evening,
  ].filter((val): val is number => val !== undefined);
  
  if (values.length === 0) return 0;
  return Math.round((values.reduce((sum, val) => sum + val, 0) / values.length) * 10) / 10;
};

export const calculateAverageStress = (entry: DailyEntry): number => {
  const { stressLevels } = entry;
  const values = [
    stressLevels.morning,
    stressLevels.afternoon,
    stressLevels.evening,
  ].filter((val): val is number => val !== undefined);
  
  if (values.length === 0) return 0;
  return Math.round((values.reduce((sum, val) => sum + val, 0) / values.length) * 10) / 10;
};

export const processEntriesForTrends = (entries: DailyEntry[]): TrendData[] => {
  return entries
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(entry => ({
      date: entry.date,
      energy: calculateAverageEnergy(entry),
      stress: calculateAverageStress(entry),
      energyMorning: entry.energyLevels.morning,
      energyAfternoon: entry.energyLevels.afternoon,
      energyEvening: entry.energyLevels.evening,
      stressMorning: entry.stressLevels.morning,
      stressAfternoon: entry.stressLevels.afternoon,
      stressEvening: entry.stressLevels.evening,
    }));
};

// Validation Utilities
export const validateEnergyLevel = (value: number): boolean => {
  return value >= VALIDATION_RULES.energyRange.min && value <= VALIDATION_RULES.energyRange.max;
};

export const validateStressLevel = (value: number): boolean => {
  return value >= VALIDATION_RULES.stressRange.min && value <= VALIDATION_RULES.stressRange.max;
};

export const validateDailyEntry = (entry: Partial<DailyEntry>): ValidationResult => {
  const errors: string[] = [];

  // Required fields validation
  if (!entry.energyLevels || Object.keys(entry.energyLevels).length === 0) {
    errors.push('At least one energy level is required');
  }

  if (!entry.stressLevels || Object.keys(entry.stressLevels).length === 0) {
    errors.push('At least one stress level is required');
  }

  if (!entry.energySources?.day?.trim()) {
    errors.push('Energy sources are required');
  }

  if (!entry.stressSources?.day?.trim()) {
    errors.push('Stress sources are required');
  }

  // Energy levels validation
  if (entry.energyLevels) {
    Object.values(entry.energyLevels).forEach((level, index) => {
      if (level !== undefined && !validateEnergyLevel(level)) {
        errors.push(`Energy level ${index + 1} must be between 1 and 10`);
      }
    });
  }

  // Stress levels validation
  if (entry.stressLevels) {
    Object.values(entry.stressLevels).forEach((level, index) => {
      if (level !== undefined && !validateStressLevel(level)) {
        errors.push(`Stress level ${index + 1} must be between 1 and 10`);
      }
    });
  }

  // Text length validation
  if (entry.energySources?.day && entry.energySources.day.length > VALIDATION_RULES.maxSourceLength) {
    errors.push(`Energy sources must be less than ${VALIDATION_RULES.maxSourceLength} characters`);
  }

  if (entry.stressSources?.day && entry.stressSources.day.length > VALIDATION_RULES.maxSourceLength) {
    errors.push(`Stress sources must be less than ${VALIDATION_RULES.maxSourceLength} characters`);
  }

  if (entry.notes && entry.notes.length > VALIDATION_RULES.maxNotesLength) {
    errors.push(`Notes must be less than ${VALIDATION_RULES.maxNotesLength} characters`);
  }

  // Work context validation
  if (entry.workContext) {
    const { meetings, deepWorkHours, contextSwitches } = entry.workContext;
    
    if (meetings !== undefined && (meetings < 0 || meetings > VALIDATION_RULES.maxMeetings)) {
      errors.push(`Meetings must be between 0 and ${VALIDATION_RULES.maxMeetings}`);
    }

    if (deepWorkHours !== undefined && (deepWorkHours < 0 || deepWorkHours > VALIDATION_RULES.maxDeepWorkHours)) {
      errors.push(`Deep work hours must be between 0 and ${VALIDATION_RULES.maxDeepWorkHours}`);
    }

    if (contextSwitches !== undefined && (contextSwitches < 0 || contextSwitches > VALIDATION_RULES.maxContextSwitches)) {
      errors.push(`Context switches must be between 0 and ${VALIDATION_RULES.maxContextSwitches}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Text Processing Utilities
export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const sanitizeInput = (text: string): string => {
  return text.trim().replace(/\s+/g, ' ');
};

// Number Utilities
export const roundToDecimal = (num: number, decimals: number = 1): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// Array Utilities
export const groupBy = <T, K extends keyof any>(array: T[], key: (item: T) => K): Record<K, T[]> => {
  return array.reduce((result, item) => {
    const group = key(item);
    (result[group] = result[group] || []).push(item);
    return result;
  }, {} as Record<K, T[]>);
};

export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

// Object Utilities
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const isEmpty = (obj: any): boolean => {
  if (obj == null) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

// Performance Utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Error Handling Utilities
export const safeAsync = async <T>(
  fn: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};

export const retry = async <T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retry attempts exceeded');
};

export default {
  formatDate,
  getTodayString,
  getYesterdayString,
  getDateLabel,
  getDaysAgo,
  getDateRange,
  calculateAverageEnergy,
  calculateAverageStress,
  processEntriesForTrends,
  validateEnergyLevel,
  validateStressLevel,
  validateDailyEntry,
  capitalizeFirst,
  truncateText,
  sanitizeInput,
  roundToDecimal,
  clamp,
  groupBy,
  unique,
  deepClone,
  isEmpty,
  debounce,
  throttle,
  safeAsync,
  retry,
};
