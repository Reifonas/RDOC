import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Tipos para notificações
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  autoClose?: boolean;
  duration?: number;
}

// Tipos para configurações
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'pt-BR' | 'en-US';
  autoSync: boolean;
  syncInterval: number; // em minutos
  offlineMode: boolean;
  notifications: {
    push: boolean;
    email: boolean;
    sound: boolean;
  };
  display: {
    density: 'compact' | 'comfortable' | 'spacious';
    animations: boolean;
    reducedMotion: boolean;
  };
}

// Estado da aplicação focado em UI e configurações
interface AppState {
  // Estado de conectividade e sincronização
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: string | null;
  syncError: string | null;
  
  // Estado de UI
  isLoading: boolean;
  sidebarCollapsed: boolean;
  currentView: string;
  
  // Notificações
  notifications: Notification[];
  
  // Configurações
  settings: AppSettings;
  
  // Filtros e estado de navegação
  filters: {
    users: Record<string, any>;
    obras: Record<string, any>;
    tasks: Record<string, any>;
    rdos: Record<string, any>;
  };
  
  // Ações para conectividade
  setOnline: (online: boolean) => void;
  setConnectivity: (online: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSync: (timestamp: string) => void;
  setSyncError: (error: string | null) => void;
  
  // Ações para UI
  setLoading: (loading: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentView: (view: string) => void;
  
  // Ações para notificações
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Ações para configurações
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  
  // Ações para filtros
  setFilter: (entity: keyof AppState['filters'], filters: Record<string, any>) => void;
  clearFilters: (entity?: keyof AppState['filters']) => void;
  
  // Utilitários
  initializeApp: () => void;
  reset: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'pt-BR',
  autoSync: true,
  syncInterval: 5,
  offlineMode: false,
  notifications: {
    push: true,
    email: false,
    sound: true,
  },
  display: {
    density: 'comfortable',
    animations: true,
    reducedMotion: false,
  },
};

const initialState = {
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSync: null,
  syncError: null,
  isLoading: false,
  sidebarCollapsed: false,
  currentView: 'dashboard',
  notifications: [],
  settings: defaultSettings,
  filters: {
    users: {},
    obras: {},
    tasks: {},
    rdos: {},
  },
};

export const useAppStateStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Ações para conectividade
        setOnline: (online) => set({ isOnline: online }, false, 'setOnline'),
        
        setConnectivity: (online) => set({ isOnline: online }, false, 'setConnectivity'),
        
        setSyncing: (syncing) => set({ isSyncing: syncing }, false, 'setSyncing'),
        
        setLastSync: (timestamp) => set({ lastSync: timestamp }, false, 'setLastSync'),
        
        setSyncError: (error) => set({ syncError: error }, false, 'setSyncError'),
        
        // Ações para UI
        setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),
        
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }, false, 'setSidebarCollapsed'),
        
        setCurrentView: (view) => set({ currentView: view }, false, 'setCurrentView'),
        
        // Ações para notificações
        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            read: false,
          };
          
          set(
            (state) => ({
              notifications: [newNotification, ...state.notifications].slice(0, 50), // Manter apenas 50 notificações
            }),
            false,
            'addNotification'
          );
        },
        
        removeNotification: (id) => {
          set(
            (state) => ({
              notifications: state.notifications.filter(n => n.id !== id),
            }),
            false,
            'removeNotification'
          );
        },
        
        markNotificationAsRead: (id) => {
          set(
            (state) => ({
              notifications: state.notifications.map(n => 
                n.id === id ? { ...n, read: true } : n
              ),
            }),
            false,
            'markNotificationAsRead'
          );
        },
        
        clearNotifications: () => set({ notifications: [] }, false, 'clearNotifications'),
        
        // Ações para configurações
        updateSettings: (newSettings) => {
          set(
            (state) => ({
              settings: { ...state.settings, ...newSettings },
            }),
            false,
            'updateSettings'
          );
        },
        
        resetSettings: () => set({ settings: defaultSettings }, false, 'resetSettings'),
        
        // Ações para filtros
        setFilter: (entity, filters) => {
          set(
            (state) => ({
              filters: {
                ...state.filters,
                [entity]: filters,
              },
            }),
            false,
            'setFilter'
          );
        },
        
        clearFilters: (entity) => {
          if (entity) {
            set(
              (state) => ({
                filters: {
                  ...state.filters,
                  [entity]: {},
                },
              }),
              false,
              'clearFilter'
            );
          } else {
            set(
              {
                filters: {
                  users: {},
                  obras: {},
                  tasks: {},
                  rdos: {},
                },
              },
              false,
              'clearAllFilters'
            );
          }
        },
        
        // Utilitários
        initializeApp: () => {
          // Inicializar estado da aplicação
          set({ 
            isOnline: navigator.onLine,
            isLoading: false,
            lastSync: null,
            syncError: null 
          }, false, 'initializeApp');
        },
        
        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'app-state-store',
        partialize: (state) => ({
          settings: state.settings,
          sidebarCollapsed: state.sidebarCollapsed,
          filters: state.filters,
        }),
      }
    ),
    {
      name: 'app-state-store',
    }
  )
);

// Seletores otimizados
export const useIsOnline = () => useAppStateStore((state) => state.isOnline);
export const useIsSyncing = () => useAppStateStore((state) => state.isSyncing);
export const useIsLoading = () => useAppStateStore((state) => state.isLoading);
export const useTheme = () => useAppStateStore((state) => state.settings.theme);
export const useLanguage = () => useAppStateStore((state) => state.settings.language);
export const useNotifications = () => useAppStateStore((state) => state.notifications);
export const useUnreadNotifications = () => useAppStateStore((state) => 
  state.notifications.filter(n => !n.read)
);
export const useSettings = () => useAppStateStore((state) => state.settings);
export const useSidebarCollapsed = () => useAppStateStore((state) => state.sidebarCollapsed);
export const useCurrentView = () => useAppStateStore((state) => state.currentView);
export const useFilters = (entity: keyof AppState['filters']) => 
  useAppStateStore((state) => state.filters[entity]);

// Configurar listeners para eventos do sistema
if (typeof window !== 'undefined') {
  // Listener para mudanças de conectividade
  window.addEventListener('online', () => {
    useAppStateStore.getState().setOnline(true);
  });
  
  window.addEventListener('offline', () => {
    useAppStateStore.getState().setOnline(false);
  });
  
  // Listener para mudanças de tema do sistema
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    // Trigger re-render se o tema for 'system'
    const { settings } = useAppStateStore.getState();
    if (settings.theme === 'system') {
      // Force update para aplicar o novo tema
      useAppStateStore.getState().updateSettings({ theme: 'system' });
    }
  });
}