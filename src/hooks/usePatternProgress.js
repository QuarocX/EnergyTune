import { useMemo } from 'react';

/**
 * Simple hook to calculate pattern discovery progress
 * Returns days with sources and progress percentage
 */
export const usePatternProgress = (entries = []) => {
  const progress = useMemo(() => {
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return {
        daysWithSources: 0,
        totalDays: 0,
        progressPercentage: 0,
        daysRemaining: 10
      };
    }

    // Count unique days that have at least one source (stress or energy)
    const daysWithSources = entries.filter(entry => {
      if (!entry) return false;
      const hasStressSources = entry.stressSources && entry.stressSources.trim().length > 0;
      const hasEnergySources = entry.energySources && entry.energySources.trim().length > 0;
      return hasStressSources || hasEnergySources;
    }).length;

    const totalDays = entries.length;
    const targetDays = 10; // Target for reliable patterns
    const progressPercentage = Math.min(100, (daysWithSources / targetDays) * 100);
    const daysRemaining = Math.max(0, targetDays - daysWithSources);

    return {
      daysWithSources,
      totalDays,
      progressPercentage,
      daysRemaining,
      hasEnoughData: daysWithSources >= 7
    };
  }, [entries]);

  return progress;
};

