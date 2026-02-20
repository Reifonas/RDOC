import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { OfflineManager, offlineDb } from '../lib/offlineDb';
import { supabase } from '../lib/supabase';
import { queryKeys, invalidateQueries } from '../lib/queryClient';
import type { Usuario, Obra, RDO } from '../types/database.types';
import type { PendingOperation } from '../lib/offlineDb';

// Hook principal para funcionalidades offline
export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([]);

  // Carregar operações pendentes
  const loadPendingOperations = useCallback(async () => {
    const operations = await OfflineManager.getPendingOperations();
    setPendingOperations(operations);
  }, []);

  // Sincronizar operações pendentes
  const syncPendingOperations = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      const operations = await OfflineManager.getPendingOperations();

      for (const operation of operations) {
        try {
          await processPendingOperation(operation);
          await OfflineManager.removePendingOperation(operation.id!);
        } catch (error) {
          console.error('Error processing pending operation:', error);
          await OfflineManager.markOperationError(
            operation.id!,
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }

      // Recarregar operações pendentes
      await loadPendingOperations();

      // Invalidar queries para atualizar dados
      invalidateQueries.all();

      console.log('Sincronização concluída');
    } catch (error) {
      console.error('Error syncing pending operations:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, loadPendingOperations]);

  // Processar uma operação pendente
  const processPendingOperation = async (operation: PendingOperation) => {
    const { table, operation: op, data } = operation;

    switch (table) {
      case 'usuarios':
        if (op === 'create') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('usuarios').insert(data);
        } else if (op === 'update') {
          const { id, ...updateData } = data;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('usuarios').update(updateData).eq('id', id);
        } else if (op === 'delete') {
          await supabase.from('usuarios').delete().eq('id', data.id);
        }
        break;

      case 'obras':
        if (op === 'create') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('obras').insert(data);
        } else if (op === 'update') {
          const { id, ...updateData } = data;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('obras').update(updateData).eq('id', id);
        } else if (op === 'delete') {
          await supabase.from('obras').delete().eq('id', data.id);
        }
        break;

      case 'rdos':
        if (op === 'create') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('rdos').insert(data);
        } else if (op === 'update') {
          const { id, ...updateData } = data;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('rdos').update(updateData).eq('id', id);
        } else if (op === 'delete') {
          await supabase.from('rdos').delete().eq('id', data.id);
        }
        break;
    }
  };

  // Cache dados para uso offline
  const cacheDataForOffline = useCallback(async () => {
    if (!isOnline) return;

    try {
      // Prevenir 401 chamando o cache apenas se o usuário estiver logado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Cache usuários
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('*')
        .eq('ativo', true);

      if (usuarios) {
        await OfflineManager.cacheData('usuarios', usuarios);
      }

      // Cache obras
      const { data: obras } = await supabase
        .from('obras')
        .select('*');

      if (obras) {
        await OfflineManager.cacheData('obras', obras);
      }

      // Cache RDOs (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: rdos } = await supabase
        .from('rdos')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (rdos) {
        await OfflineManager.cacheData('rdos', rdos);
      }

      // Salvar timestamp da última sincronização
      await OfflineManager.setConfig('lastFullSync', Date.now());

      console.log('Dados cacheados para uso offline');
    } catch (error) {
      console.error('Error caching data for offline:', error);
    }
  }, [isOnline]);

  // Monitorar status de conectividade
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Conexão restaurada - iniciando sincronização');
      syncPendingOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Conexão perdida - modo offline ativado');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingOperations]);

  // Inicializar na montagem
  useEffect(() => {
    loadPendingOperations();
    if (isOnline) {
      cacheDataForOffline();
    }
  }, [loadPendingOperations, cacheDataForOffline, isOnline]);

  return {
    isOnline,
    isSyncing,
    pendingOperations,
    syncPendingOperations,
    cacheDataForOffline,
    loadPendingOperations,
  };
};

