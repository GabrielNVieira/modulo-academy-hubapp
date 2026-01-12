/**
 * Academy Module - Progress Tab
 * 
 * Agora utilizando MiniCardsGrid para layout flexível e drag-and-drop.
 */

import { useMemo } from 'react';
import { MiniCardsGrid } from '@/components/MiniCardsGrid/MiniCardsGrid';
import { METRICAS_PROGRESSO, FINAL_LAYOUT, ProgressData } from './progress/ProgressGridConfig';
import { UserProgress, UserStats, Streak, Level } from '../../types';

interface ProgressTabProps {
    progress: UserProgress | null;
    stats: UserStats | null;
    streak: Streak | null;
    currentLevel: Level | null;
    isLoading: boolean;
}

export function ProgressTab({ progress, stats, streak, currentLevel, isLoading }: ProgressTabProps) {
    // Preparar dados para o grid
    const gridData: ProgressData = useMemo(() => ({
        progress,
        stats,
        streak,
        currentLevel
    }), [progress, stats, streak, currentLevel]);

    if (isLoading) {
        return <ProgressTabSkeleton />; // Manter skeleton antigo ou criar novo para grid?
    }

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Título */}
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight text-center lg:text-left">
                Dashboard de Progresso
            </h1>

            {/* Grid Dinâmico */}
            <div className="flex-1 min-h-0 bg-slate-50/50 rounded-2xl border border-slate-200/60 p-4">
                <MiniCardsGrid
                    data={gridData}
                    availableMetrics={METRICAS_PROGRESSO}
                    initialMetrics={FINAL_LAYOUT}
                    variant="card"
                    className="h-full"
                />
            </div>
        </div>
    );
}

// ==================== SKELETON ====================

function ProgressTabSkeleton() {
    return (
        <div className="h-full space-y-6 animate-pulse">
            <div className="h-10 w-64 bg-slate-200 rounded-lg" />
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-4">
                    <div className="bg-slate-200 rounded-2xl h-40" />
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-200 rounded-xl h-24" />
                        <div className="bg-slate-200 rounded-xl h-24" />
                        <div className="bg-slate-200 rounded-xl h-24" />
                    </div>
                </div>
                <div className="lg:col-span-7">
                    <div className="bg-slate-200 rounded-2xl h-80" />
                </div>
            </div>
        </div>
    );
}

