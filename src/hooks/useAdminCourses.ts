import { useState, useEffect, useCallback } from 'react';
import type { Course, Lesson } from '../types';
import { useHubContext } from './useHubContext';
import { courseRepository } from '../services/course.repository';

const MAIN_COURSE_ID = '00000000-0000-4000-8000-000000000001';

// Mock Initial Data if empty
const INITIAL_COURSES: Course[] = [
    {
        id: MAIN_COURSE_ID,
        tenantId: 'demo',
        title: 'Curso: Introdução ao Webhook',
        description: 'Aprenda os fundamentos de webhooks e integrações.',
        icon: '🔗',
        level: 1,
        xpReward: 500,
        estimatedTime: '2h',
        orderIndex: 0,
        status: 'available',
        lessons: []
    }
];

const INITIAL_LESSONS: Lesson[] = [
    { id: '1', courseId: MAIN_COURSE_ID, title: 'AULA 1 - Introdução ao Sistema', xpReward: 10, orderIndex: 0, lessonType: 'video', videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
    { id: '2', courseId: MAIN_COURSE_ID, title: 'AULA 2 - Configuração Inicial', xpReward: 15, orderIndex: 1, lessonType: 'video', videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
    { id: '3', courseId: MAIN_COURSE_ID, title: 'AULA 3 - Primeiros Passos', xpReward: 20, orderIndex: 2, lessonType: 'video', videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
];

export function useAdminCourses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { context, isConnected } = useHubContext();

    // Helper to refresh data from backend
    const refreshData = useCallback(async () => {
        if (!context || !isConnected) return;

        try {
            setIsLoading(true);
            const dbCourses = await courseRepository.getCourses(context);

            // If backend is empty, we keep mocks in memory but don't overwrite them if we have local data
            if (dbCourses.length === 0) {
                // Check local storage first
                const savedCourses = localStorage.getItem('academy_courses');
                const savedLessons = localStorage.getItem('academy_lessons');

                if (savedCourses) {
                    setCourses(JSON.parse(savedCourses));
                } else {
                    setCourses(INITIAL_COURSES);
                }

                if (savedLessons) {
                    setLessons(JSON.parse(savedLessons));
                } else {
                    setLessons(INITIAL_LESSONS);
                }
                return;
            }

            setCourses(dbCourses);

            // Load all lessons for all courses
            const allLessons: Lesson[] = [];
            for (const course of dbCourses) {
                const courseLessons = await courseRepository.getCourseLessons(context, course.id);
                allLessons.push(...courseLessons);
            }
            setLessons(allLessons.length > 0 ? allLessons : INITIAL_LESSONS.filter(l => dbCourses.some(c => c.id === l.courseId)));
        } catch (error) {
            console.error('Failed to refresh admin data from backend', error);
        } finally {
            setIsLoading(false);
        }
    }, [context, isConnected]);

    // Initialize Data
    useEffect(() => {
        const loadInitialData = async () => {
            if (isConnected && context) {
                await refreshData();
                return;
            }

            try {
                // Fallback to local storage if no context
                const savedCourses = localStorage.getItem('academy_courses');
                if (savedCourses) {
                    setCourses(JSON.parse(savedCourses));
                } else {
                    setCourses(INITIAL_COURSES);
                    localStorage.setItem('academy_courses', JSON.stringify(INITIAL_COURSES));
                }

                const savedLessons = localStorage.getItem('academy_lessons');
                if (savedLessons) {
                    const parsedLessons = JSON.parse(savedLessons);
                    const updatedLessons = parsedLessons.map((l: any) => ({
                        ...l,
                        courseId: l.courseId || INITIAL_COURSES[0].id
                    }));
                    setLessons(updatedLessons);
                } else {
                    // Initialize with default lessons if nothing in localStorage
                    setLessons(INITIAL_LESSONS);
                    localStorage.setItem('academy_lessons', JSON.stringify(INITIAL_LESSONS));
                }
            } catch (error) {
                console.error('Failed to load admin data from local storage', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [isConnected, context, refreshData]);

    // Persist Courses
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('academy_courses', JSON.stringify(courses));
        }
    }, [courses, isLoading]);

    // Persist Lessons and Notify
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('academy_lessons', JSON.stringify(lessons));
            // Dispatch custom event for same-window sync
            window.dispatchEvent(new Event('academy_lessons_updated'));
        }
    }, [lessons, isLoading]);

    // --- CRUD COURSES ---

    const createCourse = useCallback(async (data: Partial<Course>) => {
        const id = crypto.randomUUID();
        const newCourse: Course = {
            id,
            tenantId: context?.tenantId || 'demo',
            title: data.title || 'Novo Curso',
            description: data.description || '',
            icon: data.icon || '📚',
            level: data.level || 1,
            xpReward: data.xpReward || 0,
            estimatedTime: data.estimatedTime || '0h',
            orderIndex: courses.length,
            status: 'available',
            lessons: []
        };

        // Optimistic update
        setCourses(prev => [...prev, newCourse]);

        if (isConnected && context) {
            try {
                await courseRepository.createCourse(context, newCourse);
                await refreshData();
            } catch (err) {
                console.error('Failed to create course in backend', err);
            }
        }
    }, [courses, context, isConnected, refreshData]);

    const updateCourse = useCallback(async (id: string, data: Partial<Course>) => {
        // Optimistic update
        setCourses(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));

        if (isConnected && context) {
            try {
                await courseRepository.updateCourse(context, id, data);
            } catch (err) {
                console.error('Failed to update course in backend', err);
            }
        }
    }, [context, isConnected]);

    const deleteCourse = useCallback(async (id: string) => {
        if (confirm('Tem certeza? Isso apagará também todas as aulas deste curso.')) {
            // Optimistic update
            setCourses(prev => prev.filter(c => c.id !== id));
            setLessons(prev => prev.filter(l => l.courseId !== id));

            if (isConnected && context) {
                try {
                    await courseRepository.deleteCourse(context, id);
                } catch (err) {
                    console.error('Failed to delete course in backend', err);
                }
            }
        }
    }, [context, isConnected]);

    // --- CRUD LESSONS ---

    const getCourseLessons = useCallback((courseId: string) => {
        return lessons
            .filter(l => l.courseId === courseId)
            .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    }, [lessons]);

    const createLesson = useCallback(async (courseId: string, data: Partial<Lesson>) => {
        const currentCourseLessons = lessons.filter(l => l.courseId === courseId);
        const newLesson: Lesson = {
            id: crypto.randomUUID(),
            courseId,
            title: data.title || 'Nova Aula',
            content: data.content || '',
            videoUrl: data.videoUrl || '',
            xpReward: data.xpReward || 10,
            orderIndex: currentCourseLessons.length,
            lessonType: data.lessonType || 'video',
        };

        // Optimistic update
        setLessons(prev => [...prev, newLesson]);

        if (isConnected && context) {
            try {
                await courseRepository.createLesson(context, newLesson);
                await refreshData();
            } catch (err) {
                console.error('Failed to create lesson in backend', err);
            }
        }
    }, [lessons, context, isConnected, refreshData]);

    const updateLesson = useCallback(async (id: string, data: Partial<Lesson>) => {
        // Optimistic update
        setLessons(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));

        if (isConnected && context) {
            try {
                await courseRepository.updateLesson(context, id, data);
            } catch (err) {
                console.error('Failed to update lesson in backend', err);
            }
        }
    }, [context, isConnected]);

    const deleteLesson = useCallback(async (id: string) => {
        if (confirm('Excluir esta aula?')) {
            // Optimistic update
            setLessons(prev => prev.filter(l => l.id !== id));

            if (isConnected && context) {
                try {
                    await courseRepository.deleteLesson(context, id);
                } catch (err) {
                    console.error('Failed to delete lesson in backend', err);
                }
            }
        }
    }, [context, isConnected]);

    const reorderLessons = useCallback(async (courseId: string, startIndex: number, endIndex: number) => {
        // Implementation for drag and drop reordering would go here
        // For now, simplified
    }, []);

    return {
        courses,
        lessons,
        isLoading,
        createCourse,
        updateCourse,
        deleteCourse,
        getCourseLessons,
        createLesson,
        updateLesson,
        deleteLesson
    };
}
