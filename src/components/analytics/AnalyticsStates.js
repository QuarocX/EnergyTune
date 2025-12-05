import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { theme } from '../../config/theme';
import * as Haptics from 'expo-haptics';

export const MINIMUM_ENTRIES_REQUIRED = 3;

export const AnalyticsLoadingState = ({ theme: customTheme }) => {
  const themeToUse = customTheme || theme;
  const styles = getStyles(themeToUse);
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={themeToUse.colors.accent} />
      <Text style={styles.loadingText}>Analyzing your patterns...</Text>
    </View>
  );
};

export const AnalyticsEmptyState = ({ theme: customTheme, currentEntryCount = 0, navigation }) => {
  const themeToUse = customTheme || theme;
  const styles = getStyles(themeToUse);
  const entriesNeeded = Math.max(0, MINIMUM_ENTRIES_REQUIRED - currentEntryCount);
  const progressPercentage = Math.min(100, (currentEntryCount / MINIMUM_ENTRIES_REQUIRED) * 100);

  const handleStartTracking = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (navigation) {
      navigation.navigate('Entry');
    }
  };

  const featureCards = [
    {
      icon: '📈',
      title: 'Trend Analysis',
      description: 'See how your energy and stress levels change over time',
    },
    {
      icon: '🔍',
      title: 'Pattern Detection',
      description: 'Discover what boosts your energy and triggers stress',
    },
    {
      icon: '⚡',
      title: 'Energy Insights',
      description: 'Understand your energy patterns and peak performance times',
    },
    {
      icon: '😰',
      title: 'Stress Patterns',
      description: 'Identify stress triggers and find ways to manage them better',
    },
  ];

  return (
    <ScrollView 
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emptyTitle}>Unlock Analytics</Text>
          <Text style={styles.emptySubtitle}>
            Track your energy and stress to discover meaningful insights
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressCount}>
              {currentEntryCount} of {MINIMUM_ENTRIES_REQUIRED} days
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressHint}>
            {entriesNeeded > 0 
              ? `Track ${entriesNeeded} more day${entriesNeeded > 1 ? 's' : ''} to unlock analytics`
              : 'You\'re ready! Analytics will appear here soon.'
            }
          </Text>
        </View>

        {/* Feature Preview Cards */}
        <View style={styles.cardsContainer}>
          <Text style={styles.cardsTitle}>What You'll Get</Text>
          {featureCards.map((card, index) => (
            <View key={index} style={styles.featureCard}>
              <Text style={styles.cardIcon}>{card.icon}</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDescription}>{card.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={handleStartTracking}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>Start Tracking</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.title1.fontSize,
    fontWeight: theme.typography.title1.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.md,
  },
  progressContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  progressLabel: {
    fontSize: theme.typography.headline.fontSize,
    fontWeight: theme.typography.headline.fontWeight,
    color: theme.colors.text,
  },
  progressCount: {
    fontSize: theme.typography.headline.fontSize,
    fontWeight: '700',
    color: theme.colors.systemBlue,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.systemGray5,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.systemBlue,
    borderRadius: 4,
  },
  progressHint: {
    fontSize: theme.typography.subhead.fontSize,
    color: theme.colors.secondaryText,
    textAlign: 'center',
  },
  cardsContainer: {
    marginBottom: theme.spacing.xl,
  },
  cardsTitle: {
    fontSize: theme.typography.title3.fontSize,
    fontWeight: theme.typography.title3.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: theme.typography.headline.fontSize,
    fontWeight: theme.typography.headline.fontWeight,
    color: theme.colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: theme.typography.subhead.fontSize,
    color: theme.colors.secondaryText,
    lineHeight: 18,
  },
  ctaButton: {
    backgroundColor: theme.colors.systemBlue,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    shadowColor: theme.colors.systemBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: theme.typography.headline.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.secondaryText,
    marginTop: theme.spacing.md,
  },
});
