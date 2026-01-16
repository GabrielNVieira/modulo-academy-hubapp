import { useState, useEffect, useCallback } from 'react';
import type { Badge } from '../types';
import { useHubContext } from './useHubContext';
import { badgeRepository } from '../services';
import { isSupabaseReady } from '../lib/supabase';

const INITIAL_BADGES: Badge[] = [
    {
        id: 'b1',
        tenantId: 'demo',
        name: 'Primeiros Passos',
        description: 'Complete o tutorial inicial',
        icon: '🚀',
        category: 'especial',
        requirements: { type: 'course_complete', description: 'Completar Tutorial' },
        xpBonus: 50,
        rarity: 'common'
    },
    // ... items generally persisted in DB now
];

export function useAdminBadges() {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { context, isConnected } = useHubContext();

    // Fetch Badges
    const fetchBadges = useCallback(async () => {
        setIsLoading(true);
        const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
        const hasSupabase = isSupabaseReady();

        if (!useMockData && hasSupabase && isConnected && context) {
            try {
                const data = await badgeRepository.getBadges(context);
                setBadges(data);
                localStorage.setItem('academy_badges', JSON.stringify(data));
            } catch (error) {
                console.error('Failed to load admin badges', error);
            }
        } else {
            // Mock Fallback
            try {
                const saved = localStorage.getItem('academy_badges');
                if (saved) {
                    setBadges(JSON.parse(saved));
                } else {
                    setBadges(INITIAL_BADGES);
                }
            } catch (e) {
                console.error(e);
            }
        }
        setIsLoading(false);
    }, [isConnected, context]);

    useEffect(() => {
        fetchBadges();
    }, [fetchBadges]);

    const createBadge = useCallback(async (data: Partial<Badge>) => {
        const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

        if (!useMockData && isConnected && context) {
            try {
                await badgeRepository.createBadge(context, data);
                await fetchBadges();
            } catch (error) {
                console.error('Error creating badge', error);
            }
        } else {
            const newBadge: Badge = {
                id: crypto.randomUUID(),
                tenantId: 'demo',
                name: data.name || 'Nova Badge',
                description: data.description || '',
                icon: data.icon || '🏅',
                category: data.category || 'especial',
                requirements: data.requirements || { type: 'custom', description: '' },
                xpBonus: data.xpBonus || 0,
                rarity: data.rarity || 'common'
            };
            const updated = [...badges, newBadge];
            setBadges(updated);
            localStorage.setItem('academy_badges', JSON.stringify(updated));
        }
    }, [isConnected, context, badges, fetchBadges]);

    const updateBadge = useCallback(async (id: string, data: Partial<Badge>) => {
        const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

        if (!useMockData && isConnected && context) {
            try {
                await badgeRepository.updateBadge(context, id, data);
                await fetchBadges();
            } catch (error) {
                console.error('Error updating badge', error);
            }
        } else {
            const updated = badges.map(b => b.id === id ? { ...b, ...data } : b);
            setBadges(updated);
            localStorage.setItem('academy_badges', JSON.stringify(updated));
        }
    }, [isConnected, context, badges, fetchBadges]);

    const deleteBadge = useCallback(async (id: string) => {
        if (!confirm('Excluir esta badge?')) return;

        const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

        if (!useMockData && isConnected && context) {
            try {
                await badgeRepository.deleteBadge(context, id);
                await fetchBadges();
            } catch (error) {
                console.error('Error deleting badge', error);
            }
        } else {
            const updated = badges.filter(b => b.id !== id);
            setBadges(updated);
            localStorage.setItem('academy_badges', JSON.stringify(updated));
        }
    }, [isConnected, context, badges, fetchBadges]);

    return {
        badges,
        isLoading,
        createBadge,
        updateBadge,
        deleteBadge
    };
}
