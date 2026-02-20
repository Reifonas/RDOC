import React, { createContext, useContext, useEffect, useState } from 'react';
import { useOffline } from '../hooks/useOffline';
import { OfflineManager } from '../lib/offlineDb';
import { OfflineStatus } from '../components/OfflineStatus';

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperationsCount: number;
  syncPendingOperations: () => Promise<void>;
  cacheDataForOffline: () => Promise<void>;
  showOfflineNotification: boolean;
  dismissOfflineNotification: () => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOfflineContext = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOfflineContext must be used within an OfflineProvider');
  }
  return context;
};

interface OfflineProviderProps {
  children: React.ReactNode;
  showNotifications?: boolean;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ 
  children, 
  showNotifications = true 
}) => {
  const {
    isOnline,
    isSyncing,
    pendingOperations,
    syncPendingOperations,
    cacheDataForOffline,
  } = useOffline();

  const [showOfflineNotification, setShowOfflineNotification] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  // Monitorar mudanças de conectividade
  useEffect(() => {
    if (!isOnline && !hasBeenOffline) {
      setHasBeenOffline(true);
      setShowOfflineNotification(true);
    } else if (isOnline && hasBeenOffline) {
      // Quando voltar online, mostrar notificação de sincronização
      if (pendingOperations.length > 0) {
        setShowOfflineNotification(true);
      }
    }
  }, [isOnline, hasBeenOffline, pendingOperations.length]);

  // Limpeza automática de dados antigos
  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      await OfflineManager.cleanOldData();
    }, 24 * 60 * 60 * 1000); // Uma vez por dia

    return () => clearInterval(cleanupInterval);
  }, []);

  // Auto-sync quando voltar online
  useEffect(() => {
    if (isOnline && pendingOperations.length > 0 && !isSyncing) {
      const autoSyncTimeout = setTimeout(() => {
        syncPendingOperations();
      }, 2000); // Aguardar 2 segundos para estabilizar a conexão

      return () => clearTimeout(autoSyncTimeout);
    }
  }, [isOnline, pendingOperations.length, isSyncing, syncPendingOperations]);

  const dismissOfflineNotification = () => {
    setShowOfflineNotification(false);
  };

  const contextValue: OfflineContextType = {
    isOnline,
    isSyncing,
    pendingOperationsCount: pendingOperations.length,
    syncPendingOperations,
    cacheDataForOffline,
    showOfflineNotification,
    dismissOfflineNotification,
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
      
      {/* Notificações de status offline */}
      {showNotifications && (
        <>
          {/* Notificação flutuante */}
          {showOfflineNotification && (
            <div className="fixed top-4 right-4 z-50 max-w-sm">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {!isOnline ? (
                      <OfflineNotification 
                        type="offline" 
                        onDismiss={dismissOfflineNotification}
                      />
                    ) : pendingOperations.length > 0 ? (
                      <OfflineNotification 
                        type="sync" 
                        pendingCount={pendingOperations.length}
                        isSyncing={isSyncing}
                        onSync={syncPendingOperations}
                        onDismiss={dismissOfflineNotification}
                      />
                    ) : (
                      <OfflineNotification 
                        type="synced" 
                        onDismiss={dismissOfflineNotification}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Barra de status fixa (quando offline) */}
          {!isOnline && (
            <div className="fixed top-0 left-0 right-0 z-40 bg-orange-500 text-white px-4 py-2">
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Modo offline ativo - Suas alterações serão sincronizadas quando a conexão for restaurada</span>
              </div>
            </div>
          )}
        </>
      )}
    </OfflineContext.Provider>
  );
};

// Componente de notificação
interface OfflineNotificationProps {
  type: 'offline' | 'sync' | 'synced';
  pendingCount?: number;
  isSyncing?: boolean;
  onSync?: () => void;
  onDismiss: () => void;
}

const OfflineNotification: React.FC<OfflineNotificationProps> = ({
  type,
  pendingCount = 0,
  isSyncing = false,
  onSync,
  onDismiss,
}) => {
  useEffect(() => {
    if (type === 'synced') {
      // Auto-dismiss após 3 segundos quando sincronizado
      const timeout = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timeout);
    }
  }, [type, onDismiss]);

  const getNotificationContent = () => {
    switch (type) {
      case 'offline':
        return {
          title: 'Modo Offline',
          message: 'Você está trabalhando offline. Suas alterações serão salvas localmente.',
          color: 'orange',
          showDismiss: true,
        };
      
      case 'sync':
        return {
          title: 'Sincronização Pendente',
          message: `${pendingCount} operação(ões) aguardando sincronização.`,
          color: 'blue',
          showDismiss: true,
          showSyncButton: true,
        };
      
      case 'synced':
        return {
          title: 'Sincronizado',
          message: 'Todas as alterações foram sincronizadas com sucesso.',
          color: 'green',
          showDismiss: false,
        };
      
      default:
        return {
          title: '',
          message: '',
          color: 'gray',
          showDismiss: true,
        };
    }
  };

  const { title, message, color, showDismiss, showSyncButton } = getNotificationContent();

  const colorClasses = {
    orange: 'text-orange-800 bg-orange-50 border-orange-200',
    blue: 'text-blue-800 bg-blue-50 border-blue-200',
    green: 'text-green-800 bg-green-50 border-green-200',
    gray: 'text-gray-800 bg-gray-50 border-gray-200',
  };

  return (
    <div className={`p-3 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs mt-1 opacity-90">{message}</p>
          
          {showSyncButton && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
              </button>
            </div>
          )}
        </div>
        
        {showDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineProvider;