/*
  # Fix Profile Creation with Trigger

  ## Overview
  Automatically create profile when user signs up using a database trigger.

  ## Problem
  RLS policies block profile creation during signup because session isn't established yet.

  ## Solution
  Create a trigger that automatically creates a profile when a user is created in auth.users.
  The trigger runs with elevated privileges, bypassing RLS.

  ## Changes Made

  ### 1. Create Function to Auto-Create Profile
  - Triggered when new user is created
  - Reads role from user metadata
  - Creates profile automatically
  - Runs with SECURITY DEFINER to bypass RLS

  ### 2. Create Trigger
  - Fires AFTER INSERT on auth.users
  - Calls the profile creation function
*/

-- ============================================
-- 1. CREATE FUNCTION TO AUTO-CREATE PROFILE
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$;

-- ============================================
-- 2. CREATE TRIGGER ON AUTH.USERS
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. UPDATE AUTH SERVICE TO NOT MANUALLY INSERT
-- ============================================
-- Note: The auth service code should be updated to remove
-- the manual profile insert since the trigger handles it now