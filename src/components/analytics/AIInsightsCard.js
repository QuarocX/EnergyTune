import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../../config/theme';
import AIAnalyticsService from '../../services/aiAnalytics';

export const AIInsightsCard = ({ entries, onInsightsUpdate }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [showMoreData, setShowMoreData] = useState(false);

  // CALCULATE DATA REQUIREMENTS
  const safeEntries = entries || [];
  const entriesWithEnergySource = safeEntries.filter(e => e.energySources && e.energySources.trim()).length;
  const entriesWithStressSource = safeEntries.filter(e => e.stressSources && e.stressSources.trim()).length;
  const hasEnoughData = safeEntries.length >= 5 && entriesWithEnergySource >= 3 && entriesWithStressSource >= 3;

  useEffect(() => {
    checkAIStatus();
  }, []);

  useEffect(() => {
    if (isEnabled && safeEntries.length >= 3) {
      generateAIInsights();
    }
  }, [isEnabled, entries]);

  const checkAIStatus = async () => {
    const enabled = await AIAnalyticsService.isAIEnabled();
    setIsEnabled(enabled);
  };

  const enableAI = async () => {
    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      Alert.alert(
        'Turn On Smart Insights? 🧠',
        `This will help you understand your energy and stress patterns better!\n\n🤖 Uses local AI (~1KB)\n📱 Everything stays on your phone\n🎯 Get personalized tips just for you\n\nThink of it as your personal wellness coach that learns from your daily entries.`,
        [
          { text: 'Maybe Later', style: 'cancel' },
          {
            text: 'Yes, Turn It On!',
            onPress: async () => {
              try {
                const success = await AIAnalyticsService.enableAI();
                if (success) {
                  setIsEnabled(true);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } else {
                  Alert.alert(
                    'Oops!', 
                    'Something went wrong. Please try again.',
                    [{ text: 'OK' }]
                  );
                }
              } catch (error) {
                Alert.alert(
                  'Oops!',
                  'Something went wrong. Please try again.',
                  [{ text: 'OK' }]
                );
              }
              setIsLoading(false);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error enabling AI:', error);
      setIsLoading(false);
    }
  };

  const generateAIInsights = async () => {
    try {
      setIsLoading(true);
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
      console.log(`🧠 [UI] Running real AI analysis on sufficient data...`);
      
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
      
      const energyAnalysis = await AIAnalyticsService.analyzeEnergySources(safeEntries);
      const stressAnalysis = await AIAnalyticsService.analyzeStressSources(safeEntries);
      const correlationAnalysis = await AIAnalyticsService.analyzeEnergyStressCorrelation(safeEntries);
      
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
          message: "Smart insights ready! 🧠",
          description: "I found patterns in your data! Here's what I discovered:",
          aiLogs: [...allLogs, '✅ Real insights generated successfully'],
          inputData: {
            energySources: energySourcesData,
            stressSources: stressSourcesData
          },
          summary: { 
            hasRealInsights: true, 
            timestamp: new Date().toISOString(),
            entriesAnalyzed: safeEntries.length,
            energyInsights: energyAnalysis?.insights?.length || 0,
            stressInsights: stressAnalysis?.insights?.length || 0
          }
        });
      } else {
        console.log('📊 [UI] No significant patterns found yet, showing encouragement...');
        setInsights({
          message: "Learning about you... 🤔",
          description: `I analyzed your ${safeEntries.length} entries but need more data to find strong patterns.`,
          tips: [
            "Try being more descriptive about what gives you energy",
            "Include specific details about stress sources",
            "Add a few more entries with descriptions"
          ],
          aiLogs: [...allLogs, 'ℹ️ Not enough clear patterns found yet'],
          inputData: {
            energySources: energySourcesData,
            stressSources: stressSourcesData
          },
          nextSteps: [
            "Keep adding daily entries with detailed descriptions",
            "I need stronger patterns to give you reliable insights",
            "The more specific you are, the better I can help!"
          ],
          summary: { 
            isLearning: true, 
            entriesAnalyzed: safeEntries.length,
            needsMoreData: true
          }
        });
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
            const success = await AIAnalyticsService.disableAI();
            if (success) {
              setIsEnabled(false);
              setInsights(null);
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
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.systemPurple} />
            <Text style={styles.loadingText}>Analyzing your patterns...</Text>
          </View>
        )}

        {insights && (
          <>
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
                        <Text style={styles.inputSectionTitle}>😰 Stress Sources ({insights.inputData.stressSources.length} entries)</Text>
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

            {/* SIMPLE MESSAGE FOR GRANDMOTHER */}
            <View style={styles.simpleMessageCard}>
              <Text style={styles.simpleTitle}>{insights.message || "Hi there! 👋"}</Text>
              <Text style={styles.simpleDescription}>
                {insights.description || "I'm here to help you understand your energy and stress patterns."}
              </Text>
            </View>

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

            {/* REAL INSIGHTS (when available) */}
            {insights.energy && insights.energy.insights && insights.energy.insights.length > 0 && (
              <View style={styles.realInsightsCard}>
                <Text style={styles.realInsightsTitle}>🎉 What I Found!</Text>
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
              <View style={styles.realInsightsCard}>
                <Text style={styles.realInsightsTitle}>🛡️ Stress Patterns I Found</Text>
                {insights.stress.insights.map((insight, index) => (
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

            <TouchableOpacity style={styles.refreshButton} onPress={generateAIInsights}>
              <Ionicons name="refresh" size={16} color={theme.colors.systemBlue} />
              <Text style={styles.refreshButtonText}>Check Again</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Trends-like main section design (always expanded)
  mainSection: {
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing.md,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    backgroundColor: theme.colors.systemBackground,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.label,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: theme.colors.secondaryLabel,
    marginTop: 2,
  },
  sectionContent: {
    padding: theme.spacing.lg,
  },

  // Enable button styles
  enableButton: {
    backgroundColor: theme.colors.systemPurple,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
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
    marginRight: theme.spacing.sm,
  },

  description: {
    fontSize: 14,
    color: theme.colors.secondaryLabel,
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
    color: theme.colors.secondaryLabel,
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
    color: theme.colors.label,
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
    color: theme.colors.secondaryLabel,
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
    color: theme.colors.secondaryLabel,
    marginLeft: theme.spacing.sm,
  },
  helpText: {
    fontSize: 12,
    color: theme.colors.secondaryLabel,
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
    color: theme.colors.secondaryLabel,
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
    color: theme.colors.systemTeal,
  },
  inputDataSubtitle: {
    fontSize: 13,
    color: theme.colors.secondaryLabel,
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
    backgroundColor: 'white',
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
    color: theme.colors.secondaryLabel,
    fontWeight: '500',
  },
  showMoreText: {
    fontSize: 13,
    color: theme.colors.systemTeal,
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
    color: theme.colors.systemIndigo,
    marginBottom: 4,
  },
  aiLogsSubtitle: {
    fontSize: 13,
    color: theme.colors.secondaryLabel,
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
    color: theme.colors.systemIndigo,
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
  simpleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.label,
    marginBottom: 8,
  },
  simpleDescription: {
    fontSize: 16,
    color: theme.colors.secondaryLabel,
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
    color: theme.colors.label,
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
    color: theme.colors.secondaryLabel,
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
    color: theme.colors.label,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 15,
    color: theme.colors.label,
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
    color: theme.colors.label,
    marginBottom: 12,
  },
  nextStepText: {
    fontSize: 15,
    color: theme.colors.label,
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  realInsightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.label,
    marginBottom: 8,
  },
  realInsightDescription: {
    fontSize: 15,
    color: theme.colors.secondaryLabel,
    lineHeight: 20,
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.systemPurple,
    textTransform: 'uppercase',
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
    fontWeight: '500',
    color: theme.colors.systemBlue,
    marginLeft: theme.spacing.sm,
  },
});

export default AIInsightsCard;
