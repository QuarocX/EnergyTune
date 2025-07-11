// Text configuration for EnergyTune app
// This file centralizes all user-facing text strings for easy modification and potential localization

export const texts = {
  // App Navigation & Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    back: '‹ Back',
    continue: 'Continue ›',
    complete: 'Complete',
    saved: '✓ Saved',
    cancel: 'Cancel',
    confirm: 'Confirm',
    today: 'Today',
    yesterday: 'Yesterday',
    reset: '↻',
    noData: 'No data',
  },

  // Dashboard Screen
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Your energy and stress patterns',
    
    // Today's Overview Section
    todayOverview: {
      title: "Today's Overview",
      energyAverage: 'Energy Average',
      stressAverage: 'Stress Average',
      noDataMessage: 'No data for today. Start tracking your energy and stress levels!',
    },

    // Trends Section
    trends: {
      energyTitle: 'Energy Trend (7 days)',
      stressTitle: 'Stress Trend (7 days)',
      noEnergyData: 'Start tracking to see your energy trends',
      noStressData: 'Start tracking to see your stress trends',
    },

    // Quick Insights Section
    insights: {
      title: 'Quick Insights',
      trackingDays: (count) => `📈 You've been tracking for ${count} day${count !== 1 ? 's' : ''}`,
      encouragement: '🎯 Keep it up! Consistent tracking reveals valuable patterns',
    },
  },

  // Entry Screen
  entry: {
    // Time Period Labels
    periods: {
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
      sources: 'Sources',
    },

    // Energy Section
    energy: {
      title: (period) => `${period} Energy Level`,
      subtitle: 'How energized do you feel?',
    },

    // Stress Section
    stress: {
      title: (period) => `${period} Stress Level`,
      subtitle: 'How stressed do you feel?',
    },

    // Sources Section
    sources: {
      energyTitle: 'Energy Sources',
      energySubtitle: 'What gave you energy today?',
      energyPlaceholder: 'e.g., Good sleep, exercise, coffee, completing a project...',
      
      stressTitle: 'Stress Sources',
      stressSubtitle: 'What caused stress today?',
      stressPlaceholder: 'e.g., Deadlines, meetings, technical issues, interruptions...',
    },

    // Alerts & Messages
    alerts: {
      saveEnergyError: 'Failed to save energy level',
      saveStressError: 'Failed to save stress level',
      saveEnergySourcesError: 'Failed to save energy sources',
      saveStressSourcesError: 'Failed to save stress sources',
      loadError: 'Failed to load entry data',
      resetConfirmTitle: 'Reset Day Data',
      resetConfirmMessage: 'This will clear all data for this day. Are you sure?',
      resetError: 'Failed to reset day data',
    },

    // Navigation
    navigation: {
      backButton: '‹ Back',
      continueButton: 'Continue ›',
      completeButton: 'Complete',
    },
  },

  // Rating Scale Component
  ratingScale: {
    feedback: 'Saved!',
  },

  // Input Component
  input: {
    savedIndicator: '✓ Saved',
  },

  // Date Picker Component
  datePicker: {
    selectDate: 'Select Date',
    shortcuts: {
      today: 'Today',
      yesterday: 'Yesterday',
    },
  },

  // Energy & Stress Level Descriptions
  levels: {
    energy: {
      1: { label: 'Exhausted', description: 'Need rest, can\'t focus', emoji: '😴' },
      2: { label: 'Very Low', description: 'Need rest, can\'t focus', emoji: '😪' },
      3: { label: 'Low', description: 'Basic tasks only, avoid important decisions', emoji: '😮‍💨' },
      4: { label: 'Below Average', description: 'Basic tasks only, avoid important decisions', emoji: '😑' },
      5: { label: 'Moderate', description: 'Normal work pace, routine tasks', emoji: '😐' },
      6: { label: 'Above Average', description: 'Normal work pace, routine tasks', emoji: '🙂' },
      7: { label: 'Good', description: 'Productive, can handle meetings and planning', emoji: '😊' },
      8: { label: 'Very Good', description: 'Productive, can handle meetings and planning', emoji: '😄' },
      9: { label: 'Peak', description: 'Deep work, creative tasks, important decisions', emoji: '🚀' },
      10: { label: 'Maximum', description: 'Deep work, creative tasks, important decisions', emoji: '⚡' },
    },
    
    stress: {
      1: { label: 'Calm', description: 'Relaxed, clear thinking', emoji: '😌' },
      2: { label: 'Very Calm', description: 'Relaxed, clear thinking', emoji: '🧘‍♀️' },
      3: { label: 'Mild', description: 'Slightly tense but manageable', emoji: '😕' },
      4: { label: 'Slightly High', description: 'Slightly tense but manageable', emoji: '😟' },
      5: { label: 'Moderate', description: 'Noticeable stress, affects focus', emoji: '😰' },
      6: { label: 'Above Average', description: 'Noticeable stress, affects focus', emoji: '😨' },
      7: { label: 'High', description: 'Anxious, difficult to concentrate', emoji: '😱' },
      8: { label: 'Very High', description: 'Anxious, difficult to concentrate', emoji: '🤯' },
      9: { label: 'Overwhelming', description: 'Can\'t work effectively', emoji: '😵' },
      10: { label: 'Maximum', description: 'Can\'t work effectively', emoji: '🆘' },
    },
  },

  // Common Energy & Stress Sources
  commonSources: {
    energy: [
      'Good sleep',
      'Exercise',
      'Healthy food',
      'Coffee/Tea',
      'Deep work',
      'Team collaboration',
      'Learning something new',
      'Completing tasks',
      'Quality time with loved ones',
      'Nature/Fresh air',
      'Music',
      'Meditation',
      'Accomplishment',
      'Social interaction',
      'Creative work',
    ],
    
    stress: [
      'Deadline pressure',
      'Technical issues',
      'Context switching',
      'Meetings',
      'Interruptions',
      'Unclear expectations',
      'Workload',
      'Relationship conflicts',
      'Financial concerns',
      'Health worries',
      'Household management',
      'Social obligations',
      'Traffic/Commute',
      'Technology problems',
      'Time pressure',
    ],
  },

  // Chart & Data Display
  chart: {
    noDataLabel: 'No data',
    dayLabels: {
      shortWeekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
  },

  // Date Display Helpers
  dateDisplay: {
    today: (dateStr) => `Today, ${dateStr}`,
    yesterday: 'Yesterday',
  },
};

// Helper function to get text by path (e.g., 'dashboard.title')
export const getText = (path, ...args) => {
  const keys = path.split('.');
  let value = texts;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      console.warn(`Text not found for path: ${path}`);
      return path; // Return the path as fallback
    }
  }
  
  // If value is a function, call it with provided arguments
  if (typeof value === 'function') {
    return value(...args);
  }
  
  return value;
};

// Export individual sections for easier imports
export const {
  common,
  dashboard,
  entry,
  ratingScale,
  input,
  datePicker,
  levels,
  commonSources,
  chart,
  dateDisplay,
} = texts;
