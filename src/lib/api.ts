/**
 * Academy Module - API Client
 * 
 * Cliente para chamar API routes do Hub.App
 * Usa JWT token para autenticação
 */

import type { HubContext } from '../main';

export class AcademyAPI {
    private apiUrl: string;
    private apiToken: string;

    constructor(context: HubContext) {
        this.apiUrl = context.apiUrl;
        this.apiToken = context.apiToken;
    }

    /**
     * Request genérico com autenticação
     */
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.apiUrl}${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(url, { ...options, headers });

        // Token expirado
        if (response.status === 401) {
            console.warn('⚠️ [Academy] Token expirado, solicitando novo token ao Hub...');
            window.parent.postMessage({ type: 'hubapp:refresh-token' }, '*');
            throw new Error('Token expirado. Faça login novamente.');
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        return response.json();
    }

    // ==================== PROGRESS ====================

    /**
     * Buscar progresso do usuário
     */
    async getProgress() {
        return this.request<{
            totalXp: number;
            currentLevel: number;
            coursesCompleted: number;
            lessonsCompleted: number;
            missionsCompleted: number;
            currentStreak: number;
            longestStreak: number;
        }>('/api/modules/academy/progress');
    }

    /**
     * Adicionar XP ao usuário
     */
    async addXp(data: { amount: number; sourceType: string; sourceId?: string; description?: string }) {
        return this.request<{ newTotalXp: number; leveledUp: boolean; newLevel?: number }>(
            '/api/modules/academy/progress/xp',
            { method: 'POST', body: JSON.stringify(data) }
        );
    }

    // ==================== COURSES ====================

    /**
     * Listar cursos disponíveis
     */
    async getCourses(filters?: { level?: number; status?: string }) {
        const params = new URLSearchParams(filters as Record<string, string>).toString();
        return this.request<{ courses: Course[] }>(`/api/modules/academy/courses?${params}`);
    }

    /**
     * Buscar detalhes de um curso
     */
    async getCourse(courseId: string) {
        return this.request<{ course: Course }>(`/api/modules/academy/courses/${courseId}`);
    }

    /**
     * Buscar lições de um curso
     */
    async getCourseLessons(courseId: string) {
        return this.request<{ lessons: Lesson[] }>(`/api/modules/academy/courses/${courseId}/lessons`);
    }

    /**
     * Marcar lição como completa
     */
    async completeLesson(lessonId: string, data?: { quizScore?: number }) {
        return this.request<{ xpEarned: number; courseCompleted: boolean }>(
            `/api/modules/academy/lessons/${lessonId}/complete`,
            { method: 'POST', body: JSON.stringify(data || {}) }
        );
    }

    // ==================== MISSIONS ====================

    /**
     * Listar missões disponíveis
     */
    async getMissions(filters?: { status?: string }) {
        const params = new URLSearchParams(filters as Record<string, string>).toString();
        return this.request<{ missions: Mission[] }>(`/api/modules/academy/missions?${params}`);
    }

    /**
     * Buscar detalhes de uma missão
     */
    async getMission(missionId: string) {
        return this.request<{ mission: Mission }>(`/api/modules/academy/missions/${missionId}`);
    }

    /**
     * Atualizar progresso de checklist
     */
    async updateMissionProgress(missionId: string, checklistState: Record<string, boolean>) {
        return this.request<{ progress: number }>(
            `/api/modules/academy/missions/${missionId}/progress`,
            { method: 'POST', body: JSON.stringify({ checklistState }) }
        );
    }

    /**
     * Completar missão
     */
    async completeMission(missionId: string) {
        return this.request<{ xpEarned: number; badgeUnlocked?: Badge }>(
            `/api/modules/academy/missions/${missionId}/complete`,
            { method: 'POST' }
        );
    }

    // ==================== BADGES ====================

    /**
     * Listar badges do usuário
     */
    async getBadges() {
        return this.request<{ badges: Badge[]; earnedBadges: string[] }>('/api/modules/academy/badges');
    }

    /**
     * Reivindicar badge
     */
    async claimBadge(badgeId: string) {
        return this.request<{ success: boolean; xpBonus: number }>(
            `/api/modules/academy/badges/${badgeId}/claim`,
            { method: 'POST' }
        );
    }
}

// ==================== TYPES ====================

export interface Course {
    id: string;
    title: string;
    description: string;
    icon: string;
    level: number;
    xpReward: number;
    estimatedTime: string;
    status: 'locked' | 'available' | 'in_progress' | 'completed';
    progress: number;
    lessonsCount: number;
    completedLessons: number;
}

export interface Lesson {
    id: string;
    courseId: string;
    title: string;
    content?: string;
    videoUrl?: string;
    xpReward: number;
    lessonType: 'video' | 'text' | 'quiz' | 'interactive';
    status: 'locked' | 'available' | 'in_progress' | 'completed';
    videoWatchedPercent: number;
    quizScore?: number;
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    icon: string;
    xpReward: number;
    missionType: 'checklist' | 'validation' | 'submission';
    requirements: {
        items: { id: string; text: string; completed: boolean }[];
    };
    deadline?: string;
    status: 'available' | 'in_progress' | 'completed' | 'failed';
    progress: number;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'curso' | 'missao' | 'streak' | 'especial';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    xpBonus: number;
    earned: boolean;
    earnedDate?: string;
}

// ==================== HELPER ====================

let apiInstance: AcademyAPI | null = null;

/**
 * Retorna instância da API (cria se necessário)
 */
export function getAPI(): AcademyAPI {
    if (!apiInstance && window.hubContext) {
        apiInstance = new AcademyAPI(window.hubContext);
    }
    if (!apiInstance) {
        throw new Error('API não inicializada. Aguarde conexão com o Hub.');
    }
    return apiInstance;
}

/**
 * Inicializa a API com contexto
 */
export function initializeAPI(context: HubContext): AcademyAPI {
    apiInstance = new AcademyAPI(context);
    return apiInstance;
}
