import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import HierarchicalPatternService from '../../services/hierarchicalPatternService';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * PatternHierarchyCard - Contextual pattern analysis with drill-down
 */
export const PatternHierarchyCard = ({ 
  stressPatterns, 
  energyPatterns, 
  loading = false,
  hasRunAnalysis = false,
  analysisProgress = { current: 0, total: 0, stage: '', percentage: 0, estimatedTimeRemaining: 0 },
  averageCalculationTime = 0,
  runFastAnalysis,
  abortAnalysis,
  theme 
}) => {
  const [activeTab, setActiveTab] = useState('stress');
  const [expandedPatterns, setExpandedPatterns] = useState({});
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const styles = getStyles(theme);

  // Debug logging
  useEffect(() => {
    console.log('[PatternHierarchyCard] Props received:', {
      stressPatterns: stressPatterns ? {
        type: stressPatterns.type,
        totalMentions: stressPatterns.totalMentions,
        mainPatternsLength: stressPatterns.mainPatterns?.length,
        mainPatternsIsArray: Array.isArray(stressPatterns.mainPatterns)
      } : null,
      energyPatterns: energyPatterns ? {
        type: energyPatterns.type,
        totalMentions: energyPatterns.totalMentions,
        mainPatternsLength: energyPatterns.mainPatterns?.length,
        mainPatternsIsArray: Array.isArray(energyPatterns.mainPatterns)
      } : null,
      loading
    });
  }, [stressPatterns, energyPatterns, loading]);

  const patterns = activeTab === 'stress' ? stressPatterns : energyPatterns;
  
  // Safe extraction with logging
  let mainPatterns = [];
  try {
    if (patterns && patterns.mainPatterns) {
      if (Array.isArray(patterns.mainPatterns)) {
        mainPatterns = patterns.mainPatterns;
      } else {
        console.warn('[PatternHierarchyCard] mainPatterns is not an array:', typeof patterns.mainPatterns, patterns.mainPatterns);
        mainPatterns = [];
      }
    } else {
      console.log('[PatternHierarchyCard] No mainPatterns found in patterns:', patterns);
    }
  } catch (error) {
    console.error('[PatternHierarchyCard] Error extracting mainPatterns:', error);
    mainPatterns = [];
  }
  
  const hasData = mainPatterns.length > 0;
  
  console.log('[PatternHierarchyCard] Computed values:', {
    activeTab,
    hasData,
    mainPatternsLength: mainPatterns.length
  });

  const handleTabChange = useCallback((tab) => {
    if (tab !== activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActiveTab(tab);
      setExpandedPatterns({});
    }
  }, [activeTab]);

  const togglePattern = useCallback((patternId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedPatterns(prev => ({
      ...prev,
      [patternId]: !prev[patternId]
    }));
  }, []);

  const openInfoModal = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowInfoModal(true);
  }, []);

  const openDetailView = useCallback((item, parentLabel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedDetail({ ...item, parentLabel, type: activeTab });
  }, [activeTab]);

  const handleStartAnalysis = useCallback(() => {
    if (runFastAnalysis && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      runFastAnalysis();
    }
  }, [runFastAnalysis, loading]);

  const handleRerunAnalysis = useCallback(() => {
    if (runFastAnalysis && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Reset expanded patterns
      setExpandedPatterns({});
      // Rerun analysis
      runFastAnalysis();
    }
  }, [runFastAnalysis, loading]);

  // Show loading state with progress animation (whenever loading, including reruns)
  if (loading) {
    return (
      <AnalysisLoadingAnimation 
        progress={analysisProgress} 
        theme={theme}
        onAbort={abortAnalysis}
      />
    );
  }

  // Show button to start analysis if it hasn't been run
  if (!hasRunAnalysis && !loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Pattern Analysis</Text>
            <Text style={styles.subtitle}>
              Discover patterns in your stress and energy sources
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.infoButton} 
            onPress={openInfoModal}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="information-circle-outline" size={22} color={theme.colors.systemBlue} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.startAnalysisContainer}>
          <View style={styles.startAnalysisContent}>
            <Text style={styles.startAnalysisIcon}>🔍</Text>
            <Text style={styles.startAnalysisTitle}>Ready to Analyze</Text>
            <Text style={styles.startAnalysisDescription}>
              Tap the button below to analyze your entries and discover patterns in your stress and energy sources.
            </Text>
            
            {/* Analysis Time Estimate */}
            <View style={styles.timeEstimateContainer}>
              <Ionicons name="time-outline" size={16} color={theme.colors.secondaryText} />
              <Text style={styles.timeEstimateText}>
                Analysis may take up to 5 minutes depending on your device resources.
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.startAnalysisButton, loading && styles.startAnalysisButtonDisabled]}
              onPress={handleStartAnalysis}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Ionicons name="play-circle" size={20} color="#FFFFFF" />
              <Text style={styles.startAnalysisButtonText}>Start Analysis</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Modal */}
        <InfoModal
          visible={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          theme={theme}
        />
      </View>
    );
  }

  // Final safety check before render
  try {
    if (!Array.isArray(mainPatterns)) {
      console.error('[PatternHierarchyCard] mainPatterns is not an array:', typeof mainPatterns, mainPatterns);
      mainPatterns = [];
    }
  } catch (error) {
    console.error('[PatternHierarchyCard] Error in safety check:', error);
    mainPatterns = [];
  }

  // Wrap entire render in try-catch for safety
  try {
    return (
      <View style={styles.container}>
      {/* Header with Info Button */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Pattern Analysis</Text>
          </View>
          <Text style={styles.subtitle}>
            {hasData 
              ? `${patterns?.totalMentions || 0} mentions`
              : hasRunAnalysis
                ? 'No patterns found in your entries'
                : 'Add entries to see patterns'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {/* Rerun Button - Show when analysis has run */}
          {hasRunAnalysis && (
            <TouchableOpacity
              style={styles.rerunHeaderButton}
              onPress={handleRerunAnalysis}
              disabled={loading}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="refresh" 
                size={20} 
                color={loading ? theme.colors.systemGray3 : theme.colors.systemBlue} 
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.infoButton} 
            onPress={openInfoModal}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="information-circle-outline" size={22} color={theme.colors.systemBlue} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stress' && styles.activeTab]}
          onPress={() => handleTabChange('stress')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'stress' && styles.activeTabText]}>
            😰 Stress
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'energy' && styles.activeTab]}
          onPress={() => handleTabChange('energy')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'energy' && styles.activeTabText]}>
            ⚡ Energy
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pattern List */}
      <View style={styles.patternList}>
        {!hasData ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              {activeTab === 'stress' ? '😌' : '✨'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'stress' 
                ? 'No stress patterns detected yet' 
                : 'No energy patterns detected yet'}
            </Text>
            <Text style={styles.emptyHint}>
              Add more entries with descriptions to discover patterns
            </Text>
            
            {/* Rerun Analysis Button */}
            {hasRunAnalysis && (
              <TouchableOpacity
                style={styles.rerunButton}
                onPress={handleRerunAnalysis}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={16} color={theme.colors.systemBlue} />
                <Text style={styles.rerunButtonText}>Rerun Analysis</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          mainPatterns
            .filter(pattern => pattern && typeof pattern === 'object' && pattern.id)
            .map((pattern) => {
              console.log('[PatternHierarchyCard] Rendering pattern:', pattern.id, {
                hasSubPatterns: Array.isArray(pattern.subPatterns),
                subPatternsLength: pattern.subPatterns?.length || 0
              });
              
              return (
                <PatternItem
                  key={pattern.id}
                  pattern={pattern}
                  isExpanded={expandedPatterns[pattern.id]}
                  onToggle={() => togglePattern(pattern.id)}
                  onDetailPress={openDetailView}
                  type={activeTab}
                  theme={theme}
                />
              );
            })
        )}
      </View>

      {/* Info Modal */}
      <InfoModal 
        visible={showInfoModal} 
        onClose={() => setShowInfoModal(false)} 
        theme={theme}
      />

      {/* Detail Modal */}
      <DetailModal
        visible={!!selectedDetail}
        detail={selectedDetail}
        onClose={() => setSelectedDetail(null)}
        theme={theme}
      />
      </View>
    );
  } catch (error) {
    console.error('[PatternHierarchyCard] Render error:', error);
    console.error('[PatternHierarchyCard] Error stack:', error.stack);
    console.error('[PatternHierarchyCard] Error details:', {
      stressPatterns: stressPatterns ? 'exists' : 'null',
      energyPatterns: energyPatterns ? 'exists' : 'null',
      mainPatterns: Array.isArray(mainPatterns) ? `array(${mainPatterns.length})` : typeof mainPatterns
    });
    
    // Return error state
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Pattern Analysis</Text>
          <Text style={styles.subtitle}>Error loading patterns</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Please try again</Text>
        </View>
      </View>
    );
  }
};

