/**
 * Custom Hook: useMissions
 *
 * Gerencia o estado e lógica das missões do Academy
 * - Lista de missões com estados (locked, available, in_progress, completed)
 * - Progresso de checklist
 * - Validação e conclusão de missões
 * - Integração com sistema de XP
 * - Persistência em localStorage
 */

import { useState, useEffect, useCallback } from 'react';
import type { Mission, MissionProgress } from '../types';

// Chave para localStorage
const STORAGE_KEY_MISSIONS = 'academy_missions';
const STORAGE_KEY_PROGRESS = 'academy_missions_progress';

// Mock de missões realistas seguindo o PRD
const INITIAL_MISSIONS: Mission[] = [
    {
        id: 'm1',
        title: 'INÍCIO DO HUBAPP',
        description: 'Aprenda os conceitos básicos do Hub.App e configure seu ambiente de trabalho',
        type: 'tutorial',
        xpReward: 150,
        order: 1,
        status: 'available',
        estimatedTime: 30,
        category: 'Fundamentos',
        requirements: {
            items: [
                { id: 'c1', text: 'Fazer login na plataforma', completed: false, required: true },
                { id: 'c2', text: 'Explorar o painel principal', completed: false, required: true },
                { id: 'c3', text: 'Configurar suas preferências de perfil', completed: false, required: true },
                { id: 'c4', text: 'Assistir ao vídeo de boas-vindas', completed: false, required: true },
            ],
        },
        helpContent: {
            title: 'Precisa de ajuda?',
            tips: [
                'O painel principal fica no menu lateral esquerdo',
                'Suas preferências podem ser alteradas no ícone de usuário',
                'O vídeo de boas-vindas tem apenas 5 minutos',
            ],
        },
    },
    {
        id: 'm2',
        title: 'NAVEGAÇÃO E INTERFACE',
        description: 'Domine a navegação entre módulos e aprenda a personalizar sua interface',
        type: 'tutorial',
        xpReward: 180,
        order: 2,
        status: 'locked',
        estimatedTime: 25,
        category: 'Fundamentos',
        prerequisites: ['m1'],
        requirements: {
            items: [
                { id: 'c1', text: 'Abrir pelo menos 3 módulos diferentes', completed: false, required: true },
                { id: 'c2', text: 'Personalizar o layout da dashboard', completed: false, required: true },
                { id: 'c3', text: 'Adicionar um módulo aos favoritos', completed: false, required: true },
                { id: 'c4', text: 'Usar a busca global para encontrar um recurso', completed: false, required: true },
            ],
        },
        helpContent: {
            title: 'Dicas de Navegação',
            tips: [
                'Os módulos estão disponíveis no menu principal',
                'Arraste e solte os cards para reorganizar o layout',
                'Use Ctrl+K para abrir a busca global rapidamente',
            ],
        },
    },
    {
        id: 'm3',
        title: 'PRIMEIRO WEBHOOK',
        description: 'Crie e configure seu primeiro webhook para integração com sistemas externos',
        type: 'livre',
        xpReward: 220,
        order: 3,
        status: 'locked',
        estimatedTime: 45,
        category: 'Integrações',
        prerequisites: ['m2'],
        requirements: {
            items: [
                { id: 'c1', text: 'Acessar o módulo de Webhooks', completed: false, required: true },
                { id: 'c2', text: 'Criar um novo webhook de teste', completed: false, required: true },
                { id: 'c3', text: 'Configurar a URL de destino', completed: false, required: true },
                { id: 'c4', text: 'Definir os eventos que ativarão o webhook', completed: false, required: true },
                { id: 'c5', text: 'Testar o webhook e verificar a resposta', completed: false, required: true },
            ],
        },
        helpContent: {
            title: 'Ajuda com Webhooks',
            tips: [
                'Para testar, você pode usar webhook.site para gerar URLs temporárias',
                'Eventos comuns incluem: criar, atualizar, deletar',
                'Verifique os logs para ver se o webhook foi disparado',
            ],
        },
    },
    {
        id: 'm4',
        title: 'AUTOMAÇÃO BÁSICA',
        description: 'Configure fluxos automáticos para otimizar processos repetitivos',
        type: 'livre',
        xpReward: 250,
        order: 4,
        status: 'locked',
        estimatedTime: 60,
        category: 'Automação',
        prerequisites: ['m3'],
        requirements: {
            items: [
                { id: 'c1', text: 'Acessar o módulo de Automações', completed: false, required: true },
                { id: 'c2', text: 'Criar uma automação com gatilho de tempo', completed: false, required: true },
                { id: 'c3', text: 'Adicionar condições à automação', completed: false, required: true },
                { id: 'c4', text: 'Configurar ações a serem executadas', completed: false, required: true },
                { id: 'c5', text: 'Ativar e testar a automação', completed: false, required: true },
            ],
        },
        helpContent: {
            title: 'Ajuda com Automações',
            tips: [
                'Gatilhos de tempo são úteis para tarefas recorrentes',
                'Use condições para criar lógica condicional (se/então)',
                'Teste em modo simulação antes de ativar',
            ],
        },
    },
    {
        id: 'm5',
        title: 'OTIMIZAÇÃO DE PERFORMANCE',
        description: 'Identifique e resolva gargalos de performance no seu ambiente',
        type: 'otimizacao',
        xpReward: 320,
        order: 5,
        status: 'locked',
        estimatedTime: 90,
        category: 'Avançado',
        prerequisites: ['m4'],
        requirements: {
            items: [
                { id: 'c1', text: 'Acessar o painel de performance', completed: false, required: true },
                { id: 'c2', text: 'Identificar 3 recursos com uso alto de memória', completed: false, required: true },
                { id: 'c3', text: 'Otimizar configurações de cache', completed: false, required: true },
                { id: 'c4', text: 'Reduzir tempo de carregamento em 20%', completed: false, required: true },
                { id: 'c5', text: 'Documentar as otimizações realizadas', completed: false, required: true },
            ],
        },
        helpContent: {
            title: 'Ajuda com Otimização',
            tips: [
                'O painel de performance mostra métricas em tempo real',
                'Cache pode ser ajustado em Configurações > Avançado',
                'Use o DevTools do navegador para medir melhorias',
            ],
        },
    },
];

