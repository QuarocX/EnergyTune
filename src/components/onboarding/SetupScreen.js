import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Platform, Alert, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme } from '../../config/theme';
import { onboarding } from '../../config/onboardingTexts';
import { PeriodTimeSetting } from '../ui/PeriodTimeSetting';
import { hapticFeedback } from '../../utils/helpers';
import StorageService from '../../services/storage';
import NotificationService from '../../services/notificationService';

const { width, height } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

export const SetupScreen = ({ onComplete }) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  const [notifSettings, setNotifSettings] = useState({
    enabled: false,
    periods: {
      morning: { enabled: true, time: '10:00' },
      afternoon: { enabled: true, time: '15:00' },
      evening: { enabled: true, time: '20:00' },
    },
    quickFillEnabled: true,
  });

  const [weeklySummarySettings, setWeeklySummarySettings] = useState({
    enabled: false,
    day: 0, // 0 = Sunday
    time: '18:00',
  });

  const [permissionStatus, setPermissionStatus] = useState('undetermined');
  const [isRevealing, setIsRevealing] = useState(false);
  
  const revealAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  
  // Wave animations for reveal
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;
  const wave3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const notif = await StorageService.getNotificationSettings();
      const weekly = await StorageService.getWeeklySummarySettings();
      const status = await NotificationService.getPermissionStatus();
      
      setNotifSettings(notif);
      setWeeklySummarySettings(weekly);
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleNotifToggle = async (value) => {
    try {
      if (value) {
        const granted = await NotificationService.requestPermissions();
        if (!granted) {
          Alert.alert(
            'Permissions Required',
            'Please enable notifications in your device settings to use this feature.'
          );
          return;
        }
        setPermissionStatus('granted');
      }

      const updatedSettings = { ...notifSettings, enabled: value };
      setNotifSettings(updatedSettings);
      await StorageService.saveNotificationSettings(updatedSettings);

      if (value) {
        await NotificationService.scheduleAllReminders(updatedSettings);
      } else {
        await NotificationService.cancelAllNotifications();
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  const handlePeriodToggle = async (period, value) => {
    try {
      const updatedSettings = {
        ...notifSettings,
        periods: {
          ...notifSettings.periods,
          [period]: {
            ...notifSettings.periods[period],
            enabled: value,
          },
        },
      };
      setNotifSettings(updatedSettings);
      await StorageService.saveNotificationSettings(updatedSettings);

      if (notifSettings.enabled) {
        await NotificationService.scheduleAllReminders(updatedSettings);
      }
    } catch (error) {
      console.error('Error updating period setting:', error);
    }
  };

  const handleTimeChange = async (period, time) => {
    try {
      const updatedSettings = {
        ...notifSettings,
        periods: {
          ...notifSettings.periods,
          [period]: {
            ...notifSettings.periods[period],
            time: time,
          },
        },
      };
      setNotifSettings(updatedSettings);
      await StorageService.saveNotificationSettings(updatedSettings);

      if (notifSettings.enabled) {
        await NotificationService.scheduleAllReminders(updatedSettings);
      }
    } catch (error) {
      console.error('Error updating time:', error);
    }
  };

  const handleWeeklySummaryToggle = async (value) => {
    try {
      if (value) {
        const hasPermission = await NotificationService.requestPermissions();
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive weekly summaries.'
          );
          return;
        }
        setPermissionStatus('granted');
      }

      const updatedSettings = { ...weeklySummarySettings, enabled: value };
      setWeeklySummarySettings(updatedSettings);
      await StorageService.saveWeeklySummarySettings(updatedSettings);

      if (value) {
        await NotificationService.scheduleWeeklySummaryNotification(updatedSettings);
      } else {
        await NotificationService.cancelWeeklySummaryNotification();
      }
    } catch (error) {
      console.error('Error toggling weekly summary:', error);
    }
  };

  const handleWeeklySummaryDayChange = async (day) => {
    try {
      const updatedSettings = { ...weeklySummarySettings, day };
      setWeeklySummarySettings(updatedSettings);
      await StorageService.saveWeeklySummarySettings(updatedSettings);

      if (weeklySummarySettings.enabled) {
        await NotificationService.scheduleWeeklySummaryNotification(updatedSettings);
      }
    } catch (error) {
      console.error('Error updating weekly summary day:', error);
    }
  };

  const handleWeeklySummaryTimeChange = async (time) => {
    try {
      const updatedSettings = { ...weeklySummarySettings, time };
      setWeeklySummarySettings(updatedSettings);
      await StorageService.saveWeeklySummarySettings(updatedSettings);

      if (weeklySummarySettings.enabled) {
        await NotificationService.scheduleWeeklySummaryNotification(updatedSettings);
      }
    } catch (error) {
      console.error('Error updating weekly summary time:', error);
    }
  };

  const handleGetStarted = async () => {
    await hapticFeedback();
    setIsRevealing(true);

    // Start wave animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(wave1Anim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(wave1Anim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(wave2Anim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(wave2Anim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(wave3Anim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(wave3Anim, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start reveal animation sequence
    Animated.sequence([
      // Scale up button slightly
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Reveal overlay with waves
      Animated.parallel([
        Animated.timing(revealAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Show checkmark
      Animated.parallel([
        Animated.spring(checkmarkScale, {
          toValue: 1,
          tension: 30,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(checkmarkOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // Hold checkmark visible
      Animated.delay(800),
    ]).start(() => {
      onComplete();
    });
  };

  const days = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
  };

  const overlayOpacity = revealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const overlayScale = revealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  // Wave translations (subtle movement)
  const wave1Translate = wave1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3],
  });

  const wave2Translate = wave2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  const wave3Translate = wave3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.secondaryBackground }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.label }]}>
            {onboarding.setup.title}
          </Text>
          <Text style={[styles.description, { color: theme.colors.secondaryLabel }]}>
            {onboarding.setup.description}
          </Text>
        </View>

        {/* Sections Container */}
        <View style={styles.sectionsContainer}>
          {/* Daily Reminders Section */}
          <View style={[styles.section, { backgroundColor: theme.colors.primaryBackground }]}>
            <View style={[styles.settingRow, { borderBottomColor: 'transparent' }]}>
              <Text style={[styles.settingLabel, { color: theme.colors.label }]}>
                {onboarding.setup.dailyReminders.title}
              </Text>
              <Switch
                value={notifSettings.enabled}
                onValueChange={handleNotifToggle}
                trackColor={{ 
                  false: theme.colors.systemGray4, 
                  true: Platform.OS === 'ios' ? undefined : '#34C759'
                }}
                thumbColor={Platform.OS === 'ios' ? undefined : (notifSettings.enabled ? '#FFFFFF' : theme.colors.systemGray3)}
              />
            </View>

            {notifSettings.enabled && (
              <View style={styles.compactTimePickers}>
                <PeriodTimeSetting
                  label="Morning"
                  enabled={notifSettings.periods.morning.enabled}
                  time={notifSettings.periods.morning.time}
                  onToggle={(val) => handlePeriodToggle('morning', val)}
                  onTimeChange={(time) => handleTimeChange('morning', time)}
                  theme={theme}
                />
                <PeriodTimeSetting
                  label="Afternoon"
                  enabled={notifSettings.periods.afternoon.enabled}
                  time={notifSettings.periods.afternoon.time}
                  onToggle={(val) => handlePeriodToggle('afternoon', val)}
                  onTimeChange={(time) => handleTimeChange('afternoon', time)}
                  theme={theme}
                />
                <PeriodTimeSetting
                  label="Evening"
                  enabled={notifSettings.periods.evening.enabled}
                  time={notifSettings.periods.evening.time}
                  onToggle={(val) => handlePeriodToggle('evening', val)}
                  onTimeChange={(time) => handleTimeChange('evening', time)}
                  theme={theme}
                />
              </View>
            )}
          </View>

          {/* Weekly Summary Section */}
          <View style={[styles.section, { backgroundColor: theme.colors.primaryBackground }]}>
            <View style={[styles.settingRow, { borderBottomColor: 'transparent' }]}>
              <Text style={[styles.settingLabel, { color: theme.colors.label }]}>
                {onboarding.setup.weeklySummary.title}
              </Text>
              <Switch
                value={weeklySummarySettings.enabled}
                onValueChange={handleWeeklySummaryToggle}
                trackColor={{ 
                  false: theme.colors.systemGray4, 
                  true: Platform.OS === 'ios' ? undefined : '#34C759'
                }}
                thumbColor={Platform.OS === 'ios' ? undefined : (weeklySummarySettings.enabled ? '#FFFFFF' : theme.colors.systemGray3)}
              />
            </View>

            {weeklySummarySettings.enabled && (
              <View style={styles.compactTimePickers}>
                <View style={[styles.settingRow, { borderBottomColor: theme.colors.separator }]}>
                  <Text style={[styles.settingLabel, { color: theme.colors.label }]}>
                    Day
                  </Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => {
                      Alert.alert(
                        'Select Day',
                        'Choose which day to receive your weekly summary',
                        Object.keys(days).map(dayNum => ({
                          text: days[dayNum],
                          onPress: () => handleWeeklySummaryDayChange(parseInt(dayNum)),
                          style: parseInt(dayNum) === weeklySummarySettings.day ? 'destructive' : 'default',
                        })).concat([{ text: 'Cancel', style: 'cancel' }])
                      );
                    }}
                  >
                    <Text style={[styles.pickerButtonText, { color: theme.colors.systemBlue }]}>
                      {days[weeklySummarySettings.day]}
                    </Text>
                  </TouchableOpacity>
                </View>

                <PeriodTimeSetting
                  label="Time"
                  enabled={true}
                  time={weeklySummarySettings.time}
                  onToggle={() => {}}
                  onTimeChange={handleWeeklySummaryTimeChange}
                  theme={theme}
                  hideToggle={true}
                />
              </View>
            )}
          </View>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.getStartedButton, { backgroundColor: theme.colors.systemBlue }]}
              onPress={handleGetStarted}
              activeOpacity={0.8}
              disabled={isRevealing}
            >
              <Text style={styles.getStartedButtonText}>
                {onboarding.setup.getStartedButton}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* Reveal Animation Overlay with Blue Waves */}
      {isRevealing && (
        <Animated.View
          style={[
            styles.revealOverlay,
            {
              opacity: overlayOpacity,
              backgroundColor: theme.colors.systemBlue,
            },
          ]}
        >
          {/* Animated Waves Background */}
          <Animated.View style={styles.wavesContainer}>
            <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
              <Defs>
                {/* Blue gradient */}
                <LinearGradient id="revealBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#0A84FF" stopOpacity="0.5" />
                  <Stop offset="100%" stopColor="#0A84FF" stopOpacity="0.25" />
                </LinearGradient>
                
                {/* Light blue gradient */}
                <LinearGradient id="revealLightBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#0A84FF" stopOpacity="0.35" />
                  <Stop offset="100%" stopColor="#0A84FF" stopOpacity="0.18" />
                </LinearGradient>
                
                {/* Darker blue gradient */}
                <LinearGradient id="revealDarkerBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#0A84FF" stopOpacity="0.25" />
                  <Stop offset="100%" stopColor="#0A84FF" stopOpacity="0.12" />
                </LinearGradient>
              </Defs>

              {/* Wave 1 - Blue */}
              <AnimatedPath
                d={`M 0 ${height * 0.3} Q ${width * 0.25} ${height * 0.25} ${width * 0.5} ${height * 0.3} T ${width} ${height * 0.3} L ${width} ${height} L 0 ${height} Z`}
                fill="url(#revealBlueGradient)"
                style={{
                  transform: [{ translateY: wave1Translate }],
                }}
              />

              {/* Wave 2 - Light Blue */}
              <AnimatedPath
                d={`M 0 ${height * 0.5} Q ${width * 0.25} ${height * 0.45} ${width * 0.5} ${height * 0.5} T ${width} ${height * 0.5} L ${width} ${height} L 0 ${height} Z`}
                fill="url(#revealLightBlueGradient)"
                style={{
                  transform: [{ translateY: wave2Translate }],
                }}
              />

              {/* Wave 3 - Darker Blue */}
              <AnimatedPath
                d={`M 0 ${height * 0.7} Q ${width * 0.25} ${height * 0.65} ${width * 0.5} ${height * 0.7} T ${width} ${height * 0.7} L ${width} ${height} L 0 ${height} Z`}
                fill="url(#revealDarkerBlueGradient)"
                style={{
                  transform: [{ translateY: wave3Translate }],
                }}
              />
            </Svg>
          </Animated.View>

          {/* Content */}
          <Animated.View
            style={[
              styles.revealContent,
              {
                transform: [{ scale: overlayScale }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.checkmarkContainer,
                {
                  transform: [{ scale: checkmarkScale }],
                  opacity: checkmarkOpacity,
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={80} color="#FFFFFF" />
            </Animated.View>
            <Animated.Text
              style={[
                styles.revealText,
                {
                  color: '#FFFFFF',
                  opacity: checkmarkOpacity,
                },
              ]}
            >
              You're all set!
            </Animated.Text>
            <Animated.Text
              style={[
                styles.revealSubtext,
                {
                  color: '#FFFFFF',
                  opacity: checkmarkOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.9],
                  }),
                },
              ]}
            >
              Welcome to EnergyTune
            </Animated.Text>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
    textAlign: 'center',
  },
  sectionsContainer: {
    gap: 12,
  },
  section: {
    borderRadius: 12,
    padding: 16,
  },
  compactTimePickers: {
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
  },
  pickerButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  pickerButtonText: {
    fontSize: 17,
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
  getStartedButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    marginBottom: 12,
  },
  getStartedButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  revealOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  wavesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  revealContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkContainer: {
    marginBottom: 24,
  },
  revealText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  revealSubtext: {
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
  },
});

