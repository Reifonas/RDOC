import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
// import { queryKeys, invalidateQueries } from '../../lib/queryClient';
import type { RDO, RDOInsert, RDOUpdate } from '../../types/database.types';

// Hook para buscar todos os RDOs
export const useRdos = (filters?: {
  obra_id?: string;
  usuario_id?: string;
  status?: string;
  data_inicio?: string;
  data_fim?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['rdos', 'list', filters || {}],
    queryFn: async (): Promise<RDO[]> => {
      let query = (supabase as any)
        .from('rdos')
        .select(`
          *,
          obra:obras(id, nome, status),
          criador:usuarios!rdos_criado_por_fkey(id, nome, email),
          aprovador:usuarios!rdos_aprovado_por_fkey(id, nome, email)
        `)
        .order('data_relatorio', { ascending: false });

      if (filters?.obra_id) {
        query = query.eq('obra_id', filters.obra_id);
      }

      if (filters?.usuario_id) {
        query = query.eq('criado_por', filters.usuario_id);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.data_inicio) {
        query = query.gte('data_relatorio', filters.data_inicio);
      }

      if (filters?.data_fim) {
        query = query.lte('data_relatorio', filters.data_fim);
      }

      if (filters?.search) {
        query = query.or(`observacoes_gerais.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar RDOs: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para buscar RDO por ID
export const useRdo = (id: string | undefined) => {
  return useQuery({
    queryKey: ['rdos', 'detail', id || ''],
    queryFn: async (): Promise<RDO | null> => {
      if (!id) return null;

      const { data, error } = await (supabase as any)
        .from('rdos')
        .select(`
          *,
          obra:obras(id, nome, status, endereco),
          criador:usuarios!rdos_criado_por_fkey(id, nome, email, telefone),
          aprovador:usuarios!rdos_aprovado_por_fkey(id, nome, email),
          atividades:rdo_atividades(
            id,
            tipo_atividade,
            descricao,
            percentual_concluido,
            ordem
          ),
          mao_obra:rdo_mao_obra(
            id,
            funcao,
            quantidade,
            horas_trabalhadas,
            observacoes
          ),
          equipamentos:rdo_equipamentos(
            id,
            nome_equipamento,
            tipo,
            horas_utilizadas,
            combustivel_gasto,
            observacoes
          ),
          ocorrencias:rdo_ocorrencias(
            id,
            tipo_ocorrencia,
            descricao,
            gravidade,
            acao_tomada
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // RDO não encontrado
        }
        throw new Error(`Erro ao buscar RDO: ${error.message}`);
      }

      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar RDOs de uma obra
export const useObraRdos = (obraId: string | undefined) => {
  return useQuery({
    queryKey: ['rdos', 'byObra', obraId || ''],
    queryFn: async (): Promise<RDO[]> => {
      if (!obraId) return [];

      const { data, error } = await (supabase as any)
        .from('rdos')
        .select(`
          *,
          criador:usuarios!rdos_criado_por_fkey(id, nome, email),
          aprovador:usuarios!rdos_aprovado_por_fkey(id, nome, email)
        `)
        .eq('obra_id', obraId)
        .order('data_relatorio', { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar RDOs da obra: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!obraId,
    staleTime: 3 * 60 * 1000, // 3 minutos
  });
};

// Hook para buscar RDOs do usuário
export const useUserRdos = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['rdos', 'byUser', userId || ''],
    queryFn: async (): Promise<RDO[]> => {
      if (!userId) return [];

      const { data, error } = await (supabase as any)
        .from('rdos')
        .select(`
          *,
          obra:obras(id, nome, status),
          aprovador:usuarios!rdos_aprovado_por_fkey(id, nome, email)
        `)
        .eq('criado_por', userId)
        .order('data_relatorio', { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar RDOs do usuário: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!userId,
    staleTime: 3 * 60 * 1000, // 3 minutos
  });
};

// Hook para criar RDO
export const useCreateRdo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rdoData: RDOInsert): Promise<RDO> => {
      const { data, error } = await (supabase as any)
        .from('rdos')
        .insert(rdoData)
        .select(`
          *,
          obra:obras(id, nome, status),
          criador:usuarios!rdos_criado_por_fkey(id, nome, email)
        `)
        .single();

      if (error) {
        throw new Error(`Erro ao criar RDO: ${error.message}`);
      }

      return data;
    },
    onSuccess: (newRdo) => {
      // Invalidar cache de RDOs
      queryClient.invalidateQueries({ queryKey: ['rdos'] });
      
      // Adicionar o novo RDO ao cache
      queryClient.setQueryData(
        ['rdos', 'detail', newRdo.id],
        newRdo
      );

      // Invalidar RDOs da obra
      if (newRdo.obra_id) {
        queryClient.invalidateQueries({ queryKey: ['rdos', 'byObra', newRdo.obra_id] });
      }

      // Invalidar RDOs do usuário
      if (newRdo.criado_por) {
        queryClient.invalidateQueries({
          queryKey: ['rdos', 'byUser', newRdo.criado_por]
        });
      }
    },
    onError: (error) => {
      console.error('Erro ao criar RDO:', error);
    },
  });
};

// Hook para atualizar RDO
export const useUpdateRdo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: RDOUpdate }): Promise<RDO> => {
      const { data, error } = await (supabase as any)
        .from('rdos')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          obra:obras(id, nome, status),
          criador:usuarios!rdos_criado_por_fkey(id, nome, email),
          aprovador:usuarios!rdos_aprovado_por_fkey(id, nome, email)
        `)
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar RDO: ${error.message}`);
      }

      return data;
    },
    onSuccess: (updatedRdo) => {
      // Invalidar cache de RDOs
      queryClient.invalidateQueries({ queryKey: ['rdos'] });
      
      // Atualizar o RDO específico no cache
      queryClient.setQueryData(
        ['rdos', 'detail', updatedRdo.id],
        updatedRdo
      );

      // Invalidar RDOs da obra
      if (updatedRdo.obra_id) {
        queryClient.invalidateQueries({ queryKey: ['rdos', 'byObra', updatedRdo.obra_id] });
      }

      // Invalidar RDOs do usuário
      if (updatedRdo.criado_por) {
        queryClient.invalidateQueries({
          queryKey: ['rdos', 'byUser', updatedRdo.criado_por]
        });
      }
    },
    onError: (error) => {
      console.error('Erro ao atualizar RDO:', error);
    },
  });
};

