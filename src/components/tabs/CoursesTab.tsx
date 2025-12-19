/**
 * Academy Module - Courses Tab
 *
 * Aba de cursos com lista de aulas e filtros por nível
 */

import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { VideoPlayer, LessonStatus } from '../VideoPlayer';

interface Lesson {
    id: string;
    title: string;
    xp: number;
    status: LessonStatus;
}

type FilterType = 'not_started' | 'in_progress' | 'completed';

// Dados iniciais (default)
const INITIAL_LESSONS: Lesson[] = [
    { id: '1', title: 'AULA 1 - Introdução ao Sistema', xp: 10, status: 'not_started' },
    { id: '2', title: 'AULA 2 - Configuração Inicial', xp: 15, status: 'not_started' },
    { id: '3', title: 'AULA 3 - Primeiros Passos', xp: 20, status: 'not_started' },
    { id: '4', title: 'AULA 4 - Funcionalidades Básicas', xp: 25, status: 'not_started' },
    { id: '5', title: 'AULA 5 - Recursos Avançados', xp: 30, status: 'not_started' },
    { id: '6', title: 'AULA 6 - Integrações', xp: 35, status: 'not_started' },
    { id: '7', title: 'AULA 7 - Boas Práticas', xp: 40, status: 'not_started' },
    { id: '8', title: 'AULA 8 - Projeto Final', xp: 50, status: 'not_started' },
    { id: '9', title: 'AULA 9 - Certificação', xp: 100, status: 'not_started' },
];

