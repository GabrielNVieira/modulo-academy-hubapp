/**
 * Mission Repository
 * Gerencia operações de missões no PostgreSQL
 */

import type { Mission, MissionProgress, MissionStatus } from '../types';
import { BaseRepository, RepositoryContext } from './base.repository';

export class MissionRepository extends BaseRepository {
    /**
     * Listar todas as missões
     */
    async getMissions(
        context: RepositoryContext,
        filters?: { status?: string; type?: string }
    ): Promise<Mission[]> {
        try {
            return await this.withContext(context, async () => {
                let query = this.supabase
                    .from('academy_missions')
                    .select('*')
                    .eq('tenant_id', context.tenantId)
                    .order('order_index', { ascending: true });

                if (filters?.status) {
                    query = query.eq('status', filters.status);
                }

                if (filters?.type) {
                    query = query.eq('type', filters.type);
                }

                const { data, error } = await query;

                if (error) throw error;

                return (data || []).map(this.mapToMission);
            });
        } catch (error) {
            this.handleError(error, 'getMissions');
        }
    }

    /**
     * Buscar missão por ID
     */
    async getMissionById(context: RepositoryContext, missionId: string): Promise<Mission | null> {
        try {
            return await this.withContext(context, async () => {
                const { data, error } = await this.supabase
                    .from('academy_missions')
                    .select('*')
                    .eq('tenant_id', context.tenantId)
                    .eq('id', missionId)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') return null;
                    throw error;
                }

                return this.mapToMission(data);
            });
        } catch (error) {
            this.handleError(error, 'getMissionById');
        }
    }

    /**
     * Buscar progresso da missão
     */
    async getMissionProgress(
        context: RepositoryContext,
        missionId: string
    ): Promise<MissionProgress | null> {
        try {
            return await this.withContext(context, async () => {
                const { data, error } = await this.supabase
                    .from('academy_mission_progress')
                    .select('*')
                    .eq('tenant_id', context.tenantId)
                    .eq('user_id', context.userId)
                    .eq('mission_id', missionId)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') return null;
                    throw error;
                }

                return this.mapToMissionProgress(data);
            });
        } catch (error) {
            this.handleError(error, 'getMissionProgress');
        }
    }

    /**
     * Atualizar progresso da missão
     */
    async updateMissionProgress(
        context: RepositoryContext,
        missionId: string,
        checklistState: Record<string, boolean>
    ): Promise<number> {
        try {
            return await this.withContext(context, async () => {
                // Buscar missão para pegar requirements
                const mission = await this.getMissionById(context, missionId);
                if (!mission) throw new Error('Mission not found');

                // Calcular progresso
                const totalItems = mission.requirements.items.length;
                const completedItems = Object.values(checklistState).filter(Boolean).length;
                const progressPercent = Math.round((completedItems / totalItems) * 100);

                // Determinar status
                let status: MissionStatus = 'in_progress';
                if (progressPercent === 100) {
                    status = 'completed';
                } else if (progressPercent > 0) {
                    status = 'in_progress';
                }

                // Atualizar no banco
                const { error } = await this.supabase
                    .from('academy_mission_progress')
                    .upsert({
                        tenant_id: context.tenantId,
                        user_id: context.userId,
                        mission_id: missionId,
                        status,
                        checklist_state: checklistState,
                        started_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });

                if (error) throw error;

                return progressPercent;
            });
        } catch (error) {
            this.handleError(error, 'updateMissionProgress');
        }
    }

    /**
     * Completar missão
     */
    async completeMission(
        context: RepositoryContext,
        missionId: string
    ): Promise<{ xpEarned: number }> {
        try {
            return await this.withContext(context, async () => {
                // Buscar missão
                const mission = await this.getMissionById(context, missionId);
                if (!mission) throw new Error('Mission not found');

                // Atualizar progresso
                const { error } = await this.supabase
                    .from('academy_mission_progress')
                    .upsert({
                        tenant_id: context.tenantId,
                        user_id: context.userId,
                        mission_id: missionId,
                        status: 'completed',
                        completed_at: new Date().toISOString(),
                        xp_earned: mission.xpReward,
                        updated_at: new Date().toISOString()
                    });

                if (error) throw error;

                return {
                    xpEarned: mission.xpReward
                };
            });
        } catch (error) {
            this.handleError(error, 'completeMission');
        }
    }

    /**
     * Marcar ajuda como usada
     */
    async markHelpUsed(context: RepositoryContext, missionId: string): Promise<void> {
        try {
            await this.withContext(context, async () => {
                const { error } = await this.supabase
                    .from('academy_mission_progress')
                    .update({ help_used: true })
                    .eq('tenant_id', context.tenantId)
                    .eq('user_id', context.userId)
                    .eq('mission_id', missionId);

                if (error) throw error;
            });
        } catch (error) {
            this.handleError(error, 'markHelpUsed');
        }
    }

    /**
     * Verificar se missão está disponível (prerequisites)
     */
    async isMissionAvailable(context: RepositoryContext, missionId: string): Promise<boolean> {
        try {
            return await this.withContext(context, async () => {
                const mission = await this.getMissionById(context, missionId);
                if (!mission || !mission.prerequisites || mission.prerequisites.length === 0) {
                    return true;
                }

                // Verificar se todos os prerequisites foram completados
                const prerequisiteProgress = await Promise.all(
                    mission.prerequisites.map(prereqId =>
                        this.getMissionProgress(context, prereqId)
                    )
                );

                return prerequisiteProgress.every(p => p?.status === 'completed');
            });
        } catch (error) {
            this.handleError(error, 'isMissionAvailable');
        }
    }

    /**
     * Criar nova missão (Admin)
     */
    async createMission(context: RepositoryContext, data: Partial<Mission>): Promise<Mission> {
        try {
            return await this.withContext(context, async () => {
                const { data: newMission, error } = await this.supabase
                    .from('academy_missions')
                    .insert({
                        tenant_id: context.tenantId,
                        title: data.title,
                        description: data.description,
                        icon: data.icon,
                        xp_reward: data.xpReward,
                        type: data.type || 'daily',
                        mission_type: data.missionType || 'checklist',
                        requirements: data.requirements,
                        order_index: data.order,
                        estimated_time: data.estimatedTime,
                        category: data.category,
                        prerequisites: data.prerequisites || [],
                        help_content: data.helpContent
                    })
                    .select()
                    .single();

                if (error) throw error;
                return this.mapToMission(newMission);
            });
        } catch (error) {
            this.handleError(error, 'createMission');
        }
    }

    /**
     * Atualizar missão (Admin)
     */
    async updateMission(context: RepositoryContext, id: string, data: Partial<Mission>): Promise<Mission> {
        try {
            return await this.withContext(context, async () => {
                const updateData: any = {};
                if (data.title !== undefined) updateData.title = data.title;
                if (data.description !== undefined) updateData.description = data.description;
                if (data.icon !== undefined) updateData.icon = data.icon;
                if (data.xpReward !== undefined) updateData.xp_reward = data.xpReward;
                if (data.type !== undefined) updateData.type = data.type;
                if (data.missionType !== undefined) updateData.mission_type = data.missionType;
                if (data.requirements !== undefined) updateData.requirements = data.requirements;
                if (data.order !== undefined) updateData.order_index = data.order;
                if (data.estimatedTime !== undefined) updateData.estimated_time = data.estimatedTime;
                if (data.category !== undefined) updateData.category = data.category;
                if (data.prerequisites !== undefined) updateData.prerequisites = data.prerequisites;
                if (data.helpContent !== undefined) updateData.help_content = data.helpContent;

                const { data: updatedMission, error } = await this.supabase
                    .from('academy_missions')
                    .update(updateData)
                    .eq('tenant_id', context.tenantId)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;
                return this.mapToMission(updatedMission);
            });
        } catch (error) {
            this.handleError(error, 'updateMission');
        }
    }

    /**
     * Deletar missão (Admin)
     */
    async deleteMission(context: RepositoryContext, id: string): Promise<void> {
        try {
            await this.withContext(context, async () => {
                const { error } = await this.supabase
                    .from('academy_missions')
                    .delete()
                    .eq('tenant_id', context.tenantId)
                    .eq('id', id);

                if (error) throw error;
            });
        } catch (error) {
            this.handleError(error, 'deleteMission');
        }
    }

    // ==================== MAPPERS ====================

    private mapToMission(data: any): Mission {
        return {
            id: data.id,
            tenantId: data.tenant_id,
            title: data.title,
            description: data.description,
            icon: data.icon,
            xpReward: data.xp_reward,
            type: data.type,
            missionType: data.mission_type,
            requirements: data.requirements,
            deadline: data.deadline,
            status: data.status,
            order: data.order_index,
            estimatedTime: data.estimated_time,
            category: data.category,
            prerequisites: data.prerequisites,
            helpContent: data.help_content
        };
    }

    private mapToMissionProgress(data: any): MissionProgress {
        const checklistState = data.checklist_state || {};
        const checklistItems = Object.entries(checklistState).map(([id, completed]) => ({
            id,
            completed: completed as boolean
        }));

        return {
            missionId: data.mission_id,
            status: data.status,
            checklistItems,
            checklistState,
            startedAt: data.started_at,
            completedAt: data.completed_at,
            xpEarned: data.xp_earned,
            helpUsed: data.help_used
        };
    }
}

// Export singleton instance
export const missionRepository = new MissionRepository();
