// Helper functions
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
    return `Today, ${date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })}`;
  } else if (formatDate(date) === formatDate(yesterday)) {
    return 'Yesterday';
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

export const successHaptic = async () => {
  try {
    const { Haptics } = await import('expo-haptics');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    // Haptics not available (web), silently fail
  }
};
