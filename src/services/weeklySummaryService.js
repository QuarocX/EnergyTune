import StorageService from './storage';
import HierarchicalPatternService from './hierarchicalPatternService';

/**
 * Weekly Summary Service - Generates simple, zen-like weekly summaries
 * Focuses on: Overall averages, best/worst days, top 3 energy sources & stressors
 */
class WeeklySummaryService {
  /**
   * Generate a weekly summary for a date range
   * @param {string} startDate - ISO date string (YYYY-MM-DD)
   * @param {string} endDate - ISO date string (YYYY-MM-DD)
   * @returns {Promise<Object>} Weekly summary data
   */
  async generateWeeklySummary(startDate, endDate) {
    try {
      console.log(`[WeeklySummary] Generating summary from ${startDate} to ${endDate}`);
      
      // Fetch all entries
      const allEntries = await StorageService.getAllEntries();
      
      // Filter entries within date range
      const weekEntries = Object.values(allEntries).filter(entry => {
        return entry.date >= startDate && entry.date <= endDate;
      }).sort((a, b) => new Date(a.date) - new Date(b.date));
      
      if (weekEntries.length === 0) {
        console.log('[WeeklySummary] No entries found for this week');
        return this.getEmptySummary(startDate, endDate);
      }
      
      console.log(`[WeeklySummary] Found ${weekEntries.length} entries for the week`);
      
      // Calculate core metrics
      const energyData = this.calculateEnergyMetrics(weekEntries);
      const stressData = this.calculateStressMetrics(weekEntries);
      const bestDay = this.findBestDay(weekEntries);
      const hardestDay = this.findHardestDay(weekEntries);
      const weekState = this.determineWeekState(energyData.average, stressData.average);
      
      // Analyze text sources (top 3 only for simplicity)
      const topEnergySources = await this.extractTopSources(weekEntries, 'energy', 3);
      const topStressors = await this.extractTopSources(weekEntries, 'stress', 3);
      
      const summary = {
        dateRange: { start: startDate, end: endDate },
        entriesCount: weekEntries.length,
        energy: energyData,
        stress: stressData,
        bestDay,
        hardestDay,
        weekState,
        topEnergySources,
        topStressors,
        generatedAt: new Date().toISOString(),
      };
      
      console.log('[WeeklySummary] Summary generated successfully');
      return summary;
    } catch (error) {
      console.error('[WeeklySummary] Error generating summary:', error);
      throw error;
    }
  }
  
  /**
   * Calculate energy metrics for the week
   */
  calculateEnergyMetrics(entries) {
    const allLevels = [];
    
    entries.forEach(entry => {
      if (entry.energyLevels) {
        ['morning', 'afternoon', 'evening'].forEach(period => {
          const value = entry.energyLevels[period];
          if (value !== null && value !== undefined && value > 0) {
            allLevels.push(value);
          }
        });
      }
    });
    
    if (allLevels.length === 0) {
      return { average: null, min: null, max: null, count: 0 };
    }
    
    const average = allLevels.reduce((sum, val) => sum + val, 0) / allLevels.length;
    const min = Math.min(...allLevels);
    const max = Math.max(...allLevels);
    
    return {
      average: Math.round(average * 10) / 10,
      min,
      max,
      count: allLevels.length,
    };
  }
  
  /**
   * Calculate stress metrics for the week
   */
  calculateStressMetrics(entries) {
    const allLevels = [];
    
    entries.forEach(entry => {
      if (entry.stressLevels) {
        ['morning', 'afternoon', 'evening'].forEach(period => {
          const value = entry.stressLevels[period];
          if (value !== null && value !== undefined && value > 0) {
            allLevels.push(value);
          }
        });
      }
    });
    
    if (allLevels.length === 0) {
      return { average: null, min: null, max: null, count: 0 };
    }
    
    const average = allLevels.reduce((sum, val) => sum + val, 0) / allLevels.length;
    const min = Math.min(...allLevels);
    const max = Math.max(...allLevels);
    
    return {
      average: Math.round(average * 10) / 10,
      min,
      max,
      count: allLevels.length,
    };
  }
  
