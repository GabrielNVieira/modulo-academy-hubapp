/**
 * Academy Module - useProgress Hook
 * 
 * Hook para gerenciar progresso do usuário
 * Integra com API do Hub e dados locais
 */

import { useState, useEffect, useCallback } from 'react';
import { useHubContext } from './useHubContext';
import type { UserProgress, UserStats, Streak, Level, DEFAULT_LEVELS } from '../types';

// Dados mockados para desenvolvimento
const MOCK_PROGRESS: UserProgress = {
    id: 'mock-progress-1',
    tenantId: 'mock-tenant',
    userId: 'mock-user',
    totalXp: 850,
    currentLevel: 2,
    coursesCompleted: 4,
    lessonsCompleted: 16,
    missionsCompleted: 3,
    currentStreak: 5,
    longestStreak: 12,
    lastActivityDate: new Date().toISOString()
};

const MOCK_STATS: UserStats = {
    xp: {
        current: 850,
        nextLevel: 1500,
        percentage: 57
    },
    courses: {
        completed: 4,
        inProgress: 2,
        total: 12
    },
    missions: {
        completed: 3,
        available: 5
    },
    badges: {
        earned: 6,
        total: 20
    }
};

const MOCK_STREAK: Streak = {
    current: 5,
    longest: 12,
    lastActivityDate: new Date().toISOString(),
    weekHistory: [true, true, true, false, true, true, true]
};

interface UseProgressReturn {
    progress: UserProgress | null;
    stats: UserStats | null;
    streak: Streak | null;
    currentLevel: Level | null;
    nextLevel: Level | null;
    isLoading: boolean;
    error: string | null;
    refreshProgress: () => Promise<void>;
    addXp: (amount: number, source: string) => Promise<{ leveledUp: boolean; newLevel?: number }>;
}

export function useProgress(): UseProgressReturn {
    const { context, isConnected } = useHubContext();
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [streak, setStreak] = useState<Streak | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Níveis padrão
    const levels: Level[] = [
        { id: 'level-1', levelNumber: 1, name: 'Explorador', color: '#06b6d4', icon: '🔍', xpRequired: 0, xpRange: { min: 0, max: 499 } },
        { id: 'level-2', levelNumber: 2, name: 'Conhecedor', color: '#0891b2', icon: '📚', xpRequired: 500, xpRange: { min: 500, max: 1499 } },
        { id: 'level-3', levelNumber: 3, name: 'Especialista', color: '#0e7490', icon: '🎯', xpRequired: 1500, xpRange: { min: 1500, max: 3499 } },
        { id: 'level-4', levelNumber: 4, name: 'Mestre', color: '#164e63', icon: '👑', xpRequired: 3500, xpRange: { min: 3500, max: 999999 } }
    ];

    const currentLevel = progress
        ? levels.find(l => l.levelNumber === progress.currentLevel) || levels[0]
        : null;

    const nextLevel = currentLevel && currentLevel.levelNumber < 4
        ? levels.find(l => l.levelNumber === currentLevel.levelNumber + 1) || null
        : null;

    const fetchProgress = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (isConnected && context) {
                // TODO: Chamar API real quando implementada
                // const api = new AcademyAPI(context);
                // const data = await api.getProgress();
                // setProgress(data);

                // Por enquanto, usar dados mockados
                await new Promise(resolve => setTimeout(resolve, 500));
                setProgress(MOCK_PROGRESS);
                setStats(MOCK_STATS);
                setStreak(MOCK_STREAK);
            } else {
                // Modo standalone (desenvolvimento)
                await new Promise(resolve => setTimeout(resolve, 300));
                setProgress(MOCK_PROGRESS);
                setStats(MOCK_STATS);
                setStreak(MOCK_STREAK);
            }
        } catch (err) {
            console.error('❌ [Academy] Erro ao carregar progresso:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar progresso');
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, context]);

    const addXp = useCallback(async (amount: number, source: string) => {
        if (!progress) {
            return { leveledUp: false };
        }

        try {
            const newTotalXp = progress.totalXp + amount;

            // Verificar se subiu de level
            const newLevel = levels.find(l => newTotalXp >= l.xpRange.min && newTotalXp <= l.xpRange.max);
            const leveledUp = newLevel && newLevel.levelNumber > progress.currentLevel;

            // Atualizar estado local
            setProgress(prev => prev ? {
                ...prev,
                totalXp: newTotalXp,
                currentLevel: newLevel?.levelNumber || prev.currentLevel
            } : null);

            // Atualizar stats
            if (stats && newLevel) {
                const nextLvl = levels.find(l => l.levelNumber === newLevel.levelNumber + 1);
                setStats(prev => prev ? {
                    ...prev,
                    xp: {
                        current: newTotalXp,
                        nextLevel: nextLvl?.xpRequired || 999999,
                        percentage: nextLvl
                            ? Math.round(((newTotalXp - newLevel.xpRequired) / (nextLvl.xpRequired - newLevel.xpRequired)) * 100)
                            : 100
                    }
                } : null);
            }

            // TODO: Chamar API real
            // if (isConnected && context) {
            //   const api = new AcademyAPI(context);
            //   await api.addXp({ amount, sourceType: source });
            // }

            return {
                leveledUp: leveledUp || false,
                newLevel: leveledUp ? newLevel?.levelNumber : undefined
            };
        } catch (err) {
            console.error('❌ [Academy] Erro ao adicionar XP:', err);
            throw err;
        }
    }, [progress, stats, levels]);

    useEffect(() => {
        fetchProgress();
    }, [fetchProgress]);

    return {
        progress,
        stats,
        streak,
        currentLevel,
        nextLevel,
        isLoading,
        error,
        refreshProgress: fetchProgress,
        addXp
    };
}
