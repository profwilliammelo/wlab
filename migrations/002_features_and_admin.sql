-- Migration 002: Embed code, Featured Image, Admin Settings, is_admin() function
-- Aplicar no Supabase SQL Editor

-- ============================================================
-- 1. ADICIONAR COLUNAS A TABELAS EXISTENTES
-- ============================================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
  ADD COLUMN IF NOT EXISTS embed_code TEXT;

ALTER TABLE bibliography
  ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
  ADD COLUMN IF NOT EXISTS embed_code TEXT;

-- ============================================================
-- 2. TABELA: testimonials (garantir que existe com campos completos)
-- ============================================================

CREATE TABLE IF NOT EXISTS testimonials (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content     TEXT,
  name        TEXT,
  role        TEXT,
  image_url   TEXT,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Testimonials" ON testimonials;
CREATE POLICY "Public Read Testimonials"
  ON testimonials FOR SELECT
  TO anon
  USING (active = TRUE);

-- ============================================================
-- 3. TABELA: admin_settings
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_settings (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key        TEXT NOT NULL UNIQUE,
  value      TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. FUNÇÃO is_admin() — SECURITY DEFINER (bypassa RLS ao ler admin_settings)
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_settings
    WHERE key = 'admin_email'
      AND value = auth.jwt() ->> 'email'
  );
$$;

-- ============================================================
-- 5. POLÍTICAS RLS — admin_settings
-- ============================================================

DROP POLICY IF EXISTS "Admin read admin_settings" ON admin_settings;
CREATE POLICY "Admin read admin_settings"
  ON admin_settings FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admin write admin_settings" ON admin_settings;
CREATE POLICY "Admin write admin_settings"
  ON admin_settings FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- 6. POLÍTICAS RLS — projects (adicionar escrita para admin)
-- ============================================================

DROP POLICY IF EXISTS "Admin write projects" ON projects;
CREATE POLICY "Admin write projects"
  ON projects FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- 7. POLÍTICAS RLS — bibliography (adicionar escrita para admin)
-- ============================================================

DROP POLICY IF EXISTS "Admin write bibliography" ON bibliography;
CREATE POLICY "Admin write bibliography"
  ON bibliography FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- 8. POLÍTICAS RLS — testimonials (adicionar escrita para admin)
-- ============================================================

DROP POLICY IF EXISTS "Admin write testimonials" ON testimonials;
CREATE POLICY "Admin write testimonials"
  ON testimonials FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- 9. SEED: admin_settings com valores padrão
-- Substitua o e-mail pelo e-mail real do admin antes de aplicar
-- ============================================================

INSERT INTO admin_settings (key, value) VALUES
  ('admin_email', 'williamcorrea95@gmail.com'),
  ('site_name', 'Prof. William Melo'),
  ('site_description', 'Doutor em Educação, Pesquisador, Professor e Artista.')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- IMPORTANTE: Criar o usuário admin no Supabase Auth
-- Vá em: Authentication > Users > Add User
-- Use o mesmo e-mail definido em admin_email acima
-- ============================================================
