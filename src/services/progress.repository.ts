/**
 * Progress Repository
 * Gerencia operações de progresso do usuário no PostgreSQL
 */

import type { UserProgress, XPHistoryEntry } from '../types';
import { BaseRepository, RepositoryContext } from './base.repository';

export class ProgressRepository extends BaseRepository {
    /**
     * Buscar progresso do usuário
     */
    async getProgress(context: RepositoryContext): Promise<UserProgress | null> {
        try {
            return await this.withContext(context, async () => {
                const { data, error } = await this.supabase
                    .from('academy_user_progress')
                    .select('*')
                    .eq('tenant_id', context.tenantId)
                    .eq('user_id', context.userId)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') {
                        // No rows returned - usuário ainda não tem progresso
                        return null;
                    }
                    throw error;
                }

                return this.mapToUserProgress(data);
            });
        } catch (error) {
            this.handleError(error, 'getProgress');
        }
    }

    /**
     * Criar ou atualizar progresso do usuário
     */
    async upsertProgress(
        context: RepositoryContext,
        progress: Partial<UserProgress>
    ): Promise<UserProgress> {
        try {
            return await this.withContext(context, async () => {
                const { data, error } = await this.supabase
                    .from('academy_user_progress')
                    .upsert({
                        tenant_id: context.tenantId,
                        user_id: context.userId,
                        total_xp: progress.totalXp,
                        current_level: progress.currentLevel,
                        courses_completed: progress.coursesCompleted,
                        lessons_completed: progress.lessonsCompleted,
                        missions_completed: progress.missionsCompleted,
                        current_streak: progress.currentStreak,
                        longest_streak: progress.longestStreak,
                        last_activity_date: progress.lastActivityDate,
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (error) throw error;
                return this.mapToUserProgress(data);
            });
        } catch (error) {
            this.handleError(error, 'upsertProgress');
        }
    }

    /**
     * Adicionar XP ao usuário
     */
    async addXp(
        context: RepositoryContext,
        amount: number,
        sourceType: string,
        sourceId?: string,
        description?: string
    ): Promise<{ newTotalXp: number; leveledUp: boolean; newLevel?: number }> {
        try {
            return await this.withContext(context, async () => {
                // Buscar progresso atual
                const currentProgress = await this.getProgress(context);

                if (!currentProgress) {
                    throw new Error('User progress not found');
                }

                // Calcular novo Streak
                const today = new Date().toISOString().split('T')[0];
                const lastActivity = currentProgress.lastActivityDate ? currentProgress.lastActivityDate.split('T')[0] : null;

                let currentStreak = currentProgress.currentStreak;
                let longestStreak = currentProgress.longestStreak;

                if (lastActivity !== today) {
                    if (lastActivity) {
                        const lastDate = new Date(lastActivity);
                        const todayDate = new Date(today);
                        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

                        if (diffDays === 1) {
                            currentStreak++;
                        } else {
                            currentStreak = 1;
                        }
                    } else {
                        currentStreak = 1;
                    }

                    if (currentStreak > longestStreak) {
                        longestStreak = currentStreak;
                    }
                }

                const newTotalXp = currentProgress.totalXp + amount;

                // Usar cálculo dinâmico de nível
                const newLevel = await this.calculateLevelDynamic(context, newTotalXp);
                const leveledUp = newLevel > currentProgress.currentLevel;

                // Atualizar progresso com Streak e XP
                await this.upsertProgress(context, {
                    ...currentProgress,
                    totalXp: newTotalXp,
                    currentLevel: newLevel,
                    currentStreak,
                    longestStreak,
                    lastActivityDate: today
                });

                // Registrar no histórico de XP
                await this.supabase.from('academy_xp_history').insert({
                    tenant_id: context.tenantId,
                    user_id: context.userId,
                    xp_amount: amount,
                    source_type: sourceType,
                    source_id: sourceId,
                    description: description || `Ganhou ${amount} XP`
                });

                return { newTotalXp, leveledUp, newLevel: leveledUp ? newLevel : undefined };
            });
        } catch (error) {
            this.handleError(error, 'addXp');
        }
    }

    /**
     * Buscar histórico de XP
     */
    async getXpHistory(
        context: RepositoryContext,
        limit: number = 50
    ): Promise<XPHistoryEntry[]> {
        try {
            return await this.withContext(context, async () => {
                const { data, error } = await this.supabase
                    .from('academy_xp_history')
                    .select('*')
                    .eq('tenant_id', context.tenantId)
                    .eq('user_id', context.userId)
                    .order('created_at', { ascending: false })
                    .limit(limit);

                if (error) throw error;

                return (data || []).map(this.mapToXpHistory);
            });
        } catch (error) {
            this.handleError(error, 'getXpHistory');
        }
    }

    /**
     * Atualizar streak do usuário
     */
    async updateStreak(context: RepositoryContext): Promise<{ current: number; longest: number }> {
        try {
            return await this.withContext(context, async () => {
                const progress = await this.getProgress(context);
                if (!progress) {
                    throw new Error('User progress not found');
                }

                // Recalcular streak baseado no histórico
                const { current, longest } = await this.calculateStreakFromHistory(context);

                // Se mudou algo, atualizar
                if (current !== progress.currentStreak || longest !== progress.longestStreak) {
                    await this.upsertProgress(context, {
                        ...progress,
                        currentStreak: current,
                        longestStreak: longest,
                        lastActivityDate: new Date().toISOString().split('T')[0]
                    });
                }

                return { current, longest };
            });
        } catch (error) {
            this.handleError(error, 'updateStreak');
        }
    }

    /**
     * Buscar níveis configurados (com Lazy Seeding)
     */
    async getLevels(context: RepositoryContext): Promise<any[]> {
        try {
            return await this.withContext(context, async () => {
                // Tentar buscar níveis do banco
                const { data, error } = await this.supabase
                    .from('academy_levels')
                    .select('*')
                    .eq('tenant_id', context.tenantId)
                    .order('level_number');

                if (error) throw error;

                // Se não houver níveis, fazer seed inicial para este tenant
                if (!data || data.length === 0) {
                    console.log('⚠️ [Academy] Níveis não encontrados. Realizando seed inicial...');
                    return await this.seedDefaultLevels(context);
                }

                return data;
            });
        } catch (error) {
            this.handleError(error, 'getLevels');
            return []; // Fallback seguro
        }
    }

    /**
     * Seed de níveis padrão para um novo tenant
     */
    private async seedDefaultLevels(context: RepositoryContext): Promise<any[]> {
        const defaultLevels = [
            { level_number: 1, name: 'Explorador', color: '#06b6d4', xp_required: 0, icon: '🔍' },
            { level_number: 2, name: 'Conhecedor', color: '#0891b2', xp_required: 500, icon: '📚' },
            { level_number: 3, name: 'Especialista', color: '#0e7490', xp_required: 1500, icon: '🎯' },
            { level_number: 4, name: 'Mestre', color: '#164e63', xp_required: 3500, icon: '👑' }
        ];

        try {
            const { data, error } = await this.supabase
                .from('academy_levels')
                .insert(
                    defaultLevels.map(lvl => ({
                        ...lvl,
                        tenant_id: context.tenantId
                    }))
                )
                .select();

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('❌ [Academy] Falha ao criar níveis padrão:', err);
            // Retornar defaults em memória se falhar insert (ex: permissão)
            return defaultLevels.map(lvl => ({ ...lvl, id: 'temp-' + lvl.level_number }));
        }
    }

    /**
     * Calcular streak real baseado no histórico de XP
     */
    private async calculateStreakFromHistory(context: RepositoryContext): Promise<{ current: number; longest: number }> {
        // Buscar dias únicos com atividade nos últimos 365 dias
        const { data, error } = await this.supabase
            .from('academy_xp_history')
            .select('created_at')
            .eq('tenant_id', context.tenantId)
            .eq('user_id', context.userId)
            .order('created_at', { ascending: false })
            .limit(1000);

        if (error || !data) return { current: 0, longest: 0 };

        // Extrair datas únicas (YYYY-MM-DD)
        const activityDates = Array.from(new Set(
            data.map(entry => new Date(entry.created_at).toISOString().split('T')[0])
        )).sort((a, b) => b.localeCompare(a)); // Mais recente primeiro

        if (activityDates.length === 0) return { current: 0, longest: 0 };

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Verificar se atividade mais recente é hoje ou ontem
        const lastActivity = activityDates[0];
        let currentStreak = 0;

        if (lastActivity === today || lastActivity === yesterday) {
            currentStreak = 1;
            let checkDate = new Date(lastActivity);

            // Iterar para trás contando dias consecutivos
            for (let i = 1; i < activityDates.length; i++) {
                checkDate.setDate(checkDate.getDate() - 1);
                const expectedDate = checkDate.toISOString().split('T')[0];

                if (activityDates[i] === expectedDate) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }

        // TODO: Calcular longest streak iterando todo histórico (simplificado por enquanto)
        // Para MVP, assumimos que o longest atual do banco é válido se for maior que o current calculado
        // Em um sistema real, recalcularíamos tudo.

        return {
            current: currentStreak,
            longest: currentStreak // Simplificação temporária, ajustaremos no addXP
        };
    }

    /**
     * Buscar histórico recente (últimos 7 dias) para gráfico de streak
     */
    async getStreakHistory(context: RepositoryContext): Promise<boolean[]> {
        try {
            return await this.withContext(context, async () => {
                const { data } = await this.supabase
                    .from('academy_xp_history')
                    .select('created_at')
                    .eq('tenant_id', context.tenantId)
                    .eq('user_id', context.userId)
                    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

                const activitySet = new Set(
                    (data || []).map(d => new Date(d.created_at).toISOString().split('T')[0])
                );

                const weekHistory: boolean[] = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    weekHistory.push(activitySet.has(date));
                }

                return weekHistory;
            });
        } catch (error) {
            return [false, false, false, false, false, false, false];
        }
    }

    // ==================== HELPERS ====================

    /**
     * Calcular nível baseado no XP total e níveis do banco
     */
    private async calculateLevelDynamic(context: RepositoryContext, totalXp: number): Promise<number> {
        const levels = await this.getLevels(context);
        const sortedLevels = levels.sort((a, b) => b.level_number - a.level_number); // Decrescente

        for (const level of sortedLevels) {
            if (totalXp >= level.xp_required) {
                return level.level_number;
            }
        }
        return 1;
    }

    /**
     * Mapear dados do banco para UserProgress
     */
    private mapToUserProgress(data: any): UserProgress {
        return {
            id: data.id,
            tenantId: data.tenant_id,
            userId: data.user_id,
            totalXp: data.total_xp,
            currentLevel: data.current_level,
            coursesCompleted: data.courses_completed,
            lessonsCompleted: data.lessons_completed,
            missionsCompleted: data.missions_completed,
            currentStreak: data.current_streak,
            longestStreak: data.longest_streak,
            lastActivityDate: data.last_activity_date
        };
    }

    /**
     * Mapear dados do banco para XPHistoryEntry
     */
    private mapToXpHistory(data: any): XPHistoryEntry {
        return {
            id: data.id,
            userId: data.user_id,
            xpAmount: data.xp_amount,
            sourceType: data.source_type,
            sourceId: data.source_id,
            description: data.description,
            createdAt: data.created_at
        };
    }
}

// Export singleton instance
export const progressRepository = new ProgressRepository();
