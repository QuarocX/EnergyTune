-- EnergyTune Database Schema
-- Supabase PostgreSQL tables for energy and stress tracking

-- Enable Row Level Security
CREATE SCHEMA IF NOT EXISTS energytune;

-- Users table (extends Supabase auth.users)
CREATE TABLE energytune.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily entries table
CREATE TABLE energytune.daily_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES energytune.profiles(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  
  -- Energy levels (1-10 scale)
  energy_morning INTEGER CHECK (energy_morning >= 1 AND energy_morning <= 10),
  energy_afternoon INTEGER CHECK (energy_afternoon >= 1 AND energy_afternoon <= 10),
  energy_evening INTEGER CHECK (energy_evening >= 1 AND energy_evening <= 10),
  
  -- Stress levels (1-10 scale)
  stress_morning INTEGER CHECK (stress_morning >= 1 AND stress_morning <= 10),
  stress_afternoon INTEGER CHECK (stress_afternoon >= 1 AND stress_afternoon <= 10),
  stress_evening INTEGER CHECK (stress_evening >= 1 AND stress_evening <= 10),
  
  -- Work context
  work_location TEXT CHECK (work_location IN ('home', 'office', 'hybrid', 'off')),
  work_workload TEXT CHECK (work_workload IN ('light', 'normal', 'heavy', 'none')),
  work_meetings INTEGER DEFAULT 0,
  work_deep_hours DECIMAL(3,1) DEFAULT 0,
  work_context_switches INTEGER DEFAULT 0,
  
  -- Life context
  life_sleep_hours DECIMAL(3,1),
  life_sleep_quality INTEGER CHECK (life_sleep_quality >= 1 AND life_sleep_quality <= 5),
  life_exercise_minutes INTEGER DEFAULT 0,
  life_exercise_type TEXT,
  life_social_time INTEGER DEFAULT 0,
  life_screen_time INTEGER DEFAULT 0,
  life_outdoor_time INTEGER DEFAULT 0,
  
  -- Notes and tags
  notes TEXT,
  tags TEXT[], -- Array of custom tags
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure one entry per user per date
  UNIQUE(user_id, entry_date)
);

-- Insights table for storing AI-generated insights
CREATE TABLE energytune.insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES energytune.profiles(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('trend', 'pattern', 'correlation', 'recommendation')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  date_range_start DATE,
  date_range_end DATE,
  metadata JSONB DEFAULT '{}',
  is_dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics summaries table
CREATE TABLE energytune.analytics_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES energytune.profiles(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly', 'quarterly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Aggregated metrics
  avg_energy DECIMAL(4,2),
  avg_stress DECIMAL(4,2),
  energy_variance DECIMAL(4,2),
  stress_variance DECIMAL(4,2),
  
  -- Top patterns
  top_energy_day TEXT,
  top_stress_trigger TEXT,
  best_sleep_correlation DECIMAL(3,2),
  best_exercise_correlation DECIMAL(3,2),
  
  -- Computed at
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, period_type, period_start)
);

-- Indexes for performance
CREATE INDEX idx_daily_entries_user_date ON energytune.daily_entries(user_id, entry_date DESC);
CREATE INDEX idx_daily_entries_date ON energytune.daily_entries(entry_date DESC);
CREATE INDEX idx_insights_user_type ON energytune.insights(user_id, insight_type);
CREATE INDEX idx_analytics_user_period ON energytune.analytics_summaries(user_id, period_type, period_start DESC);

-- Row Level Security policies
ALTER TABLE energytune.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE energytune.daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE energytune.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE energytune.analytics_summaries ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON energytune.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON energytune.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON energytune.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Daily entries policies
CREATE POLICY "Users can view own entries" ON energytune.daily_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" ON energytune.daily_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" ON energytune.daily_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON energytune.daily_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Insights policies
CREATE POLICY "Users can view own insights" ON energytune.insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" ON energytune.insights
  FOR UPDATE USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view own analytics" ON energytune.analytics_summaries
  FOR SELECT USING (auth.uid() = user_id);

-- Functions and triggers
CREATE OR REPLACE FUNCTION energytune.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON energytune.profiles
  FOR EACH ROW EXECUTE FUNCTION energytune.update_updated_at_column();

CREATE TRIGGER update_daily_entries_updated_at
  BEFORE UPDATE ON energytune.daily_entries
  FOR EACH ROW EXECUTE FUNCTION energytune.update_updated_at_column();

-- Function to calculate weekly averages
CREATE OR REPLACE FUNCTION energytune.calculate_weekly_summary(user_uuid UUID, week_start DATE)
RETURNS TABLE (
  avg_energy DECIMAL,
  avg_stress DECIMAL,
  energy_variance DECIMAL,
  stress_variance DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG((COALESCE(energy_morning, 0) + COALESCE(energy_afternoon, 0) + COALESCE(energy_evening, 0)) / 3.0), 2) as avg_energy,
    ROUND(AVG((COALESCE(stress_morning, 0) + COALESCE(stress_afternoon, 0) + COALESCE(stress_evening, 0)) / 3.0), 2) as avg_stress,
    ROUND(VARIANCE((COALESCE(energy_morning, 0) + COALESCE(energy_afternoon, 0) + COALESCE(energy_evening, 0)) / 3.0), 2) as energy_variance,
    ROUND(VARIANCE((COALESCE(stress_morning, 0) + COALESCE(stress_afternoon, 0) + COALESCE(stress_evening, 0)) / 3.0), 2) as stress_variance
  FROM energytune.daily_entries
  WHERE user_id = user_uuid 
    AND entry_date >= week_start 
    AND entry_date < week_start + INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initial data seeding (optional)
-- This would be run after a user signs up
CREATE OR REPLACE FUNCTION energytune.setup_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO energytune.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION energytune.setup_new_user();
