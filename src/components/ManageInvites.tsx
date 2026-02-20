import React, { useState, useEffect, useCallback } from 'react';
import { useInviteCode } from '../hooks/useInviteCode';
import { useCurrentUser, useUserStore } from '../stores/useUserStore';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import {
    Plus, Copy, Users, Clock, CheckCircle,
    XCircle, RefreshCw, KeyRound, Loader2, Mail, Building2
} from 'lucide-react';

interface Convite {
    id: string;
    codigo: string;
    organizacao_id: string;
    criado_por: string | null;
    email_convidado: string | null;
    role: string;
    max_usos: number;
    usos_atuais: number;
    ativo: boolean;
    expira_em: string | null;
    created_at: string;
    updated_at: string;
}

const ManageInvites: React.FC = () => {
    const currentUser = useCurrentUser();
    const fetchCurrentUser = useUserStore((state) => state.fetchCurrentUser);
    const { user: authUser, loading: authLoading } = useAuth(); // PEGAR EMAIL DIRETO DO AUTH
    const { loading: hookInviteLoading, gerarConvite } = useInviteCode();
    const [localInviteLoading, setLocalInviteLoading] = useState(false);
    const inviteLoading = hookInviteLoading || localInviteLoading;

    const [convites, setConvites] = useState<Convite[]>([]);
    const [organizacoes, setOrganizacoes] = useState<{ id: string, nome: string }[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState<string>('');
    const [showForm, setShowForm] = useState(false);
    const [showOrgForm, setShowOrgForm] = useState(false); // Novo form de org
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isRecovering, setIsRecovering] = useState(false);

    // Estado para nova organização
    const [novaOrgNome, setNovaOrgNome] = useState('');

    // Opções do formulário de novo convite
    const [novoConvite, setNovoConvite] = useState({
        emailConvidado: '',
        role: 'usuario',
        maxUsos: 1,
        expiraEmDias: 7,
    });

    // BYPASS DE EMERGÊNCIA: Usar email direto do Auth (não depende do store)
    const authEmail = authUser?.email || null;
    const isSuperAdmin = authEmail === 'admtracksteel@gmail.com';
    const isDev = (currentUser?.role as string) === 'dev' || isSuperAdmin;

    // BYPASS ADICIONAL: Verificar sessão diretamente do Supabase
    const [directAuthEmail, setDirectAuthEmail] = useState<string | null>(null);
    const [directAuthLoading, setDirectAuthLoading] = useState(true);

    // Super Admin pode ser detectado por qualquer um dos métodos
    const isSuperAdminDirect = directAuthEmail === 'admtracksteel@gmail.com';
    const isDevFinal = isDev || isSuperAdminDirect || isSuperAdmin;

    // Debug dos estados de loading e renderização - ÚTIL PARA DIAGNÓSTICO
    console.log('🔍 ManageInvites Render:', {
        authLoading,
        directAuthLoading,
        isRecovering,
        isSuperAdminDirect,
        directAuthEmail,
        isDevFinal,
        selectedOrgId,
        orgsCount: organizacoes.length
    });

    // 1. Helper for safe token retrieval - Priorities: Session -> LocalStorage
    // 1. Helper for safe token retrieval - Priorities: Session -> LocalStorage
    const getToken = useCallback(async () => {
        try {
            // Tenta pegar da sessão ativa primeiro (mas não espera para sempre)
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('Timeout'), 1500));
            const sessionPromise = supabase.auth.getSession();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data } = await Promise.race([sessionPromise, timeoutPromise]) as any;

            if (data?.session?.access_token) {
                return data.session.access_token;
            }
        } catch {
            // Se der timeout ou erro, silencia e vai pro fallback
        }

        try {
            // Fallback: varredura no localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('sb-') && key?.endsWith('-auth-token')) {
                    const val = localStorage.getItem(key);
                    if (val) {
                        const parsed = JSON.parse(val);
                        return parsed.access_token;
                    }
                }
            }
        } catch (e) {
            console.error('Erro no fallback de token:', e);
        }
        return null;
    }, []);

    // 2. Helper for Raw Fetch
    const rawFetch = useCallback(async (table: string, query: string = '') => {
        const baseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const token = await getToken() || anonKey;

        // Debug simples para ver se estamos enviando token
        // console.log(`Fetch ${table}: usando token ${token ? 'Bearer ...' : 'Anon'}`);

        const url = `${baseUrl}/rest/v1/${table}${query}`;
        const res = await fetch(url, {
            headers: {
                'apikey': anonKey,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`${res.status} ${res.statusText}: ${text}`);
        }
        return await res.json();
    }, [getToken]);

    useEffect(() => {
        const checkDirectAuth = async () => {
            setDirectAuthLoading(true);
            try {
                console.log('🕵️‍♂️ Iniciando verificação direta de Auth...');
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('Timeout'), 2000));
                const sessionPromise = supabase.auth.getSession();

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data } = await Promise.race([sessionPromise, timeoutPromise]) as any;

                if (data?.session?.access_token) {
                    console.log('✅ Sessão ativa encontrada (Supabase Auth).');
                }

                if (data?.session?.user?.email) {
                    console.log('✅ Email identificado na sessão:', data.session.user.email);
                    setDirectAuthEmail(data.session.user.email);
                } else {
                    console.warn('⚠️ Nenhuma sessão ativa retornada pelo Supabase. Verificando LocalStorage...');

                    // Fallback manual ao LocalStorage para debug
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key?.startsWith('sb-') && key?.endsWith('-auth-token')) {
                            const val = localStorage.getItem(key);
                            if (val) {
                                const parsed = JSON.parse(val);
                                if (parsed.user?.email) {
                                    console.log('✅ Email recuperado do LocalStorage (Fallback):', parsed.user.email);
                                    setDirectAuthEmail(parsed.user.email);
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('❌ Erro no checkDirectAuth:', e);
            } finally {
                setDirectAuthLoading(false);
            }
        };
        checkDirectAuth();
    }, []);

    // Super Admin declarations MOVED UP

    // Recuperação de Sessão (se necessário)
    useEffect(() => {
        let mounted = true;

        const checkSession = async () => {
            // Se não tem currentUser, tenta recuperar
            if (!currentUser) {
                setIsRecovering(true);

                // Timeout de segurança: desiste após 3 segundos
                const timeoutId = setTimeout(() => {
                    if (mounted) setIsRecovering(false);
                }, 3000);

                try {
                    const { data } = await supabase.auth.getUser();
                    if (data.user && mounted) {
                        // console.log('🔄 Tentando recuperar usuário do store:', data.user.email);
                        await fetchCurrentUser(data.user.id);
                    }
                } catch (error) {
                    console.error("❌ Erro na recuperação do store:", error);
                } finally {
                    clearTimeout(timeoutId);
                    if (mounted) setIsRecovering(false);
                }
            }
        };
        checkSession();

        return () => { mounted = false; };
    }, [currentUser, fetchCurrentUser]);

    // Se for Dev, carrega todas as organizações
    // Se não, usa a do usuário
    const carregarDadosIniciais = useCallback(async () => {
        console.log('🔄 carregarDadosIniciais disparado.', { isDevFinal, directAuthLoading, currentUserOrg: currentUser?.organizacao_id });

        // Se ainda está determinando auth crítico, espera (mas não trava se for só loading de UI)
        if (directAuthLoading) return;

        if (isDevFinal) {
            console.log('👑 Modo Admin detectado. Buscando TODAS as organizações...');
            try {
                const data = await rawFetch('organizacoes', '?select=id,nome&order=nome.asc');
                console.log(`✅ ${data.length} organizações encontradas.`);
                setOrganizacoes(data);
                if (data.length > 0 && !selectedOrgId) {
                    setSelectedOrgId(data[0].id);
                }
            } catch (err) {
                console.error('❌ Erro RAW Orgs:', err);
                setErrorMessage('Erro ao carregar organizações. Tente recarregar a página.');
            }
        } else if (currentUser?.organizacao_id) {
            console.log('👤 Modo Usuário detectado. Buscando organização do perfil...');
            setSelectedOrgId(currentUser.organizacao_id);
            try {
                const data = await rawFetch('organizacoes', `?id=eq.${currentUser.organizacao_id}&select=id,nome`);
                if (data && data.length > 0) setOrganizacoes(data);
            } catch (e) {
                console.error(e);
                setErrorMessage('Erro ao carregar sua organização.');
            }
        } else {
            console.warn('⚠️ Nem Admin nem Usuário com Org detectado. Nada a fazer.');
        }
    }, [isDevFinal, currentUser?.organizacao_id, selectedOrgId, directAuthLoading, rawFetch]);

    const carregarConvites = useCallback(async () => {
        if (!selectedOrgId) return;
        setLocalInviteLoading(true);
        try {
            console.log(`📨 Buscando convites para org: ${selectedOrgId}`);
            const data = await rawFetch('convites', `?organizacao_id=eq.${selectedOrgId}&select=*&order=created_at.desc`);
            console.log(`✅ ${data?.length || 0} convites carregados.`);
            setConvites(data || []);
        } catch (e) {
            console.error('Erro RAW Convites:', e);
            setErrorMessage('Erro ao carregar convites.');
        } finally {
            setLocalInviteLoading(false);
        }
    }, [selectedOrgId, rawFetch]);

    useEffect(() => {
        // Dispara o carregamento assim que os estados de Auth se estabilizarem
        // Ou se isDevFinal mudar (ex: Auth carregou tardiamente)
        if (!directAuthLoading) {
            carregarDadosIniciais();
        }
    }, [carregarDadosIniciais, authLoading, directAuthLoading, isDevFinal]);

    useEffect(() => {
        if (selectedOrgId) {
            carregarConvites();
        }
    }, [selectedOrgId, carregarConvites]);

    // Debug dos estados de loading
    // Old log removed

    // Renderiza Loader enquanto verifica autenticação
    // SE for Super Admin confirmado direto pelo Supabase, ignoramos o carregamento do store (isRecovering)
    // IGNORA authLoading do hook pois ele trava
    if ((directAuthLoading || isRecovering) && !isSuperAdminDirect) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500">Verificando permissões...</p>
                <span className="text-xs text-gray-400">
                    {authLoading ? 'Auth ' : ''}
                    {directAuthLoading ? 'Direct ' : ''}
                    {isRecovering ? 'Recover ' : ''}
                </span>
            </div>
        );
    }

    // ... Rest of the file handling restricted access and main render ...

    const handleCriarOrganizacao = async () => {
        if (!novaOrgNome.trim()) return;

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
                .from('organizacoes')
                .insert([{ nome: novaOrgNome, ativo: true }])
                .select()
                .single();

            if (error) throw error;

            setSuccessMessage(`Organização "${data.nome}" criada!`);
            setNovaOrgNome('');
            setShowOrgForm(false);
            carregarDadosIniciais(); // Recarrega lista
            setSelectedOrgId(data.id); // Seleciona a nova
        } catch (error) {
            console.error('Erro ao criar org:', error);
            alert('Erro ao criar organização. Verifique o console.');
        }
    };

    // Ensure the original return structure is maintained below this block in the file


    const handleGerarConvite = async () => {
        if (!selectedOrgId) return;

        setErrorMessage('');
        setSuccessMessage('');

        const result = await gerarConvite(selectedOrgId, {
            emailConvidado: novoConvite.emailConvidado || undefined,
            role: novoConvite.role,
            maxUsos: novoConvite.maxUsos,
            expiraEmDias: novoConvite.expiraEmDias,
            criadoPor: currentUser?.id || authUser?.id, // Passa ID explícito para evitar hang do Auth
        });

        if (result.success) {
            setSuccessMessage(`Código gerado: ${result.codigo}`);
            setShowForm(false);
            setNovoConvite({
                emailConvidado: '',
                role: 'usuario',
                maxUsos: 1,
                expiraEmDias: 7,
            });
            carregarConvites();
            setTimeout(() => setSuccessMessage(''), 5000);
        } else {
            setErrorMessage(result.error || 'Erro ao gerar convite. Verifique o console.');
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    const copiarCodigo = (codigo: string) => {
        navigator.clipboard.writeText(codigo);
        setCopiedCode(codigo);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const getRoleLabel = (role: string) => {
        const roles: Record<string, string> = {
            admin: 'Administrador',
            engenheiro: 'Engenheiro',
            mestre_obra: 'Mestre de Obra',
            usuario: 'Usuário',
        };
        return roles[role] || role;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isExpired = (expiraEm: string | null) => {
        if (!expiraEm) return false;
        return new Date(expiraEm) < new Date();
    };

    if (isRecovering) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500">Sincronizando permissões...</p>
            </div>
        );
    }

    // Se não for dev e não tiver org, exibe tela de erro com opção de refresh
    if (!isDevFinal && !currentUser?.organizacao_id) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white/50 border-2 border-dashed border-gray-300 rounded-xl">
                <div className="text-gray-500 mb-4 text-center">
                    <XCircle className="w-12 h-12 mx-auto mb-2 text-red-400" />
                    <h3 className="text-lg font-semibold text-gray-700">Acesso Restrito</h3>
                    <p>Você não tem permissão para gerenciar convites.</p>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg text-sm max-w-md w-full">
                    <p className="font-bold text-gray-600 mb-2">Diagnóstico de Acesso:</p>
                    <ul className="space-y-1 text-gray-600 font-mono text-xs">
                        <li>ID: {currentUser?.id || 'Não identificado no Store'}</li>
                        <li>Email (Store): {currentUser?.email || 'Verificando...'}</li>
                        <li>Email (Auth): <span className={authEmail === 'admtracksteel@gmail.com' ? 'text-green-600 font-bold' : ''}>{authEmail || 'Verificando...'}</span></li>
                        <li>Cargo Local: <span className="text-red-600 font-bold">{currentUser?.role || 'Nenhum'}</span></li>
                        <li>Org ID Local: {currentUser?.organizacao_id || 'Nenhuma'}</li>
                        <li>Bypass Super Admin: <span className={isSuperAdmin ? 'text-green-600 font-bold' : 'text-gray-400'}>{isSuperAdmin ? 'ATIVO ✓' : 'Inativo'}</span></li>
                    </ul>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-blue-600 mb-2 font-semibold">
                            Ações de Recuperação (Admin):
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Recarregar Página
                        </button>
                    </div>
                </div>
            </div >
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <KeyRound className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Convites da Organização
                        </h2>
                        {isDev && (
                            <p className="text-xs text-purple-600 font-semibold bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full inline-block mt-1">
                                MODO SUPER ADMIN
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Seletor de Organização (Apenas DEV) */}
                    {isDev && (
                        <>
                            <select
                                value={selectedOrgId}
                                onChange={(e) => setSelectedOrgId(e.target.value)}
                                title="Selecione uma organização para gerenciar"
                                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="" disabled>Selecione uma empresa...</option>
                                {organizacoes.map(org => (
                                    <option key={org.id} value={org.id}>{org.nome}</option>
                                ))}
                            </select>

                            <button
                                onClick={() => setShowOrgForm(true)}
                                className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-purple-200 transition-colors"
                                title="Criar Nova Organização"
                            >
                                <Building2 className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    <button
                        onClick={carregarConvites}
                        disabled={inviteLoading}
                        className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title="Atualizar Lista"
                    >
                        <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${inviteLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        disabled={!selectedOrgId}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Novo Convite</span>
                    </button>
                </div>
            </div>

            {/* Mensagem de sucesso */}
            {successMessage && (
                <div className="flex items-center gap-2 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl animate-fade-in">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="text-green-800 dark:text-green-200 font-medium">{successMessage}</p>
                </div>
            )}

            {errorMessage && (
                <div className="flex items-center gap-2 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl animate-fade-in">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p className="text-red-800 dark:text-red-200 font-medium">{errorMessage}</p>
                </div>
            )}

            {/* Modal/Form de Nova Organização */}
            {showOrgForm && (
                <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 shadow-lg animate-slide-up">
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Criar Nova Organização
                    </h3>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={novaOrgNome}
                            onChange={(e) => setNovaOrgNome(e.target.value)}
                            placeholder="Nome da Empresa (ex: Construtora Silva)"
                            className="flex-1 px-4 py-2 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            autoFocus
                        />
                        <button
                            onClick={handleCriarOrganizacao}
                            className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium shadow-md"
                        >
                            Criar
                        </button>
                        <button
                            onClick={() => setShowOrgForm(false)}
                            className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Formulário de novo convite */}
            {showForm && (
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg animate-slide-up">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Gerar Novo Código de Convite
                        </h3>
                        <p className="text-sm text-gray-500">
                            Organização Alvo: <span className="font-bold text-blue-600">
                                {organizacoes.find(o => o.id === selectedOrgId)?.nome || 'Atual'}
                            </span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <Mail className="w-4 h-4 inline mr-1" />
                                Email do Convidado (opcional)
                            </label>
                            <input
                                type="email"
                                value={novoConvite.emailConvidado}
                                onChange={(e) => setNovoConvite(prev => ({ ...prev, emailConvidado: e.target.value }))}
                                placeholder="Deixe vazio para qualquer email"
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <Users className="w-4 h-4 inline mr-1" />
                                Cargo
                            </label>
                            <select
                                value={novoConvite.role}
                                onChange={(e) => setNovoConvite(prev => ({ ...prev, role: e.target.value }))}
                                title="Cargo do convidado"
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="usuario">Usuário</option>
                                <option value="engenheiro">Engenheiro</option>
                                <option value="mestre_obra">Mestre de Obra</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Máximo de Usos
                            </label>
                            <input
                                type="number"
                                value={novoConvite.maxUsos}
                                onChange={(e) => setNovoConvite(prev => ({ ...prev, maxUsos: parseInt(e.target.value) || 1 }))}
                                min={1}
                                max={100}
                                title="Máximo de usos"
                                placeholder="1"
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Expira em (dias)
                            </label>
                            <input
                                type="number"
                                value={novoConvite.expiraEmDias}
                                onChange={(e) => setNovoConvite(prev => ({ ...prev, expiraEmDias: parseInt(e.target.value) || 7 }))}
                                min={1}
                                max={365}
                                title="Dias para expiração"
                                placeholder="7"
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleGerarConvite}
                            disabled={inviteLoading}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg font-semibold disabled:opacity-50"
                        >
                            {inviteLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <KeyRound className="w-5 h-5" />
                            )}
                            Gerar Código
                        </button>
                    </div>
                </div>
            )}

            {/* Lista de Convites */}
            <div className="space-y-3">
                {convites.length === 0 ? (
                    <div className="text-center py-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                        <KeyRound className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            {selectedOrgId ? 'Nenhum convite gerado para esta organização ainda.' : 'Selecione uma organização para gerenciar.'}
                        </p>
                    </div>
                ) : (
                    convites.map((convite) => {
                        const expired = isExpired(convite.expira_em);
                        const used = convite.max_usos > 0 && convite.usos_atuais >= convite.max_usos;
                        const inactive = !convite.ativo || expired || used;

                        return (
                            <div
                                key={convite.id}
                                className={`p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border transition-all duration-200 ${inactive
                                    ? 'border-gray-300/50 dark:border-gray-700/50 opacity-60'
                                    : 'border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg'
                                    }`}
                            >
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    {/* Código */}
                                    <div className="flex items-center gap-3">
                                        <code className="text-xl font-mono font-bold text-gray-900 dark:text-white tracking-wider bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-xl">
                                            {convite.codigo}
                                        </code>
                                        <button
                                            onClick={() => copiarCodigo(convite.codigo)}
                                            className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            title="Copiar código"
                                        >
                                            {copiedCode === convite.codigo ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <Copy className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Status badge */}
                                    <div className="flex items-center gap-2">
                                        {inactive ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
                                                <XCircle className="w-4 h-4" />
                                                {expired ? 'Expirado' : used ? 'Esgotado' : 'Inativo'}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                                                <CheckCircle className="w-4 h-4" />
                                                Ativo
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Detalhes */}
                                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div>
                                        <span className="font-medium">Cargo:</span>{' '}
                                        {getRoleLabel(convite.role)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Usos:</span>{' '}
                                        {convite.usos_atuais}/{convite.max_usos === 0 ? '∞' : convite.max_usos}
                                    </div>
                                    <div>
                                        <span className="font-medium">Criado:</span>{' '}
                                        {formatDate(convite.created_at)}
                                    </div>
                                    {convite.expira_em && (
                                        <div>
                                            <span className="font-medium">Expira:</span>{' '}
                                            {formatDate(convite.expira_em)}
                                        </div>
                                    )}
                                </div>

                                {convite.email_convidado && (
                                    <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                                        <Mail className="w-4 h-4 inline mr-1" />
                                        Restrito a: {convite.email_convidado}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ManageInvites;
