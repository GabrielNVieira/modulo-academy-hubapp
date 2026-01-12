/**
 * Academy Module - useHubContext Hook
 * 
 * Hook para acessar o contexto do Hub.App
 * Gerencia estado de conexão e dados do usuário
 */

import { useState, useEffect } from 'react';
import type { HubContext } from '../main';

interface UseHubContextReturn {
    context: HubContext | null;
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
    tenantId: string | null;
    userId: string | null;
    email: string | null;
}

export function useHubContext(): UseHubContextReturn {
    const [context, setContext] = useState<HubContext | null>(window.hubContext);
    const [isConnected, setIsConnected] = useState<boolean>(window.isHubConnected || false);
    const [isLoading, setIsLoading] = useState<boolean>(!window.hubContext);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Se já tem contexto, não precisa esperar
        if (window.hubContext) {
            setContext(window.hubContext);
            setIsConnected(true);
            setIsLoading(false);
            return;
        }

        // Listener para quando o contexto ficar pronto
        const handleContextReady = (event: CustomEvent<HubContext>) => {
            setContext(event.detail);
            setIsConnected(true);
            setIsLoading(false);
            setError(null);
        };

        // Timeout para caso não receba contexto (Standalone Mode)
        const timeout = setTimeout(() => {
            if (!window.hubContext) {
                console.log('⚠️ [Academy] Hub.App context not found. Switching to Standalone Mode.');

                // MOCK CONTEXT FOR STANDALONE MODE
                const mockContext: HubContext = {
                    tenantId: 'demo-tenant',
                    userId: 'demo-user',
                    email: 'demo@example.com',
                    moduleName: 'Academy',
                    apiUrl: 'https://api.mock',
                    apiToken: 'mock-token',
                    env: {
                        SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
                        SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
                    },
                    session: null
                };

                window.hubContext = mockContext;
                setContext(mockContext);
                setIsConnected(true);
                setIsLoading(false);
                setError(null);
                console.log('✅ [Academy] Standalone Mode ativado com contexto mock');
            }
        }, 500); // Timeout reduzido para 500ms

        window.addEventListener('hubContextReady', handleContextReady as EventListener);

        return () => {
            window.removeEventListener('hubContextReady', handleContextReady as EventListener);
            clearTimeout(timeout);
        };
    }, []);

    return {
        context,
        isConnected,
        isLoading,
        error,
        tenantId: context?.tenantId || null,
        userId: context?.userId || null,
        email: context?.email || null
    };
}

/**
 * Hook para executar ações apenas quando Hub estiver conectado
 */
export function useWhenHubReady(callback: (context: HubContext) => void) {
    const { context, isConnected } = useHubContext();

    useEffect(() => {
        if (isConnected && context) {
            callback(context);
        }
    }, [isConnected, context, callback]);
}
