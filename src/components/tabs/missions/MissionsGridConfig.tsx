import { Lock, CheckCircle2, Clock, Trophy, Flame, HelpCircle, ChevronRight, Target } from 'lucide-react';
import { MetricaConfig, MetricaAtiva } from '@/components/MiniCardsGrid/MiniCardsGrid';
import { E4CEOCard } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Mission } from '@/types';

export interface MissionsData {
    missions: Mission[];
    selectedMission: Mission | null;
    activeMissionsCount: number;
    totalMissions: number;
    streakDays: number;
    isLoading: boolean;
    isProcessing: boolean;
    showCompletionModal: boolean;
    onSelectMission: (id: string) => void;
    onToggleChecklistItem: (missionId: string, itemId: string) => void;
    onRequestHelp: (missionId: string) => void;
    onCompleteMission: () => void;
    onDebugCompleteAll?: () => void;
}

// === RENDERERS ===

const StatsCardRender = ({ data }: { data: MissionsData }) => {
    return (
        <E4CEOCard className="h-full flex items-center justify-between p-6 bg-white border-slate-200 shadow-sm relative overflow-hidden">

            <div className="flex flex-col items-center justify-center flex-1 border-r border-slate-100 pr-6">
                <span className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Missões Ativas</span>
                <div className="relative flex items-center justify-center w-16 h-12 rounded-2xl border-2 border-slate-900 text-slate-900 font-black text-xl bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    {data.activeMissionsCount}/{data.totalMissions}
                </div>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 pl-6">
                <span className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Sequência</span>
                <div className="flex items-center gap-2 text-orange-500">
                    <Flame className="h-6 w-6 animate-pulse" fill="currentColor" />
                    <span className="text-2xl font-black text-slate-900">
                        {data.streakDays}
                    </span>
                </div>
            </div>
        </E4CEOCard>
    );
};

