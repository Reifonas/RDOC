/**
 * Página de Callback OAuth
 *
 * Aguarda o evento SIGNED_IN via onAuthStateChange após o Supabase
 * processar o código/hash da URL automaticamente (PKCE ou Implicit).
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export const AuthCallback: React.FC = () => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        console.log('🔄 AuthCallback: Aguardando sessão OAuth...');
        console.log('🔗 URL completa:', window.location.href);

        let redirected = false;

        // Timer de segurança: se em 15s não logar, volta para o login
        const fallbackTimer = setTimeout(() => {
            if (!redirected) {
                console.warn('⏰ Timeout: nenhuma sessão recebida em 15s. Redirecionando para /login');
                setStatus('error');
                setTimeout(() => window.location.replace('/login'), 2000);
            }
        }, 15000);

        // onAuthStateChange é o jeito correto de detectar o retorno OAuth
        // O supabase-js detecta automaticamente ?code= (PKCE) ou #access_token= (Implicit)
        // e dispara SIGNED_IN quando a sessão estiver pronta
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔔 Auth Event:', event, '| User:', session?.user?.email ?? 'nenhum');

            if (event === 'SIGNED_IN' && session?.user) {
                redirected = true;
                clearTimeout(fallbackTimer);
                setStatus('success');

                // Garantir permissões do Super Admin
                if (session.user.email === 'admtracksteel@gmail.com') {
                    console.log('👑 Super Admin detectado! Atualizando permissões...');
                    await supabase.from('usuarios' as never).upsert({
                        id: session.user.id,
                        email: session.user.email,
                        nome: session.user.user_metadata?.full_name || 'Super Admin',
                        role: 'dev',
                        ativo: true
                    });
                    console.log('👑 Permissões de Super Admin aplicadas!');
                }

                console.log('✅ Sessão confirmada! Redirecionando para /');
                // Pequeno delay para o estado atualizar no UI
                setTimeout(() => {
                    window.location.replace('/');
                }, 500);
            }
        });

        return () => {
            subscription.unsubscribe();
            clearTimeout(fallbackTimer);
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Validando Credenciais...</h2>
                        <p className="text-gray-500 mb-6 text-sm">Aguarde enquanto verificamos sua conta.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Login confirmado!</h2>
                        <p className="text-gray-500 text-sm">Redirecionando para o sistema...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Falha na autenticação</h2>
                        <p className="text-gray-500 mb-4 text-sm">Não foi possível confirmar o login. Redirecionando...</p>
                    </>
                )}

                <button
                    onClick={() => window.location.replace('/login')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md text-sm"
                >
                    Ir para o Login
                </button>
            </div>
        </div>
    );
};

export default AuthCallback;
