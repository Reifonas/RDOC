/**
 * Hook para Social Authentication
 * 
 * Gerencia login com Google e Microsoft via Supabase OAuth
 */

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Provider } from '@supabase/supabase-js';

export interface SocialAuthError {
    message: string;
    provider: Provider;
}

export const useSocialAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<SocialAuthError | null>(null);

    /**
     * Inicia login com provider social
     */
    const signInWithProvider = async (provider: Provider) => {
        try {
            setLoading(true);
            setError(null);

            // CRÍTICO: Limpar qualquer sessão antiga do localStorage antes de iniciar o OAuth.
            // Sem isso, o Supabase SDK tenta validar o token antigo na página de callback
            // e retorna 401 (GET /auth/v1/user) antes mesmo do nosso código rodar.
            await supabase.auth.signOut({ scope: 'local' });

            // Limpar manualmente chaves residuais que possam conflitar
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-') && key.includes(window.location.hostname === 'localhost' ? 'localhost' : 'xzudfhifaancyxxfdejx')) {
                    localStorage.removeItem(key);
                }
            });

            const { data, error: authError } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (authError) throw authError;

            // O Supabase redireciona automaticamente para o provider
            // O callback será tratado em /auth/callback
            return { data, error: null };

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
            setError({ message: errorMessage, provider });
            return { data: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Login com Google
     */
    const signInWithGoogle = () => signInWithProvider('google');

    /**
     * Login com Microsoft
     */
    const signInWithMicrosoft = () => signInWithProvider('azure');

    /**
     * Vincula conta social a usuário existente
     */
    const linkProvider = async (provider: Provider) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: linkError } = await supabase.auth.linkIdentity({
                provider,
            });

            if (linkError) throw linkError;

            return { data, error: null };

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao vincular conta';
            setError({ message: errorMessage, provider });
            return { data: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Remove vinculação de conta social
     */
    const unlinkProvider = async (provider: Provider) => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('Usuário não autenticado');

            // Encontrar identity do provider
            const identity = user.identities?.find(id => id.provider === provider);

            if (!identity) {
                throw new Error(`Conta ${provider} não vinculada`);
            }

            const { data, error: unlinkError } = await supabase.auth.unlinkIdentity(identity);

            if (unlinkError) throw unlinkError;

            return { data, error: null };

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao desvincular conta';
            setError({ message: errorMessage, provider });
            return { data: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Verifica se usuário tem provider vinculado
     */
    const hasProvider = async (provider: Provider): Promise<boolean> => {
        const { data: { user } } = await supabase.auth.getUser();
        return user?.identities?.some(id => id.provider === provider) ?? false;
    };

    return {
        loading,
        error,
        signInWithGoogle,
        signInWithMicrosoft,
        signInWithProvider,
        linkProvider,
        unlinkProvider,
        hasProvider,
    };
};
