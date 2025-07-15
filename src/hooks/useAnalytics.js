import { useState, useEffect } from 'react';
import AnalyticsService from '../services/analytics';

export const useAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [weeklyInsights, setWeeklyInsights] = useState(null);
  const [error, setError] = useState(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load analytics
      const weekly = await AnalyticsService.getWeeklyInsights();

      setWeeklyInsights(weekly);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
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
    error,
    weeklyInsights,
    refresh: loadAnalytics,
  };
};
