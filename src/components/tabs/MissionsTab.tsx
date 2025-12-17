/**
 * Academy Module - Missions Tab
 *
 * Aba de missões práticas com checklist interativo
 * Layout: 2 colunas (lista esquerda, detalhes direita)
 * Sistema de ajuda gratuito (sem penalidade de XP)
 */

import { useState, useEffect } from 'react';
import { Lock, CheckCircle2, Clock, Trophy, Flame, HelpCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useMissions } from '../../hooks/useMissions';
import { useProgress } from '../../hooks/useProgress';
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
        if (!selectedMission) return;

        const result = await completeMission(selectedMission.id);

        if (result.success) {
            // Adicionar XP ao progresso do usuário
            await addXp(result.xpEarned, `Missão: ${selectedMission.title}`);

            // Mostrar modal de celebração
            setCompletedMissionXp(result.xpEarned);
            setShowCompletionModal(true);

            // Confetti!
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
            });

            // Fechar modal após 3 segundos e selecionar próxima missão
            setTimeout(() => {
                setShowCompletionModal(false);
                const nextMission = missions.find(m => m.status === 'available');
                if (nextMission) {
                    selectMission(nextMission.id);
                }
            }, 3000);
        }
    };

    // Verificar se todos os itens obrigatórios estão completos
    const canComplete = selectedMission
        ? selectedMission.requirements.items
            .filter(item => item.required)
            .every(item => item.completed)
        : false;

    return (
        <div className="h-full p-4">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">MISSÕES</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-700">
                            {activeMissionsCount}/{totalMissions} missões ativas
                        </span>
                        <div className="flex items-center gap-2 bg-orange-50 border-2 border-orange-200 rounded-lg px-3 py-1">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-bold text-orange-600">
                                {streak?.current || 0} DIAS CONSECUTIVOS
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout 2 colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ height: 'calc(100% - 80px)' }}>
                {/* Coluna Esquerda - Lista de Missões (40%) */}
                <div className="lg:col-span-2 flex flex-col gap-3 overflow-y-auto pr-2">
                    {missions.map((mission, index) => {
                        const isSelected = selectedMission?.id === mission.id;
                        const isLocked = mission.status === 'locked';
                        const isCompleted = mission.status === 'completed';
                        const isInProgress = mission.status === 'in_progress';

                        return (
                            <div key={mission.id} className="relative">
                                {/* Card da Missão */}
                                <div
                                    onClick={() => !isLocked && selectMission(mission.id)}
                                    className={`
                                        bg-white border-2 rounded-xl p-4 transition-all cursor-pointer
                                        ${isLocked ? 'opacity-50 cursor-not-allowed border-gray-200' : ''}
                                        ${isSelected && !isLocked ? 'border-blue-400 shadow-lg ring-2 ring-blue-100' : 'border-gray-300'}
                                        ${!isSelected && !isLocked ? 'hover:border-gray-400 hover:shadow-md' : ''}
                                    `}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        {/* Ícone de status */}
                                        <div className="flex-shrink-0 mt-1">
                                            {isLocked && <Lock className="h-5 w-5 text-gray-400" />}
                                            {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                                            {isInProgress && <Clock className="h-5 w-5 text-blue-500" />}
                                            {mission.status === 'available' && (
                                                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                            )}
                                        </div>

                                        {/* Conteúdo */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`text-sm font-bold mb-1 ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                                                {mission.title}
                                            </h3>
                                            <p className={`text-xs mb-2 line-clamp-2 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {mission.description}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs">
                                                <span className={`font-bold ${isLocked ? 'text-gray-400' : 'text-blue-600'}`}>
                                                    +{mission.xpReward} XP
                                                </span>
                                                <span className={`${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    ~{mission.estimatedTime}min
                                                </span>
                                            </div>
                                        </div>

                                        {/* Badge de categoria */}
                                        <div className={`
                                            flex-shrink-0 px-2 py-1 rounded text-[10px] font-bold uppercase
                                            ${mission.type === 'tutorial' ? 'bg-blue-100 text-blue-700' : ''}
                                            ${mission.type === 'livre' ? 'bg-green-100 text-green-700' : ''}
                                            ${mission.type === 'problema' ? 'bg-orange-100 text-orange-700' : ''}
                                            ${mission.type === 'otimizacao' ? 'bg-purple-100 text-purple-700' : ''}
                                            ${isLocked ? 'opacity-50' : ''}
                                        `}>
                                            {mission.type}
                                        </div>
                                    </div>

                                    {/* Barra de progresso (se in_progress) */}
                                    {isInProgress && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-gray-600 font-medium">Progresso</span>
                                                <span className="text-gray-700 font-bold">
                                                    {mission.requirements.items.filter(i => i.completed).length}/{mission.requirements.items.length}
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 transition-all"
                                                    style={{
                                                        width: `${(mission.requirements.items.filter(i => i.completed).length / mission.requirements.items.length) * 100}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Seta conectando missões */}
                                {index < missions.length - 1 && (
                                    <div className="flex justify-center py-2">
                                        <ChevronDown className="h-5 w-5 text-gray-300" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Coluna Direita - Detalhes da Missão (60%) */}
                <div className="lg:col-span-3 bg-white border-2 border-gray-300 rounded-xl p-6 overflow-y-auto">
                    {selectedMission ? (
                        <div className="space-y-6">
                            {/* Cabeçalho da Missão */}
                            <div>
                                <div className="flex items-start justify-between mb-2">
                                    <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                                        {selectedMission.title}
                                    </h2>
                                    <div className="flex items-center gap-2 bg-blue-50 border-2 border-blue-200 rounded-lg px-3 py-1">
                                        <Trophy className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-bold text-blue-600">
                                            +{selectedMission.xpReward} XP
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">{selectedMission.description}</p>

                                {/* Meta info */}
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Tempo estimado: {selectedMission.estimatedTime}min
                                    </span>
                                    <span>•</span>
                                    <span className="font-medium">{selectedMission.category}</span>
                                </div>
                            </div>

                            {/* Objetivos da Missão */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                                    OBJETIVOS DA MISSÃO
                                </h3>
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {selectedMission.description}
                                    </p>
                                </div>
                            </div>

                            {/* Etapas (Checklist) */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                                    ETAPAS
                                </h3>
                                <div className="space-y-2">
                                    {selectedMission.requirements.items.map((item, index) => {
                                        console.log('🎨 Rendering item:', item.text, 'completed:', item.completed);
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => {
                                                    if (selectedMission.status !== 'completed' && selectedMission.status !== 'locked') {
                                                        console.log('🖱️ Click on item:', item.id);
                                                        toggleChecklistItem(selectedMission.id, item.id);
                                                    }
                                                }}
                                                className={`
                                                flex items-start gap-3 p-4 border-2 rounded-lg transition-all duration-200
                                                ${item.completed
                                                        ? 'bg-green-50 border-green-300'
                                                        : 'bg-white border-gray-300 hover:border-gray-400 hover:shadow-sm'
                                                    }
                                                ${selectedMission.status !== 'completed' && selectedMission.status !== 'locked'
                                                        ? 'cursor-pointer active:scale-[0.98]'
                                                        : 'cursor-default'
                                                    }
                                            `}
                                            >
                                                {/* Checkbox */}
                                                <div
                                                    className="flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all duration-200"
                                                    style={{
                                                        backgroundColor: item.completed ? '#22c55e' : '#ffffff',
                                                        borderColor: item.completed ? '#22c55e' : '#d1d5db'
                                                    }}
                                                >
                                                    {item.completed && (
                                                        <svg
                                                            className="w-3 h-3"
                                                            style={{ color: '#ffffff' }}
                                                            fill="none"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="3"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* Texto */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`
                                                        text-xs font-bold transition-colors duration-200
                                                        ${item.completed ? 'text-green-600' : 'text-gray-500'}
                                                    `}>
                                                            {index + 1}.
                                                        </span>
                                                        <span className={`
                                                        text-sm font-medium transition-all duration-200
                                                        ${item.completed ? 'text-green-700 line-through opacity-75' : 'text-gray-900'}
                                                    `}>
                                                            {item.text}
                                                        </span>
                                                        {item.required && (
                                                            <span className="text-xs text-red-500 font-bold">*</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    * Etapas obrigatórias
                                </p>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                {/* Botão Ajuda */}
                                <button
                                    onClick={() => {
                                        setShowHelp(!showHelp);
                                        if (!showHelp && selectedMission) {
                                            requestHelp(selectedMission.id);
                                        }
                                    }}
                                    className="flex items-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:border-gray-400 hover:shadow-md transition-all"
                                >
                                    <HelpCircle className="h-4 w-4" />
                                    PRECISO DE AJUDA
                                </button>

                                {/* Botão Validar/Completar */}
                                <button
                                    onClick={handleCompleteMission}
                                    disabled={!canComplete || selectedMission.status === 'completed' || isLoading}
                                    className={`
                                        flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold uppercase transition-all
                                        ${canComplete && selectedMission.status !== 'completed'
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    {isLoading ? (
                                        'VALIDANDO...'
                                    ) : selectedMission.status === 'completed' ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            MISSÃO CONCLUÍDA
                                        </>
                                    ) : (
                                        <>
                                            <Trophy className="h-4 w-4" />
                                            VALIDAR CONCLUSÃO
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Painel de Ajuda */}
                            {showHelp && selectedMission.helpContent && (
                                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-start gap-3">
                                        <HelpCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-yellow-900 mb-2">
                                                {selectedMission.helpContent.title}
                                            </h4>
                                            <ul className="space-y-2">
                                                {selectedMission.helpContent.tips.map((tip, index) => (
                                                    <li key={index} className="flex items-start gap-2 text-sm text-yellow-800">
                                                        <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                                        <span>{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <p className="text-xs text-yellow-700 mt-3 font-medium">
                                                💡 Ajuda gratuita - sem penalidade de XP
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-sm font-medium">Selecione uma missão para começar</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Conclusão */}
            {showCompletionModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
                    <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-in zoom-in">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Missão Concluída!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Parabéns! Você completou a missão{' '}
                            <span className="font-bold">{selectedMission?.title}</span>
                        </p>
                        <div className="flex items-center justify-center gap-2 bg-blue-50 border-2 border-blue-200 rounded-lg px-6 py-4">
                            <Trophy className="h-6 w-6 text-blue-600" />
                            <span className="text-2xl font-bold text-blue-600">
                                +{completedMissionXp} XP
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
