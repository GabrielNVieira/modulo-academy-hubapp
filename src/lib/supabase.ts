/**
 * Academy Module - Supabase Client
 * 
 * Responsável por:
 * 1. Inicializar Supabase com sessão do Hub
 * 2. Gerenciar autenticação compartilhada
 * 3. Expor cliente para uso nos componentes
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { HubContext } from '../main';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Inicializa o Supabase client com contexto do Hub
 */
export async function initializeSupabase(context: HubContext): Promise<SupabaseClient> {
    if (!context.env?.SUPABASE_URL || !context.env?.SUPABASE_ANON_KEY) {
        throw new Error('Supabase URL ou Anon Key não fornecidos pelo Hub');
    }

    // Criar cliente Supabase
    supabaseInstance = createClient(
        context.env.SUPABASE_URL,
        context.env.SUPABASE_ANON_KEY,
        {
            auth: {
                autoRefreshToken: true,
                persistSession: false, // Sessão gerenciada pelo Hub
                detectSessionInUrl: false
            }
        }
    );

    // Restaurar sessão compartilhada do Hub
    if (context.session) {
        const { error } = await supabaseInstance.auth.setSession({
            access_token: context.session.access_token,
            refresh_token: context.session.refresh_token
        });

        if (error) {
            console.error('❌ [Academy] Erro ao restaurar sessão:', error);
            throw error;
        }

        console.log('✅ [Academy] Sessão Supabase restaurada');
    }

    return supabaseInstance;
}

/**
 * Retorna o cliente Supabase
 * @throws Error se não estiver inicializado
 */
export function getSupabase(): SupabaseClient {
    if (!supabaseInstance) {
        throw new Error(
            'Supabase não inicializado. Aguarde o contexto do Hub ou verifique a conexão.'
        );
    }
    return supabaseInstance;
}

/**
 * Verifica se o Supabase está inicializado
 */
export function isSupabaseReady(): boolean {
    return supabaseInstance !== null;
}

/**
 * Retorna o cliente Supabase ou null se não inicializado
 */
export function getSupabaseOrNull(): SupabaseClient | null {
    return supabaseInstance;
}
