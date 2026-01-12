
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserProgress, UserStats, Streak, Level } from '../types';

import { useHubContext } from '../hooks/useHubContext';
import { isSupabaseReady } from '../lib/supabase';
import { progressRepository } from '../services/progress.repository';


// Níveis default para fallback/mock
const DEFAULT_LEVELS: Level[] = [
    { id: 'level-1', levelNumber: 1, name: 'Explorador', color: '#06b6d4', icon: '🔍', xpRequired: 0, xpRange: { min: 0, max: 499 } },
    { id: 'level-2', levelNumber: 2, name: 'Conhecedor', color: '#0891b2', icon: '📚', xpRequired: 500, xpRange: { min: 500, max: 1499 } },
    { id: 'level-3', levelNumber: 3, name: 'Especialista', color: '#0e7490', icon: '🎯', xpRequired: 1500, xpRange: { min: 1500, max: 3499 } },
    { id: 'level-4', levelNumber: 4, name: 'Mestre', color: '#164e63', icon: '👑', xpRequired: 3500, xpRange: { min: 3500, max: 999999 } }
];

// Dados mockados iniciais
const INITIAL_MOCK_PROGRESS: UserProgress = {
    id: 'mock-progress-1',
    tenantId: 'mock-tenant',
    userId: 'mock-user',
    totalXp: 0,
    currentLevel: 1,
    coursesCompleted: 0,
    lessonsCompleted: 0,
    missionsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: ''
};

const INITIAL_STATS: UserStats = {
    xp: { current: 0, nextLevel: 500, percentage: 0 },
    courses: { completed: 0, inProgress: 0, total: 12 },
    missions: { completed: 0, available: 5 },
    badges: { earned: 0, total: 20 }
};

interface ProgressContextType {
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

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
    const { context, isConnected } = useHubContext();

    // Lazy init para recuperar dados imediatamente do localStorage
    const [progress, setProgress] = useState<UserProgress | null>(() => {
        const saved = localStorage.getItem('academy_progress');
        return saved ? JSON.parse(saved) : null;
    });

    const [stats, setStats] = useState<UserStats | null>(() => {
        const saved = localStorage.getItem('academy_stats');
        return saved ? JSON.parse(saved) : null;
    });

    const [streak, setStreak] = useState<Streak | null>(() => {
        const saved = localStorage.getItem('academy_streak');
        return saved ? JSON.parse(saved) : null;
    });

    const [levels, setLevels] = useState<Level[]>(DEFAULT_LEVELS);
    const [isLoading, setIsLoading] = useState(false); // Já começamos com dados se existirem
    const [error, setError] = useState<string | null>(null);

    const currentLevel = progress && levels.length > 0
        ? levels.find(l => l.levelNumber === progress.currentLevel) || levels[0]
        : null;

    const nextLevel = currentLevel && levels.length > 0
        ? levels.find(l => l.levelNumber === currentLevel.levelNumber + 1) || null
        : null;

    const fetchProgress = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
            const hasSupabase = isSupabaseReady();

