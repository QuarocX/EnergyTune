// AI Analytics Service for EnergyTune
// Uses local pattern recognition algorithms optimized for React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

// Note: Transformers.js requires WebAssembly which is not available in React Native
// We'll use a custom lightweight AI implementation instead

class AIAnalyticsService {
  constructor() {
    this.isEnabled = false;
    this.models = {
      classifier: null,
      sentiment: null,
    };
    this.isLoading = false;
    this.initialized = false;
    
    // Custom sentiment analysis patterns
    this.sentimentPatterns = {
      positive: [
        'great', 'good', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'enjoyed',
        'productive', 'energized', 'motivated', 'accomplished', 'successful', 'happy',
        'focused', 'clear', 'strong', 'confident', 'excited', 'inspired', 'satisfied'
      ],
      negative: [
        'bad', 'terrible', 'awful', 'horrible', 'stressed', 'tired', 'exhausted', 'frustrated',
        'annoyed', 'angry', 'upset', 'worried', 'anxious', 'overwhelmed', 'difficult',
        'challenging', 'problem', 'issue', 'struggle', 'hard', 'tough', 'disappointing'
      ],
      energy: [
        'coffee', 'tea', 'exercise', 'workout', 'walk', 'run', 'sleep', 'rest', 'food', 'meal',
        'break', 'vacation', 'music', 'nature', 'fresh air', 'sunshine', 'collaboration',
        'team', 'learning', 'creative', 'achievement', 'success', 'completion'
      ],
      stress: [
        'deadline', 'pressure', 'meeting', 'email', 'phone', 'interruption', 'noise',
        'traffic', 'late', 'rushing', 'technical', 'computer', 'bug', 'error',
        'workload', 'overtime', 'conflict', 'criticism', 'uncertainty', 'change'
      ]
    };
  }

