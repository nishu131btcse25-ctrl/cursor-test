-- NuExis Digital Signage System Database Schema
-- This file contains the complete database schema for the application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create screens table
CREATE TABLE IF NOT EXISTS screens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  screen_id text UNIQUE NOT NULL,
  description text,
  location text,
  is_online boolean DEFAULT false,
  last_seen timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create screen_sessions table for tracking device connections
CREATE TABLE IF NOT EXISTS screen_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id uuid NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  session_token text NOT NULL,
  is_active boolean DEFAULT true,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for screens
CREATE POLICY "Users can view own screens" ON screens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own screens" ON screens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own screens" ON screens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own screens" ON screens
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for screen_sessions
CREATE POLICY "Users can view own screen sessions" ON screen_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM screens 
      WHERE screens.id = screen_sessions.screen_id 
      AND screens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own screen sessions" ON screen_sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM screens 
      WHERE screens.id = screen_sessions.screen_id 
      AND screens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own screen sessions" ON screen_sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM screens 
      WHERE screens.id = screen_sessions.screen_id 
      AND screens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own screen sessions" ON screen_sessions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM screens 
      WHERE screens.id = screen_sessions.screen_id 
      AND screens.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_screens_user_id ON screens(user_id);
CREATE INDEX IF NOT EXISTS idx_screens_screen_id ON screens(screen_id);
CREATE INDEX IF NOT EXISTS idx_screens_is_online ON screens(is_online);
CREATE INDEX IF NOT EXISTS idx_screens_last_seen ON screens(last_seen);
CREATE INDEX IF NOT EXISTS idx_screen_sessions_screen_id ON screen_sessions(screen_id);
CREATE INDEX IF NOT EXISTS idx_screen_sessions_is_active ON screen_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_screen_sessions_expires_at ON screen_sessions(expires_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_screens_updated_at 
  BEFORE UPDATE ON screens 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate unique screen IDs
CREATE OR REPLACE FUNCTION generate_screen_id()
RETURNS text AS $$
DECLARE
    chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result text := '';
    i integer;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    UPDATE screen_sessions 
    SET is_active = false 
    WHERE expires_at < now() AND is_active = true;
    
    DELETE FROM screen_sessions 
    WHERE expires_at < (now() - interval '30 days');
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired sessions (if pg_cron is available)
-- SELECT cron.schedule('cleanup-expired-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');