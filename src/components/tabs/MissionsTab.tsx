import { useState, useEffect } from 'react';
import { Lock, CheckCircle2, Clock, Trophy, Flame, HelpCircle, ChevronRight, Target } from 'lucide-react';
import { useMissions } from '../../hooks/useMissions';
import { useProgress } from '../../hooks/useProgress';
import { E4CEOCard } from '../design-system';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';

export function MissionsTab() {
    const {
        missions,
        selectedMission,
        isLoading,
        selectMission,
        toggleChecklistItem,
        requestHelp,
        completeMission,
    } = useMissions();

    const { streak, addXp } = useProgress();
    const [showHelp, setShowHelp] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completedMissionXp, setCompletedMissionXp] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Selecionar primeira missão disponível ao carregar
    useEffect(() => {
        if (!selectedMission && missions.length > 0) {
            const firstAvailable = missions.find(m => m.status === 'available' || m.status === 'in_progress');
            if (firstAvailable) {
                selectMission(firstAvailable.id);
            }
        }
    }, [missions, selectedMission, selectMission]);

    // Contar missões ativas
    const activeMissionsCount = missions.filter(m => m.status === 'in_progress').length;
    const totalMissions = missions.length;

    // Handler para completar missão
    const handleCompleteMission = async () => {
        if (!selectedMission || isProcessing) return;
        setIsProcessing(true);

        try {
            const result = await completeMission(selectedMission.id);

            if (result.success) {
                // Adicionar XP ao progresso do usuário
                await addXp(result.xpEarned, `Missão: ${selectedMission.title}`);

                // Mostrar modal de celebração
                setShowCompletionModal(true);
                setCompletedMissionXp(result.xpEarned);

                // Confetti!
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                });

                // Fechar modal após 3 segundos e selecionar próxima missão
                setTimeout(() => {
                    setShowCompletionModal(false);
                    setIsProcessing(false);
                    const nextMission = missions.find(m => m.status === 'available');
                    if (nextMission) {
                        selectMission(nextMission.id);
                    }
                }, 3000);
            } else {
                setIsProcessing(false);
            }
        } catch (error) {
            console.error(error);
            setIsProcessing(false);
        }
    };

    // Verificar se todos os itens obrigatórios estão completos
    const canComplete = selectedMission
        ? selectedMission.requirements.items
            .filter(item => item.required)
            .every(item => item.completed)
        : false;

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-12 mt-4 pb-2">
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Missões Operacionais</h1>
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="px-4 py-1.5 border-primary/20 bg-primary/5 text-primary font-bold">
                        {activeMissionsCount}/{totalMissions} ATIVAS
                    </Badge>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full px-4 py-1.5 shadow-lg shadow-orange-500/20">
                        <Flame className="h-4 w-4 text-white animate-pulse" />
                        <span className="text-sm font-black text-white">
                            {streak?.current || 0} DIAS
                        </span>
                    </div>
                </div>
            </div>

            {/* Layout 2 colunas - Flex-1 para ocupar o resto da altura */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                {/* Coluna Esquerda - Lista de Missões */}
                <div className="lg:col-span-6 xl:col-span-5">
                    <E4CEOCard className="h-full flex flex-col p-0 overflow-hidden border-white/20 shadow-2xl">
                        <div className="p-4 border-b border-gray-100 bg-white/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
                            <h3 className="text-sm font-bold flex items-center gap-2 text-gray-700 uppercase tracking-tight">
                                <Target className="h-4 w-4 text-primary" />
                                Lista de Missões
                            </h3>
                            <button
                                onClick={async () => {
                                    const confirmAction = window.confirm('🛠️ DEBUG: Isso vai completar TODAS as missões desbloqueadas. Continuar?');
                                    if (!confirmAction) return;

                                    // Encontrar todas as missões não completadas
                                    const missionsToComplete = missions.filter(m => m.status !== 'completed');

                                    let totalXp = 0;
                                    for (const m of missionsToComplete) {
                                        if (m.status === 'locked') continue;
                                        console.log(`🛠️ DEBUG: Completando ${m.title}...`);
                                        const result = await completeMission(m.id);
                                        if (result.success) totalXp += result.xpEarned;
                                    }

                                    if (totalXp > 0) {
                                        await addXp(totalXp, 'Debug: Missões em Massa');
                                    }
                                }}
                                className="text-[10px] font-mono bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                            >
                                🛠️ DEBUG
                            </button>
                        </div>
                        <div className="flex-1 min-h-0 relative">
                            <ScrollArea className="h-full w-full">
                                <div className="p-4 space-y-4">
                                    {missions.map((mission) => {
                                        const isSelected = selectedMission?.id === mission.id;
                                        const isLocked = mission.status === 'locked';
                                        const isCompleted = mission.status === 'completed';
                                        const isInProgress = mission.status === 'in_progress';

                                        return (
                                            <div
                                                key={mission.id}
                                                onClick={() => !isLocked && selectMission(mission.id)}
                                                className={cn(
                                                    "relative overflow-hidden group rounded-xl border-2 transition-all duration-200 cursor-pointer p-3",
                                                    isSelected
                                                        ? "bg-primary/5 border-primary shadow-md ring-1 ring-primary/10 z-10"
                                                        : "bg-white/50 border-white/40 hover:border-primary/30 hover:bg-white/80 hover:shadow-sm",
                                                    isLocked ? "opacity-50 grayscale" : ""
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border",
                                                        isCompleted ? "bg-emerald-500 text-white border-emerald-400" :
                                                            isInProgress ? "bg-primary text-white border-primary/50" : "bg-muted text-muted-foreground border-border"
                                                    )}>
                                                        {isLocked ? <Lock size={16} /> :
                                                            isCompleted ? <CheckCircle2 size={18} /> :
                                                                <Trophy size={16} />}
                                                    </div>

                                                    <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h3 className="font-bold text-foreground text-sm leading-tight flex-1">{mission.title}</h3>
                                                            <div className="text-xs font-black text-primary whitespace-nowrap bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                                                                +{mission.xpReward} XP
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {isInProgress && (
                                                                <Badge variant="outline" className="text-[10px] px-2 h-5 border-primary/30 text-primary uppercase font-bold">
                                                                    Ativa
                                                                </Badge>
                                                            )}
                                                            <Badge className={cn(
                                                                "text-[10px] px-2 h-5 uppercase font-bold",
                                                                mission.type === 'tutorial' ? "bg-blue-500 hover:bg-blue-600" :
                                                                    mission.type === 'problema' ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"
                                                            )}>
                                                                {mission.type}
                                                            </Badge>
                                                            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                                                <Clock size={12} className="text-primary/60" /> {mission.estimatedTime}m
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {isInProgress && (
                                                    <div className="mt-3">
                                                        <Progress
                                                            value={(mission.requirements.items.filter(i => i.completed).length / mission.requirements.items.length) * 100}
                                                            className="h-1 bg-primary/10"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </div>
                    </E4CEOCard>
                </div>

                {/* Coluna Direita - Detalhes */}
                <div className="lg:col-span-6 xl:col-span-7">
                    {selectedMission ? (
                        <E4CEOCard className="h-full flex flex-col p-6 border-white/20 shadow-2xl">
                            <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-100">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">{selectedMission.title}</h2>
                                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
                                        <Badge variant="outline" className="text-gray-500 border-gray-200 bg-gray-50">{selectedMission.category}</Badge>
                                        <span className="flex items-center gap-1 text-gray-400"><Clock size={12} /> {selectedMission.estimatedTime} Minutos</span>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-3 text-center shrink-0 shadow-sm">
                                    <Trophy className="h-5 w-5 text-primary mx-auto mb-1" />
                                    <span className="text-base font-black text-primary">+{selectedMission.xpReward} XP</span>
                                </div>
                            </div>

                            <div className="space-y-6 flex-1">
                                <div>
                                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Briefing da Operação</h3>
                                    <div className="bg-muted/30 rounded-2xl p-4 border-l-4 border-primary shadow-inner">
                                        <p className="text-sm text-foreground leading-relaxed font-medium italic">
                                            "{selectedMission.description}"
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Objetivos Táticos</h3>
                                    <div className="space-y-2.5">
                                        {selectedMission.requirements.items.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => {
                                                    if (selectedMission.status !== 'completed' && selectedMission.status !== 'locked') {
                                                        toggleChecklistItem(selectedMission.id, item.id);
                                                    }
                                                }}
                                                className={cn(
                                                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                                                    item.completed ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/20 border-border/50 hover:border-primary/40",
                                                    selectedMission.status !== 'completed' && selectedMission.status !== 'locked' ? "cursor-pointer active:scale-[0.99]" : ""
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors",
                                                    item.completed ? "bg-emerald-500 border-emerald-500 text-white" : "bg-background border-border"
                                                )}>
                                                    {item.completed && <CheckCircle2 size={14} />}
                                                </div>
                                                <div className="flex-1">
                                                    <span className={cn(
                                                        "text-sm font-bold",
                                                        item.completed ? "text-emerald-700/70 line-through" : "text-foreground"
                                                    )}>
                                                        {item.text}
                                                    </span>
                                                    {item.required && <span className="ml-2 text-rose-500 font-black">!</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>


                            <div className="flex gap-3 mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowHelp(!showHelp);
                                        if (!showHelp) requestHelp(selectedMission.id);
                                    }}
                                    className="h-12 px-6 border-2 font-black uppercase tracking-widest text-xs rounded-xl"
                                >
                                    <HelpCircle className="mr-2 h-4 w-4" /> Mentoria
                                </Button>
                                <Button
                                    onClick={handleCompleteMission}
                                    disabled={!canComplete || selectedMission.status === 'completed' || isLoading || showCompletionModal || isProcessing}
                                    className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 font-black uppercase tracking-[0.2em] text-xs rounded-xl"
                                >
                                    {isLoading ? 'Sincronizando...' : selectedMission.status === 'completed' ? 'Missão Cumprida' : 'Extrair Recompensa'}
                                </Button>
                                {showHelp && selectedMission.helpContent && (
                                    <div className="fixed bottom-32 right-8 max-w-sm bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-4">
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
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center opacity-30">
                                <Trophy size={80} className="mx-auto mb-4" />
                                <h3 className="text-xl font-black uppercase">Pronto para a Missão?</h3>
                                <p className="text-sm font-bold">Selecione um alvo na lista tática</p>
                            </div>
                        </div>
                    )}
                </div>
            </div >

            {/* Modal de Conclusão Glassmorphism */}
            {
                showCompletionModal && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in">
                        <E4CEOCard className="max-w-md w-full p-12 text-center border-primary/20 shadow-primary/10 animate-in zoom-in-95 duration-300 flex flex-col items-center justify-center">
                            <div className="text-7xl mb-6 animate-bounce">🏆</div>
                            <h2 className="text-3xl font-black text-foreground mb-4 uppercase italic tracking-tighter">Missão Cumprida!</h2>
                            <p className="text-muted-foreground font-medium mb-8">Excelente trabalho, operacional. Seus dados foram sincronizados com sucesso.</p>
                            <div className="bg-emerald-500 text-white font-black text-2xl py-4 px-10 rounded-2xl shadow-xl shadow-emerald-500/30 tracking-widest transform hover:scale-105 transition-transform cursor-default">
                                +{completedMissionXp} XP
                            </div>
                        </E4CEOCard>
                    </div>
                )
            }
        </div >
    );
}