const MissionListCardRender = ({ data }: { data: MissionsData }) => {
    const { missions, selectedMission, onSelectMission, onDebugCompleteAll } = data;

    return (
        <E4CEOCard className="h-full flex flex-col p-0 overflow-hidden border-slate-200 shadow-sm">
            <div className="p-6 pb-4 bg-white flex items-center justify-between shrink-0">
                <h3 className="text-xs font-black flex items-center gap-2 text-slate-400 uppercase tracking-widest">
                    <Target className="h-4 w-4" />
                    Lista de Missões
                </h3>
                {onDebugCompleteAll && (
                    <button
                        onClick={onDebugCompleteAll}
                        className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-1 rounded hover:bg-rose-200 transition-colors uppercase tracking-wider"
                    >
                        🛠️ Debug
                    </button>
                )}
            </div>
            <div className="flex-1 min-h-0 relative bg-white">
                <ScrollArea className="h-full w-full">
                    <div className="p-6 pt-2 space-y-4">
                        {missions.map((mission) => {
                            const isSelected = selectedMission?.id === mission.id;
                            const isLocked = mission.status === 'locked';
                            const isCompleted = mission.status === 'completed';
                            const isInProgress = mission.status === 'in_progress';

                            return (
                                <div
                                    key={mission.id}
                                    onClick={() => !isLocked && onSelectMission(mission.id)}
                                    className={cn(
                                        "relative group rounded-2xl border-2 transition-all duration-200 cursor-pointer p-4",
                                        isSelected
                                            ? "bg-white border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] z-10"
                                            : "bg-white border-slate-200 hover:border-slate-300",
                                        isLocked ? "opacity-50 grayscale bg-slate-50" : ""
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2",
                                            isCompleted ? "bg-emerald-100 text-emerald-600 border-emerald-600" :
                                                isInProgress ? "bg-primary text-white border-primary" :
                                                    isLocked ? "bg-slate-100 text-slate-400 border-slate-300" : "bg-white text-slate-400 border-slate-300"
                                        )}>
                                            {isLocked ? <Lock size={16} /> :
                                                isCompleted ? <CheckCircle2 size={18} /> :
                                                    <Trophy size={16} />}
                                        </div>

                                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-bold text-slate-700 text-xs uppercase tracking-tight line-clamp-1">{mission.title}</h3>
                                                <div className="text-[10px] font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                                                    +{mission.xpReward} XP
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {isInProgress && (
                                                    <span className="text-[9px] font-black text-white bg-blue-500 px-2 py-0.5 rounded-full uppercase">
                                                        Tutorial
                                                    </span>
                                                )}
                                                {!isInProgress && !isLocked && (
                                                    <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                                                        Livre
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                                                    <Clock size={10} /> {mission.estimatedTime}m
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>
        </E4CEOCard>
    );
};

const MissionDetailsCardRender = ({ data }: { data: MissionsData }) => {
    const { selectedMission, onToggleChecklistItem, onRequestHelp, onCompleteMission, isLoading, isProcessing, showCompletionModal } = data;
    const [showHelp, setShowHelp] = useState(false);

    if (!selectedMission) {
        return (
            <E4CEOCard className="h-full flex items-center justify-center p-6 border-slate-200">
                <div className="text-center opacity-30">
                    <Trophy size={80} className="mx-auto mb-4 text-slate-300" />
                    <h3 className="text-xl font-black uppercase text-slate-400">Pronto para a Missão?</h3>
                    <p className="text-sm font-bold">Selecione um alvo na lista tática</p>
                </div>
            </E4CEOCard>
        );
    }

    const canComplete = selectedMission.requirements.items
        .filter(item => item.required)
        .every(item => item.completed);

    return (
        <E4CEOCard className="h-full flex flex-col p-8 border-slate-200 shadow-sm relative overflow-hidden bg-white">
            <div className="flex items-start justify-between mb-8 shrink-0">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{selectedMission.title}</h2>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span className="bg-slate-100 px-2 py-1 rounded">{selectedMission.category}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {selectedMission.estimatedTime} Minutos</span>
                    </div>
                </div>
                <div className="border-2 border-slate-900 rounded-2xl px-4 py-3 text-center shrink-0 shadow-[4px_4px_0px_rgba(0,0,0,1)] bg-white">
                    <Trophy className="h-6 w-6 text-slate-900 mx-auto mb-1" />
                    <span className="text-sm font-black text-slate-900">+{selectedMission.xpReward} XP</span>
                </div>
            </div>

            <div className="space-y-8 flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Briefing da Operação</h3>
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <p className="text-slate-600 font-medium italic font-serif text-lg leading-relaxed">
                            "{selectedMission.description}"
                        </p>
                    </div>
                </div>

                <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Objetivos Táticos</h3>
                    <div className="space-y-3">
                        {selectedMission.requirements.items.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => {
                                    if (selectedMission.status !== 'completed' && selectedMission.status !== 'locked') {
                                        onToggleChecklistItem(selectedMission.id, item.id);
                                    }
                                }}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-full border-2 transition-all cursor-pointer group",
                                    item.completed
                                        ? "bg-slate-50 border-slate-200 opacity-60"
                                        : "bg-white border-slate-900 hover:shadow-[0px_4px_0px_rgba(0,0,0,1)] translate-y-0 hover:-translate-y-0.5",
                                )}
                            >
                                <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                                    item.completed ? "bg-slate-400 border-slate-400 text-white" : "bg-white border-slate-900 group-hover:bg-slate-900 group-hover:text-white"
                                )}>
                                    {item.completed && <CheckCircle2 size={14} />}
                                </div>
                                <div className="flex-1">
                                    <span className={cn(
                                        "text-sm font-bold",
                                        item.completed ? "text-slate-400 line-through" : "text-slate-900"
                                    )}>
                                        {item.text}
                                    </span>
                                    {item.required && !item.completed && <span className="ml-2 text-rose-500 font-black text-xs">!</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100 shrink-0 z-20">
                <Button
                    variant="outline"
                    onClick={() => {
                        setShowHelp(!showHelp);
                        if (!showHelp) onRequestHelp(selectedMission.id);
                    }}
                    className="h-12 px-8 border-2 border-slate-900 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none"
                >
                    <HelpCircle className="mr-2 h-4 w-4" /> Mentoria
                </Button>

                <Button
                    onClick={onCompleteMission}
                    disabled={!canComplete || selectedMission.status === 'completed' || isLoading || showCompletionModal || isProcessing}
                    variant="ghost"
                    className={cn(
                        "h-12 px-6 font-black uppercase tracking-[0.2em] text-xs transition-all",
                        canComplete && !isProcessing && !showCompletionModal
                            ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            : "text-slate-300 cursor-not-allowed"
                    )}
                >
                    {isLoading ? 'Sincronizando...' : selectedMission.status === 'completed' ? 'Missão Cumprida' : 'Extrair Recompensa'}
                </Button>

                {showHelp && selectedMission.helpContent && (
                    <div className="absolute bottom-24 left-8 max-w-sm bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom-4 z-[50]">
                        <div className="flex items-start gap-4">
                            <HelpCircle className="h-6 w-6 text-yellow-600 shrink-0" />
                            <div>
                                <h4 className="text-sm font-black text-yellow-900 uppercase mb-2">{selectedMission.helpContent.title}</h4>
                                <ul className="space-y-2">
                                    {selectedMission.helpContent.tips.map((tip, idx) => (
                                        <li key={idx} className="text-xs text-yellow-800 font-medium flex gap-2">
                                            <ChevronRight size={14} className="shrink-0" /> {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </E4CEOCard>
    );
};

export const METRICAS_MISSIONS: MetricaConfig[] = [
    {
        id: 'mission-stats',
        titulo: 'Status Operacional',
        descricao: 'Missões ativas e sequência',
        categoria: 'Geral',
        icon: Target,
        cor: 'text-primary',
        borderColor: 'border-border',
        getValue: () => '',
        renderCustom: (data: any) => <StatsCardRender data={data} />,
        canvasConfig: { gridCols: 4, gridRows: 2, colorScheme: 'slate' }
    },
    {
        id: 'mission-list',
        titulo: 'Lista de Missões',
        descricao: 'Selecione uma missão',
        categoria: 'Listas',
        icon: Target,
        cor: 'text-primary',
        borderColor: 'border-border',
        getValue: () => '',
        renderCustom: (data: any) => <MissionListCardRender data={data} />,
        canvasConfig: { gridCols: 4, gridRows: 8, colorScheme: 'slate' }
    },
    {
        id: 'mission-details',
        titulo: 'Detalhes da Missão',
        descricao: 'Informações e objetivos',
        categoria: 'Detalhes',
        icon: Target,
        cor: 'text-primary',
        borderColor: 'border-border',
        getValue: () => '',
        renderCustom: (data: any) => <MissionDetailsCardRender data={data} />,
        canvasConfig: { gridCols: 8, gridRows: 8, colorScheme: 'slate' }
    }
];

export const FINAL_LAYOUT_MISSIONS: MetricaAtiva[] = [
    // Coluna Esquerda (2 cols)
    { id: 'mission-stats', size: '2x1', row: 0, col: 0 },
    { id: 'mission-list', size: '2x7', row: 1, col: 0 },

    // Coluna Direita (3 cols)
    { id: 'mission-details', size: '3x8', row: 0, col: 2 }
];
