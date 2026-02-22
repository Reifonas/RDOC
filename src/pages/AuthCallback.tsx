/**
 * Página de Callback OAuth
 * 
 * Processa o retorno do OAuth e redireciona o usuário
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export const AuthCallback: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        console.log('🔄 AuthCallback montado.');

        const processSession = async () => {
            try {
                console.log('🔍 Verificando sessão em background...');
                const { data } = await supabase.auth.getSession();

                if (data.session?.user) {
                    const user = data.session.user;
                    console.log('✅ Sessão confirmada:', user.email);

                    // SE FOR O SUPER ADMIN, FORÇAR O ROLE 'DEV'
                    if (user.email === 'admtracksteel@gmail.com') {
                        console.log('👑 Super Admin detectado! Atualizando permissões...');
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        await (supabase as any).from('usuarios').upsert({
                            id: user.id,
                            email: user.email,
                            nome: user.user_metadata?.full_name || 'Super Admin',
                            role: 'dev', // Garante que seja dev
                            ativo: true
                        });
                        console.log('👑 Permissões de Super Admin aplicadas!');
                    }

                    // Redirecionar imediatamente
                    window.location.replace('/');
                } else {
                    // Sem sessão (ainda processando ou erro), esperar um pouco e tentar dnv ou ir para login
                    setTimeout(() => window.location.replace('/login'), 5000);
                }
            } catch (e) {
                console.error('⚠️ Erro na verificação de sessão:', e);
                window.location.replace('/login');
            }
        };

        // Adiciona um pequeno delay para garantir que o supabase-js processou a URL (implicit / pkce hash)
        const timer = setTimeout(() => {
            processSession();
        }, 800);

        return () => clearTimeout(timer);
    }, [navigate]);

    const handleForceLogin = () => {
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Validando Credenciais...</h2>
                <p className="text-gray-500 mb-6 text-sm">Atualizando permissões de acesso.</p>

                <button
                    onClick={handleForceLogin}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                >
                    Entrar no Sistema
                </button>
            </div>
        </div>
    );
};
