-- ==========================================
-- ACADEMY MODULE - SCHEMA SQL
-- PostgreSQL Database Schema
-- Version: 1.0.0
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. COURSES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS academy_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT '📚',
    level INTEGER DEFAULT 1 CHECK (level BETWEEN 1 AND 4),
    xp_reward INTEGER DEFAULT 50 CHECK (xp_reward >= 0),
    estimated_time VARCHAR(50),
    order_index INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(tenant_id, order_index)
);

CREATE INDEX idx_academy_courses_tenant ON academy_courses(tenant_id);
CREATE INDEX idx_academy_courses_level ON academy_courses(level);
CREATE INDEX idx_academy_courses_status ON academy_courses(status);

-- ==========================================
-- 2. LESSONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS academy_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    course_id UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url VARCHAR(500),
    xp_reward INTEGER DEFAULT 10 CHECK (xp_reward >= 0),
    order_index INTEGER DEFAULT 0,
    lesson_type VARCHAR(50) DEFAULT 'video' CHECK (lesson_type IN ('video', 'text', 'quiz', 'interactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(course_id, order_index)
);

CREATE INDEX idx_academy_lessons_tenant ON academy_lessons(tenant_id);
CREATE INDEX idx_academy_lessons_course ON academy_lessons(course_id);
CREATE INDEX idx_academy_lessons_type ON academy_lessons(lesson_type);

-- ==========================================
-- 3. QUIZ QUESTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS academy_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    lesson_id UUID REFERENCES academy_lessons(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- [{text: "...", isCorrect: boolean}]
    explanation TEXT,
    xp_reward INTEGER DEFAULT 5 CHECK (xp_reward >= 0),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(lesson_id, order_index)
);

CREATE INDEX idx_academy_questions_tenant ON academy_questions(tenant_id);
CREATE INDEX idx_academy_questions_lesson ON academy_questions(lesson_id);

-- ==========================================
-- 4. MISSIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS academy_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT '🎯',
    xp_reward INTEGER DEFAULT 100 CHECK (xp_reward >= 0),
    mission_type VARCHAR(50) DEFAULT 'checklist' CHECK (mission_type IN ('checklist', 'validation', 'submission')),
    type VARCHAR(50) DEFAULT 'tutorial' CHECK (type IN ('tutorial', 'livre', 'problema', 'otimizacao')),
    requirements JSONB, -- {items: [{id, text, completed, required}], validationCriteria, submissionUrl}
    deadline TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    order_index INTEGER DEFAULT 0,
    estimated_time INTEGER DEFAULT 30, -- minutos
    category VARCHAR(100),
    prerequisites JSONB, -- ["mission-id-1", "mission-id-2"]
    help_content JSONB, -- {title, tips: []}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(tenant_id, order_index)
);

CREATE INDEX idx_academy_missions_tenant ON academy_missions(tenant_id);
CREATE INDEX idx_academy_missions_type ON academy_missions(type);
CREATE INDEX idx_academy_missions_status ON academy_missions(status);

-- ==========================================
-- 5. BADGES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS academy_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100) DEFAULT '🏆',
    category VARCHAR(50) CHECK (category IN ('curso', 'missao', 'streak', 'especial')),
    requirements JSONB, -- {type, targetId, targetValue, description}
    xp_bonus INTEGER DEFAULT 0 CHECK (xp_bonus >= 0),
    rarity VARCHAR(50) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(tenant_id, name)
);

CREATE INDEX idx_academy_badges_tenant ON academy_badges(tenant_id);
CREATE INDEX idx_academy_badges_rarity ON academy_badges(rarity);
CREATE INDEX idx_academy_badges_category ON academy_badges(category);

-- ==========================================
-- 6. USER PROGRESS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS academy_user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
    current_level INTEGER DEFAULT 1 CHECK (current_level BETWEEN 1 AND 4),
    courses_completed INTEGER DEFAULT 0 CHECK (courses_completed >= 0),
    lessons_completed INTEGER DEFAULT 0 CHECK (lessons_completed >= 0),
    missions_completed INTEGER DEFAULT 0 CHECK (missions_completed >= 0),
    current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_academy_user_progress_tenant ON academy_user_progress(tenant_id);
CREATE INDEX idx_academy_user_progress_user ON academy_user_progress(user_id);
CREATE INDEX idx_academy_user_progress_level ON academy_user_progress(current_level);

-- ==========================================
-- 7. COURSE PROGRESS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS academy_course_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    course_id UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(tenant_id, user_id, course_id)
);

CREATE INDEX idx_academy_course_progress_tenant ON academy_course_progress(tenant_id);
CREATE INDEX idx_academy_course_progress_user ON academy_course_progress(user_id);
CREATE INDEX idx_academy_course_progress_course ON academy_course_progress(course_id);
CREATE INDEX idx_academy_course_progress_status ON academy_course_progress(status);

