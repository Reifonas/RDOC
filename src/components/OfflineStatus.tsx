import React from 'react';
import { Wifi, WifiOff, RefreshCw, Database, Clock, AlertCircle } from 'lucide-react';
import { useOffline, useOfflineStats } from '../hooks/useOffline';
import { OfflineManager } from '../lib/offlineDb';

interface OfflineStatusProps {
  showDetails?: boolean;
  className?: string;
}

export const OfflineStatus: React.FC<OfflineStatusProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const { 
    isOnline, 
    isSyncing, 
    pendingOperations, 
    syncPendingOperations, 
    cacheDataForOffline 
  } = useOffline();
  
  const { stats } = useOfflineStats();

  const handleSync = async () => {
    if (isOnline) {
      await syncPendingOperations();
      await cacheDataForOffline();
    }
  };

  const handleClearCache = async () => {
    if (confirm('Tem certeza que deseja limpar todo o cache offline? Isso removerá todos os dados salvos localmente.')) {
      await OfflineManager.clearCache();
      window.location.reload();
    }
  };

  const formatLastSync = (timestamp?: number) => {
    if (!timestamp) return 'Nunca';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays} dias atrás`;
  };

  if (!showDetails) {
    // Versão compacta - apenas ícone de status
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {isOnline ? (
          <div className="flex items-center gap-1 text-green-600">
            <Wifi size={16} />
            <span className="text-sm">Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-orange-600">
            <WifiOff size={16} />
            <span className="text-sm">Offline</span>
          </div>
        )}
        
        {pendingOperations.length > 0 && (
          <div className="flex items-center gap-1 text-blue-600">
            <Clock size={14} />
            <span className="text-xs">{pendingOperations.length}</span>
          </div>
        )}
        
        {isSyncing && (
          <RefreshCw size={14} className="animate-spin text-blue-600" />
        )}
      </div>
    );
  }

  // Versão detalhada - painel completo
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Status de Conectividade</h3>
        
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-2 text-green-600">
              <Wifi size={20} />
              <span className="font-medium">Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-600">
              <WifiOff size={20} />
              <span className="font-medium">Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas do cache */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Database size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Usuários</span>
          </div>
          <span className="text-xl font-bold text-blue-600">{(stats as any).usuarios}</span>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Database size={16} className="text-green-600" />
            <span className="text-sm font-medium text-green-800">Obras</span>
          </div>
          <span className="text-xl font-bold text-green-600">{(stats as any).obras}</span>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Database size={16} className="text-purple-600" />
            <span className="text-sm font-medium text-purple-800">RDOs</span>
          </div>
          <span className="text-xl font-bold text-purple-600">{(stats as any).rdos}</span>
        </div>
        
        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Pendentes</span>
          </div>
          <span className="text-xl font-bold text-orange-600">{(stats as any).pendingOperations}</span>
        </div>
      </div>

      {/* Informações de sincronização */}
      <div className="bg-gray-50 p-3 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Última sincronização:</span>
          <span className="text-sm text-gray-600">{formatLastSync((stats as any).lastSync)}</span>
        </div>
        
        {pendingOperations.length > 0 && (
          <div className="flex items-center gap-2 text-orange-600">
            <AlertCircle size={16} />
            <span className="text-sm">
              {pendingOperations.length} operação(ões) aguardando sincronização
            </span>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex gap-2">
        <button
          onClick={handleSync}
          disabled={!isOnline || isSyncing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
        </button>
        
        <button
          onClick={handleClearCache}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Limpar Cache
        </button>
      </div>

      {/* Lista de operações pendentes */}
      {pendingOperations.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Operações Pendentes:</h4>
          <div className="max-h-32 overflow-y-auto">
            {pendingOperations.slice(0, 5).map((operation, index) => (
              <div key={operation.id || index} className="flex items-center justify-between py-1 text-sm">
                <span className="text-gray-600">
                  {operation.operation.toUpperCase()} em {operation.table}
                </span>
                <span className="text-xs text-gray-500">
                  {formatLastSync(operation.timestamp)}
                </span>
                {operation.error && (
                  <div title={operation.error}>
                    <AlertCircle size={14} className="text-red-500" />
                  </div>
                )}
              </div>
            ))}
            {pendingOperations.length > 5 && (
              <div className="text-xs text-gray-500 mt-1">
                +{pendingOperations.length - 5} mais operações...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modo offline */}
      {!isOnline && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 text-orange-800">
            <WifiOff size={16} />
            <span className="font-medium">Modo Offline Ativo</span>
          </div>
          <p className="text-sm text-orange-700 mt-1">
            Você está trabalhando offline. Suas alterações serão sincronizadas quando a conexão for restaurada.
          </p>
        </div>
      )}
    </div>
  );
};

export default OfflineStatus;