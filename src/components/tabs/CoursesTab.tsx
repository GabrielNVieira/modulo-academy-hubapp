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
import { Course } from '../../types';

function isUUID(uuid: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

// Dados iniciais (default) - will be loaded from localStorage (written by useAdminCourses)
const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

// Fallback lessons in case localStorage is empty
const FALLBACK_LESSONS: Lesson[] = [
    { id: '1', title: 'AULA 1 - Introdução ao Sistema', xp: 10, status: 'not_started', videoUrl: SAMPLE_VIDEO },
    { id: '2', title: 'AULA 2 - Configuração Inicial', xp: 15, status: 'not_started', videoUrl: SAMPLE_VIDEO },
    { id: '3', title: 'AULA 3 - Primeiros Passos', xp: 20, status: 'not_started', videoUrl: SAMPLE_VIDEO },
];

export function CoursesTab() {
    const [activeFilter, setActiveFilter] = useState<FilterType>('not_started');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [activeCourseTitle, setActiveCourseTitle] = useState<string>('Curso');

    // Helper para converter lição do Domínio para lição da UI
    const mapLessonToUI = useCallback((l: any, status: LessonStatus = 'not_started'): Lesson => ({
        id: l.id,
        title: l.title,
        xp: l.xpReward || l.xp || 10,
        status: status,
        videoUrl: l.videoUrl || l.video_url || SAMPLE_VIDEO
    }), []);
    const [showPlayer, setShowPlayer] = useState(false);
    const [initialTime, setInitialTime] = useState(0);
    const { addXp, currentLevel } = useProgress();
    const { context, isConnected } = useHubContext();

    // Helper to load lessons from localStorage
    const loadLessonsFromStorage = useCallback(() => {
        try {
            const saved = localStorage.getItem('academy_lessons');
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.map((l: any) => mapLessonToUI(l, l.status || 'not_started'));
            }
            return FALLBACK_LESSONS;
        } catch (error) {
            console.error('Erro ao ler aulas do localStorage:', error);
            return FALLBACK_LESSONS;
        }
    }, [mapLessonToUI]);

    // Estado dos cursos e curso ativo
    const [courses, setCourses] = useState<Course[]>([]);
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

    // Estado das aulas com persistência
    const [lessons, setLessons] = useState<Lesson[]>(loadLessonsFromStorage);

    // Fetch All Courses and then Lessons for Active Course
    const fetchCoursesAndLessons = useCallback(async () => {
        const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
        const hasSupabase = isSupabaseReady();

        if (!useMockData && hasSupabase && isConnected && context) {
            try {
                console.log('📚 [CoursesTab] Buscando cursos do PostgreSQL...');
                const dbCourses = await courseRepository.getCourses(context);

                if (dbCourses && dbCourses.length > 0) {
                    // Update Courses List
                    setCourses(dbCourses);

                    // Logic to set active course if none selected
                    const targetCourseId = activeCourseId || dbCourses[0].id;
                    const targetCourse = dbCourses.find(c => c.id === targetCourseId) || dbCourses[0];

                    if (targetCourse.id !== activeCourseId) {
                        setActiveCourseId(targetCourse.id);
                        setActiveCourseTitle(targetCourse.title);
                    }

                    // Fetch Lessons for Target Course
                    const dbLessons = await courseRepository.getCourseLessons(context, targetCourse.id);

                    if (dbLessons.length > 0) {
                        const mergedLessons = await Promise.all(dbLessons.map(async (l) => {
                            const prog = await courseRepository.getLessonProgress(context, l.id);
                            return mapLessonToUI(l, (prog?.status as LessonStatus) || 'not_started');
                        }));

                        setLessons(mergedLessons);
                    } else {
                        setLessons([]); // No lessons for this course
                    }
                }
            } catch (err) {
                console.error('❌ [CoursesTab] Erro ao carregar cursos:', err);
            }
        } else {
            // Fallback: LocalStorage / Mock
            try {
                const savedCourses = localStorage.getItem('academy_courses');
                let loadedCourses: Course[] = [];

                if (savedCourses) {
                    loadedCourses = JSON.parse(savedCourses);
                    setCourses(loadedCourses);
                }

                if (loadedCourses.length > 0) {
                    const targetCourseId = activeCourseId || loadedCourses[0].id;
                    const targetCourse = loadedCourses.find(c => c.id === targetCourseId) || loadedCourses[0];

                    if (targetCourse.id !== activeCourseId) {
                        setActiveCourseId(targetCourse.id);
                        setActiveCourseTitle(targetCourse.title);
                    }

                    // In mock mode, filter lessons by active course
                    const savedLessons = localStorage.getItem('academy_lessons');
                    if (savedLessons) {
                        const allLessons = JSON.parse(savedLessons);
                        // Filter lessons by the target course and map to UI format
                        const filteredLessons = allLessons
                            .filter((l: any) => l.courseId === targetCourse.id)
                            .map((l: any) => mapLessonToUI(l, l.status || 'not_started'));
                        setLessons(filteredLessons);
                    } else {
                        setLessons([]);
                    }
                }
            } catch (e) {
                console.error("Failed to load local courses", e);
            }
        }
    }, [isConnected, context, mapLessonToUI]); // Removed activeCourseId to prevent flickering loop

    // Initial Load
    useEffect(() => {
        fetchCoursesAndLessons();
    }, [fetchCoursesAndLessons]);

    // Effect to handle course change manually
    const handleCourseSelect = useCallback(async (courseId: string | null) => {
        if (courseId === null) {
            // Collapse/close all courses
            setActiveCourseId(null);
            setActiveCourseTitle('');
            setLessons([]);
            return;
        }

        const selectedCourse = courses.find(c => c.id === courseId);
        if (!selectedCourse) return;

        setActiveCourseId(courseId);
        setActiveCourseTitle(selectedCourse.title);

        // Fetch lessons for the selected course
        const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
        const hasSupabase = isSupabaseReady();

        if (!useMockData && hasSupabase && isConnected && context) {
            // Backend mode: fetch from database
            try {
                const dbLessons = await courseRepository.getCourseLessons(context, courseId);
                if (dbLessons.length > 0) {
                    const mergedLessons = await Promise.all(dbLessons.map(async (l) => {
                        const prog = await courseRepository.getLessonProgress(context, l.id);
                        return mapLessonToUI(l, (prog?.status as LessonStatus) || 'not_started');
                    }));
                    setLessons(mergedLessons);
                } else {
                    setLessons([]);
                }
            } catch (err) {
                console.error('Error fetching lessons:', err);
            }
        } else {
            // Mock mode: filter from localStorage and map to UI format
            const allLessons = JSON.parse(localStorage.getItem('academy_lessons') || '[]');
            const filteredLessons = allLessons
                .filter((l: any) => l.courseId === courseId)
                .map((l: any) => mapLessonToUI(l, l.status || 'not_started'));
            setLessons(filteredLessons);
        }
    }, [courses, isConnected, context, mapLessonToUI]);

    // Listen for storage changes (e.g., when admin panel makes changes)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent | Event) => {
            // Handle native storage event (other tabs)
            if (e instanceof StorageEvent) {
                if (e.key === 'academy_lessons' && e.newValue) {
                    console.log('📚 [CoursesTab] Detectada mudança no localStorage (outra aba), recarregando aulas...');
                    try {
                        const parsed = JSON.parse(e.newValue);
                        setLessons(parsed.map((l: any) => mapLessonToUI(l, l.status || 'not_started')));
                    } catch (error) {
                        console.error('Erro ao processar mudanças:', error);
                    }
                }
            }
            // Handle custom event (same tab)
            else if (e.type === 'academy_lessons_updated') {
                console.log('📚 [CoursesTab] Detectada mudança no localStorage (mesma aba), recarregando aulas...');
                const saved = localStorage.getItem('academy_lessons');
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        setLessons(parsed.map((l: any) => mapLessonToUI(l, l.status || 'not_started')));
                    } catch (error) {
                        console.error('Erro ao processar mudanças:', error);
                    }
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('academy_lessons_updated', handleStorageChange);


        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('academy_lessons_updated', handleStorageChange);
        };
    }, [mapLessonToUI, fetchCoursesAndLessons]);

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
        // Course Selection Props
        courses,
        activeCourseId,
        onCourseSelect: handleCourseSelect,
        // Callbacks
        onLessonClick: handleLessonClick,
        onFilterChange: setActiveFilter,
        onSearchChange: setSearchQuery,
        onTurboClick: handleTurboClick,
        courseTitle: activeCourseTitle
    }), [lessons, filteredLessons, activeFilter, searchQuery, lastLessonId, currentLevel, courses, activeCourseId, handleCourseSelect, handleLessonClick, handleTurboClick, activeCourseTitle]);

    // Se o player estiver aberto, mostrar apenas ele
    if (showPlayer && selectedLesson) {
        return (
            <VideoPlayer
                lessonId={selectedLesson.id}
                lessonTitle={selectedLesson.title}
                lessonNumber={parseInt(selectedLesson.id) || 1}
                totalLessons={lessons.length}
                courseTitle={activeCourseTitle}
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
            <div className="flex flex-col gap-4 flex-none">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight text-center lg:text-left">
                        Explorar Cursos
                    </h1>
                </div>
            </div>

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
