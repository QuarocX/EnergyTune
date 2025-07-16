// Enhanced NLP Analytics Service for EnergyTune
// Uses advanced local NLP techniques optimized for React Native
import AsyncStorage from '@react-native-async-storage/async-storage';

class LLMAnalyticsService {
  constructor() {
    this.isEnabled = false;
    this.initialized = false;
    this.cache = new Map(); // Cache for processed texts
    
    // Enhanced NLP patterns for better recognition
    this.nlpPatterns = {
      // Energy-boosting patterns
      energyPositive: [
        // Activities
        'good sleep', 'quality sleep', 'enough sleep', 'restful sleep',
        'morning coffee', 'coffee break', 'fresh coffee',
        'quick walk', 'long walk', 'nature walk', 'walking outside',
        'workout', 'exercise', 'gym session', 'yoga class',
        'meditation', 'mindfulness', 'breathing exercises',
        'fresh air', 'sunshine', 'natural light',
        'music', 'favorite song', 'playlist',
        'reading', 'good book', 'learning something',
        'creative work', 'art project', 'writing',
        'social time', 'friends', 'family time',
        'accomplishment', 'completion', 'success', 'achievement',
        'break', 'rest', 'relaxation', 'downtime',
        'healthy meal', 'good food', 'nutrition',
        // Feelings and states
        'energized', 'motivated', 'inspired', 'focused',
        'productive', 'accomplished', 'satisfied', 'happy',
        'calm', 'peaceful', 'relaxed', 'refreshed'
      ],
      
      // Stress-inducing patterns
      stressNegative: [
        // Work stressors
        'tight deadline', 'deadline pressure', 'time pressure',
        'difficult meeting', 'long meeting', 'boring meeting',
        'technical problems', 'computer issues', 'software bug',
        'email overload', 'too many emails', 'phone calls',
        'interruptions', 'distractions', 'noise',
        'workload', 'overtime', 'late night', 'early morning',
        'difficult client', 'demanding boss', 'conflict',
        // Personal stressors
        'traffic jam', 'stuck in traffic', 'commute',
        'running late', 'time crunch', 'rushing',
        'financial stress', 'money worries', 'bills',
        'health concerns', 'feeling sick', 'pain',
        'relationship issues', 'argument', 'disagreement',
        'no alone time', 'lack of privacy', 'crowded',
        'uncertainty', 'unknown', 'unpredictable',
        'change', 'transition', 'new situation',
        // Feelings and states
        'overwhelmed', 'stressed', 'anxious', 'worried',
        'frustrated', 'annoyed', 'angry', 'upset',
        'tired', 'exhausted', 'drained', 'burnt out'
      ],
      
      // Context modifiers that strengthen patterns
      intensifiers: ['very', 'extremely', 'really', 'quite', 'totally', 'completely'],
      timeIndicators: ['morning', 'afternoon', 'evening', 'night', 'today', 'yesterday'],
      frequencyWords: ['always', 'often', 'usually', 'sometimes', 'rarely', 'never']
    };
  }

  // Initialize the service
  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('🧠 [Enhanced NLP] Initializing advanced pattern recognition...');
      
