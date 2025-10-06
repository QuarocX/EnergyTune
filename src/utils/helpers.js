// Helper functions
import { Animated, Easing } from 'react-native';
import { dateDisplay } from '../config/texts';

export const formatDate = (date) => {
  // Use local timezone, not UTC, to avoid timezone bugs
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayString = (date = new Date()) => {
  return formatDate(date);
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
    return dateDisplay.today(date.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'short' 
    }));
  } else if (formatDate(date) === formatDate(yesterday)) {
    return dateDisplay.yesterday;
  } else {
    return date.toLocaleDateString('en-GB', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short' 
    });
  }
};

export const formatDisplayDateWithYear = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (formatDate(date) === formatDate(today)) {
    return dateDisplay.today(date.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }));
  } else if (formatDate(date) === formatDate(yesterday)) {
    return dateDisplay.yesterday;
  } else {
    return date.toLocaleDateString('en-GB', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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
