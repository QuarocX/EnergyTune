import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../config/theme';
import { dashboard, common } from '../config/texts';
import { calculateAverage, formatDisplayDate, getDaysAgo } from '../utils/helpers';
import { getCelebrationState, clearCelebrationState } from '../utils/celebrationState';
import { isEntryComplete, hasAnyData } from '../utils/entryValidation';
import StorageService from '../services/storage';

const screenWidth = Dimensions.get('window').width;

export const DashboardScreen = ({ navigation, route }) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayClicks, setTodayClicks] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showEnergyWave, setShowEnergyWave] = useState(false);
  const [colorProgress, setColorProgress] = useState(0); // Track color progress 0-1
  const [bannerMessageIndex, setBannerMessageIndex] = useState(Math.floor(Math.random() * 8)); // Random initial message
  
  // Create multiple animated values for confetti - use lazy initialization
  const confettiAnimations = useRef(null);
  
  // Banner animation
  const bannerSlideAnim = useRef(new Animated.Value(-100)).current;
  const bannerOpacityAnim = useRef(new Animated.Value(0)).current;
  const bannerPulseAnim = useRef(new Animated.Value(1)).current;
  
  // Recharging wave animations for pull-to-refresh (like your app icon)
  const rechargingWaves = useRef(null);
  
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
      
      // Check simple global celebration state
      const celebrationState = getCelebrationState(); 
      if (celebrationState.shouldCelebrate) {
        
        // Clear the state immediately
        clearCelebrationState();
        
        // Trigger celebration
        triggerEntryCompletionCelebration(celebrationState.completionType);
      }
    }, [])
  );

  const loadRecentEntries = async () => {
    try {
      setLoading(true);
      const recentEntries = await StorageService.getRecentEntries(7);
      setEntries(recentEntries);
      
      // Animate banner if today's entry is incomplete
      setTimeout(() => {
        const todayDate = getDaysAgo(0);
        const todayEntry = recentEntries.find(e => e.date === todayDate);
        
        if (todayEntry && hasAnyData(todayEntry) && !isEntryComplete(todayEntry)) {
          animateBannerIn();
        }
      }, 300); // Delay for smooth entrance after other content loads
      
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const animateBannerIn = () => {
    Animated.parallel([
      Animated.spring(bannerSlideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(bannerOpacityAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Start subtle pulse animation after banner appears
      startBannerPulse();
    });
  };

  const startBannerPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bannerPulseAnim, {
          toValue: 1.02,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bannerPulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleBannerPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Entry');
  };

  const handleEditPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Entry');
  };

  // Helper function to get day names from indices
  const getDayNamesFromIndices = (indices, dayDetails) => {
    if (!indices || indices.length === 0 || !dayDetails) return [];
    
    return indices.map(index => {
      if (index >= 0 && index < dayDetails.length) {
        const date = dayDetails[index].date;
        const dateObj = new Date(date + 'T12:00:00');
        return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      }
      return null;
    }).filter(Boolean);
  };

  // Navigate to Entry screen with specific date (first day from badge)
  const handleBadgePress = async (dayIndices, dayDetails) => {
    if (!dayIndices || dayIndices.length === 0 || !dayDetails) return;
    
    // Get the first day from the list
    const firstDayIndex = dayIndices[0];
    const date = dayDetails[firstDayIndex]?.date;
    
    if (date) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate('Entry', { date });
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
        excludedToday: false,
        missingDays: [],
        partialDays: [],
      };
    }

    // Check if today should be excluded (incomplete or empty)
    const todayDate = getDaysAgo(0);
    const todayEntry = entries.find(e => e.date === todayDate);
    const isTodayIncomplete = todayEntry && hasAnyData(todayEntry) && !isEntryComplete(todayEntry);
    const isTodayEmpty = !todayEntry || !hasAnyData(todayEntry);
    const shouldExcludeToday = isTodayIncomplete || isTodayEmpty;

    // Get last 7 days, but ONLY exclude today if incomplete
    // For past days, include them regardless of data completeness
    const last7Days = [];
    const missingDayIndices = [];
    const partialDayIndices = [];
    
    const daysToShow = shouldExcludeToday ? 7 : 6; // Show 7 days total (either including today or going back further)
    
    for (let i = daysToShow; i >= 0; i--) {
      const date = getDaysAgo(i);
      const isToday = i === 0;
      
      // Skip today if it's incomplete or empty
      if (isToday && shouldExcludeToday) {
        continue;
      }
      
      const entry = entries.find(e => e.date === date);
      const dataIndex = last7Days.length;
      
      // Check data completeness for this day
      const hasNoData = !entry || !hasAnyData(entry);
      const isComplete = entry && isEntryComplete(entry);
      const isPartial = entry && hasAnyData(entry) && !isComplete;
      
      if (hasNoData) {
        missingDayIndices.push(dataIndex);
      } else if (isPartial) {
        partialDayIndices.push(dataIndex);
      }
      
      last7Days.push({
        date,
        entry: entry || null,
        hasData: !hasNoData,
        isComplete,
        isPartial,
      });
    }

    // Ensure we have exactly 7 days
    const displayDays = last7Days.slice(-7);
    const adjustedMissingIndices = missingDayIndices.map(idx => idx - (last7Days.length - 7)).filter(idx => idx >= 0);
    const adjustedPartialIndices = partialDayIndices.map(idx => idx - (last7Days.length - 7)).filter(idx => idx >= 0);

    const labels = displayDays.map(({ date }) => {
      const dateObj = new Date(date + 'T12:00:00');
      return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    });

    const energyData = displayDays.map(({ entry, hasData }) => {
      if (!hasData || !entry) return null; // null creates gap in chart
      const levels = entry.energyLevels;
      const values = Object.values(levels).filter(v => v !== null && v !== undefined);
      return values.length > 0 ? calculateAverage(values) : null;
    });

    const stressData = displayDays.map(({ entry, hasData }) => {
      if (!hasData || !entry) return null; // null creates gap in chart
      const levels = entry.stressLevels;
      const values = Object.values(levels).filter(v => v !== null && v !== undefined);
      return values.length > 0 ? calculateAverage(values) : null;
    });

    // Count days with actual data
    const daysWithData = displayDays.filter(d => d.hasData).length;

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
      excludedToday: shouldExcludeToday,
      dataPointsCount: daysWithData,
      missingDays: adjustedMissingIndices,
      partialDays: adjustedPartialIndices,
      dayDetails: displayDays,
    };
  };

  const getWeeklyAnalysis = () => {
    if (entries.length === 0) {
      return {
        energyAvg: 0,
        stressAvg: 0,
        bestDay: { day: '', score: 0, energy: 0 },
        challengingDay: { day: '', score: 0, stress: 0 },
        peakEnergyTime: 'No data',
        peakEnergyValue: 0,
        completeEntriesCount: 0
      };
    }

    // Only analyze complete entries
    const todayDate = getDaysAgo(0);
    const completeEntries = entries.filter(entry => {
      // Exclude today if incomplete
      const isToday = entry.date === todayDate;
      if (isToday) {
        return isEntryComplete(entry);
      }
      // Include only complete past entries
      return isEntryComplete(entry);
    });

    if (completeEntries.length === 0) {
      return {
        energyAvg: 0,
        stressAvg: 0,
        bestDay: { day: '', score: 0, energy: 0 },
        challengingDay: { day: '', score: 0, stress: 0 },
        peakEnergyTime: 'No data',
        peakEnergyValue: 0,
        completeEntriesCount: 0
      };
    }

    let totalEnergy = 0;
    let totalStress = 0;
    let dayCount = 0;
    let bestDay = { day: '', score: 0, energy: 0 };
    let challengingDay = { day: '', score: 10, stress: 0 };
    let timeSlotEnergy = {};

    completeEntries.forEach(entry => {
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
          bestDay = { day: dayName, score: dayScore, energy: dayEnergyAvg };
        }
        if (dayScore < challengingDay.score) {
          challengingDay = { day: dayName, score: dayScore, stress: dayStressAvg };
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
    let peakEnergyValue = 0;
    let highestAvg = 0;
    Object.entries(timeSlotEnergy).forEach(([time, values]) => {
      const avg = calculateAverage(values);
      if (avg > highestAvg) {
        highestAvg = avg;
        peakEnergyTime = time;
        peakEnergyValue = avg;
      }
    });

    return {
      energyAvg: dayCount > 0 ? totalEnergy / dayCount : 0,
      stressAvg: dayCount > 0 ? totalStress / dayCount : 0,
      bestDay,
      challengingDay: challengingDay.score < 10 ? challengingDay : { day: '', score: 0, stress: 0 },
      peakEnergyTime,
      peakEnergyValue,
      completeEntriesCount: dayCount
    };
  };

  const getTodayStats = () => {
    const todayDate = getDaysAgo(0);
    const todayEntry = entries.find(e => e.date === todayDate);
    
    if (!todayEntry) {
      return { energyAvg: 0, stressAvg: 0, hasData: false, entry: null };
    }

    const energyValues = Object.values(todayEntry.energyLevels).filter(v => v !== null && v !== undefined);
    const stressValues = Object.values(todayEntry.stressLevels).filter(v => v !== null && v !== undefined);

    return {
      energyAvg: energyValues.length > 0 ? calculateAverage(energyValues) : 0,
      stressAvg: stressValues.length > 0 ? calculateAverage(stressValues) : 0,
      hasData: energyValues.length > 0 || stressValues.length > 0,
      entry: todayEntry,
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
    // Use ONLY greeting index - NO random offset to prevent unwanted changes
    const finalIndex = greetingIndex % messages.length;
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
    if (showConfetti || !confettiAnimations.current) {
      return;
    }
    
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

  // Helper function to interpolate between red and green
  const interpolateColor = (progress) => {
    // Ensure progress is between 0 and 1
    progress = Math.max(0, Math.min(1, progress));
    
    // Red: #FF4444 -> Green: #4CAF50
    const red = Math.round(255 - (255 - 76) * progress); // 255 -> 76 (FF -> 4C)
    const green = Math.round(68 + (175 - 68) * progress); // 68 -> 175 (44 -> AF)
    const blue = Math.round(68 + (80 - 68) * progress);   // 68 -> 80 (44 -> 50)
    
    return `rgb(${red}, ${green}, ${blue})`;
  };

  // Recharging wave animation that mimics your app icon's flowing waves
  const triggerRechargingWave = () => {
    
    // Prevent rapid successive animations
    if (showEnergyWave) {
      return;
    }
    
    setShowEnergyWave(true);
    setColorProgress(0); // Start red
    
    // Simple animated values for transforms only
    const rechargingBar = {
      scaleX: new Animated.Value(0), 
      opacity: new Animated.Value(0),
    };
    
    // Color transition timing - update color smoothly during fill
    let colorUpdateInterval;
    const startColorTransition = () => {
      const startTime = Date.now();
      const duration = 1000; // Same as fill duration
      
      colorUpdateInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        setColorProgress(progress);
        
        if (progress >= 1) {
          clearInterval(colorUpdateInterval);
        }
      }, 16); // ~60fps updates
    };
    
    // Sequential animation
    const animation = Animated.sequence([
      // Brief red flash (empty bar)
      Animated.timing(rechargingBar.opacity, {
        toValue: 0.4,
        duration: 150,
        useNativeDriver: true,
      }),
      // Fill up with gradual color change
      Animated.parallel([
        Animated.timing(rechargingBar.scaleX, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rechargingBar.opacity, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // Hold green charged state
      Animated.delay(700),
      // Fade out
      Animated.timing(rechargingBar.opacity, {
        toValue: 0,
        duration: 500,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    
    // Start color transition when fill begins
    setTimeout(() => {
      startColorTransition();
    }, 150); // Start after initial red flash
    
    // Store the single bar for rendering
    rechargingWaves.current = [rechargingBar];
    
    // Start the animation
    animation.start(() => {
      if (colorUpdateInterval) {
        clearInterval(colorUpdateInterval);
      }
      setShowEnergyWave(false);
      rechargingWaves.current = null;
      setColorProgress(0); // Reset for next time
    });
  };

  // Apple-style minimalist celebration for entry completion
  const triggerEntryCompletionCelebration = (completionType) => {
    
    // More impactful haptic feedback based on completion type
    if (completionType === 'complete') {
      // Success notification for complete entries - most satisfying
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // CONFETTI ONLY FOR ENTRY COMPLETION
      triggerConfetti();
    } else {
      // Warning notification for partial entries - less satisfying
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      
      // Subtle haptic feedback for iOS native feel
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Change greeting message ONCE (no data refresh)
      setGreetingIndex(prevIndex => prevIndex + 1);
      
      // Rotate banner message for variety
      setBannerMessageIndex(prevIndex => prevIndex + 1);
      
      // ONLY RECHARGING WAVES for pull-to-refresh - NO CONFETTI!
      triggerRechargingWave();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const showExplanation = (type) => {
    let title = '';
    let message = '';
    
    switch (type) {
      case 'section':
        title = dashboard.weeklyInsights.title;
        message = dashboard.weeklyInsights.explanations.section;
        break;
      case 'bestDay':
        title = dashboard.weeklyInsights.bestDayLabel;
        message = dashboard.weeklyInsights.explanations.bestDay;
        break;
      case 'challengingDay':
        title = dashboard.weeklyInsights.challengingDayLabel;
        message = dashboard.weeklyInsights.explanations.challengingDay;
        break;
      case 'peakEnergy':
        title = dashboard.weeklyInsights.peakEnergyLabel;
        message = dashboard.weeklyInsights.explanations.peakEnergy;
        break;
      case 'dataCompleteness':
        title = 'Data Completeness';
        message = 'This shows which days have incomplete data in your 7-day trends:\n\n⚠️ Orange badge = No data entered for that day\n\n🔵 Blue badge = Partial entry (some time slots logged, but not all three: morning, afternoon, evening)\n\nTap any badge to jump directly to that day\'s entry and fill in the missing data. For the most accurate insights, try to log all three time slots each day.';
        break;
    }
    
    Alert.alert(title, message, [{ text: 'Got it', style: 'default' }]);
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
  const chartData = getCombinedChartData();
  
  // Check if today's entry is incomplete
  const showIncompleteBanner = todayStats.entry && hasAnyData(todayStats.entry) && !isEntryComplete(todayStats.entry);
  
  // Show Edit link only when entry is complete (not incomplete, not empty)
  const showEditLink = todayStats.entry && isEntryComplete(todayStats.entry);
  
  // Rotate banner message for variety
  const bannerMessage = dashboard.todayOverview.incompleteBanner.messages[
    bannerMessageIndex % dashboard.todayOverview.incompleteBanner.messages.length
  ];

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.secondaryBackground }]} edges={['top']}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF8C42" // Orange color from your logo
            colors={['#FF8C42', '#FF9500', '#4ECDC4', '#45B7D1', '#2E86AB']} // All animation colors
            progressBackgroundColor={theme.colors.primaryBackground} // Android
            title="Energizing..." // iOS
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
        <View style={[styles.todayCard, { backgroundColor: theme.colors.primaryBackground }]}>
          {/* Incomplete Entry Banner */}
          {showIncompleteBanner && (
            <Animated.View
              style={[
                styles.incompleteBanner,
                {
                  transform: [
                    { translateY: bannerSlideAnim },
                    { scale: bannerPulseAnim }
                  ],
                  opacity: bannerOpacityAnim,
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.bannerTouchable}
                onPress={handleBannerPress}
                activeOpacity={0.8}
              >
                {/* Gradient background effect using layered views */}
                <View style={styles.bannerGradientBase} />
                <View style={styles.bannerGradientOverlay} />
                
                {/* Banner content */}
                <View style={styles.bannerContent}>
                  <View style={styles.bannerTextContainer}>
                    <Ionicons name="alert-circle" size={20} color="#FFFFFF" style={styles.bannerIcon} />
                    <Text style={styles.bannerText}>{bannerMessage}</Text>
                  </View>
                  <View style={styles.bannerArrow}>
                    <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
          
          <TouchableOpacity 
            style={styles.todayCardContent}
            onPress={handleTodayClick} 
            activeOpacity={0.95}
          >
            <View style={styles.todayHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.label }]}>
                {dashboard.todayOverview.title}
              </Text>
              <View style={styles.todayHeaderRight}>
                {showEasterEgg && (
                  <Text style={[styles.easterEgg, { color: theme.colors.systemBlue }]}>{dashboard.todayOverview.easterEgg}</Text>
                )}
                {showEditLink && !showEasterEgg && (
                  <TouchableOpacity 
                    onPress={handleEditPress}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.6}
                  >
                    <View style={styles.editLinkContainer}>
                      <Text style={[styles.editLinkText, { color: theme.colors.systemBlue }]}>
                        {dashboard.todayOverview.editLink}
                      </Text>
                      <Ionicons 
                        name="chevron-forward" 
                        size={16} 
                        color={theme.colors.systemBlue} 
                        style={styles.editLinkChevron}
                      />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
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
        </View>

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
          
          {/* Today Excluded Info Card */}
          {chartData.excludedToday && chartData.dataPointsCount > 0 && (
            <TouchableOpacity 
              style={[styles.trendsInfoCard, { backgroundColor: theme.colors.systemBlue + '10', borderColor: theme.colors.systemBlue + '20' }]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('Entry');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.trendsInfoIconContainer}>
                <Ionicons name="information-circle" size={20} color={theme.colors.systemBlue} />
              </View>
              <View style={styles.trendsInfoContent}>
                <Text style={[styles.trendsInfoTitle, { color: theme.colors.label }]}>
                  Today not yet included
                </Text>
                <Text style={[styles.trendsInfoSubtitle, { color: theme.colors.secondaryLabel }]}>
                  Complete your entry to see it in trends
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.systemBlue} style={styles.trendsInfoChevron} />
            </TouchableOpacity>
          )}
          
          {entries.length > 0 && chartData.dataPointsCount > 0 ? (
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
                data={chartData}
                width={screenWidth - 80}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                fromZero
                segments={4}
              />
              
              {/* Data completeness summary - Badge/Pill style */}
              {(chartData.missingDays.length > 0 || chartData.partialDays.length > 0) && (
                <View style={[styles.chartDataSummary, { borderTopColor: theme.colors.separator }]}>
                  <View style={styles.chartDataBadgeContainer}>
                    {chartData.missingDays.length > 0 && (
                      <TouchableOpacity 
                        style={[styles.chartDataBadge, { backgroundColor: theme.colors.systemGray6, borderColor: theme.colors.separator }]}
                        onPress={() => handleBadgePress(chartData.missingDays, chartData.dayDetails)}
                        activeOpacity={0.6}
                      >
                        <Ionicons name="alert-circle" size={14} color={theme.colors.systemOrange} style={styles.chartDataBadgeIcon} />
                        <Text style={[styles.chartDataBadgeText, { color: theme.colors.secondaryLabel }]}>
                          {getDayNamesFromIndices(chartData.missingDays, chartData.dayDetails).join(', ')}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {chartData.partialDays.length > 0 && (
                      <TouchableOpacity 
                        style={[styles.chartDataBadge, { backgroundColor: theme.colors.systemGray6, borderColor: theme.colors.separator }]}
                        onPress={() => handleBadgePress(chartData.partialDays, chartData.dayDetails)}
                        activeOpacity={0.6}
                      >
                        <Ionicons name="remove-circle" size={14} color={theme.colors.systemBlue} style={styles.chartDataBadgeIcon} />
                        <Text style={[styles.chartDataBadgeText, { color: theme.colors.secondaryLabel }]}>
                          {getDayNamesFromIndices(chartData.partialDays, chartData.dayDetails).join(', ')}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      onPress={() => showExplanation('dataCompleteness')}
                      style={styles.chartDataInfoButton}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="information-circle-outline" size={16} color={theme.colors.secondaryLabel} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
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
          <View style={styles.sectionTitleContainer}>
            <Text style={[styles.cardTitle, { color: theme.colors.label }]}>{dashboard.weeklyInsights.title}</Text>
            <TouchableOpacity 
              onPress={() => showExplanation('section')}
              style={styles.sectionInfoButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="information-circle-outline" size={18} color={theme.colors.secondaryLabel} />
            </TouchableOpacity>
          </View>
          
          {entries.length > 0 && weeklyAnalysis.completeEntriesCount > 0 ? (
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
                      <View style={styles.dayLabelContainer}>
                        <Text style={[styles.dayLabel, { color: theme.colors.secondaryLabel }]}>{dashboard.weeklyInsights.bestDayLabel}</Text>
                        <TouchableOpacity 
                          onPress={() => showExplanation('bestDay')}
                          style={styles.infoButton}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons name="information-circle-outline" size={14} color={theme.colors.secondaryLabel} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.dayValueContainer}>
                        <Text style={[styles.dayValue, { color: theme.colors.label }]}>{weeklyAnalysis.bestDay.day}</Text>
                        <Text style={[styles.dayScore, { color: theme.colors.energy }]}>⚡{weeklyAnalysis.bestDay.energy.toFixed(1)}</Text>
                      </View>
                    </View>
                  </View>
                )}
                
                {weeklyAnalysis.challengingDay.day && (
                  <View style={styles.dayItem}>
                    <Text style={styles.dayEmoji}>💪</Text>
                    <View style={styles.dayContent}>
                      <View style={styles.dayLabelContainer}>
                        <Text style={[styles.dayLabel, { color: theme.colors.secondaryLabel }]}>{dashboard.weeklyInsights.challengingDayLabel}</Text>
                        <TouchableOpacity 
                          onPress={() => showExplanation('challengingDay')}
                          style={styles.infoButton}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons name="information-circle-outline" size={14} color={theme.colors.secondaryLabel} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.dayValueContainer}>
                        <Text style={[styles.dayValue, { color: theme.colors.label }]}>{weeklyAnalysis.challengingDay.day}</Text>
                        <Text style={[styles.dayScore, { color: theme.colors.stress }]}>😰{weeklyAnalysis.challengingDay.stress.toFixed(1)}</Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.dayItem}>
                  <Text style={styles.dayEmoji}>⚡</Text>
                  <View style={styles.dayContent}>
                    <View style={styles.dayLabelContainer}>
                      <Text style={[styles.dayLabel, { color: theme.colors.secondaryLabel }]}>{dashboard.weeklyInsights.peakEnergyLabel}</Text>
                      <TouchableOpacity 
                        onPress={() => showExplanation('peakEnergy')}
                        style={styles.infoButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="information-circle-outline" size={14} color={theme.colors.secondaryLabel} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.dayValueContainer}>
                      <Text style={[styles.dayValue, { color: theme.colors.label }]}>{weeklyAnalysis.peakEnergyTime}</Text>
                      <Text style={[styles.dayScore, { color: theme.colors.energy }]}>⚡{weeklyAnalysis.peakEnergyValue.toFixed(1)}</Text>
                    </View>
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
      
      {/* Recharging Wave Animation Overlay - Only visible during animation */}
      {showEnergyWave && rechargingWaves.current && (
        <View style={styles.rechargingWaveContainer}>
          {rechargingWaves.current.map((bar, index) => (
            <Animated.View
              key={index}
              style={[
                styles.rechargingWave,
                {
                  backgroundColor: interpolateColor(colorProgress), // Smooth color transition
                  opacity: bar.opacity,
                  transform: [
                    { scaleX: bar.scaleX }, // Horizontal filling animation
                  ],
                }
              ]}
            />
          ))}
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
  
  // Recharging Wave Animation - Single bar transformation from stress to energy
  rechargingWaveContainer: {
    position: 'absolute',
    top: 40, // Move higher, above the greeting text
    left: '50%',
    transform: [{ translateX: -90 }], // Center the wider 180px container
    width: 180, // Much wider for better visibility
    height: 20, // Just enough for single bar
    pointerEvents: 'none',
    zIndex: 999,
    overflow: 'visible',
  },

  rechargingWave: {
    position: 'absolute',
    width: 180, // Much wider bar
    height: 12, // Slightly taller for the wider bar
    left: 0,
    top: 4, // Center vertically in container
    borderRadius: 6, // Proportional rounded edges
    transformOrigin: 'left center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Card Styles
  todayCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden', // Ensure banner stays within card bounds
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  todayCardContent: {
    padding: 24,
  },

  // Incomplete Entry Banner Styles
  incompleteBanner: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },

  bannerTouchable: {
    position: 'relative',
    width: '100%',
    minHeight: 56,
    overflow: 'hidden',
  },

  bannerGradientBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF9500', // iOS system orange
  },

  bannerGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF6B00',
    opacity: 0.3,
  },

  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: 'relative',
    zIndex: 1,
  },

  bannerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  bannerIcon: {
    marginRight: 10,
  },

  bannerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  bannerArrow: {
    marginLeft: 8,
    opacity: 0.9,
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

  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  sectionInfoButton: {
    marginLeft: 8,
    opacity: 0.6,
  },

  // Today's Overview
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  todayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  easterEgg: {
    fontSize: 12,
    fontWeight: '600',
  },

  editLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },

  editLinkText: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41, // iOS system font tracking
  },

  editLinkChevron: {
    marginLeft: 2,
    marginTop: 1, // Optical alignment
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

  // Trends Info Card (Today Excluded Notice)
  trendsInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
  },

  trendsInfoIconContainer: {
    marginRight: 12,
    opacity: 0.9,
  },

  trendsInfoContent: {
    flex: 1,
  },

  trendsInfoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: -0.2,
  },

  trendsInfoSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.1,
  },

  trendsInfoChevron: {
    marginLeft: 8,
    opacity: 0.7,
  },

  chartFooterNote: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },

  // Data completeness summary - Badge/Pill style
  chartDataSummary: {
    marginTop: 12,
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: 1,
  },

  chartDataBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
  },

  chartDataBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },

  chartDataBadgeIcon: {
    marginRight: 6,
  },

  chartDataBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.05,
  },

  chartDataInfoButton: {
    padding: 4,
    opacity: 0.6,
    marginLeft: 4,
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

  dayLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },

  infoButton: {
    marginLeft: 4,
    opacity: 0.6,
  },

  dayValue: {
    fontSize: 17,
    fontWeight: '500',
  },

  dayValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dayScore: {
    fontSize: 14,
    fontWeight: '600',
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