interface UseMissionsReturn {
    missions: Mission[];
    selectedMission: Mission | null;
    progress: Map<string, MissionProgress>;
    isLoading: boolean;
    selectMission: (missionId: string) => void;
    toggleChecklistItem: (missionId: string, itemId: string) => void;
    requestHelp: (missionId: string) => void;
    completeMission: (missionId: string) => Promise<{ success: boolean; xpEarned: number }>;
    resetProgress: () => void;
}

export function useMissions(): UseMissionsReturn {
    const [missions, setMissions] = useState<Mission[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_MISSIONS);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return INITIAL_MISSIONS;
            }
        }
        return INITIAL_MISSIONS;
    });

    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [progress, setProgress] = useState<Map<string, MissionProgress>>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return new Map(Object.entries(parsed));
            } catch {
                return new Map();
            }
        }
        return new Map();
    });
    const [isLoading, setIsLoading] = useState(false);

    // Salvar missões no localStorage quando mudar
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_MISSIONS, JSON.stringify(missions));
    }, [missions]);

    // Salvar progresso no localStorage quando mudar
    useEffect(() => {
        const progressObj = Object.fromEntries(progress.entries());
        localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progressObj));
    }, [progress]);

    // Atualizar missões bloqueadas baseado em pré-requisitos
    useEffect(() => {
        setMissions(prev => prev.map(mission => {
            // Se não tem pré-requisitos, disponível
            if (!mission.prerequisites || mission.prerequisites.length === 0) {
                return mission;
            }

            // Verificar se todos os pré-requisitos foram completados
            const allPrereqsCompleted = mission.prerequisites.every(prereqId => {
                const prereqMission = prev.find(m => m.id === prereqId);
                return prereqMission?.status === 'completed';
            });

            // Atualizar status
            if (allPrereqsCompleted && mission.status === 'locked') {
                return { ...mission, status: 'available' as const };
            }

            return mission;
        }));
    }, []);

    // Selecionar uma missão
    const selectMission = useCallback((missionId: string) => {
        const mission = missions.find(m => m.id === missionId);
        if (mission) {
            setSelectedMission(mission);

            // Se a missão está disponível e não tem progresso, iniciar
            if (mission.status === 'available' && !progress.has(missionId)) {
                const newProgress: MissionProgress = {
                    missionId,
                    status: 'in_progress',
                    startedAt: new Date().toISOString(),
                    checklistItems: mission.requirements.items.map(item => ({
                        id: item.id,
                        completed: false,
                    })),
                    helpUsed: false,
                };

                setProgress(prev => new Map(prev).set(missionId, newProgress));
                setMissions(prev => prev.map(m =>
                    m.id === missionId ? { ...m, status: 'in_progress' as const } : m
                ));
            }
        }
    }, [missions, progress]);

    // Toggle item do checklist
    const toggleChecklistItem = useCallback((missionId: string, itemId: string) => {
        console.log('🔄 Toggle checklist item:', { missionId, itemId });

        // Atualizar o checklist na missão
        setMissions(prev => {
            const updated = prev.map(mission => {
                if (mission.id === missionId) {
                    const updatedItems = mission.requirements.items.map(item => {
                        if (item.id === itemId) {
                            const newCompleted = !item.completed;
                            console.log('✅ Toggling item:', item.text, 'from', item.completed, 'to', newCompleted);
                            return { ...item, completed: newCompleted };
                        }
                        return item;
                    });

                    const updatedMission = {
                        ...mission,
                        requirements: {
                            ...mission.requirements,
                            items: updatedItems,
                        },
                    };

                    // Atualizar também selectedMission se for a missão atual
                    setSelectedMission(current =>
                        current?.id === missionId ? updatedMission : current
                    );

                    return updatedMission;
                }
                return mission;
            });

            console.log('📊 Updated missions:', updated);
            return updated;
        });

        // Atualizar progresso
        setProgress(prev => {
            const newProgress = new Map(prev);
            const missionProgress = newProgress.get(missionId);

            if (!missionProgress) return prev;

            const updatedItems = missionProgress.checklistItems.map(item =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
            );

            newProgress.set(missionId, {
                ...missionProgress,
                checklistItems: updatedItems,
            });

            return newProgress;
        });
    }, []);

    // Solicitar ajuda
    const requestHelp = useCallback((missionId: string) => {
        setProgress(prev => {
            const newProgress = new Map(prev);
            const missionProgress = newProgress.get(missionId);

            if (!missionProgress) return prev;

            newProgress.set(missionId, {
                ...missionProgress,
                helpUsed: true,
            });

            return newProgress;
        });
    }, []);

    // Completar missão
    const completeMission = useCallback(async (missionId: string): Promise<{ success: boolean; xpEarned: number }> => {
        setIsLoading(true);

        try {
            const mission = missions.find(m => m.id === missionId);
            if (!mission) {
                throw new Error('Missão não encontrada');
            }

            // Verificar se todos os itens obrigatórios foram completados
            const allRequiredCompleted = mission.requirements.items
                .filter(item => item.required)
                .every(item => item.completed);

            if (!allRequiredCompleted) {
                setIsLoading(false);
                return { success: false, xpEarned: 0 };
            }

            // Atualizar progresso da missão
            setProgress(prev => {
                const newProgress = new Map(prev);
                const missionProgress = newProgress.get(missionId);

                if (missionProgress) {
                    newProgress.set(missionId, {
                        ...missionProgress,
                        status: 'completed',
                        completedAt: new Date().toISOString(),
                    });
                }

                return newProgress;
            });

            // Atualizar status da missão
            setMissions(prev => prev.map(m =>
                m.id === missionId ? { ...m, status: 'completed' as const } : m
            ));

            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 500));

            setIsLoading(false);
            return { success: true, xpEarned: mission.xpReward };

        } catch (error) {
            console.error('Erro ao completar missão:', error);
            setIsLoading(false);
            return { success: false, xpEarned: 0 };
        }
    }, [missions]);

    // Resetar progresso (para desenvolvimento/debug)
    const resetProgress = useCallback(() => {
        setMissions(INITIAL_MISSIONS);
        setProgress(new Map());
        setSelectedMission(null);
        localStorage.removeItem(STORAGE_KEY_MISSIONS);
        localStorage.removeItem(STORAGE_KEY_PROGRESS);
    }, []);

    return {
        missions,
        selectedMission,
        progress,
        isLoading,
        selectMission,
        toggleChecklistItem,
        requestHelp,
        completeMission,
        resetProgress,
    };
}
