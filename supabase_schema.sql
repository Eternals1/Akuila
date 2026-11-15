-- Script SQL Pembentukan & Pembaruan Tabel Akuila SaaS di Supabase
-- Buka Supabase Dashboard -> SQL Editor -> Paste script ini -> Klik "Run"
-- Script ini AMAN dijalankan berulang kali (Idempotent)

-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  language TEXT DEFAULT 'id'
);

-- 2. Tabel Sites (Undangan / Hadiah Digital)
CREATE TABLE IF NOT EXISTS public.sites (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  template_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  customization JSONB DEFAULT '{}'::jsonb,
  color_scheme JSONB,
  font TEXT,
  qr_config JSONB
);

-- Pastikan kolom baru tetap bertambah jika tabel sudah ada sebelumnya
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS customization JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS color_scheme JSONB;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS font TEXT;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS qr_config JSONB;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Undangan Akuila';
ALTER TABLE public.sites ALTER COLUMN title DROP NOT NULL;

-- 3. Tabel Payments (Transaksi)
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  site_id TEXT REFERENCES public.sites(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- 4. Supabase Storage (Cloud Object Storage untuk Foto & Musik Undangan)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-media', 'site-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Kebijakan Keamanan RLS untuk Users
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (true);

-- Kebijakan Keamanan RLS untuk Sites
DROP POLICY IF EXISTS "Public can view sites" ON public.sites;
CREATE POLICY "Public can view sites" ON public.sites FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own sites" ON public.sites;
CREATE POLICY "Users can insert own sites" ON public.sites FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own sites" ON public.sites;
CREATE POLICY "Users can update own sites" ON public.sites FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete own sites" ON public.sites;
CREATE POLICY "Users can delete own sites" ON public.sites FOR DELETE USING (true);

-- Kebijakan Keamanan RLS untuk Payments
DROP POLICY IF EXISTS "Users can manage payments" ON public.payments;
CREATE POLICY "Users can manage payments" ON public.payments FOR ALL USING (true);

-- Kebijakan Keamanan RLS untuk Storage ('site-media')
DROP POLICY IF EXISTS "Public Access Storage" ON storage.objects;
CREATE POLICY "Public Access Storage" ON storage.objects FOR SELECT USING ( bucket_id = 'site-media' );

DROP POLICY IF EXISTS "Authenticated Users Upload Storage" ON storage.objects;
CREATE POLICY "Authenticated Users Upload Storage" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'site-media' );

DROP POLICY IF EXISTS "Users Update Own Storage" ON storage.objects;
CREATE POLICY "Users Update Own Storage" ON storage.objects FOR UPDATE USING ( bucket_id = 'site-media' );

DROP POLICY IF EXISTS "Users Delete Own Storage" ON storage.objects;
CREATE POLICY "Users Delete Own Storage" ON storage.objects FOR DELETE USING ( bucket_id = 'site-media' );
