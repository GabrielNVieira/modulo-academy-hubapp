/**
 * CoursesGridConfig - Configuração dos cards para a aba Cursos
 * 
 * Segue o mesmo padrão de ProgressGridConfig.tsx
 */

import { Search, BookOpen, Play, ChevronDown } from 'lucide-react';
import { MetricaConfig, MetricaAtiva } from '@/components/MiniCardsGrid/MiniCardsGrid';
import { E4CEOCard } from '@/components/design-system';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Level } from '@/types';
import { LessonStatus } from '@/components/VideoPlayer';

// ============================================
// TIPOS
// ============================================

export interface Lesson {
    id: string;
    title: string;
    xp: number;
    status: LessonStatus;
    videoUrl?: string;
}

export type FilterType = 'not_started' | 'in_progress' | 'completed';

export interface CoursesData {
    lessons: Lesson[];
    filteredLessons: Lesson[];
    activeFilter: FilterType;
    searchQuery: string;
    lastLessonId: string | null;
    currentLevel: Level | null;
    // Course Selection Added
    courses: { id: string; title: string }[];
    activeCourseId: string | null;
    onCourseSelect: (id: string | null) => void;
    // Callbacks
    onLessonClick: (lesson: Lesson) => void;
    onFilterChange: (filter: FilterType) => void;
    onSearchChange: (query: string) => void;
    onTurboClick: () => void;
    courseTitle?: string;
}

// ============================================
// RENDERIZADORES CUSTOMIZADOS
// ============================================

// Card de Seleção de Cursos (não usado no layout final - comentado para evitar warnings)
/*
const CourseSelectorCardRender = ({ data }: { data: CoursesData }) => {
    const { courses, activeCourseId, onCourseSelect } = data;

    return (
        <Card className="h-full border-border/50 shadow-sm flex flex-col justify-center">
            <CardContent className="p-3">
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex w-max space-x-2 pb-2">
                        {courses.length > 0 ? courses.map(course => (
                            <button
                                key={course.id}
                                onClick={() => onCourseSelect(course.id)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                                    activeCourseId === course.id
                                        ? "bg-primary text-white border-primary ring-2 ring-primary/20 shadow-sm"
                                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-white hover:border-primary/50 hover:text-primary"
                                )}
                            >
                                {course.title}
                            </button>
                        )) : (
                            <div className="text-xs text-slate-400 italic px-2">Carregando cursos...</div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};
*/

// ============================================
// RENDERIZADORES CUSTOMIZADOS
// ============================================

// Card de Perfil do Usuário
const UserProfileCardRender = ({ data }: { data: CoursesData }) => {
    const { currentLevel } = data;

    return (
        <E4CEOCard size="none" className="h-full flex items-center gap-3 bg-primary/5 border-primary/20 py-2 px-3">
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
    );
};

