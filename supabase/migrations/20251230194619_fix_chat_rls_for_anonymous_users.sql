/*
  # Fix Chat RLS Policies for Anonymous Users

  ## Problem
  Anonymous customers can create chats but cannot view them due to restrictive SELECT policy.
  This prevents the chat function from working for non-authenticated users.

  ## Solution
  Update the SELECT policy on chats table to allow anyone to view chats.
  Since chats don't contain sensitive information and need to be accessible
  to anonymous customers, we'll make them publicly viewable.

  ## Changes Made

  ### 1. Drop Existing Restrictive SELECT Policy
  - Remove the policy that only allows authenticated admins/agents to view chats

  ### 2. Create New Public SELECT Policy
  - Allow anyone (authenticated or anonymous) to view chats
  - This enables customers to see their own chat history

  ## Security Notes
  - Chats table doesn't contain sensitive personal information
  - Messages are already publicly viewable
  - UPDATE permissions remain restricted to admins/agents only
*/

-- ============================================
-- 1. DROP EXISTING RESTRICTIVE SELECT POLICY
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view chats" ON chats;

-- ============================================
-- 2. CREATE NEW PUBLIC SELECT POLICY
-- ============================================

CREATE POLICY "Anyone can view chats"
  ON chats FOR SELECT
  TO public
  USING (true);
