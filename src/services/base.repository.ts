/**
 * Base Repository
 * Classe base para repositórios com operações comuns
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase, setSessionContext } from '../lib/supabase';

export interface RepositoryContext {
    tenantId: string;
    userId: string;
}

export abstract class BaseRepository {
    /**
     * Getter para o cliente Supabase
     * Garante que o cliente só seja acessado após a inicialização
     */
    protected get supabase(): SupabaseClient {
        return getSupabase();
    }

    /**
     * Configura o contexto da sessão para RLS
     */
    protected async setContext(context: RepositoryContext): Promise<void> {
        await setSessionContext(context.tenantId, context.userId);
    }

    /**
     * Wrapper para executar queries com contexto configurado
     */
    protected async withContext<T>(
        context: RepositoryContext,
        callback: () => Promise<T>
    ): Promise<T> {
        await this.setContext(context);
        return callback();
    }

    /**
     * Handle database errors
     */
    protected handleError(error: unknown, operation: string): never {
        console.error(`❌ [Repository] ${operation} failed:`, error);

        if (error instanceof Error) {
            throw error;
        }

        throw new Error(`Database operation failed: ${operation}`);
    }
}
