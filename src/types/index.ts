// EnergyTune - TypeScript Interfaces and Data Models
// Professional-grade type definitions for energy and stress tracking

export interface User {
  id: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface EnergyLevel {
  morning?: number;
  afternoon?: number;
  evening?: number;
}

export interface StressLevel {
  morning?: number;
  afternoon?: number;
  evening?: number;
}

export interface WorkContext {
  location?: 'home' | 'office' | 'hybrid' | 'off';
  workload?: 'light' | 'normal' | 'heavy' | 'none';
  meetings?: number;
  deepWorkHours?: number;
  contextSwitches?: number;
}

export interface LifeContext {
  sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  physicalActivity?: 'none' | 'light' | 'moderate' | 'intense';
  socialInteractions?: 'none' | 'few' | 'normal' | 'many';
  nutrition?: 'poor' | 'fair' | 'good' | 'excellent';
  personalResponsibilities?: 'light' | 'normal' | 'heavy';
  familyTime?: 'none' | 'brief' | 'quality' | 'extensive';
}

export interface DailyEntry {
  id?: string;
  user_id: string;
  date: string; // YYYY-MM-DD format
  energyLevels: EnergyLevel;
  stressLevels: StressLevel;
  energySources: {
    day: string;
  };
  stressSources: {
    day: string;
  };
  workContext?: WorkContext;
  lifeContext?: LifeContext;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TrendData {
  date: string;
  energy: number;
  stress: number;
  energyMorning?: number;
  energyAfternoon?: number;
  energyEvening?: number;
  stressMorning?: number;
  stressAfternoon?: number;
  stressEvening?: number;
}

export interface EnergyInsight {
  type: 'pattern' | 'peak' | 'dip' | 'trigger' | 'recommendation';
  title: string;
  description: string;
  confidence: number; // 0-1
  actionable: boolean;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface NavigationState {
  index: number;
  routes: Array<{
    key: string;
    name: string;
    params?: Record<string, any>;
  }>;
}

// Component Props Types
export interface RatingSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  label: string;
  type: 'energy' | 'stress';
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  disabled?: boolean;
}

export interface TrendChartProps {
  data: TrendData[];
  metric: 'energy' | 'stress' | 'both';
  timeRange: '7d' | '30d' | '90d';
  height?: number;
  showLabels?: boolean;
}

export interface EntryFormProps {
  initialData?: Partial<DailyEntry>;
  onSubmit: (entry: DailyEntry) => Promise<void>;
  isLoading?: boolean;
  date?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
}

// Storage Types
export interface LocalStorageData {
  entries: DailyEntry[];
  lastSync: string;
  userId?: string;
}

// Theme and Style Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  energy: string;
  stress: string;
  success: string;
  warning: string;
  error: string;
  border: string;
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface Typography {
  h1: {
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
  };
  h2: {
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
  };
  body: {
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
  };
  caption: {
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
  };
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Export all types for easy importing
export type EnergyRatingValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type StressRatingValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';
export type MetricType = 'energy' | 'stress';
export type TimeRange = '7d' | '30d' | '90d';
