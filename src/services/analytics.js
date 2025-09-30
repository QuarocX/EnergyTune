import StorageService from './storage';
import { getTodayString } from '../utils/helpers';

class AnalyticsService {
  // Helper to get last N days of entries with valid data
  async getRecentEntries(days = 14) {
    try {
      const allEntries = await StorageService.getAllEntries();
      console.log('AnalyticsService: Total entries in storage:', Object.keys(allEntries).length);
      const today = new Date();
      const recentEntries = [];

      for (let i = 0; i < days; i++) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateString = date.toISOString().split('T')[0];
        const entry = allEntries[dateString];
        
        console.log('Checking entry for date:', dateString, 'entry exists:', !!entry);
        
        if (entry) {
          console.log('Entry data:', entry);
          const isValid = this.hasValidData(entry);
          console.log('Entry is valid:', isValid);
          
          if (isValid) {
            recentEntries.push({ ...entry, date: dateString });
          }
        }
      }

      console.log('AnalyticsService: Found', recentEntries.length, 'valid entries in last', days, 'days');
      return recentEntries.reverse(); // Chronological order
    } catch (error) {
      console.error('Error getting recent entries:', error);
      return [];
    }
  }

  // Check if entry has meaningful data for analytics
  hasValidData(entry) {
    // More lenient validation - check if entry exists and has any data
    if (!entry) return false;
    
    const hasEnergyData = entry.energyLevels && Object.values(entry.energyLevels).some(val => val !== null && val !== undefined && val > 0);
    const hasStressData = entry.stressLevels && Object.values(entry.stressLevels).some(val => val !== null && val !== undefined && val > 0);
    const hasEnergySources = entry.energySources && entry.energySources.trim().length > 0;
    const hasStressSources = entry.stressSources && entry.stressSources.trim().length > 0;
    
    const isValid = hasEnergyData || hasStressData || hasEnergySources || hasStressSources;
    
    console.log('hasValidData check:', {
      entryDate: entry.date,
      energyLevels: entry.energyLevels,
      stressLevels: entry.stressLevels,
      energySources: entry.energySources,
      stressSources: entry.stressSources,
      hasEnergyData,
      hasStressData,
      hasEnergySources,
      hasStressSources,
      isValid
    });
    
    return isValid;
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
