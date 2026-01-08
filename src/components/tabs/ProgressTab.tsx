/**
 * Academy Module - Progress Tab
 *
 * Aba principal mostrando o progresso do usuário:
 * - Hero section com avatar, nível e XP
 * - Stats cards
 * - Árvore de progressão
 * - Streak card
 */

import { E4CEOCard } from '../design-system';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { GraduationCap } from 'lucide-react';

import { UserProgress, UserStats, Streak, Level } from '../../types';

interface ProgressTabProps {
    progress: UserProgress | null;
    stats: UserStats | null;
    streak: Streak | null;
    currentLevel: Level | null;
    isLoading: boolean;
}

export function ProgressTab({ progress, stats, streak, currentLevel, isLoading }: ProgressTabProps) {
    if (isLoading) {
        return <ProgressTabSkeleton />;
    }

    if (!progress || !stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground font-medium">Nenhum dado de progresso encontrado.</p>
            </div>
        );
    }

    return (
        <div className="h-full space-y-6">
            {/* Título */}
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight text-center lg:text-left">Dashboard de Progresso</h1>

            {/* Layout com 2 colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Coluna Esquerda */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Card Principal - Avatar + Nível + XP */}
                    <E4CEOCard className="relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <GraduationCap size={80} />
                        </div>

                        <div className="flex flex-col gap-6 relative z-10">
                            {/* Perfil */}
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20 border-4 border-primary/20 ring-4 ring-background shadow-xl">
                                    <AvatarImage src="https://via.placeholder.com/80" alt="Avatar" />
                                    <AvatarFallback>UN</AvatarFallback>
                                </Avatar>
                                <div>
                                    <Badge variant="outline" className="mb-1 border-primary/30 text-primary bg-primary/5">Nível {currentLevel?.levelNumber || 1}</Badge>
                                    <h2 className="text-xl font-bold text-foreground">{currentLevel?.name || 'Explorador'}</h2>
                                </div>
                            </div>

                            <Separator className="bg-border/50" />

                            {/* Barras de Progresso */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-primary flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            XP para próximo nível
                                        </span>
                                        <span className="text-foreground">
                                            {stats ? stats.xp.nextLevel - stats.xp.current : 0} XP
                                        </span>
                                    </div>
                                    <Progress value={stats?.xp.percentage || 0} className="h-2.5 bg-primary/10" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-emerald-500 flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            Experiência Total
                                        </span>
                                        <span className="text-foreground">{stats?.xp.current || 0} XP</span>
                                    </div>
                                    <Progress
                                        value={stats?.xp.percentage || 0}
                                        className="h-2.5 bg-emerald-500/10"
                                        indicatorClassName="bg-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </E4CEOCard>

                    {/* Estatísticas Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <E4CEOCard size="small" className="flex flex-col items-center justify-center text-center p-3">
                            <span className="text-lg font-bold text-foreground">{stats?.courses.completed}/{stats?.courses.total}</span>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Cursos</span>
                        </E4CEOCard>
                        <E4CEOCard size="small" className="flex flex-col items-center justify-center text-center p-3">
                            <span className="text-lg font-bold text-foreground">{stats?.missions.completed}</span>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Missões</span>
                        </E4CEOCard>
                        <E4CEOCard size="small" className="flex flex-col items-center justify-center text-center p-3">
                            <span className="text-lg font-bold text-foreground">{stats?.badges.earned}</span>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Badges</span>
                        </E4CEOCard>
                    </div>

                    {/* Card Streak */}
                    <E4CEOCard className="bg-gradient-to-br from-orange-500/10 to-rose-500/10 border-orange-200/50 shadow-orange-500/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                                <span className="text-xl">🔥</span>
                                Sequência
                            </h3>
                            <Badge className="bg-orange-500 text-white border-0">Ativo</Badge>
                        </div>

                        <div className="flex flex-col items-center justify-center py-4 bg-background/40 backdrop-blur-sm rounded-2xl border border-white/20 shadow-inner">
                            <div className="text-5xl mb-1 animate-streak-fire">🔥</div>
                            <div className="text-4xl font-black text-orange-500">{streak?.current || 0}</div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Dias Consecutivos</div>
                        </div>
                    </E4CEOCard>
                </div>

                {/* Coluna Direita - Árvore de Progresso */}
                <div className="lg:col-span-8">
                    <E4CEOCard className="h-full min-h-[400px] flex items-center justify-center bg-background/50 border-dashed border-2 relative group">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                        <div className="text-center space-y-4 relative z-10">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-2 text-3xl opacity-50">
                                🌳
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Árvore de Progresso</h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                Visualize sua jornada de aprendizado e desbloqueie novas habilidades conforme avança nos cursos.
                            </p>
                            <Badge variant="secondary" className="px-4 py-1">Em Breve</Badge>
                        </div>
                    </E4CEOCard>
                </div>
            </div>
        </div>
    );
}

// ==================== SKELETON ====================

function ProgressTabSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
            <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl p-6 h-40" />
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl h-24" />
                    <div className="bg-white rounded-xl h-24" />
                    <div className="bg-white rounded-xl h-24" />
                </div>
                <div className="bg-white rounded-2xl h-32" />
            </div>
            <div className="lg:col-span-7">
                <div className="bg-white rounded-2xl h-80" />
            </div>
        </div>
    );
}
