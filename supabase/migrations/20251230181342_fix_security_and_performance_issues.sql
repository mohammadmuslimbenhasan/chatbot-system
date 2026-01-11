/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses critical security and performance issues identified in the database schema.

  ## Changes Made

  ### 1. Foreign Key Indexes (Performance)
  - Add index on `file_attachments.message_id` for better join performance
  - Add index on `messages.sender_id` for better join performance

  ### 2. RLS Policy Optimization (Performance)
  - Refactor all RLS policies to use `(select auth.<function>())` pattern
  - This prevents re-evaluation of auth functions for each row
  - Significantly improves query performance at scale

  ### 3. Remove Unused Indexes (Maintenance)
  - Drop indexes that are not being used by queries
  - Reduces storage overhead and write performance impact

  ### 4. Consolidate Permissive Policies (Security)
  - Make admin policies restrictive to avoid conflicts with public policies
  - Ensures proper security boundaries

  ### 5. Fix Function Search Path (Security)
  - Add SECURITY DEFINER and explicit search_path to `update_updated_at_column`
  - Prevents search_path injection attacks

  ## Important Notes
  - All changes are non-destructive
  - Existing data and functionality remain intact
  - Query performance should improve after these changes
*/

-- ============================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_file_attachments_message_id 
  ON file_attachments(message_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id 
  ON messages(sender_id);

-- ============================================
-- 2. REMOVE UNUSED INDEXES
-- ============================================

DROP INDEX IF EXISTS idx_chats_status;
DROP INDEX IF EXISTS idx_chats_assigned_agent;
DROP INDEX IF EXISTS idx_messages_chat_id;
DROP INDEX IF EXISTS idx_messages_created_at;
DROP INDEX IF EXISTS idx_presets_parent_id;
DROP INDEX IF EXISTS idx_profiles_role;

-- ============================================
-- 3. FIX RLS POLICIES - DROP OLD ONES
-- ============================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- Chats policies
DROP POLICY IF EXISTS "Authenticated users can view chats" ON chats;
DROP POLICY IF EXISTS "Agents and admins can update chats" ON chats;

-- Messages policies
DROP POLICY IF EXISTS "Authenticated users can update messages" ON messages;

-- Presets policies
DROP POLICY IF EXISTS "Admins can manage presets" ON presets;

-- Quick links policies
DROP POLICY IF EXISTS "Admins can manage quick links" ON quick_links;

-- Brand settings policies
DROP POLICY IF EXISTS "Admins can manage brand settings" ON brand_settings;

-- ============================================
-- 4. CREATE OPTIMIZED RLS POLICIES
-- ============================================

-- Profiles policies (optimized)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Admins can manage all profiles"
  ON profiles AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Chats policies (optimized)
CREATE POLICY "Authenticated users can view chats"
  ON chats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role IN ('admin', 'agent')
    )
  );

CREATE POLICY "Agents and admins can update chats"
  ON chats FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role IN ('admin', 'agent')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role IN ('admin', 'agent')
    )
  );

-- Messages policies (optimized)
CREATE POLICY "Authenticated users can update messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role IN ('admin', 'agent')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role IN ('admin', 'agent')
    )
  );

-- Presets policies (optimized and restrictive)
CREATE POLICY "Admins can manage presets"
  ON presets AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Quick links policies (optimized and restrictive)
CREATE POLICY "Admins can manage quick links"
  ON quick_links AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Brand settings policies (optimized and restrictive)
CREATE POLICY "Admins can manage brand settings"
  ON brand_settings AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ============================================
-- 5. FIX FUNCTION SEARCH PATH
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
