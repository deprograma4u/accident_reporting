/*
  # GPS-Enabled Accident Reporting System - Database Schema

  ## Overview
  Complete database schema for accident detection and emergency alert system.

  ## New Tables
  
  ### 1. `profiles`
  User profile information linked to auth.users
  - `id` (uuid, primary key, references auth.users)
  - `phone_number` (text, required)
  - `full_name` (text, required)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `emergency_contacts`
  Multiple emergency contacts per user
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `contact_name` (text, required)
  - `contact_phone` (text, required)
  - `relationship` (text, optional)
  - `created_at` (timestamptz)

  ### 3. `accident_reports`
  Log of all accident detections and reports
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `latitude` (decimal, required)
  - `longitude` (decimal, required)
  - `detection_type` (text: 'auto' or 'manual')
  - `status` (text: 'pending', 'sent', 'failed')
  - `accelerometer_data` (jsonb, optional)
  - `timestamp` (timestamptz)
  - `sent_at` (timestamptz, nullable)
  - `error_message` (text, nullable)

  ### 4. `user_settings`
  User preferences and configuration
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles, unique)
  - `detection_enabled` (boolean, default true)
  - `sensitivity_level` (integer, 1-5, default 3)
  - `sms_fallback_enabled` (boolean, default true)
  - `auto_send_timeout` (integer, seconds, default 10)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Authenticated users required for all operations
*/

-- Create profiles table
DROP TABLE IF EXISTS profiles;
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create emergency_contacts table
DROP TABLE IF EXISTS emergency_contacts;
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  relationship text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts"
  ON emergency_contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
  ON emergency_contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON emergency_contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON emergency_contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create accident_reports table
DROP TABLE IF EXISTS accident_reports;
CREATE TABLE IF NOT EXISTS accident_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  detection_type text NOT NULL CHECK (detection_type IN ('auto', 'manual')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  accelerometer_data jsonb,
  timestamp timestamptz DEFAULT now(),
  sent_at timestamptz,
  error_message text
);

ALTER TABLE accident_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON accident_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON accident_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON accident_reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user_settings table
DROP TABLE IF EXISTS user_settings;
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  detection_enabled boolean DEFAULT true,
  sensitivity_level integer DEFAULT 3 CHECK (sensitivity_level BETWEEN 1 AND 5),
  sms_fallback_enabled boolean DEFAULT true,
  auto_send_timeout integer DEFAULT 10,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_accident_reports_user_id ON accident_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_accident_reports_timestamp ON accident_reports(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();