/**
 * Badge Repository
 * Gerencia operações de badges no PostgreSQL
 */

import type { Badge, UserBadge } from '../types';
import { BaseRepository, RepositoryContext } from './base.repository';

export class BadgeRepository extends BaseRepository {
    /**
     * Listar todos os badges
     */
    async getBadges(
        context: RepositoryContext,
        filters?: { category?: string; rarity?: string }
    ): Promise<Badge[]> {
        try {
            return await this.withContext(context, async () => {
                let query = this.supabase
                    .from('academy_badges')
                    .select('*')
                    .eq('tenant_id', context.tenantId);

                if (filters?.category) {
                    query = query.eq('category', filters.category);
                }

                if (filters?.rarity) {
                    query = query.eq('rarity', filters.rarity);
                }

                const { data, error } = await query;

                if (error) throw error;

                return (data || []).map(this.mapToBadge);
            });
        } catch (error) {
            this.handleError(error, 'getBadges');
        }
    }

    /**
     * Buscar badge por ID
     */
    async getBadgeById(context: RepositoryContext, badgeId: string): Promise<Badge | null> {
        try {
            return await this.withContext(context, async () => {
                const { data, error } = await this.supabase
                    .from('academy_badges')
                    .select('*')
                    .eq('tenant_id', context.tenantId)
                    .eq('id', badgeId)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') return null;
                    throw error;
                }

                return this.mapToBadge(data);
            });
        } catch (error) {
            this.handleError(error, 'getBadgeById');
        }
    }

    /**
     * Buscar badges conquistados pelo usuário
     */
    async getUserBadges(context: RepositoryContext): Promise<UserBadge[]> {
        try {
            return await this.withContext(context, async () => {
                const { data, error } = await this.supabase
                    .from('academy_user_badges')
                    .select('badge_id, earned_at')
                    .eq('tenant_id', context.tenantId)
                    .eq('user_id', context.userId);

                if (error) throw error;

                return (data || []).map(d => ({
                    badgeId: d.badge_id,
                    earnedAt: d.earned_at
                }));
            });
        } catch (error) {
            this.handleError(error, 'getUserBadges');
        }
    }

    /**
     * Verificar se usuário tem um badge
     */
    async hasBadge(context: RepositoryContext, badgeId: string): Promise<boolean> {
        try {
            return await this.withContext(context, async () => {
                const { data, error } = await this.supabase
                    .from('academy_user_badges')
                    .select('id')
                    .eq('tenant_id', context.tenantId)
                    .eq('user_id', context.userId)
                    .eq('badge_id', badgeId)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') return false;
                    throw error;
                }

                return !!data;
            });
        } catch (error) {
            this.handleError(error, 'hasBadge');
        }
    }

    /**
     * Conceder badge ao usuário
     */
    async awardBadge(
        context: RepositoryContext,
        badgeId: string
    ): Promise<{ success: boolean; xpBonus: number }> {
        try {
            return await this.withContext(context, async () => {
                // Verificar se já tem o badge
                const alreadyHas = await this.hasBadge(context, badgeId);
                if (alreadyHas) {
                    return { success: false, xpBonus: 0 };
                }

                // Buscar badge para pegar XP bonus
                const badge = await this.getBadgeById(context, badgeId);
                if (!badge) throw new Error('Badge not found');

                // Conceder badge
                const { error } = await this.supabase
                    .from('academy_user_badges')
                    .insert({
                        tenant_id: context.tenantId,
                        user_id: context.userId,
                        badge_id: badgeId,
                        earned_at: new Date().toISOString()
                    });

                if (error) throw error;

                return {
                    success: true,
                    xpBonus: badge.xpBonus
                };
            });
        } catch (error) {
            this.handleError(error, 'awardBadge');
        }
    }

    /**
     * Verificar badges automáticos baseados em progresso
     * Retorna badges que o usuário deveria ter mas ainda não tem
     */
    async checkAutomaticBadges(
        context: RepositoryContext,
        progressData: {
            coursesCompleted: number;
            missionsCompleted: number;
            totalXp: number;
            currentStreak: number;
        }
    ): Promise<Badge[]> {
        try {
            return await this.withContext(context, async () => {
                // Buscar todos os badges
                const allBadges = await this.getBadges(context);

                // Buscar badges já conquistados
                const userBadges = await this.getUserBadges(context);
                const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));

                // Filtrar badges que o usuário pode conquistar
                const eligibleBadges: Badge[] = [];

                for (const badge of allBadges) {
                    // Pular se já tem o badge
                    if (earnedBadgeIds.has(badge.id)) continue;

                    // Verificar requirements
                    const req = badge.requirements;

                    if (req.type === 'course_complete' && req.targetValue) {
                        if (progressData.coursesCompleted >= req.targetValue) {
                            eligibleBadges.push(badge);
                        }
                    } else if (req.type === 'mission_complete' && req.targetValue) {
                        if (progressData.missionsCompleted >= req.targetValue) {
                            eligibleBadges.push(badge);
                        }
                    } else if (req.type === 'streak' && req.targetValue) {
                        if (progressData.currentStreak >= req.targetValue) {
                            eligibleBadges.push(badge);
                        }
                    } else if (req.type === 'xp_total' && req.targetValue) {
                        if (progressData.totalXp >= req.targetValue) {
                            eligibleBadges.push(badge);
                        }
                    }
                }

                return eligibleBadges;
            });
        } catch (error) {
            this.handleError(error, 'checkAutomaticBadges');
        }
    }

    // ==================== MAPPERS ====================

    private mapToBadge(data: any): Badge {
        return {
            id: data.id,
            tenantId: data.tenant_id,
            name: data.name,
            description: data.description,
            icon: data.icon,
            category: data.category,
            requirements: data.requirements,
            xpBonus: data.xp_bonus,
            rarity: data.rarity
        };
    }
}

// Export singleton instance
export const badgeRepository = new BadgeRepository();
