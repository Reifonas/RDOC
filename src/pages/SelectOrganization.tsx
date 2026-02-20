/**
 * Página de Seleção de Organização
 * 
 * Exibida quando o usuário faz login (Google ou email) mas ainda
 * não está associado a nenhuma organização.
 * O usuário deve informar um código de convite recebido do admin.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useInviteCode } from '../hooks/useInviteCode';
import { useAuthContext } from '../contexts/AuthContext';
import { Building2, KeyRound, CheckCircle, XCircle, LogOut, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import NeuralNetworkBackground from '../components/NeuralNetworkBackground';

const SelectOrganization: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuthContext();
    const { loading, validarConvite, usarConvite } = useInviteCode();

    const [codigo, setCodigo] = useState('');
    const [step, setStep] = useState<'input' | 'confirm' | 'success' | 'error'>('input');
    const [conviteInfo, setConviteInfo] = useState<{
        organizacao_nome: string;
        organizacao_id: string;
        role: string;
    } | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            setUserId(user.id);
            setUserName(user.user_metadata?.full_name || user.user_metadata?.nome || user.email?.split('@')[0] || 'Usuário');

            // Verificar se já tem organização
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: usuario } = await (supabase as any)
                .from('usuarios')
                .select('organizacao_id')
                .eq('id', user.id)
                .single();

            if (usuario && usuario.organizacao_id) {
                navigate('/dashboard');
            }
        };

        checkUser();
    }, [navigate]);

    const handleValidar = async () => {
        if (!codigo.trim()) {
            setErrorMessage('Digite o código de convite.');
            return;
        }

        console.log('SelectOrganization: validando código:', codigo);
        setErrorMessage('');
        const result = await validarConvite(codigo);
        console.log('SelectOrganization: resultado validação:', result);

        if (result.success) {
            setConviteInfo({
                organizacao_nome: result.organizacao_nome || 'Organização',
                organizacao_id: result.organizacao_id || '',
                role: result.role || 'usuario',
            });
            setStep('confirm');
        } else {
            setErrorMessage(result.error || 'Código inválido.');
        }
    };

    const handleConfirmar = async () => {
        console.log('SelectOrganization: usando convite:', codigo, 'userId:', userId);
        const result = await usarConvite(codigo, userId);
        console.log('SelectOrganization: resultado usar convite:', result);

        if (result.success) {
            setStep('success');
            // Recarregar perfil no store e redirecionar
            setTimeout(() => {
                navigate('/dashboard');
                window.location.reload(); // Forçar recarregamento para atualizar contexto
            }, 2000);
        } else {
            setErrorMessage(result.error || 'Erro ao ingressar na organização.');
            setStep('error');
        }
    };

    const handleLogout = async () => {
        await logout();
        // O logout já faz window.location.href = '/login'
    };

    const handleVoltar = () => {
        setStep('input');
        setConviteInfo(null);
        setErrorMessage('');
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

    return (
        <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <NeuralNetworkBackground />

            <div className="relative z-10 max-w-lg w-full space-y-6 animate-fade-in">
                {/* Header */}
                <div className="text-center">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 inline-block mb-4">
                        <Building2 className="w-16 h-16 text-blue-300 mx-auto" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Bem-vindo, {userName}!
                    </h1>
                    <p className="text-blue-200 text-lg">
                        Para acessar o sistema, informe o código de convite da sua organização.
                    </p>
                </div>

                {/* Card principal */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 transition-all duration-300">

                    {/* STEP: INPUT */}
                    {step === 'input' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <KeyRound className="w-6 h-6 text-yellow-300" />
                                <h2 className="text-xl font-semibold text-white">Código de Convite</h2>
                            </div>

                            <p className="text-blue-200 text-sm">
                                Solicite o código de convite ao administrador da sua organização.
                                O código é composto por 8 caracteres alfanuméricos.
                            </p>

                            {errorMessage && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-400/30 rounded-xl">
                                    <XCircle className="w-5 h-5 text-red-300 flex-shrink-0" />
                                    <p className="text-red-200 text-sm">{errorMessage}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Digite o código
                                </label>
                                <input
                                    type="text"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                                    placeholder="Ex: A1B2C3D4"
                                    maxLength={8}
                                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-center text-2xl font-mono tracking-[0.3em] placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200 uppercase"
                                    onKeyDown={(e) => e.key === 'Enter' && handleValidar()}
                                    autoFocus
                                />
                            </div>

                            <button
                                onClick={handleValidar}
                                disabled={loading || codigo.length < 4}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Verificando...
                                    </>
                                ) : (
                                    <>
                                        Verificar Código
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* STEP: CONFIRM */}
                    {step === 'confirm' && conviteInfo && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <ShieldCheck className="w-6 h-6 text-green-300" />
                                <h2 className="text-xl font-semibold text-white">Confirmar Ingresso</h2>
                            </div>

                            <div className="p-4 bg-green-500/10 border border-green-400/30 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-green-200 text-sm">Organização:</span>
                                    <span className="text-white font-semibold text-lg">{conviteInfo.organizacao_nome}</span>
                                </div>
                                <div className="h-px bg-green-400/20"></div>
                                <div className="flex items-center justify-between">
                                    <span className="text-green-200 text-sm">Seu cargo será:</span>
                                    <span className="text-white font-medium">{getRoleLabel(conviteInfo.role)}</span>
                                </div>
                                <div className="h-px bg-green-400/20"></div>
                                <div className="flex items-center justify-between">
                                    <span className="text-green-200 text-sm">Código:</span>
                                    <span className="text-white font-mono">{codigo}</span>
                                </div>
                            </div>

                            <p className="text-blue-200 text-sm text-center">
                                Deseja ingressar nesta organização?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleVoltar}
                                    disabled={loading}
                                    className="flex-1 py-3 px-4 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-200 font-medium"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={handleConfirmar}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Ingressando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Confirmar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP: SUCCESS */}
                    {step === 'success' && (
                        <div className="text-center space-y-4 py-4">
                            <CheckCircle className="w-20 h-20 text-green-400 mx-auto animate-bounce" />
                            <h2 className="text-2xl font-bold text-white">Bem-vindo à equipe!</h2>
                            <p className="text-green-200">
                                Você ingressou na organização <strong>{conviteInfo?.organizacao_nome}</strong> com sucesso!
                            </p>
                            <p className="text-blue-200 text-sm">
                                Redirecionando para o painel...
                            </p>
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                <div className="bg-green-400 h-2 rounded-full animate-pulse w-2/3"></div>
                            </div>
                        </div>
                    )}

                    {/* STEP: ERROR */}
                    {step === 'error' && (
                        <div className="text-center space-y-4 py-4">
                            <XCircle className="w-20 h-20 text-red-400 mx-auto" />
                            <h2 className="text-2xl font-bold text-white">Erro ao Ingressar</h2>
                            <p className="text-red-200">{errorMessage}</p>
                            <button
                                onClick={handleVoltar}
                                className="mt-4 py-3 px-6 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-200 font-medium"
                            >
                                Tentar Novamente
                            </button>
                        </div>
                    )}
                </div>

                {/* Logout */}
                <div className="text-center">
                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors duration-200 text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair e usar outra conta
                    </button>
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-300">
                    <p className="italic">Desenvolvido por TrackSteel</p>
                </div>
            </div>
        </div>
    );
};

export default SelectOrganization;
