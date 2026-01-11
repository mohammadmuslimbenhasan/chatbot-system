/*
  # Multi-Agent Chatbot System Schema

  ## Overview
  This migration creates the complete database schema for a multi-agent real-time chatbot system
  with support for nested presets, file attachments, and brand customization.

  ## New Tables
  
  ### 1. profiles
  - `id` (uuid, primary key) - References auth.users
  - `email` (text, unique, not null)
  - `full_name` (text)
  - `role` (text) - 'admin', 'agent', or 'customer'
  - `avatar_url` (text)
  - `is_active` (boolean) - Agent online/offline status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. chats
  - `id` (uuid, primary key)
  - `customer_name` (text)
  - `customer_email` (text)
  - `status` (text) - 'pending', 'active', 'resolved', 'closed'
  - `assigned_agent_id` (uuid) - References profiles
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. messages
  - `id` (uuid, primary key)
  - `chat_id` (uuid) - References chats
  - `sender_type` (text) - 'customer', 'agent', 'bot'
  - `sender_id` (uuid) - References profiles (nullable for customers)
  - `content` (text)
  - `message_type` (text) - 'text', 'image', 'document', 'preset'
  - `metadata` (jsonb) - For file URLs, preset IDs, etc.
  - `is_read` (boolean)
  - `created_at` (timestamptz)

  ### 4. presets
  - `id` (uuid, primary key)
  - `parent_id` (uuid) - References presets (for nested structure)
  - `question_text` (text, not null)
  - `answer_text` (text)
  - `button_label` (text, not null)
  - `order_index` (integer)
  - `is_active` (boolean)
  - `escalate_to_agent` (boolean) - If true, connects to live agent
  - `created_at` (timestamptz)

  ### 5. quick_links
  - `id` (uuid, primary key)
  - `label` (text, not null)
  - `url` (text, not null)
  - `icon_name` (text) - Lucide icon name
  - `order_index` (integer)
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 6. brand_settings
  - `id` (uuid, primary key)
  - `setting_key` (text, unique, not null)
  - `setting_value` (text)
  - `updated_at` (timestamptz)

  ### 7. file_attachments
  - `id` (uuid, primary key)
  - `message_id` (uuid) - References messages
  - `file_name` (text, not null)
  - `file_url` (text, not null)
  - `file_type` (text) - 'image', 'document'
  - `file_size` (integer)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Create policies for authenticated users based on roles
  - Public access for widget (customer chat creation)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'agent', 'customer')),
  avatar_url text,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text,
  customer_email text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'resolved', 'closed')),
  assigned_agent_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'agent', 'bot')),
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content text,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'preset')),
  metadata jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create presets table (nested questions/answers)
CREATE TABLE IF NOT EXISTS presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES presets(id) ON DELETE CASCADE,
  question_text text,
  answer_text text,
  button_label text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  escalate_to_agent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create quick_links table
CREATE TABLE IF NOT EXISTS quick_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text NOT NULL,
  icon_name text DEFAULT 'ExternalLink',
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create brand_settings table
CREATE TABLE IF NOT EXISTS brand_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  updated_at timestamptz DEFAULT now()
);

-- Create file_attachments table
CREATE TABLE IF NOT EXISTS file_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text CHECK (file_type IN ('image', 'document')),
  file_size integer,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chats_status ON chats(status);
CREATE INDEX IF NOT EXISTS idx_chats_assigned_agent ON chats(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_presets_parent_id ON presets(parent_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Chats policies
CREATE POLICY "Anyone can create chats"
  ON chats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view chats"
  ON chats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );

CREATE POLICY "Agents and admins can update chats"
  ON chats FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );

-- Messages policies
CREATE POLICY "Anyone can insert messages"
  ON messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view messages in their chats"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );

-- Presets policies
CREATE POLICY "Everyone can view active presets"
  ON presets FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage presets"
  ON presets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Quick links policies
CREATE POLICY "Everyone can view active quick links"
  ON quick_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage quick links"
  ON quick_links FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Brand settings policies
CREATE POLICY "Everyone can view brand settings"
  ON brand_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage brand settings"
  ON brand_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- File attachments policies
CREATE POLICY "Everyone can view file attachments"
  ON file_attachments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert file attachments"
  ON file_attachments FOR INSERT
  WITH CHECK (true);

-- Insert default brand settings
INSERT INTO brand_settings (setting_key, setting_value) VALUES
  ('brand_name', 'MALIK.VIP'),
  ('primary_color', '#1e3a8a'),
  ('logo_url', ''),
  ('home_greeting', 'হাই 👋'),
  ('home_subtext', 'আমরা কিভাবে সাহায্য করতে পারি?'),
  ('send_message_text', 'আমাদের একটি মেসেজ পাঠান'),
  ('chat_to_agent_text', 'কথা বলুন গ্রাহক এক্সিকিউটিভ এর সাথে আমাদের এর উপরে ক্লিক করুন')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample quick links
INSERT INTO quick_links (label, url, icon_name, order_index) VALUES
  ('আমাদের ওয়েবসাইট ভিজিট করুন', 'https://malik.club', 'Globe', 1),
  ('হোয়াটসঅ্যাপ এ এক্সিকিউটিভ এর সাথে যোগাযোগ করুন', 'https://wa.me/1234567890', 'MessageCircle', 2)
ON CONFLICT DO NOTHING;

-- Insert sample presets (root level)
INSERT INTO presets (id, parent_id, question_text, answer_text, button_label, order_index, escalate_to_agent) VALUES
  ('11111111-1111-1111-1111-111111111111', NULL, NULL, NULL, '9WKTS', 1, false),
  ('22222222-2222-2222-2222-222222222222', NULL, NULL, NULL, 'কথা বলুন গ্রাহক এক্সিকিউটিভ এর সাথে', 2, true)
ON CONFLICT DO NOTHING;

-- Insert nested presets for 9WKTS
INSERT INTO presets (parent_id, question_text, answer_text, button_label, order_index) VALUES
  ('11111111-1111-1111-1111-111111111111', NULL, 'আপনি যদি লটারি তে নতুন হয়ে থাকেন তাহলে নিচের লিংক এ আমাদের এর উপরে ক্লিক করুন', 'LOTTERY - লটারি নাম্বার সাম্বাদ', 1),
  ('11111111-1111-1111-1111-111111111111', NULL, '9WKTS সম্বন্ধে আরো বিস্তারিত জানতে আমাদের ওয়েবসাইট ভিজিট করুন', '9WKTS - ম্যানুয়াল ডিপোজিট এর নিয়মিত', 2)
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_settings_updated_at BEFORE UPDATE ON brand_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
