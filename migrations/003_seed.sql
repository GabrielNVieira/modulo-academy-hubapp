-- ==========================================
-- ACADEMY MODULE - SEED DATA
-- Dados iniciais para desenvolvimento/demo
-- Version: 1.0.0
-- ==========================================

-- IMPORTANTE: Este arquivo usa UUID fixos para facilitar testes
-- Em produção, deixe o banco gerar UUIDs automaticamente

-- Variável do tenant (ajuste conforme necessário)
-- Para desenvolvimento, usar um tenant_id fixo
DO $$
DECLARE
    demo_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
    demo_user_id UUID := '00000000-0000-0000-0000-000000000002';
    course_id UUID;
BEGIN
    -- ==========================================
    -- 1. INSERIR NÍVEIS
    -- ==========================================
    INSERT INTO academy_levels (tenant_id, level_number, name, color, xp_required, icon) VALUES
    (demo_tenant_id, 1, 'Explorador', '#06b6d4', 0, '🔍'),
    (demo_tenant_id, 2, 'Conhecedor', '#0891b2', 500, '📚'),
    (demo_tenant_id, 3, 'Especialista', '#0e7490', 1500, '🎯'),
    (demo_tenant_id, 4, 'Mestre', '#164e63', 3500, '👑')
    ON CONFLICT (tenant_id, level_number) DO NOTHING;

    -- ==========================================
    -- 2. INSERIR CURSO PRINCIPAL
    -- ==========================================
    INSERT INTO academy_courses (id, tenant_id, title, description, icon, level, xp_reward, estimated_time, order_index, status)
    VALUES (
        '10000000-0000-0000-0000-000000000001',
        demo_tenant_id,
        'Treinamento Completo Hub.App',
        'Domine todas as funcionalidades do Hub.App neste curso completo',
        '🚀',
        1,
        500,
        '2 horas',
        1,
        'active'
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO course_id;

    IF course_id IS NULL THEN
        course_id := '10000000-0000-0000-0000-000000000001';
    END IF;

    -- ==========================================
    -- 3. INSERIR LIÇÕES (9 LIÇÕES)
    -- ==========================================
    INSERT INTO academy_lessons (id, tenant_id, course_id, title, content, video_url, xp_reward, order_index, lesson_type) VALUES
    (
        '20000000-0000-0000-0000-000000000001',
        demo_tenant_id,
        course_id,
        'Introdução ao Hub.App',
        'Bem-vindo ao Hub.App! Nesta aula você conhecerá a plataforma e suas principais funcionalidades.',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        100,
        1,
        'video'
    ),
    (
        '20000000-0000-0000-0000-000000000002',
        demo_tenant_id,
        course_id,
        'Configuração Inicial',
        'Aprenda a configurar sua conta e personalizar o ambiente de trabalho.',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        100,
        2,
        'video'
    ),
    (
        '20000000-0000-0000-0000-000000000003',
        demo_tenant_id,
        course_id,
        'Gerenciamento de Usuários',
        'Como criar, editar e gerenciar usuários no sistema.',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        100,
        3,
        'video'
    ),
    (
        '20000000-0000-0000-0000-000000000004',
        demo_tenant_id,
        course_id,
        'Módulos e Integrações',
        'Descubra como utilizar módulos e integrar com outros sistemas.',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        100,
        4,
        'video'
    ),
    (
        '20000000-0000-0000-0000-000000000005',
        demo_tenant_id,
        course_id,
        'Webhooks e Automações',
        'Configure webhooks e crie automações poderosas.',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        100,
        5,
        'video'
    ),
    (
        '20000000-0000-0000-0000-000000000006',
        demo_tenant_id,
        course_id,
        'Relatórios e Analytics',
        'Aprenda a gerar relatórios e analisar dados.',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        100,
        6,
        'video'
    ),
    (
        '20000000-0000-0000-0000-000000000007',
        demo_tenant_id,
        course_id,
        'Segurança e Permissões',
        'Entenda o sistema de permissões e boas práticas de segurança.',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        100,
        7,
        'video'
    ),
    (
        '20000000-0000-0000-0000-000000000008',
        demo_tenant_id,
        course_id,
        'API e Integrações Avançadas',
        'Utilize a API REST para integrações customizadas.',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        100,
        8,
        'video'
    ),
    (
        '20000000-0000-0000-0000-000000000009',
        demo_tenant_id,
        course_id,
        'Quiz Final de Certificação',
        'Teste seus conhecimentos e conquiste o certificado!',
        NULL,
        150,
        9,
        'quiz'
    )
    ON CONFLICT (id) DO NOTHING;

    -- ==========================================
    -- 4. INSERIR PERGUNTAS DE QUIZ (3 PERGUNTAS)
    -- ==========================================
    INSERT INTO academy_questions (id, tenant_id, lesson_id, question, options, explanation, xp_reward, order_index) VALUES
    (
        '30000000-0000-0000-0000-000000000001',
        demo_tenant_id,
        '20000000-0000-0000-0000-000000000009',
        'O que são webhooks?',
        '[
            {"id": "a", "text": "APIs REST tradicionais", "isCorrect": false},
            {"id": "b", "text": "Eventos automáticos que o sistema dispara", "isCorrect": true},
            {"id": "c", "text": "Banco de dados NoSQL", "isCorrect": false},
            {"id": "d", "text": "Protocolo de comunicação", "isCorrect": false}
        ]'::jsonb,
        'Webhooks são eventos automáticos que o sistema dispara quando determinadas ações acontecem, permitindo integração em tempo real.',
        25,
        1
    ),
    (
        '30000000-0000-0000-0000-000000000002',
        demo_tenant_id,
        '20000000-0000-0000-0000-000000000009',
        'Qual é o nível mínimo de XP para se tornar um Especialista?',
        '[
            {"id": "a", "text": "500 XP", "isCorrect": false},
            {"id": "b", "text": "1000 XP", "isCorrect": false},
            {"id": "c", "text": "1500 XP", "isCorrect": true},
            {"id": "d", "text": "3500 XP", "isCorrect": false}
        ]'::jsonb,
        'O nível Especialista requer 1500 XP. São 4 níveis: Explorador (0), Conhecedor (500), Especialista (1500), Mestre (3500).',
        25,
        2
    ),
    (
        '30000000-0000-0000-0000-000000000003',
        demo_tenant_id,
        '20000000-0000-0000-0000-000000000009',
        'Qual é a principal vantagem do sistema multi-tenant?',
        '[
            {"id": "a", "text": "Melhor performance", "isCorrect": false},
            {"id": "b", "text": "Isolamento completo de dados entre clientes", "isCorrect": true},
            {"id": "c", "text": "Custo mais baixo", "isCorrect": false},
            {"id": "d", "text": "Facilidade de uso", "isCorrect": false}
        ]'::jsonb,
        'Multi-tenancy garante isolamento completo de dados entre diferentes clientes (tenants), com segurança via RLS.',
        25,
        3
    )
    ON CONFLICT (id) DO NOTHING;

    -- ==========================================
    -- 5. INSERIR MISSÕES (5 MISSÕES)
    -- ==========================================
    INSERT INTO academy_missions (id, tenant_id, title, description, icon, xp_reward, mission_type, type, requirements, order_index, estimated_time, category) VALUES
    (
        '40000000-0000-0000-0000-000000000001',
        demo_tenant_id,
        'Configure seu Primeiro Webhook',
        'Aprenda na prática a configurar um webhook para receber eventos do sistema',
        '🎯',
        150,
        'checklist',
        'tutorial',
        '{
            "items": [
                {"id": "step-1", "text": "Acesse o menu Webhooks", "completed": false, "required": true},
                {"id": "step-2", "text": "Clique em Novo Webhook", "completed": false, "required": true},
                {"id": "step-3", "text": "Configure a URL de destino", "completed": false, "required": true},
                {"id": "step-4", "text": "Selecione os eventos desejados", "completed": false, "required": true},
                {"id": "step-5", "text": "Teste o webhook", "completed": false, "required": true}
            ]
        }'::jsonb,
        1,
        15,
        'Configuração'
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        demo_tenant_id,
        'Crie um Workflow de Boas-Vindas',
        'Construa um workflow automatizado para dar boas-vindas a novos usuários',
        '👋',
        200,
        'checklist',
        'livre',
        '{
            "items": [
                {"id": "step-1", "text": "Acesse Workflows", "completed": false, "required": true},
                {"id": "step-2", "text": "Crie novo workflow", "completed": false, "required": true},
                {"id": "step-3", "text": "Configure trigger de novo usuário", "completed": false, "required": true},
                {"id": "step-4", "text": "Adicione ação de envio de email", "completed": false, "required": true},
                {"id": "step-5", "text": "Personalize a mensagem", "completed": false, "required": false},
                {"id": "step-6", "text": "Ative o workflow", "completed": false, "required": true}
            ]
        }'::jsonb,
        2,
        20,
        'Automação'
    ),
    (
        '40000000-0000-0000-0000-000000000003',
        demo_tenant_id,
        'Debug: Webhook Não Dispara',
        'Um webhook parou de funcionar. Diagnostique e corrija o problema',
        '🔧',
        250,
        'checklist',
        'problema',
        '{
            "items": [
                {"id": "step-1", "text": "Verifique os logs do webhook", "completed": false, "required": true},
                {"id": "step-2", "text": "Valide a URL de destino", "completed": false, "required": true},
                {"id": "step-3", "text": "Confirme eventos selecionados", "completed": false, "required": true},
                {"id": "step-4", "text": "Teste manualmente", "completed": false, "required": true},
                {"id": "step-5", "text": "Corrija o problema identificado", "completed": false, "required": true}
            ]
        }'::jsonb,
        3,
        25,
        'Troubleshooting'
    ),
    (
        '40000000-0000-0000-0000-000000000004',
        demo_tenant_id,
        'Otimize o Fluxo de Agendamento',
        'Reduza o número de cliques necessários para criar um agendamento',
        '⚡',
        300,
        'checklist',
        'otimizacao',
        '{
            "items": [
                {"id": "step-1", "text": "Analise o fluxo atual", "completed": false, "required": true},
                {"id": "step-2", "text": "Identifique etapas desnecessárias", "completed": false, "required": true},
                {"id": "step-3", "text": "Configure campos padrão", "completed": false, "required": true},
                {"id": "step-4", "text": "Crie atalhos de teclado", "completed": false, "required": false},
                {"id": "step-5", "text": "Teste o novo fluxo", "completed": false, "required": true},
                {"id": "step-6", "text": "Documente as mudanças", "completed": false, "required": false}
            ]
        }'::jsonb,
        4,
        30,
        'Otimização'
    ),
    (
        '40000000-0000-0000-0000-000000000005',
        demo_tenant_id,
        'Configure Permissões Granulares',
        'Aprenda a configurar permissões detalhadas para diferentes tipos de usuários',
        '🔐',
        200,
        'checklist',
        'livre',
        '{
            "items": [
                {"id": "step-1", "text": "Acesse Configurações > Permissões", "completed": false, "required": true},
                {"id": "step-2", "text": "Crie um novo papel (role)", "completed": false, "required": true},
                {"id": "step-3", "text": "Defina permissões de leitura", "completed": false, "required": true},
                {"id": "step-4", "text": "Defina permissões de escrita", "completed": false, "required": true},
                {"id": "step-5", "text": "Atribua o papel a um usuário", "completed": false, "required": true},
                {"id": "step-6", "text": "Teste as permissões", "completed": false, "required": true}
            ]
        }'::jsonb,
        5,
        25,
        'Segurança'
    )
    ON CONFLICT (id) DO NOTHING;

    -- ==========================================
    -- 6. INSERIR BADGES (13 BADGES)
    -- ==========================================
    INSERT INTO academy_badges (id, tenant_id, name, description, icon, category, requirements, xp_bonus, rarity) VALUES
    -- Common Badges (5)
    (
        '50000000-0000-0000-0000-000000000001',
        demo_tenant_id,
        'Bem-Vindo',
        'Completou o tutorial inicial',
        '👋',
        'especial',
        '{"type": "custom", "description": "Completar tutorial inicial"}'::jsonb,
        10,
        'common'
    ),
    (
        '50000000-0000-0000-0000-000000000002',
        demo_tenant_id,
        'Explorador',
        'Alcançou o nível 1',
        '🔍',
        'especial',
        '{"type": "xp_total", "targetValue": 0, "description": "Alcançar nível Explorador"}'::jsonb,
        0,
        'common'
    ),
    (
        '50000000-0000-0000-0000-000000000003',
        demo_tenant_id,
        'Primeira Missão',
        'Completou sua primeira missão',
        '🎯',
        'missao',
        '{"type": "custom", "description": "Completar primeira missão"}'::jsonb,
        25,
        'common'
    ),
    (
        '50000000-0000-0000-0000-000000000004',
        demo_tenant_id,
        'Estudante Dedicado',
        'Assistiu 5 vídeos completos',
        '📚',
        'curso',
        '{"type": "custom", "description": "Assistir 5 vídeos até o fim"}'::jsonb,
        50,
        'common'
    ),
    (
        '50000000-0000-0000-0000-000000000005',
        demo_tenant_id,
        'Sequência de 3 Dias',
        'Manteve streak de 3 dias consecutivos',
        '🔥',
        'streak',
        '{"type": "streak", "targetValue": 3, "description": "Manter 3 dias de streak"}'::jsonb,
        50,
        'common'
    ),
    -- Rare Badges (3)
    (
        '50000000-0000-0000-0000-000000000006',
        demo_tenant_id,
        'Conhecedor',
        'Alcançou o nível 2',
        '📚',
        'especial',
        '{"type": "xp_total", "targetValue": 500, "description": "Alcançar nível Conhecedor"}'::jsonb,
        100,
        'rare'
    ),
    (
        '50000000-0000-0000-0000-000000000007',
        demo_tenant_id,
        'Maratonista',
        'Completou 5 missões em sequência',
        '🏃',
        'missao',
        '{"type": "custom", "description": "Completar 5 missões seguidas"}'::jsonb,
        150,
        'rare'
    ),
    (
        '50000000-0000-0000-0000-000000000008',
        demo_tenant_id,
        'Sequência de 7 Dias',
        'Manteve streak de 7 dias consecutivos',
        '🔥',
        'streak',
        '{"type": "streak", "targetValue": 7, "description": "Manter 7 dias de streak"}'::jsonb,
        200,
        'rare'
    ),
    -- Epic Badges (2)
    (
        '50000000-0000-0000-0000-000000000009',
        demo_tenant_id,
        'Especialista',
        'Alcançou o nível 3',
        '🎯',
        'especial',
        '{"type": "xp_total", "targetValue": 1500, "description": "Alcançar nível Especialista"}'::jsonb,
        300,
        'epic'
    ),
    (
        '50000000-0000-0000-0000-000000000010',
        demo_tenant_id,
        'Perfeição',
        'Acertou 100% em 10 quizzes',
        '💯',
        'curso',
        '{"type": "custom", "description": "100% de acerto em 10 quizzes"}'::jsonb,
        500,
        'epic'
    ),
    -- Legendary Badges (2)
    (
        '50000000-0000-0000-0000-000000000011',
        demo_tenant_id,
        'Mestre',
        'Alcançou o nível 4 - Domínio completo',
        '👑',
        'especial',
        '{"type": "xp_total", "targetValue": 3500, "description": "Alcançar nível Mestre"}'::jsonb,
        1000,
        'legendary'
    ),
    (
        '50000000-0000-0000-0000-000000000012',
        demo_tenant_id,
        'Sequência de 30 Dias',
        'Manteve streak de 30 dias consecutivos - Dedicação excepcional!',
        '⭐',
        'streak',
        '{"type": "streak", "targetValue": 30, "description": "Manter 30 dias de streak"}'::jsonb,
        1500,
        'legendary'
    ),
    (
        '50000000-0000-0000-0000-000000000013',
        demo_tenant_id,
        'Lenda do Hub',
        'Completou todos os cursos, missões e conquistou todos os outros badges',
        '🏆',
        'especial',
        '{"type": "custom", "description": "Completar 100% do conteúdo"}'::jsonb,
        2000,
        'legendary'
    )
    ON CONFLICT (id) DO NOTHING;

    -- ==========================================
    -- 7. INSERIR PROGRESSO DEMO (OPCIONAL)
    -- ==========================================
    -- Descomente para criar um usuário demo com progresso
    /*
    INSERT INTO academy_user_progress (tenant_id, user_id, total_xp, current_level, courses_completed, lessons_completed, missions_completed, current_streak, longest_streak, last_activity_date)
    VALUES (
        demo_tenant_id,
        demo_user_id,
        850,
        2,
        1,
        4,
        2,
        5,
        12,
        CURRENT_DATE
    )
    ON CONFLICT (tenant_id, user_id) DO UPDATE SET
        total_xp = EXCLUDED.total_xp,
        current_level = EXCLUDED.current_level,
        courses_completed = EXCLUDED.courses_completed,
        lessons_completed = EXCLUDED.lessons_completed,
        missions_completed = EXCLUDED.missions_completed,
        current_streak = EXCLUDED.current_streak,
        longest_streak = EXCLUDED.longest_streak,
        last_activity_date = EXCLUDED.last_activity_date;
    */

END $$;

-- ==========================================
-- SUCESSO!
-- ==========================================
DO $$
BEGIN
    RAISE NOTICE '✅ Seed data inserido com sucesso!';
    RAISE NOTICE '📚 9 lições criadas';
    RAISE NOTICE '❓ 3 perguntas de quiz criadas';
    RAISE NOTICE '🎯 5 missões criadas';
    RAISE NOTICE '🏆 13 badges criados (5 Common, 3 Rare, 2 Epic, 3 Legendary)';
    RAISE NOTICE '⭐ 4 níveis configurados';
END $$;