// Card de Lista de Cursos e Aulas (Accordion)
const LessonListCardRender = ({ data }: { data: CoursesData }) => {
    const { courses, activeCourseId, onCourseSelect, filteredLessons, onLessonClick } = data;
    // Icons already imported at the top: BookOpen, Play (using Play instead of PlayCircle)

    return (
        <Card className="h-full border-border/50 shadow-xl overflow-hidden flex flex-col">
            <CardHeader className="bg-muted/30 pb-4 border-b flex-shrink-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Meus Cursos
                    </CardTitle>
                    <Badge variant="secondary" className="px-3">{courses.length} Cursos</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                        {courses.length > 0 ? courses.map((course) => {
                            const isActive = activeCourseId === course.id;

                            return (
                                <div key={course.id} className="rounded-xl border border-border/60 overflow-hidden bg-card transition-all">
                                    {/* Accordion Header (Course) */}
                                    <button
                                        onClick={() => onCourseSelect(isActive ? null : course.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 text-left transition-colors",
                                            isActive
                                                ? "bg-primary/5 text-primary font-bold border-b border-primary/10"
                                                : "bg-transparent text-foreground/80 hover:bg-slate-50 hover:text-primary font-medium"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-lg transition-colors",
                                                isActive ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                                            )}>
                                                <BookOpen className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm uppercase tracking-wide">{course.title}</span>
                                        </div>
                                        <ChevronDown className={cn(
                                            "h-5 w-5 transition-transform duration-200",
                                            isActive ? "rotate-180 text-primary" : "rotate-0 text-slate-400"
                                        )} />
                                    </button>

                                    {/* Accordion Body (Lessons) */}
                                    {isActive && (
                                        <div className="bg-slate-50/50 p-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                            {filteredLessons.length > 0 ? filteredLessons.map((lesson) => (
                                                <div
                                                    key={lesson.id}
                                                    onClick={() => onLessonClick(lesson)}
                                                    className={cn(
                                                        "group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ml-4",
                                                        "hover:bg-white hover:border-primary/40 hover:shadow-sm active:scale-[0.99]",
                                                        lesson.status === 'completed'
                                                            ? "bg-emerald-50/40 border-emerald-100/50"
                                                            : "bg-white/60 border-slate-200/60"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                                                            lesson.status === 'completed' ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                                                        )}>
                                                            <Play className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                                                {lesson.title.split(' - ')[0]}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground">Exclusivo Academy</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="text-[10px] font-bold text-primary px-2 h-5">{lesson.xp} XP</Badge>
                                                </div>
                                            )) : (
                                                <div className="p-4 text-center text-xs text-muted-foreground italic">
                                                    Nenhuma aula encontrada.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        }) : (
                            <div className="p-8 text-center text-muted-foreground">
                                Nenhum curso disponível.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

// Card de Busca e Filtros
const SearchFiltersCardRender = ({ data }: { data: CoursesData }) => {
    const { activeFilter, searchQuery, onFilterChange, onSearchChange } = data;

    return (
        <div className="h-full flex flex-col gap-2">
            <E4CEOCard size="none" className="p-2.5">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Buscar conteúdo..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-8 h-8 text-sm bg-background/50 border-border/50"
                    />
                </div>
            </E4CEOCard>

            <div className="grid grid-cols-3 gap-2 flex-1">
                {(['not_started', 'in_progress', 'completed'] as FilterType[]).map((filter) => (
                    <button
                        key={filter}
                        onClick={() => onFilterChange(filter)}
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
    );
};

// Card Motivacional TURBO XP
const TurboXPCardRender = ({ data }: { data: CoursesData }) => {
    const { lastLessonId, lessons, onTurboClick } = data;

    return (
        <E4CEOCard
            onClick={onTurboClick}
            className="h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-200/50 cursor-pointer group"
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
    );
};

// ============================================
// CONFIGURAÇÃO DAS MÉTRICAS
// ============================================

export const METRICAS_COURSES: MetricaConfig[] = [
    {
        id: 'user-profile',
        titulo: 'Meu Perfil',
        descricao: 'Nível e avatar do usuário',
        categoria: 'Geral',
        icon: BookOpen,
        cor: 'text-primary',
        borderColor: 'border-primary/20',
        getValue: () => '',
        renderCustom: (data: any) => <UserProfileCardRender data={data} />,
        canvasConfig: { gridCols: 4, gridRows: 1, colorScheme: 'blue' }
    },
    {
        id: 'lesson-list',
        titulo: 'Lista de Aulas',
        descricao: 'Aulas do módulo atual',
        categoria: 'Conteúdo',
        icon: BookOpen,
        cor: 'text-slate-700',
        borderColor: 'border-slate-200',
        getValue: () => '',
        renderCustom: (data: any) => <LessonListCardRender data={data} />,
        canvasConfig: { gridCols: 12, gridRows: 10, colorScheme: 'slate' }
    },
    {
        id: 'search-filters',
        titulo: 'Busca e Filtros',
        descricao: 'Pesquisar e filtrar aulas',
        categoria: 'Navegação',
        icon: Search,
        cor: 'text-slate-600',
        borderColor: 'border-slate-200',
        getValue: () => '',
        renderCustom: (data: any) => <SearchFiltersCardRender data={data} />,
        canvasConfig: { gridCols: 6, gridRows: 3, colorScheme: 'slate' }
    },
    {
        id: 'turbo-xp-cta',
        titulo: 'TURBO XP BOOST',
        descricao: 'Continuar estudando',
        categoria: 'Ação',
        icon: Play,
        cor: 'text-indigo-600',
        borderColor: 'border-indigo-200',
        getValue: () => '',
        renderCustom: (data: any) => <TurboXPCardRender data={data} />,
        canvasConfig: { gridCols: 6, gridRows: 8, colorScheme: 'indigo' }
    }
];

// ============================================
// LAYOUT PADRÃO
// ============================================

export const FINAL_LAYOUT_COURSES: MetricaAtiva[] = [
    // Coluna esquerda (colunas 0-1)
    { id: 'user-profile', size: '2x1', row: 0, col: 0 },
    { id: 'lesson-list', size: '2x5', row: 1, col: 0 },

    // Coluna direita (colunas 2-4)
    { id: 'search-filters', size: '3x2', row: 0, col: 2 },
    { id: 'turbo-xp-cta', size: '3x4', row: 2, col: 2 }
];
