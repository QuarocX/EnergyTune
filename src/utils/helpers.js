// Helper functions
import { Animated, Easing } from 'react-native';
import { dateDisplay } from '../config/texts';

export const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

export const getTodayString = () => {
  return formatDate(new Date());
};

export const getYesterdayString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
};

export const getDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDate(date);
};

export const formatDisplayDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (formatDate(date) === formatDate(today)) {
    return dateDisplay.today(date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }));
  } else if (formatDate(date) === formatDate(yesterday)) {
    return dateDisplay.yesterday;
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

export const calculateAverage = (values) => {
  if (!values || values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

export const hapticFeedback = async (intensity = 'Light') => {
  try {
    const { Haptics } = await import('expo-haptics');
    const feedbackType = {
      'Light': Haptics.ImpactFeedbackStyle.Light,
      'Medium': Haptics.ImpactFeedbackStyle.Medium,
      'Heavy': Haptics.ImpactFeedbackStyle.Heavy,
    };
    await Haptics.impactAsync(feedbackType[intensity] || feedbackType.Light);
  } catch (error) {
    // Haptics not available (web), silently fail
  }
};

export const successHaptic = () => {
  // Non-blocking haptic feedback
  import('expo-haptics').then(({ Haptics }) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }).catch(() => {
    // Haptics not available (web), silently fail
  });
};

export const showSuccessToast = (setShowToast, toastOpacity, toastTranslateY, onComplete) => {
  setShowToast(true);
  
  // Animate toast in
  Animated.parallel([
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(toastTranslateY, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
  ]).start();
  
  // Auto hide toast after delay
  setTimeout(() => {
    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowToast(false);
      if (onComplete) onComplete();
    });
  }, 1500);
};
