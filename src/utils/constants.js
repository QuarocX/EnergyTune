// Constants for the app
export const ENERGY_LEVELS = {
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
};

export const STRESS_LEVELS = {
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
};

export const TIME_PERIODS = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
};

export const COMMON_ENERGY_SOURCES = [
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
];

export const COMMON_STRESS_SOURCES = [
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
];
