import StorageService from './storage';
import { getTodayString } from '../utils/helpers';

class AnalyticsService {
  // Helper to get last N days of entries with valid data
  async getRecentEntries(days = 14) {
    try {
      const allEntries = await StorageService.getAllEntries();
      const today = new Date();
      const recentEntries = [];

      for (let i = 0; i < days; i++) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateString = date.toISOString().split('T')[0];
        const entry = allEntries[dateString];
        if (entry && this.hasValidData(entry)) {
          recentEntries.push({ ...entry, date: dateString });
        }
      }

      return recentEntries.reverse(); // Chronological order
    } catch (error) {
      console.error('Error getting recent entries:', error);
      return [];
    }
  }

  // Check if entry has meaningful data for analytics
  hasValidData(entry) {
    const hasEnergyData = Object.values(entry.energyLevels || {}).some(val => val !== null && val !== undefined);
    const hasStressData = Object.values(entry.stressLevels || {}).some(val => val !== null && val !== undefined);
    return hasEnergyData || hasStressData;
  }

  // Energy Patterns Analysis
  async getEnergyPatterns(days = 14) {
    const entries = await this.getRecentEntries(days);
    if (entries.length < 3) return null;

    const patterns = {
      averageEnergyByTime: { morning: 0, afternoon: 0, evening: 0 },
      peakEnergyTime: null,
      energyTrend: null,
      consistencyScore: 0,
    };

    let totals = { morning: [], afternoon: [], evening: [] };

    entries.forEach(entry => {
      Object.keys(entry.energyLevels).forEach(period => {
        const value = entry.energyLevels[period];
        if (value !== null && value !== undefined) {
          totals[period].push(value);
        }
      });
    });

    // Calculate averages
    Object.keys(totals).forEach(period => {
      if (totals[period].length > 0) {
        patterns.averageEnergyByTime[period] = 
          totals[period].reduce((sum, val) => sum + val, 0) / totals[period].length;
      }
    });

    // Find peak energy time
    const averages = patterns.averageEnergyByTime;
    patterns.peakEnergyTime = Object.keys(averages).reduce((a, b) => 
      averages[a] > averages[b] ? a : b
    );

    // Calculate trend (last half vs previous half of the period)
    if (entries.length >= Math.max(6, Math.floor(days / 2))) {
      const halfPeriod = Math.floor(entries.length / 2);
      const recent = entries.slice(-halfPeriod);
      const previous = entries.slice(0, halfPeriod);
      
      const recentAvg = this.calculateOverallEnergyAverage(recent);
      const previousAvg = this.calculateOverallEnergyAverage(previous);
      
      patterns.energyTrend = recentAvg > previousAvg ? 'improving' : 
                            recentAvg < previousAvg ? 'declining' : 'stable';
    }

    return patterns;
  }

  // Stress Source Intelligence
  async getStressInsights() {
    const entries = await this.getRecentEntries(14);
    if (entries.length < 3) return null;

    const insights = {
      averageStressByTime: { morning: 0, afternoon: 0, evening: 0 },
      highStressDays: [],
      commonStressSources: [],
      stressEnergyCorrelation: null,
    };

    let totals = { morning: [], afternoon: [], evening: [] };
    let stressSourcesText = '';

    entries.forEach(entry => {
      // Collect stress levels
      Object.keys(entry.stressLevels).forEach(period => {
        const value = entry.stressLevels[period];
        if (value !== null && value !== undefined) {
          totals[period].push(value);
        }
      });

      // Collect stress sources
      if (entry.stressSources) {
        stressSourcesText += ' ' + entry.stressSources.toLowerCase();
      }

      // Identify high stress days
      const dayStressAvg = Object.values(entry.stressLevels)
        .filter(val => val !== null && val !== undefined)
        .reduce((sum, val, _, arr) => sum + val / arr.length, 0);
      
      if (dayStressAvg >= 7) {
        insights.highStressDays.push(entry.date);
      }
    });

    // Calculate averages
    Object.keys(totals).forEach(period => {
      if (totals[period].length > 0) {
        insights.averageStressByTime[period] = 
          totals[period].reduce((sum, val) => sum + val, 0) / totals[period].length;
      }
    });

    // Extract common stress sources (simple keyword frequency)
    insights.commonStressSources = this.extractCommonKeywords(stressSourcesText);

    return insights;
  }

  // Weekly Performance Insights
  async getWeeklyInsights() {
    const entries = await this.getRecentEntries(7);
    if (entries.length < 3) return null;

    const insights = {
      weeklyEnergyAverage: 0,
      weeklyStressAverage: 0,
      bestDay: null,
      challengingDay: null,
      patterns: [],
    };

    let dailyScores = [];

    entries.forEach(entry => {
      const energyValues = Object.values(entry.energyLevels)
        .filter(val => val !== null && val !== undefined);
      const stressValues = Object.values(entry.stressLevels)
        .filter(val => val !== null && val !== undefined);

      if (energyValues.length > 0 || stressValues.length > 0) {
        const energyAvg = energyValues.length > 0 ? 
          energyValues.reduce((sum, val) => sum + val, 0) / energyValues.length : 5;
        const stressAvg = stressValues.length > 0 ? 
          stressValues.reduce((sum, val) => sum + val, 0) / stressValues.length : 5;

        // Overall day score (high energy, low stress = good day)
        const dayScore = energyAvg - (stressAvg * 0.5);

        dailyScores.push({
          date: entry.date,
          energyAvg,
          stressAvg,
          dayScore,
          dayName: this.getDayName(entry.date),
        });
      }
    });

    if (dailyScores.length > 0) {
      insights.weeklyEnergyAverage = 
        dailyScores.reduce((sum, day) => sum + day.energyAvg, 0) / dailyScores.length;
      insights.weeklyStressAverage = 
        dailyScores.reduce((sum, day) => sum + day.stressAvg, 0) / dailyScores.length;

      // Find best and challenging days
      dailyScores.sort((a, b) => b.dayScore - a.dayScore);
      insights.bestDay = dailyScores[0];
      insights.challengingDay = dailyScores[dailyScores.length - 1];
    }

    return insights;
  }

  // Helper methods
  getDayName(dateString) {
    try {
      const date = new Date(dateString);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    } catch {
      return 'Unknown';
    }
  }

  calculateOverallEnergyAverage(entries) {
    let totalEnergy = 0;
    let count = 0;

    entries.forEach(entry => {
      Object.values(entry.energyLevels).forEach(value => {
        if (value !== null && value !== undefined) {
          totalEnergy += value;
          count++;
        }
      });
    });

    return count > 0 ? totalEnergy / count : 0;
  }

  extractCommonKeywords(text) {
    if (!text || text.trim().length === 0) return [];

    // Common stress-related keywords to look for
    const keywords = [
      'deadline', 'pressure', 'meeting', 'email', 'work', 'boss',
      'family', 'money', 'health', 'sleep', 'traffic', 'technical',
      'conflict', 'overwhelmed', 'tired', 'anxious', 'rushed'
    ];

    const found = [];
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        found.push(keyword);
      }
    });

    return found.slice(0, 3); // Return top 3
  }
}

// Export a singleton instance
export default new AnalyticsService();