-- ==========================================
-- 8. LESSON PROGRESS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS academy_lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    lesson_id UUID REFERENCES academy_lessons(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
    video_watched_percent INTEGER DEFAULT 0 CHECK (video_watched_percent BETWEEN 0 AND 100),
    video_current_time INTEGER DEFAULT 0, -- segundos
    quiz_score INTEGER CHECK (quiz_score BETWEEN 0 AND 100),
    completed_at TIMESTAMP WITH TIME ZONE,
    xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(tenant_id, user_id, lesson_id)
);

CREATE INDEX idx_academy_lesson_progress_tenant ON academy_lesson_progress(tenant_id);
CREATE INDEX idx_academy_lesson_progress_user ON academy_lesson_progress(user_id);
CREATE INDEX idx_academy_lesson_progress_lesson ON academy_lesson_progress(lesson_id);
CREATE INDEX idx_academy_lesson_progress_status ON academy_lesson_progress(status);

-- ==========================================
-- 9. MISSION PROGRESS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS academy_mission_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    mission_id UUID REFERENCES academy_missions(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'in_progress', 'completed', 'failed', 'expired')),
    checklist_state JSONB, -- {itemId: boolean}
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
    help_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(tenant_id, user_id, mission_id)
);

CREATE INDEX idx_academy_mission_progress_tenant ON academy_mission_progress(tenant_id);
CREATE INDEX idx_academy_mission_progress_user ON academy_mission_progress(user_id);
CREATE INDEX idx_academy_mission_progress_mission ON academy_mission_progress(mission_id);
CREATE INDEX idx_academy_mission_progress_status ON academy_mission_progress(status);

-- ==========================================
-- 10. USER BADGES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS academy_user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    badge_id UUID REFERENCES academy_badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(tenant_id, user_id, badge_id)
);

CREATE INDEX idx_academy_user_badges_tenant ON academy_user_badges(tenant_id);
CREATE INDEX idx_academy_user_badges_user ON academy_user_badges(user_id);
CREATE INDEX idx_academy_user_badges_badge ON academy_user_badges(badge_id);

-- ==========================================
-- 11. XP HISTORY TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS academy_xp_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    xp_amount INTEGER NOT NULL,
    source_type VARCHAR(50) CHECK (source_type IN ('lesson', 'course', 'mission', 'badge', 'streak', 'bonus')),
    source_id UUID,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_academy_xp_history_tenant ON academy_xp_history(tenant_id);
CREATE INDEX idx_academy_xp_history_user ON academy_xp_history(user_id);
CREATE INDEX idx_academy_xp_history_source ON academy_xp_history(source_type, source_id);
CREATE INDEX idx_academy_xp_history_created ON academy_xp_history(created_at DESC);

-- ==========================================
-- 12. LEVELS TABLE (OPCIONAL)
-- ==========================================
CREATE TABLE IF NOT EXISTS academy_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    level_number INTEGER NOT NULL CHECK (level_number > 0),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20),
    xp_required INTEGER NOT NULL CHECK (xp_required >= 0),
    icon VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(tenant_id, level_number)
);

CREATE INDEX idx_academy_levels_tenant ON academy_levels(tenant_id);

-- ==========================================
-- TRIGGERS FOR UPDATED_AT
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_academy_courses_updated_at BEFORE UPDATE ON academy_courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academy_lessons_updated_at BEFORE UPDATE ON academy_lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academy_missions_updated_at BEFORE UPDATE ON academy_missions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academy_user_progress_updated_at BEFORE UPDATE ON academy_user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academy_course_progress_updated_at BEFORE UPDATE ON academy_course_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academy_lesson_progress_updated_at BEFORE UPDATE ON academy_lesson_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academy_mission_progress_updated_at BEFORE UPDATE ON academy_mission_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE academy_courses IS 'Cursos disponíveis no módulo Academy';
COMMENT ON TABLE academy_lessons IS 'Lições/aulas de cada curso';
COMMENT ON TABLE academy_questions IS 'Perguntas de quiz para lições';
COMMENT ON TABLE academy_missions IS 'Missões práticas para usuários';
COMMENT ON TABLE academy_badges IS 'Badges/conquistas disponíveis';
COMMENT ON TABLE academy_user_progress IS 'Progresso geral do usuário (XP, nível, streak)';
COMMENT ON TABLE academy_course_progress IS 'Progresso do usuário em cursos específicos';
COMMENT ON TABLE academy_lesson_progress IS 'Progresso do usuário em lições específicas';
COMMENT ON TABLE academy_mission_progress IS 'Progresso do usuário em missões específicas';
COMMENT ON TABLE academy_user_badges IS 'Badges conquistados pelos usuários';
COMMENT ON TABLE academy_xp_history IS 'Histórico de ganho de XP';
COMMENT ON TABLE academy_levels IS 'Definição dos níveis de progressão';
