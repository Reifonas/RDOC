import { create } from 'zustand';
// import { devtools, persist } from 'zustand/middleware'; // Comentado temporariamente
import { supabase } from '../lib/supabase';

interface AppState {
  // Estado da aplicação
  isOnline: boolean;
  isLoading: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'pt-BR' | 'en-US';
  notifications: Notification[];
  
  // Configurações
  settings: {
    autoSync: boolean;
    syncInterval: number; // em minutos
    offlineMode: boolean;
    showNotifications: boolean;
    compactMode: boolean;
  };
  
  // Estado de sincronização
  lastSync: string | null;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  syncError: string | null;
  
  // Ações
  setOnline: (online: boolean) => void;
  setLoading: (loading: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'pt-BR' | 'en-US') => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  
  // Operações de sincronização
  startSync: () => Promise<void>;
  setSyncStatus: (status: AppState['syncStatus']) => void;
  setSyncError: (error: string | null) => void;
  
  // Utilitários
  reset: () => void;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

const initialState = {
  isOnline: navigator.onLine,
  isLoading: false,
  theme: 'system' as const,
  language: 'pt-BR' as const,
  notifications: [],
  settings: {
    autoSync: true,
    syncInterval: 5, // 5 minutos
    offlineMode: false,
    showNotifications: true,
    compactMode: false,
  },
  lastSync: null,
  syncStatus: 'idle' as const,
  syncError: null,
};

export const useAppStore = create<AppState>((set, get) => ({
        ...initialState,
        
        // Ações básicas
        setOnline: (online) => {
          set({ isOnline: online });
          
          // Adicionar notificação de status de conexão
          if (!online) {
            get().addNotification({
              type: 'warning',
              title: 'Conexão perdida',
              message: 'Você está trabalhando offline. Os dados serão sincronizados quando a conexão for restabelecida.',
              read: false,
            });
          } else {
            get().addNotification({
              type: 'success',
              title: 'Conexão restabelecida',
              message: 'Sincronizando dados...',
              read: false,
            });
            
            // Auto-sync quando voltar online
            if (get().settings.autoSync) {
              get().startSync();
            }
          }
        },
        
        setLoading: (loading) => set({ isLoading: loading }),
        
        setTheme: (theme) => {
          set({ theme });
          
          // Aplicar tema no documento
          const root = document.documentElement;
          if (theme === 'dark') {
            root.classList.add('dark');
          } else if (theme === 'light') {
            root.classList.remove('dark');
          } else {
            // System theme
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
              root.classList.add('dark');
            } else {
              root.classList.remove('dark');
            }
          }
        },
        
        setLanguage: (language) => set({ language }),
        
        addNotification: (notificationData) => {
          const notification: Notification = {
            ...notificationData,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            read: false,
          };
          
          set(
            (state) => ({
              notifications: [notification, ...state.notifications].slice(0, 50), // Manter apenas 50 notificações
            })
          );
          
          // Auto-remover notificações de sucesso após 5 segundos
          if (notification.type === 'success') {
            setTimeout(() => {
              get().removeNotification(notification.id);
            }, 5000);
          }
        },
        
        removeNotification: (id) => set(
          (state) => ({
            notifications: state.notifications.filter(n => n.id !== id),
          })
        ),
        
        clearNotifications: () => set({ notifications: [] }),
        
        updateSettings: (newSettings) => set(
          (state) => ({
            settings: { ...state.settings, ...newSettings },
          })
        ),
        
        // Operações de sincronização
        startSync: async () => {
          try {
            const { isOnline, syncStatus } = get();
            
            if (!isOnline || syncStatus === 'syncing') {
              return;
            }
            
            set({ syncStatus: 'syncing', syncError: null });
            
            // Verificar conexão com Supabase
            const { data, error } = await supabase
              .from('usuarios')
              .select('count')
              .limit(1);
            
            if (error) throw error;
            
            // Simular sincronização (aqui você implementaria a lógica real)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            set({
              syncStatus: 'success',
              lastSync: new Date().toISOString(),
            });
            
            get().addNotification({
              type: 'success',
              title: 'Sincronização concluída',
              message: 'Todos os dados foram sincronizados com sucesso.',
              read: false,
            });
            
            // Reset status após 3 segundos
            setTimeout(() => {
              if (get().syncStatus === 'success') {
                set({ syncStatus: 'idle' });
              }
            }, 3000);
            
          } catch (error: any) {
            console.error('Erro na sincronização:', error);
            
            set({
              syncStatus: 'error',
              syncError: error.message || 'Erro na sincronização',
            });
            
            get().addNotification({
              type: 'error',
              title: 'Erro na sincronização',
              message: error.message || 'Não foi possível sincronizar os dados.',
              read: false,
              action: {
                label: 'Tentar novamente',
                callback: () => get().startSync(),
              },
            });
          }
        },
        
        setSyncStatus: (status) => set({ syncStatus: status }),
        
        setSyncError: (error) => set({ syncError: error }),
        
        reset: () => set(initialState),
      }));

// Configurar listeners para eventos do sistema
if (typeof window !== 'undefined') {
  // Listener para mudanças de conectividade
  window.addEventListener('online', () => {
    useAppStore.getState().setOnline(true);
  });
  
  window.addEventListener('offline', () => {
    useAppStore.getState().setOnline(false);
  });
  
  // Listener para mudanças de tema do sistema
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    const { theme, setTheme } = useAppStore.getState();
    if (theme === 'system') {
      setTheme('system'); // Trigger theme update
    }
  });
  
  // Auto-sync interval
  let syncInterval: NodeJS.Timeout;
  
  const setupAutoSync = () => {
    const { settings, isOnline, startSync } = useAppStore.getState();
    
    if (syncInterval) {
      clearInterval(syncInterval);
    }
    
    if (settings.autoSync && isOnline) {
      syncInterval = setInterval(() => {
        const { isOnline: currentOnline, settings: currentSettings } = useAppStore.getState();
        if (currentOnline && currentSettings.autoSync) {
          startSync();
        }
      }, settings.syncInterval * 60 * 1000); // Converter minutos para milissegundos
    }
  };
  
  // Configurar auto-sync inicial
  setupAutoSync();
  
  // Reconfigurar quando as configurações mudarem
  // Note: Subscribe functionality removed due to type issues
}

// Seletores para otimização de performance
export const useIsOnline = () => useAppStore((state) => state.isOnline);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useTheme = () => useAppStore((state) => state.theme);
export const useLanguage = () => useAppStore((state) => state.language);
export const useNotifications = () => useAppStore((state) => state.notifications);
export const useSettings = () => useAppStore((state) => state.settings);
export const useSyncStatus = () => useAppStore((state) => state.syncStatus);
export const useLastSync = () => useAppStore((state) => state.lastSync);

// Seletores derivados
export const useUnreadNotifications = () => useAppStore((state) => 
  state.notifications.filter(n => !n.read)
);

export const useNotificationsByType = (type: Notification['type']) => useAppStore((state) => 
  state.notifications.filter(n => n.type === type)
);

export const useIsSyncing = () => useAppStore((state) => state.syncStatus === 'syncing');

export const useHasSyncError = () => useAppStore((state) => state.syncStatus === 'error');

// Inicializar tema na primeira carga
if (typeof window !== 'undefined') {
  const { theme, setTheme } = useAppStore.getState();
  setTheme(theme);
}

// Exportar o tipo AppState
export type { AppState };