// Hook para operações offline de usuários
export const useOfflineUsers = () => {
  const { isOnline } = useOffline();
  const queryClient = useQueryClient();

  const createUserOffline = useCallback(async (userData: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>) => {
    const tempId = `temp_${Date.now()}`;
    const newUser = {
      ...userData,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Salvar no cache local
    await offlineDb.usuarios.add({
      ...newUser,
      _pendingSync: true,
      _lastSync: Date.now(),
    });

    // Adicionar operação pendente
    await OfflineManager.addPendingOperation('usuarios', 'create', newUser);

    // Invalidar queries para atualizar UI
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });

    return newUser;
  }, [queryClient]);

  const updateUserOffline = useCallback(async (id: string, userData: Partial<Usuario>) => {
    const updatedData = {
      ...userData,
      id,
      updated_at: new Date().toISOString(),
    };

    // Atualizar no cache local
    await offlineDb.usuarios.update(id, {
      ...updatedData,
      _pendingSync: true,
      _lastSync: Date.now(),
    });

    // Adicionar operação pendente
    await OfflineManager.addPendingOperation('usuarios', 'update', updatedData);

    // Invalidar queries para atualizar UI
    queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });

    return updatedData;
  }, [queryClient]);

  const deleteUserOffline = useCallback(async (id: string) => {
    // Marcar como deletado no cache local
    await offlineDb.usuarios.update(id, {
      _deleted: true,
      _pendingSync: true,
      _lastSync: Date.now(),
    });

    // Adicionar operação pendente
    await OfflineManager.addPendingOperation('usuarios', 'delete', { id });

    // Invalidar queries para atualizar UI
    queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  }, [queryClient]);

  const getUsersOffline = useCallback(async (): Promise<Usuario[]> => {
    return await OfflineManager.getCachedData<Usuario>('usuarios');
  }, []);

  return {
    createUserOffline,
    updateUserOffline,
    deleteUserOffline,
    getUsersOffline,
    isOnline,
  };
};

