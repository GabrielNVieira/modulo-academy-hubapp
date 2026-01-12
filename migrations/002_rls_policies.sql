-- ==========================================
-- ACADEMY MODULE - RLS POLICIES
-- Row-Level Security for Multi-Tenancy
-- Version: 1.0.0
-- ==========================================

-- ==========================================
-- ENABLE RLS ON ALL TABLES
-- ==========================================

ALTER TABLE academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_levels ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- TENANT ISOLATION POLICIES
-- Garante que usuários só vejam dados do seu tenant
-- ==========================================

-- Política padrão: current_setting('app.current_tenant_id')
-- O tenant_id será definido no início de cada sessão/requisição

-- COURSES
CREATE POLICY tenant_isolation_courses ON academy_courses
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- LESSONS
CREATE POLICY tenant_isolation_lessons ON academy_lessons
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- QUESTIONS
CREATE POLICY tenant_isolation_questions ON academy_questions
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- MISSIONS
CREATE POLICY tenant_isolation_missions ON academy_missions
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- BADGES
CREATE POLICY tenant_isolation_badges ON academy_badges
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- USER PROGRESS
CREATE POLICY tenant_isolation_user_progress ON academy_user_progress
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- COURSE PROGRESS
CREATE POLICY tenant_isolation_course_progress ON academy_course_progress
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- LESSON PROGRESS
CREATE POLICY tenant_isolation_lesson_progress ON academy_lesson_progress
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- MISSION PROGRESS
CREATE POLICY tenant_isolation_mission_progress ON academy_mission_progress
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- USER BADGES
CREATE POLICY tenant_isolation_user_badges ON academy_user_badges
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- XP HISTORY
CREATE POLICY tenant_isolation_xp_history ON academy_xp_history
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- LEVELS
CREATE POLICY tenant_isolation_levels ON academy_levels
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- ==========================================
-- USER ISOLATION POLICIES (ADDITIONAL)
-- Garante que usuários só vejam seus próprios dados
-- ==========================================

-- USER PROGRESS - Usuário só vê o próprio progresso
CREATE POLICY user_isolation_user_progress ON academy_user_progress
    FOR ALL
    USING (
        tenant_id = current_setting('app.current_tenant_id', true)::uuid
        AND user_id = current_setting('app.current_user_id', true)::uuid
    );

-- COURSE PROGRESS
CREATE POLICY user_isolation_course_progress ON academy_course_progress
    FOR ALL
    USING (
        tenant_id = current_setting('app.current_tenant_id', true)::uuid
        AND user_id = current_setting('app.current_user_id', true)::uuid
    );

-- LESSON PROGRESS
CREATE POLICY user_isolation_lesson_progress ON academy_lesson_progress
    FOR ALL
    USING (
        tenant_id = current_setting('app.current_tenant_id', true)::uuid
        AND user_id = current_setting('app.current_user_id', true)::uuid
    );

-- MISSION PROGRESS
CREATE POLICY user_isolation_mission_progress ON academy_mission_progress
    FOR ALL
    USING (
        tenant_id = current_setting('app.current_tenant_id', true)::uuid
        AND user_id = current_setting('app.current_user_id', true)::uuid
    );

-- USER BADGES
CREATE POLICY user_isolation_user_badges ON academy_user_badges
    FOR ALL
    USING (
        tenant_id = current_setting('app.current_tenant_id', true)::uuid
        AND user_id = current_setting('app.current_user_id', true)::uuid
    );

-- XP HISTORY
CREATE POLICY user_isolation_xp_history ON academy_xp_history
    FOR ALL
    USING (
        tenant_id = current_setting('app.current_tenant_id', true)::uuid
        AND user_id = current_setting('app.current_user_id', true)::uuid
    );

-- ==========================================
-- ADMIN BYPASS POLICIES (OPCIONAL)
-- Permite que admins vejam todos os dados do tenant
-- ==========================================

-- Descomente se quiser permitir bypass para admins
-- CREATE POLICY admin_bypass_courses ON academy_courses
--     FOR ALL
--     TO authenticated
--     USING (
--         tenant_id = current_setting('app.current_tenant_id', true)::uuid
--         AND current_setting('app.user_role', true) = 'admin'
--     );

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Função para setar tenant_id na sessão
CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', p_tenant_id::text, false);
END;
$$ LANGUAGE plpgsql;

-- Função para setar user_id na sessão
CREATE OR REPLACE FUNCTION set_user_context(p_user_id UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', p_user_id::text, false);
END;
$$ LANGUAGE plpgsql;

-- Função para setar ambos (tenant + user) de uma vez
CREATE OR REPLACE FUNCTION set_session_context(p_tenant_id UUID, p_user_id UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', p_tenant_id::text, false);
    PERFORM set_config('app.current_user_id', p_user_id::text, false);
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- EXEMPLO DE USO
-- ==========================================

-- No início de cada sessão/requisição, chamar:
-- SELECT set_session_context('tenant-uuid-here'::uuid, 'user-uuid-here'::uuid);

-- Ou separadamente:
-- SELECT set_tenant_context('tenant-uuid-here'::uuid);
-- SELECT set_user_context('user-uuid-here'::uuid);

-- ==========================================
-- GRANTS (PERMISSÕES)
-- ==========================================

-- Conceder permissões para role 'authenticated'
-- Ajuste conforme necessário para sua aplicação

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Se estiver usando Supabase, ele já gerencia isso automaticamente
