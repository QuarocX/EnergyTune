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
}

// Export a singleton instance
export default new AnalyticsService();
