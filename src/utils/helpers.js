// Helper functions
import { Animated, Easing } from 'react-native';
import { dateDisplay } from '../config/texts';

/** Until this local hour, the default entry day is still yesterday. */
export const ENTRY_DAY_ROLLOVER_HOUR = 3;

export const formatDate = (date) => {
  // Use local timezone, not UTC, to avoid timezone bugs
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Parse YYYY-MM-DD as a local calendar date (never UTC midnight). */
export const parseLocalDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
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

/** True from midnight until the entry-day rollover hour (local). */
export const isEntryGracePeriod = (date = new Date()) => {
  return date.getHours() < ENTRY_DAY_ROLLOVER_HOUR;
};

/**
 * Default day for energy/stress entry.
 * Before rollover hour, still yesterday; from rollover onward, calendar today.
 */
export const getEntryDayString = (date = new Date()) => {
  if (isEntryGracePeriod(date)) {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDate(yesterday);
  }
  return getTodayString(date);
};

export const formatDisplayDate = (dateString) => {
  const date = parseLocalDate(dateString);
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
  const date = parseLocalDate(dateString);
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