      // No external models needed - using advanced local NLP
      this.initialized = true;
      console.log('✅ [Enhanced NLP] Advanced pattern recognition ready');
      
    } catch (error) {
      console.error('❌ [Enhanced NLP] Failed to initialize:', error);
      this.initialized = false;
      throw error;
    }
  }

  // Check if AI is enabled
  async isAIEnabled() {
    try {
      const enabled = await AsyncStorage.getItem('llm_features_enabled');
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking Enhanced NLP status:', error);
      return false;
    }
  }

  // Enable AI
  async enableAI() {
    try {
      console.log('🔄 [Enhanced NLP] Enabling advanced pattern recognition...');

      // Initialize if not already done
      if (!this.initialized) {
        await this.initialize();
      }

      await AsyncStorage.setItem('llm_features_enabled', 'true');
      this.isEnabled = true;
      
      console.log('✅ [Enhanced NLP] Advanced pattern recognition enabled');
      return true;
    } catch (error) {
      console.error('❌ [Enhanced NLP] Error enabling:', error);
      await AsyncStorage.setItem('llm_features_enabled', 'false');
      return false;
    }
  }

  // Disable AI
  async disableAI() {
    try {
      await AsyncStorage.setItem('llm_features_enabled', 'false');
      this.isEnabled = false;
      return true;
    } catch (error) {
      console.error('Error disabling Enhanced NLP:', error);
      return false;
    }
  }

  // Advanced sentiment analysis using enhanced NLP
  async analyzeSentiment(text) {
    if (!text || typeof text !== 'string') {
      return [{ label: 'NEUTRAL', score: 0.5 }];
    }

    const cacheKey = `sentiment_${text}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const normalizedText = text.toLowerCase();
      let positiveScore = 0;
      let negativeScore = 0;
      let contextMultiplier = 1;

      // Check for intensifiers
      this.nlpPatterns.intensifiers.forEach(intensifier => {
        if (normalizedText.includes(intensifier)) {
          contextMultiplier += 0.3;
        }
      });

      // Analyze energy patterns
      this.nlpPatterns.energyPositive.forEach(pattern => {
        if (normalizedText.includes(pattern)) {
          positiveScore += 2 * contextMultiplier; // Higher weight for specific patterns
        }
      });

      // Analyze stress patterns
      this.nlpPatterns.stressNegative.forEach(pattern => {
        if (normalizedText.includes(pattern)) {
          negativeScore += 2 * contextMultiplier;
        }
      });

      // Normalize scores
      const totalWords = normalizedText.split(/\s+/).length;
      const normalizedPositive = positiveScore / totalWords;
      const normalizedNegative = negativeScore / totalWords;

      let result;
      if (normalizedPositive > normalizedNegative) {
        const finalScore = Math.min(0.95, 0.5 + normalizedPositive);
        result = [{ label: 'POSITIVE', score: finalScore }];
      } else if (normalizedNegative > normalizedPositive) {
        const finalScore = Math.min(0.95, 0.5 + normalizedNegative);
        result = [{ label: 'NEGATIVE', score: finalScore }];
      } else {
        result = [{ label: 'NEUTRAL', score: 0.5 }];
      }
      
      this.cache.set(cacheKey, result);
      return result;
      
    } catch (error) {
      console.error('❌ [Enhanced NLP] Error in sentiment analysis:', error);
      return [{ label: 'NEUTRAL', score: 0.5 }];
    }
  }

  // Extract meaningful patterns using advanced NLP
  async extractPatterns(text) {
    if (!text || typeof text !== 'string') {
      return { entities: [], patterns: [] };
    }

    const cacheKey = `patterns_${text}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const normalizedText = text.toLowerCase();
      const patterns = [];
      const entities = [];

      // Extract energy patterns
      this.nlpPatterns.energyPositive.forEach(pattern => {
        if (normalizedText.includes(pattern)) {
          patterns.push({
            text: pattern,
            type: 'energy_booster',
            confidence: 0.9,
            category: 'positive'
          });
        }
      });

      // Extract stress patterns
      this.nlpPatterns.stressNegative.forEach(pattern => {
        if (normalizedText.includes(pattern)) {
          patterns.push({
            text: pattern,
            type: 'stress_trigger',
            confidence: 0.9,
            category: 'negative'
          });
        }
      });

      // Extract time-based entities
      this.nlpPatterns.timeIndicators.forEach(timeWord => {
        if (normalizedText.includes(timeWord)) {
          entities.push({
            text: timeWord,
            label: 'TIME',
            confidence: 0.8
          });
        }
      });

      // Extract frequency entities
      this.nlpPatterns.frequencyWords.forEach(freqWord => {
        if (normalizedText.includes(freqWord)) {
          entities.push({
            text: freqWord,
            label: 'FREQUENCY',
            confidence: 0.8
          });
        }
      });

      // Extract custom phrases (2-3 words that might not be in our patterns)
      const customPhrases = this.extractCustomPhrases(normalizedText);
      patterns.push(...customPhrases);

      const result = {
        entities: entities,
        patterns: patterns.slice(0, 10) // Limit to top 10 patterns
      };

      this.cache.set(cacheKey, result);
      return result;
      
    } catch (error) {
      console.error('❌ [Enhanced NLP] Error extracting patterns:', error);
      return { entities: [], patterns: [] };
    }
  }

  // Extract custom phrases that might not be in predefined patterns
  extractCustomPhrases(text) {
    const phrases = [];
    const words = text.split(/[\s,]+/).filter(word => word.length > 2);
    
    // Extract 2-word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      if (this.isInterestingPhrase(phrase)) {
        phrases.push({
          text: phrase,
          type: 'custom_pattern',
          confidence: 0.7,
          category: 'unknown'
        });
      }
    }
    
    // Extract 3-word phrases
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (this.isInterestingPhrase(phrase)) {
        phrases.push({
          text: phrase,
          type: 'custom_pattern',
          confidence: 0.8,
          category: 'unknown'
        });
      }
    }
    
    return phrases;
  }

  // Check if a phrase is potentially interesting
  isInterestingPhrase(phrase) {
    // Skip if it's already in our known patterns
    const allKnownPatterns = [
      ...this.nlpPatterns.energyPositive,
      ...this.nlpPatterns.stressNegative
    ];
    
    if (allKnownPatterns.some(pattern => pattern.includes(phrase) || phrase.includes(pattern))) {
      return false;
    }

    // Include phrases that contain meaningful words
    const meaningfulWords = [
      'time', 'work', 'day', 'night', 'morning', 'evening',
      'people', 'person', 'team', 'alone', 'together',
      'energy', 'stress', 'tired', 'busy', 'free',
      'good', 'bad', 'great', 'terrible', 'amazing',
      'problem', 'issue', 'solution', 'help', 'support'
    ];

    return meaningfulWords.some(word => phrase.includes(word));
  }

  // Analyze energy sources using enhanced NLP
  async analyzeEnergySources(entries) {
    try {
      const energyTexts = entries
        .filter(entry => entry.energySources && entry.energySources.trim())
        .map(entry => ({
          text: entry.energySources.trim(),
          energy: entry.energyLevels ? 
            Object.values(entry.energyLevels).filter(v => v !== null).reduce((sum, val) => sum + val, 0) / 
            Object.values(entry.energyLevels).filter(v => v !== null).length : 0,
          date: entry.date
        }));

      if (energyTexts.length === 0) {
        return { insights: [], logs: ['No energy sources found'] };
      }

      const insights = [];
      const patternCounts = {};
      const sentimentScores = {};
      const logs = [`Analyzing ${energyTexts.length} energy sources with enhanced NLP`];

      // Analyze each energy source with enhanced NLP
      for (const item of energyTexts) {
        const sentiment = await this.analyzeSentiment(item.text);
        const patterns = await this.extractPatterns(item.text);
        
        // Track sentiment confidence
        sentimentScores[item.text] = sentiment[0]?.score || 0.5;
        
        // Count meaningful patterns with context
        patterns.patterns.forEach(pattern => {
          const key = pattern.text;
          if (!patternCounts[key]) {
            patternCounts[key] = { 
              count: 0, 
              totalEnergy: 0, 
              examples: [],
              confidence: pattern.confidence,
              type: pattern.type
            };
          }
          patternCounts[key].count++;
          patternCounts[key].totalEnergy += item.energy;
          patternCounts[key].examples.push({
            text: item.text,
            energy: item.energy,
            date: item.date,
            sentiment: sentiment[0]?.score || 0.5
          });
        });
      }

      // Generate insights from patterns with enhanced scoring
      const significantPatterns = Object.entries(patternCounts)
        .filter(([pattern, data]) => data.count >= 2)
        .map(([pattern, data]) => {
          // Enhanced scoring considering frequency, energy level, and sentiment
          const avgEnergy = data.totalEnergy / data.count;
          const avgSentiment = data.examples.reduce((sum, ex) => sum + ex.sentiment, 0) / data.examples.length;
          const score = (avgEnergy * 0.4) + (avgSentiment * 0.3) + (data.count * 0.3);
          return [pattern, { ...data, score, avgEnergy, avgSentiment }];
        })
        .sort(([,a], [,b]) => b.score - a.score)
        .slice(0, 3);

      significantPatterns.forEach(([pattern, data]) => {
        const confidence = Math.min(0.95, 0.6 + (data.count * 0.1) + (data.confidence * 0.2));
        
        let insightTitle;
        let description;
        
        if (data.type === 'energy_booster') {
          insightTitle = `⚡ Proven Energy Booster: "${pattern}"`;
          description = `"${pattern}" appears in ${data.count} entries with ${data.avgEnergy.toFixed(1)}/10 average energy. This consistently energizes you!`;
        } else if (data.type === 'custom_pattern') {
          insightTitle = `🔋 Personal Energy Pattern: "${pattern}"`;
          description = `"${pattern}" is your unique energy pattern, appearing ${data.count} times with ${data.avgEnergy.toFixed(1)}/10 energy.`;
        } else {
          insightTitle = `⚡ Energy Pattern: "${pattern}"`;
          description = `"${pattern}" appears ${data.count} times with ${data.avgEnergy.toFixed(1)}/10 average energy.`;
        }
        
        if (data.avgSentiment > 0.7) {
          description += ` You feel very positive about this!`;
        }

        insights.push({
          title: insightTitle,
          description: description,
          confidence: confidence,
          type: 'energy',
          data: {
            pattern,
            frequency: data.count,
            averageEnergy: data.avgEnergy,
            averageSentiment: data.avgSentiment,
            examples: data.examples.slice(0, 2),
            patternType: data.type
          }
        });
      });

      logs.push(`Generated ${insights.length} enhanced energy insights`);
      return { insights, logs };

    } catch (error) {
      console.error('❌ [Enhanced NLP] Error analyzing energy sources:', error);
      return { insights: [], logs: [`Error: ${error.message}`] };
    }
  }

  // Analyze stress sources using enhanced NLP
  async analyzeStressSources(entries) {
    try {
      const stressTexts = entries
        .filter(entry => entry.stressSources && entry.stressSources.trim())
        .map(entry => ({
          text: entry.stressSources.trim(),
          stress: entry.stressLevels ? 
            Object.values(entry.stressLevels).filter(v => v !== null).reduce((sum, val) => sum + val, 0) / 
            Object.values(entry.stressLevels).filter(v => v !== null).length : 0,
          date: entry.date
        }));

      if (stressTexts.length === 0) {
        return { insights: [], logs: ['No stress sources found'] };
      }

      const insights = [];
      const patternCounts = {};
      const sentimentScores = {};
      const logs = [`Analyzing ${stressTexts.length} stress sources with enhanced NLP`];

      // Analyze each stress source with enhanced NLP
      for (const item of stressTexts) {
        const sentiment = await this.analyzeSentiment(item.text);
        const patterns = await this.extractPatterns(item.text);
        
        sentimentScores[item.text] = sentiment[0]?.score || 0.5;
        
        // Count stress patterns with enhanced context
        patterns.patterns.forEach(pattern => {
          const key = pattern.text;
          if (!patternCounts[key]) {
            patternCounts[key] = { 
              count: 0, 
              totalStress: 0, 
              examples: [],
              confidence: pattern.confidence,
              type: pattern.type
            };
          }
          patternCounts[key].count++;
          patternCounts[key].totalStress += item.stress;
          patternCounts[key].examples.push({
            text: item.text,
            stress: item.stress,
            date: item.date,
            sentiment: sentiment[0]?.score || 0.5
          });
        });

      }

      // Generate insights from stress patterns with enhanced scoring
      const significantPatterns = Object.entries(patternCounts)
        .filter(([pattern, data]) => data.count >= 2)
        .map(([pattern, data]) => {
          const avgStress = data.totalStress / data.count;
          const avgSentiment = data.examples.reduce((sum, ex) => sum + ex.sentiment, 0) / data.examples.length;
          // For stress, lower sentiment scores (more negative) are more significant
          const sentimentWeight = 1 - avgSentiment;
          const score = (avgStress * 0.4) + (sentimentWeight * 0.3) + (data.count * 0.3);
          return [pattern, { ...data, score, avgStress, avgSentiment }];
        })
        .sort(([,a], [,b]) => b.score - a.score)
        .slice(0, 3);

      significantPatterns.forEach(([pattern, data]) => {
        const confidence = Math.min(0.95, 0.6 + (data.count * 0.1) + (data.confidence * 0.2));
        
        let insightTitle;
        let description;
        
        if (data.type === 'stress_trigger') {
          insightTitle = `😰 Major Stress Trigger: "${pattern}"`;
          description = `"${pattern}" appears in ${data.count} entries with ${data.avgStress.toFixed(1)}/10 average stress. This is a confirmed stressor!`;
        } else if (data.type === 'custom_pattern') {
          insightTitle = `� Personal Stress Pattern: "${pattern}"`;
          description = `"${pattern}" is your unique stress pattern, appearing ${data.count} times with ${data.avgStress.toFixed(1)}/10 stress.`;
        } else {
          insightTitle = `😰 Stress Pattern: "${pattern}"`;
          description = `"${pattern}" appears ${data.count} times with ${data.avgStress.toFixed(1)}/10 average stress.`;
        }
        
        if (data.avgStress > 7) {
          description += ` This is a high-impact stressor that needs attention.`;
        } else if (data.avgStress > 5) {
          description += ` Consider strategies to manage this moderate stressor.`;
        }

        insights.push({
          title: insightTitle,
          description: description,
          confidence: confidence,
          type: 'stress',
          data: {
            pattern,
            frequency: data.count,
            averageStress: data.avgStress,
            averageSentiment: data.avgSentiment,
            examples: data.examples.slice(0, 2),
            patternType: data.type
          }
        });
      });

      logs.push(`Generated ${insights.length} enhanced stress insights`);
      return { insights, logs };

    } catch (error) {
      console.error('❌ [Enhanced NLP] Error analyzing stress sources:', error);
      return { insights: [], logs: [`Error: ${error.message}`] };
    }
  }

  // Analyze correlations between energy and stress using enhanced NLP
  async analyzeEnergyStressCorrelation(entries) {
    try {
      const insights = [];
      const logs = ['Starting enhanced correlation analysis'];
      
      // Find entries with both energy and stress data
      const correlationData = entries
        .filter(entry => 
          entry.energySources && entry.energySources.trim() &&
          entry.stressSources && entry.stressSources.trim()
        )
        .map(entry => ({
          date: entry.date,
          energyText: entry.energySources.trim(),
          stressText: entry.stressSources.trim(),
          energy: entry.energyLevels ? 
            Object.values(entry.energyLevels).filter(v => v !== null).reduce((sum, val) => sum + val, 0) / 
            Object.values(entry.energyLevels).filter(v => v !== null).length : 0,
          stress: entry.stressLevels ? 
            Object.values(entry.stressLevels).filter(v => v !== null).reduce((sum, val) => sum + val, 0) / 
            Object.values(entry.stressLevels).filter(v => v !== null).length : 0
        }));

      if (correlationData.length < 3) {
        logs.push('Not enough correlation data');
        return { insights, logs };
      }

      // Enhanced correlation analysis with sentiment
      const avgEnergy = correlationData.reduce((sum, item) => sum + item.energy, 0) / correlationData.length;
      const avgStress = correlationData.reduce((sum, item) => sum + item.stress, 0) / correlationData.length;
      
      // Analyze sentiment patterns in correlation data
      const correlationWithSentiment = [];
      for (const item of correlationData) {
        const energySentiment = await this.analyzeSentiment(item.energyText);
        const stressSentiment = await this.analyzeSentiment(item.stressText);
        
        correlationWithSentiment.push({
          ...item,
          energySentiment: energySentiment[0]?.score || 0.5,
          stressSentiment: stressSentiment[0]?.score || 0.5
        });
      }
      
      // Find optimal state patterns (low stress + high energy + positive sentiment)
      const optimalStates = correlationWithSentiment.filter(item => 
        item.stress < avgStress && 
        item.energy > avgEnergy &&
        item.energySentiment > 0.6
      );

      // Find burnout risk patterns (high stress + low energy + negative sentiment)
      const burnoutRisk = correlationWithSentiment.filter(item => 
        item.stress > avgStress && 
        item.energy < avgEnergy &&
        item.stressSentiment < 0.4
      );

      if (optimalStates.length >= 2) {
        const avgOptimalEnergy = optimalStates.reduce((sum, item) => sum + item.energy, 0) / optimalStates.length;
        const avgOptimalStress = optimalStates.reduce((sum, item) => sum + item.stress, 0) / optimalStates.length;
        
        insights.push({
          title: `🎯 Your Optimal State Pattern`,
          description: `You have ${optimalStates.length} days with your ideal balance: ${avgOptimalEnergy.toFixed(1)}/10 energy and ${avgOptimalStress.toFixed(1)}/10 stress. These are your peak performance days!`,
          confidence: 0.85,
          type: 'correlation',
          data: {
            examples: optimalStates.slice(0, 2),
            pattern: 'optimal_state',
            count: optimalStates.length
          }
        });
      }

      if (burnoutRisk.length >= 2) {
        const avgBurnoutEnergy = burnoutRisk.reduce((sum, item) => sum + item.energy, 0) / burnoutRisk.length;
        const avgBurnoutStress = burnoutRisk.reduce((sum, item) => sum + item.stress, 0) / burnoutRisk.length;
        
        insights.push({
          title: `⚠️ Burnout Risk Pattern Detected`,
          description: `${burnoutRisk.length} days show concerning patterns: ${avgBurnoutEnergy.toFixed(1)}/10 energy with ${avgBurnoutStress.toFixed(1)}/10 stress. Consider implementing stress management strategies.`,
          confidence: 0.85,
          type: 'correlation',
          data: {
            examples: burnoutRisk.slice(0, 2),
            pattern: 'burnout_risk',
            count: burnoutRisk.length
          }
        });
      }

      logs.push(`Analyzed ${correlationData.length} correlation data points with sentiment`);
      logs.push(`Generated ${insights.length} enhanced correlation insights`);
      
      return { insights, logs };

    } catch (error) {
      console.error('❌ [Enhanced NLP] Error in correlation analysis:', error);
      return { insights: [], logs: [`Error: ${error.message}`] };
    }
  }

  // Clear cache to free memory
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export default new LLMAnalyticsService();
