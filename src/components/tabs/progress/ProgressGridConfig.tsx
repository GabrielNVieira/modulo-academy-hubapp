import {
    GraduationCap,
    Flame,
    BookOpen,
    Target,
    Trophy
} from 'lucide-react';
import { MetricaConfig, MetricaAtiva } from '@/components/MiniCardsGrid/MiniCardsGrid';
import { UserProgress, UserStats, Streak, Level } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export interface ProgressData {
    progress: UserProgress | null;
    stats: UserStats | null;
    streak: Streak | null;
    currentLevel: Level | null;
}

// Renderizador Customizado para o Card de Perfil
const ProfileCardRender = ({ data }: { data: ProgressData }) => {
    if (!data?.currentLevel || !data?.stats) return null;

    const { currentLevel, stats } = data;

    return (
        <div className="relative h-full flex flex-col overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <GraduationCap size={120} />
            </div>

            <div className="flex items-center gap-4 mb-6 z-10">
                <Avatar className="h-16 w-16 border-2 border-primary/20 ring-2 ring-background shadow-lg">
                    <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                    <AvatarFallback>UN</AvatarFallback>
                </Avatar>
                <div>
                    <Badge variant="outline" className="mb-1 border-primary/30 text-primary bg-primary/5 text-xs">
                        Nível {currentLevel.levelNumber || 1}
                    </Badge>
                    <h2 className="text-lg font-bold text-slate-800 leading-tight">
                        {currentLevel.name || 'Explorador'}
                    </h2>
                </div>
            </div>

            <Separator className="bg-slate-100 mb-6" />

            {/* Barras de Progresso */}
            <div className="space-y-5 flex-1 z-10">
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-primary flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            XP para próximo nível
                        </span>
                        <span className="text-slate-600">
                            {stats.xp.nextLevel - stats.xp.current} XP
                        </span>
                    </div>
                    <Progress value={stats.xp.percentage || 0} className="h-2 bg-primary/10" />
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-emerald-500 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Experiência Total
                        </span>
                        <span className="text-slate-600">
                            {stats.xp.current?.toLocaleString() || 0} XP
                        </span>
                    </div>
                    <Progress
                        value={stats.xp.percentage || 0}
                        className="h-2 bg-emerald-500/10"
                        indicatorClassName="bg-emerald-500"
                    />
                </div>
            </div>
        </div>
    );
};

// Renderizador Customizado para o Card de Streak
const StreakCardRender = ({ data }: { data: ProgressData }) => {
    const currentStreak = data?.streak?.current || 0;

    return (
        <div className="h-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-orange-50 to-rose-50">
            <div className="absolute top-2 right-2">
                <Badge className="bg-orange-500 text-white border-0 text-[10px] px-2 py-0.5">Ativo</Badge>
            </div>

            <div className="text-4xl mb-2 animate-bounce uppercase">🔥</div>
            <div className="text-5xl font-black text-orange-500 tracking-tighter shadow-orange-200 drop-shadow-sm">
                {currentStreak}
            </div>
            <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mt-1">
                Dias Consecutivos
            </div>

            {/* Background decoration */}
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-orange-200 rounded-full opacity-20 blur-xl" />
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-rose-200 rounded-full opacity-20 blur-xl" />
        </div>
    );
};