// Hook para operações offline de obras
export const useOfflineObras = () => {
  const { isOnline } = useOffline();
  const queryClient = useQueryClient();

  const createObraOffline = useCallback(async (obraData: Omit<Obra, 'id' | 'created_at' | 'updated_at'>) => {
    const tempId = `temp_${Date.now()}`;
    const newObra = {
      ...obraData,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Salvar no cache local
    await offlineDb.obras.add({
      ...newObra,
      _pendingSync: true,
      _lastSync: Date.now(),
    });

    // Adicionar operação pendente
    await OfflineManager.addPendingOperation('obras', 'create', newObra);

    // Invalidar queries para atualizar UI
    queryClient.invalidateQueries({ queryKey: queryKeys.obras.all });

    return newObra;
  }, [queryClient]);

  const updateObraOffline = useCallback(async (id: string, obraData: Partial<Obra>) => {
    const updatedData = {
      ...obraData,
      id,
      updated_at: new Date().toISOString(),
    };

    // Atualizar no cache local
    await offlineDb.obras.update(id, {
      ...updatedData,
      _pendingSync: true,
      _lastSync: Date.now(),
    });

    // Adicionar operação pendente
    await OfflineManager.addPendingOperation('obras', 'update', updatedData);

    // Invalidar queries para atualizar UI
    queryClient.invalidateQueries({ queryKey: queryKeys.obras.detail(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.obras.all });

    return updatedData;
  }, [queryClient]);

  const deleteObraOffline = useCallback(async (id: string) => {
    // Marcar como deletado no cache local
    await offlineDb.obras.update(id, {
      _deleted: true,
      _pendingSync: true,
      _lastSync: Date.now(),
    });

    // Adicionar operação pendente
    await OfflineManager.addPendingOperation('obras', 'delete', { id });

    // Invalidar queries para atualizar UI
    queryClient.invalidateQueries({ queryKey: queryKeys.obras.detail(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.obras.all });
  }, [queryClient]);

  const getObrasOffline = useCallback(async (): Promise<Obra[]> => {
    return await OfflineManager.getCachedData<Obra>('obras');
  }, []);

  return {
    createObraOffline,
    updateObraOffline,
    deleteObraOffline,
    getObrasOffline,
    isOnline,
  };
};

// Hook para operações offline de RDOs
export const useOfflineRdos = () => {
  const { isOnline } = useOffline();
  const queryClient = useQueryClient();

  const createRdoOffline = useCallback(async (rdoData: Omit<RDO, 'id' | 'created_at' | 'updated_at'>) => {
    const tempId = `temp_${Date.now()}`;
    const newRdo = {
      ...rdoData,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Salvar no cache local
    await offlineDb.rdos.add({
      ...newRdo,
      _pendingSync: true,
      _lastSync: Date.now(),
    });

    // Adicionar operação pendente
    await OfflineManager.addPendingOperation('rdos', 'create', newRdo);

    // Invalidar queries para atualizar UI
    queryClient.invalidateQueries({ queryKey: queryKeys.rdos.all });
    if (rdoData.obra_id) {
      queryClient.invalidateQueries({ queryKey: queryKeys.rdos.byObra(rdoData.obra_id) });
    }

    return newRdo;
  }, [queryClient]);

  const updateRdoOffline = useCallback(async (id: string, rdoData: Partial<RDO>) => {
    const updatedData = {
      ...rdoData,
      id,
      updated_at: new Date().toISOString(),
    };

    // Atualizar no cache local
    await offlineDb.rdos.update(id, {
      ...updatedData,
      _pendingSync: true,
      _lastSync: Date.now(),
    });

    // Adicionar operação pendente
    await OfflineManager.addPendingOperation('rdos', 'update', updatedData);

    // Invalidar queries para atualizar UI
    queryClient.invalidateQueries({ queryKey: queryKeys.rdos.detail(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.rdos.all });
    if (rdoData.obra_id) {
      queryClient.invalidateQueries({ queryKey: queryKeys.rdos.byObra(rdoData.obra_id) });
    }

    return updatedData;
  }, [queryClient]);

  const deleteRdoOffline = useCallback(async (id: string) => {
    // Marcar como deletado no cache local
    await offlineDb.rdos.update(id, {
      _deleted: true,
      _pendingSync: true,
      _lastSync: Date.now(),
    });

    // Adicionar operação pendente
    await OfflineManager.addPendingOperation('rdos', 'delete', { id });

    // Invalidar queries para atualizar UI
    queryClient.invalidateQueries({ queryKey: queryKeys.rdos.detail(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.rdos.all });
  }, [queryClient]);

  const getRdosOffline = useCallback(async (obraId?: string): Promise<RDO[]> => {
    if (obraId) {
      return await OfflineManager.getCachedData<RDO>('rdos', (rdo: RDO) => rdo.obra_id === obraId);
    }
    return await OfflineManager.getCachedData<RDO>('rdos');
  }, []);

  return {
    createRdoOffline,
    updateRdoOffline,
    deleteRdoOffline,
    getRdosOffline,
    isOnline,
  };
};

// Hook para estatísticas offline
export const useOfflineStats = () => {
  const [stats, setStats] = useState<{
    usuarios: number;
    obras: number;
    rdos: number;
    pendingOperations: number;
    lastSync?: number;
  }>({
    usuarios: 0,
    obras: 0,
    rdos: 0,
    pendingOperations: 0,
  });

  const loadStats = useCallback(async () => {
    const cacheStats = await OfflineManager.getCacheStats();
    setStats(cacheStats);
  }, []);

  useEffect(() => {
    loadStats();

    // Atualizar estatísticas a cada 30 segundos
    const interval = setInterval(loadStats, 30000);

    return () => clearInterval(interval);
  }, [loadStats]);

  return {
    stats,
    loadStats,
  };
};