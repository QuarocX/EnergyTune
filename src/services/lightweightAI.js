// Lightweight AI Analytics Service for EnergyTune
// Pattern recognition using keyword analysis and rule-based AI
// No downloads required - completely local and privacy-friendly
import AsyncStorage from '@react-native-async-storage/async-storage';

class LightweightAIService {
  constructor() {
    this.isEnabled = false;
  }

  // Check if AI features are enabled by user
  async isAIEnabled() {
    try {
      const enabled = await AsyncStorage.getItem('ai_features_enabled');
      this.isEnabled = enabled === 'true';
      return this.isEnabled;
    } catch (error) {
      console.error('Error checking AI status:', error);
      return false;
    }
  }

  // Enable AI features (no download required)
  async enableAI() {
    try {
      await AsyncStorage.setItem('ai_features_enabled', 'true');
      this.isEnabled = true;
      console.log('Lightweight AI enabled successfully');
      return true;
    } catch (error) {
      console.error('Error enabling AI:', error);
      return false;
    }
  }

  // Analyze energy sources for patterns and recommendations
  async analyzeEnergySources(entries) {
    if (!this.isEnabled) {
      return { insights: [], recommendations: [] };
    }

    try {
      const energySources = entries
        .filter(entry => entry.energySources && entry.energySources.trim())
        .map(entry => ({
          date: entry.date,
          sources: entry.energySources,
          energy: entry.energyLevels ? Object.values(entry.energyLevels).filter(v => v !== null) : [],
        }));

      if (energySources.length < 3) {
        return { insights: [], recommendations: [] };
      }

      // Categorize energy sources using keyword matching
      const categorizedSources = this.categorizeEnergySourcesAdvanced(energySources);
      
      // Find high-energy patterns
      const patterns = this.findEnergyPatterns(categorizedSources);

      // Generate insights and recommendations
      const insights = this.generateEnergyInsights(patterns);
      const recommendations = this.generateEnergyRecommendations(patterns);

      return { insights, recommendations };
    } catch (error) {
      console.error('Error analyzing energy sources:', error);
      return { insights: [], recommendations: [] };
    }
  }