export const METRICAS_PROGRESSO: MetricaConfig[] = [
    // === CARD PERFIL (HERO) ===
    {
        id: 'profile-hero',
        titulo: 'Meu Perfil',
        descricao: 'Resumo do nível e XP',
        categoria: 'Geral',
        icon: GraduationCap,
        cor: 'text-primary',
        borderColor: 'border-border', // Standard border
        getValue: () => '',
        renderCustom: (data: any) => <ProfileCardRender data={data} />,
        canvasConfig: { gridCols: 12, gridRows: 8, colorScheme: 'blue' }
    },

    // === CARD STREAK ===
    {
        id: 'streak-stats',
        titulo: 'Sequência',
        descricao: 'Dias seguidos estudando',
        categoria: 'Engajamento',
        icon: Flame,
        cor: 'text-orange-500',
        borderColor: 'border-orange-200',
        getValue: (data: any) => data?.streak?.current || 0,
        renderCustom: (data: any) => <StreakCardRender data={data} />,
        canvasConfig: { gridCols: 6, gridRows: 6, colorScheme: 'orange' }
    },

    // === STATS SIMPLES ===
    {
        id: 'stats-courses',
        titulo: 'Cursos',
        descricao: 'Concluídos / Total',
        categoria: 'Estatísticas',
        icon: BookOpen,
        cor: 'text-blue-600',
        borderColor: 'border-blue-100',
        getValue: (data: any) => `${data?.stats?.courses.completed || 0}/${data?.stats?.courses.total || 0}`,
        canvasConfig: { gridCols: 4, gridRows: 2, colorScheme: 'blue' }
    },
    {
        id: 'stats-missions',
        titulo: 'Missões',
        descricao: 'Missões finalizadas',
        categoria: 'Estatísticas',
        icon: Target,
        cor: 'text-emerald-600',
        borderColor: 'border-emerald-100',
        getValue: (data: any) => data?.stats?.missions.completed || 0,
        canvasConfig: { gridCols: 4, gridRows: 2, colorScheme: 'emerald' }
    },
    {
        id: 'stats-badges',
        titulo: 'Conquistas',
        descricao: 'Badges desbloqueadas',
        categoria: 'Estatísticas',
        icon: Trophy,
        cor: 'text-amber-600',
        borderColor: 'border-amber-100',
        getValue: (data: any) => data?.stats?.badges.earned || 0,
        canvasConfig: { gridCols: 4, gridRows: 2, colorScheme: 'amber' }
    },

    // === PLACEHOLDER PARA ARVORE (POR ENQUANTO) ===
    {
        id: 'progress-tree-placeholder',
        titulo: 'Árvore de Progresso',
        descricao: 'Visualização da jornada',
        categoria: 'Geral',
        icon: BookOpen, // Árvore não tem no lucide padrão, usando BookOpen ou similar
        cor: 'text-slate-600',
        borderColor: 'border-slate-200',
        getValue: () => 'Em Breve',
        renderCustom: () => (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50/50">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-2xl opacity-50">
                    🌳
                </div>
                <h3 className="font-semibold text-slate-700">Árvore de Progresso</h3>
                <p className="text-xs text-slate-500 max-w-[180px] mt-1">
                    Visualize sua jornada de aprendizado
                </p>
                <Badge variant="secondary" className="mt-3 text-[10px]">Em desenvolvimento</Badge>
            </div>
        ),
        canvasConfig: { gridCols: 12, gridRows: 8, colorScheme: 'slate' }
    }
];

export const DEFAULT_LAYOUT_PROGRESSO: MetricaAtiva[] = [
    // Linha 1: Perfil (4x3) + Stats (1x1 cada)
    { id: 'profile-hero', size: '2x3', row: 0, col: 0 },
    { id: 'streak-stats', size: '1x2', row: 0, col: 2 },
    { id: 'stats-badges', size: '1x1', row: 2, col: 2 },

    // Stats laterais
    { id: 'stats-courses', size: '1x1', row: 0, col: 3 },
    { id: 'stats-missions', size: '1x1', row: 1, col: 3 },

    // Placeholder Arvore ocupando resto
    { id: 'progress-tree-placeholder', size: '3x3', row: 0, col: 4 }, // Ajustando para caber no grid 5x5
    // O layout precisa ser ajustado pois o grid é 5x5.
    // Profile: 2x3 (col 0-1, row 0-2) -> ocupa 6 células
    // Streak: 1x2 (col 2, row 0-1) -> ocupa 2 células
    // Badges: 1x1 (col 2, row 2) -> 1 célula
    // Courses: 1x1 (col 3, row 0)
    // Missions: 1x1 (col 3, row 1)
    // Sobra col 3 row 2, col 4 row 0-2?
    // Vamos reajustar para ficar bonito no 5x5
];

// Layout Otimizado 5x5
export const OPTIMIZED_LAYOUT_PROGRESSO: MetricaAtiva[] = [
    // Coluna 1 e 2 (width 2) - Profile Card
    { id: 'profile-hero', size: '2x3', row: 0, col: 0 },

    // Coluna 3 - Streak e Badges
    { id: 'streak-stats', size: '1x2', row: 0, col: 2 },
    { id: 'stats-badges', size: '1x1', row: 2, col: 2 },

    // Coluna 4 - Stats pequenos
    { id: 'stats-courses', size: '1x1', row: 0, col: 3 },
    { id: 'stats-missions', size: '1x1', row: 1, col: 3 },
    // Espaço vazio em 3,2

    // Coluna 5 (e parte da 4?) - Arvore
    { id: 'progress-tree-placeholder', size: '2x3', row: 0, col: 3 } // Col 3 é ocupada.
    // Melhor:
    // Arvore na direita (2 cols)
    // Stats no meio
    // Profile na esquerda
];

// Layout Final Definido
export const FINAL_LAYOUT: MetricaAtiva[] = [
    // Coluna 0-1: Profile (2x3)
    { id: 'profile-hero', size: '2x3', row: 0, col: 0 },

    // Coluna 2: Stats empilhados (1x1 cada)
    { id: 'stats-courses', size: '1x1', row: 0, col: 2 },
    { id: 'stats-missions', size: '1x1', row: 1, col: 2 },
    { id: 'stats-badges', size: '1x1', row: 2, col: 2 },

    // Coluna 3: Streak (1x3) - Altura total
    { id: 'streak-stats', size: '1x3', row: 0, col: 3 },

    // Coluna 4: Tree (1x3) - Altura total
    { id: 'progress-tree-placeholder', size: '1x3', row: 0, col: 4 }
];
