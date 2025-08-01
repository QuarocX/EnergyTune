import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AIAnalyticsService from '../../services/aiAnalytics';
import LLMAnalyticsService from '../../services/llmAnalytics';

export const AIInsightsCard = ({ entries, onInsightsUpdate, theme }) => {
  const styles = getStyles(theme);
  
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [showMoreData, setShowMoreData] = useState(false);
  const [hasManuallyTriggered, setHasManuallyTriggered] = useState(false);
  const [useLLM, setUseLLM] = useState(true); // New state for LLM toggle

  // CALCULATE DATA REQUIREMENTS
  const safeEntries = entries || [];
  const entriesWithEnergySource = safeEntries.filter(e => e.energySources && e.energySources.trim()).length;
  const entriesWithStressSource = safeEntries.filter(e => e.stressSources && e.stressSources.trim()).length;
  const hasEnoughData = safeEntries.length >= 5 && entriesWithEnergySource >= 3 && entriesWithStressSource >= 3;

  useEffect(() => {
    checkAIStatus();
  }, []);

  // Also check AI status when entries change (in case AI was enabled/disabled elsewhere)
  useEffect(() => {
    if (entries && entries.length > 0) {
      checkAIStatus();
    }
  }, [entries?.length]);

  // Removed automatic insight generation - now only manual trigger

  const checkAIStatus = async () => {
    try {
      // Check which service is enabled
      const localEnabled = await AIAnalyticsService.isAIEnabled();
      const llmEnabled = await LLMAnalyticsService.isAIEnabled();
      const enabled = localEnabled || llmEnabled;
      
      console.log('🔍 AI Status Check - Local:', localEnabled, 'LLM:', llmEnabled, 'Current State:', isEnabled);
      
      if (enabled !== isEnabled) {
        console.log('🔄 Updating AI enabled state from', isEnabled, 'to', enabled);
        setIsEnabled(enabled);
      }
      
      // Set LLM preference based on what's enabled
      if (llmEnabled) {
        setUseLLM(true);
      } else if (localEnabled) {
        setUseLLM(false);
      }
    } catch (error) {
      console.error('❌ Error checking AI status:', error);
    }
  };

  const enableAI = async () => {
    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      Alert.alert(
        'Choose Your AI Engine 🧠',
        `Select how you want to analyze your patterns:\n\n🤖 Enhanced NLP: Advanced pattern recognition with sentiment analysis\n🔍 Local Patterns: Fast keyword matching\n\nBoth keep your data private on your phone.`,
        [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => {
              setIsLoading(false);
            }
          },
          {
            text: '🔍 Local Patterns',
            onPress: async () => {
              try {
                console.log('🔄 Enabling local pattern recognition...');
                const success = await AIAnalyticsService.enableAI();
                console.log('✅ Local AI enable result:', success);
                
                if (success) {
                  setIsEnabled(true);
                  setUseLLM(false);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setTimeout(() => checkAIStatus(), 100);
                } else {
                  Alert.alert('Oops!', 'Something went wrong. Please try again.', [{ text: 'OK' }]);
                }
              } catch (error) {
                console.error('❌ Error enabling local AI:', error);
                Alert.alert('Oops!', 'Something went wrong. Please try again.', [{ text: 'OK' }]);
              }
              setIsLoading(false);
            },
          },
          {
            text: '🤖 Enhanced NLP',
            onPress: async () => {
              try {
                console.log('🔄 Enabling Enhanced NLP analysis...');
                const success = await LLMAnalyticsService.enableAI();
                console.log('✅ Enhanced NLP enable result:', success);
                
                if (success) {
                  setIsEnabled(true);
                  setUseLLM(true);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setTimeout(() => checkAIStatus(), 100);
                } else {
                  Alert.alert('Oops!', 'Enhanced NLP initialization failed. Try Local Patterns instead.', [{ text: 'OK' }]);
                }
              } catch (error) {
                console.error('❌ Error enabling Enhanced NLP:', error);
                Alert.alert('Enhanced NLP Error', 'Enhanced NLP failed to initialize. Using Local Patterns instead.', [
                  {
                    text: 'Use Local Patterns',
                    onPress: async () => {
                      const success = await AIAnalyticsService.enableAI();
                      if (success) {
                        setIsEnabled(true);
                        setUseLLM(false);
                        setTimeout(() => checkAIStatus(), 100);
                      }
                    }
                  }
                ]);
              }
              setIsLoading(false);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error in enableAI:', error);
      setIsLoading(false);
    }
  };

  const generateAIInsights = async () => {
    try {
      setIsLoading(true);
      setHasManuallyTriggered(true); // Mark that user has manually triggered analysis
      console.log(`🔍 [UI] Starting AI analysis with ${safeEntries.length} entries...`);
      
      if (safeEntries.length === 0) {
        setInsights({
          message: "Welcome! 👋",
          description: "I'm your personal wellness assistant. Add your first daily entry to get started!",
          aiLogs: ['No entries to analyze yet'],
          summary: { isWelcome: true, entriesAnalyzed: 0 }
        });
        return;
      }
      
      if (!hasEnoughData) {
        const remaining = 5 - safeEntries.length;
        
        // Still collect whatever data we have for display
        const energySourcesData = safeEntries
          .filter(entry => entry.energySources && entry.energySources.trim())
          .map(entry => ({
            date: new Date(entry.date).toLocaleDateString(),
            text: entry.energySources.trim(),
            avgEnergy: entry.energyLevels ? 
              (Object.values(entry.energyLevels).filter(v => v !== null).reduce((sum, val) => sum + val, 0) / 
               Object.values(entry.energyLevels).filter(v => v !== null).length || 1).toFixed(1) : 'N/A'
          }));

        const stressSourcesData = safeEntries
          .filter(entry => entry.stressSources && entry.stressSources.trim())
          .map(entry => ({
            date: new Date(entry.date).toLocaleDateString(),
            text: entry.stressSources.trim(),
            avgStress: entry.stressLevels ? 
              (Object.values(entry.stressLevels).filter(v => v !== null).reduce((sum, val) => sum + val, 0) / 
               Object.values(entry.stressLevels).filter(v => v !== null).length || 1).toFixed(1) : 'N/A'
          }));
        
        setInsights({
          message: remaining === 1 ? "Almost ready! 🎯" : "Great progress! 📈",
          description: remaining === 1 
            ? "Just one more entry and I can start finding patterns in your data!"
            : `Keep going! ${remaining} more entries and I'll find what energizes you and what causes stress.`,
          tips: [
            "💡 Describe what gave you energy: 'good sleep', 'morning coffee', 'quick walk'",
            "💡 Note what caused stress: 'tight deadline', 'traffic jam', 'difficult meeting'",
            "💡 Be specific - it helps me understand your unique patterns!"
          ],
          progress: {
            entries: safeEntries.length,
            energyDescriptions: entriesWithEnergySource,
            stressDescriptions: entriesWithStressSource
          },
          aiLogs: [
            `Found ${safeEntries.length} total entries`,
            `${entriesWithEnergySource} entries have energy descriptions`,
            `${entriesWithStressSource} entries have stress descriptions`,
            `Need ${5 - safeEntries.length} more entries for analysis`
          ],
          inputData: {
            energySources: energySourcesData,
            stressSources: stressSourcesData
          },
          summary: { isProgress: true, entriesAnalyzed: safeEntries.length }
        });
        return;
      }
      
      // Start real AI analysis with detailed logging
      console.log(`🧠 [UI] Running ${useLLM ? 'Enhanced NLP' : 'local'} AI analysis on sufficient data...`);
      
      // Collect input data for display
      const energySourcesData = safeEntries
        .filter(entry => entry.energySources && entry.energySources.trim())
        .map(entry => ({
          date: new Date(entry.date).toLocaleDateString(),
          text: entry.energySources.trim(),
          avgEnergy: entry.energyLevels ? 
            (Object.values(entry.energyLevels).filter(v => v !== null).reduce((sum, val) => sum + val, 0) / 
             Object.values(entry.energyLevels).filter(v => v !== null).length || 1).toFixed(1) : 'N/A'
        }));

      const stressSourcesData = safeEntries
        .filter(entry => entry.stressSources && entry.stressSources.trim())
        .map(entry => ({
          date: new Date(entry.date).toLocaleDateString(),
          text: entry.stressSources.trim(),
          avgStress: entry.stressLevels ? 
            (Object.values(entry.stressLevels).filter(v => v !== null).reduce((sum, val) => sum + val, 0) / 
             Object.values(entry.stressLevels).filter(v => v !== null).length || 1).toFixed(1) : 'N/A'
        }));
      
      // Use the selected AI service
      const aiService = useLLM ? LLMAnalyticsService : AIAnalyticsService;
      const energyAnalysis = await aiService.analyzeEnergySources(safeEntries);
      const stressAnalysis = await aiService.analyzeStressSources(safeEntries);
      const correlationAnalysis = await aiService.analyzeEnergyStressCorrelation(safeEntries);
      
      // Collect all analysis logs
      const allLogs = [
        '🔍 AI Analysis Started',
        `📊 Analyzed ${safeEntries.length} total entries`,
        ...(energyAnalysis?.logs || []),
        ...(stressAnalysis?.logs || []),
        ...(correlationAnalysis?.logs || [])
      ];
      
      // Check if we got real insights
      const hasRealInsights = (energyAnalysis?.insights?.length > 0) || 
                             (stressAnalysis?.insights?.length > 0) ||
                             (correlationAnalysis?.insights?.length > 0);
      
      if (hasRealInsights) {
        console.log('🎉 [UI] Found real patterns! Displaying insights...');
        setInsights({
          energy: energyAnalysis,
          stress: stressAnalysis,
          correlation: correlationAnalysis,
          message: `Smart insights ready! ${useLLM ? '�' : '🔍'}`,
          description: `I found patterns in your data using ${useLLM ? 'advanced LLM analysis' : 'local pattern recognition'}! Here's what I discovered:`,
          aiLogs: [...allLogs, `✅ ${useLLM ? 'LLM' : 'Local'} insights generated successfully`],
          inputData: {
            energySources: energySourcesData,
            stressSources: stressSourcesData
          },
          summary: { 
            hasRealInsights: true, 
            usedLLM: useLLM,
            timestamp: new Date().toISOString(),
            entriesAnalyzed: safeEntries.length,
            energyInsights: energyAnalysis?.insights?.length || 0,
            stressInsights: stressAnalysis?.insights?.length || 0
          }
        });
      } else {
        console.log('📊 [UI] No significant patterns found by AI, trying enhanced local analysis...');
        
        // Try enhanced local analysis as fallback
        const localAnalysis = generateLocalInsights(safeEntries);
        
        if (localAnalysis.insights.length > 0) {
          console.log('🎯 [UI] Found patterns with local analysis!');
          
          // Separate energy and stress insights
          const energyInsights = localAnalysis.insights.filter(i => i.type === 'energy');
          const stressInsights = localAnalysis.insights.filter(i => i.type === 'stress');
          
          console.log('📊 [UI] Energy insights:', energyInsights.length);
          console.log('😰 [UI] Stress insights:', stressInsights.length);
          
          setInsights({
            energy: energyInsights.length > 0 ? { insights: energyInsights } : null,
            stress: stressInsights.length > 0 ? { insights: stressInsights } : null,
            localAnalysis: localAnalysis,
            message: "Found real patterns! 🎯",
            description: `I analyzed your ${safeEntries.length} entries and discovered meaningful patterns in your daily activities.`,
            recommendations: localAnalysis.recommendations,
            aiLogs: [
              ...allLogs, 
              '🎯 Enhanced local analysis used',
              `Found ${localAnalysis.insights.length} meaningful patterns`,
              `Analyzed ${localAnalysis.energyAnalysis.highEnergyActivities.length} high-energy activities`,
              `Analyzed ${localAnalysis.stressAnalysis.highStressEvents.length} high-stress events`
            ],
            inputData: {
              energySources: energySourcesData,
              stressSources: stressSourcesData
            },
            summary: { 
              hasRealInsights: true,
              usedLocalAnalysis: true,
              timestamp: new Date().toISOString(),
              entriesAnalyzed: safeEntries.length,
              energyInsights: energyInsights.length,
              stressInsights: stressInsights.length,
              avgEnergy: localAnalysis.energyAnalysis.averageEnergy,
              avgStress: localAnalysis.stressAnalysis.averageStress
            }
          });
        } else {
          // Still no patterns found
          setInsights({
            message: "Learning about you... 🤔",
            description: `I analyzed your ${safeEntries.length} entries but need more varied data to find strong patterns.`,
            tips: [
              "Try being more descriptive about what gives you energy",
              "Include specific details about stress sources", 
              "Add a few more entries with different activities"
            ],
            aiLogs: [...allLogs, 'ℹ️ Local analysis also found no clear patterns'],
            inputData: {
              energySources: energySourcesData,
              stressSources: stressSourcesData
            },
            nextSteps: [
              "Keep adding daily entries with detailed descriptions",
              "Try describing different types of activities",
              "The more variety in your data, the better I can help!"
            ],
            summary: { 
              isLearning: true, 
              entriesAnalyzed: safeEntries.length,
              needsMoreData: true
            }
          });
        }
      }
      
    } catch (error) {
      console.error('❌ [UI] Error generating insights:', error);
      setInsights({
        message: "Oops! Something went wrong 😅",
        description: "I had trouble analyzing your data, but don't worry - just keep adding entries!",
        tips: ["Try adding descriptions about what gives you energy and what causes stress"],
        aiLogs: [
          '❌ Error during AI analysis',
          `Error: ${error.message}`,
          'Try again in a moment'
        ],
        summary: { isError: true, errorMessage: error.message }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced local analysis for better insights
  const generateLocalInsights = (entries) => {
    const energyData = entries
      .filter(entry => entry.energySources && entry.energySources.trim())
      .map(entry => ({
        date: entry.date,
        text: entry.energySources.trim(),
        energy: entry.energyLevels ? 
          Object.values(entry.energyLevels).filter(v => v !== null).reduce((sum, val) => sum + val, 0) / 
          Object.values(entry.energyLevels).filter(v => v !== null).length : 0
      }))
      .filter(item => item.energy > 0);

    const stressData = entries
      .filter(entry => entry.stressSources && entry.stressSources.trim())
      .map(entry => ({
        date: entry.date,
        text: entry.stressSources.trim(),
        stress: entry.stressLevels ? 
          Object.values(entry.stressLevels).filter(v => v !== null).reduce((sum, val) => sum + val, 0) / 
          Object.values(entry.stressLevels).filter(v => v !== null).length : 0
      }))
      .filter(item => item.stress > 0);

    // Find high-energy activities (above average)
    const avgEnergy = energyData.reduce((sum, item) => sum + item.energy, 0) / energyData.length;
    const highEnergyItems = energyData.filter(item => item.energy > avgEnergy + 1);

    // Find high-stress triggers (above average)  
    const avgStress = stressData.reduce((sum, item) => sum + item.stress, 0) / stressData.length;
    const highStressItems = stressData.filter(item => item.stress > avgStress + 1);

    // Analyze word frequency AND phrase patterns
    const energyWords = energyData.flatMap(item => 
      item.text.toLowerCase().split(/[\s,]+/).filter(word => word.length > 2)
    );
    const stressWords = stressData.flatMap(item => 
      item.text.toLowerCase().split(/[\s,]+/).filter(word => word.length > 2)
    );

    // Extract 2-3 word phrases for better pattern detection
    const energyPhrases = energyData.flatMap(item => {
      const words = item.text.toLowerCase().split(/[\s,]+/).filter(word => word.length > 1);
      const phrases = [];
      // Extract 2-word phrases
      for (let i = 0; i < words.length - 1; i++) {
        phrases.push(words[i] + ' ' + words[i + 1]);
      }
      // Extract 3-word phrases
      for (let i = 0; i < words.length - 2; i++) {
        phrases.push(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
      }
      return phrases;
    });

    const stressPhrases = stressData.flatMap(item => {
      const words = item.text.toLowerCase().split(/[\s,]+/).filter(word => word.length > 1);
      const phrases = [];
      // Extract 2-word phrases
      for (let i = 0; i < words.length - 1; i++) {
        phrases.push(words[i] + ' ' + words[i + 1]);
      }
      // Extract 3-word phrases  
      for (let i = 0; i < words.length - 2; i++) {
        phrases.push(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
      }
      return phrases;
    });

    const energyWordCounts = energyWords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

    const stressWordCounts = stressWords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

    const energyPhraseCounts = energyPhrases.reduce((acc, phrase) => {
      acc[phrase] = (acc[phrase] || 0) + 1;
      return acc;
    }, {});

    const stressPhraseCounts = stressPhrases.reduce((acc, phrase) => {
      acc[phrase] = (acc[phrase] || 0) + 1;
      return acc;
    }, {});

    // Get top patterns (prioritize phrases over single words)
    const topEnergyPhrases = Object.entries(energyPhraseCounts)
      .filter(([phrase, count]) => count >= 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    const topStressPhrases = Object.entries(stressPhraseCounts)
      .filter(([phrase, count]) => count >= 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    const topEnergyWords = Object.entries(energyWordCounts)
      .filter(([word, count]) => count >= 2 && !topEnergyPhrases.some(([phrase]) => phrase.includes(word)))
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    const topStressWords = Object.entries(stressWordCounts)
      .filter(([word, count]) => count >= 2 && !topStressPhrases.some(([phrase]) => phrase.includes(word)))
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    const insights = [];
    const recommendations = [];

    // Debug logging for pattern detection
    console.log('🔍 [Pattern Debug] Stress phrases detected:', topStressPhrases);
    console.log('🔍 [Pattern Debug] Stress words detected:', topStressWords);
    console.log('🔍 [Pattern Debug] Energy phrases detected:', topEnergyPhrases);
    console.log('🔍 [Pattern Debug] Energy words detected:', topEnergyWords);
    console.log('🔍 [Pattern Debug] High stress items:', highStressItems.length);
    console.log('🔍 [Pattern Debug] Sample stress data:', stressData.slice(0, 3).map(item => ({
      text: item.text,
      stress: item.stress.toFixed(1)
    })));

    // Generate energy insights (prioritize phrases)
    if (topEnergyPhrases.length > 0) {
      const [phrase, count] = topEnergyPhrases[0];
      insights.push({
        title: `⚡ Energy Pattern: "${phrase}"`,
        description: `"${phrase}" appears in ${count} of your energy-boosting activities. This phrase pattern seems to consistently give you energy.`,
        confidence: 0.8,
        type: 'energy'
      });
    } else if (highEnergyItems.length > 0) {
      const topActivity = highEnergyItems[0];
      insights.push({
        title: `🔋 Energy Booster: "${topActivity.text}"`,
        description: `This activity gave you ${topActivity.energy.toFixed(1)}/10 energy on ${new Date(topActivity.date).toLocaleDateString()}. Consider doing this more often!`,
        confidence: 0.8,
        type: 'energy'
      });
    } else if (topEnergyWords.length > 0) {
      const [word, count] = topEnergyWords[0];
      insights.push({
        title: `⚡ Pattern Found: "${word}"`,
        description: `"${word}" appears in ${count} of your energy-boosting activities. This seems to be a consistent source of energy for you.`,
        confidence: 0.7,
        type: 'energy'
      });
    }

    // Generate stress insights (prioritize phrases)
    if (topStressPhrases.length > 0) {
      const [phrase, count] = topStressPhrases[0];
      insights.push({
        title: `😰 Stress Pattern: "${phrase}"`,
        description: `"${phrase}" appears in ${count} of your stress sources. This recurring pattern might be worth addressing with specific coping strategies.`,
        confidence: 0.8,
        type: 'stress'
      });
    } else if (highStressItems.length > 0) {
      const topStressor = highStressItems[0];
      insights.push({
        title: `😰 Major Stress Trigger: "${topStressor.text}"`,
        description: `This caused you ${topStressor.stress.toFixed(1)}/10 stress on ${new Date(topStressor.date).toLocaleDateString()}. Consider strategies to manage or avoid this.`,
        confidence: 0.8,
        type: 'stress'
      });
    } else if (topStressWords.length > 0) {
      const [word, count] = topStressWords[0];
      insights.push({
        title: `🚨 Recurring Stress Pattern: "${word}"`,
        description: `"${word}" appears in ${count} of your stress sources. This pattern might be worth addressing with coping strategies.`,
        confidence: 0.7,
        type: 'stress'
      });
    }

    // Additional stress insights for better coverage
    if (stressData.length > 0 && topStressWords.length === 0 && highStressItems.length === 0) {
      // If we have stress data but no clear patterns, still provide insight
      const avgStressValue = stressData.reduce((sum, item) => sum + item.stress, 0) / stressData.length;
      const recentStressor = stressData[stressData.length - 1];
      insights.push({
        title: `📊 Stress Level Insight`,
        description: `Your average stress level is ${avgStressValue.toFixed(1)}/10. Most recent stressor: "${recentStressor.text}". Keep tracking to identify patterns.`,
        confidence: 0.6,
        type: 'stress'
      });
    }

    // Generate recommendations based on patterns
    if (topEnergyPhrases.length > 0) {
      recommendations.push(`Try to include "${topEnergyPhrases[0][0]}" more frequently in your routine`);
    } else if (topEnergyWords.length > 0) {
      recommendations.push(`Try to include "${topEnergyWords[0][0]}" more frequently in your routine`);
    }
    
    if (topStressPhrases.length > 0) {
      recommendations.push(`Consider strategies to reduce "${topStressPhrases[0][0]}" in your daily life`);
    } else if (topStressWords.length > 0) {
      recommendations.push(`Consider strategies to reduce "${topStressWords[0][0]}" in your daily life`);
    }

    return {
      insights,
      recommendations,
      energyAnalysis: {
        highEnergyActivities: highEnergyItems,
        commonWords: topEnergyWords,
        commonPhrases: topEnergyPhrases,
        averageEnergy: avgEnergy.toFixed(1)
      },
      stressAnalysis: {
        highStressEvents: highStressItems,
        commonWords: topStressWords,
        commonPhrases: topStressPhrases,
        averageStress: avgStress.toFixed(1)
      }
    };
  };

  const toggleDataDetails = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowMoreData(!showMoreData);
  };

  const disableAI = async () => {
    Alert.alert(
      'Turn Off Smart Insights?',
      'This will stop showing you patterns and tips. You can always turn it back on later!',
      [
        { text: 'Keep It On', style: 'cancel' },
        {
          text: 'Turn Off',
          style: 'destructive',
          onPress: async () => {
            // Disable both services to be safe
            const localSuccess = await AIAnalyticsService.disableAI();
            const llmSuccess = await LLMAnalyticsService.disableAI();
            
            if (localSuccess || llmSuccess) {
              setIsEnabled(false);
              setInsights(null);
              setHasManuallyTriggered(false);
              setTimeout(() => checkAIStatus(), 100);
            }
          },
        },
      ]
    );
  };

  if (!isEnabled) {
    return (
      <View style={styles.mainSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🧠 Smart Insights</Text>
          <Text style={styles.sectionSubtitle}>Let AI find patterns in your data</Text>
        </View>
        
        <View style={styles.sectionContent}>
          <TouchableOpacity
            style={[styles.enableButton, isLoading && styles.enableButtonLoading]}
            onPress={enableAI}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#FFFFFF" style={styles.enableButtonIcon} />
                <Text style={styles.enableButtonText}>Enable Smart Insights</Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={styles.description}>
            Turn on Smart Insights to discover what gives you energy and what causes you stress. 
            It's like having a personal assistant that notices patterns you might miss! 
            Everything stays private on your phone.
          </Text>
          
          <View style={styles.features}>
            <View style={styles.feature}>
              <Ionicons name="eye" size={16} color={theme.colors.systemGreen} />
              <Text style={styles.featureText}>Finds Hidden Patterns</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="bulb" size={16} color={theme.colors.systemBlue} />
              <Text style={styles.featureText}>Gives Helpful Tips</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="shield-checkmark" size={16} color={theme.colors.systemPurple} />
              <Text style={styles.featureText}>Your Data Stays Safe</Text>
            </View>
          </View>

          {/* Data Requirements */}
          <View style={styles.dataRequirementsHint}>
            <Text style={styles.hintTitle}>📊 Data Requirements for AI Analysis</Text>
            <View style={styles.requirementsList}>
              <View style={styles.requirementRow}>
                <Text style={styles.requirementIcon}>
                  {safeEntries.length >= 5 ? '✅' : '📝'}
                </Text>
                <Text style={[styles.requirementText, safeEntries.length >= 5 && styles.completed]}>
                  5+ total entries ({safeEntries.length}/5)
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <Text style={styles.requirementIcon}>
                  {entriesWithEnergySource >= 3 ? '✅' : '⚡'}
                </Text>
                <Text style={[styles.requirementText, entriesWithEnergySource >= 3 && styles.completed]}>
                  3+ energy descriptions ({entriesWithEnergySource}/3)
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <Text style={styles.requirementIcon}>
                  {entriesWithStressSource >= 3 ? '✅' : '😰'}
                </Text>
                <Text style={[styles.requirementText, entriesWithStressSource >= 3 && styles.completed]}>
                  3+ stress descriptions ({entriesWithStressSource}/3)
                </Text>
              </View>
            </View>
            
            {hasEnoughData ? (
              <View style={styles.readyBanner}>
                <Text style={styles.readyText}>🎉 Ready for AI analysis!</Text>
              </View>
            ) : (
              <View style={styles.progressBanner}>
                <Text style={styles.progressText}>
                  {safeEntries.length === 0 && 'Add your first entry to get started!'}
                  {safeEntries.length > 0 && safeEntries.length < 5 && `${5 - safeEntries.length} more entries needed`}
                  {safeEntries.length >= 5 && 'Add energy and stress descriptions'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Show data requirements if not enough entries
  if (entries.length < 5) {
    const entriesWithEnergySource = entries.filter(e => e.energySources && e.energySources.trim()).length;
    const entriesWithStressSource = entries.filter(e => e.stressSources && e.stressSources.trim()).length;
    
    return (
      <View style={styles.mainSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🧠 Smart Insights</Text>
          <Text style={styles.sectionSubtitle}>Getting ready to analyze your patterns...</Text>
        </View>        
        <View style={styles.sectionContent}>
          <Text style={styles.description}>
            I need a bit more data to find your unique patterns! Here's what I'm looking for:
          </Text>
          
          {/* Status Banner */}
          <View style={styles.statusBanner}>
            <Text style={styles.statusBannerText}>
              {entries.length === 0 && '🚀 Ready to start your AI journey? Add your first entry!'}
              {entries.length > 0 && entries.length < 3 && `📈 Great start! ${5 - entries.length} more entries until AI analysis begins.`}
              {entries.length >= 3 && entries.length < 5 && `🎯 Almost there! ${5 - entries.length} more entries needed.`}
            </Text>
          </View>
          
          <View style={styles.requirementsContainer}>
            <View style={styles.requirementItem}>
              <Ionicons 
                name={entries.length >= 5 ? "checkmark-circle" : "radio-button-off"} 
                size={20} 
                color={entries.length >= 5 ? theme.colors.systemGreen : theme.colors.secondaryLabel} 
              />
              <Text style={[styles.requirementText, entries.length >= 5 && styles.requirementCompleted]}>
                📝 5+ total entries ({entries.length}/5)
                {entries.length >= 5 && ' ✨'}
              </Text>
            </View>
            
            <View style={styles.requirementItem}>
              <Ionicons 
                name={entriesWithEnergySource >= 3 ? "checkmark-circle" : "radio-button-off"} 
                size={20} 
                color={entriesWithEnergySource >= 3 ? theme.colors.systemGreen : theme.colors.secondaryLabel} 
              />
              <Text style={[styles.requirementText, entriesWithEnergySource >= 3 && styles.requirementCompleted]}>
                ⚡ 3+ energy descriptions ({entriesWithEnergySource}/3)
                {entriesWithEnergySource >= 3 && ' ✨'}
              </Text>
            </View>
            
            <View style={styles.requirementItem}>
              <Ionicons 
                name={entriesWithStressSource >= 3 ? "checkmark-circle" : "radio-button-off"} 
                size={20} 
                color={entriesWithStressSource >= 3 ? theme.colors.systemGreen : theme.colors.secondaryLabel} 
              />
              <Text style={[styles.requirementText, entriesWithStressSource >= 3 && styles.requirementCompleted]}>
                😰 3+ stress descriptions ({entriesWithStressSource}/3)
                {entriesWithStressSource >= 3 && ' ✨'}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(100, (entries.length / 5) * 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round((entries.length / 5) * 100)}% ready for AI analysis
            </Text>
          </View>

          <TouchableOpacity style={styles.demoButton} onPress={generateAIInsights}>
            <Ionicons name="play-circle" size={20} color={theme.colors.systemBlue} />
            <Text style={styles.demoButtonText}>Show Me How It Works!</Text>
          </TouchableOpacity>
          
          <Text style={styles.helpText}>
            💡 Tip: Add descriptions like "good sleep", "workout", "deadlines", "traffic" to help AI find patterns!
          </Text>

          <TouchableOpacity style={styles.settingsButton} onPress={disableAI}>
            <Ionicons name="settings" size={20} color={theme.colors.secondaryLabel} />
            <Text style={styles.settingsText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🧠 Smart Insights</Text>
        <Text style={styles.sectionSubtitle}>
          {isLoading ? 'Looking for patterns...' : 'AI-powered analysis of your data'}
        </Text>
      </View>

      <View style={styles.sectionContent}>
        {/* MANUAL ANALYSIS TRIGGER - Grandmother-friendly design */}
        {!isLoading && !insights && !hasManuallyTriggered && (
          <View style={styles.manualTriggerContainer}>
            <View style={styles.welcomeMessage}>
              <Text style={styles.welcomeTitle}>Ready to discover your patterns? 🔍</Text>
              <Text style={styles.welcomeDescription}>
                I'll look through your {safeEntries.length} entries to find what gives you energy and what causes stress.
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.analyzeButton} 
              onPress={generateAIInsights}
              disabled={isLoading}
            >
              <Ionicons name="sparkles" size={24} color="#FFFFFF" />
              <Text style={styles.analyzeButtonText}>Start Smart Analysis</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={styles.analyzeHint}>
              💡 This takes about 5 seconds and finds patterns you might miss!
            </Text>
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.systemPurple} />
            <Text style={styles.loadingText}>Analyzing your patterns...</Text>
          </View>
        )}

        {insights && (
          <>
            {/* SIMPLE MESSAGE FOR GRANDMOTHER - Priority display */}
            <View style={styles.simpleMessageCard}>
              <View style={styles.messageHeader}>
                <Text style={styles.simpleTitle}>{insights.message || "Here's what I found! 🎉"}</Text>
                {/* Analysis Method Badge */}
                <View style={[
                  styles.analysisBadge, 
                  insights.summary?.usedLLM ? styles.llmBadge : styles.fallbackBadge
                ]}>
                  <Text style={styles.analysisBadgeText}>
                    {insights.summary?.usedLLM ? '🤖 LLM Analysis' : 
                     insights.summary?.usedLocalAnalysis ? '🔍 Pattern Detection' : 
                     useLLM ? '� LLM Analysis' : '🔍 Local Patterns'}
                  </Text>
                </View>
              </View>
              <Text style={styles.simpleDescription}>
                {insights.description || "I analyzed your entries and found some interesting patterns!"}
              </Text>
            </View>

            {/* REAL INSIGHTS (when available) - Main content */}
            {insights.energy && insights.energy.insights && insights.energy.insights.length > 0 && (
              <View style={styles.realInsightsCard}>
                <Text style={styles.realInsightsTitle}>⚡ What Gives You Energy</Text>
                {insights.energy.insights.map((insight, index) => (
                  <View key={index} style={styles.realInsightItem}>
                    <Text style={styles.realInsightTitle}>{insight.title}</Text>
                    <Text style={styles.realInsightDescription}>{insight.description}</Text>
                    {insight.confidence && (
                      <Text style={styles.confidenceText}>
                        I'm {Math.round(insight.confidence * 100)}% confident about this
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {insights.stress && insights.stress.insights && insights.stress.insights.length > 0 && (
              <View style={styles.stressInsightsCard}>
                <Text style={styles.stressInsightsTitle}>😰 What Causes You Stress</Text>
                {insights.stress.insights.map((insight, index) => (
                  <View key={index} style={styles.stressInsightItem}>
                    <Text style={styles.stressInsightTitle}>{insight.title}</Text>
                    <Text style={styles.stressInsightDescription}>{insight.description}</Text>
                    {insight.confidence && (
                      <Text style={styles.confidenceText}>
                        I'm {Math.round(insight.confidence * 100)}% confident about this
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* PERSONALIZED RECOMMENDATIONS */}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <View style={styles.recommendationsCard}>
                <Text style={styles.recommendationsTitle}>🎯 Personal Recommendations</Text>
                <Text style={styles.recommendationsSubtitle}>Based on your unique patterns:</Text>
                {insights.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Text style={styles.recommendationIcon}>✨</Text>
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* PROGRESS FEEDBACK */}
            {insights.progress && (
              <View style={styles.progressCard}>
                <Text style={styles.progressTitle}>📊 Your Progress</Text>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Daily entries:</Text>
                  <Text style={styles.progressValue}>{insights.progress.entries}/5</Text>
                </View>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Energy descriptions:</Text>
                  <Text style={styles.progressValue}>{insights.progress.energyDescriptions}/3</Text>
                </View>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Stress descriptions:</Text>
                  <Text style={styles.progressValue}>{insights.progress.stressDescriptions}/3</Text>
                </View>
              </View>
            )}

            {/* HELPFUL TIPS */}
            {insights.tips && (
              <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>💡 Helpful Tips</Text>
                {insights.tips.map((tip, index) => (
                  <Text key={index} style={styles.tipText}>{tip}</Text>
                ))}
              </View>
            )}

            {/* NEXT STEPS */}
            {insights.nextSteps && (
              <View style={styles.nextStepsCard}>
                <Text style={styles.nextStepsTitle}>🎯 What's Next</Text>
                {insights.nextSteps.map((step, index) => (
                  <Text key={index} style={styles.nextStepText}>• {step}</Text>
                ))}
              </View>
            )}

            {/* REFRESH BUTTON */}
            <TouchableOpacity style={styles.refreshButton} onPress={generateAIInsights}>
              <Ionicons name="refresh" size={16} color={theme.colors.systemBlue} />
              <Text style={styles.refreshButtonText}>Analyze Again</Text>
            </TouchableOpacity>

            {/* TECHNICAL DATA & LOGS - MOVED TO BOTTOM */}
            <View style={styles.technicalSectionSeparator}>
              <Text style={styles.technicalSectionTitle}>📋 Technical Details</Text>
              <Text style={styles.technicalSectionSubtitle}>For the curious minds - see what data I analyzed</Text>
            </View>

            {/* INPUT DATA REVIEW - FOLDABLE */}
            {insights.inputData && (
              <View style={styles.inputDataCard}>
                <TouchableOpacity style={styles.inputDataHeader} onPress={toggleDataDetails}>
                  <Text style={styles.inputDataTitle}>📝 Data I Analyzed</Text>
                  <Ionicons 
                    name={showMoreData ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={theme.colors.secondaryLabel} 
                  />
                </TouchableOpacity>
                <Text style={styles.inputDataSubtitle}>
                  {showMoreData ? 'Here\'s what I found in your entries:' : 
                   `Analyzed ${(insights.inputData.energySources?.length || 0) + (insights.inputData.stressSources?.length || 0)} entries`}
                </Text>
                
                {showMoreData && (
                  <>
                    {insights.inputData.energySources && insights.inputData.energySources.length > 0 && (
                      <View style={styles.inputSection}>
                        <Text style={styles.inputSectionTitle}>⚡ Energy Sources ({insights.inputData.energySources.length} entries)</Text>
                        {insights.inputData.energySources.slice(0, 5).map((item, index) => (
                          <View key={index} style={styles.inputItem}>
                            <Text style={styles.inputDate}>{item.date}</Text>
                            <Text style={styles.inputText}>"{item.text}"</Text>
                            <Text style={styles.inputMeta}>Energy Level: {item.avgEnergy}/10</Text>
                          </View>
                        ))}
                        {insights.inputData.energySources.length > 5 && (
                          <Text style={styles.showMoreText}>+ {insights.inputData.energySources.length - 5} more entries</Text>
                        )}
                      </View>
                    )}

                    {insights.inputData.stressSources && insights.inputData.stressSources.length > 0 && (
                      <View style={styles.inputSection}>
                        <Text style={styles.inputSectionTitle}>� Stress Sources ({insights.inputData.stressSources.length} entries)</Text>
                        {insights.inputData.stressSources.slice(0, 5).map((item, index) => (
                          <View key={index} style={styles.inputItem}>
                            <Text style={styles.inputDate}>{item.date}</Text>
                            <Text style={styles.inputText}>"{item.text}"</Text>
                            <Text style={styles.inputMeta}>Stress Level: {item.avgStress}/10</Text>
                          </View>
                        ))}
                        {insights.inputData.stressSources.length > 5 && (
                          <Text style={styles.showMoreText}>+ {insights.inputData.stressSources.length - 5} more entries</Text>
                        )}
                      </View>
                    )}
                  </>
                )}
              </View>
            )}

            {/* AI ANALYSIS LOGS - FOLDABLE */}
            {insights.aiLogs && insights.aiLogs.length > 0 && (
              <View style={styles.aiLogsCard}>
                <Text style={styles.aiLogsTitle}>🤖 AI Analysis Log</Text>
                <Text style={styles.aiLogsSubtitle}>See how I analyzed your data:</Text>
                {insights.aiLogs.slice(0, showMoreData ? undefined : 3).map((log, index) => (
                  <Text key={index} style={styles.aiLogText}>• {log}</Text>
                ))}
                {!showMoreData && insights.aiLogs.length > 3 && (
                  <TouchableOpacity onPress={toggleDataDetails} style={styles.showMoreButton}>
                    <Text style={styles.showMoreButtonText}>Show {insights.aiLogs.length - 3} more logs</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
        
        {/* AI ENGINE TOGGLE */}
        <View style={styles.engineToggleContainer}>
          <Text style={styles.engineToggleTitle}>AI Engine:</Text>
          <TouchableOpacity 
            style={[styles.engineToggle, useLLM && styles.engineToggleActive]}
            onPress={async () => {
              if (!useLLM) {
                try {
                  setIsLoading(true);
                  const success = await LLMAnalyticsService.enableAI();
                  if (success) {
                    await AIAnalyticsService.disableAI();
                    setUseLLM(true);
                    setInsights(null); // Clear insights to force refresh
                    setHasManuallyTriggered(false);
                  } else {
                    Alert.alert('LLM Error', 'Failed to initialize LLM. Keeping local patterns.');
                  }
                } catch (error) {
                  Alert.alert('LLM Error', 'Failed to switch to LLM. Keeping local patterns.');
                } finally {
                  setIsLoading(false);
                }
              }
            }}
          >
            <Text style={[styles.engineToggleText, useLLM && styles.engineToggleTextActive]}>
              🤖 Enhanced NLP
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.engineToggle, !useLLM && styles.engineToggleActive]}
            onPress={async () => {
              if (useLLM) {
                try {
                  setIsLoading(true);
                  const success = await AIAnalyticsService.enableAI();
                  if (success) {
                    await LLMAnalyticsService.disableAI();
                    setUseLLM(false);
                    setInsights(null); // Clear insights to force refresh
                    setHasManuallyTriggered(false);
                  }
                } catch (error) {
                  Alert.alert('Error', 'Failed to switch to local patterns.');
                } finally {
                  setIsLoading(false);
                }
              }
            }}
          >
            <Text style={[styles.engineToggleText, !useLLM && styles.engineToggleTextActive]}>
              🔍 Local Patterns
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* SETTINGS BUTTON - Always available when AI is enabled */}
        <TouchableOpacity style={styles.settingsButton} onPress={disableAI}>
          <Ionicons name="settings" size={20} color={theme.colors.secondaryLabel} />
          <Text style={styles.settingsText}>Turn Off Smart Insights</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  // Trends-like main section design (matches AnalyticsScreen)
  mainSection: {
    backgroundColor: theme.colors.cardBackground,
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: theme.colors.secondaryText,
  },
  sectionContent: {
    padding: 24,
  },

  // Enable button styles
  enableButton: {
    backgroundColor: theme.colors.systemPurple,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  enableButtonLoading: {
    backgroundColor: 'rgba(175, 82, 222, 0.6)',
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  enableButtonIcon: {
    marginRight: 8,
  },

  // Manual trigger styles - Grandmother-friendly design
  manualTriggerContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  welcomeMessage: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 16,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
  },
  analyzeButton: {
    backgroundColor: theme.colors.systemPurple,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: theme.spacing.md,
  },
  analyzeHint: {
    fontSize: 14,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Technical section separator
  technicalSectionSeparator: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.separator,
    paddingTop: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  technicalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.label,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  technicalSectionSubtitle: {
    fontSize: 13,
    color: theme.colors.label,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  description: {
    fontSize: 14,
    color: theme.colors.secondaryText,
    lineHeight: 20,
    marginTop: theme.spacing.md,
  },

  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },

  // Data requirements display
  dataRequirementsHint: {
    backgroundColor: theme.colors.secondarySystemBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.separator,
  },
  hintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  requirementsList: {
    marginBottom: theme.spacing.md,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  requirementIcon: {
    fontSize: 18,
    marginRight: theme.spacing.md,
    width: 24,
    textAlign: 'center',
  },
  requirementText: {
    fontSize: 15,
    color: theme.colors.secondaryText,
    flex: 1,
  },
  completed: {
    color: theme.colors.systemGreen,
    fontWeight: '500',
  },
  readyBanner: {
    backgroundColor: theme.colors.systemGreen + '20',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  readyText: {
    fontSize: 14,
    color: theme.colors.systemGreen,
    fontWeight: '600',
  },
  progressBanner: {
    backgroundColor: theme.colors.systemBlue + '20',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.systemBlue,
    fontWeight: '500',
  },

  // Requirements container styles
  requirementsContainer: {
    backgroundColor: theme.colors.tertiaryBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  requirementCompleted: {
    color: theme.colors.systemGreen,
    fontWeight: '500',
  },

  // Progress bar
  progressContainer: {
    marginTop: theme.spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(175, 82, 222, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.systemPurple,
    borderRadius: 3,
  },

  // Engine toggle styles
  engineToggleContainer: {
    marginVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  engineToggleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  engineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.tertiaryBackground,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.separator,
  },
  engineToggleActive: {
    backgroundColor: theme.colors.systemPurple,
    borderColor: theme.colors.systemPurple,
  },
  engineToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.secondaryText,
  },
  engineToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Demo and settings buttons
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  demoButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.systemBlue,
    marginLeft: theme.spacing.sm,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  settingsText: {
    fontSize: 14,
    color: theme.colors.secondaryText,
    marginLeft: theme.spacing.sm,
  },
  helpText: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    lineHeight: 16,
    fontStyle: 'italic',
  },

  // Status banner
  statusBanner: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.systemBlue,
  },
  statusBannerText: {
    fontSize: 14,
    color: theme.colors.systemBlue,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Loading state
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.secondaryText,
    marginTop: theme.spacing.sm,
  },

  // Foldable input data card
  inputDataCard: {
    backgroundColor: theme.colors.systemTeal + '15',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.systemTeal,
  },
  inputDataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.label,
  },
  inputDataSubtitle: {
    fontSize: 13,
    color: theme.colors.label,
    marginBottom: 16,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.label,
    marginBottom: 12,
  },
  inputItem: {
    backgroundColor: theme.colors.primaryBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.systemTeal,
  },
  inputDate: {
    fontSize: 12,
    color: theme.colors.systemTeal,
    fontWeight: '600',
    marginBottom: 4,
  },
  inputText: {
    fontSize: 14,
    color: theme.colors.label,
    lineHeight: 18,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  inputMeta: {
    fontSize: 12,
    color: theme.colors.label,
    fontWeight: '500',
  },
  showMoreText: {
    fontSize: 13,
    color: theme.colors.label,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },

  // AI logs card
  aiLogsCard: {
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.systemIndigo,
  },
  aiLogsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.label,
    marginBottom: 4,
  },
  aiLogsSubtitle: {
    fontSize: 13,
    color: theme.colors.label,
    marginBottom: 12,
  },
  aiLogText: {
    fontSize: 14,
    color: theme.colors.label,
    lineHeight: 18,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  showMoreButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  showMoreButtonText: {
    fontSize: 14,
    color: theme.colors.label,
    fontWeight: '500',
  },

  // Message cards
  simpleMessageCard: {
    backgroundColor: theme.colors.systemBlue + '15',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.systemBlue,
  },
  messageHeader: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  simpleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  analysisBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  llmBadge: {
    backgroundColor: theme.colors.systemPurple + '20',
  },
  fallbackBadge: {
    backgroundColor: theme.colors.systemTeal + '20',
  },
  analysisBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  simpleDescription: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 22,
  },

  progressCard: {
    backgroundColor: theme.colors.systemGreen + '15',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.systemGreen,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 15,
    color: theme.colors.secondaryText,
  },
  progressValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.systemGreen,
  },

  tipsCard: {
    backgroundColor: theme.colors.systemYellow + '15',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.systemYellow,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },

  nextStepsCard: {
    backgroundColor: theme.colors.systemPurple + '15',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.systemPurple,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  nextStepText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: 6,
  },

  realInsightsCard: {
    backgroundColor: theme.colors.systemGreen + '20',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: theme.colors.systemGreen,
  },
  realInsightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.systemGreen,
    marginBottom: 16,
  },
  realInsightItem: {
    backgroundColor: theme.colors.primaryBackground,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  realInsightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  realInsightDescription: {
    fontSize: 15,
    color: theme.colors.secondaryText,
    lineHeight: 20,
    marginBottom: 8,
  },
  
  // Stress insights card - distinct styling
  stressInsightsCard: {
    backgroundColor: theme.colors.systemRed + '20',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: theme.colors.systemRed,
  },
  stressInsightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.systemRed,
    marginBottom: 16,
  },
  stressInsightItem: {
    backgroundColor: theme.colors.primaryBackground,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  stressInsightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  stressInsightDescription: {
    fontSize: 15,
    color: theme.colors.secondaryText,
    lineHeight: 20,
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.systemPurple,
    textTransform: 'uppercase',
  },
  recommendationsCard: {
    backgroundColor: theme.colors.accent + '15',
    padding: 16,
    borderRadius: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.accent + '40',
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.accent,
    marginBottom: 4,
  },
  recommendationsSubtitle: {
    fontSize: 13,
    color: theme.colors.secondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 8,
  },
  recommendationIcon: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },

  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.systemBlue,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: theme.colors.secondaryText,
    lineHeight: 20,
    marginTop: 16,
  },

  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    marginLeft: 4,
    flex: 1,
  },

  // Add other essential styles with proper theme colors
  dataRequirementsHint: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  hintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  requirementText: {
    fontSize: 15,
    color: theme.colors.secondaryText,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.secondaryText,
    marginTop: 8,
  },
  // Add minimal styles to prevent crashes
  manualTriggerContainer: { alignItems: 'center', paddingVertical: 32 },
  welcomeMessage: { alignItems: 'center', marginBottom: 32, paddingHorizontal: 16 },
  welcomeTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text, textAlign: 'center', marginBottom: 8 },
  welcomeDescription: { fontSize: 16, color: theme.colors.secondaryText, textAlign: 'center', lineHeight: 22 },
  analyzeButton: { backgroundColor: theme.colors.systemPurple, paddingHorizontal: 32, paddingVertical: 24, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  analyzeButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginHorizontal: 16 },
});

export default AIInsightsCard;
