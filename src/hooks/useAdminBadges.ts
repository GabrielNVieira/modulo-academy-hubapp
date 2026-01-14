
import { useState, useEffect, useCallback } from 'react';
import type { Badge } from '../types';

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
    {
        id: 'b2',
        tenantId: 'demo',
        name: 'Estudioso',
        description: 'Complete 3 cursos',
        icon: '📚',
        category: 'curso',
        requirements: { type: 'course_complete', description: 'Completar 3 cursos' },
        xpBonus: 100,
        rarity: 'rare'
    }
];

export function useAdminBadges() {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('academy_badges');
            if (saved) {
                setBadges(JSON.parse(saved));
            } else {
                setBadges(INITIAL_BADGES);
                localStorage.setItem('academy_badges', JSON.stringify(INITIAL_BADGES));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('academy_badges', JSON.stringify(badges));
        }
    }, [badges, isLoading]);

    const createBadge = useCallback(async (data: Partial<Badge>) => {
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
        setBadges(prev => [...prev, newBadge]);
    }, []);

    const updateBadge = useCallback(async (id: string, data: Partial<Badge>) => {
        setBadges(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
    }, []);

    const deleteBadge = useCallback(async (id: string) => {
        if (confirm('Excluir esta badge?')) {
            setBadges(prev => prev.filter(b => b.id !== id));
        }
    }, []);

    return {
        badges,
        createBadge,
        updateBadge,
        deleteBadge
    };
}
