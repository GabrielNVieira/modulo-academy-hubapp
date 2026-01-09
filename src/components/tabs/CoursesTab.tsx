import { Search, PlayCircle, BookOpen, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { VideoPlayer, LessonStatus } from '../VideoPlayer';
import { E4CEOCard } from '../design-system';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../../lib/utils';
import { useProgress } from '../../hooks/useProgress';
import { useHubContext } from '../../hooks/useHubContext';
import { isSupabaseReady } from '../../lib/supabase';
import { courseRepository } from '../../services';

function isUUID(uuid: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

interface Lesson {
    id: string;
    title: string;
    xp: number;
    status: LessonStatus;
    videoUrl?: string;
}

type FilterType = 'not_started' | 'in_progress' | 'completed';

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

    const filteredLessons = lessons.filter(lesson =>
        lesson.status === activeFilter &&
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Função para abrir o player de vídeo
    const handleLessonClick = async (lesson: Lesson) => {
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
    };

    const handleProgressUpdate = async (time: number, percentage: number) => {
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
    };

    // Função para fechar o player
    const handleClosePlayer = () => {
        setShowPlayer(false);
        setSelectedLesson(null);
    };

    // Callback de atualização de status vindo do VideoPlayer
    const handleStatusChange = async (newStatus: LessonStatus) => {
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
        <div className="h-full space-y-6">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight text-center lg:text-left">Explorar Cursos</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Coluna Esquerda - Lista de Aulas (7 colunas) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <E4CEOCard size="none" className="flex items-center gap-3 bg-primary/5 border-primary/20 py-2 px-3">
                        <Avatar className="h-10 w-10 border-2 border-primary/30">
                            <AvatarImage src="https://via.placeholder.com/60" alt="Avatar" />
                            <AvatarFallback>JO</AvatarFallback>
                        </Avatar>
                        <div className="leading-tight">
                            <h2 className="text-sm font-bold text-foreground">Usuário</h2>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                Nível {currentLevel?.levelNumber || 1} • {currentLevel?.name || 'Explorador'}
                            </p>
                        </div>
                    </E4CEOCard>

                    {/* DEBUG TOOLS */}
                    <div className="flex justify-end -mt-2 mb-2">
                        <button
                            onClick={async () => {
                                const confirmAction = window.confirm('🛠️ DEBUG: Isso vai completar TODAS as aulas e dar o XP. Continuar?');
                                if (!confirmAction) return;

                                console.log('🛠️ DEBUG: Completando curso...');

                                // 1. Atualizar todas as aulas para completed
                                setLessons(prev => prev.map(l => ({ ...l, status: 'completed' })));

                                // 2. Dar XP das aulas que faltavam (simplificado: dá um xpsão)
                                // Calcular XP faltante
                                const xpMissing = lessons.reduce((acc, l) => l.status !== 'completed' ? acc + l.xp : acc, 0);
                                if (xpMissing > 0) await addXp(xpMissing, 'Debug: Aulas em Massa');

                                // 3. Disparar conclusão do curso
                                await addXp(0, 'Curso: Introdução ao Webhook');
                                console.log('🛠️ DEBUG: Curso completado!');
                                alert('Curso completado com sucesso! Verifique o contador.');
                            }}
                            className="text-[10px] font-mono bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                        >
                            🛠️ DEBUG: COMPLETAR CURSO
                        </button>
                    </div>

                    <Card className="border-border/50 shadow-xl overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-4 border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    Módulo: Introdução ao Webhook
                                </CardTitle>
                                <Badge variant="secondary" className="px-3">{filteredLessons.length} Aulas</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[450px]">
                                <div className="p-4 space-y-3">
                                    {filteredLessons.map((lesson) => (
                                        <div
                                            key={lesson.id}
                                            onClick={() => handleLessonClick(lesson)}
                                            className={cn(
                                                "group flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                                                "hover:bg-primary/5 hover:border-primary/40 active:scale-[0.99]",
                                                lesson.status === 'completed' ? "bg-emerald-50/30 border-emerald-100" : "bg-background border-border"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                                                    lesson.status === 'completed' ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                                                )}>
                                                    <PlayCircle className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                                                        {lesson.title.split(' - ')[0]}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Conteúdo exclusivo Academy</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="font-bold text-primary">{lesson.xp} XP</Badge>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Coluna Direita (5 colunas) */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                    {/* Busca e Filtros */}
                    <div className="space-y-2">
                        <E4CEOCard size="none" className="p-2.5">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar conteúdo..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 h-8 text-sm bg-background/50 border-border/50"
                                />
                            </div>
                        </E4CEOCard>

                        <div className="grid grid-cols-3 gap-2">
                            {(['not_started', 'in_progress', 'completed'] as FilterType[]).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={cn(
                                        "px-2 py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                        activeFilter === filter
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                                            : "bg-background text-muted-foreground border-border/50 hover:border-primary/40"
                                    )}
                                >
                                    {filter === 'not_started' ? 'Novas' : filter === 'in_progress' ? 'Em Curso' : 'Concluídas'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Card Motivacional / Proteger Diamond */}
                    <E4CEOCard
                        onClick={() => {
                            const lastLesson = lessons.find(l => l.id === lastLessonId);
                            const inProgressLesson = lessons.find(l => l.status === 'in_progress');
                            const firstAvailableLesson = lessons.find(l => l.status === 'not_started') || lessons[0];
                            handleLessonClick(lastLesson || inProgressLesson || firstAvailableLesson);
                        }}
                        className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-200/50 cursor-pointer group"
                    >
                        <h3 className="text-lg font-black text-foreground mb-8 tracking-tighter uppercase italic">TURBO XP BOOST</h3>

                        <div className="relative mb-8">
                            <div className="w-40 h-40 border-4 border-primary/30 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:border-primary/50 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-xl shadow-2xl flex items-center justify-center">
                                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all">
                                    <Play className="h-12 w-12 text-white fill-white ml-1" />
                                </div>
                            </div>
                            <div className="absolute -top-2 -right-2 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-black shadow-lg animate-bounce">
                                2X
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-bold text-muted-foreground">
                                {lastLessonId ? "PRONTO PARA CONTINUAR?" : "COMECE AGORA!"}
                            </p>
                            {lastLessonId && (
                                <Badge className="bg-primary hover:bg-primary px-4 py-1.5 text-xs font-black">
                                    {lessons.find(l => l.id === lastLessonId)?.title.split(' - ')[0]}
                                </Badge>
                            )}
                        </div>
                    </E4CEOCard>
                </div>
            </div>
        </div>
    );
}
