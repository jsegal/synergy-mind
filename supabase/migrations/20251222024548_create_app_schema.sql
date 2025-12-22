/*
  # Create SynergyMind Application Schema

  ## Overview
  This migration creates the core database schema for the SynergyMind AI Consultant application.

  ## New Tables

  ### 1. profiles
  Stores extended user profile information
  - `id` (uuid, primary key) - References auth.users.id
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `subscription_tier` (text) - Subscription level: 'free', 'premium', 'enterprise'
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. conversations
  Stores conversation threads between users and AI
  - `id` (uuid, primary key) - Unique conversation identifier
  - `user_id` (uuid) - References profiles.id
  - `title` (text) - Conversation title
  - `context` (text) - Business context provided by user
  - `created_at` (timestamptz) - Conversation start timestamp
  - `updated_at` (timestamptz) - Last message timestamp

  ### 3. messages
  Stores individual messages within conversations
  - `id` (uuid, primary key) - Unique message identifier
  - `conversation_id` (uuid) - References conversations.id
  - `role` (text) - Message sender: 'user' or 'assistant'
  - `content` (text) - Message text content
  - `audio_url` (text, nullable) - URL to audio file if message includes audio
  - `created_at` (timestamptz) - Message timestamp

  ### 4. sessions
  Stores consultation session metadata
  - `id` (uuid, primary key) - Unique session identifier
  - `user_id` (uuid) - References profiles.id
  - `conversation_id` (uuid) - References conversations.id
  - `duration_minutes` (integer) - Session duration
  - `status` (text) - Session status: 'active', 'completed', 'cancelled'
  - `created_at` (timestamptz) - Session start timestamp
  - `completed_at` (timestamptz, nullable) - Session end timestamp

  ### 5. payments
  Stores payment transaction records
  - `id` (uuid, primary key) - Unique payment identifier
  - `user_id` (uuid) - References profiles.id
  - `stripe_payment_id` (text) - Stripe payment ID
  - `amount` (integer) - Amount in cents
  - `currency` (text) - Currency code (default: 'usd')
  - `status` (text) - Payment status: 'pending', 'succeeded', 'failed'
  - `subscription_tier` (text) - Tier purchased
  - `created_at` (timestamptz) - Payment timestamp

  ## Security (Row Level Security)

  All tables have RLS enabled with restrictive policies:

  ### profiles
  - Users can view their own profile
  - Users can update their own profile
  - Users can insert their own profile on signup

  ### conversations
  - Users can view their own conversations
  - Users can create new conversations
  - Users can update their own conversations

  ### messages
  - Users can view messages from their own conversations
  - Users can create messages in their own conversations

  ### sessions
  - Users can view their own sessions
  - Users can create new sessions
  - Users can update their own sessions

  ### payments
  - Users can view their own payment history
  - System (service role) can insert payment records

  ## Important Notes
  - All tables use UUID primary keys with gen_random_uuid()
  - Timestamps use timestamptz with now() defaults
  - Foreign keys cascade on delete to maintain referential integrity
  - Indexes added for frequently queried columns
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New Conversation',
  context text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  audio_url text,
  created_at timestamptz DEFAULT now()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  duration_minutes integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_id text UNIQUE,
  amount integer NOT NULL,
  currency text DEFAULT 'usd',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed')),
  subscription_tier text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
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

-- Conversations policies
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages from own conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Sessions policies
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();