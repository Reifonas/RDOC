/**
 * Página de Logs de Sincronização
 * 
 * Exibe histórico de sincronizações e conflitos não resolvidos
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConflictStore, type DataConflict } from '../services/conflictResolver';
import { syncService, type SyncStats } from '../services/syncService';

export const SyncLogsPage: React.FC = () => {
    const navigate = useNavigate();
    const [conflicts, setConflicts] = useState<Array<DataConflict & { savedAt: number }>>([]);
    const [stats, setStats] = useState<SyncStats | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const unresolvedConflicts = ConflictStore.getUnresolvedConflicts();
        setConflicts(unresolvedConflicts);

        const syncStats = await syncService.getSyncStats();
        setStats(syncStats);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleResolveConflict = (conflictId: string) => {
        // Aqui você implementaria a lógica de resolução manual
        // Por enquanto, apenas remove o conflito
        ConflictStore.removeConflict(conflictId);
        loadData();
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('pt-BR');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatJSON = (obj: any) => {
        return JSON.stringify(obj, null, 2);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Voltar"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Logs de Sincronização
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Histórico de sincronizações e conflitos não resolvidos
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Estatísticas */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <p className="text-2xl font-bold mt-1">
                                        {stats.isOnline ? (
                                            <span className="text-green-600">Online</span>
                                        ) : (
                                            <span className="text-orange-600">Offline</span>
                                        )}
                                    </p>
                                </div>
                                {stats.isOnline ? (
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                ) : (
                                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">RDOs Pendentes</p>
                                    <p className="text-2xl font-bold mt-1 text-gray-900">
                                        {stats.pendingRDOs}
                                    </p>
                                </div>
                                <Clock className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Operações Pendentes</p>
                                    <p className="text-2xl font-bold mt-1 text-gray-900">
                                        {stats.pendingOperations}
                                    </p>
                                </div>
                                <RefreshCw className="w-8 h-8 text-purple-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Conflitos</p>
                                    <p className="text-2xl font-bold mt-1 text-red-600">
                                        {stats.unresolvedConflicts}
                                    </p>
                                </div>
                                <XCircle className="w-8 h-8 text-red-500" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de Conflitos */}
                {conflicts.length > 0 ? (
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Conflitos Não Resolvidos
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Estes conflitos requerem revisão manual
                            </p>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {conflicts.map((conflict) => (
                                <div key={conflict.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                                <h3 className="font-semibold text-gray-900">
                                                    {conflict.table} - {conflict.id}
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                                        Versão Local
                                                    </p>
                                                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                                        <p className="text-xs text-gray-600 mb-1">
                                                            Modificado em: {formatDate(conflict.localTimestamp)}
                                                        </p>
                                                        <pre className="text-xs text-gray-800 overflow-auto max-h-40">
                                                            {formatJSON(conflict.localVersion)}
                                                        </pre>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                                        Versão Remota
                                                    </p>
                                                    <div className="bg-green-50 border border-green-200 rounded p-3">
                                                        <p className="text-xs text-gray-600 mb-1">
                                                            Modificado em: {formatDate(conflict.remoteTimestamp)}
                                                        </p>
                                                        <pre className="text-xs text-gray-800 overflow-auto max-h-40">
                                                            {formatJSON(conflict.remoteVersion)}
                                                        </pre>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 mt-4">
                                                <button
                                                    onClick={() => handleResolveConflict(conflict.id)}
                                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Usar Versão Local
                                                </button>
                                                <button
                                                    onClick={() => handleResolveConflict(conflict.id)}
                                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Usar Versão Remota
                                                </button>
                                                <button
                                                    onClick={() => handleResolveConflict(conflict.id)}
                                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Resolver Manualmente
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Nenhum Conflito
                        </h3>
                        <p className="text-gray-600">
                            Todos os dados estão sincronizados corretamente
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