  /**
   * Find the best day of the week (highest energy, lowest stress)
   */
  findBestDay(entries) {
    let bestDay = null;
    let bestScore = -Infinity;
    
    entries.forEach(entry => {
      const energyValues = Object.values(entry.energyLevels || {})
        .filter(v => v !== null && v !== undefined && v > 0);
      const stressValues = Object.values(entry.stressLevels || {})
        .filter(v => v !== null && v !== undefined && v > 0);
      
      if (energyValues.length === 0 && stressValues.length === 0) return;
      
      const energyAvg = energyValues.length > 0
        ? energyValues.reduce((sum, v) => sum + v, 0) / energyValues.length
        : 5;
      const stressAvg = stressValues.length > 0
        ? stressValues.reduce((sum, v) => sum + v, 0) / stressValues.length
        : 5;
      
      // Score = energy - stress (higher is better)
      const score = energyAvg - stressAvg;
      
      if (score > bestScore) {
        bestScore = score;
        bestDay = {
          date: entry.date,
          dayName: this.getDayName(entry.date),
          energy: Math.round(energyAvg * 10) / 10,
          stress: Math.round(stressAvg * 10) / 10,
          score: Math.round(score * 10) / 10,
          energySources: entry.energySources || '',
          stressSources: entry.stressSources || '',
        };
      }
    });
    
    return bestDay;
  }
  
  /**
   * Find the hardest day of the week (lowest energy, highest stress)
   */
  findHardestDay(entries) {
    let hardestDay = null;
    let worstScore = Infinity;
    
    entries.forEach(entry => {
      const energyValues = Object.values(entry.energyLevels || {})
        .filter(v => v !== null && v !== undefined && v > 0);
      const stressValues = Object.values(entry.stressLevels || {})
        .filter(v => v !== null && v !== undefined && v > 0);
      
      if (energyValues.length === 0 && stressValues.length === 0) return;
      
      const energyAvg = energyValues.length > 0
        ? energyValues.reduce((sum, v) => sum + v, 0) / energyValues.length
        : 5;
      const stressAvg = stressValues.length > 0
        ? stressValues.reduce((sum, v) => sum + v, 0) / stressValues.length
        : 5;
      
      // Score = energy - stress (lower is harder)
      const score = energyAvg - stressAvg;
      
      if (score < worstScore) {
        worstScore = score;
        hardestDay = {
          date: entry.date,
          dayName: this.getDayName(entry.date),
          energy: Math.round(energyAvg * 10) / 10,
          stress: Math.round(stressAvg * 10) / 10,
          score: Math.round(score * 10) / 10,
          energySources: entry.energySources || '',
          stressSources: entry.stressSources || '',
        };
      }
    });
    
    return hardestDay;
  }
  
  /**
   * Determine overall week state (emoji + description)
   */
  determineWeekState(energyAvg, stressAvg) {
    // No data case
    if (energyAvg === null || stressAvg === null) {
      return {
        emoji: '📊',
        label: 'Getting Started',
        description: 'Keep tracking to see patterns',
        color: '#8E8E93', // systemGray
      };
    }
    
    // Balanced (good energy, low stress)
    if (energyAvg >= 6.5 && stressAvg <= 4.5) {
      return {
        emoji: '😊',
        label: 'Balanced',
        description: 'Energy was good, stress was low',
        color: '#34C759', // systemGreen
      };
    }
    
    // Energized (high energy, any stress)
    if (energyAvg >= 7.5) {
      return {
        emoji: '⚡',
        label: 'Energized',
        description: 'High energy this week',
        color: '#FF9500', // systemOrange
      };
    }
    
    // Calm (low stress, any energy)
    if (stressAvg <= 3.5) {
      return {
        emoji: '🧘',
        label: 'Calm',
        description: 'Very low stress levels',
        color: '#5856D6', // systemPurple
      };
    }
    
    // Challenging (low energy, high stress)
    if (energyAvg < 5 && stressAvg > 6) {
      return {
        emoji: '😰',
        label: 'Challenging',
        description: 'Energy was low, stress was high',
        color: '#FF3B30', // systemRed
      };
    }
    
    // Tired (low energy)
    if (energyAvg < 5.5) {
      return {
        emoji: '😴',
        label: 'Tired',
        description: 'Energy was lower than usual',
        color: '#FF9500', // systemOrange
      };
    }
    
    // Stressed (high stress)
    if (stressAvg > 6.5) {
      return {
        emoji: '😓',
        label: 'Stressed',
        description: 'Stress was higher than usual',
        color: '#FF9500', // systemOrange
      };
    }
    
    // Neutral/Mixed
    return {
      emoji: '😐',
      label: 'Mixed',
      description: 'A mix of ups and downs',
      color: '#8E8E93', // systemGray
    };
  }
  
