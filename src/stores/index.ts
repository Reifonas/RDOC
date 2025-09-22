// Exportar stores principais
export { useUserStore } from './useUserStore';
export { useObraStore } from './useObraStore';
export { useTaskStore } from './useTaskStore';
export { useAppStore } from './useAppStore';

// Tipos para os stores
export type { UserState } from './useUserStore';
export type { ObraState } from './useObraStore';
export type { TaskState } from './useTaskStore';
export type { AppState } from './useAppStore';

// Hook combinado para inicialização dos stores
import { useEffect } from 'react';
import { useUserStore } from './useUserStore';
import { useObraStore } from './useObraStore';
import { useTaskStore } from './useTaskStore';
import { useAppStore } from './useAppStore';
// import { useAuthContext } from '../contexts/AuthContext'; // Comentado temporariamente

/**
 * Hook para inicializar todos os stores da aplicação
 * Deve ser usado no componente raiz da aplicação
 */
export const useInitializeStores = () => {
  // const { user } = useAuthContext(); // Comentado temporariamente
  const user = null; // Placeholder
  const { fetchUsers } = useUserStore();
  const { fetchObras } = useObraStore();
  const { fetchTasks } = useTaskStore();
  const { startSync, settings } = useAppStore();

  useEffect(() => {
    if (user) {
      // Inicializar dados quando o usuário estiver autenticado
      const initializeData = async () => {
        try {
          // Buscar dados em paralelo
          await Promise.all([
            fetchUsers(),
            fetchObras(),
            fetchTasks(),
          ]);

          // Sincronização inicial se habilitada
          if (settings.autoSync) {
            await startSync();
          }
        } catch (error) {
          console.error('Erro ao inicializar dados:', error);
        }
      };

      initializeData();
    }
  }, [user, fetchUsers, fetchObras, fetchTasks, startSync, settings.autoSync]);
};

/**
 * Hook para limpar todos os stores (útil no logout)
 */
export const useClearStores = () => {
  const userStore = useUserStore();
  const obraStore = useObraStore();
  const taskStore = useTaskStore();
  const appStore = useAppStore();

  return () => {
    userStore.reset();
    obraStore.reset();
    taskStore.reset();
    // Não resetar completamente o appStore para manter configurações
    appStore.clearNotifications();
  };
};

/**
 * Hook para sincronização manual de todos os dados
 */
export const useSyncAllData = () => {
  const { fetchUsers } = useUserStore();
  const { fetchObras } = useObraStore();
  const { fetchTasks } = useTaskStore();
  const { startSync } = useAppStore();

  return async () => {
    try {
      await startSync();
      
      // Recarregar todos os dados após sincronização
      await Promise.all([
        fetchUsers(),
        fetchObras(),
        fetchTasks(),
      ]);
      
      return true;
    } catch (error) {
      console.error('Erro na sincronização:', error);
      return false;
    }
  };
};

/**
 * Hook para obter estatísticas gerais da aplicação
 */
export const useAppStats = () => {
  const { users } = useUserStore();
  const { obras } = useObraStore();
  const { tasks } = useTaskStore();
  
  return {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.ativo).length,
    totalObras: obras.length,
    obrasEmAndamento: obras.filter(o => o.status === 'ativa').length,
    totalTasks: tasks.length,
    tasksPendentes: tasks.filter(t => t.status === 'pendente').length,
    tasksEmAndamento: tasks.filter(t => t.status === 'em_andamento').length,
    tasksConcluidas: tasks.filter(t => t.status === 'concluida').length,
    tasksAtrasadas: tasks.filter(t => {
      const now = new Date().toISOString();
      return t.data_fim < now && t.status !== 'concluida' && t.status !== 'cancelada';
    }).length,
  };
};

/**
 * Hook para obter dados do dashboard
 */
export const useDashboardData = () => {
  const stats = useAppStats();
  const { tasks: allTasks } = useTaskStore();
  const { obras: allObras } = useObraStore();
  const { notifications } = useAppStore();
  const recentTasks = allTasks.slice(0, 5); // 5 tarefas mais recentes
  const recentObras = allObras.slice(0, 5); // 5 obras mais recentes
  const unreadNotifications = notifications.filter(n => !n.read);
  
  return {
    stats,
    recentTasks,
    recentObras,
    notifications: unreadNotifications.slice(0, 10), // 10 notificações mais recentes
  };
};