  // Initialize the service (call on app start)
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Check if AI was previously enabled
      const wasEnabled = await this.isAIEnabled();
      if (wasEnabled) {
        console.log('AI was previously enabled, activating local AI...');
        this.isEnabled = true;
        // Our local AI is always ready - no models to download
        this.models.classifier = 'local-pattern-matching';
        this.models.sentiment = 'local-sentiment-analysis';
      }
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing AI service:', error);
      this.initialized = true; // Mark as initialized even if failed
    }
  }

  // Check if AI features are enabled by user
  async isAIEnabled() {
    try {
      const enabled = await AsyncStorage.getItem('ai_features_enabled');
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking AI status:', error);
      return false;
    }
  }

  // Check if transformers.js is available
  async isTransformersAvailable() {
    // Since we're using local AI, this is always available
    return true;
  }

  // Enable AI features and initialize local AI
  async enableAI() {
    try {
      this.isLoading = true;
      
      console.log('Enabling local AI analytics...');
      
      await AsyncStorage.setItem('ai_features_enabled', 'true');
      
      // Our local AI is always ready
      this.models.classifier = 'local-pattern-matching';
      this.models.sentiment = 'local-sentiment-analysis';
      
      console.log('Local AI analytics enabled successfully');
      this.isEnabled = true;
      return true;
    } catch (error) {
      console.error('Error enabling AI:', error);
      // Ensure we don't leave AI in a half-enabled state
      await AsyncStorage.setItem('ai_features_enabled', 'false');
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  // Local sentiment analysis using pattern matching
  analyzeSentiment(text) {
    if (!text || typeof text !== 'string') {
      return [{ label: 'NEUTRAL', score: 0.5 }];
    }

    const words = text.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;
    const positiveMatches = [];
    const negativeMatches = [];

    words.forEach(word => {
      this.sentimentPatterns.positive.forEach(pattern => {
        if (word.includes(pattern)) {
          positiveScore += 1;
          positiveMatches.push(pattern);
        }
      });
      this.sentimentPatterns.negative.forEach(pattern => {
        if (word.includes(pattern)) {
          negativeScore += 1;
          negativeMatches.push(pattern);
        }
      });
    });

    const totalWords = words.length;
    const normalizedPositive = positiveScore / totalWords;
    const normalizedNegative = negativeScore / totalWords;

    if (normalizedPositive > normalizedNegative) {
      const finalScore = Math.min(0.9, 0.5 + normalizedPositive);
      return [{ label: 'POSITIVE', score: finalScore }];
    } else if (normalizedNegative > normalizedPositive) {
      const finalScore = Math.min(0.9, 0.5 + normalizedNegative);
      return [{ label: 'NEGATIVE', score: finalScore }];
    } else {
      return [{ label: 'NEUTRAL', score: 0.5 }];
    }
  }

  // Local text categorization using keyword matching
  categorizeText(text, categories) {
    if (!text || typeof text !== 'string') {
      return { category: 'other', confidence: 0 };
    }

    const words = text.toLowerCase().split(/\s+/);
    let bestCategory = 'other';
    let bestScore = 0;
    const categoryScores = {};

    categories.forEach(category => {
      let score = 0;
      const matchedKeywords = [];
      
      category.keywords.forEach(keyword => {
        words.forEach(word => {
          if (word.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(word)) {
            score += 1;
            matchedKeywords.push(keyword);
          }
        });
      });

      const normalizedScore = score / category.keywords.length;
      categoryScores[category.name] = { score: normalizedScore, matches: matchedKeywords };
      
      if (normalizedScore > bestScore) {
        bestScore = normalizedScore;
        bestCategory = category.name;
      }
    });

    return {
      category: bestCategory,
      confidence: Math.min(0.9, bestScore)
    };
  }

  // Analyze energy sources for patterns and recommendations
  async analyzeEnergySources(entries) {
    console.log('[AI] 🔍 Energy analysis called - isEnabled:', this.isEnabled, 'classifier:', this.models.classifier, 'initialized:', this.initialized);
    
    if (!this.isEnabled || !this.models.classifier) {
      console.log('[AI] Energy analysis skipped - AI not enabled or no classifier');
      return null;
    }

    try {
      console.log('[AI] 🔍 Starting energy source analysis...');
      console.log('[AI] 📊 Total entries to analyze:', entries.length);

      const energySources = entries
        .filter(entry => entry.energySources && entry.energySources.trim())
        .map(entry => ({
          date: entry.date,
          sources: entry.energySources,
          energy: entry.energyLevels ? Object.values(entry.energyLevels).filter(v => v !== null) : [],
        }));

      console.log('[AI] ⚡ Filtered energy entries:', energySources.length);
      console.log('[AI] 📝 Sample energy sources:', energySources.slice(0, 3).map(e => ({
        date: e.date,
        sources: e.sources.substring(0, 50) + '...',
        avgEnergy: e.energy.length > 0 ? (e.energy.reduce((sum, val) => sum + val, 0) / e.energy.length).toFixed(1) : 'N/A'
      })));

      if (energySources.length < 3) {
        console.log('[AI] ⚠️ Not enough energy data for analysis (need 3+, have ' + energySources.length + ')');
        return { insights: [], recommendations: [], logs: ['Not enough energy data for analysis. Need at least 3 entries with energy descriptions.'] };
      }

      // Categorize energy sources
      console.log('[AI] 🏷️ Categorizing energy sources...');
      const categories = await this.categorizeTexts(
        energySources.map(e => e.sources),
        this.getEnergyCategories()
      );
      
      console.log('[AI] 📋 Categorization results:', categories.map(c => ({
        text: c.text.substring(0, 30) + '...',
        category: c.category,
        confidence: c.confidence.toFixed(2)
      })));

      // Find high-energy correlations
      console.log('[AI] 🎯 Finding high-energy patterns (threshold: 7+)...');
      const highEnergyPattern = this.findHighEnergyPatterns(energySources, categories);
      
      console.log('[AI] 📈 High-energy patterns found:', Object.keys(highEnergyPattern).length);
      Object.entries(highEnergyPattern).forEach(([category, data]) => {
        console.log(`[AI] 🔥 ${category}: ${data.count} occurrences, avg energy: ${(data.totalEnergy / data.count).toFixed(1)}`);
      });

      // Generate insights
      console.log('[AI] 💡 Generating energy insights...');
      const insights = this.generateEnergyInsights(highEnergyPattern);
      const recommendations = this.generateEnergyRecommendations(highEnergyPattern);

      console.log('[AI] ✅ Energy analysis complete:', { insights: insights.length, recommendations: recommendations.length });

      return { 
        insights, 
        recommendations,
        logs: [
          `Analyzed ${energySources.length} energy entries`,
          `Found ${Object.keys(highEnergyPattern).length} high-energy patterns`,
          `Generated ${insights.length} insights and ${recommendations.length} recommendations`
        ]
      };
    } catch (error) {
      console.error('[AI] ❌ Error analyzing energy sources:', error);
      return null;
    }
  }

  // Analyze stress sources for patterns and prevention
  async analyzeStressSources(entries) {
    console.log('[AI] 🔍 Stress analysis called - isEnabled:', this.isEnabled, 'classifier:', this.models.classifier, 'initialized:', this.initialized);
    
    if (!this.isEnabled || !this.models.classifier) {
      console.log('[AI] Stress analysis skipped - AI not enabled or no classifier');
      return null;
    }

    try {
      console.log('[AI] 🔍 Starting stress source analysis...');
      console.log('[AI] 📊 Total entries to analyze:', entries.length);

      const stressSources = entries
        .filter(entry => entry.stressSources && entry.stressSources.trim())
        .map(entry => ({
          date: entry.date,
          sources: entry.stressSources,
          stress: entry.stressLevels ? Object.values(entry.stressLevels).filter(v => v !== null) : [],
        }));

      console.log('[AI] 😰 Filtered stress entries:', stressSources.length);
      console.log('[AI] 📝 Sample stress sources:', stressSources.slice(0, 3).map(s => ({
        date: s.date,
        sources: s.sources.substring(0, 50) + '...',
        avgStress: s.stress.length > 0 ? (s.stress.reduce((sum, val) => sum + val, 0) / s.stress.length).toFixed(1) : 'N/A'
      })));

      if (stressSources.length < 3) {
        console.log('[AI] ⚠️ Not enough stress data for analysis (need 3+, have ' + stressSources.length + ')');
        return { insights: [], recommendations: [], logs: ['Not enough stress data for analysis. Need at least 3 entries with stress descriptions.'] };
      }

      // Categorize stress sources
      console.log('[AI] 🏷️ Categorizing stress sources...');
      const categories = await this.categorizeTexts(
        stressSources.map(s => s.sources),
        this.getStressCategories()
      );

      console.log('[AI] 📋 Stress categorization results:', categories.map(c => ({
        text: c.text.substring(0, 30) + '...',
        category: c.category,
        confidence: c.confidence.toFixed(2)
      })));

      // Find stress escalation patterns
      console.log('[AI] 🎯 Finding high-stress patterns (threshold: 6+)...');
      const stressPatterns = this.findStressPatterns(stressSources, categories);

      console.log('[AI] 📈 High-stress patterns found:', Object.keys(stressPatterns).length);
      Object.entries(stressPatterns).forEach(([category, data]) => {
        console.log(`[AI] 🔥 ${category}: ${data.count} occurrences, avg stress: ${(data.totalStress / data.count).toFixed(1)}`);
      });

      // Generate insights
      console.log('[AI] 💡 Generating stress insights...');
      const insights = this.generateStressInsights(stressPatterns);
      const recommendations = this.generateStressPrevention(stressPatterns);

      console.log('[AI] ✅ Stress analysis complete:', { insights: insights.length, recommendations: recommendations.length });

      return { 
        insights, 
        recommendations,
        logs: [
          `Analyzed ${stressSources.length} stress entries`,
          `Found ${Object.keys(stressPatterns).length} high-stress patterns`,
          `Generated ${insights.length} insights and ${recommendations.length} recommendations`
        ]
      };
    } catch (error) {
      console.error('[AI] ❌ Error analyzing stress sources:', error);
      return null;
    }
  }

  // Advanced correlation analysis combining text and numeric data
  async analyzeEnergyStressCorrelation(entries) {
    if (!this.isEnabled) {
      return null;
    }

    try {
      const validEntries = entries.filter(entry => 
        entry.energySources && entry.stressSources &&
        entry.energyLevels && entry.stressLevels
      );

      if (validEntries.length < 5) {
        return null;
      }

      // Analyze sentiment of sources using our local implementation
      const energySentiments = validEntries.map(entry => 
        this.analyzeSentiment(entry.energySources)
      );

      const stressSentiments = validEntries.map(entry => 
        this.analyzeSentiment(entry.stressSources)
      );

      // Correlate sentiment with numeric values
      const correlations = this.calculateSentimentCorrelations(
        validEntries,
        energySentiments,
        stressSentiments
      );

      return {
        type: 'ai_correlation',
        title: 'Local AI Pattern Analysis',
        subtitle: 'Smart insights from your energy and stress descriptions',
        confidence: 0.85,
        insights: correlations.insights,
        recommendations: correlations.recommendations,
      };
    } catch (error) {
      console.error('Error in AI correlation analysis:', error);
      return null;
    }
  }

  // Helper: Categorize texts into predefined categories
  async categorizeTexts(texts, categories) {
    const results = [];
    for (const text of texts) {
      const result = this.categorizeText(text, categories);
      results.push({
        text,
        category: result.category,
        confidence: result.confidence,
      });
    }
    return results;
  }

  // Helper: Calculate category match score
  calculateCategoryScore(text, keywords) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    return score / keywords.length;
  }

  // Energy source categories for pattern recognition
  getEnergyCategories() {
    return [
      {
        name: 'physical',
        keywords: ['sleep', 'exercise', 'food', 'coffee', 'tea', 'walk', 'rest', 'workout'],
      },
      {
        name: 'work',
        keywords: ['project', 'meeting', 'collaboration', 'achievement', 'completed', 'success'],
      },
      {
        name: 'social',
        keywords: ['family', 'friends', 'team', 'conversation', 'people', 'social'],
      },
      {
        name: 'mental',
        keywords: ['learning', 'creative', 'focus', 'meditation', 'reading', 'music'],
      },
      {
        name: 'environment',
        keywords: ['nature', 'weather', 'home', 'office', 'quiet', 'space'],
      },
    ];
  }

  // Stress source categories for pattern recognition
  getStressCategories() {
    return [
      {
        name: 'work_pressure',
        keywords: ['deadline', 'meeting', 'pressure', 'workload', 'boss', 'project'],
      },
      {
        name: 'technical',
        keywords: ['technical', 'computer', 'software', 'bug', 'internet', 'technology'],
      },
      {
        name: 'interruptions',
        keywords: ['interruption', 'distraction', 'email', 'phone', 'noise', 'context'],
      },
      {
        name: 'personal',
        keywords: ['family', 'relationship', 'health', 'money', 'financial', 'home'],
      },
      {
        name: 'time',
        keywords: ['time', 'rushing', 'late', 'schedule', 'traffic', 'waiting'],
      },
    ];
  }

  // Find high-energy patterns
  findHighEnergyPatterns(energySources, categories) {
    const patterns = {};
    
    energySources.forEach((entry, index) => {
      const avgEnergy = entry.energy.length > 0 
        ? entry.energy.reduce((sum, val) => sum + val, 0) / entry.energy.length 
        : 0;
      
      if (avgEnergy >= 7) { // High energy days
        const category = categories[index]?.category || 'other';
        if (!patterns[category]) {
          patterns[category] = { count: 0, totalEnergy: 0, examples: [] };
        }
        patterns[category].count++;
        patterns[category].totalEnergy += avgEnergy;
        patterns[category].examples.push({
          date: entry.date,
          sources: entry.sources,
          energy: avgEnergy,
        });
      }
    });

    return patterns;
  }

  // Find stress escalation patterns
  findStressPatterns(stressSources, categories) {
    const patterns = {};
    
    stressSources.forEach((entry, index) => {
      const avgStress = entry.stress.length > 0 
        ? entry.stress.reduce((sum, val) => sum + val, 0) / entry.stress.length 
        : 0;
      
      if (avgStress >= 6) { // High stress days
        const category = categories[index]?.category || 'other';
        if (!patterns[category]) {
          patterns[category] = { count: 0, totalStress: 0, examples: [] };
        }
        patterns[category].count++;
        patterns[category].totalStress += avgStress;
        patterns[category].examples.push({
          date: entry.date,
          sources: entry.sources,
          stress: avgStress,
        });
      }
    });

    return patterns;
  }

  // Generate energy insights
  generateEnergyInsights(patterns) {
    const insights = [];
    
    const sortedPatterns = Object.entries(patterns)
      .sort(([,a], [,b]) => (b.totalEnergy / b.count) - (a.totalEnergy / a.count));

    if (sortedPatterns.length > 0) {
      const [topCategory, data] = sortedPatterns[0];
      const avgEnergy = data.totalEnergy / data.count;
      
      insights.push({
        title: `${this.formatCategoryName(topCategory)} activities boost your energy most`,
        description: `Your highest energy levels (avg: ${avgEnergy.toFixed(1)}) correlate with ${topCategory.replace('_', ' ')} activities. You've experienced this ${data.count} times.`,
        confidence: Math.min(0.9, 0.6 + (data.count * 0.1)),
        examples: data.examples.slice(0, 2),
      });
    }

    return insights;
  }

  // Generate energy recommendations
  generateEnergyRecommendations(patterns) {
    const recommendations = [];
    
    const sortedPatterns = Object.entries(patterns)
      .sort(([,a], [,b]) => (b.totalEnergy / b.count) - (a.totalEnergy / a.count));

    sortedPatterns.slice(0, 2).forEach(([category, data]) => {
      const avgEnergy = data.totalEnergy / data.count;
      
      recommendations.push({
        title: `Schedule more ${this.formatCategoryName(category)} activities`,
        description: `These activities consistently give you high energy (${avgEnergy.toFixed(1)}/10). Try to incorporate them during your peak productivity windows.`,
        actionable: true,
        priority: avgEnergy >= 8 ? 'high' : 'medium',
      });
    });

    return recommendations;
  }

  // Generate stress insights
  generateStressInsights(patterns) {
    const insights = [];
    
    const sortedPatterns = Object.entries(patterns)
      .sort(([,a], [,b]) => (b.totalStress / b.count) - (a.totalStress / a.count));

    if (sortedPatterns.length > 0) {
      const [topCategory, data] = sortedPatterns[0];
      const avgStress = data.totalStress / data.count;
      
      insights.push({
        title: `${this.formatCategoryName(topCategory)} issues are your main stress trigger`,
        description: `This category causes your highest stress levels (avg: ${avgStress.toFixed(1)}). Pattern detected ${data.count} times.`,
        confidence: Math.min(0.9, 0.6 + (data.count * 0.1)),
        examples: data.examples.slice(0, 2),
      });
    }

    return insights;
  }

  // Generate stress prevention recommendations
  generateStressPrevention(patterns) {
    const recommendations = [];
    
    Object.entries(patterns).forEach(([category, data]) => {
      const avgStress = data.totalStress / data.count;
      
      if (avgStress >= 7 && data.count >= 2) {
        const prevention = this.getStressPreventionStrategies(category);
        recommendations.push({
          title: `Prevent ${this.formatCategoryName(category)} stress`,
          description: prevention.description,
          strategies: prevention.strategies,
          priority: avgStress >= 8 ? 'high' : 'medium',
        });
      }
    });

    return recommendations;
  }

  // Get stress prevention strategies by category
  getStressPreventionStrategies(category) {
    const strategies = {
      work_pressure: {
        description: 'Work pressure is your main stress source. Focus on time management and boundary setting.',
        strategies: [
          'Break large projects into smaller tasks',
          'Set realistic deadlines with buffer time',
          'Practice saying no to non-essential requests',
          'Schedule regular breaks during intensive work',
        ],
      },
      technical: {
        description: 'Technical issues cause significant stress. Prepare backup plans and support resources.',
        strategies: [
          'Keep a list of technical support contacts',
          'Learn basic troubleshooting skills',
          'Always have backup plans for important tasks',
          'Allow extra time for technical tasks',
        ],
      },
      interruptions: {
        description: 'Interruptions disrupt your flow. Create better boundaries and focus blocks.',
        strategies: [
          'Use "Do Not Disturb" modes during focus time',
          'Batch process emails at set times',
          'Communicate your focus hours to colleagues',
          'Find a quiet workspace when possible',
        ],
      },
      personal: {
        description: 'Personal matters affect your work well-being. Address them proactively.',
        strategies: [
          'Schedule time for personal tasks',
          'Separate work and personal concerns',
          'Seek support when needed',
          'Practice self-care regularly',
        ],
      },
      time: {
        description: 'Time pressure creates stress. Improve your time management and planning.',
        strategies: [
          'Plan your day the night before',
          'Leave buffer time between appointments',
          'Identify and eliminate time wasters',
          'Use time-blocking for important tasks',
        ],
      },
    };

    return strategies[category] || {
      description: 'Manage this stress source with mindful planning.',
      strategies: ['Identify specific triggers', 'Develop coping strategies', 'Seek support when needed'],
    };
  }

  // Calculate sentiment correlations
  calculateSentimentCorrelations(entries, energySentiments, stressSentiments) {
    const insights = [];
    const recommendations = [];

    // Analyze sentiment vs numeric correlation
    let posEnergyCount = 0;
    let negStressCount = 0;
    
    energySentiments.forEach((sentiment, index) => {
      const entry = entries[index];
      const avgEnergy = Object.values(entry.energyLevels)
        .filter(v => v !== null)
        .reduce((sum, val, _, arr) => sum + val / arr.length, 0);
      
      if (sentiment[0].label === 'POSITIVE' && avgEnergy >= 7) {
        posEnergyCount++;
      }
    });

    stressSentiments.forEach((sentiment, index) => {
      const entry = entries[index];
      const avgStress = Object.values(entry.stressLevels)
        .filter(v => v !== null)
        .reduce((sum, val, _, arr) => sum + val / arr.length, 0);
      
      if (sentiment[0].label === 'NEGATIVE' && avgStress >= 6) {
        negStressCount++;
      }
    });

    const totalEntries = entries.length;
    const positiveEnergyRatio = posEnergyCount / totalEntries;
    const negativeStressRatio = negStressCount / totalEntries;

    if (positiveEnergyRatio > 0.6) {
      insights.push({
        title: 'Positive language correlates with high energy',
        description: `${(positiveEnergyRatio * 100).toFixed(0)}% of your high-energy days include positive language in your energy sources.`,
      });
      
      recommendations.push({
        title: 'Focus on positive energy sources',
        description: 'Your language patterns suggest positive activities significantly boost your energy.',
      });
    }

    if (negativeStressRatio > 0.5) {
      insights.push({
        title: 'Negative language indicates stress escalation',
        description: `${(negativeStressRatio * 100).toFixed(0)}% of your high-stress days include negative language patterns.`,
      });
      
      recommendations.push({
        title: 'Monitor language patterns for early stress detection',
        description: 'Your stress descriptions can serve as early warning signals.',
      });
    }

    return { insights, recommendations };
  }

  // Format category names for display
  formatCategoryName(category) {
    return category.replace('_', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Disable AI features and clear models
  async disableAI() {
    try {
      await AsyncStorage.setItem('ai_features_enabled', 'false');
      this.models = { classifier: null, sentiment: null };
      this.isEnabled = false;
      
      console.log('Local AI analytics disabled');
      return true;
    } catch (error) {
      console.error('Error disabling AI:', error);
      return false;
    }
  }

  // Get model download progress (for UI feedback)
  getDownloadProgress() {
    // Local AI doesn't need downloading
    return { loaded: !this.isLoading, progress: 100 };
  }

  // Estimate model size for user info
  getEstimatedModelSize() {
    return '~1KB'; // Our local AI is tiny!
  }
}

// Export singleton instance
export default new AIAnalyticsService();