  /**
   * Extract top N energy sources or stressors using pattern analysis
   * @param {Array} entries - Week entries
   * @param {string} type - 'energy' or 'stress'
   * @param {number} limit - Number of top items to return (default 3)
   */
  async extractTopSources(entries, type, limit = 3) {
    try {
      // Use hierarchical pattern service to analyze
      const analysisType = type === 'energy' ? 'energy' : 'stress';
      const result = await HierarchicalPatternService.analyzeHierarchicalPatterns(
        entries,
        analysisType,
        null, // no abort function
        null  // no progress callback
      );
      
      if (!result || !result.mainPatterns || result.mainPatterns.length === 0) {
        return [];
      }
      
      // Extract top N patterns and simplify
      return result.mainPatterns
        .slice(0, limit)
        .map(pattern => ({
          label: pattern.label,
          emoji: pattern.emoji,
          count: pattern.frequency,
          percentage: pattern.percentage,
        }));
    } catch (error) {
      console.error(`[WeeklySummary] Error extracting ${type} sources:`, error);
      return [];
    }
  }
  
  /**
   * Get day name from date string
   */
  getDayName(dateString) {
    const date = new Date(dateString + 'T12:00:00'); // Noon to avoid timezone issues
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }
  
  /**
   * Get empty summary when no data exists
   */
  getEmptySummary(startDate, endDate) {
    return {
      dateRange: { start: startDate, end: endDate },
      entriesCount: 0,
      energy: { average: null, min: null, max: null, count: 0 },
      stress: { average: null, min: null, max: null, count: 0 },
      bestDay: null,
      hardestDay: null,
      weekState: this.determineWeekState(null, null),
      topEnergySources: [],
      topStressors: [],
      generatedAt: new Date().toISOString(),
    };
  }
  
  /**
   * Get the start and end dates for the most recent complete week
   * Week starts on Monday and ends on Sunday
   */
  getLastCompleteWeek() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate days to subtract to get to last Sunday
    // If today is Sunday (0), we want last Sunday (7 days ago)
    // If today is Monday (1), we want last Sunday (1 day ago)
    const daysToLastSunday = dayOfWeek === 0 ? 7 : dayOfWeek;
    
    // End date: Last Sunday
    const endDate = new Date(now);
    endDate.setDate(now.getDate() - daysToLastSunday);
    
    // Start date: Monday before that Sunday (6 days earlier)
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);
    
    return {
      start: this.formatDate(startDate),
      end: this.formatDate(endDate),
    };
  }
  
  /**
   * Format date as YYYY-MM-DD
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Get formatted date range string for display
   * e.g. "Dec 14 - 20, 2025"
   */
  getFormattedDateRange(startDate, endDate) {
    const start = new Date(startDate + 'T12:00:00');
    const end = new Date(endDate + 'T12:00:00');
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const startMonth = months[start.getMonth()];
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = end.getFullYear();
    
    // Same month
    if (start.getMonth() === end.getMonth()) {
      return `${startMonth} ${startDay}-${endDay}, ${year}`;
    }
    
    // Different months
    const endMonth = months[end.getMonth()];
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }
}

export default new WeeklySummaryService();

