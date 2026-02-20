import { createQueryClient } from './reactQueryConfig';

// Instância otimizada do QueryClient
export const queryClient = createQueryClient();

// Configurações específicas para diferentes tipos de dados
export const queryKeys = {
  // Usuários
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: () => [...queryKeys.users.all, 'profile'] as const,
  },
  // Obras
  obras: {
    all: ['obras'] as const,
    lists: () => [...queryKeys.obras.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.obras.lists(), { filters }] as const,
    details: () => [...queryKeys.obras.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.obras.details(), id] as const,
    byUser: (userId: string) => [...queryKeys.obras.all, 'byUser', userId] as const,
  },
  // RDOs/Tasks
  rdos: {
    all: ['rdos'] as const,
    lists: () => [...queryKeys.rdos.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.rdos.lists(), { filters }] as const,
    details: () => [...queryKeys.rdos.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.rdos.details(), id] as const,
    byObra: (obraId: string) => [...queryKeys.rdos.all, 'byObra', obraId] as const,
    byUser: (userId: string) => [...queryKeys.rdos.all, 'byUser', userId] as const,
  },
  // Relatórios
  reports: {
    all: ['reports'] as const,
    dashboard: () => [...queryKeys.reports.all, 'dashboard'] as const,
    obra: (obraId: string) => [...queryKeys.reports.all, 'obra', obraId] as const,
    user: (userId: string) => [...queryKeys.reports.all, 'user', userId] as const,
  },
} as const;

// Utilitários para invalidação de cache
export const invalidateQueries = {
  // Invalidar todos os dados de usuários
  users: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  // Invalidar usuário específico
  user: (id: string) => queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) }),
  // Invalidar todas as obras
  obras: () => queryClient.invalidateQueries({ queryKey: queryKeys.obras.all }),
  // Invalidar obra específica
  obra: (id: string) => queryClient.invalidateQueries({ queryKey: queryKeys.obras.detail(id) }),
  // Invalidar todos os RDOs
  rdos: () => queryClient.invalidateQueries({ queryKey: queryKeys.rdos.all }),
  // Invalidar RDO específico
  rdo: (id: string) => queryClient.invalidateQueries({ queryKey: queryKeys.rdos.detail(id) }),
  // Invalidar RDOs de uma obra
  rdosByObra: (obraId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.rdos.byObra(obraId) }),
  // Invalidar relatórios
  reports: () => queryClient.invalidateQueries({ queryKey: queryKeys.reports.all }),
  // Invalidar tudo
  all: () => queryClient.invalidateQueries(),
};

// Utilitários para prefetch
export const prefetchQueries = {
  // Prefetch obras do usuário
  userObras: async (userId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.obras.byUser(userId),
      staleTime: 2 * 60 * 1000, // 2 minutos
    });
  },
  // Prefetch RDOs de uma obra
  obraRdos: async (obraId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.rdos.byObra(obraId),
      staleTime: 1 * 60 * 1000, // 1 minuto
    });
  },
  // Prefetch dashboard
  dashboard: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.reports.dashboard(),
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  },
};

// Configurações específicas por tipo de dados
export const dataTypeConfigs = {
  // Dados estáticos (raramente mudam)
  static: {
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
  },
  // Dados dinâmicos (mudam frequentemente)
  dynamic: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  },
  // Dados críticos (sempre frescos)
  critical: {
    staleTime: 0, // Sempre stale
    gcTime: 5 * 60 * 1000, // 5 minutos
  },
} as const;

// Utilitários para gerenciamento de cache
export const cacheUtils = {
  // Limpar cache específico
  clearCache: (queryKey: string[]) => {
    queryClient.removeQueries({ queryKey });
  },
  
  // Limpar todo o cache
  clearAllCache: () => {
    queryClient.clear();
  },
  
  // Verificar se dados estão em cache
  hasCache: (queryKey: string[]) => {
    return queryClient.getQueryData(queryKey) !== undefined;
  },
  
  // Obter dados do cache
  getCache: <T>(queryKey: string[]): T | undefined => {
    return queryClient.getQueryData<T>(queryKey);
  },
  
  // Definir dados no cache
  setCache: <T>(queryKey: string[], data: T) => {
    queryClient.setQueryData(queryKey, data);
  },
};

// Configuração para desenvolvimento
if (import.meta.env.DEV) {
  // Logs mais detalhados em desenvolvimento
  queryClient.setDefaultOptions({
    queries: {
      ...queryClient.getDefaultOptions().queries,
      // Refetch mais frequente em dev para debugging
      staleTime: 30 * 1000, // 30 segundos
      // Mostrar dados stale em dev
      refetchOnMount: true,
    },
  });
  
  // Log de eventos do cache em desenvolvimento
  queryClient.getQueryCache().subscribe((event) => {
    if (event?.type === 'updated') {
      console.debug('Query Cache Updated:', event.query.queryKey);
    }
  });
}