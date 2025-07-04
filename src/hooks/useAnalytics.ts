// EnergyTune - Analytics Hook
// Professional React hook for data insights and trend analysis

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DailyEntry, TrendData, EnergyInsight, TimeRange } from '../types';
import { db } from '../services/supabase';
import { storage, getUserId } from '../services/storage';
import { 
  processEntriesForTrends, 
  calculateAverageEnergy, 
  calculateAverageStress,
  getDateRange,
  groupBy,
} from '../utils/helpers';

interface UseAnalyticsState {
  entries: DailyEntry[];
  trendData: TrendData[];
  insights: EnergyInsight[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

interface UseAnalyticsActions {
  loadData: (timeRange?: TimeRange) => Promise<void>;
  refreshData: () => Promise<void>;
  generateInsights: () => void;
  getAverages: (timeRange?: TimeRange) => {
    energy: number;
    stress: number;
  };
  getTopSources: (type: 'energy' | 'stress', limit?: number) => string[];
  getPatterns: () => {
    bestDay: string;
    worstDay: string;
    energyPeak: string;
    stressPeak: string;
  };
  clearError: () => void;
}

export const useAnalytics = (
  initialTimeRange: TimeRange = '7d'
): UseAnalyticsState & UseAnalyticsActions => {
  const [state, setState] = useState<UseAnalyticsState>({
    entries: [],
    trendData: [],
    insights: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);

  // Load data for analytics
  const loadData = useCallback(async (newTimeRange?: TimeRange) => {
    const targetRange = newTimeRange || timeRange;
    setTimeRange(targetRange);

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const userId = await getUserId();
      let entries: DailyEntry[] = [];

      if (userId && userId !== 'anonymous') {
        // Try to load from server first
        const serverResult = await db.getEntries(userId);
        if (serverResult.success && serverResult.data) {
          entries = serverResult.data;
        } else {
          // Fallback to local storage
          const localEntries = await storage.getEntries();
          entries = localEntries || [];
        }
      } else {
        // Load from local storage only
        const localEntries = await storage.getEntries();
        entries = localEntries || [];
      }

      // Filter entries based on time range
      const days = targetRange === '7d' ? 7 : targetRange === '30d' ? 30 : 90;
      const dateFilter = getDateRange(days);
      const filteredEntries = entries.filter(entry => 
        dateFilter.includes(entry.date)
      );

      // Process data for trends
      const trends = processEntriesForTrends(filteredEntries);

      setState(prev => ({
        ...prev,
        entries: filteredEntries,
        trendData: trends,
        isLoading: false,
        lastUpdated: new Date().toISOString(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load analytics data',
      }));
    }
  }, [timeRange]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadData(timeRange);
  }, [loadData, timeRange]);

  // Generate insights based on current data
  const generateInsights = useCallback(() => {
    if (state.entries.length < 3) {
      setState(prev => ({ ...prev, insights: [] }));
      return;
    }

    const insights: EnergyInsight[] = [];
    const entries = state.entries;

    // Pattern Analysis
    const energyByDay = groupBy(entries, entry => {
      const date = new Date(entry.date);
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    });

    const dayAverages = Object.entries(energyByDay).map(([day, dayEntries]) => ({
      day,
      avgEnergy: dayEntries.reduce((sum, entry) => sum + calculateAverageEnergy(entry), 0) / dayEntries.length,
      avgStress: dayEntries.reduce((sum, entry) => sum + calculateAverageStress(entry), 0) / dayEntries.length,
    }));

    // Best and worst energy days
    const bestEnergyDay = dayAverages.reduce((best, current) => 
      current.avgEnergy > best.avgEnergy ? current : best
    );

    const worstEnergyDay = dayAverages.reduce((worst, current) => 
      current.avgEnergy < worst.avgEnergy ? current : worst
    );

    if (bestEnergyDay.avgEnergy - worstEnergyDay.avgEnergy > 1.5) {
      insights.push({
        type: 'pattern',
        title: 'Weekly Energy Pattern Detected',
        description: `Your energy is consistently highest on ${bestEnergyDay.day}s (${bestEnergyDay.avgEnergy.toFixed(1)}/10) and lowest on ${worstEnergyDay.day}s (${worstEnergyDay.avgEnergy.toFixed(1)}/10).`,
        confidence: 0.8,
        actionable: true,
        dateRange: {
          start: entries[entries.length - 1]?.date || '',
          end: entries[0]?.date || '',
        },
      });
    }

    // Energy trends
    const recentEntries = entries.slice(0, 3);
    const olderEntries = entries.slice(-3);
    
    if (recentEntries.length === 3 && olderEntries.length === 3) {
      const recentAvg = recentEntries.reduce((sum, entry) => sum + calculateAverageEnergy(entry), 0) / 3;
      const olderAvg = olderEntries.reduce((sum, entry) => sum + calculateAverageEnergy(entry), 0) / 3;
      
      if (recentAvg - olderAvg > 1) {
        insights.push({
          type: 'peak',
          title: 'Energy Improvement Trend',
          description: `Your average energy has increased by ${(recentAvg - olderAvg).toFixed(1)} points recently. Keep up the great work!`,
          confidence: 0.7,
          actionable: false,
          dateRange: {
            start: recentEntries[recentEntries.length - 1]?.date || '',
            end: recentEntries[0]?.date || '',
          },
        });
      } else if (olderAvg - recentAvg > 1) {
        insights.push({
          type: 'dip',
          title: 'Energy Decline Detected',
          description: `Your average energy has decreased by ${(olderAvg - recentAvg).toFixed(1)} points recently. Consider reviewing your recent stress sources.`,
          confidence: 0.7,
          actionable: true,
          dateRange: {
            start: recentEntries[recentEntries.length - 1]?.date || '',
            end: recentEntries[0]?.date || '',
          },
        });
      }
    }

    // Stress correlation
    const highStressEntries = entries.filter(entry => calculateAverageStress(entry) >= 7);
    const lowEnergyEntries = entries.filter(entry => calculateAverageEnergy(entry) <= 4);
    
    const correlationCount = highStressEntries.filter(stressEntry =>
      lowEnergyEntries.some(energyEntry => energyEntry.date === stressEntry.date)
    ).length;

    if (correlationCount >= Math.min(3, Math.floor(entries.length * 0.3))) {
      insights.push({
        type: 'trigger',
        title: 'Stress-Energy Correlation',
        description: `High stress days (7+/10) frequently coincide with low energy days (≤4/10). Managing stress might help maintain energy levels.`,
        confidence: 0.8,
        actionable: true,
        dateRange: {
          start: entries[entries.length - 1]?.date || '',
          end: entries[0]?.date || '',
        },
      });
    }

    // Peak performance recommendations
    const morningEntries = entries.filter(entry => entry.energyLevels.morning !== undefined);
    const afternoonEntries = entries.filter(entry => entry.energyLevels.afternoon !== undefined);
    const eveningEntries = entries.filter(entry => entry.energyLevels.evening !== undefined);

    const timeOfDayAverages = {
      morning: morningEntries.length > 0 ? morningEntries.reduce((sum, entry) => sum + (entry.energyLevels.morning || 0), 0) / morningEntries.length : 0,
      afternoon: afternoonEntries.length > 0 ? afternoonEntries.reduce((sum, entry) => sum + (entry.energyLevels.afternoon || 0), 0) / afternoonEntries.length : 0,
      evening: eveningEntries.length > 0 ? eveningEntries.reduce((sum, entry) => sum + (entry.energyLevels.evening || 0), 0) / eveningEntries.length : 0,
    };

    const peakTime = Object.entries(timeOfDayAverages).reduce((peak, [time, avg]) =>
      avg > peak.avg ? { time, avg } : peak
    , { time: 'morning', avg: 0 });

    if (peakTime.avg > 6.5) {
      insights.push({
        type: 'recommendation',
        title: `Peak Performance Window: ${peakTime.time}`,
        description: `Your energy is highest in the ${peakTime.time} (${peakTime.avg.toFixed(1)}/10 average). Schedule important tasks during this time.`,
        confidence: 0.9,
        actionable: true,
        dateRange: {
          start: entries[entries.length - 1]?.date || '',
          end: entries[0]?.date || '',
        },
      });
    }

    setState(prev => ({ ...prev, insights }));
  }, [state.entries]);

  // Calculate averages for current time range
  const getAverages = useCallback((targetRange?: TimeRange) => {
    const range = targetRange || timeRange;
    const relevantEntries = state.entries; // Already filtered by current timeRange
    
    if (relevantEntries.length === 0) {
      return { energy: 0, stress: 0 };
    }

    const totalEnergy = relevantEntries.reduce((sum, entry) => sum + calculateAverageEnergy(entry), 0);
    const totalStress = relevantEntries.reduce((sum, entry) => sum + calculateAverageStress(entry), 0);

    return {
      energy: Math.round((totalEnergy / relevantEntries.length) * 10) / 10,
      stress: Math.round((totalStress / relevantEntries.length) * 10) / 10,
    };
  }, [state.entries, timeRange]);

  // Get top energy/stress sources
  const getTopSources = useCallback((type: 'energy' | 'stress', limit: number = 5): string[] => {
    const sourceKey = type === 'energy' ? 'energySources' : 'stressSources';
    const allSources = state.entries
      .map(entry => entry[sourceKey]?.day || '')
      .filter(source => source.trim() !== '')
      .join(', ')
      .split(',')
      .map(source => source.trim().toLowerCase())
      .filter(source => source.length > 2);

    // Count frequency of sources
    const sourceCount = allSources.reduce((count, source) => {
      count[source] = (count[source] || 0) + 1;
      return count;
    }, {} as Record<string, number>);

    // Sort by frequency and return top sources
    return Object.entries(sourceCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([source]) => source);
  }, [state.entries]);

  // Get patterns and peaks
  const getPatterns = useCallback(() => {
    if (state.trendData.length === 0) {
      return {
        bestDay: '',
        worstDay: '',
        energyPeak: '',
        stressPeak: '',
      };
    }

    const sortedByEnergy = [...state.trendData].sort((a, b) => b.energy - a.energy);
    const sortedByStress = [...state.trendData].sort((a, b) => b.stress - a.stress);

    return {
      bestDay: sortedByEnergy[0]?.date || '',
      worstDay: sortedByEnergy[sortedByEnergy.length - 1]?.date || '',
      energyPeak: sortedByEnergy[0]?.date || '',
      stressPeak: sortedByStress[0]?.date || '',
    };
  }, [state.trendData]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Auto-generate insights when data changes
  useEffect(() => {
    if (state.entries.length > 0 && !state.isLoading) {
      generateInsights();
    }
  }, [state.entries, state.isLoading, generateInsights]);

  // Load initial data
  useEffect(() => {
    loadData(timeRange);
  }, []);

  // Memoized computed values
  const averages = useMemo(() => getAverages(), [getAverages]);
  const patterns = useMemo(() => getPatterns(), [getPatterns]);

  return {
    // State
    entries: state.entries,
    trendData: state.trendData,
    insights: state.insights,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,

    // Actions
    loadData,
    refreshData,
    generateInsights,
    getAverages,
    getTopSources,
    getPatterns,
    clearError,
  };
};

export default useAnalytics;
