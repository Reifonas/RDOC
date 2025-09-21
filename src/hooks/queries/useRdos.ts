import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { queryKeys, invalidateQueries } from '../../lib/queryClient';
import type { Rdo, RdoInsert, RdoUpdate } from '../../types/database';

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
    queryKey: queryKeys.rdos.list(filters || {}),
    queryFn: async (): Promise<Rdo[]> => {
      let query = supabase
        .from('rdos')
        .select(`
          *,
          obra:obras(id, nome, status),
          usuario:usuarios(id, nome, email),
          aprovador:usuarios!rdos_aprovado_por_fkey(id, nome, email)
        `)
        .order('data', { ascending: false });

      if (filters?.obra_id) {
        query = query.eq('obra_id', filters.obra_id);
      }

      if (filters?.usuario_id) {
        query = query.eq('usuario_id', filters.usuario_id);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.data_inicio) {
        query = query.gte('data', filters.data_inicio);
      }

      if (filters?.data_fim) {
        query = query.lte('data', filters.data_fim);
      }

      if (filters?.search) {
        query = query.or(`descricao.ilike.%${filters.search}%,observacoes.ilike.%${filters.search}%`);
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
    queryKey: queryKeys.rdos.detail(id || ''),
    queryFn: async (): Promise<Rdo | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('rdos')
        .select(`
          *,
          obra:obras(id, nome, status, endereco),
          usuario:usuarios(id, nome, email, telefone),
          aprovador:usuarios!rdos_aprovado_por_fkey(id, nome, email),
          atividades:rdo_atividades(
            id,
            descricao,
            quantidade,
            unidade,
            observacoes
          ),
          materiais:rdo_materiais(
            id,
            material,
            quantidade,
            unidade,
            observacoes
          ),
          equipamentos:rdo_equipamentos(
            id,
            equipamento,
            horas_uso,
            observacoes
          ),
          funcionarios:rdo_funcionarios(
            id,
            nome,
            funcao,
            horas_trabalhadas,
            observacoes
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
    queryKey: queryKeys.rdos.byObra(obraId || ''),
    queryFn: async (): Promise<Rdo[]> => {
      if (!obraId) return [];

      const { data, error } = await supabase
        .from('rdos')
        .select(`
          *,
          usuario:usuarios(id, nome, email),
          aprovador:usuarios!rdos_aprovado_por_fkey(id, nome, email)
        `)
        .eq('obra_id', obraId)
        .order('data', { ascending: false });

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
    queryKey: queryKeys.rdos.byUser(userId || ''),
    queryFn: async (): Promise<Rdo[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('rdos')
        .select(`
          *,
          obra:obras(id, nome, status),
          aprovador:usuarios!rdos_aprovado_por_fkey(id, nome, email)
        `)
        .eq('usuario_id', userId)
        .order('data', { ascending: false });

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
    mutationFn: async (rdoData: RdoInsert): Promise<Rdo> => {
      const { data, error } = await supabase
        .from('rdos')
        .insert(rdoData)
        .select(`
          *,
          obra:obras(id, nome, status),
          usuario:usuarios(id, nome, email)
        `)
        .single();

      if (error) {
        throw new Error(`Erro ao criar RDO: ${error.message}`);
      }

      return data;
    },
    onSuccess: (newRdo) => {
      // Invalidar cache de RDOs
      invalidateQueries.rdos();
      
      // Adicionar o novo RDO ao cache
      queryClient.setQueryData(
        queryKeys.rdos.detail(newRdo.id),
        newRdo
      );

      // Invalidar RDOs da obra
      if (newRdo.obra_id) {
        invalidateQueries.rdosByObra(newRdo.obra_id);
      }

      // Invalidar RDOs do usuário
      if (newRdo.usuario_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.rdos.byUser(newRdo.usuario_id)
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
    mutationFn: async ({ id, updates }: { id: string; updates: RdoUpdate }): Promise<Rdo> => {
      const { data, error } = await supabase
        .from('rdos')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          obra:obras(id, nome, status),
          usuario:usuarios(id, nome, email),
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
      invalidateQueries.rdos();
      
      // Atualizar o RDO específico no cache
      queryClient.setQueryData(
        queryKeys.rdos.detail(updatedRdo.id),
        updatedRdo
      );

      // Invalidar RDOs da obra
      if (updatedRdo.obra_id) {
        invalidateQueries.rdosByObra(updatedRdo.obra_id);
      }

      // Invalidar RDOs do usuário
      if (updatedRdo.usuario_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.rdos.byUser(updatedRdo.usuario_id)
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
    }): Promise<Rdo> => {
      const updates: RdoUpdate = {
        status,
        aprovado_por: aprovadoPor,
        data_aprovacao: new Date().toISOString(),
        observacoes_aprovacao: observacoesAprovacao,
      };

      const { data, error } = await supabase
        .from('rdos')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          obra:obras(id, nome, status),
          usuario:usuarios(id, nome, email),
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
      invalidateQueries.rdos();
      
      // Atualizar o RDO específico no cache
      queryClient.setQueryData(
        queryKeys.rdos.detail(updatedRdo.id),
        updatedRdo
      );

      // Invalidar RDOs da obra
      if (updatedRdo.obra_id) {
        invalidateQueries.rdosByObra(updatedRdo.obra_id);
      }

      // Invalidar RDOs do usuário
      if (updatedRdo.usuario_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.rdos.byUser(updatedRdo.usuario_id)
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
      invalidateQueries.rdos();
      
      // Remover o RDO específico do cache
      queryClient.removeQueries({
        queryKey: queryKeys.rdos.detail(deletedId)
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
    queryKey: [...queryKeys.rdos.all, 'stats', filters || {}],
    queryFn: async () => {
      let query = supabase
        .from('rdos')
        .select('status, data');

      if (filters?.obra_id) {
        query = query.eq('obra_id', filters.obra_id);
      }

      if (filters?.usuario_id) {
        query = query.eq('usuario_id', filters.usuario_id);
      }

      if (filters?.data_inicio) {
        query = query.gte('data', filters.data_inicio);
      }

      if (filters?.data_fim) {
        query = query.lte('data', filters.data_fim);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
      }

      const stats = {
        total: data?.length || 0,
        pendentes: data?.filter(r => r.status === 'pendente').length || 0,
        aprovados: data?.filter(r => r.status === 'aprovado').length || 0,
        rejeitados: data?.filter(r => r.status === 'rejeitado').length || 0,
        por_mes: {} as Record<string, number>,
      };

      // Agrupar por mês
      data?.forEach(rdo => {
        const mes = new Date(rdo.data).toISOString().substring(0, 7); // YYYY-MM
        stats.por_mes[mes] = (stats.por_mes[mes] || 0) + 1;
      });

      return stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}