/**
 * CircularSpinner - Minimalist rotating circle animation
 */
const CircularSpinner = ({ color, size = 32 }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    rotate.start();
    return () => rotate.stop();
  }, [rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2.5,
          borderColor: color + '20', // 20% opacity for track
          borderTopColor: color, // Full opacity for spinner
          transform: [{ rotate: rotation }],
        }}
      />
    </View>
  );
};

/**
 * AnalysisLoadingAnimation - Minimalist loading animation with progress
 */
const AnalysisLoadingAnimation = ({ progress, theme, onAbort }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const styles = getStyles(theme);

  const { 
    current = 0, 
    total = 0, 
    stage = 'Analyzing...',
    percentage = 0,
    estimatedTimeRemaining = 0
  } = progress;

  // Use provided percentage - this is the source of truth
  const displayPercentage = Math.min(Math.max(percentage, 0), 100);
  const normalizedPercentage = displayPercentage / 100; // Convert to 0-1 range

  // Keep progress bar synchronized with percentage - update immediately and smoothly
  useEffect(() => {
    // Set value immediately for exact synchronization
    progressAnim.setValue(normalizedPercentage);
    
    // Then animate smoothly for visual polish
    Animated.timing(progressAnim, {
      toValue: normalizedPercentage,
      duration: 100, // Short duration for quick updates
      useNativeDriver: false, // width animation doesn't support native driver
    }).start();
  }, [normalizedPercentage, progressAnim]);

  // Interpolate to exact percentage width - ensure it matches exactly
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const spinnerColor = theme.colors.systemBlue;

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return '';
    if (seconds < 1) return '< 1s';
    if (seconds < 60) return `~${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `~${mins}m ${secs}s` : `~${mins}m`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pattern Analysis</Text>
      </View>
      
      <View style={styles.loadingContainer}>
        {/* Circular Spinner */}
        <View style={styles.loadingIconContainer}>
          <CircularSpinner color={spinnerColor} size={40} />
        </View>

        {/* Progress Info */}
        <View style={styles.progressInfo}>
          <Text style={styles.progressStage}>{stage}</Text>
          {estimatedTimeRemaining > 0 && (
            <View style={styles.timeEstimateRow}>
              <Text style={styles.progressTimeEstimate}>
                ~{formatTimeRemaining(estimatedTimeRemaining)} remaining
              </Text>
              <Text style={styles.timeEstimateNote}>
                (estimate may vary)
              </Text>
            </View>
          )}
          {estimatedTimeRemaining === 0 && displayPercentage < 100 && (
            <Text style={styles.progressTimeEstimate}>
              Processing...
            </Text>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>

        {/* Percentage - synchronized with progress bar */}
        <Text style={styles.progressPercentage}>
          {displayPercentage}%
        </Text>

        {/* Abort Button */}
        {onAbort && (
          <TouchableOpacity
            style={styles.abortButton}
            onPress={onAbort}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={18} color={theme.colors.systemRed} />
            <Text style={styles.abortButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

/**
 * PatternItem - Single expandable pattern with clickable sub-patterns
 */
const PatternItem = ({ pattern, isExpanded, onToggle, onDetailPress, type, theme }) => {
  const styles = getStyles(theme);
  
  // Safe extraction of subPatterns
  const subPatternsArray = Array.isArray(pattern?.subPatterns) ? pattern.subPatterns : [];
  const hasSubPatterns = subPatternsArray.length > 0;
  const accentColor = type === 'stress' ? theme.colors.stress : theme.colors.energy;
  
  console.log('[PatternItem] Pattern data:', {
    patternId: pattern?.id,
    hasSubPatterns,
    subPatternsLength: subPatternsArray.length,
    subPatternsType: typeof pattern?.subPatterns
  });

  return (
    <View style={styles.patternItem}>
      {/* Main Pattern Row */}
      <TouchableOpacity
        style={styles.patternHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.patternLeft}>
          <Text style={styles.patternEmoji}>{pattern.emoji}</Text>
          <View style={styles.patternInfo}>
            <Text style={styles.patternLabel}>{pattern.label}</Text>
            <Text style={styles.patternMeta}>
              {pattern.frequency}× · avg {pattern.avgImpact}/10
            </Text>
          </View>
        </View>
        
        <View style={styles.patternRight}>
          <View style={[styles.percentageBadge, { backgroundColor: accentColor + '20' }]}>
            <Text style={[styles.percentageText, { color: accentColor }]}>
              {pattern.percentage}%
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={theme.colors.secondaryText}
            style={styles.chevron}
          />
        </View>
      </TouchableOpacity>

      {/* Sub-patterns (Expanded) - Clickable for details */}
      {isExpanded && (
        <View style={styles.subPatternContainer}>
          {hasSubPatterns ? (
            subPatternsArray.map((sub, index) => {
              if (!sub || typeof sub !== 'object') {
                console.warn('[PatternItem] Invalid sub-pattern at index', index, sub);
                return null;
              }
              
              return (
                <TouchableOpacity
                  key={sub.id || `sub_${index}`}
                  style={styles.subPatternItem}
                  onPress={() => onDetailPress(sub, pattern.label)}
                  activeOpacity={0.6}
                >
                  <View style={styles.subPatternRow}>
                    <Text style={styles.subPatternConnector}>
                      {index === subPatternsArray.length - 1 ? '└' : '├'}
                    </Text>
                  <View style={styles.subPatternContent}>
                    <View style={styles.subPatternHeader}>
                      <Text style={styles.subPatternLabel}>{sub.label}</Text>
                      <View style={styles.subPatternMeta}>
                        <Text style={styles.subPatternFreq}>{sub.frequency}×</Text>
                        <Ionicons name="chevron-forward" size={14} color={theme.colors.systemGray3} />
                      </View>
                    </View>
                    {sub.examples && sub.examples.length > 0 && (
                      <Text style={styles.examplePreview} numberOfLines={1}>
                        "{sub.examples[0]}"
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
              );
            }).filter(Boolean)
          ) : (
            <View style={styles.noSubPatterns}>
              <Text style={styles.noSubPatternsText}>
                Examples: {pattern.examples?.slice(0, 2).join(', ')}
              </Text>
            </View>
          )}
          
          {/* Show all examples link */}
          {Array.isArray(pattern.examples) && pattern.examples.length > 2 && (
            <TouchableOpacity
              style={styles.showAllButton}
              onPress={() => onDetailPress(pattern, 'All')}
            >
              <Text style={styles.showAllText}>
                View all {pattern.frequency || 0} mentions →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

/**
 * InfoModal - Explains the algorithm and categories
 */
const InfoModal = ({ visible, onClose, theme }) => {
  const styles = getStyles(theme);
  const explanation = HierarchicalPatternService.getAlgorithmExplanation();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{explanation.title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close-circle" size={28} color={theme.colors.secondaryText} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Explanation Sections */}
          {explanation.sections.map((section, index) => (
            <View key={index} style={styles.infoSection}>
              <Text style={styles.infoHeading}>{section.heading}</Text>
              <Text style={styles.infoContent}>{section.content}</Text>
            </View>
          ))}

          {/* Note about discovery method */}
          {explanation.note && (
            <View style={styles.noteSection}>
              <View style={styles.noteCard}>
                <Text style={styles.noteIcon}>💡</Text>
                <Text style={styles.noteText}>{explanation.note}</Text>
              </View>
            </View>
          )}

          <View style={styles.modalFooter}>
            <Text style={styles.footerText}>
              Categories are discovered from your unique vocabulary and patterns. 
              The more entries you add, the more accurate the analysis becomes.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

/**
 * DetailModal - Shows specific dates and examples for a pattern
 */
const DetailModal = ({ visible, detail, onClose, theme }) => {
  const styles = getStyles(theme);
  
  if (!detail) return null;

  const accentColor = detail.type === 'stress' ? theme.colors.stress : theme.colors.energy;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.detailParentLabel}>{detail.parentLabel}</Text>
            <Text style={styles.modalTitle}>{detail.label}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close-circle" size={28} color={theme.colors.secondaryText} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Stats Summary */}
          <View style={styles.detailStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: accentColor }]}>{detail.frequency}</Text>
              <Text style={styles.statLabel}>Mentions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: accentColor }]}>{detail.avgImpact}</Text>
              <Text style={styles.statLabel}>Avg Level</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: accentColor }]}>{detail.dates?.length || 0}</Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
          </View>

          {/* Recommendation */}
          {detail.recommendation && (
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationIcon}>💡</Text>
              <Text style={styles.recommendationFullText}>{detail.recommendation}</Text>
            </View>
          )}

          {/* Dates Section */}
          {detail.dates && detail.dates.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>📅 When This Occurred</Text>
              <View style={styles.datesList}>
                {detail.dates.map((date, index) => (
                  <View key={index} style={styles.dateItem}>
                    <Ionicons name="calendar-outline" size={14} color={theme.colors.secondaryText} />
                    <Text style={styles.dateText}>{formatDate(date)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Examples Section */}
          {detail.examples && detail.examples.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>📝 Your Entries</Text>
              <View style={styles.examplesList}>
                {detail.examples.map((example, index) => (
                  <View key={index} style={styles.exampleItem}>
                    <Text style={styles.exampleQuote}>"{example}"</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Full Sources (if available) */}
          {detail.sources && detail.sources.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>📊 Detailed Breakdown</Text>
              {detail.sources.slice(0, 10).map((source, index) => (
                <View key={index} style={styles.sourceItem}>
                  <View style={styles.sourceHeader}>
                    <Text style={styles.sourceDate}>{formatDate(source.date)}</Text>
                    <View style={[styles.levelBadge, { backgroundColor: accentColor + '20' }]}>
                      <Text style={[styles.levelText, { color: accentColor }]}>
                        {source.level.toFixed(1)}/10
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.sourceText}>"{source.text}"</Text>
                </View>
              ))}
              {detail.sources.length > 10 && (
                <Text style={styles.moreSourcesText}>
                  +{detail.sources.length - 10} more entries
                </Text>
              )}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  headerLeft: {
    flex: 1,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginRight: 8,
  },

  modeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  fastBadge: {
    backgroundColor: theme.colors.systemBlue + '20',
  },

  deepBadge: {
    backgroundColor: theme.colors.systemPurple + '20',
  },

  modeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text,
  },

  subtitle: {
    fontSize: 13,
    color: theme.colors.secondaryText,
  },

  infoButton: {
    padding: 4,
  },

  // Analysis Control
  analysisControl: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  deepAnalysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.systemPurple,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },

  deepAnalysisButtonDisabled: {
    opacity: 0.7,
  },

  deepAnalysisButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  deepModeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.systemGreen + '15',
    borderRadius: 12,
    padding: 12,
  },

  deepModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  deepModeText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.systemGreen,
  },

  switchToFastButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  switchToFastText: {
    fontSize: 13,
    color: theme.colors.systemBlue,
    fontWeight: '500',
  },

  progressContainer: {
    marginTop: 12,
  },

  progressBar: {
    height: 4,
    backgroundColor: theme.colors.systemGray5,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },

  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.systemPurple,
    borderRadius: 2,
  },

  progressText: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    textAlign: 'center',
  },

  // Tab Switcher
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 10,
    padding: 3,
  },

  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },

  activeTab: {
    backgroundColor: theme.colors.cardBackground,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.secondaryText,
  },

  activeTabText: {
    color: theme.colors.text,
    fontWeight: '600',
  },

  // Pattern List
  patternList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  patternItem: {
    marginBottom: 8,
  },

  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  patternLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  patternEmoji: {
    fontSize: 20,
    marginRight: 12,
  },

  patternInfo: {
    flex: 1,
  },

  patternLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },

  patternMeta: {
    fontSize: 12,
    color: theme.colors.secondaryText,
  },

  patternRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  percentageText: {
    fontSize: 13,
    fontWeight: '700',
  },

  chevron: {
    marginLeft: 8,
  },

  // Sub-patterns
  subPatternContainer: {
    marginTop: 4,
    marginLeft: 20,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.systemGray4,
  },

  subPatternItem: {
    paddingVertical: 10,
    paddingRight: 8,
  },

  subPatternRow: {
    flexDirection: 'row',
  },

  subPatternConnector: {
    fontSize: 14,
    color: theme.colors.systemGray3,
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  subPatternContent: {
    flex: 1,
  },

  subPatternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  subPatternLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    flex: 1,
  },

  subPatternMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  subPatternFreq: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    fontWeight: '600',
    marginRight: 2,
  },

  examplePreview: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    fontStyle: 'italic',
    marginTop: 4,
  },

  noSubPatterns: {
    paddingVertical: 8,
    paddingLeft: 20,
  },

  noSubPatternsText: {
    fontSize: 13,
    color: theme.colors.secondaryText,
    fontStyle: 'italic',
  },

  showAllButton: {
    paddingVertical: 8,
    paddingLeft: 20,
  },

  showAllText: {
    fontSize: 13,
    color: theme.colors.systemBlue,
    fontWeight: '500',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },

  emptyIcon: {
    fontSize: 32,
    marginBottom: 12,
  },

  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
  },

  emptyHint: {
    fontSize: 13,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },

  rerunButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.systemBlue + '10',
    gap: 6,
  },

  rerunButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.systemBlue,
  },

  rerunHeaderButton: {
    padding: 4,
  },

  // Loading Animation
  loadingContainer: {
    paddingVertical: 50,
    paddingHorizontal: 32,
    alignItems: 'center',
  },

  loadingIconContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressInfo: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },

  progressStage: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },

  progressCount: {
    fontSize: 13,
    color: theme.colors.secondaryText,
    fontWeight: '500',
  },

  progressTimeEstimate: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    fontWeight: '500',
    marginTop: 4,
    opacity: 0.9,
  },

  timeEstimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    gap: 4,
    flexWrap: 'wrap',
  },

  timeEstimateNote: {
    fontSize: 11,
    color: theme.colors.secondaryText,
    fontWeight: '400',
    opacity: 0.7,
    fontStyle: 'italic',
  },

  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.systemGray5,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.systemBlue,
    borderRadius: 2,
    shadowColor: theme.colors.systemBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },

  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.systemBlue,
    letterSpacing: 0.5,
  },

  abortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.systemRed + '10',
    gap: 6,
  },

  abortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.systemRed,
  },

  // Start Analysis State
  startAnalysisContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },

  startAnalysisContent: {
    alignItems: 'center',
    maxWidth: 280,
  },

  startAnalysisIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  startAnalysisTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },

  startAnalysisDescription: {
    fontSize: 14,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  startAnalysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.systemBlue,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: theme.colors.systemBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  startAnalysisButtonDisabled: {
    opacity: 0.6,
  },

  startAnalysisButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  timeEstimateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.colors.systemOrange + '15',
    borderRadius: 8,
    gap: 6,
  },

  timeEstimateText: {
    fontSize: 12,
    color: theme.colors.systemOrange,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
    lineHeight: 16,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },

  closeButton: {
    padding: 4,
  },

  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Info Modal
  infoSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },

  infoHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },

  infoContent: {
    fontSize: 14,
    color: theme.colors.secondaryText,
    lineHeight: 20,
  },

  modalFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  footerText: {
    fontSize: 13,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  noteSection: {
    marginTop: 8,
    marginBottom: 8,
  },

  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.systemBlue + '15',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.systemBlue,
  },

  noteIcon: {
    fontSize: 18,
    marginRight: 10,
  },

  noteText: {
    fontSize: 13,
    color: theme.colors.text,
    flex: 1,
    lineHeight: 18,
  },

  // Detail Modal
  detailParentLabel: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    marginBottom: 2,
  },

  detailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 12,
    marginTop: 16,
  },

  statItem: {
    alignItems: 'center',
  },

  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },

  statLabel: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    marginTop: 4,
  },

  statDivider: {
    width: 1,
    backgroundColor: theme.colors.separator,
  },

  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.systemBlue + '15',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },

  recommendationIcon: {
    fontSize: 16,
    marginRight: 10,
  },

  recommendationFullText: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
    lineHeight: 20,
  },

  detailSection: {
    marginTop: 24,
  },

  detailSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },

  datesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.systemGray6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  dateText: {
    fontSize: 13,
    color: theme.colors.text,
    marginLeft: 6,
  },

  examplesList: {
    gap: 8,
  },

  exampleItem: {
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 10,
    padding: 12,
  },

  exampleQuote: {
    fontSize: 14,
    color: theme.colors.text,
    fontStyle: 'italic',
    lineHeight: 20,
  },

  sourceItem: {
    backgroundColor: theme.colors.systemGray6,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },

  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  sourceDate: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.secondaryText,
  },

  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  levelText: {
    fontSize: 11,
    fontWeight: '700',
  },

  sourceText: {
    fontSize: 14,
    color: theme.colors.text,
    fontStyle: 'italic',
    lineHeight: 18,
  },

  moreSourcesText: {
    fontSize: 13,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default PatternHierarchyCard;
