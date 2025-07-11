import { useState, useEffect } from 'react';
import AnalyticsService from '../services/analytics';

export const useAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [energyPatternsLoading, setEnergyPatternsLoading] = useState(false);
  const [energyPatterns, setEnergyPatterns] = useState(null);
  const [stressInsights, setStressInsights] = useState(null);
  const [weeklyInsights, setWeeklyInsights] = useState(null);
  const [error, setError] = useState(null);
  const [energyTimeframe, setEnergyTimeframe] = useState(14);

  const loadAnalytics = async (customEnergyDays = null) => {
    try {
      setLoading(true);
      setError(null);

      const energyDays = customEnergyDays || energyTimeframe;

      // Load analytics with dynamic energy timeframe
      const [energy, stress, weekly] = await Promise.all([
        AnalyticsService.getEnergyPatterns(energyDays),
        AnalyticsService.getStressInsights(),
        AnalyticsService.getWeeklyInsights(),
      ]);

      setEnergyPatterns(energy);
      setStressInsights(stress);
      setWeeklyInsights(weekly);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const updateEnergyTimeframe = async (days) => {
    try {
      setEnergyPatternsLoading(true);
      setEnergyTimeframe(days);
      
      const energy = await AnalyticsService.getEnergyPatterns(days);
      setEnergyPatterns(energy);
    } catch (err) {
      console.error('Error updating energy timeframe:', err);
      setError('Failed to update energy patterns');
    } finally {
      setEnergyPatternsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const refresh = () => {
    loadAnalytics();
  };

  return {
    loading,
    energyPatternsLoading,
    error,
    energyPatterns,
    stressInsights,
    weeklyInsights,
    energyTimeframe,
    refresh: loadAnalytics,
    updateEnergyTimeframe,
  };
};
