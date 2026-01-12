/**
 * Course Repository
 * Gerencia operações de cursos e lições no PostgreSQL
 */

import type { Course, Lesson, CourseProgress, LessonProgress, QuizQuestion } from '../types';
import { BaseRepository, RepositoryContext } from './base.repository';

export class CourseRepository extends BaseRepository {
    /**
     * Listar todos os cursos
     */
    async getCourses(
        context: RepositoryContext,
        filters?: { level?: number; status?: string }
    ): Promise<Course[]> {
        try {
            return await this.withContext(context, async () => {
                let query = this.supabase
                    .from('academy_courses')
                    .select('*')
                    .eq('tenant_id', context.tenantId)
                    .order('order_index', { ascending: true });

                if (filters?.level) {
                    query = query.eq('level', filters.level);
                }

                if (filters?.status) {
                    query = query.eq('status', filters.status);
                }

                const { data, error } = await query;

                if (error) throw error;

                return (data || []).map(this.mapToCourse);
            });
        } catch (error) {
            this.handleError(error, 'getCourses');
        }
    }

    /**
     * Buscar curso por ID
     */
    async getCourseById(context: RepositoryContext, courseId: string): Promise<Course | null> {
        try {
            return await this.withContext(context, async () => {
                const { data, error } = await this.supabase
                    .from('academy_courses')
                    .select('*')
                    .eq('tenant_id', context.tenantId)
                    .eq('id', courseId)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') return null;
                    throw error;
                }

                return this.mapToCourse(data);
            });
        } catch (error) {
            this.handleError(error, 'getCourseById');
        }
    }

    /**
     * Buscar lições de um curso
     */
    async getCourseLessons(context: RepositoryContext, courseId: string): Promise<Lesson[]> {
        try {
            return await this.withContext(context, async () => {
                const { data, error } = await this.supabase
                    .from('academy_lessons')
                    .select('*')
                    .eq('tenant_id', context.tenantId)
                    .eq('course_id', courseId)
                    .order('order_index', { ascending: true });

                if (error) throw error;

                return (data || []).map(this.mapToLesson);
            });
        } catch (error) {
            this.handleError(error, 'getCourseLessons');
        }
    }

    /**
     * Buscar lição por ID
     */
    async getLessonById(context: RepositoryContext, lessonId: string): Promise<Lesson | null> {
        try {
            return await this.withContext(context, async () => {
                const { data, error } = await this.supabase
                    .from('academy_lessons')
                    .select('*')
                    .eq('tenant_id', context.tenantId)
                    .eq('id', lessonId)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') return null;
                    throw error;
                }

                return this.mapToLesson(data);
            });
        } catch (error) {
            this.handleError(error, 'getLessonById');
        }
    }

    /**
     * Buscar perguntas de quiz de uma lição
     */
    async getLessonQuestions(
        context: RepositoryContext,
        lessonId: string
    ): Promise<QuizQuestion[]> {
        try {
            return await this.withContext(context, async () => {
                const { data, error } = await this.supabase
                    .from('academy_questions')
                    .select('*')
                    .eq('tenant_id', context.tenantId)
                    .eq('lesson_id', lessonId)
                    .order('order_index', { ascending: true });

                if (error) throw error;

                return (data || []).map(this.mapToQuizQuestion);
            });
        } catch (error) {
            this.handleError(error, 'getLessonQuestions');
        }
    }

    /**
     * Buscar progresso do curso
     */
    async getCourseProgress(
        context: RepositoryContext,
        courseId: string
    ): Promise<CourseProgress | null> {
        try {
            return await this.withContext(context, async () => {
                const { data, error } = await this.supabase
                    .from('academy_course_progress')
                    .select('*')
                    .eq('tenant_id', context.tenantId)
                    .eq('user_id', context.userId)
                    .eq('course_id', courseId)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') return null;
                    throw error;
                }

                return this.mapToCourseProgress(data);
            });
        } catch (error) {
            this.handleError(error, 'getCourseProgress');
        }
    }

    /**
     * Buscar progresso da lição
     */
    async getLessonProgress(
        context: RepositoryContext,
        lessonId: string
    ): Promise<LessonProgress | null> {
        try {
            return await this.withContext(context, async () => {
                const { data, error } = await this.supabase
                    .from('academy_lesson_progress')
                    .select('*')
                    .eq('tenant_id', context.tenantId)
                    .eq('user_id', context.userId)
                    .eq('lesson_id', lessonId)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') return null;
                    throw error;
                }

                return this.mapToLessonProgress(data);
            });
        } catch (error) {
            this.handleError(error, 'getLessonProgress');
        }
    }

    /**
     * Atualizar progresso da lição
     */
    async updateLessonProgress(
        context: RepositoryContext,
        lessonId: string,
        progress: Partial<LessonProgress>
    ): Promise<LessonProgress> {
        try {
            return await this.withContext(context, async () => {
                const { data, error } = await this.supabase
                    .from('academy_lesson_progress')
                    .upsert({
                        tenant_id: context.tenantId,
                        user_id: context.userId,
                        lesson_id: lessonId,
                        status: progress.status,
                        video_watched_percent: progress.videoWatchedPercent,
                        video_current_time: progress.videoCurrentTime || 0,
                        quiz_score: progress.quizScore,
                        completed_at: progress.completedAt,
                        xp_earned: progress.xpEarned || 0,
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (error) throw error;

                return this.mapToLessonProgress(data);
            });
        } catch (error) {
            this.handleError(error, 'updateLessonProgress');
        }
    }

    /**
     * Completar lição
     */
    async completeLesson(
        context: RepositoryContext,
        lessonId: string,
        quizScore?: number
    ): Promise<{ xpEarned: number; courseCompleted: boolean }> {
        try {
            return await this.withContext(context, async () => {
                // Buscar lição
                const lesson = await this.getLessonById(context, lessonId);
                if (!lesson) throw new Error('Lesson not found');

                // Atualizar progresso da lição
                await this.updateLessonProgress(context, lessonId, {
                    lessonId,
                    status: 'completed',
                    videoWatchedPercent: 100,
                    quizScore,
                    completedAt: new Date().toISOString(),
                    xpEarned: lesson.xpReward
                });

                // Verificar se o curso foi completado
                const courseLessons = await this.getCourseLessons(context, lesson.courseId);
                const completedLessons = await Promise.all(
                    courseLessons.map(l => this.getLessonProgress(context, l.id))
                );

                const allCompleted = completedLessons.every(
                    p => p?.status === 'completed'
                );

                let courseCompleted = false;

                if (allCompleted) {
                    // Marcar curso como completo
                    const course = await this.getCourseById(context, lesson.courseId);
                    if (course) {
                        await this.supabase
                            .from('academy_course_progress')
                            .upsert({
                                tenant_id: context.tenantId,
                                user_id: context.userId,
                                course_id: lesson.courseId,
                                status: 'completed',
                                progress_percent: 100,
                                completed_at: new Date().toISOString(),
                                xp_earned: course.xpReward
                            });

                        courseCompleted = true;
                    }
                }

                return {
                    xpEarned: lesson.xpReward,
                    courseCompleted
                };
            });
        } catch (error) {
            this.handleError(error, 'completeLesson');
        }
    }

    // ==================== MAPPERS ====================

    private mapToCourse(data: any): Course {
        return {
            id: data.id,
            tenantId: data.tenant_id,
            title: data.title,
            description: data.description,
            icon: data.icon,
            level: data.level,
            xpReward: data.xp_reward,
            estimatedTime: data.estimated_time,
            orderIndex: data.order_index,
            status: data.status,
            lessons: []
        };
    }

    private mapToLesson(data: any): Lesson {
        return {
            id: data.id,
            courseId: data.course_id,
            title: data.title,
            content: data.content,
            videoUrl: data.video_url,
            xpReward: data.xp_reward,
            orderIndex: data.order_index,
            lessonType: data.lesson_type
        };
    }

    private mapToQuizQuestion(data: any): QuizQuestion {
        return {
            id: data.id,
            lessonId: data.lesson_id,
            question: data.question,
            options: data.options,
            explanation: data.explanation,
            xpReward: data.xp_reward,
            orderIndex: data.order_index
        };
    }

    private mapToCourseProgress(data: any): CourseProgress {
        return {
            courseId: data.course_id,
            status: data.status,
            progressPercent: data.progress_percent,
            startedAt: data.started_at,
            completedAt: data.completed_at,
            xpEarned: data.xp_earned
        };
    }

    private mapToLessonProgress(data: any): LessonProgress {
        return {
            lessonId: data.lesson_id,
            status: data.status,
            videoWatchedPercent: data.video_watched_percent,
            videoCurrentTime: data.video_current_time,
            quizScore: data.quiz_score,
            completedAt: data.completed_at,
            xpEarned: data.xp_earned
        };
    }
}

// Export singleton instance
export const courseRepository = new CourseRepository();
