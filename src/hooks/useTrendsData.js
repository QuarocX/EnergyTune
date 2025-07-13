import { useState, useEffect, useCallback } from 'react';
import AnalyticsService from '../services/analytics';

export const useTrendsData = (initialPeriod = 14) => {
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [dataSources, setDataSources] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState(initialPeriod);

  const loadTrendsData = useCallback(async (period) => {
    try {
      setLoading(true);
      setError(null);

      // Get raw data from analytics service
      const entries = await AnalyticsService.getRecentEntries(period);
      
      if (!entries || entries.length === 0) {
        setTrendsData([]);
        setInsights(null);
        setDataSources(null);
        return;
      }

      // Transform data for charts
      const chartData = entries.map(entry => {
        const energyValues = Object.values(entry.energyLevels || {})
          .filter(val => val !== null && val !== undefined);
        const stressValues = Object.values(entry.stressLevels || {})
          .filter(val => val !== null && val !== undefined);

        const energyAvg = energyValues.length > 0 
          ? energyValues.reduce((sum, val) => sum + val, 0) / energyValues.length 
          : null;
        const stressAvg = stressValues.length > 0 
          ? stressValues.reduce((sum, val) => sum + val, 0) / stressValues.length 
          : null;

        return {
          date: entry.date,
          energy: energyAvg,
          stress: stressAvg,
          energyLevels: entry.energyLevels,
          stressLevels: entry.stressLevels,
          energySources: entry.energySources,
          stressSources: entry.stressSources,
        };
      });

      setTrendsData(chartData);

      // Generate insights
      const generatedInsights = await generateInsights(chartData, period);
      setInsights(generatedInsights);

      // Process data sources
      const processedSources = processDataSources(entries);
      setDataSources(processedSources);

    } catch (err) {
      console.error('Error loading trends data:', err);
      setError(err.message || 'Failed to load trends data');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePeriod = useCallback(async (newPeriod) => {
    if (newPeriod !== currentPeriod) {
      setCurrentPeriod(newPeriod);
      await loadTrendsData(newPeriod);
    }
  }, [currentPeriod, loadTrendsData]);

  useEffect(() => {
    loadTrendsData(currentPeriod);
  }, [loadTrendsData, currentPeriod]);

  return {
    trendsData,
    loading,
    error,
    insights,
    dataSources,
    currentPeriod,
    updatePeriod,
    refresh: () => loadTrendsData(currentPeriod),
  };
};

// Helper function to generate insights
const generateInsights = async (data, period) => {
  if (!data || data.length < 3) return {};

  const insights = {};

  // Energy-Stress Correlation Analysis
  const correlationInsight = analyzeEnergyStressCorrelation(data, period);
  if (correlationInsight) {
    insights.correlation = correlationInsight;
  }

  // Weekly Pattern Analysis
  const patternInsight = analyzeWeeklyPatterns(data);
  if (patternInsight) {
    insights.pattern = patternInsight;
  }

  // Trend Prediction
  const trendInsight = analyzeTrends(data, period);
  if (trendInsight) {
    insights.prediction = trendInsight;
  }

  // Personalized Recommendations
  const recommendationInsight = generateRecommendations(data);
  if (recommendationInsight) {
    insights.recommendation = recommendationInsight;
  }

  return insights;
};

// Analyze correlation between energy and stress
const analyzeEnergyStressCorrelation = (data, period) => {
  const validData = data.filter(d => d.energy !== null && d.stress !== null);
  const expectedDays = period || data.length;
  
  // Require at least 3 data points for any meaningful correlation analysis
  if (validData.length < 3) {
    return {
      type: 'correlation',
      title: 'Energy-Stress Relationship',
      subtitle: 'Insufficient data for analysis',
      description: 'Track your energy and stress for at least 3 days to see correlation patterns. Keep logging your daily data to unlock this insight.',
      confidence: 0,
      data: [
        { label: 'Data Points Available', value: `${validData.length} days` },
        { label: 'Expected Period', value: `${expectedDays} days` },
        { label: 'Required Minimum', value: '3 days' },
      ],
      actionItems: [
        'Continue daily energy and stress tracking',
        'Aim for consistent logging habits',
        'Check back after a few more entries',
      ],
    };
  }

  // Calculate Pearson correlation coefficient
  const n = validData.length;
  const sumEnergy = validData.reduce((sum, d) => sum + d.energy, 0);
  const sumStress = validData.reduce((sum, d) => sum + d.stress, 0);
  const sumEnergySquared = validData.reduce((sum, d) => sum + d.energy * d.energy, 0);
  const sumStressSquared = validData.reduce((sum, d) => sum + d.stress * d.stress, 0);
  const sumProduct = validData.reduce((sum, d) => sum + d.energy * d.stress, 0);

  const numerator = n * sumProduct - sumEnergy * sumStress;
  const denominator = Math.sqrt((n * sumEnergySquared - sumEnergy * sumEnergy) * (n * sumStressSquared - sumStress * sumStress));
  
  // Handle edge case where denominator is 0 (no variance in data)
  if (denominator === 0) {
    const dataCompleteness = n < expectedDays ? ` (${expectedDays - n} days missing from selected period)` : '';
    
    return {
      type: 'correlation',
      title: 'Energy-Stress Relationship',
      subtitle: 'No variance detected',
      description: `Your energy and stress levels have been very consistent during this period. This could indicate a stable routine or limited data variation.${dataCompleteness ? ' Continue tracking daily to capture more patterns.' : ''}`,
      confidence: 0.5,
      data: [
        { label: 'Sample Size', value: `${n} of ${expectedDays} days${dataCompleteness}` },
        { label: 'Data Variance', value: 'Low' },
      ],
      actionItems: [
        'Continue tracking to capture more variation',
        'Note any routine changes that might affect patterns',
      ],
    };
  }
  
  const correlation = numerator / denominator;
  const strength = Math.abs(correlation);

  // Adjust confidence based on sample size - smaller samples get lower confidence
  let baseConfidence = 0.6;
  if (n >= 7) baseConfidence = 0.8;
  if (n >= 14) baseConfidence = 0.9;
  
  // Reduce confidence if we have significantly less data than expected
  const completenessRatio = n / expectedDays;
  if (completenessRatio < 0.7) {
    baseConfidence *= 0.8; // Reduce confidence by 20% for incomplete data
  }
  
  const confidence = Math.min(baseConfidence + (strength * 0.2), 1);

  let description = '';
  let strengthLabel = '';
  
  if (strength > 0.7) {
    strengthLabel = 'Strong';
    description = correlation < 0 
      ? 'Strong negative correlation: When your stress increases, your energy significantly decreases.'
      : 'Strong positive correlation: Interestingly, your energy and stress levels move together.';
  } else if (strength > 0.4) {
    strengthLabel = 'Moderate';
    description = correlation < 0 
      ? 'Moderate negative correlation: Higher stress tends to reduce your energy levels.'
      : 'Moderate positive correlation: Your energy and stress levels show some connection.';
  } else {
    strengthLabel = 'Weak';
    description = 'Weak correlation: Your energy and stress levels appear to be largely independent during this period.';
  }

  // Add context about sample size and completeness
  if (n < expectedDays) {
    const missingDays = expectedDays - n;
    description += ` Note: Analysis based on ${n} days of the selected ${expectedDays}-day period (${missingDays} days missing data).`;
  } else if (n < 7) {
    description += ' Note: This analysis is based on a smaller time window - patterns may become clearer with more data.';
  }

  // Prepare sample size label with completeness info
  const sampleSizeLabel = n < expectedDays 
    ? `${n} of ${expectedDays} days` 
    : `${n} days`;

  return {
    type: 'correlation',
    title: 'Energy-Stress Relationship',
    subtitle: `${strengthLabel} correlation detected`,
    description,
    confidence,
    data: [
      { label: 'Correlation Coefficient', value: correlation.toFixed(2) },
      { label: 'Sample Size', value: sampleSizeLabel },
      { label: 'Relationship Strength', value: strengthLabel },
    ],
    actionItems: correlation < -0.4 ? [
      'Focus on stress reduction techniques',
      'Identify your main stress triggers',
      'Implement relaxation practices',
    ] : correlation > 0.4 ? [
      'Investigate why stress and energy move together',
      'Consider if high-energy activities create stress',
      'Look for underlying patterns',
    ] : [
      'Continue monitoring both metrics',
      'Look for patterns in your daily routine',
      'Track for longer periods to reveal trends',
    ],
  };
};

// Analyze weekly patterns
const analyzeWeeklyPatterns = (data) => {
  if (data.length < 7) return null;

  const dayOfWeekData = {};
  data.forEach(d => {
    const dayOfWeek = new Date(d.date).getDay(); // 0 = Sunday
    if (!dayOfWeekData[dayOfWeek]) {
      dayOfWeekData[dayOfWeek] = { energySum: 0, stressSum: 0, count: 0 };
    }
    if (d.energy !== null) {
      dayOfWeekData[dayOfWeek].energySum += d.energy;
    }
    if (d.stress !== null) {
      dayOfWeekData[dayOfWeek].stressSum += d.stress;
    }
    dayOfWeekData[dayOfWeek].count++;
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayAverages = Object.keys(dayOfWeekData).map(day => ({
    day: parseInt(day),
    name: dayNames[day],
    avgEnergy: dayOfWeekData[day].energySum / dayOfWeekData[day].count,
    avgStress: dayOfWeekData[day].stressSum / dayOfWeekData[day].count,
    count: dayOfWeekData[day].count,
  })).filter(d => d.count >= 2); // Only include days with at least 2 data points

  if (dayAverages.length < 3) return null;

  // Find best and worst days
  const bestEnergyDay = dayAverages.reduce((best, current) => 
    current.avgEnergy > best.avgEnergy ? current : best
  );
  const worstStressDay = dayAverages.reduce((best, current) => 
    current.avgStress < best.avgStress ? current : best
  );

  return {
    type: 'pattern',
    title: 'Weekly Patterns',
    subtitle: 'Your energy and stress vary by day of week',
    description: `Your highest energy levels typically occur on ${bestEnergyDay.name}s, while ${worstStressDay.name}s tend to be your least stressful days. Understanding these patterns can help you plan your week more effectively.`,
    confidence: 0.8,
    data: dayAverages.map(d => ({
      label: d.name,
      value: `E: ${d.avgEnergy.toFixed(1)} | S: ${d.avgStress.toFixed(1)}`,
    })),
    actionItems: [
      `Schedule important tasks on ${bestEnergyDay.name}s`,
      `Use ${worstStressDay.name}s for recovery and planning`,
      'Track how weekends vs weekdays affect you',
    ],
  };
};

// Analyze trends and make predictions
const analyzeTrends = (data, period) => {
  if (data.length < 7) return null;

  const recentData = data.slice(-7); // Last 7 days
  const previousData = data.slice(-14, -7); // Previous 7 days

  if (previousData.length < 5 || recentData.length < 5) return null;

  const recentEnergyAvg = recentData
    .filter(d => d.energy !== null)
    .reduce((sum, d, _, arr) => sum + d.energy / arr.length, 0);
  const previousEnergyAvg = previousData
    .filter(d => d.energy !== null)
    .reduce((sum, d, _, arr) => sum + d.energy / arr.length, 0);

  const energyChange = recentEnergyAvg - previousEnergyAvg;
  const energyTrend = energyChange > 0.5 ? 'improving' : energyChange < -0.5 ? 'declining' : 'stable';

  let description = '';
  if (energyTrend === 'improving') {
    description = `Your energy levels have increased by ${energyChange.toFixed(1)} points over the last week. This positive trend suggests your current routine is working well.`;
  } else if (energyTrend === 'declining') {
    description = `Your energy levels have decreased by ${Math.abs(energyChange).toFixed(1)} points recently. Consider reviewing what might be affecting your energy.`;
  } else {
    description = 'Your energy levels have been relatively stable, which indicates consistency in your routine.';
  }

  return {
    type: 'prediction',
    title: 'Trend Analysis',
    subtitle: `Energy levels are ${energyTrend}`,
    description,
    confidence: 0.7,
    data: [
      { label: 'Recent Average', value: recentEnergyAvg.toFixed(1) },
      { label: 'Previous Average', value: previousEnergyAvg.toFixed(1) },
      { label: 'Change', value: `${energyChange > 0 ? '+' : ''}${energyChange.toFixed(1)}` },
    ],
    actionItems: energyTrend === 'declining' ? [
      'Review recent changes in routine',
      'Check sleep quality and duration',
      'Consider stress levels and workload',
    ] : [
      'Continue current positive habits',
      'Monitor for sustained improvement',
    ],
  };
};

// Generate personalized recommendations
const generateRecommendations = (data) => {
  const validData = data.filter(d => d.energy !== null || d.stress !== null);
  if (validData.length < 5) return null;

  const avgEnergy = validData
    .filter(d => d.energy !== null)
    .reduce((sum, d, _, arr) => sum + d.energy / arr.length, 0);
  const avgStress = validData
    .filter(d => d.stress !== null)
    .reduce((sum, d, _, arr) => sum + d.stress / arr.length, 0);

  let recommendations = [];
  let description = '';

  if (avgEnergy < 5) {
    recommendations.push('Focus on improving sleep quality');
    recommendations.push('Add light exercise to your routine');
    recommendations.push('Consider your nutrition and hydration');
    description = 'Your energy levels are below average. Focus on foundational wellness practices.';
  } else if (avgStress > 6) {
    recommendations.push('Practice stress management techniques');
    recommendations.push('Schedule regular breaks during the day');
    recommendations.push('Identify and address stress triggers');
    description = 'Your stress levels are elevated. Prioritize stress reduction strategies.';
  } else {
    recommendations.push('Maintain your current healthy habits');
    recommendations.push('Continue tracking to identify optimization opportunities');
    description = 'Your overall wellness metrics look good. Focus on maintaining consistency.';
  }

  return {
    type: 'recommendation',
    title: 'Personalized Recommendations',
    subtitle: 'Based on your recent patterns',
    description,
    confidence: 0.8,
    data: [
      { label: 'Average Energy', value: avgEnergy.toFixed(1) },
      { label: 'Average Stress', value: avgStress.toFixed(1) },
    ],
    actionItems: recommendations,
  };
};

// Process data sources for meaningful display
const processDataSources = (entries) => {
  const energySources = {};
  const stressSources = {};

  entries.forEach(entry => {
    // Process energy sources
    if (entry.energySources) {
      const sources = entry.energySources.toLowerCase().split(/[,;.]/)
        .map(s => s.trim())
        .filter(s => s.length > 2);
      
      sources.forEach(source => {
        if (!energySources[source]) {
          energySources[source] = { count: 0, dates: [], examples: [] };
        }
        energySources[source].count++;
        energySources[source].dates.push(entry.date);
        energySources[source].examples.push({
          text: source,
          date: entry.date
        });
      });
    }

    // Process stress sources
    if (entry.stressSources) {
      const sources = entry.stressSources.toLowerCase().split(/[,;.]/)
        .map(s => s.trim())
        .filter(s => s.length > 2);
      
      sources.forEach(source => {
        if (!stressSources[source]) {
          stressSources[source] = { count: 0, dates: [], examples: [] };
        }
        stressSources[source].count++;
        stressSources[source].dates.push(entry.date);
        stressSources[source].examples.push({
          text: source,
          date: entry.date
        });
      });
    }
  });

  // Convert to arrays and calculate frequencies
  const totalDays = entries.length;
  
  const processedEnergySources = Object.entries(energySources)
    .map(([name, data]) => ({
      name,
      count: data.count,
      frequency: data.count / totalDays,
      examples: data.examples.slice(-3), // Last 3 examples
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10); // Top 10

  const processedStressSources = Object.entries(stressSources)
    .map(([name, data]) => ({
      name,
      count: data.count,
      frequency: data.count / totalDays,
      examples: data.examples.slice(-3), // Last 3 examples
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10); // Top 10

  return {
    energySources: processedEnergySources,
    stressSources: processedStressSources,
  };
};
