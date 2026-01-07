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
                            <h2 className="text-sm font-bold text-foreground">JOAO</h2>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Explorador Academy</p>
                        </div>
                    </E4CEOCard>

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
