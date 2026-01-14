
import { useState, useEffect, useCallback } from 'react';
import type { Mission } from '../types';

// Mock Initial Data if empty (copied from useMissions for consistency if localstorage empty)
// In a real app, we'd share this constant.
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
            ],
        },
        helpContent: {
            title: 'Precisa de ajuda?',
            tips: ['Dica 1', 'Dica 2'],
        },
    }
];

export function useAdminMissions() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize Data
    useEffect(() => {
        const loadData = () => {
            try {
                const savedMissions = localStorage.getItem('academy_missions');
                if (savedMissions) {
                    setMissions(JSON.parse(savedMissions));
                } else {
                    setMissions(INITIAL_MISSIONS);
                    localStorage.setItem('academy_missions', JSON.stringify(INITIAL_MISSIONS));
                }
            } catch (error) {
                console.error('Failed to load admin missions', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Persist Missions
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('academy_missions', JSON.stringify(missions));
        }
    }, [missions, isLoading]);

    // --- CRUD ---

    const createMission = useCallback(async (data: Partial<Mission>) => {
        const newMission: Mission = {
            id: crypto.randomUUID(),
            title: data.title || 'Nova Missão',
            description: data.description || '',
            type: data.type || 'livre',
            xpReward: data.xpReward || 100,
            order: missions.length + 1,
            status: 'available', // Admin created missions start as available usually or locked
            estimatedTime: data.estimatedTime || 30,
            category: data.category || 'Geral',
            requirements: {
                items: []
            },
            helpContent: {
                title: 'Ajuda',
                tips: []
            }
        };
        setMissions(prev => [...prev, newMission]);
    }, [missions]);

    const updateMission = useCallback(async (id: string, data: Partial<Mission>) => {
        setMissions(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
    }, []);

    const deleteMission = useCallback(async (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta missão?')) {
            setMissions(prev => prev.filter(m => m.id !== id));
        }
    }, []);

    // --- Checklist Management ---

    const addChecklistItem = useCallback(async (missionId: string, text: string) => {
        setMissions(prev => prev.map(m => {
            if (m.id === missionId) {
                return {
                    ...m,
                    requirements: {
                        ...m.requirements,
                        items: [
                            ...m.requirements.items,
                            { id: crypto.randomUUID(), text, completed: false, required: true }
                        ]
                    }
                };
            }
            return m;
        }));
    }, []);

    const removeChecklistItem = useCallback(async (missionId: string, itemId: string) => {
        setMissions(prev => prev.map(m => {
            if (m.id === missionId) {
                return {
                    ...m,
                    requirements: {
                        ...m.requirements,
                        items: m.requirements.items.filter(i => i.id !== itemId)
                    }
                };
            }
            return m;
        }));
    }, []);

    return {
        missions,
        isLoading,
        createMission,
        updateMission,
        deleteMission,
        addChecklistItem,
        removeChecklistItem
    };
}
