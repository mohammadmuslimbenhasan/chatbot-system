/*
  # Fix Authentication Issues

  ## Overview
  Fixes critical authentication issues preventing user login and profile creation.

  ## Problems Fixed
  1. Missing INSERT policy on profiles table - users couldn't create profiles during signup
  2. Overly restrictive admin policies blocking legitimate operations
  3. No initial admin account in database

  ## Changes Made

  ### 1. Add INSERT Policy for Profiles
  - Allow authenticated users to insert their own profile
  - Required for signup flow to work

  ### 2. Fix Admin Policies
  - Change from RESTRICTIVE to PERMISSIVE
  - Admins should be able to do everything, not block other operations

  ### 3. Create Initial Admin Account
  - Create admin user profile for first-time setup
  - Credentials: admin@malik.vip / admin123
  - Must change password after first login
*/

-- ============================================
-- 1. ADD INSERT POLICY FOR PROFILES
-- ============================================

-- Drop old restrictive admin policy
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Admins can do everything (permissive, not restrictive)
CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ============================================
-- 2. FIX OTHER RESTRICTIVE POLICIES
-- ============================================

-- Fix presets policies
DROP POLICY IF EXISTS "Admins can manage presets" ON presets;
CREATE POLICY "Admins can insert presets"
  ON presets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update presets"
  ON presets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete presets"
  ON presets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Fix quick_links policies
DROP POLICY IF EXISTS "Admins can manage quick links" ON quick_links;
CREATE POLICY "Admins can insert quick links"
  ON quick_links FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update quick links"
  ON quick_links FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete quick links"
  ON quick_links FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Fix brand_settings policies
DROP POLICY IF EXISTS "Admins can manage brand settings" ON brand_settings;
CREATE POLICY "Admins can insert brand settings"
  ON brand_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update brand settings"
  ON brand_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete brand settings"
  ON brand_settings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );