/**
 * Academy Module Types
 * Tipos principais do módulo
 */

import { LucideIcon } from 'lucide-react';

// ==================== USER & PROGRESS ====================

export interface UserProgress {
    id: string;
    tenantId: string;
    userId: string;
    totalXp: number;
    currentLevel: number;
    coursesCompleted: number;
    lessonsCompleted: number;
    missionsCompleted: number;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;
}

export interface UserStats {
    xp: {
        current: number;
        nextLevel: number;
        percentage: number;
    };
    courses: {
        completed: number;
        inProgress: number;
        total: number;
    };
    missions: {
        completed: number;
        available: number;
    };
    badges: {
        earned: number;
        total: number;
    };
}

export interface Streak {
    current: number;
    longest: number;
    lastActivityDate: string;
    weekHistory: boolean[]; // últimos 7 dias
}

// ==================== LEVELS ====================

export interface Level {
    id: string;
    levelNumber: number;
    name: string;
    color: string;
    icon: string;
    xpRequired: number;
    xpRange: {
        min: number;
        max: number;
    };
}

export const DEFAULT_LEVELS: Level[] = [
    {
        id: 'level-1',
        levelNumber: 1,
        name: 'Explorador',
        color: '#06b6d4',
        icon: '🔍',
        xpRequired: 0,
        xpRange: { min: 0, max: 499 }
    },
    {
        id: 'level-2',
        levelNumber: 2,
        name: 'Conhecedor',
        color: '#0891b2',
        icon: '📚',
        xpRequired: 500,
        xpRange: { min: 500, max: 1499 }
    },
    {
        id: 'level-3',
        levelNumber: 3,
        name: 'Especialista',
        color: '#0e7490',
        icon: '🎯',
        xpRequired: 1500,
        xpRange: { min: 1500, max: 3499 }
    },
    {
        id: 'level-4',
        levelNumber: 4,
        name: 'Mestre',
        color: '#164e63',
        icon: '👑',
        xpRequired: 3500,
        xpRange: { min: 3500, max: 999999 }
    }
];

// ==================== COURSES ====================

export interface Course {
    id: string;
    tenantId: string;
    title: string;
    description: string;
    icon: string;
    level: number;
    xpReward: number;
    estimatedTime: string;
    orderIndex: number;
    status: CourseStatus;
    lessons: Lesson[];
}

export type CourseStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface CourseProgress {
    courseId: string;
    status: CourseStatus;
    progressPercent: number;
    startedAt?: string;
    completedAt?: string;
    xpEarned: number;
}

// ==================== LESSONS ====================

export interface Lesson {
    id: string;
    courseId: string;
    title: string;
    content?: string;
    videoUrl?: string;
    xpReward: number;
    orderIndex: number;
    lessonType: LessonType;
    questions?: QuizQuestion[];
}

export type LessonType = 'video' | 'text' | 'quiz' | 'interactive';

export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'not_started';

export interface LessonProgress {
    lessonId: string;
    status: LessonStatus;
    videoWatchedPercent: number;
    videoCurrentTime?: number;
    quizScore?: number;
    completedAt?: string;
    xpEarned: number;
}

// ==================== QUIZ ====================

export interface QuizQuestion {
    id: string;
    lessonId: string;
    question: string;
    options: QuizOption[];
    explanation?: string;
    xpReward: number;
    orderIndex: number;
}

export interface QuizOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

// ==================== MISSIONS ====================

export interface Mission {
    id: string;
    tenantId?: string;
    title: string;
    description: string;
    icon?: string;
    xpReward: number;
    type: 'tutorial' | 'livre' | 'problema' | 'otimizacao';
    missionType?: MissionType; // Backward compatibility
    requirements: MissionRequirements;
    deadline?: string;
    status: MissionStatus;
    order: number;
    estimatedTime: number; // em minutos
    category: string;
    prerequisites?: string[]; // IDs de missões que devem ser completadas antes
    helpContent?: MissionHelpContent;
}

export type MissionType = 'checklist' | 'validation' | 'submission';

export type MissionStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'failed' | 'expired';

export interface MissionRequirements {
    items: MissionChecklistItem[];
    validationCriteria?: string;
    submissionUrl?: string;
}

export interface MissionChecklistItem {
    id: string;
    text: string;
    completed: boolean;
    required: boolean; // Indica se o item é obrigatório para completar a missão
}

export interface MissionHelpContent {
    title: string;
    tips: string[];
}

export interface MissionProgress {
    missionId: string;
    status: MissionStatus;
    checklistItems: ChecklistItem[];
    checklistState?: Record<string, boolean>; // Backward compatibility
    startedAt?: string;
    completedAt?: string;
    xpEarned?: number;
    helpUsed: boolean;
}

export interface ChecklistItem {
    id: string;
    completed: boolean;
}

// ==================== BADGES ====================

export interface Badge {
    id: string;
    tenantId: string;
    name: string;
    description: string;
    icon: string;
    category: BadgeCategory;
    requirements: BadgeRequirements;
    xpBonus: number;
    rarity: BadgeRarity;
}

export type BadgeCategory = 'curso' | 'missao' | 'streak' | 'especial';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BadgeRequirements {
    type: 'course_complete' | 'mission_complete' | 'streak' | 'xp_total' | 'custom';
    targetId?: string;
    targetValue?: number;
    description: string;
}

export interface UserBadge {
    badgeId: string;
    earnedAt: string;
}

// ==================== XP HISTORY ====================

export interface XPHistoryEntry {
    id: string;
    userId: string;
    xpAmount: number;
    sourceType: XPSourceType;
    sourceId?: string;
    description: string;
    createdAt: string;
}

export type XPSourceType = 'lesson' | 'course' | 'mission' | 'badge' | 'streak' | 'bonus';

// ==================== MODULE CONFIG ====================

export interface ModuleTab {
    id: string;
    label: string;
    icon: LucideIcon;
    order: number;
    color?: string;
    badge?: number;
    disabled?: boolean;
}

export interface ModuleColors {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
}

export interface AcademyModuleConfig {
    id: string;
    name: string;
    title: string;
    description: string;
    version: string;
    icon: LucideIcon;
    tabs: ModuleTab[];
    colors: ModuleColors;
    searchConfig: {
        placeholder: string;
        categories: string[];
        searchFields: string[];
    };
}

// ==================== NOTIFICATIONS ====================

export interface AcademyNotification {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info' | 'xp' | 'badge' | 'level';
    title: string;
    message: string;
    icon?: string;
    data?: Record<string, unknown>;
    duration?: number;
    createdAt: string;
}

// ==================== API RESPONSES ====================

export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
