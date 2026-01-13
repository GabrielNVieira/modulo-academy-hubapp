/**
 * Academy Module - Courses Tab
 * 
 * Agora utilizando MiniCardsGrid para layout flexível e drag-and-drop.
 * Mantém toda a lógica existente de VideoPlayer, filtros e backend sync.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { VideoPlayer, LessonStatus } from '../VideoPlayer';
import { MiniCardsGrid } from '@/components/MiniCardsGrid/MiniCardsGrid';
import {
    METRICAS_COURSES,
    FINAL_LAYOUT_COURSES,
    CoursesData,
    Lesson,
    FilterType
} from './courses/CoursesGridConfig';
import { useProgress } from '../../hooks/useProgress';
import { useHubContext } from '../../hooks/useHubContext';
import { isSupabaseReady } from '../../lib/supabase';
import { courseRepository } from '../../services';

function isUUID(uuid: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

// Dados iniciais (default)
const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const INITIAL_LESSONS: Lesson[] = [
    { id: '1', title: 'AULA 1 - Introdução ao Sistema', xp: 10, status: 'not_started', videoUrl: SAMPLE_VIDEO },
    { id: '2', title: 'AULA 2 - Configuração Inicial', xp: 15, status: 'not_started', videoUrl: SAMPLE_VIDEO },
    { id: '3', title: 'AULA 3 - Primeiros Passos', xp: 20, status: 'not_started', videoUrl: SAMPLE_VIDEO },
    { id: '4', title: 'AULA 4 - Funcionalidades Básicas', xp: 25, status: 'not_started', videoUrl: SAMPLE_VIDEO },
    { id: '5', title: 'AULA 5 - Recursos Avançados', xp: 30, status: 'not_started', videoUrl: SAMPLE_VIDEO },
    { id: '6', title: 'AULA 6 - Integrações', xp: 35, status: 'not_started', videoUrl: SAMPLE_VIDEO },
    { id: '7', title: 'AULA 7 - Boas Práticas', xp: 40, status: 'not_started', videoUrl: SAMPLE_VIDEO },
    { id: '8', title: 'AULA 8 - Projeto Final', xp: 50, status: 'not_started', videoUrl: SAMPLE_VIDEO },
    { id: '9', title: 'AULA 9 - Certificação', xp: 100, status: 'not_started', videoUrl: SAMPLE_VIDEO },
];

export function CoursesTab() {
    const [activeFilter, setActiveFilter] = useState<FilterType>('not_started');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [showPlayer, setShowPlayer] = useState(false);
    const [initialTime, setInitialTime] = useState(0);
    const { addXp, currentLevel } = useProgress();
    const { context, isConnected } = useHubContext();

    // Estado das aulas com persistência
    const [lessons, setLessons] = useState<Lesson[]>(() => {
        try {
            const saved = localStorage.getItem('academy_lessons');
            return saved ? JSON.parse(saved) : INITIAL_LESSONS;
        } catch (error) {
            console.error('Erro ao ler aulas do localStorage:', error);
            return INITIAL_LESSONS;
        }
    });

    // Carregar aulas do Backend
    useEffect(() => {
        const loadLessons = async () => {
            const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
            const hasSupabase = isSupabaseReady();

            if (!useMockData && hasSupabase && isConnected && context) {
                try {
                    console.log('📚 [CoursesTab] Buscando cursos do PostgreSQL...');
                    const courses = await courseRepository.getCourses(context);

                    if (courses && courses.length > 0) {
                        const mainCourse = courses[0]; // Pega o primeiro curso por enquanto
                        const dbLessons = await courseRepository.getCourseLessons(context, mainCourse.id);

                        if (dbLessons.length > 0) {
                            // Carregar progresso de cada lição
                            const mergedLessons = await Promise.all(dbLessons.map(async (l) => {
                                const prog = await courseRepository.getLessonProgress(context, l.id);
                                return {
                                    id: l.id,
                                    title: l.title,
                                    xp: l.xpReward,
                                    status: (prog?.status as LessonStatus) || 'not_started',
                                    videoUrl: l.videoUrl
                                };
                            }));

                            setLessons(mergedLessons);
                            return;
                        }
                    }
                } catch (err) {
                    console.error('❌ [CoursesTab] Erro ao carregar cursos:', err);
                }
            }
            // Se falhar ou não tiver backend, mantemos o local state (INITIAL_LESSONS ou localStorage)
        };

        loadLessons();
    }, [isConnected, context]);

    // Salvar aulas sempre que mudar
    useEffect(() => {
        localStorage.setItem('academy_lessons', JSON.stringify(lessons));
    }, [lessons]);

    // Estado da última aula acessada
    const [lastLessonId, setLastLessonId] = useState<string | null>(() => {
        const saved = localStorage.getItem('academy_last_lesson');
        return saved;
    });

    // Salvar última aula sempre que mudar
    useEffect(() => {
        if (lastLessonId) {
            localStorage.setItem('academy_last_lesson', lastLessonId);
        }
    }, [lastLessonId]);

    const filteredLessons = useMemo(() =>
        lessons.filter(lesson =>
            lesson.status === activeFilter &&
            lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
        ), [lessons, activeFilter, searchQuery]);

    // Função para abrir o player de vídeo
    const handleLessonClick = useCallback(async (lesson: Lesson) => {
        let startTime = 0;

        // Tentar buscar progresso salvo
        const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
        const hasSupabase = isSupabaseReady();

        if (!useMockData && hasSupabase && isConnected && context && isUUID(lesson.id)) {
            try {
                const progress = await courseRepository.getLessonProgress(
                    { tenantId: context.tenantId, userId: context.userId },
                    lesson.id
                );
                if (progress?.videoCurrentTime) {
                    startTime = progress.videoCurrentTime;
                }
            } catch (error) {
                console.error('Erro ao buscar progresso da aula:', error);
            }
        } else {
            // Fallback: localStorage para aulas mock (IDs "1", "2", etc e ambiente dev)
            const savedTime = localStorage.getItem(`academy_video_time_${lesson.id}`);
            if (savedTime) startTime = parseFloat(savedTime);
        }

        setInitialTime(startTime);
        setSelectedLesson(lesson);
        setLastLessonId(lesson.id);
        setShowPlayer(true);
    }, [isConnected, context]);

    const handleProgressUpdate = useCallback(async (time: number, percentage: number) => {
        if (!selectedLesson) return;

        // Salvar localmente sempre (backup e suporte a mocks)
        localStorage.setItem(`academy_video_time_${selectedLesson.id}`, time.toString());

        const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
        const hasSupabase = isSupabaseReady();

        if (!useMockData && hasSupabase && isConnected && context && isUUID(selectedLesson.id)) {
            try {
                // Salvar no backend
                await courseRepository.updateLessonProgress(
                    { tenantId: context.tenantId, userId: context.userId },
                    selectedLesson.id,
                    {
                        status: 'in_progress',
                        videoWatchedPercent: Math.round(percentage),
                        videoCurrentTime: Math.round(time)
                    }
                );
            } catch (error) {
                console.error('Erro ao salvar progresso:', error);
            }
        }
    }, [selectedLesson, isConnected, context]);

    // Função para fechar o player
    const handleClosePlayer = useCallback(() => {
        setShowPlayer(false);
        setSelectedLesson(null);
    }, []);

    // Callback de atualização de status vindo do VideoPlayer
    const handleStatusChange = useCallback(async (newStatus: LessonStatus) => {
        if (!selectedLesson) return;

        // Verificar se completou agora
        if (newStatus === 'completed' && selectedLesson.status !== 'completed') {
            // Adicionar XP
            await addXp(selectedLesson.xp, `Aula: ${selectedLesson.title}`);
        }

        // Verificar se TODAS as aulas foram completadas
        const allCompleted = lessons.every(l =>
            l.id === selectedLesson.id ? newStatus === 'completed' : l.status === 'completed'
        );

        if (allCompleted && newStatus === 'completed' && selectedLesson.status !== 'completed') {
            console.log('🎓 Curso completo! Adicionando contador...');
            // Disparar evento de curso completo (simulado via XP source por enquanto ou nova prop)
            await addXp(0, 'Curso: Introdução ao Webhook');
        }

        // SYNC BACKEND
        const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
        const hasSupabase = isSupabaseReady();
        if (!useMockData && hasSupabase && isConnected && context && isUUID(selectedLesson.id)) {
            if (newStatus === 'completed') {
                try {
                    await courseRepository.completeLesson(context, selectedLesson.id);
                } catch (e) {
                    console.error('Falha ao completar lição no backend', e);
                }
            } else {
                // Para outros status, update normal
                try {
                    await courseRepository.updateLessonProgress(context, selectedLesson.id, {
                        status: newStatus
                    });
                } catch (e) { console.error('Falha ao atualizar status', e); }
            }
        }

        setLessons(prev => prev.map(lesson => {
            if (lesson.id === selectedLesson.id) {
                // Só atualiza se o status for "maior" ou diferente
                // Prioridade: completed > in_progress > not_started
                if (lesson.status === 'completed' && newStatus !== 'completed') return lesson;
                if (lesson.status === 'in_progress' && newStatus === 'not_started') return lesson;

                return { ...lesson, status: newStatus };
            }
            return lesson;
        }));
    }, [selectedLesson, lessons, addXp, isConnected, context]);

    // Callback para o botão TURBO XP
    const handleTurboClick = useCallback(() => {
        const lastLesson = lessons.find(l => l.id === lastLessonId);
        const inProgressLesson = lessons.find(l => l.status === 'in_progress');
        const firstAvailableLesson = lessons.find(l => l.status === 'not_started') || lessons[0];
        handleLessonClick(lastLesson || inProgressLesson || firstAvailableLesson);
    }, [lessons, lastLessonId, handleLessonClick]);

    // Preparar dados para o grid
    const gridData: CoursesData = useMemo(() => ({
        lessons,
        filteredLessons,
        activeFilter,
        searchQuery,
        lastLessonId,
        currentLevel,
        onLessonClick: handleLessonClick,
        onFilterChange: setActiveFilter,
        onSearchChange: setSearchQuery,
        onTurboClick: handleTurboClick
    }), [lessons, filteredLessons, activeFilter, searchQuery, lastLessonId, currentLevel, handleLessonClick, handleTurboClick]);

    // Se o player estiver aberto, mostrar apenas ele
    if (showPlayer && selectedLesson) {
        return (
            <VideoPlayer
                lessonId={selectedLesson.id}
                lessonTitle={selectedLesson.title}
                lessonNumber={parseInt(selectedLesson.id)}
                totalLessons={lessons.length}
                courseTitle="Curso: Introdução ao Webhook"
                xpReward={selectedLesson.xp}
                videoUrl={selectedLesson.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                status={selectedLesson.status}
                onBack={handleClosePlayer}
                onStatusChange={handleStatusChange}
                initialTime={initialTime}
                onProgressUpdate={handleProgressUpdate}
            />
        );
    }

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Título */}
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight text-center lg:text-left">
                Explorar Cursos
            </h1>

            {/* Grid Dinâmico */}
            <div className="flex-1 min-h-0 bg-slate-50/50 rounded-2xl border border-slate-200/60 p-4">
                <MiniCardsGrid
                    data={gridData}
                    availableMetrics={METRICAS_COURSES}
                    initialMetrics={FINAL_LAYOUT_COURSES}
                    variant="card"
                    className="h-full"
                />
            </div>
        </div>
    );
}
