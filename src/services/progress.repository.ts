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

                const newTotalXp = currentProgress.totalXp + amount;
                const newLevel = this.calculateLevel(newTotalXp);
                const leveledUp = newLevel > currentProgress.currentLevel;

                // Atualizar progresso
                await this.upsertProgress(context, {
                    ...currentProgress,
                    totalXp: newTotalXp,
                    currentLevel: newLevel,
                    lastActivityDate: new Date().toISOString().split('T')[0]
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

                const today = new Date().toISOString().split('T')[0];
                const lastActivity = progress.lastActivityDate;

                let currentStreak = progress.currentStreak;
                let longestStreak = progress.longestStreak;

                // Verificar se a atividade é consecutiva
                if (lastActivity) {
                    const lastDate = new Date(lastActivity);
                    const todayDate = new Date(today);
                    const diffDays = Math.floor(
                        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
                    );

                    if (diffDays === 0) {
                        // Mesma data, não atualiza streak
                        return { current: currentStreak, longest: longestStreak };
                    } else if (diffDays === 1) {
                        // Dia consecutivo, incrementa streak
                        currentStreak++;
                    } else {
                        // Quebrou o streak
                        currentStreak = 1;
                    }
                } else {
                    currentStreak = 1;
                }

                // Atualizar longest streak se necessário
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                }

                // Salvar no banco
                await this.upsertProgress(context, {
                    ...progress,
                    currentStreak,
                    longestStreak,
                    lastActivityDate: today
                });

                return { current: currentStreak, longest: longestStreak };
            });
        } catch (error) {
            this.handleError(error, 'updateStreak');
        }
    }

    // ==================== HELPERS ====================

    /**
     * Calcular nível baseado no XP total
     */
    private calculateLevel(totalXp: number): number {
        if (totalXp >= 3500) return 4; // Mestre
        if (totalXp >= 1500) return 3; // Especialista
        if (totalXp >= 500) return 2; // Conhecedor
        return 1; // Explorador
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
