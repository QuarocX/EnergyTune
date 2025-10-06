import { useState, useEffect, useCallback, useRef } from 'react';
import EnhancedAnalyticsService from '../services/enhancedAnalytics';

export const useEnhancedAnalytics = (initialPeriod = 14) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState(initialPeriod);
  const [aggregationType, setAggregationType] = useState('auto');
  
  const loadingRef = useRef(false);
  const abortControllerRef = useRef(null);

  /**
   * Load data with performance monitoring and cancellation support
   */
  const loadData = useCallback(async (period, aggregation = 'auto', force = false) => {
    // Prevent concurrent loads
    if (loadingRef.current && !force) return;
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    loadingRef.current = true;
    
    try {
      setLoading(true);
      setError(null);

      const startTime = performance.now();
      
      // Load aggregated data
      const aggregatedData = await EnhancedAnalyticsService.getAggregatedData(period, aggregation);
      
      // Get performance metrics
      const metrics = await EnhancedAnalyticsService.getPerformanceMetrics(period);
      
      const totalTime = performance.now() - startTime;
      
      // Check if request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setData(aggregatedData);
      setPerformanceMetrics({
        ...metrics,
        totalTime: totalTime.toFixed(1),
      });
      
      // Log performance for debugging
      if (__DEV__) {
        console.log(`📊 Enhanced Analytics loaded: ${aggregatedData.length} points in ${totalTime.toFixed(1)}ms`);
      }
      
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error loading enhanced analytics:', err);
        setError(err.message || 'Failed to load analytics data');
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  }, []);

  /**
   * Update period with smart aggregation
   */
  const updatePeriod = useCallback(async (newPeriod) => {
    if (typeof newPeriod === 'object') {
      // Handle custom range
      setCurrentPeriod(newPeriod);
      await loadData(newPeriod.days, 'auto', true);
    } else if (newPeriod !== currentPeriod) {
      setCurrentPeriod(newPeriod);
      await loadData(newPeriod, aggregationType, true);
    }
  }, [currentPeriod, aggregationType, loadData]);

  /**
   * Update aggregation type
   */
  const updateAggregationType = useCallback(async (newAggregation) => {
    if (newAggregation !== aggregationType) {
      setAggregationType(newAggregation);
      await loadData(currentPeriod, newAggregation, true);
    }
  }, [aggregationType, currentPeriod, loadData]);

  /**
   * Refresh data and clear cache
   */
  const refresh = useCallback(async () => {
    EnhancedAnalyticsService.clearCache();
    await loadData(currentPeriod, aggregationType, true);
  }, [currentPeriod, aggregationType, loadData]);

  /**
   * Get chart optimization recommendations
   */
  const getOptimizationRecommendations = useCallback(() => {
    return EnhancedAnalyticsService.getChartOptimizationRecommendations(
      data.length, 
      typeof currentPeriod === 'object' ? currentPeriod.days : currentPeriod
    );
  }, [data.length, currentPeriod]);

  /**
   * Export data in specified format
   */
  const exportData = useCallback(async (format = 'json') => {
    try {
      const period = typeof currentPeriod === 'object' ? currentPeriod.days : currentPeriod;
      return await EnhancedAnalyticsService.exportData(period, format);
    } catch (err) {
      console.error('Error exporting data:', err);
      throw err;
    }
  }, [currentPeriod]);

  /**
   * Get data summary statistics
   */
  const getDataSummary = useCallback(() => {
    if (!data || data.length === 0) return null;

    const energyValues = data.filter(d => d.energy !== null).map(d => d.energy);
    const stressValues = data.filter(d => d.stress !== null).map(d => d.stress);

    const summary = {
      totalDataPoints: data.length,
      energyStats: energyValues.length > 0 ? {
        average: energyValues.reduce((sum, val) => sum + val, 0) / energyValues.length,
        min: Math.min(...energyValues),
        max: Math.max(...energyValues),
        trend: energyValues.length > 1 ? energyValues[energyValues.length - 1] - energyValues[0] : 0,
      } : null,
      stressStats: stressValues.length > 0 ? {
        average: stressValues.reduce((sum, val) => sum + val, 0) / stressValues.length,
        min: Math.min(...stressValues),
        max: Math.max(...stressValues),
        trend: stressValues.length > 1 ? stressValues[stressValues.length - 1] - stressValues[0] : 0,
      } : null,
      dateRange: {
        start: data[0]?.date,
        end: data[data.length - 1]?.date,
      },
      aggregation: aggregationType,
    };

    return summary;
  }, [data, aggregationType]);

  // Load initial data
  useEffect(() => {
    loadData(currentPeriod, aggregationType);
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData, currentPeriod, aggregationType]);

  return {
    // Data
    data,
    loading,
    error,
    performanceMetrics,
    
    // Configuration
    currentPeriod,
    aggregationType,
    
    // Actions
    updatePeriod,
    updateAggregationType,
    refresh,
    
    // Utilities
    getOptimizationRecommendations,
    exportData,
    getDataSummary,
    
    // Status
    isReady: !loading && !error && data.length > 0,
  };
};
