-- Migration 003: Security Hardening
-- Aplicar no Supabase SQL Editor
-- Data: 2026-03-21

-- ============================================================
-- 1. CORRIGIR is_admin() — comparação case-insensitive de email
--    Motivo: auth.jwt()->>'email' já retorna lowercase no Supabase Auth,
--    mas essa correção garante defensively que variações de case não bloqueiem
--    o admin legítimo nem abram acesso a variações indevidas.
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
      AND LOWER(value) = LOWER(auth.jwt() ->> 'email')
  );
$$;

-- ============================================================
-- 2. TABELA: audit_log — registro imutável de todas as ações admin
--    Finalidade: detectar alterações não autorizadas, rastrear histórico
--    e prover evidência forense em caso de incidente.
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name   TEXT NOT NULL,
  operation    TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id    UUID,
  old_data     JSONB,
  new_data     JSONB,
  user_email   TEXT,
  user_id      UUID,
  ip_hint      TEXT, -- preenchido opcionalmente via client hint
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Somente admin pode LER o log; ninguém (nem admin) pode alterar ou deletar
DROP POLICY IF EXISTS "Admin read audit_log" ON audit_log;
CREATE POLICY "Admin read audit_log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (is_admin());

-- INSERT é feito exclusivamente pelo trigger SECURITY DEFINER abaixo —
-- não há policy de INSERT para usuários finais, protegendo a integridade do log.

-- ============================================================
-- 3. FUNÇÃO TRIGGER: log_admin_change()
--    Registra automaticamente toda modificação nas tabelas críticas.
--    SECURITY DEFINER: bypassa RLS ao inserir no audit_log, garantindo
--    que o log seja sempre gravado independentemente do usuário.
-- ============================================================

CREATE OR REPLACE FUNCTION log_admin_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_log (
    table_name,
    operation,
    record_id,
    old_data,
    new_data,
    user_email,
    user_id
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END,
    COALESCE(auth.jwt() ->> 'email', 'system'),
    auth.uid()
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- ============================================================
-- 4. APLICAR TRIGGER NAS TABELAS CRÍTICAS
-- ============================================================

DROP TRIGGER IF EXISTS audit_projects ON projects;
CREATE TRIGGER audit_projects
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION log_admin_change();

DROP TRIGGER IF EXISTS audit_bibliography ON bibliography;
CREATE TRIGGER audit_bibliography
  AFTER INSERT OR UPDATE OR DELETE ON bibliography
  FOR EACH ROW EXECUTE FUNCTION log_admin_change();

DROP TRIGGER IF EXISTS audit_testimonials ON testimonials;
CREATE TRIGGER audit_testimonials
  AFTER INSERT OR UPDATE OR DELETE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION log_admin_change();

DROP TRIGGER IF EXISTS audit_admin_settings ON admin_settings;
CREATE TRIGGER audit_admin_settings
  AFTER INSERT OR UPDATE OR DELETE ON admin_settings
  FOR EACH ROW EXECUTE FUNCTION log_admin_change();

-- ============================================================
-- 5. POLÍTICA RLS ADICIONAL: bloquear leitura de admin_settings
--    para usuários anônimos (defesa em profundidade)
-- ============================================================

DROP POLICY IF EXISTS "Anon block admin_settings" ON admin_settings;
-- Sem policy pública de SELECT = anon já bloqueado por padrão com RLS ativo.
-- Esta nota confirma que a ausência de policy pública é intencional.

-- ============================================================
-- 6. CONSTRAINT: garantir que embed_code não ultrapasse 100KB
--    (previne abuso de espaço em disco e possíveis DoS via campo)
-- ============================================================

ALTER TABLE projects
  ADD CONSTRAINT IF NOT EXISTS chk_projects_embed_size
    CHECK (octet_length(embed_code) <= 102400);

ALTER TABLE bibliography
  ADD CONSTRAINT IF NOT EXISTS chk_bibliography_embed_size
    CHECK (octet_length(embed_code) <= 102400);

-- ============================================================
-- INSTRUÇÕES DE APLICAÇÃO
-- 1. Abrir o Supabase SQL Editor no projeto correto
-- 2. Colar e executar este script completo
-- 3. Verificar no Table Editor que audit_log foi criada
-- 4. Confirmar que is_admin() retorna TRUE para o email admin
-- ============================================================
