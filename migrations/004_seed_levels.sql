-- ==========================================
-- MIGRATION 004 - SEED LEVELS
-- Popula a tabela academy_levels com os dados iniciais
-- ==========================================

INSERT INTO academy_levels (level_number, name, color, xp_required, icon)
VALUES 
    (1, 'Explorador', '#06b6d4', 0, '🔍'),
    (2, 'Conhecedor', '#0891b2', 500, '📚'),
    (3, 'Especialista', '#0e7490', 1500, '🎯'),
    (4, 'Mestre', '#164e63', 3500, '👑')
ON CONFLICT (tenant_id, level_number) DO NOTHING;
