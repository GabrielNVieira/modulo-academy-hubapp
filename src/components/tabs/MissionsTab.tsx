import { useState, useEffect, useMemo, useCallback } from 'react';
import { useMissions } from '../../hooks/useMissions';
import { useProgress } from '../../hooks/useProgress';
import { E4CEOCard } from '../design-system';
import { MiniCardsGrid } from '@/components/MiniCardsGrid/MiniCardsGrid';
import {
    METRICAS_MISSIONS,
    FINAL_LAYOUT_MISSIONS,
    MissionsData
} from './missions/MissionsGridConfig';
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
    const handleCompleteMission = useCallback(async () => {
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
    }, [selectedMission, isProcessing, completeMission, addXp, missions, selectMission]);

    const handleDebugCompleteAll = useCallback(async () => {
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
    }, [missions, completeMission, addXp]);


    // Preparar dados para o grid
    const gridData: MissionsData = useMemo(() => ({
        missions,
        selectedMission,
        activeMissionsCount,
        totalMissions,
        streakDays: streak?.current || 0,
        isLoading,
        isProcessing,
        showCompletionModal,
        onSelectMission: selectMission,
        onToggleChecklistItem: toggleChecklistItem,
        onRequestHelp: requestHelp,
        onCompleteMission: handleCompleteMission,
        onDebugCompleteAll: handleDebugCompleteAll
    }), [
        missions,
        selectedMission,
        activeMissionsCount,
        totalMissions,
        streak,
        isLoading,
        isProcessing, // Added depends
        showCompletionModal, // Added depends
        selectMission,
        toggleChecklistItem,
        requestHelp,
        handleCompleteMission,
        handleDebugCompleteAll
    ]);


    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Título - Mantido fora do grid para consistência */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 pb-2">
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight text-center lg:text-left">
                    Missões Operacionais
                </h1>
            </div>

            {/* Grid Dinâmico */}
            <div className="flex-1 min-h-0 bg-slate-50/50 rounded-2xl border border-slate-200/60 p-4">
                <MiniCardsGrid
                    data={gridData}
                    availableMetrics={METRICAS_MISSIONS}
                    initialMetrics={FINAL_LAYOUT_MISSIONS}
                    variant="card"
                    className="h-full"
                />
            </div>

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
        </div>
    );
}
