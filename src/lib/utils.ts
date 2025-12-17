import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Formata número como XP
 */
export function formatXP(xp: number): string {
    if (xp >= 1000) {
        return `${(xp / 1000).toFixed(1)}K`;
    }
    return xp.toString();
}

/**
 * Calcula porcentagem de progresso
 */
export function calculateProgress(current: number, total: number): number {
    if (total === 0) return 0;
    return Math.min(100, Math.round((current / total) * 100));
}

/**
 * Retorna cor baseada no nível
 */
export function getLevelColor(level: number): string {
    const colors: Record<number, string> = {
        1: '#06b6d4', // Explorador - Ciano
        2: '#0891b2', // Conhecedor - Ciano médio
        3: '#0e7490', // Especialista - Ciano escuro
        4: '#164e63', // Mestre - Ciano muito escuro
    };
    return colors[level] || colors[1];
}

/**
 * Retorna nome do nível
 */
export function getLevelName(level: number): string {
    const names: Record<number, string> = {
        1: 'Explorador',
        2: 'Conhecedor',
        3: 'Especialista',
        4: 'Mestre',
    };
    return names[level] || 'Explorador';
}

/**
 * Formata data relativa
 */
export function formatRelativeDate(date: string | Date): string {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
    return `${Math.floor(diffDays / 365)} anos atrás`;
}

/**
 * Gera ID único
 */
export function generateId(): string {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * Delay promise
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retorna emoji baseado na raridade do badge
 */
export function getRarityEmoji(rarity: string): string {
    const emojis: Record<string, string> = {
        common: '⭐',
        rare: '💎',
        epic: '🏆',
        legendary: '👑',
    };
    return emojis[rarity] || '⭐';
}

/**
 * Retorna cor baseada na raridade
 */
export function getRarityColor(rarity: string): string {
    const colors: Record<string, string> = {
        common: '#9ca3af',
        rare: '#3b82f6',
        epic: '#8b5cf6',
        legendary: '#f59e0b',
    };
    return colors[rarity] || colors.common;
}
