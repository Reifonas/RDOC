import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// Configurações otimizadas para React Query
const queryConfig: DefaultOptions = {
  queries: {
    // Cache por 10 minutos por padrão
    staleTime: 10 * 60 * 1000,
    // Manter cache por 15 minutos após ficar stale
    gcTime: 15 * 60 * 1000,
    // Retry automático com backoff exponencial
    retry: (failureCount, error: any) => {
      // Não retry em erros de autenticação
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      // Retry até 3 vezes para outros erros
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch quando a janela ganha foco
    refetchOnWindowFocus: true,
    // Refetch quando reconecta
    refetchOnReconnect: true,
    // Não refetch automaticamente quando monta
    refetchOnMount: false,
    // Network mode para funcionar offline
    networkMode: 'offlineFirst',
  },
  mutations: {
    // Retry mutations apenas uma vez
    retry: 1,
    retryDelay: 1000,
    // Network mode para mutations
    networkMode: 'online',
  },
};

// Criar cliente React Query otimizado
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: queryConfig,
  });
};

// Configurações específicas por tipo de dados
export const queryConfigs = {
  // Dados que mudam frequentemente
  realtime: {
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 60 * 1000, // Refetch a cada minuto
  },
  
  // Dados que mudam ocasionalmente
  dynamic: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  },
  
  // Dados que raramente mudam
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  },
  
  // Dados críticos que precisam estar sempre atualizados
  critical: {
    staleTime: 0, // Sempre stale
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  },
};

// Utilitários para invalidação otimizada
export const invalidationStrategies = {
  // Invalidação suave - marca como stale mas não refetch imediatamente
  soft: (queryClient: QueryClient, queryKey: any[]) => {
    queryClient.invalidateQueries({ queryKey, refetchType: 'none' });
  },
  
  // Invalidação ativa - refetch imediatamente
  active: (queryClient: QueryClient, queryKey: any[]) => {
    queryClient.invalidateQueries({ queryKey, refetchType: 'active' });
  },
  
  // Invalidação completa - refetch todas as queries relacionadas
  complete: (queryClient: QueryClient, queryKey: any[]) => {
    queryClient.invalidateQueries({ queryKey, refetchType: 'all' });
  },
  
  // Remover do cache completamente
  remove: (queryClient: QueryClient, queryKey: any[]) => {
    queryClient.removeQueries({ queryKey });
  },
};

// Configurações de prefetch otimizadas
export const prefetchStrategies = {
  // Prefetch dados relacionados quando o usuário navega
  onNavigation: async (queryClient: QueryClient, routes: string[]) => {
    const prefetchPromises = routes.map(route => {
      // Lógica específica para cada rota
      switch (route) {
        case '/obras':
          return queryClient.prefetchQuery({
            queryKey: ['obras', 'list'],
            ...queryConfigs.dynamic,
          });
        case '/tarefas':
          return queryClient.prefetchQuery({
            queryKey: ['tasks', 'list'],
            ...queryConfigs.dynamic,
          });
        case '/rdos':
          return queryClient.prefetchQuery({
            queryKey: ['rdos', 'list'],
            ...queryConfigs.dynamic,
          });
        default:
          return Promise.resolve();
      }
    });
    
    await Promise.allSettled(prefetchPromises);
  },
  
  // Prefetch dados críticos no login
  onLogin: async (queryClient: QueryClient, userId: string) => {
    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: ['users', 'profile'],
        ...queryConfigs.critical,
      }),
      queryClient.prefetchQuery({
        queryKey: ['users', 'list'],
        ...queryConfigs.static,
      }),
    ]);
  },
};

// Monitor de performance para React Query
export const setupQueryMonitoring = (queryClient: QueryClient) => {
  if (process.env.NODE_ENV === 'development') {
    // Log estatísticas de cache periodicamente
    setInterval(() => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      console.group('📊 React Query Stats');
      console.log(`Total queries: ${queries.length}`);
      console.log(`Active queries: ${queries.filter(q => q.getObserversCount() > 0).length}`);
      console.log(`Stale queries: ${queries.filter(q => q.isStale()).length}`);
      console.log(`Loading queries: ${queries.filter(q => q.state.fetchStatus === 'fetching').length}`);
      console.groupEnd();
    }, 30000); // A cada 30 segundos
  }
};

// Limpeza automática de cache
export const setupCacheCleanup = (queryClient: QueryClient) => {
  // Limpar cache antigo a cada 5 minutos
  setInterval(() => {
    queryClient.getQueryCache().clear();
  }, 5 * 60 * 1000);
  
  // Limpar mutations antigas
  setInterval(() => {
    queryClient.getMutationCache().clear();
  }, 10 * 60 * 1000);
};

// Configuração de persistência otimizada
export const persistConfig = {
  maxAge: 24 * 60 * 60 * 1000, // 24 horas
  buster: 'v1', // Versão do cache
  serialize: JSON.stringify,
  deserialize: JSON.parse,
};