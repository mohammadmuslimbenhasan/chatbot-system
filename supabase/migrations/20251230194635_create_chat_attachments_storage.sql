/*
  # Create Storage Bucket for Chat Attachments

  ## Overview
  Create a storage bucket for handling file attachments in chat conversations.

  ## Changes Made

  ### 1. Create Storage Bucket
  - Bucket name: chat-attachments
  - Public access enabled for easy file retrieval
  - File size limit: 10MB
  - Allowed types: images and documents

  ### 2. Storage Policies
  - Anyone can upload files (INSERT)
  - Anyone can view/download files (SELECT)
  - Only admins/agents can delete files (DELETE)
*/

-- ============================================
-- 1. CREATE STORAGE BUCKET
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-attachments',
  'chat-attachments',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. CREATE STORAGE POLICIES
-- ============================================

CREATE POLICY "Anyone can upload chat attachments"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'chat-attachments');

CREATE POLICY "Anyone can view chat attachments"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'chat-attachments');

CREATE POLICY "Admins and agents can delete attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'chat-attachments'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'agent')
    )
  );
