/**
 * Indicador de Status Offline
 * 
 * Componente sempre visível que mostra:
 * - Status online/offline
 * - Operações pendentes
 * - Progresso de sincronização
 */

import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { syncService, type SyncStatus, type SyncStats } from '../services/syncService';

export const OfflineIndicator: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        status: 'idle',
        message: '',
        progress: 0
    });
    const [stats, setStats] = useState<SyncStats>({
        pendingRDOs: 0,
        pendingOperations: 0,
        unresolvedConflicts: 0,
        isOnline: true,
        isSyncing: false
    });
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Atualizar status online/offline
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Escutar mudanças de sincronização
        const unsubscribe = syncService.onSyncStatusChange((status) => {
            setSyncStatus(status);
        });

        // Atualizar estatísticas a cada 5 segundos
        const interval = setInterval(async () => {
            const newStats = await syncService.getSyncStats();
            setStats(newStats);
        }, 5000);

        // Carregar estatísticas iniciais
        syncService.getSyncStats().then(setStats);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const handleSync = async () => {
        await syncService.forceSync();
    };

    const hasPendingData = stats.pendingRDOs > 0 || stats.pendingOperations > 0;
    const hasConflicts = stats.unresolvedConflicts > 0;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Indicador compacto */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
          flex items-center gap-2 px-4 py-2 rounded-full shadow-lg
          transition-all duration-200 hover:scale-105
          ${isOnline
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-orange-500 hover:bg-orange-600'
                    }
          text-white font-medium
        `}
            >
                {isOnline ? (
                    <Wifi className="w-4 h-4" />
                ) : (
                    <WifiOff className="w-4 h-4" />
                )}

                {stats.isSyncing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                ) : hasPendingData ? (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                        {stats.pendingRDOs + stats.pendingOperations}
                    </span>
                ) : null}
            </button>

            {/* Painel expandido */}
            {isExpanded && (
                <div className="absolute bottom-14 right-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className={`
            px-4 py-3 text-white
            ${isOnline ? 'bg-green-500' : 'bg-orange-500'}
          `}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {isOnline ? (
                                    <Wifi className="w-5 h-5" />
                                ) : (
                                    <WifiOff className="w-5 h-5" />
                                )}
                                <span className="font-semibold">
                                    {isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="hover:bg-white/20 rounded p-1 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="p-4 space-y-3">
                        {/* Status de sincronização */}
                        {stats.isSyncing && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                                    <span>{syncStatus.message}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${syncStatus.progress}%` }}
                                        aria-label={`Progresso: ${syncStatus.progress}%`}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Estatísticas */}
                        <div className="space-y-2">
                            {stats.pendingRDOs > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">RDOs pendentes</span>
                                    <span className="font-semibold text-orange-600">
                                        {stats.pendingRDOs}
                                    </span>
                                </div>
                            )}

                            {stats.pendingOperations > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Operações pendentes</span>
                                    <span className="font-semibold text-orange-600">
                                        {stats.pendingOperations}
                                    </span>
                                </div>
                            )}

                            {hasConflicts && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        Conflitos não resolvidos
                                    </span>
                                    <span className="font-semibold text-red-600">
                                        {stats.unresolvedConflicts}
                                    </span>
                                </div>
                            )}

                            {!hasPendingData && !hasConflicts && isOnline && (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Tudo sincronizado</span>
                                </div>
                            )}
                        </div>

                        {/* Botão de sincronização manual */}
                        {isOnline && hasPendingData && !stats.isSyncing && (
                            <button
                                onClick={handleSync}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Sincronizar Agora
                            </button>
                        )}

                        {/* Mensagem offline */}
                        {!isOnline && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
                                <p className="font-medium">Modo Offline</p>
                                <p className="text-xs mt-1">
                                    Seus dados serão sincronizados automaticamente quando a conexão for restabelecida.
                                </p>
                            </div>
                        )}

                        {/* Link para logs */}
                        {hasConflicts && (
                            <a
                                href="/sync-logs"
                                className="block text-center text-sm text-blue-600 hover:text-blue-700 underline"
                            >
                                Ver detalhes dos conflitos
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
