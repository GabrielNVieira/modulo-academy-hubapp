/**
 * Academy Module - Entry Point
 * 
 * Este é o ponto de entrada do módulo Academy.
 * Responsável por:
 * 1. Escutar mensagens do Hub via PostMessage
 * 2. Receber contexto (tenantId, userId, session, etc)
 * 3. Inicializar Supabase client com sessão compartilhada
 * 4. Confirmar ao Hub que o módulo está pronto
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeSupabase } from './lib/supabase';

// ==================== TIPOS DO HUB CONTEXT ====================

export interface HubSession {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    user: {
        id: string;
        email: string;
    };
}

export interface HubContext {
    tenantId: string;
    userId: string;
    email: string;
    moduleName: string;
    apiUrl: string;
    apiToken: string;
    env: {
        SUPABASE_URL: string;
        SUPABASE_ANON_KEY: string;
    };
    session: HubSession | null;
}

// ==================== GLOBAL DECLARATIONS ====================

declare global {
    interface Window {
        hubContext: HubContext | null;
        isHubConnected: boolean;
    }
}

// Inicializa estado global
window.hubContext = null;
window.isHubConnected = false;

// ==================== POSTMESSAGE LISTENER ====================

/**
 * Listener para mensagem do Hub.App
 * Processa o contexto recebido e inicializa o Supabase
 */
window.addEventListener('message', async (event) => {
    // Processar apenas mensagens do tipo hubapp:init
    if (event.data?.type === 'hubapp:init') {
        console.log('📦 [Academy] Contexto recebido do Hub.App:', event.data.payload);

        try {
            // Armazenar contexto globalmente
            window.hubContext = event.data.payload as HubContext;
            window.isHubConnected = true;

            // Adicionar classe ao body indicando que está dentro do Hub
            document.body.classList.add('hub-embedded');

            // Inicializar Supabase client com sessão compartilhada
            if (window.hubContext.env?.SUPABASE_URL && window.hubContext.env?.SUPABASE_ANON_KEY) {
                await initializeSupabase(window.hubContext);
                console.log('✅ [Academy] Supabase inicializado com sessão do Hub');
            }

            // Confirmar ao Hub que módulo está pronto
            window.parent.postMessage({
                type: 'hubapp:module-ready',
                payload: {
                    moduleName: 'Academy',
                    version: '1.0.0',
                    status: 'ready'
                }
            }, '*');

            console.log('✅ [Academy] Módulo inicializado com sucesso');

            // Disparar evento customizado para notificar componentes
            window.dispatchEvent(new CustomEvent('hubContextReady', {
                detail: window.hubContext
            }));

        } catch (error) {
            console.error('❌ [Academy] Erro ao inicializar módulo:', error);

            // Notificar Hub sobre o erro
            window.parent.postMessage({
                type: 'hubapp:module-error',
                payload: {
                    moduleName: 'Academy',
                    error: error instanceof Error ? error.message : 'Erro desconhecido'
                }
            }, '*');
        }
    }

    // Atualização de token
    if (event.data?.type === 'hubapp:token-refresh') {
        console.log('🔄 [Academy] Token atualizado pelo Hub');
        if (window.hubContext) {
            window.hubContext.apiToken = event.data.payload.apiToken;
            if (event.data.payload.session) {
                window.hubContext.session = event.data.payload.session;
            }
        }
    }
});

// ==================== AVISAR HUB QUE ESTÁ CARREGADO ====================

// Enviar sinal de que o módulo carregou (antes de receber contexto)
window.parent.postMessage({
    type: 'hubapp:module-loaded',
    payload: {
        moduleName: 'Academy',
        version: '1.0.0'
    }
}, '*');

console.log('🎓 [Academy] Módulo carregado, aguardando contexto do Hub...');

// ==================== RENDER APP ====================

import { ProgressProvider } from './contexts/ProgressContext';

// ==================== RENDER APP ====================

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ProgressProvider>
            <App />
        </ProgressProvider>
    </React.StrictMode>
);