// Hook para aprovar/rejeitar RDO
export const useApproveRdo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      aprovadoPor, 
      observacoesAprovacao 
    }: { 
      id: string; 
      status: 'aprovado' | 'rejeitado'; 
      aprovadoPor: string;
      observacoesAprovacao?: string;
    }): Promise<RDO> => {
      const updates = {
        status,
        aprovado_por: aprovadoPor,
        aprovado_em: new Date().toISOString(),
      };

      const { data, error } = await (supabase as any)
        .from('rdos')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          obra:obras(id, nome, status),
          criador:usuarios!rdos_criado_por_fkey(id, nome, email),
          aprovador:usuarios!rdos_aprovado_por_fkey(id, nome, email)
        `)
        .single();

      if (error) {
        throw new Error(`Erro ao ${status === 'aprovado' ? 'aprovar' : 'rejeitar'} RDO: ${error.message}`);
      }

      return data;
    },
    onSuccess: (updatedRdo) => {
      // Invalidar cache de RDOs
      queryClient.invalidateQueries({ queryKey: ['rdos'] });
      
      // Atualizar o RDO específico no cache
      queryClient.setQueryData(
        ['rdos', 'detail', updatedRdo.id],
        updatedRdo
      );

      // Invalidar RDOs da obra
      if (updatedRdo.obra_id) {
        queryClient.invalidateQueries({ queryKey: ['rdos', 'byObra', updatedRdo.obra_id] });
      }

      // Invalidar RDOs do usuário
      if (updatedRdo.criado_por) {
        queryClient.invalidateQueries({
          queryKey: ['rdos', 'byUser', updatedRdo.criado_por]
        });
      }
    },
    onError: (error) => {
      console.error('Erro ao aprovar/rejeitar RDO:', error);
    },
  });
};

// Hook para deletar RDO
export const useDeleteRdo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('rdos')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao deletar RDO: ${error.message}`);
      }
    },
    onSuccess: (_, deletedId) => {
      // Invalidar cache de RDOs
      queryClient.invalidateQueries({ queryKey: ['rdos'] });
      
      // Remover o RDO específico do cache
      queryClient.removeQueries({
        queryKey: ['rdos', 'detail', deletedId]
      });
    },
    onError: (error) => {
      console.error('Erro ao deletar RDO:', error);
    },
  });
};

// Hook para estatísticas de RDOs
export const useRdosStats = (filters?: {
  obra_id?: string;
  usuario_id?: string;
  data_inicio?: string;
  data_fim?: string;
}) => {
  return useQuery({
    queryKey: ['rdos', 'all', 'stats', filters || {}],
    queryFn: async () => {
      let query = supabase
        .from('rdos')
        .select('status, data_relatorio');

      if (filters?.obra_id) {
        query = query.eq('obra_id', filters.obra_id);
      }

      if (filters?.usuario_id) {
        query = query.eq('criado_por', filters.usuario_id);
      }

      if (filters?.data_inicio) {
        query = query.gte('data_relatorio', filters.data_inicio);
      }

      if (filters?.data_fim) {
        query = query.lte('data_relatorio', filters.data_fim);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
      }

      const stats = {
        total: data?.length || 0,
        pendentes: data?.filter((r: any) => r.status === 'pendente').length || 0,
        aprovados: data?.filter((r: any) => r.status === 'aprovado').length || 0,
        rejeitados: data?.filter((r: any) => r.status === 'rejeitado').length || 0,
        por_mes: {} as Record<string, number>,
      };

      // Agrupar por mês
      data?.forEach((rdo: any) => {
        const mes = new Date(rdo.data_relatorio).toISOString().substring(0, 7); // YYYY-MM
        stats.por_mes[mes] = (stats.por_mes[mes] || 0) + 1;
      });

      return stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}