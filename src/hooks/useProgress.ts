/**
 * Academy Module - useProgress Hook
 * 
 * Hook para gerenciar progresso do usuário
 * Integra com API do Hub e dados locais
 */

import { useState, useEffect, useCallback } from 'react';
import { useHubContext } from './useHubContext';
import type { UserProgress, UserStats, Streak, Level } from '../types';
import { progressRepository } from '../services';
import { isSupabaseReady } from '../lib/supabase';

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

// Níveis definidos como constante global para evitar recreação
const LEVELS: Level[] = [
    { id: 'level-1', levelNumber: 1, name: 'Explorador', color: '#06b6d4', icon: '🔍', xpRequired: 0, xpRange: { min: 0, max: 499 } },
    { id: 'level-2', levelNumber: 2, name: 'Conhecedor', color: '#0891b2', icon: '📚', xpRequired: 500, xpRange: { min: 500, max: 1499 } },
    { id: 'level-3', levelNumber: 3, name: 'Especialista', color: '#0e7490', icon: '🎯', xpRequired: 1500, xpRange: { min: 1500, max: 3499 } },
    { id: 'level-4', levelNumber: 4, name: 'Mestre', color: '#164e63', icon: '👑', xpRequired: 3500, xpRange: { min: 3500, max: 999999 } }
];

export function useProgress(): UseProgressReturn {
    const { context, isConnected } = useHubContext();
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [streak, setStreak] = useState<Streak | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentLevel = progress
        ? LEVELS.find(l => l.levelNumber === progress.currentLevel) || LEVELS[0]
        : null;

    const nextLevel = currentLevel && currentLevel.levelNumber < 4
        ? LEVELS.find(l => l.levelNumber === currentLevel.levelNumber + 1) || null
        : null;

    const fetchProgress = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Verificar se deve usar PostgreSQL
            const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
            const hasSupabase = isSupabaseReady();

            if (!useMockData && hasSupabase && isConnected && context) {
                // Usar PostgreSQL
                console.log('📊 [Academy] Carregando progresso do PostgreSQL...');

                const progressData = await progressRepository.getProgress({
                    tenantId: context.tenantId,
                    userId: context.userId
                });

                if (progressData) {
                    setProgress(progressData);

                    // Calcular stats baseado no progresso
                    const currentLvl = LEVELS.find(l => l.levelNumber === progressData.currentLevel) || LEVELS[0];
                    const nextLvl = LEVELS.find(l => l.levelNumber === currentLvl.levelNumber + 1);

                    setStats({
                        xp: {
                            current: progressData.totalXp,
                            nextLevel: nextLvl?.xpRequired || 999999,
                            percentage: nextLvl
                                ? Math.round(((progressData.totalXp - currentLvl.xpRequired) / (nextLvl.xpRequired - currentLvl.xpRequired)) * 100)
                                : 100
                        },
                        courses: {
                            completed: progressData.coursesCompleted,
                            inProgress: 0, // TODO: calcular
                            total: 0 // TODO: buscar do banco
                        },
                        missions: {
                            completed: progressData.missionsCompleted,
                            available: 0 // TODO: buscar do banco
                        },
                        badges: {
                            earned: 0, // TODO: buscar do banco
                            total: 0 // TODO: buscar do banco
                        }
                    });

                    setStreak({
                        current: progressData.currentStreak,
                        longest: progressData.longestStreak,
                        lastActivityDate: progressData.lastActivityDate,
                        weekHistory: [] // TODO: calcular dos últimos 7 dias
                    });
                } else {
                    // Criar progresso inicial
                    console.log('📊 [Academy] Criando progresso inicial...');
                    const initialProgress = await progressRepository.upsertProgress(
                        {
                            tenantId: context.tenantId,
                            userId: context.userId
                        },
                        {
                            totalXp: 0,
                            currentLevel: 1,
                            coursesCompleted: 0,
                            lessonsCompleted: 0,
                            missionsCompleted: 0,
                            currentStreak: 0,
                            longestStreak: 0,
                            lastActivityDate: new Date().toISOString().split('T')[0]
                        }
                    );
                    setProgress(initialProgress);
                }
            } else {
                // Usar dados mockados
                console.log('📊 [Academy] Usando dados mockados...');
                await new Promise(resolve => setTimeout(resolve, 300));
                setProgress(MOCK_PROGRESS);
                setStats(MOCK_STATS);
                setStreak(MOCK_STREAK);
            }
        } catch (err) {
            console.error('❌ [Academy] Erro ao carregar progresso:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar progresso');

            // Fallback para mocks em caso de erro
            console.log('📊 [Academy] Fallback para dados mockados após erro');
            setProgress(MOCK_PROGRESS);
            setStats(MOCK_STATS);
            setStreak(MOCK_STREAK);
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, context]);

    const addXp = useCallback(async (amount: number, source: string) => {
        if (!progress) {
            return { leveledUp: false };
        }

        try {
            const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
            const hasSupabase = isSupabaseReady();

            if (!useMockData && hasSupabase && isConnected && context) {
                // Usar PostgreSQL
                console.log(`💫 [Academy] Adicionando ${amount} XP via PostgreSQL...`);

                const result = await progressRepository.addXp(
                    {
                        tenantId: context.tenantId,
                        userId: context.userId
                    },
                    amount,
                    source,
                    undefined,
                    `Ganhou ${amount} XP de ${source}`
                );

                // Atualizar estado local
                setProgress(prev => prev ? {
                    ...prev,
                    totalXp: result.newTotalXp,
                    currentLevel: result.newLevel || prev.currentLevel
                } : null);

                // Atualizar stats
                if (result.newLevel && stats) {
                    const newLevelData = LEVELS.find(l => l.levelNumber === result.newLevel);
                    const nextLvl = LEVELS.find(l => l.levelNumber === (result.newLevel || 0) + 1);

                    if (newLevelData) {
                        setStats(prev => prev ? {
                            ...prev,
                            xp: {
                                current: result.newTotalXp,
                                nextLevel: nextLvl?.xpRequired || 999999,
                                percentage: nextLvl
                                    ? Math.round(((result.newTotalXp - newLevelData.xpRequired) / (nextLvl.xpRequired - newLevelData.xpRequired)) * 100)
                                    : 100
                            }
                        } : null);
                    }
                }

                return {
                    leveledUp: result.leveledUp,
                    newLevel: result.newLevel
                };
            } else {
                // Usar mock (modo local)
                console.log(`💫 [Academy] Adicionando ${amount} XP (mock)...`);

                const newTotalXp = progress.totalXp + amount;

                // Verificar se subiu de level
                const newLevel = LEVELS.find(l => newTotalXp >= l.xpRange.min && newTotalXp <= l.xpRange.max);
                const leveledUp = newLevel && newLevel.levelNumber > progress.currentLevel;

                // Atualizar estado local
                setProgress(prev => prev ? {
                    ...prev,
                    totalXp: newTotalXp,
                    currentLevel: newLevel?.levelNumber || prev.currentLevel
                } : null);

                // Atualizar stats
                if (stats && newLevel) {
                    const nextLvl = LEVELS.find(l => l.levelNumber === newLevel.levelNumber + 1);
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

                return {
                    leveledUp: leveledUp || false,
                    newLevel: leveledUp ? newLevel?.levelNumber : undefined
                };
            }
        } catch (err) {
            console.error('❌ [Academy] Erro ao adicionar XP:', err);
            throw err;
        }
    }, [progress, stats, isConnected, context]);

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
