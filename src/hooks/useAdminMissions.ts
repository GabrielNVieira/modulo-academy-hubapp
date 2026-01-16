import { useState, useEffect, useCallback } from 'react';
import type { Mission } from '../types';
import { useHubContext } from './useHubContext';
import { missionRepository } from '../services';
import { isSupabaseReady } from '../lib/supabase';

// Mock Initial Data if empty (copied from useMissions for consistency if localstorage empty)
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
    const { context, isConnected } = useHubContext();

    // Helper to fetch
    const fetchMissions = useCallback(async () => {
        setIsLoading(true);
        const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
        const hasSupabase = isSupabaseReady();

        if (!useMockData && hasSupabase && isConnected && context) {
            try {
                const data = await missionRepository.getMissions(context);
                setMissions(data);
                // Sync to local
                localStorage.setItem('academy_missions', JSON.stringify(data));
            } catch (error) {
                console.error('Failed to load admin missions from DB', error);
            }
        } else {
            // Fallback Local
            try {
                const savedMissions = localStorage.getItem('academy_missions');
                if (savedMissions) {
                    setMissions(JSON.parse(savedMissions));
                } else {
                    setMissions(INITIAL_MISSIONS);
                }
            } catch (e) { console.error(e); }
        }
        setIsLoading(false);
    }, [isConnected, context]);

    // Initial Load
    useEffect(() => {
        fetchMissions();
    }, [fetchMissions]);

    // --- CRUD ---

    const createMission = useCallback(async (data: Partial<Mission>) => {
        const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

        if (!useMockData && isConnected && context) {
            try {
                const newMission = await missionRepository.createMission(context, data);
                if (newMission) {
                    await fetchMissions();
                }
            } catch (err) {
                console.error('Error creating mission:', err);
            }
        } else {
            // Mock Behavior
            const newMission: Mission = {
                id: crypto.randomUUID(),
                title: data.title || 'Nova Missão',
                description: data.description || '',
                type: data.type || 'livre',
                xpReward: data.xpReward || 100,
                order: missions.length + 1,
                status: 'available',
                estimatedTime: data.estimatedTime || 30,
                category: data.category || 'Geral',
                requirements: data.requirements || { items: [] },
                helpContent: data.helpContent || { title: 'Ajuda', tips: [] }
            };
            const updated = [...missions, newMission];
            setMissions(updated);
            localStorage.setItem('academy_missions', JSON.stringify(updated));
        }
    }, [isConnected, context, missions, fetchMissions]);

    const updateMission = useCallback(async (id: string, data: Partial<Mission>) => {
        const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

        if (!useMockData && isConnected && context) {
            try {
                await missionRepository.updateMission(context, id, data);
                await fetchMissions();
            } catch (err) {
                console.error('Error updating mission:', err);
            }
        } else {
            // Mock Behavior
            const updated = missions.map(m => m.id === id ? { ...m, ...data } : m);
            setMissions(updated);
            localStorage.setItem('academy_missions', JSON.stringify(updated));
        }
    }, [isConnected, context, missions, fetchMissions]);

    const deleteMission = useCallback(async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta missão?')) return;

        const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

        if (!useMockData && isConnected && context) {
            try {
                await missionRepository.deleteMission(context, id);
                await fetchMissions();
            } catch (err) {
                console.error('Error deleting mission:', err);
            }
        } else {
            // Mock Behavior
            const updated = missions.filter(m => m.id !== id);
            setMissions(updated);
            localStorage.setItem('academy_missions', JSON.stringify(updated));
        }
    }, [isConnected, context, missions, fetchMissions]);

    // --- Checklist Management (Reusing updateMission) ---

    const addChecklistItem = useCallback(async (missionId: string, text: string) => {
        const mission = missions.find(m => m.id === missionId);
        if (!mission) return;

        const updatedItems = [
            ...(mission.requirements?.items || []),
            { id: crypto.randomUUID(), text, completed: false, required: true }
        ];

        await updateMission(missionId, {
            requirements: { ...mission.requirements, items: updatedItems }
        });
    }, [missions, updateMission]);

    const removeChecklistItem = useCallback(async (missionId: string, itemId: string) => {
        const mission = missions.find(m => m.id === missionId);
        if (!mission) return;

        const updatedItems = (mission.requirements?.items || []).filter(i => i.id !== itemId);

        await updateMission(missionId, {
            requirements: { ...mission.requirements, items: updatedItems }
        });
    }, [missions, updateMission]);

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