export function CoursesTab() {
    const [activeFilter, setActiveFilter] = useState<FilterType>('not_started');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [showPlayer, setShowPlayer] = useState(false);

    // Estado das aulas com persistência
    const [lessons, setLessons] = useState<Lesson[]>(() => {
        const saved = localStorage.getItem('academy_lessons');
        return saved ? JSON.parse(saved) : INITIAL_LESSONS;
    });

    // Salvar aulas sempre que mudar
    useEffect(() => {
        localStorage.setItem('academy_lessons', JSON.stringify(lessons));
    }, [lessons]);

    // Estado da última aula acessada
    const [lastLessonId, setLastLessonId] = useState<string | null>(() => {
        return localStorage.getItem('academy_last_lesson');
    });

    // Salvar última aula sempre que mudar
    useEffect(() => {
        if (lastLessonId) {
            localStorage.setItem('academy_last_lesson', lastLessonId);
        }
    }, [lastLessonId]);

    const filteredLessons = lessons.filter(lesson =>
        lesson.status === activeFilter &&
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Função para abrir o player de vídeo
    const handleLessonClick = (lesson: Lesson) => {
        setSelectedLesson(lesson);
        setLastLessonId(lesson.id);
        setShowPlayer(true);
    };

    // Função para fechar o player
    const handleClosePlayer = () => {
        setShowPlayer(false);
        setSelectedLesson(null);
    };

    // Callback de atualização de status vindo do VideoPlayer
    const handleStatusChange = (newStatus: LessonStatus) => {
        if (!selectedLesson) return;

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
    };

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
                videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                onBack={handleClosePlayer}
                onStatusChange={handleStatusChange}
            />
        );
    }

    return (
        <div className="h-full p-4">
            {/* Título */}
            <h1 className="text-xl font-bold text-gray-900 mb-6 text-center tracking-wide">ABA CURSOS</h1>

            {/* Layout com 2 colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ height: 'calc(100% - 70px)' }}>
                {/* Coluna Esquerda - Lista de Aulas */}
                <div className="flex flex-col gap-3 h-full">
                    {/* Seletor de Usuário/Avatar */}
                    <div className="bg-white border-2 border-gray-300 rounded-xl p-3 flex items-center gap-3 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-gray-300 flex items-center justify-center">
                            <span className="text-xl">👤</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">JOAO</p>
                            <p className="text-xs text-gray-600 font-medium">EXPLORADOR/TA</p>
                        </div>
                    </div>

                    {/* Lista de Aulas */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {filteredLessons.map((lesson) => (
                            <div
                                key={lesson.id}
                                onClick={() => handleLessonClick(lesson)}
                                className="bg-white border-2 border-gray-300 rounded-xl p-4 flex items-center justify-between hover:border-gray-400 hover:shadow-md transition-all cursor-pointer group"
                            >
                                <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {lesson.title.split(' - ')[0]}
                                </span>
                                <span className="text-sm font-bold text-gray-700">{lesson.xp} XP</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coluna Direita - Busca, Filtros e Card Motivacional */}
                <div className="flex flex-col gap-4 h-full">
                    {/* Busca */}
                    <div className="bg-white border-2 border-gray-300 rounded-xl p-4 shadow-sm">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="BUSCAR CURSOS E AULAS ESPECÍFICAS"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg text-sm font-medium placeholder:text-gray-500 placeholder:font-normal focus:outline-none focus:border-blue-400 transition-colors"
                            />
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    {/* Filtros por Nível */}
                    <div className="bg-white border-2 border-gray-300 rounded-xl p-5 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 mb-4 text-center italic tracking-wide">NÍVEL</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setActiveFilter('not_started')}
                                className={`
                                    border-2 rounded-xl p-5 text-xs font-bold text-gray-800 uppercase tracking-wide
                                    transition-all hover:border-gray-400 hover:shadow-md
                                    ${activeFilter === 'not_started'
                                        ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-md'
                                        : 'border-gray-300 bg-white'
                                    }
                                `}
                            >
                                NÃO INICIADOS
                            </button>
                            <button
                                onClick={() => setActiveFilter('in_progress')}
                                className={`
                                    border-2 rounded-xl p-5 text-xs font-bold text-gray-800 uppercase tracking-wide
                                    transition-all hover:border-gray-400 hover:shadow-md
                                    ${activeFilter === 'in_progress'
                                        ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-md'
                                        : 'border-gray-300 bg-white'
                                    }
                                `}
                            >
                                EM PROGRESSO
                            </button>
                            <button
                                onClick={() => setActiveFilter('completed')}
                                className={`
                                    border-2 rounded-xl p-5 text-xs font-bold text-gray-800 uppercase tracking-wide
                                    transition-all hover:border-gray-400 hover:shadow-md
                                    ${activeFilter === 'completed'
                                        ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-md'
                                        : 'border-gray-300 bg-white'
                                    }
                                `}
                            >
                                CONCLUÍDOS
                            </button>
                        </div>
                    </div>

                    {/* Card Motivacional */}
                    <div
                        onClick={() => {
                            // Tenta encontrar a última aula, ou fallback para lógica inteligente
                            const lastLesson = lessons.find(l => l.id === lastLessonId);
                            const inProgressLesson = lessons.find(l => l.status === 'in_progress');
                            const firstAvailableLesson = lessons.find(l => l.status === 'not_started') || lessons[0];

                            handleLessonClick(lastLesson || inProgressLesson || firstAvailableLesson);
                        }}
                        className="flex-1 bg-white border-2 border-gray-300 rounded-xl p-6 cursor-pointer hover:border-gray-400 hover:shadow-lg transition-all shadow-sm group"
                    >
                        <h3 className="text-base font-bold text-gray-900 mb-6 text-center tracking-wide">CONTINUE A GANHAR XP</h3>
                        <div className="flex flex-col items-center justify-center h-full gap-6">
                            {/* Ícone diamante */}
                            <div className="relative w-36 h-36">
                                <div className="w-full h-full border-4 border-gray-300 rounded-2xl transform rotate-45 bg-gradient-to-br from-blue-50 to-purple-50 group-hover:from-blue-100 group-hover:to-purple-100 transition-all group-hover:scale-110 shadow-lg"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-4xl transform -rotate-45">💎</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600 font-medium mb-1">
                                    {lastLessonId
                                        ? "Continuar de onde parou:"
                                        : "Comece sua jornada!"}
                                </p>
                                {lastLessonId && (
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide max-w-[200px] mx-auto truncate">
                                        {lessons.find(l => l.id === lastLessonId)?.title.split(' - ')[0]}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
