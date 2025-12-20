import { useState, useEffect } from 'react';

/**
 * useAnalytics - Lightweight hook for analytics screen state management
 * Note: Actual data loading is handled by useTrendsData
 */
export const useAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = () => {
    // Placeholder for future refresh logic if needed
    // Currently, data refresh is handled by useTrendsData in AnalyticsScreen
  };

  return {
    loading,
    error,
    refresh,
  };
};