            if (!useMockData && hasSupabase && isConnected && context) {
                console.log('🔄 [ProgressProvider] Buscando dados do Backend (PostgreSQL)...');

                // 1. Carregar Níveis
                try {
                    const dbLevels = await progressRepository.getLevels(context);
                    if (dbLevels && dbLevels.length > 0) {
                        const formattedLevels: Level[] = dbLevels.map(l => ({
                            id: l.id || `level-${l.level_number}`,
                            levelNumber: l.level_number,
                            name: l.name,
                            color: l.color,
                            icon: l.icon,
                            xpRequired: l.xp_required,
                            xpRange: { min: l.xp_required, max: 999999 } // Aproximado, ideal seria calcular
                        }));
                        // Ajustar max ranges
                        for (let i = 0; i < formattedLevels.length - 1; i++) {
                            formattedLevels[i].xpRange.max = formattedLevels[i + 1].xpRange.min - 1;
                        }
                        setLevels(formattedLevels);
                    } else {
                        setLevels(DEFAULT_LEVELS);
                    }
                } catch (e) {
                    console.warn('Erro ao carregar níveis, usando default', e);
                    setLevels(DEFAULT_LEVELS);
                }

                // 2. Carregar Progresso
                let dbProgress = await progressRepository.getProgress(context);

                if (!dbProgress) {
                    console.log('🆕 [ProgressProvider] Usuário novo, criando progresso inicial...');
                    // Criar perfil inicial
                    dbProgress = await progressRepository.upsertProgress(context, {
                        ...INITIAL_MOCK_PROGRESS,
                        userId: context.userId,
                        tenantId: context.tenantId,
                        lastActivityDate: new Date().toISOString()
                    });
                }

                if (dbProgress) {
                    setProgress(dbProgress);

                    // TODO: Carregar stats reais do servidor (atualmente calculado no front em parte)
                    // Por enquanto, geramos stats basico do progresso
                    const nextLvl = levels.find(l => l.levelNumber === (dbProgress?.currentLevel || 1) + 1);
                    const currLvl = levels.find(l => l.levelNumber === (dbProgress?.currentLevel || 1));

                    setStats({
                        xp: {
                            current: dbProgress.totalXp,
                            nextLevel: nextLvl?.xpRequired || 999999,
                            percentage: nextLvl && currLvl ? Math.round(((dbProgress.totalXp - currLvl.xpRequired) / (nextLvl.xpRequired - currLvl.xpRequired)) * 100) : 0
                        },
                        courses: {
                            completed: dbProgress.coursesCompleted,
                            inProgress: 0, // Precisaria buscar do courseRepository
                            total: 12
                        },
                        missions: {
                            completed: dbProgress.missionsCompleted,
                            available: 0 // Precisaria buscar do missionRepository
                        },
                        badges: { earned: 0, total: 20 }
                    });

                    setStreak({
                        current: dbProgress.currentStreak,
                        longest: dbProgress.longestStreak,
                        lastActivityDate: dbProgress.lastActivityDate || '',
                        weekHistory: await progressRepository.getStreakHistory(context)
                    });
                }

            } else {
                // MOCK LOGIC SIMPLIFICADA E UNIFICADA
                console.log('📊 [ProgressProvider] Usando dados mockados (Contexto Global)...');
                await new Promise(resolve => setTimeout(resolve, 300));

                if (levels.length === 0) setLevels(DEFAULT_LEVELS);

                // Se já temos progresso (via lazy init), não precisamos fazer nada
                // Se não temos, iniciamos com o mock padrão
                if (!progress) {
                    // Verificação de segurança: tentar ler do localStorage novamente caso o lazy init tenha falhado por algum motivo
                    // ou caso seja uma re-execução
                    const savedProgress = localStorage.getItem('academy_progress');
                    if (savedProgress) {
                        // Já deveria ter sido carregado, mas ok
                        setProgress(JSON.parse(savedProgress));
                    } else {
                        // Realmente não tem nada, iniciar do zero
                        setProgress(INITIAL_MOCK_PROGRESS);
                        setStats(INITIAL_STATS);
                        setStreak({
                            current: 0,
                            longest: 0,
                            lastActivityDate: '',
                            weekHistory: Array(7).fill(false)
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching progress:', err);
            setError('Failed to fetch progress');
            // Fallback
            if (levels.length === 0) setLevels(DEFAULT_LEVELS);
            setProgress(INITIAL_MOCK_PROGRESS);
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, context, levels.length, progress]);

    const addXp = useCallback(async (amount: number, source: string) => {
        console.log(`💫 [ProgressProvider] Adicionando ${amount} XP de ${source}`);

        const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
        const hasSupabase = isSupabaseReady();

        if (!useMockData && hasSupabase && isConnected && context) {
            // BACKEND LOGIC
            try {
                const result = await progressRepository.addXp(context, amount, 'action', undefined, source);

                // Refresh local state with result
                if (result) {
                    setProgress(prev => prev ? ({
                        ...prev,
                        totalXp: result.newTotalXp,
                        currentLevel: result.newLevel || prev.currentLevel
                    }) : null);

                    // Trigger refresh to get full updated state including streaks updated by DB trigger/logic
                    fetchProgress();

                    return { leveledUp: result.leveledUp, newLevel: result.newLevel };
                }
            } catch (e) {
                console.error('Failed to add XP remotely', e);
            }
        }

        // FALLBACK / MOCK LOGIC
        let leveledUp = false;
        let newLevelNum: number | undefined;

        // Atualizar estado global
        setProgress(prev => {
            if (!prev) return INITIAL_MOCK_PROGRESS;

            const currentLevels = levels.length > 0 ? levels : DEFAULT_LEVELS;
            const newTotalXp = prev.totalXp + amount;

            // Calc Level
            const newLevel = currentLevels.find(l => newTotalXp >= l.xpRange.min && newTotalXp <= l.xpRange.max);
            const levelChanged = newLevel && newLevel.levelNumber > prev.currentLevel;

            if (levelChanged) {
                leveledUp = true;
                newLevelNum = newLevel.levelNumber;
            }

            // Calc Streak (Mock)
            const today = new Date().toISOString().split('T')[0];
            const lastActivity = prev.lastActivityDate ? prev.lastActivityDate.split('T')[0] : '';
            let currentStreak = prev.currentStreak;

            if (lastActivity !== today) {
                if (lastActivity) { // TODO: Check consecutive days logic
                    const lastDate = new Date(lastActivity);
                    const todayDate = new Date(today);
                    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays === 1) currentStreak++;
                    else currentStreak = 1;
                } else {
                    currentStreak = 1;
                }
            }

            // Update Stats as side effect (simplified)
            setStats(prevStats => {
                if (!prevStats || !newLevel) return prevStats;
                const nextLvl = currentLevels.find(l => l.levelNumber === newLevel.levelNumber + 1);

                // Determinar se completou missão ou aula
                const isMission = source.toLowerCase().includes('missão');


                return {
                    ...prevStats,
                    xp: {
                        current: newTotalXp,
                        nextLevel: nextLvl?.xpRequired || 999999,
                        percentage: nextLvl ? Math.round(((newTotalXp - newLevel.xpRequired) / (nextLvl.xpRequired - newLevel.xpRequired)) * 100) : 100
                    },
                    missions: {
                        ...prevStats.missions,
                        completed: isMission ? prevStats.missions.completed + 1 : prevStats.missions.completed
                    },
                    courses: {
                        ...prevStats.courses,
                        // Simplificação para mock: incrementar se a fonte for "Curso: ..."
                        // Isso é disparado pelo CoursesTab quando todas as aulas são finalizadas
                        completed: source.startsWith('Curso:') ? prevStats.courses.completed + 1 : prevStats.courses.completed
                    }
                };
            });

            // Update Streak
            setStreak(prevStreak => ({
                current: currentStreak,
                longest: Math.max(prevStreak?.longest || 0, currentStreak),
                lastActivityDate: today,
                weekHistory: prevStreak?.weekHistory || []
            }));

            return {
                ...prev,
                totalXp: newTotalXp,
                currentLevel: newLevel?.levelNumber || prev.currentLevel,
                currentStreak,
                longestStreak: Math.max(prev.longestStreak, currentStreak),
                lastActivityDate: today
            };
        });

        return { leveledUp, newLevel: newLevelNum };

    }, [levels, isConnected, context, fetchProgress]);

    // Initial fetch
    useEffect(() => {
        fetchProgress();
    }, []);

    // Persistir estado mockado
    useEffect(() => {
        if (progress) localStorage.setItem('academy_progress', JSON.stringify(progress));
        if (stats) localStorage.setItem('academy_stats', JSON.stringify(stats));
        if (streak) localStorage.setItem('academy_streak', JSON.stringify(streak));
    }, [progress, stats, streak]);

    return (
        <ProgressContext.Provider value={{
            progress,
            stats,
            streak,
            currentLevel,
            nextLevel,
            isLoading,
            error,
            refreshProgress: fetchProgress,
            addXp
        }}>
            {children}
        </ProgressContext.Provider>
    );
}

export function useProgressContext() {
    const context = useContext(ProgressContext);
    if (context === undefined) {
        throw new Error('useProgressContext must be used within a ProgressProvider');
    }
    return context;
}
