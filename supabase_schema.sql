-- ==============================================================================
-- SUPABASE DATABASE SETUP FOR MICHELLE'S BIRTHDAY WEB APPLICATION
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create the main configuration table
CREATE TABLE IF NOT EXISTS public.birthday_site_data (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.birthday_site_data ENABLE ROW LEVEL SECURITY;

-- 3. Allow public read access (so Michelle & visitors can view the romantic page)
DROP POLICY IF EXISTS "Allow public read birthday_site_data" ON public.birthday_site_data;
CREATE POLICY "Allow public read birthday_site_data"
  ON public.birthday_site_data
  FOR SELECT
  USING (true);

-- 4. Allow public upsert/write access (for the admin portal)
DROP POLICY IF EXISTS "Allow public upsert birthday_site_data" ON public.birthday_site_data;
CREATE POLICY "Allow public upsert birthday_site_data"
  ON public.birthday_site_data
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Optional: Create storage bucket for photo uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('birthday_media', 'birthday_media', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage security policies (allow public reading and uploading of photos)
DROP POLICY IF EXISTS "Allow public read on birthday_media" ON storage.objects;
CREATE POLICY "Allow public read on birthday_media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'birthday_media');

DROP POLICY IF EXISTS "Allow public upload on birthday_media" ON storage.objects;
CREATE POLICY "Allow public upload on birthday_media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'birthday_media');

DROP POLICY IF EXISTS "Allow public update on birthday_media" ON storage.objects;
CREATE POLICY "Allow public update on birthday_media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'birthday_media');
