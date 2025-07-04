// EnergyTune - Constants
// Core application constants and configuration

// Energy and Stress Scale Descriptions
export const ENERGY_SCALE = {
  1: { label: 'Exhausted', description: 'Need rest, can\'t focus', emoji: '😴' },
  2: { label: 'Very Low', description: 'Struggling to stay alert', emoji: '😪' },
  3: { label: 'Low', description: 'Basic tasks only, avoid decisions', emoji: '😑' },
  4: { label: 'Below Average', description: 'Sluggish but functional', emoji: '😐' },
  5: { label: 'Moderate', description: 'Normal work pace, routine tasks', emoji: '🙂' },
  6: { label: 'Good', description: 'Steady energy, can focus well', emoji: '😊' },
  7: { label: 'Very Good', description: 'Productive, can handle meetings', emoji: '😄' },
  8: { label: 'High', description: 'Great focus, planning mode', emoji: '😁' },
  9: { label: 'Peak', description: 'Deep work, creative tasks', emoji: '🚀' },
  10: { label: 'Maximum', description: 'Unstoppable, important decisions', emoji: '⚡' },
} as const;

export const STRESS_SCALE = {
  1: { label: 'Calm', description: 'Relaxed, clear thinking', emoji: '😌' },
  2: { label: 'Very Low', description: 'Peaceful and composed', emoji: '😊' },
  3: { label: 'Mild', description: 'Slightly tense but manageable', emoji: '🙂' },
  4: { label: 'Low-Moderate', description: 'Minor pressure, still focused', emoji: '😐' },
  5: { label: 'Moderate', description: 'Noticeable stress, affects focus', emoji: '😬' },
  6: { label: 'Elevated', description: 'Building tension, some worry', emoji: '😟' },
  7: { label: 'High', description: 'Anxious, difficult to concentrate', emoji: '😰' },
  8: { label: 'Very High', description: 'Significant stress, impacts work', emoji: '😨' },
  9: { label: 'Overwhelming', description: 'Can\'t work effectively', emoji: '😱' },
  10: { label: 'Maximum', description: 'Crisis mode, need immediate help', emoji: '🆘' },
} as const;

// Time of Day Options
export const TIME_OF_DAY_OPTIONS = [
  { value: 'morning', label: 'Morning', icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
  { value: 'evening', label: 'Evening', icon: '🌆' },
] as const;

// Work Context Options
export const WORK_LOCATION_OPTIONS = [
  { value: 'home', label: 'Home', icon: '🏠' },
  { value: 'office', label: 'Office', icon: '🏢' },
  { value: 'hybrid', label: 'Hybrid', icon: '🔄' },
  { value: 'off', label: 'Day Off', icon: '🌴' },
] as const;

export const WORKLOAD_OPTIONS = [
  { value: 'light', label: 'Light', description: 'Easy day, minimal tasks' },
  { value: 'normal', label: 'Normal', description: 'Regular workload' },
  { value: 'heavy', label: 'Heavy', description: 'Intense, demanding day' },
  { value: 'none', label: 'None', description: 'No work today' },
] as const;

// Life Context Options
export const SLEEP_QUALITY_OPTIONS = [
  { value: 'poor', label: 'Poor', description: 'Restless, tired', emoji: '😴' },
  { value: 'fair', label: 'Fair', description: 'Some interruptions', emoji: '😐' },
  { value: 'good', label: 'Good', description: 'Refreshing sleep', emoji: '😊' },
  { value: 'excellent', label: 'Excellent', description: 'Perfect rest', emoji: '😄' },
] as const;

export const PHYSICAL_ACTIVITY_OPTIONS = [
  { value: 'none', label: 'None', description: 'Sedentary day', emoji: '🛋️' },
  { value: 'light', label: 'Light', description: 'Walking, stretching', emoji: '🚶‍♂️' },
  { value: 'moderate', label: 'Moderate', description: 'Regular exercise', emoji: '🏃‍♂️' },
  { value: 'intense', label: 'Intense', description: 'Vigorous workout', emoji: '💪' },
] as const;

// Common Energy Sources (for suggestions)
export const COMMON_ENERGY_SOURCES = [
  'Good night\'s sleep',
  'Morning coffee',
  'Exercise/workout',
  'Healthy meal',
  'Team collaboration',
  'Deep work session',
  'Progress on project',
  'Quality time with family',
  'Fresh air/nature',
  'Meditation/mindfulness',
  'Learning something new',
  'Music',
  'Sunshine',
  'Accomplishing goals',
  'Social connection',
] as const;

// Common Stress Sources (for suggestions)
export const COMMON_STRESS_SOURCES = [
  'Deadline pressure',
  'Technical issues',
  'Meeting overload',
  'Context switching',
  'Email backlog',
  'Unclear requirements',
  'Interruptions',
  'Poor sleep',
  'Financial concerns',
  'Relationship conflicts',
  'Health worries',
  'Household management',
  'Childcare demands',
  'Traffic/commute',
  'Social obligations',
] as const;

// Chart Configuration
export const CHART_COLORS = {
  energy: '#007AFF',
  stress: '#FF9500',
  energyGradient: ['#007AFF', '#5AC8FA'],
  stressGradient: ['#FF9500', '#FFCC02'],
} as const;

// Date Formats
export const DATE_FORMATS = {
  display: 'MMM d, yyyy',
  api: 'yyyy-MM-dd',
  full: 'EEEE, MMMM d, yyyy',
  short: 'MMM d',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  entries: 'energytune_entries',
  lastSync: 'energytune_last_sync',
  userId: 'energytune_user_id',
  preferences: 'energytune_preferences',
  onboarding: 'energytune_onboarding_completed',
} as const;

// API Configuration
export const API_CONFIG = {
  timeout: 10000, // 10 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

// Performance Targets (as per PRD)
export const PERFORMANCE_TARGETS = {
  responseTime: 200, // milliseconds
  animationDuration: 300, // milliseconds
  debounceDelay: 300, // milliseconds
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  energyRange: { min: 1, max: 10 },
  stressRange: { min: 1, max: 10 },
  maxSourceLength: 500,
  maxNotesLength: 1000,
  maxMeetings: 20,
  maxDeepWorkHours: 16,
  maxContextSwitches: 50,
} as const;

export default {
  ENERGY_SCALE,
  STRESS_SCALE,
  TIME_OF_DAY_OPTIONS,
  WORK_LOCATION_OPTIONS,
  WORKLOAD_OPTIONS,
  SLEEP_QUALITY_OPTIONS,
  PHYSICAL_ACTIVITY_OPTIONS,
  COMMON_ENERGY_SOURCES,
  COMMON_STRESS_SOURCES,
  CHART_COLORS,
  DATE_FORMATS,
  STORAGE_KEYS,
  API_CONFIG,
  PERFORMANCE_TARGETS,
  VALIDATION_RULES,
};
