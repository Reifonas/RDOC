import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface ConviteResult {
    success: boolean;
    organizacao_id?: string;
    organizacao_nome?: string;
    role?: string;
    error?: string;
}

interface UseInviteCodeReturn {
    loading: boolean;
    error: string | null;
    validarConvite: (codigo: string) => Promise<ConviteResult>;
    usarConvite: (codigo: string, usuarioId: string) => Promise<ConviteResult>;
    gerarConvite: (organizacaoId: string, options?: GerarConviteOptions) => Promise<{ success: boolean; codigo?: string; error?: string }>;
    listarConvites: (organizacaoId: string) => Promise<ConviteRow[]>;
}

interface GerarConviteOptions {
    emailConvidado?: string;
    role?: string;
    maxUsos?: number;
    expiraEmDias?: number;
    criadoPor?: string;
}

// Tipo local para convite (tabela não está no database.types.ts gerado)
interface ConviteRow {
    id: string;
    organizacao_id: string;
    codigo: string;
    criado_por: string | null;
    email_convidado: string | null;
    role: string;
    max_usos: number;
    usos_atuais: number;
    ativo: boolean;
    expira_em: string | null;
    created_at: string;
    updated_at: string;
    organizacoes?: { nome: string } | null;
}

export const useInviteCode = (): UseInviteCodeReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Valida se um código de convite existe e está ativo
     */
    const validarConvite = useCallback(async (codigo: string): Promise<ConviteResult> => {
        try {
            setLoading(true);
            setError(null);

            const codigoFormatado = codigo.toUpperCase().trim();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error: queryError } = await (supabase as any)
                .from('convites')
                .select(`
                    id,
                    codigo,
                    organizacao_id,
                    role,
                    max_usos,
                    usos_atuais,
                    ativo,
                    expira_em,
                    email_convidado,
                    organizacoes:organizacao_id (nome)
                `)
                .eq('codigo', codigoFormatado)
                .eq('ativo', true)
                .single();

            console.log('useInviteCode: validando código:', codigoFormatado);
            console.log('useInviteCode: query result:', { data, queryError });

            if (queryError || !data) {
                console.error('useInviteCode: erro ou sem dados:', queryError);
                return {
                    success: false,
                    error: 'Código de convite inválido ou expirado.'
                };
            }

            const convite = data as ConviteRow;

            // Verificar expiração
            if (convite.expira_em && new Date(convite.expira_em) < new Date()) {
                return {
                    success: false,
                    error: 'Este código de convite expirou.'
                };
            }

            // Verificar limite de usos
            if (convite.max_usos > 0 && convite.usos_atuais >= convite.max_usos) {
                return {
                    success: false,
                    error: 'Este código de convite já atingiu o limite de usos.'
                };
            }

            return {
                success: true,
                organizacao_id: convite.organizacao_id,
                organizacao_nome: convite.organizacoes?.nome || 'Organização',
                role: convite.role
            };

        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao validar convite';
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Usa o código de convite para associar o usuário à organização
     */
    const usarConvite = useCallback(async (codigo: string, usuarioId: string): Promise<ConviteResult> => {
        try {
            setLoading(true);
            setError(null);

            console.log('useInviteCode: chamando usar_convite RPC:', { codigo, usuarioId });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error: rpcError } = await (supabase as any).rpc('usar_convite', {
                p_codigo: codigo,
                p_usuario_id: usuarioId
            });
            console.log('useInviteCode: resultado RPC:', { data, rpcError });

            if (rpcError) {
                console.error('useInviteCode: erro RPC:', rpcError);
                throw rpcError;
            }

            const result = data as ConviteResult;

            if (!result.success) {
                setError(result.error || 'Erro ao usar convite');
            }

            return result;

        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao usar convite';
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Gera um novo código de convite (apenas admins)
     */
    const gerarConvite = useCallback(async (
        organizacaoId: string,
        options: GerarConviteOptions = {}
    ) => {
        try {
            setLoading(true);
            setError(null);
            console.log('useInviteCode: Iniciando geração de convite para org:', organizacaoId, options);

            // Gerar código aleatório LOCAL (fallback para evitar erro de RPC)
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const nums = '0123456789';
            let codigo = '';
            for (let i = 0; i < 3; i++) codigo += chars.charAt(Math.floor(Math.random() * chars.length));
            for (let i = 0; i < 4; i++) codigo += nums.charAt(Math.floor(Math.random() * nums.length));

            console.log('useInviteCode: Código gerado localmente:', codigo);

            // Calcular data de expiração
            let expiraEm: string | null = null;
            if (options.expiraEmDias) {
                const date = new Date();
                date.setDate(date.getDate() + options.expiraEmDias);
                expiraEm = date.toISOString();
            }

            // Determinar ID do criador
            let userId = options.criadoPor;

            if (!userId) {
                console.warn('useInviteCode: ID do criador não fornecido. Tentando obter via Supabase Auth...');
                try {
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('Timeout'), 2000));
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { data } = await Promise.race([supabase.auth.getUser(), timeoutPromise]) as any;

                    if (data?.user?.id) {
                        userId = data.user.id;
                        console.log('useInviteCode: Usuário recuperado via Auth:', userId);
                    }
                } catch (e) {
                    console.warn('useInviteCode: Timeout/Erro ao obter user via Auth:', e);
                }

                // Fallback: LocalStorage
                if (!userId) {
                    console.warn('useInviteCode: Tentando recuperar usuário do LocalStorage...');
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key?.startsWith('sb-') && key?.endsWith('-auth-token')) {
                            const val = localStorage.getItem(key);
                            if (val) {
                                const parsed = JSON.parse(val);
                                if (parsed.user?.id) {
                                    userId = parsed.user.id;
                                    console.log('useInviteCode: Usuário recuperado via LocalStorage:', userId);
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            if (!userId) {
                throw new Error('Não foi possível identificar o usuário para criar o convite.');
            }

            // Obter email para log/debug se possível (opcional)
            console.log('useInviteCode: Inserindo convite no banco...', {
                organizacao_id: organizacaoId,
                codigo,
                criado_por: userId
            });

            // TENTATIVA 1: RAW FETCH (Bypass Client)
            // Para evitar hangs do client websocket/session

            // 1. Recuperar Token (COM TIMEOUT PARA EVITAR HANG)
            let token = null;

            try {
                // Tenta pegar da sessão atual com timeout curto (1.5s)
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('Timeout'), 1500));
                const sessionPromise = supabase.auth.getSession();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: sessionData } = await Promise.race([sessionPromise, timeoutPromise]) as any;

                if (sessionData?.session?.access_token) {
                    token = sessionData.session.access_token;
                    // console.log('useInviteCode: Token obtido via Session');
                }
            } catch {
                console.warn('useInviteCode: Timeout/Erro ao pegar sessão (bypass para LocalStorage)');
            }

            if (!token) {
                // Fallback: localStorage
                console.log('useInviteCode: Buscando token no LocalStorage...');
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key?.startsWith('sb-') && key?.endsWith('-auth-token')) {
                        const val = localStorage.getItem(key);
                        if (val) {
                            const parsed = JSON.parse(val);
                            if (parsed.access_token) {
                                token = parsed.access_token;
                                console.log('useInviteCode: Token obtido via LocalStorage');
                                break;
                            }
                        }
                    }
                }
            }

            if (!token) {
                throw new Error('Não foi possível obter o token de autenticação para a requisição.');
            }

            // 2. Montar objeto
            const novoConvite = {
                organizacao_id: organizacaoId,
                codigo,
                criado_por: userId,
                email_convidado: options.emailConvidado || null,
                role: options.role || 'usuario',
                max_usos: options.maxUsos ?? 1,
                expira_em: expiraEm,
            };

            // 3. Executar fetch
            const baseUrl = import.meta.env.VITE_SUPABASE_URL;
            const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            console.log('useInviteCode: Enviando RAW FETCH insert...');
            const res = await fetch(`${baseUrl}/rest/v1/convites`, {
                method: 'POST',
                headers: {
                    'apikey': anonKey,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal' // Não precisamos do retorno
                },
                body: JSON.stringify(novoConvite)
            });

            if (!res.ok) {
                const text = await res.text();
                console.error('useInviteCode: Erro RAW FETCH:', text);
                throw new Error(`Erro ao salvar convite: ${res.statusText}`);
            }

            console.log('useInviteCode: Convite gerado com sucesso (RAW FETCH)!');
            return { success: true, codigo };

        } catch (err) {
            console.error('useInviteCode: Catch error in gerarConvite:', err);
            const msg = err instanceof Error ? err.message : 'Erro ao gerar convite';
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Lista convites de uma organização
     */
    const listarConvites = useCallback(async (organizacaoId: string) => {
        try {
            setLoading(true);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error: queryError } = await (supabase as any)
                .from('convites')
                .select('*')
                .eq('organizacao_id', organizacaoId)
                .order('created_at', { ascending: false });

            if (queryError) throw queryError;

            return data || [];
        } catch (err) {
            console.error('Erro ao listar convites:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        validarConvite,
        usarConvite,
        gerarConvite,
        listarConvites,
    };
};
