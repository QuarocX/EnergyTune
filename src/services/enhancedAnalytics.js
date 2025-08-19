/**
 * Enhanced Analytics Service
 * 
 * Provides advanced data processing and aggregation for the analytics screen.
 * Optimized for performance with <200ms response times even for large datasets.
 */

import AnalyticsService from './analytics';

class EnhancedAnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get cached data or compute new data with performance monitoring
   */
  async getCachedData(cacheKey, computeFunction) {
    const startTime = performance.now();
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`📊 Cache hit for ${cacheKey} (${(performance.now() - startTime).toFixed(1)}ms)`);
        return cached.data;
      }
    }

    const data = await computeFunction();
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    const duration = performance.now() - startTime;
    console.log(`📊 Computed ${cacheKey} in ${duration.toFixed(1)}ms`);
    
    if (duration > 200) {
      console.warn(`⚠️ Performance warning: ${cacheKey} took ${duration.toFixed(1)}ms (>200ms)`);
    }

    return data;
  }

  /**
   * Clear cache when data changes
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get aggregated data with smart sampling based on timeframe
   */
  async getAggregatedData(period, aggregationType = 'auto') {
    const cacheKey = `aggregated_${period}_${aggregationType}`;
    
    return this.getCachedData(cacheKey, async () => {
      const rawData = await AnalyticsService.getRecentEntries(period);
      
      if (!rawData || rawData.length === 0) {
        return [];
      }

      // Auto-determine aggregation based on data volume
      if (aggregationType === 'auto') {
        if (rawData.length <= 31) {
          aggregationType = 'none';
        } else if (rawData.length <= 90) {
          aggregationType = 'daily';
        } else if (rawData.length <= 365) {
          aggregationType = 'weekly';
        } else {
          aggregationType = 'monthly';
        }
      }

      switch (aggregationType) {
        case 'none':
          return this.processRawData(rawData);
        case 'daily':
          return this.aggregateByDay(rawData);
        case 'weekly':
          return this.aggregateByWeek(rawData);
        case 'monthly':
          return this.aggregateByMonth(rawData);
        default:
          return this.processRawData(rawData);
      }
    });
  }

  /**
   * Process raw data with basic transformations
   */
  processRawData(rawData) {
    return rawData.map(entry => {
      const energyValues = Object.values(entry.energyLevels || {})
        .filter(val => val !== null && val !== undefined);
      const stressValues = Object.values(entry.stressLevels || {})
        .filter(val => val !== null && val !== undefined);

      return {
        date: entry.date,
        energy: energyValues.length > 0 
          ? energyValues.reduce((sum, val) => sum + val, 0) / energyValues.length 
          : null,
        stress: stressValues.length > 0 
          ? stressValues.reduce((sum, val) => sum + val, 0) / stressValues.length 
          : null,
        energyLevels: entry.energyLevels,
        stressLevels: entry.stressLevels,
        energySources: this.processSources(entry.energySources),
        stressSources: this.processSources(entry.stressSources),
        originalEntry: entry,
        entriesCount: 1,
      };
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Aggregate data by day (for monthly+ views)
   */
  aggregateByDay(rawData) {
    const grouped = {};
    
    rawData.forEach(entry => {
      const date = new Date(entry.date);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!grouped[dayKey]) {
        grouped[dayKey] = {
          date: dayKey,
          energyValues: [],
          stressValues: [],
          entries: [],
          energySources: [],
          stressSources: [],
        };
      }
      
      // Collect all energy/stress values for the day
      const energyValues = Object.values(entry.energyLevels || {})
        .filter(val => val !== null && val !== undefined);
      const stressValues = Object.values(entry.stressLevels || {})
        .filter(val => val !== null && val !== undefined);

      grouped[dayKey].energyValues.push(...energyValues);
      grouped[dayKey].stressValues.push(...stressValues);
      grouped[dayKey].entries.push(entry);
      
      if (entry.energySources) {
        grouped[dayKey].energySources.push(...this.processSources(entry.energySources));
      }
      if (entry.stressSources) {
        grouped[dayKey].stressSources.push(...this.processSources(entry.stressSources));
      }
    });

    return Object.values(grouped).map(group => ({
      date: group.date,
      energy: group.energyValues.length > 0 
        ? group.energyValues.reduce((sum, val) => sum + val, 0) / group.energyValues.length 
        : null,
      stress: group.stressValues.length > 0 
        ? group.stressValues.reduce((sum, val) => sum + val, 0) / group.stressValues.length 
        : null,
      energySources: this.getTopSources(group.energySources, 5),
      stressSources: this.getTopSources(group.stressSources, 5),
      entriesCount: group.entries.length,
      originalEntries: group.entries,
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Aggregate data by week (for quarterly+ views)
   */
  aggregateByWeek(rawData) {
    const grouped = {};
    
    rawData.forEach(entry => {
      const date = new Date(entry.date);
      const weekStart = this.getWeekStart(date);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!grouped[weekKey]) {
        grouped[weekKey] = {
          date: weekKey,
          energyValues: [],
          stressValues: [],
          entries: [],
          energySources: [],
          stressSources: [],
        };
      }
      
      const energyValues = Object.values(entry.energyLevels || {})
        .filter(val => val !== null && val !== undefined);
      const stressValues = Object.values(entry.stressLevels || {})
        .filter(val => val !== null && val !== undefined);

      grouped[weekKey].energyValues.push(...energyValues);
      grouped[weekKey].stressValues.push(...stressValues);
      grouped[weekKey].entries.push(entry);
      
      if (entry.energySources) {
        grouped[weekKey].energySources.push(...this.processSources(entry.energySources));
      }
      if (entry.stressSources) {
        grouped[weekKey].stressSources.push(...this.processSources(entry.stressSources));
      }
    });

    return Object.values(grouped).map(group => ({
      date: group.date,
      energy: group.energyValues.length > 0 
        ? group.energyValues.reduce((sum, val) => sum + val, 0) / group.energyValues.length 
        : null,
      stress: group.stressValues.length > 0 
        ? group.stressValues.reduce((sum, val) => sum + val, 0) / group.stressValues.length 
        : null,
      energySources: this.getTopSources(group.energySources, 5),
      stressSources: this.getTopSources(group.stressSources, 5),
      entriesCount: group.entries.length,
      originalEntries: group.entries,
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Aggregate data by month (for yearly+ views)
   */
  aggregateByMonth(rawData) {
    const grouped = {};
    
    rawData.forEach(entry => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          date: monthKey,
          energyValues: [],
          stressValues: [],
          entries: [],
          energySources: [],
          stressSources: [],
        };
      }
      
      const energyValues = Object.values(entry.energyLevels || {})
        .filter(val => val !== null && val !== undefined);
      const stressValues = Object.values(entry.stressLevels || {})
        .filter(val => val !== null && val !== undefined);

      grouped[monthKey].energyValues.push(...energyValues);
      grouped[monthKey].stressValues.push(...stressValues);
      grouped[monthKey].entries.push(entry);
      
      if (entry.energySources) {
        grouped[monthKey].energySources.push(...this.processSources(entry.energySources));
      }
      if (entry.stressSources) {
        grouped[monthKey].stressSources.push(...this.processSources(entry.stressSources));
      }
    });

    return Object.values(grouped).map(group => ({
      date: group.date,
      energy: group.energyValues.length > 0 
        ? group.energyValues.reduce((sum, val) => sum + val, 0) / group.energyValues.length 
        : null,
      stress: group.stressValues.length > 0 
        ? group.stressValues.reduce((sum, val) => sum + val, 0) / group.stressValues.length 
        : null,
      energySources: this.getTopSources(group.energySources, 5),
      stressSources: this.getTopSources(group.stressSources, 5),
      entriesCount: group.entries.length,
      originalEntries: group.entries,
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Helper: Get start of week (Monday)
   */
  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  /**
   * Helper: Process sources into array format
   */
  processSources(sources) {
    if (!sources) return [];
    if (Array.isArray(sources)) return sources;
    
    return sources.split(/[,;.]/)
      .map(s => s.trim())
      .filter(s => s.length > 2);
  }

  /**
   * Helper: Get top N most frequent sources
   */
  getTopSources(sources, limit = 5) {
    const frequency = {};
    sources.forEach(source => {
      const key = source.toLowerCase();
      frequency[key] = (frequency[key] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([source]) => source);
  }

  /**
   * Get performance metrics for current data
   */
  async getPerformanceMetrics(period) {
    const startTime = performance.now();
    const data = await this.getAggregatedData(period);
    const processingTime = performance.now() - startTime;

    return {
      dataPoints: data.length,
      processingTime: processingTime.toFixed(1),
      cacheHits: Array.from(this.cache.keys()).length,
      performanceGrade: processingTime < 50 ? 'A' : processingTime < 100 ? 'B' : processingTime < 200 ? 'C' : 'D',
    };
  }

  /**
   * Get smart recommendations for chart optimization
   */
  getChartOptimizationRecommendations(dataLength, period) {
    const recommendations = [];

    if (dataLength > 100) {
      recommendations.push({
        type: 'performance',
        message: 'Large dataset detected - using optimized rendering',
        icon: '🚀',
      });
    }

    if (period > 180) {
      recommendations.push({
        type: 'aggregation',
        message: 'Data automatically aggregated for better readability',
        icon: '📊',
      });
    }

    if (dataLength < 7) {
      recommendations.push({
        type: 'data',
        message: 'More data points will improve trend analysis',
        icon: '📈',
      });
    }

    return recommendations;
  }

  /**
   * Export data for external analysis
   */
  async exportData(period, format = 'json') {
    const data = await this.getAggregatedData(period);
    
    switch (format) {
      case 'csv':
        return this.convertToCSV(data);
      case 'json':
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  /**
   * Helper: Convert data to CSV format
   */
  convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = ['Date', 'Energy', 'Stress', 'Entries Count', 'Energy Sources', 'Stress Sources'];
    const rows = data.map(item => [
      item.date,
      item.energy?.toFixed(2) || '',
      item.stress?.toFixed(2) || '',
      item.entriesCount || 1,
      item.energySources?.join('; ') || '',
      item.stressSources?.join('; ') || '',
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }
}

// Export singleton instance
export default new EnhancedAnalyticsService();
