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
    noDataEmoji: '📝',
  },

  // Dashboard Screen
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Your energy and stress patterns',
    
    // Greetings by time of day
    greetings: {
      morning: [
        "Good morning! Ready to seize the day? ☀️",
        "Rise and shine! Today's full of possibilities ✨",
        "Morning! Time to make today amazing 🌅",
        "Good morning! Your energy awaits 💚",
        "Hello sunshine! Let's track some good vibes 🌞"
      ],
      afternoon: [
        "Good afternoon! How's your energy flowing? 🌤️",
        "Afternoon check-in! You're doing great 💪",
        "Hey there! Midday momentum building 🚀",
        "Good afternoon! Keep that energy going ⚡",
        "Afternoon vibes! Stay strong 🌟"
      ],
      evening: [
        "Good evening! Time to reflect on today 🌅",
        "Evening check! How did today treat you? 🌙",
        "Good evening! Wind down with some insights 🛋️",
        "Evening reflection time! You made it 💭",
        "Good evening! Ready to unwind? 🌆"
      ],
      night: [
        "Still up? Take care of yourself 🌙",
        "Late night energy check! Rest is important 😴",
        "Good night! Sweet dreams ahead 🌟",
        "Evening wind-down time! You've earned it 💤",
        "Night owl! Remember to rest well 🦉"
      ]
    },
    
    // Today's Overview Section
    todayOverview: {
      title: "Today",
      energyLabel: 'Energy Level',
      stressLabel: 'Stress Level',
      motivationText: 'Looking good! Keep it up 💪',
      noDataTitle: 'Ready to track today?',
      noDataSubtitle: 'Start logging your energy and stress levels',
      addEntryButton: 'Add Entry',
      easterEgg: '🎉 You found the magic! ✨',
    },

    // Trends Section
    trends: {
      title: '7-Day Trends',
      detailsButton: 'Details',
      energyLegend: 'Energy',
      stressLegend: 'Stress',
      noDataTitle: 'No trend data yet',
      noDataSubtitle: 'Track for a few days to see patterns',
    },

    // Weekly Insights Section
    weeklyInsights: {
      title: 'Weekly Insights',
      avgEnergyLabel: 'Avg Energy',
      avgStressLabel: 'Avg Stress',
      bestDayLabel: 'Best Day',
      challengingDayLabel: 'Most Challenging',
      peakEnergyLabel: 'Peak Energy',
      noDataTitle: 'No insights yet',
      noDataSubtitle: 'Keep tracking to unlock insights',
    },

    // Today's Overview Section (legacy - keeping for compatibility)
    todayOverview_legacy: {
      title: "Today's Overview",
      energyAverage: 'Energy Average',
      stressAverage: 'Stress Average',
      noDataMessage: 'No data for today. Start tracking your energy and stress levels!',
    },

    // Trends Section (legacy - keeping for compatibility)  
    trends_legacy: {
      energyTitle: 'Energy Trend (7 days)',
      stressTitle: 'Stress Trend (7 days)',
      noEnergyData: 'Start tracking to see your energy trends',
      noStressData: 'Start tracking to see your stress trends',
    },

    // Quick Insights Section
    insights: {
      title: 'Quick Insights',
      noInsights: 'Track more to unlock insights',
      confidenceHigh: 'High confidence',
      confidenceMedium: 'Medium confidence', 
      confidenceLow: 'Low confidence',
    },

    // AI Analytics Section
    ai: {
      title: 'AI Analytics',
      subtitle: 'Advanced pattern recognition',
      enableTitle: 'Enable AI Features',
      enableDescription: 'Unlock AI-powered insights with local analysis',
      modelSize: '~25MB models required',
      privacyNote: 'Your data stays on your device',
      downloadingModels: 'Downloading AI models...',
      analyzingPatterns: 'Analyzing patterns...',
      insightsReady: 'AI insights available',
      noDataYet: 'Need more entries for AI analysis',
      minEntries: 'entries required',
      energyPatterns: '⚡ Energy Patterns',
      stressPatterns: '😰 Stress Patterns',
      recommendations: '💡 AI Recommendations',
      advancedAnalysis: '🔗 Advanced Analysis',
      refreshInsights: 'Refresh Insights',
      confidence: 'confidence',
      highPriority: 'HIGH',
      mediumPriority: 'MEDIUM',
      lowPriority: 'LOW',
      disable: 'Disable AI',
      disableConfirm: 'This will turn off AI features and remove models.',
      disableWarning: 'Are you sure you want to disable AI analytics?',
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

  // Profile Screen
  profile: {
    title: 'Profile',
    subtitle: 'Settings and data management',
    
    // Settings Section
    settingsSection: {
      title: 'Settings',
      notifications: 'Notifications',
      reminders: 'Daily Reminders',
      privacyPolicy: 'Privacy Policy',
    },

    // AI Analytics Section
    aiSection: {
      title: 'AI Analytics',
      description: 'Privacy-first local analysis',
      enableAI: 'Enable AI Features',
      disableAI: 'Disable AI Features',
      modelSize: 'Model Size: ~25MB',
      privacyNote: 'Your data never leaves your device',
      downloadProgress: 'Downloading models...',
      analysisReady: 'AI analysis ready',
    },
    
    // Data Section
    dataSection: {
      title: 'Your Data',
      totalEntries: 'Total Entries',
      firstEntry: 'First Entry',
      lastEntry: 'Latest Entry',
      noData: 'No entries yet',
    },
    
    // Export Section
    exportSection: {
      title: 'Export Data',
      description: 'Download your energy and stress data',
      exportJSON: 'Export as JSON',
      exportCSV: 'Export as CSV',
      exporting: 'Exporting...',
      exportSuccess: 'Export completed',
      exportError: 'Export failed',
      noDataToExport: 'No data to export',
    },
    
    // Import Section
    importSection: {
      title: 'Import Data',
      description: 'Restore data from backup file. Entries with same dates will be overwritten.',
      importFile: 'Choose File to Import',
      importing: 'Importing...',
      importSuccess: (count) => `Successfully imported ${count} entr${count !== 1 ? 'ies' : 'y'}`,
      importError: 'Import failed',
      invalidFile: 'Invalid file format',
      noFileSelected: 'No file selected',
      confirmImport: 'Import Data',
      confirmImportMessage: (count) => `This will add ${count} entr${count !== 1 ? 'ies' : 'y'} to your data. Existing entries for the same dates will be overwritten. Continue?`,
      mergeOption: 'Merge with existing data',
      replaceOption: 'Replace all data',
    },
    
    // App Info Section
    appSection: {
      title: 'About',
      version: 'Version 0.0.1',
      description: 'EnergyTune helps you optimize your energy and stress patterns.',
    },
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
  profile,
} = texts;