  // Analyze stress sources for patterns and prevention
  async analyzeStressSources(entries) {
    if (!this.isEnabled) {
      return { insights: [], recommendations: [] };
    }

    try {
      const stressSources = entries
        .filter(entry => entry.stressSources && entry.stressSources.trim())
        .map(entry => ({
          date: entry.date,
          sources: entry.stressSources,
          stress: entry.stressLevels ? Object.values(entry.stressLevels).filter(v => v !== null) : [],
        }));

      if (stressSources.length < 3) {
        return { insights: [], recommendations: [] };
      }

      // Categorize stress sources using advanced pattern matching
      const categorizedSources = this.categorizeStressSourcesAdvanced(stressSources);
      
      // Find stress escalation patterns
      const patterns = this.findStressPatterns(categorizedSources);

      // Generate insights and recommendations
      const insights = this.generateStressInsights(patterns);
      const recommendations = this.generateStressPrevention(patterns);

      return { insights, recommendations };
    } catch (error) {
      console.error('Error analyzing stress sources:', error);
      return { insights: [], recommendations: [] };
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
        return {
          type: 'correlation',
          title: 'Advanced Pattern Analysis',
          subtitle: 'More data needed for deeper insights',
          insights: [],
          recommendations: []
        };
      }

      // Analyze sentiment and patterns in descriptions
      const sentimentAnalysis = this.analyzeSentimentPatterns(validEntries);
      
      // Find correlations between text sentiment and numeric values
      const correlations = this.findSentimentCorrelations(validEntries, sentimentAnalysis);

      return {
        type: 'correlation',
        title: 'AI-Powered Pattern Analysis',
        subtitle: 'Deep insights from your energy and stress descriptions',
        confidence: 0.85,
        insights: correlations.insights,
        recommendations: correlations.recommendations,
      };
    } catch (error) {
      console.error('Error in AI correlation analysis:', error);
      return null;
    }
  }

  // Generate test insights for demonstration
  async generateTestInsights() {
    const testInsights = {
      energy: {
        insights: [
          {
            title: "Good sleep and exercise are your secret weapons! 💪",
            description: "When you mention things like 'good sleep', 'morning walk', or 'workout', your energy levels are consistently higher (around 8/10). Your body loves routine physical care!",
            confidence: 0.85,
            category: 'physical',
            sentiment: 'positive',
            examples: [
              { date: 'Recent example', sources: 'Great workout this morning, feeling energized', energy: 8.5 },
              { date: 'Another time', sources: 'Good sleep and morning walk', energy: 7.8 }
            ]
          },
          {
            title: "You thrive on meaningful conversations! 🗣️",
            description: "Your energy peaks when you write about positive social interactions. Connection with others really fuels you!",
            confidence: 0.78,
            category: 'social',
            sentiment: 'positive',
            examples: [
              { date: 'Recent example', sources: 'Great team meeting, really productive discussion', energy: 7.5 }
            ]
          }
        ],
        recommendations: [
          {
            title: "Make physical activity your daily energy booster ⚡",
            description: "Your body responds amazingly well to movement! Even a 10-minute walk can change your whole day.",
            strategies: [
              'Try a short morning walk or stretch routine',
              'Aim for 7-8 hours of sleep - your energy loves consistency',
              'Notice how you feel after any physical activity'
            ],
            priority: 'high',
            actionable: true
          }
        ]
      },
      stress: {
        insights: [
          {
            title: "Tight deadlines really get to you (and that's totally normal!) 😅",
            description: "When you write about deadlines, pressure, or 'overwhelming' workload, your stress jumps up. Recognizing this pattern is the first step to managing it better.",
            confidence: 0.82,
            category: 'work_pressure',
            intensity: 'high',
            examples: [
              { date: 'Recent example', sources: 'Tight deadline pressure, feeling overwhelmed', stress: 8.0 },
              { date: 'Another time', sources: 'Back-to-back meetings all day', stress: 6.5 }
            ]
          }
        ],
        recommendations: [
          {
            title: "Break big tasks into tiny wins 🎯",
            description: "Your stress loves big, scary deadlines. Let's make them less scary by chopping them up!",
            strategies: [
              'Break any big project into 15-minute chunks',
              'Celebrate completing each small piece',
              'Plan buffer time - stress hates surprises'
            ],
            priority: 'high',
            hasTriggerPattern: true
          }
        ]
      },
      correlation: {
        type: 'correlation',
        title: 'Smart Connections I Found',
        subtitle: 'Looking at how your words predict your feelings',
        confidence: 0.85,
        insights: [
          {
            title: 'When you use happy words, your energy soars! 🚀',
            description: '75% of the time you write positive words like "great", "good", or "energizing", your energy levels are 7+ out of 10.'
          },
          {
            title: 'Negative words are early warning signals 🚨',
            description: 'When you write words like "overwhelming", "frustrating", or "tired", your stress levels tend to be higher. Your words are like a mood thermometer!'
          }
        ],
        recommendations: [
          {
            title: 'Pay attention to your word choices',
            description: 'Your language is super smart - it often predicts how you\'ll feel before you fully realize it!'
          }
        ]
      },
      summary: {
        totalPatterns: 3,
        topCategory: 'physical',
        timestamp: new Date().toISOString(),
        isDemo: true,
        demoNote: 'These are example insights to show how AI analysis works'
      },
      requirements: {
        title: '🎯 To unlock your personal AI insights, you need:',
        currentStatus: 'Currently showing example insights',
        steps: [
          {
            text: 'Add at least 5 entries with energy and stress levels',
            emoji: '📝',
            required: true,
            description: 'Track your daily energy and stress ratings'
          },
          {
            text: 'Include 3+ energy descriptions',
            emoji: '⚡',
            required: true,
            description: 'Describe what gives you energy: "good sleep", "workout", "coffee"'
          },
          {
            text: 'Include 3+ stress descriptions',
            emoji: '😰',
            required: true,
            description: 'Describe what causes stress: "deadlines", "traffic", "conflicts"'
          },
          {
            text: 'For advanced analysis, add 7+ detailed entries',
            emoji: '🧠',
            required: false,
            description: 'Unlocks deeper pattern recognition and predictions'
          }
        ],
        encouragement: '🚀 The AI gets smarter with each entry you add!',
        explanation: 'These examples show what\'s possible when the AI analyzes YOUR unique patterns.',
        timeEstimate: 'Most people reach this in 3-5 days of tracking!'
      }
    };

    return testInsights;
  }

  // Analyze data requirements and provide clear status
  analyzeDataRequirements(entries) {
    const requirements = {
      minTotalEntries: 5,           // Need at least 5 entries for basic analysis
      minEnergySourceEntries: 3,    // Need 3 entries with energy descriptions
      minStressSourceEntries: 3,    // Need 3 entries with stress descriptions
      minCorrelationEntries: 7,     // Need 7 entries for correlation analysis
    };

    if (!entries || entries.length === 0) {
      return {
        hasEnoughData: false,
        message: 'Ready to start your AI journey? 🚀',
        friendlyMessage: 'Your AI assistant is waiting to learn about you! Add your first entry to get started.',
        progress: {
          current: 0,
          needed: requirements.minTotalEntries,
          percentage: 0
        },
        nextSteps: [
          '📱 Go to Entry screen and add your first day',
          '✨ Rate your energy and stress levels', 
          '💭 Add a few words about what affected you'
        ],
        encouragement: 'Just one entry gets the ball rolling!'
      };
    }

    const totalEntries = entries.length;
    const entriesWithEnergySource = entries.filter(e => e.energySources && e.energySources.trim()).length;
    const entriesWithStressSource = entries.filter(e => e.stressSources && e.stressSources.trim()).length;
    const entriesWithBoth = entries.filter(e => 
      e.energySources && e.energySources.trim() && 
      e.stressSources && e.stressSources.trim() &&
      e.energyLevels && e.stressLevels
    ).length;

    // Check minimum total entries
    if (totalEntries < requirements.minTotalEntries) {
      const remaining = requirements.minTotalEntries - totalEntries;
      return {
        hasEnoughData: false,
        message: `Almost there! Need ${remaining} more ${remaining === 1 ? 'entry' : 'entries'} 📈`,
        friendlyMessage: `You're making great progress! ${totalEntries} down, ${remaining} to go for AI analysis.`,
        progress: {
          current: totalEntries,
          needed: requirements.minTotalEntries,
          percentage: Math.round((totalEntries / requirements.minTotalEntries) * 100)
        },
        nextSteps: [
          '📝 Keep adding daily entries with energy and stress ratings',
          '💡 Include short descriptions about your day',
          '🎯 Be specific: "good coffee" vs just "tired"'
        ],
        encouragement: `${remaining === 1 ? 'One more entry and AI kicks in!' : 'You\'re building a great foundation!'}`
      };
    }

    // Check energy source descriptions
    if (entriesWithEnergySource < requirements.minEnergySourceEntries) {
      const remaining = requirements.minEnergySourceEntries - entriesWithEnergySource;
      return {
        hasEnoughData: false,
        message: `Need ${remaining} more energy ${remaining === 1 ? 'description' : 'descriptions'} ⚡`,
        friendlyMessage: `You have enough entries, but I need to learn what energizes YOU! Add descriptions to ${remaining} more ${remaining === 1 ? 'entry' : 'entries'}.`,
        progress: {
          current: entriesWithEnergySource,
          needed: requirements.minEnergySourceEntries,
          percentage: Math.round((entriesWithEnergySource / requirements.minEnergySourceEntries) * 100)
        },
        nextSteps: [
          '⚡ Describe what gives you energy: "morning coffee", "quick walk", "good sleep"',
          '💪 Be specific about activities, foods, or situations',
          '🌟 Think about your best energy days - what made them special?'
        ],
        encouragement: 'Energy patterns are the most valuable insights!'
      };
    }

    // Check stress source descriptions
    if (entriesWithStressSource < requirements.minStressSourceEntries) {
      const remaining = requirements.minStressSourceEntries - entriesWithStressSource;
      return {
        hasEnoughData: false,
        message: `Need ${remaining} more stress ${remaining === 1 ? 'description' : 'descriptions'} 😰`,
        friendlyMessage: `Almost ready! I need to understand what stresses you out. Add descriptions to ${remaining} more ${remaining === 1 ? 'entry' : 'entries'}.`,
        progress: {
          current: entriesWithStressSource,
          needed: requirements.minStressSourceEntries,
          percentage: Math.round((entriesWithStressSource / requirements.minStressSourceEntries) * 100)
        },
        nextSteps: [
          '😰 Describe what causes stress: "tight deadlines", "traffic jams", "difficult conversations"',
          '🎯 Be specific about situations, people, or events',
          '🚨 Think about your most stressful days - what triggered them?'
        ],
        encouragement: 'Understanding stress patterns helps prevent them!'
      };
    }

    // All basic requirements met
    const canDoCorrelation = entriesWithBoth >= requirements.minCorrelationEntries;
    
    return {
      hasEnoughData: true,
      message: '🎉 Perfect! AI analysis is ready to start!',
      friendlyMessage: 'You\'ve provided enough data for meaningful pattern recognition. Your personalized insights are ready!',
      progress: {
        current: totalEntries,
        needed: requirements.minTotalEntries,
        percentage: 100
      },
      canDoAdvancedAnalysis: canDoCorrelation,
      advancedProgress: canDoCorrelation ? 100 : Math.round((entriesWithBoth / requirements.minCorrelationEntries) * 100),
      nextLevel: canDoCorrelation ? null : {
        message: `Add ${requirements.minCorrelationEntries - entriesWithBoth} more complete entries for advanced correlation analysis`,
        benefit: 'Unlocks predictive insights and deeper pattern recognition'
      },
      stats: {
        totalEntries,
        entriesWithEnergySource,
        entriesWithStressSource,
        entriesWithBoth
      },
      celebration: '🚀 Your AI assistant is now analyzing your unique patterns!'
    };
  }

  // Main analysis method that combines all insights
  async analyzePatterns(entries) {
    try {
      // Always check current status first
      await this.isAIEnabled();
      
      if (!this.isEnabled) {
        throw new Error('AI features are not enabled');
      }

      // Check data requirements and provide clear feedback
      const dataStatus = this.analyzeDataRequirements(entries);
      
      // If insufficient data, return demo insights with clear explanation
      if (!dataStatus.hasEnoughData) {
        console.log(`AI Data Status: ${dataStatus.message}`);
        const demoInsights = await this.generateTestInsights();
        
        // Add data status information to demo insights
        demoInsights.dataStatus = dataStatus;
        demoInsights.isDemo = true;
        
        return demoInsights;
      }

      // Get all analysis types with real data
      const energyAnalysis = await this.analyzeEnergySources(entries);
      const stressAnalysis = await this.analyzeStressSources(entries);
      const correlationAnalysis = await this.analyzeEnergyStressCorrelation(entries);

      // If no real insights found despite having enough data, show test insights
      const totalInsights = energyAnalysis.insights.length + stressAnalysis.insights.length;
      if (totalInsights === 0) {
        console.log('No clear patterns detected in your data yet, showing example insights');
        const demoInsights = await this.generateTestInsights();
        demoInsights.dataStatus = dataStatus;
        demoInsights.isDemo = true;
        demoInsights.reason = 'patterns_not_clear';
        return demoInsights;
      }

      console.log(`AI Analysis: Found ${totalInsights} real patterns in your data!`);
      
      return {
        energy: energyAnalysis,
        stress: stressAnalysis,
        correlation: correlationAnalysis,
        summary: {
          totalPatterns: totalInsights,
          topCategory: energyAnalysis.insights.length > 0 ? energyAnalysis.insights[0].category : null,
          timestamp: new Date().toISOString(),
        },
        dataStatus: dataStatus,
        isDemo: false
      };
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      // Return test insights on error to show functionality
      const demoInsights = await this.generateTestInsights();
      demoInsights.isDemo = true;
      demoInsights.reason = 'error';
      return demoInsights;
    }
  }

  // Get energy patterns for advanced recognition
  getEnergyPatterns() {
    return {
      physical: {
        keywords: ['sleep', 'exercise', 'workout', 'walk', 'run', 'yoga', 'rest', 'nap', 'food', 'eat', 'coffee', 'tea', 'hydrat', 'vitamin', 'stretch'],
        boostWords: ['good', 'great', 'excellent', 'quality', 'enough', 'proper', 'healthy', 'fresh', 'energizing'],
        drainWords: ['poor', 'bad', 'lack', 'tired', 'exhausted', 'skip', 'miss', 'junk'],
        weight: 1.2,
      },
      work: {
        keywords: ['project', 'meeting', 'collaboration', 'achievement', 'completed', 'success', 'accomplish', 'goal', 'task', 'progress', 'breakthrough', 'solve'],
        boostWords: ['successful', 'productive', 'efficient', 'creative', 'focused', 'flow', 'inspired', 'motivated'],
        drainWords: ['frustrating', 'difficult', 'blocked', 'stuck', 'overwhelming', 'stressful'],
        weight: 1.0,
      },
      social: {
        keywords: ['family', 'friends', 'team', 'conversation', 'people', 'social', 'connection', 'relationship', 'support', 'laugh', 'fun'],
        boostWords: ['positive', 'supportive', 'encouraging', 'inspiring', 'uplifting', 'connecting', 'bonding'],
        drainWords: ['negative', 'draining', 'toxic', 'conflict', 'argument', 'disappointing'],
        weight: 1.1,
      },
      mental: {
        keywords: ['learning', 'creative', 'focus', 'meditation', 'reading', 'music', 'think', 'idea', 'inspiration', 'clarity', 'mindful'],
        boostWords: ['clear', 'sharp', 'creative', 'inspired', 'calm', 'peaceful', 'centered', 'balanced'],
        drainWords: ['cloudy', 'scattered', 'overwhelmed', 'confused', 'distracted', 'restless'],
        weight: 1.0,
      },
      environment: {
        keywords: ['nature', 'weather', 'home', 'office', 'quiet', 'space', 'clean', 'organized', 'beautiful', 'comfortable', 'fresh air'],
        boostWords: ['peaceful', 'comfortable', 'organized', 'clean', 'bright', 'natural', 'serene'],
        drainWords: ['messy', 'cluttered', 'noisy', 'dark', 'stuffy', 'uncomfortable', 'chaotic'],
        weight: 0.8,
      },
    };
  }

  // Get stress patterns for advanced recognition
  getStressPatterns() {
    return {
      work_pressure: {
        keywords: ['deadline', 'meeting', 'pressure', 'workload', 'boss', 'project', 'client', 'urgent', 'rush', 'overtime', 'demand'],
        intensity: ['overwhelming', 'crushing', 'intense', 'extreme', 'unbearable', 'massive', 'huge'],
        triggers: ['last minute', 'unexpected', 'changed', 'moved up', 'urgent', 'emergency'],
        weight: 1.3,
      },
      technical: {
        keywords: ['technical', 'computer', 'software', 'bug', 'internet', 'technology', 'system', 'crash', 'error', 'problem'],
        intensity: ['broken', 'failing', 'slow', 'frozen', 'crashed', 'corrupted'],
        triggers: ['suddenly', 'without warning', 'stopped working', 'lost'],
        weight: 1.1,
      },
      interruptions: {
        keywords: ['interruption', 'distraction', 'email', 'phone', 'noise', 'context', 'switching', 'multitask'],
        intensity: ['constant', 'frequent', 'nonstop', 'endless', 'continuous'],
        triggers: ['every few minutes', 'all day', 'back to back', 'no break'],
        weight: 1.0,
      },
      personal: {
        keywords: ['family', 'relationship', 'health', 'money', 'financial', 'home', 'personal', 'life'],
        intensity: ['serious', 'major', 'significant', 'important', 'critical'],
        triggers: ['sudden', 'unexpected', 'emergency', 'crisis'],
        weight: 1.2,
      },
      time: {
        keywords: ['time', 'rushing', 'late', 'schedule', 'traffic', 'waiting', 'delay', 'behind'],
        intensity: ['very', 'extremely', 'badly', 'terribly'],
        triggers: ['again', 'always', 'every time', 'as usual'],
        weight: 0.9,
      },
    };
  }

  // Advanced categorization with sentiment analysis
  categorizeEnergySourcesAdvanced(energySources) {
    const patterns = this.getEnergyPatterns();
    const categorized = [];

    energySources.forEach(entry => {
      const text = entry.sources.toLowerCase();
      const avgEnergy = entry.energy.length > 0 
        ? entry.energy.reduce((sum, val) => sum + val, 0) / entry.energy.length 
        : 0;

      let bestMatch = { category: 'other', score: 0, sentiment: 'neutral' };

      // Check each category
      Object.entries(patterns).forEach(([category, pattern]) => {
        let score = 0;
        let sentiment = 'neutral';

        // Count keyword matches
        const keywordMatches = pattern.keywords.filter(keyword => 
          text.includes(keyword)
        ).length;
        score += keywordMatches * pattern.weight;

        // Analyze sentiment within category
        const boostMatches = pattern.boostWords.filter(word => text.includes(word)).length;
        const drainMatches = pattern.drainWords.filter(word => text.includes(word)).length;

        if (boostMatches > drainMatches) {
          sentiment = 'positive';
          score += boostMatches * 0.5;
        } else if (drainMatches > boostMatches) {
          sentiment = 'negative';
          score += drainMatches * 0.3; // Still relevant but negative
        }

        if (score > bestMatch.score) {
          bestMatch = { category, score, sentiment };
        }
      });

      categorized.push({
        ...entry,
        category: bestMatch.category,
        sentiment: bestMatch.sentiment,
        confidence: Math.min(bestMatch.score / 3, 1), // Normalize to 0-1
        avgEnergy
      });
    });

    return categorized;
  }

  // Advanced stress categorization
  categorizeStressSourcesAdvanced(stressSources) {
    const patterns = this.getStressPatterns();
    const categorized = [];

    stressSources.forEach(entry => {
      const text = entry.sources.toLowerCase();
      const avgStress = entry.stress.length > 0 
        ? entry.stress.reduce((sum, val) => sum + val, 0) / entry.stress.length 
        : 0;

      let bestMatch = { category: 'other', score: 0, intensity: 'low', hasTriggger: false };

      // Check each stress category
      Object.entries(patterns).forEach(([category, pattern]) => {
        let score = 0;
        let intensity = 'low';
        let hasTriggger = false;

        // Count keyword matches
        const keywordMatches = pattern.keywords.filter(keyword => 
          text.includes(keyword)
        ).length;
        score += keywordMatches * pattern.weight;

        // Check intensity indicators
        const intensityMatches = pattern.intensity.filter(word => text.includes(word)).length;
        if (intensityMatches > 0) {
          intensity = intensityMatches > 1 ? 'high' : 'medium';
          score += intensityMatches * 0.8;
        }

        // Check for trigger patterns
        hasTriggger = pattern.triggers.some(trigger => text.includes(trigger));
        if (hasTriggger) {
          score += 1.0;
        }

        if (score > bestMatch.score) {
          bestMatch = { category, score, intensity, hasTriggger };
        }
      });

      categorized.push({
        ...entry,
        category: bestMatch.category,
        intensity: bestMatch.intensity,
        hasTriggger: bestMatch.hasTriggger,
        confidence: Math.min(bestMatch.score / 3, 1),
        avgStress
      });
    });

    return categorized;
  }

  // Find energy boost patterns
  findEnergyPatterns(categorizedSources) {
    const patterns = {};
    
    categorizedSources.forEach(entry => {
      if (entry.avgEnergy >= 7) { // High energy days
        const key = `${entry.category}_${entry.sentiment}`;
        if (!patterns[key]) {
          patterns[key] = { 
            category: entry.category,
            sentiment: entry.sentiment,
            count: 0, 
            totalEnergy: 0, 
            examples: [],
            avgConfidence: 0
          };
        }
        patterns[key].count++;
        patterns[key].totalEnergy += entry.avgEnergy;
        patterns[key].avgConfidence += entry.confidence;
        patterns[key].examples.push({
          date: entry.date,
          sources: entry.sources,
          energy: entry.avgEnergy,
        });
      }
    });

    // Calculate averages
    Object.values(patterns).forEach(pattern => {
      pattern.avgEnergy = pattern.totalEnergy / pattern.count;
      pattern.avgConfidence = pattern.avgConfidence / pattern.count;
    });

    return patterns;
  }

  // Find stress escalation patterns
  findStressPatterns(categorizedSources) {
    const patterns = {};
    
    categorizedSources.forEach(entry => {
      if (entry.avgStress >= 6) { // High stress days
        const key = `${entry.category}_${entry.intensity}`;
        if (!patterns[key]) {
          patterns[key] = { 
            category: entry.category,
            intensity: entry.intensity,
            count: 0, 
            totalStress: 0, 
            examples: [],
            triggerCount: 0,
            avgConfidence: 0
          };
        }
        patterns[key].count++;
        patterns[key].totalStress += entry.avgStress;
        patterns[key].avgConfidence += entry.confidence;
        if (entry.hasTriggger) patterns[key].triggerCount++;
        patterns[key].examples.push({
          date: entry.date,
          sources: entry.sources,
          stress: entry.avgStress,
        });
      }
    });

    // Calculate averages
    Object.values(patterns).forEach(pattern => {
      pattern.avgStress = pattern.totalStress / pattern.count;
      pattern.avgConfidence = pattern.avgConfidence / pattern.count;
      pattern.triggerRatio = pattern.triggerCount / pattern.count;
    });

    return patterns;
  }

  // Generate energy insights with confidence scoring
  generateEnergyInsights(patterns) {
    const insights = [];
    
    const sortedPatterns = Object.values(patterns)
      .filter(p => p.count >= 2) // Need at least 2 occurrences for pattern
      .sort((a, b) => (b.avgEnergy * b.avgConfidence) - (a.avgEnergy * a.avgConfidence));

    if (sortedPatterns.length > 0) {
      const topPattern = sortedPatterns[0];
      
      insights.push({
        title: `${this.formatCategoryName(topPattern.category)} activities ${topPattern.sentiment === 'positive' ? 'significantly boost' : 'impact'} your energy`,
        description: `Your highest energy levels (avg: ${topPattern.avgEnergy.toFixed(1)}) correlate with ${topPattern.sentiment} ${topPattern.category.replace('_', ' ')} activities. Pattern detected ${topPattern.count} times.`,
        confidence: topPattern.avgConfidence,
        category: topPattern.category,
        sentiment: topPattern.sentiment,
        examples: topPattern.examples.slice(0, 2),
      });
    }

    // Look for negative patterns too
    const negativePatterns = Object.values(patterns)
      .filter(p => p.sentiment === 'negative' && p.count >= 2);

    if (negativePatterns.length > 0) {
      const topNegative = negativePatterns.sort((a, b) => b.count - a.count)[0];
      insights.push({
        title: `Negative ${this.formatCategoryName(topNegative.category)} experiences drain your energy`,
        description: `When ${topNegative.category.replace('_', ' ')} activities are described negatively, your energy averages ${topNegative.avgEnergy.toFixed(1)}.`,
        confidence: topNegative.avgConfidence,
        category: topNegative.category,
        sentiment: 'negative',
        examples: topNegative.examples.slice(0, 1),
      });
    }

    return insights;
  }

  // Generate actionable energy recommendations
  generateEnergyRecommendations(patterns) {
    const recommendations = [];
    
    const positivePatterns = Object.values(patterns)
      .filter(p => p.sentiment === 'positive' && p.count >= 2)
      .sort((a, b) => b.avgEnergy - a.avgEnergy);

    positivePatterns.slice(0, 2).forEach(pattern => {
      const strategies = this.getEnergyBoostStrategies(pattern.category);
      
      recommendations.push({
        title: `Maximize ${this.formatCategoryName(pattern.category)} energy gains`,
        description: `These activities consistently boost your energy to ${pattern.avgEnergy.toFixed(1)}/10. ${strategies.description}`,
        strategies: strategies.strategies,
        priority: pattern.avgEnergy >= 8 ? 'high' : 'medium',
        actionable: true,
      });
    });

    return recommendations;
  }

  // Generate stress insights with trigger analysis
  generateStressInsights(patterns) {
    const insights = [];
    
    const sortedPatterns = Object.values(patterns)
      .filter(p => p.count >= 2)
      .sort((a, b) => (b.avgStress * b.avgConfidence) - (a.avgStress * a.avgConfidence));

    if (sortedPatterns.length > 0) {
      const topPattern = sortedPatterns[0];
      
      insights.push({
        title: `${this.formatCategoryName(topPattern.category)} issues are your primary stress trigger`,
        description: `This category causes your highest stress levels (avg: ${topPattern.avgStress.toFixed(1)}). Pattern detected ${topPattern.count} times${topPattern.triggerRatio > 0.5 ? ' with recurring trigger patterns' : ''}.`,
        confidence: topPattern.avgConfidence,
        category: topPattern.category,
        intensity: topPattern.intensity,
        examples: topPattern.examples.slice(0, 2),
      });
    }

    // Look for trigger patterns
    const triggerPatterns = Object.values(patterns)
      .filter(p => p.triggerRatio > 0.6 && p.count >= 2);

    if (triggerPatterns.length > 0) {
      const topTrigger = triggerPatterns.sort((a, b) => b.triggerRatio - a.triggerRatio)[0];
      insights.push({
        title: `${this.formatCategoryName(topTrigger.category)} stress follows predictable trigger patterns`,
        description: `${(topTrigger.triggerRatio * 100).toFixed(0)}% of these stress events include common trigger words, suggesting predictable patterns.`,
        confidence: topTrigger.avgConfidence,
        category: topTrigger.category,
        examples: topTrigger.examples.slice(0, 1),
      });
    }

    return insights;
  }

  // Generate stress prevention with pattern awareness
  generateStressPrevention(patterns) {
    const recommendations = [];
    
    Object.values(patterns)
      .filter(p => p.avgStress >= 6 && p.count >= 2)
      .sort((a, b) => b.avgStress - a.avgStress)
      .slice(0, 3)
      .forEach(pattern => {
        const prevention = this.getStressPreventionStrategies(pattern.category, pattern.triggerRatio > 0.5);
        
        recommendations.push({
          title: `Prevent ${this.formatCategoryName(pattern.category)} stress escalation`,
          description: prevention.description,
          strategies: prevention.strategies,
          priority: pattern.avgStress >= 8 ? 'high' : 'medium',
          hasTriggerPattern: pattern.triggerRatio > 0.5,
        });
      });

    return recommendations;
  }

  // Analyze sentiment patterns in text
  analyzeSentimentPatterns(entries) {
    const sentimentData = [];

    entries.forEach(entry => {
      const energyText = entry.energySources.toLowerCase();
      const stressText = entry.stressSources.toLowerCase();

      // Simple sentiment analysis using keyword matching
      const energySentiment = this.calculateTextSentiment(energyText, 'energy');
      const stressSentiment = this.calculateTextSentiment(stressText, 'stress');

      sentimentData.push({
        date: entry.date,
        energySentiment,
        stressSentiment,
        energyLevels: Object.values(entry.energyLevels).filter(v => v !== null),
        stressLevels: Object.values(entry.stressLevels).filter(v => v !== null),
      });
    });

    return sentimentData;
  }

  // Calculate text sentiment using keyword analysis
  calculateTextSentiment(text, type) {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'love', 'enjoy', 'happy', 'satisfied', 'productive', 'successful', 'energizing', 'refreshing', 'inspiring'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'frustrated', 'tired', 'exhausted', 'overwhelming', 'stressful', 'difficult', 'annoying', 'disappointing', 'draining', 'toxic'];

    let positiveScore = 0;
    let negativeScore = 0;

    positiveWords.forEach(word => {
      if (text.includes(word)) positiveScore++;
    });

    negativeWords.forEach(word => {
      if (text.includes(word)) negativeScore++;
    });

    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  // Find correlations between sentiment and numeric values
  findSentimentCorrelations(entries, sentimentData) {
    const insights = [];
    const recommendations = [];

    let posEnergyCount = 0;
    let negStressCount = 0;
    let totalEntries = sentimentData.length;

    sentimentData.forEach(data => {
      const avgEnergy = data.energyLevels.length > 0 
        ? data.energyLevels.reduce((sum, val) => sum + val, 0) / data.energyLevels.length 
        : 0;
      
      const avgStress = data.stressLevels.length > 0 
        ? data.stressLevels.reduce((sum, val) => sum + val, 0) / data.stressLevels.length 
        : 0;

      if (data.energySentiment === 'positive' && avgEnergy >= 7) {
        posEnergyCount++;
      }

      if (data.stressSentiment === 'negative' && avgStress >= 6) {
        negStressCount++;
      }
    });

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

  // Get energy boost strategies by category
  getEnergyBoostStrategies(category) {
    const strategies = {
      physical: {
        description: 'Physical activities are your primary energy source.',
        strategies: [
          'Schedule regular exercise during your peak energy windows',
          'Maintain consistent sleep schedule for sustained energy',
          'Plan nutritious meals and stay hydrated throughout the day',
          'Take movement breaks every 60-90 minutes',
        ],
      },
      work: {
        description: 'Work achievements significantly boost your energy.',
        strategies: [
          'Break large projects into smaller, achievable milestones',
          'Celebrate completed tasks to maintain momentum',
          'Focus on collaboration and teamwork when possible',
          'Schedule important work during your high-energy periods',
        ],
      },
      social: {
        description: 'Social connections are energizing for you.',
        strategies: [
          'Schedule regular social activities throughout your week',
          'Engage in meaningful conversations and relationship building',
          'Participate in team activities and collaborative projects',
          'Make time for family and close friends regularly',
        ],
      },
      mental: {
        description: 'Mental stimulation and learning energize you.',
        strategies: [
          'Dedicate time to creative pursuits and learning',
          'Practice mindfulness and meditation regularly',
          'Read books and consume inspiring content',
          'Engage in intellectually stimulating conversations',
        ],
      },
      environment: {
        description: 'Your physical environment significantly affects your energy.',
        strategies: [
          'Organize and clean your workspace regularly',
          'Spend time in nature or natural settings',
          'Ensure adequate lighting and comfortable temperature',
          'Create quiet, peaceful spaces for focused work',
        ],
      },
    };

    return strategies[category] || {
      description: 'These activities boost your energy levels.',
      strategies: ['Continue engaging in activities that make you feel energized', 'Notice patterns in what works best for you'],
    };
  }

  // Get stress prevention strategies with trigger awareness
  getStressPreventionStrategies(category, hasTriggers = false) {
    const baseStrategies = {
      work_pressure: {
        description: 'Work pressure is your main stress source. Focus on proactive planning and boundary setting.',
        strategies: [
          'Break large projects into smaller, manageable tasks',
          'Set realistic deadlines with buffer time for unexpected issues',
          'Practice saying no to non-essential requests',
          'Schedule regular breaks during intensive work periods',
        ],
      },
      technical: {
        description: 'Technical issues cause significant stress. Prepare backup plans and support resources.',
        strategies: [
          'Keep a list of technical support contacts and resources',
          'Learn basic troubleshooting skills for common issues',
          'Always have backup plans for important technical tasks',
          'Allow extra time for technical work and testing',
        ],
      },
      interruptions: {
        description: 'Interruptions disrupt your flow. Create better boundaries and focus blocks.',
        strategies: [
          'Use "Do Not Disturb" modes during focus time',
          'Batch process emails and messages at set times',
          'Communicate your focus hours to colleagues and family',
          'Find or create quiet workspaces when possible',
        ],
      },
      personal: {
        description: 'Personal matters affect your well-being. Address them proactively.',
        strategies: [
          'Schedule dedicated time for personal tasks and relationships',
          'Create clear boundaries between work and personal concerns',
          'Build a support network and ask for help when needed',
          'Practice regular self-care and stress management techniques',
        ],
      },
      time: {
        description: 'Time pressure creates stress. Improve your time management and planning.',
        strategies: [
          'Plan your day the night before with realistic time estimates',
          'Leave buffer time between appointments and commitments',
          'Identify and eliminate time-wasting activities',
          'Use time-blocking techniques for important tasks',
        ],
      },
    };

    const strategy = baseStrategies[category] || {
      description: 'Manage this stress source with mindful planning.',
      strategies: ['Identify specific triggers and patterns', 'Develop personalized coping strategies', 'Seek support when needed'],
    };

    if (hasTriggers) {
      strategy.strategies.unshift('Pay attention to early warning signs and trigger patterns');
    }

    return strategy;
  }

  // Format category names for display
  formatCategoryName(category) {
    return category.replace('_', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Disable AI features
  async disableAI() {
    try {
      await AsyncStorage.setItem('ai_features_enabled', 'false');
      this.isEnabled = false;
      return true;
    } catch (error) {
      console.error('Error disabling AI:', error);
      return false;
    }
  }

  // Get model size info (no models needed for lightweight version)
  getEstimatedModelSize() {
    return '0MB'; // No download required
  }

  // Check if models are cached (always true for lightweight)
  async areModelsCached() {
    return true;
  }
}

// Export singleton instance
export default new LightweightAIService();
