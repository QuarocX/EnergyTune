import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../config/theme';
import { dashboard, common } from '../config/texts';
import { calculateAverage, formatDisplayDate, getDaysAgo } from '../utils/helpers';
import StorageService from '../services/storage';

const screenWidth = Dimensions.get('window').width;

export const DashboardScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayClicks, setTodayClicks] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Create multiple animated values for confetti - use lazy initialization
  const confettiAnimations = useRef(null);
  
  // Initialize animations only once
  useEffect(() => {
    if (!confettiAnimations.current) {
      confettiAnimations.current = Array.from({ length: 10 }, () => ({
        opacity: new Animated.Value(0),
        translateY: new Animated.Value(-20),
        translateX: new Animated.Value(0),
        rotate: new Animated.Value(0),
        scale: new Animated.Value(0)
      }));
    }
  }, []);

  // Load data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadRecentEntries();
    }, [])
  );

  const loadRecentEntries = async () => {
    try {
      setLoading(true);
      const recentEntries = await StorageService.getRecentEntries(7);
      setEntries(recentEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCombinedChartData = () => {
    if (entries.length === 0) {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            data: [0, 0, 0, 0, 0, 0, 0],
            color: () => theme.colors.systemGray3,
            strokeWidth: 2,
          }
        ],
      };
    }

    // Get last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = getDaysAgo(i);
      const entry = entries.find(e => e.date === date);
      last7Days.push({
        date,
        entry: entry || null,
      });
    }

    const labels = last7Days.map(({ date }) => {
      const dateObj = new Date(date + 'T12:00:00');
      return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    });

    const energyData = last7Days.map(({ entry }) => {
      if (!entry) return 0;
      const levels = entry.energyLevels;
      const values = Object.values(levels).filter(v => v !== null && v !== undefined);
      return values.length > 0 ? calculateAverage(values) : 0;
    });

    const stressData = last7Days.map(({ entry }) => {
      if (!entry) return 0;
      const levels = entry.stressLevels;
      const values = Object.values(levels).filter(v => v !== null && v !== undefined);
      return values.length > 0 ? calculateAverage(values) : 0;
    });

    return {
      labels,
      datasets: [
        {
          data: energyData,
          color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: stressData,
          color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`,
          strokeWidth: 2,
        }
      ],
    };
  };

  const getWeeklyAnalysis = () => {
    if (entries.length === 0) {
      return {
        energyAvg: 0,
        stressAvg: 0,
        bestDay: { day: '', score: 0 },
        challengingDay: { day: '', score: 0 },
        peakEnergyTime: 'No data'
      };
    }

    let totalEnergy = 0;
    let totalStress = 0;
    let dayCount = 0;
    let bestDay = { day: '', score: 0 };
    let challengingDay = { day: '', score: 10 };
    let timeSlotEnergy = {};

    entries.forEach(entry => {
      const energyValues = Object.values(entry.energyLevels).filter(v => v !== null && v !== undefined);
      const stressValues = Object.values(entry.stressLevels).filter(v => v !== null && v !== undefined);
      
      if (energyValues.length > 0 || stressValues.length > 0) {
        dayCount++;
        const dayEnergyAvg = energyValues.length > 0 ? calculateAverage(energyValues) : 0;
        const dayStressAvg = stressValues.length > 0 ? calculateAverage(stressValues) : 0;
        
        totalEnergy += dayEnergyAvg;
        totalStress += dayStressAvg;
        
        // Calculate day score (higher energy, lower stress = better)
        const dayScore = dayEnergyAvg - (dayStressAvg * 0.5);
        const dayName = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' });
        
        if (dayScore > bestDay.score) {
          bestDay = { day: dayName, score: dayScore };
        }
        if (dayScore < challengingDay.score) {
          challengingDay = { day: dayName, score: dayScore };
        }
        
        // Track energy by time slots
        Object.entries(entry.energyLevels).forEach(([time, value]) => {
          if (value !== null && value !== undefined) {
            if (!timeSlotEnergy[time]) timeSlotEnergy[time] = [];
            timeSlotEnergy[time].push(value);
          }
        });
      }
    });

    // Find peak energy time
    let peakEnergyTime = 'No data';
    let highestAvg = 0;
    Object.entries(timeSlotEnergy).forEach(([time, values]) => {
      const avg = calculateAverage(values);
      if (avg > highestAvg) {
        highestAvg = avg;
        peakEnergyTime = time;
      }
    });

    return {
      energyAvg: dayCount > 0 ? totalEnergy / dayCount : 0,
      stressAvg: dayCount > 0 ? totalStress / dayCount : 0,
      bestDay,
      challengingDay: challengingDay.score < 10 ? challengingDay : { day: '', score: 0 },
      peakEnergyTime
    };
  };

  const getTodayStats = () => {
    const todayDate = getDaysAgo(0);
    const todayEntry = entries.find(e => e.date === todayDate);
    
    if (!todayEntry) {
      return { energyAvg: 0, stressAvg: 0, hasData: false };
    }

    const energyValues = Object.values(todayEntry.energyLevels).filter(v => v !== null && v !== undefined);
    const stressValues = Object.values(todayEntry.stressLevels).filter(v => v !== null && v !== undefined);

    return {
      energyAvg: energyValues.length > 0 ? calculateAverage(energyValues) : 0,
      stressAvg: stressValues.length > 0 ? calculateAverage(stressValues) : 0,
      hasData: energyValues.length > 0 || stressValues.length > 0,
    };
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    
    let timeOfDay;
    if (hour >= 5 && hour < 12) {
      timeOfDay = 'morning';
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = 'afternoon';
    } else if (hour >= 17 && hour < 22) {
      timeOfDay = 'evening';
    } else {
      timeOfDay = 'night';
    }

    const messages = dashboard.greetings[timeOfDay];
    // Use greeting index with some randomness for variety
    const baseIndex = greetingIndex % messages.length;
    const randomOffset = Math.floor(Math.random() * 3); // Add 0-2 random offset
    const finalIndex = (baseIndex + randomOffset) % messages.length;
    return messages[finalIndex];
  };

  const handleTodayClick = () => {
    const newClicks = todayClicks + 1;
    setTodayClicks(newClicks);
    
    if (newClicks >= 5) {
      setShowEasterEgg(true);
      setTimeout(() => {
        setShowEasterEgg(false);
        setTodayClicks(0);
      }, 3000);
    }
  };

  const triggerConfetti = () => {
    // Prevent rapid successive animations
    if (showConfetti || !confettiAnimations.current) return;
    
    setShowConfetti(true);
    
    // Create immediate confetti animations (no delay)
    const animations = confettiAnimations.current.map((anim, index) => {
      // Reset values
      anim.opacity.setValue(0);
      anim.translateY.setValue(-20);
      anim.translateX.setValue((Math.random() - 0.5) * 80); // Random horizontal spread
      anim.rotate.setValue(0);
      anim.scale.setValue(0.8 + Math.random() * 0.4); // Vary initial scale
      
      const fallDuration = 1200 + Math.random() * 600; // 1.2-1.8 seconds
      const fadeStartDelay = fallDuration * 0.6; // Start fading at 60% of fall duration
      
      return Animated.parallel([
        // Fade in immediately, then fade out while falling
        Animated.sequence([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.delay(fadeStartDelay),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: fallDuration - fadeStartDelay - 100,
            useNativeDriver: true,
          }),
        ]),
        // Fall down further (into card area)
        Animated.timing(anim.translateY, {
          toValue: 200 + Math.random() * 100, // Fall further down
          duration: fallDuration,
          useNativeDriver: true,
        }),
        // Gentle rotation
        Animated.timing(anim.rotate, {
          toValue: 180 + Math.random() * 180,
          duration: fallDuration,
          useNativeDriver: true,
        }),
        // Slight horizontal drift
        Animated.timing(anim.translateX, {
          toValue: anim.translateX._value + (Math.random() - 0.5) * 60,
          duration: fallDuration,
          useNativeDriver: true,
        }),
      ]);
    });
    
    // Run all animations in parallel
    Animated.parallel(animations).start(() => {
      setShowConfetti(false);
    });
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      
      // Subtle haptic feedback for iOS native feel
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Cycle to the next greeting message
      setGreetingIndex(prevIndex => prevIndex + 1);
      
      // Load fresh data
      await loadRecentEntries();
      
      // Trigger satisfying confetti animation
      triggerConfetti();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const chartConfig = {
    backgroundColor: theme.colors.primaryBackground,
    backgroundGradientFrom: theme.colors.primaryBackground,
    backgroundGradientTo: theme.colors.primaryBackground,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.secondaryLabel,
    style: {
      borderRadius: 0,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: theme.colors.primaryBackground,
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: '400',
    },
    withHorizontalLabels: true,
    withVerticalLabels: true,
    withInnerLines: false,
    withOuterLines: false,
  };

  const todayStats = getTodayStats();
  const weeklyAnalysis = getWeeklyAnalysis();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.secondaryBackground }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.secondaryLabel }]}>{common.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.secondaryBackground }]}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.systemBlue}
            colors={[theme.colors.systemBlue]} // Android
            progressBackgroundColor={theme.colors.primaryBackground} // Android
            title="Pull for energy..." // iOS
            titleColor={theme.colors.secondaryText} // iOS
          />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.secondaryBackground }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.greeting, { color: theme.colors.label }]}>{getGreeting()}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton} 
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="cog" size={26} color={theme.colors.systemBlue} />
          </TouchableOpacity>
        </View>

        {/* Today's Overview */}
        <TouchableOpacity 
          style={[styles.todayCard, { backgroundColor: theme.colors.primaryBackground }]} 
          onPress={handleTodayClick} 
          activeOpacity={0.95}
        >
          <View style={styles.todayHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.label }]}>
              {dashboard.todayOverview.title}
            </Text>
            {showEasterEgg && (
              <Text style={[styles.easterEgg, { color: theme.colors.systemBlue }]}>{dashboard.todayOverview.easterEgg}</Text>
            )}
          </View>
          
          {todayStats.hasData ? (
            <View style={styles.todayStats}>
              <View style={styles.statPair}>
                <View style={styles.todayStat}>
                  <View style={styles.statContainer}>
                    <View style={[styles.statIndicator, { backgroundColor: theme.colors.energy }]} />
                    <Text style={[styles.statValue, { color: theme.colors.label }]}>{todayStats.energyAvg.toFixed(1)}</Text>
                  </View>
                  <Text style={[styles.statLabel, { color: theme.colors.secondaryLabel }]}>{dashboard.todayOverview.energyLabel}</Text>
                </View>
                <View style={styles.todayStat}>
                  <View style={styles.statContainer}>
                    <View style={[styles.statIndicator, { backgroundColor: theme.colors.stress }]} />
                    <Text style={[styles.statValue, { color: theme.colors.label }]}>{todayStats.stressAvg.toFixed(1)}</Text>
                  </View>
                  <Text style={[styles.statLabel, { color: theme.colors.secondaryLabel }]}>{dashboard.todayOverview.stressLabel}</Text>
                </View>
              </View>
              <Text style={[styles.todaySubtext, { color: theme.colors.secondaryLabel }]}>{dashboard.todayOverview.motivationText}</Text>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <View style={styles.noDataContent}>
                <Text style={styles.noDataEmoji}>{common.noDataEmoji}</Text>
                <Text style={[styles.noDataText, { color: theme.colors.secondaryLabel }]}>{dashboard.todayOverview.noDataTitle}</Text>
                <Text style={[styles.noDataSubtext, { color: theme.colors.tertiaryLabel }]}>{dashboard.todayOverview.noDataSubtitle}</Text>
                <TouchableOpacity 
                  style={[styles.addDataButton, { backgroundColor: theme.colors.systemBlue + '15' }]}
                  onPress={() => navigation.navigate('Entry')}
                >
                  <Ionicons name="add-circle" size={20} color={theme.colors.systemBlue} />
                  <Text style={[styles.addDataButtonText, { color: theme.colors.systemBlue }]}>{dashboard.todayOverview.addEntryButton}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Combined Trends Chart */}
        <View style={[styles.trendsCard, { backgroundColor: theme.colors.primaryBackground }]}>
          <View style={styles.trendsHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.label, marginBottom: 0 }]}>{dashboard.trends.title}</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Analytics')}
              style={styles.detailsButton}
            >
              <Text style={[styles.detailsText, { color: theme.colors.systemBlue }]}>{dashboard.trends.detailsButton}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.systemBlue} />
            </TouchableOpacity>
          </View>
          
          {entries.length > 0 ? (
            <>
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: theme.colors.energy }]} />
                  <Text style={[styles.legendText, { color: theme.colors.secondaryLabel }]}>{dashboard.trends.energyLegend}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: theme.colors.stress }]} />
                  <Text style={[styles.legendText, { color: theme.colors.secondaryLabel }]}>{dashboard.trends.stressLegend}</Text>
                </View>
              </View>
              
              <LineChart
                data={getCombinedChartData()}
                width={screenWidth - 80}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                fromZero
                segments={4}
              />
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={[styles.noDataText, { color: theme.colors.secondaryLabel }]}>{dashboard.trends.noDataTitle}</Text>
              <Text style={[styles.noDataSubtext, { color: theme.colors.tertiaryLabel }]}>{dashboard.trends.noDataSubtitle}</Text>
            </View>
          )}
        </View>

        {/* Weekly Insights */}
        <View style={[styles.insightsCard, { backgroundColor: theme.colors.primaryBackground }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.label, marginBottom: 24 }]}>{dashboard.weeklyInsights.title}</Text>
          
          {entries.length > 0 ? (
            <View style={styles.insightsContent}>
              {/* Weekly Averages */}
              <View style={styles.weeklyAverages}>
                <View style={styles.averageItem}>
                  <Text style={[styles.averageValue, { color: theme.colors.label }]}>{weeklyAnalysis.energyAvg.toFixed(1)}</Text>
                  <Text style={[styles.averageLabel, { color: theme.colors.energy }]}>{dashboard.weeklyInsights.avgEnergyLabel}</Text>
                </View>
                <View style={styles.averageItem}>
                  <Text style={[styles.averageValue, { color: theme.colors.label }]}>{weeklyAnalysis.stressAvg.toFixed(1)}</Text>
                  <Text style={[styles.averageLabel, { color: theme.colors.stress }]}>{dashboard.weeklyInsights.avgStressLabel}</Text>
                </View>
              </View>

              <View style={[styles.separator, { backgroundColor: theme.colors.separator }]} />

              {/* Best & Challenging Days */}
              <View style={styles.daysAnalysis}>
                {weeklyAnalysis.bestDay.day && (
                  <View style={styles.dayItem}>
                    <Text style={styles.dayEmoji}>🌟</Text>
                    <View style={styles.dayContent}>
                      <Text style={[styles.dayLabel, { color: theme.colors.secondaryLabel }]}>{dashboard.weeklyInsights.bestDayLabel}</Text>
                      <Text style={[styles.dayValue, { color: theme.colors.label }]}>{weeklyAnalysis.bestDay.day}</Text>
                    </View>
                  </View>
                )}
                
                {weeklyAnalysis.challengingDay.day && (
                  <View style={styles.dayItem}>
                    <Text style={styles.dayEmoji}>💪</Text>
                    <View style={styles.dayContent}>
                      <Text style={[styles.dayLabel, { color: theme.colors.secondaryLabel }]}>{dashboard.weeklyInsights.challengingDayLabel}</Text>
                      <Text style={[styles.dayValue, { color: theme.colors.label }]}>{weeklyAnalysis.challengingDay.day}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.dayItem}>
                  <Text style={styles.dayEmoji}>⚡</Text>
                  <View style={styles.dayContent}>
                    <Text style={[styles.dayLabel, { color: theme.colors.secondaryLabel }]}>{dashboard.weeklyInsights.peakEnergyLabel}</Text>
                    <Text style={[styles.dayValue, { color: theme.colors.label }]}>{weeklyAnalysis.peakEnergyTime}</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={[styles.noDataText, { color: theme.colors.secondaryLabel }]}>{dashboard.weeklyInsights.noDataTitle}</Text>
              <Text style={[styles.noDataSubtext, { color: theme.colors.tertiaryLabel }]}>{dashboard.weeklyInsights.noDataSubtitle}</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      {/* Confetti Animation Overlay - Limited to Header Area */}
      {showConfetti && confettiAnimations.current && (
        <View style={styles.confettiContainer}>
          {confettiAnimations.current.map((anim, index) => {
            // Different confetti colors and shapes
            const confettiColors = [
              '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
              '#DDA0DD', '#98D8C8', '#F7DC6F', '#FF9FF3', '#54A0FF'
            ];
            const confettiShapes = ['rectangle', 'square', 'circle'];
            const color = confettiColors[index % confettiColors.length];
            const shape = confettiShapes[index % confettiShapes.length];
            
            let shapeStyle = {};
            if (shape === 'rectangle') {
              shapeStyle = { width: 4 + Math.random() * 3, height: 8 + Math.random() * 6, borderRadius: 1 };
            } else if (shape === 'square') {
              shapeStyle = { width: 6 + Math.random() * 3, height: 6 + Math.random() * 3, borderRadius: 1 };
            } else { // circle
              shapeStyle = { width: 5 + Math.random() * 3, height: 5 + Math.random() * 3, borderRadius: 50 };
            }
            
            return (
              <Animated.View
                key={index}
                style={[
                  styles.confetti,
                  {
                    left: `${10 + (index * 8)}%`, // Spread across header width
                    opacity: anim.opacity,
                    transform: [
                      { translateY: anim.translateY },
                      { translateX: anim.translateX },
                      { rotate: anim.rotate.interpolate({
                        inputRange: [0, 360],
                        outputRange: ['0deg', '360deg']
                      }) },
                      { scale: anim.scale }
                    ]
                  }
                ]}
              >
                <View style={[
                  styles.confettiPiece,
                  shapeStyle,
                  { backgroundColor: color }
                ]} />
              </Animated.View>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 17,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24, // Reduced from 32 to bring cards closer
    zIndex: 100, // Ensure header stays on top of RefreshControl text
    position: 'relative',
  },

  headerContent: {
    flex: 1,
  },

  greeting: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 2,
  },

  subtitle: {
    fontSize: 17,
  },

  profileButton: {
    padding: 4,
    marginLeft: 16,
  },

  // Confetti Animation - Extended to allow falling into cards
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400, // Extended to allow falling into card area
    pointerEvents: 'none',
    zIndex: 1000,
  },

  confetti: {
    position: 'absolute',
    top: 20,
  },

  confettiPiece: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  
  // Card Styles
  todayCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 24,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  trendsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 24,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  insightsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 24,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 0,
  },

  // Today's Overview
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  easterEgg: {
    fontSize: 12,
    fontWeight: '600',
  },

  todayStats: {
    alignItems: 'center',
  },

  statPair: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },

  todayStat: {
    alignItems: 'center',
    minWidth: 80,
  },

  statContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },

  statIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginBottom: 8,
  },

  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 2,
  },

  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },

  todaySubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },

  // Trends
  trendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  detailsText: {
    fontSize: 17,
    fontWeight: '500',
  },

  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },

  chart: {
    borderRadius: 8,
    marginVertical: 8,
  },

  // Weekly Insights
  insightsContent: {
    gap: 24,
  },

  weeklyAverages: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  averageItem: {
    alignItems: 'center',
  },

  averageValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },

  averageLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  separator: {
    height: 1,
    marginHorizontal: 24,
  },

  daysAnalysis: {
    gap: 16,
  },

  dayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  dayEmoji: {
    fontSize: 20,
    width: 24,
    textAlign: 'center',
  },

  dayContent: {
    flex: 1,
  },

  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 1,
  },

  dayValue: {
    fontSize: 17,
    fontWeight: '500',
  },

  // No Data States
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },

  noDataContent: {
    alignItems: 'center',
  },

  noDataText: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 4,
  },

  noDataSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },

  noDataEmoji: {
    fontSize: 32,
    marginBottom: 16,
  },

  addDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 24,
    gap: 4,
  },

  addDataButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },

  // Easter Egg
  easterEggContainer: {
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    alignItems: 'center',
  },

  easterEggText: {
    fontSize: 17,
    fontWeight: '500',
  },
  
  bottomSpacing: {
    height: 40,
  },
});
