import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { queryKeys, invalidateQueries } from '../../lib/queryClient';
import type { Obra, ObraInsert, ObraUpdate } from '../../types/database';

// Hook para buscar todas as obras
export const useObras = (filters?: {
  status?: string;
  responsavel_id?: string;
  ativo?: boolean;
  search?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.obras.list(filters || {}),
    queryFn: async (): Promise<Obra[]> => {
      let query = supabase
        .from('obras')
        .select(`
          *,
          responsavel:usuarios!obras_responsavel_id_fkey(id, nome, email),
          cliente:clientes(id, nome, email)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.responsavel_id) {
        query = query.eq('responsavel_id', filters.responsavel_id);
      }

      if (filters?.ativo !== undefined) {
        query = query.eq('ativo', filters.ativo);
      }

      if (filters?.search) {
        query = query.or(`nome.ilike.%${filters.search}%,descricao.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar obras: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 3 * 60 * 1000, // 3 minutos
  });
};

// Hook para buscar obra por ID
export const useObra = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.obras.detail(id || ''),
    queryFn: async (): Promise<Obra | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('obras')
        .select(`
          *,
          responsavel:usuarios!obras_responsavel_id_fkey(id, nome, email, telefone),
          cliente:clientes(id, nome, email, telefone, endereco),
          rdos:rdos(id, data, status, created_at)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Obra não encontrada
        }
        throw new Error(`Erro ao buscar obra: ${error.message}`);
      }

      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar obras do usuário
export const useUserObras = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.obras.byUser(userId || ''),
    queryFn: async (): Promise<Obra[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('obras')
        .select(`
          *,
          responsavel:usuarios!obras_responsavel_id_fkey(id, nome, email),
          cliente:clientes(id, nome, email)
        `)
        .eq('responsavel_id', userId)
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar obras do usuário: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para criar obra
export const useCreateObra = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (obraData: ObraInsert): Promise<Obra> => {
      const { data, error } = await supabase
        .from('obras')
        .insert(obraData)
        .select(`
          *,
          responsavel:usuarios!obras_responsavel_id_fkey(id, nome, email),
          cliente:clientes(id, nome, email)
        `)
        .single();

      if (error) {
        throw new Error(`Erro ao criar obra: ${error.message}`);
      }

      return data;
    },
    onSuccess: (newObra) => {
      // Invalidar cache de obras
      invalidateQueries.obras();
      
      // Adicionar a nova obra ao cache
      queryClient.setQueryData(
        queryKeys.obras.detail(newObra.id),
        newObra
      );

      // Invalidar obras do responsável
      if (newObra.responsavel_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.obras.byUser(newObra.responsavel_id)
        });
      }
    },
    onError: (error) => {
      console.error('Erro ao criar obra:', error);
    },
  });
};

// Hook para atualizar obra
export const useUpdateObra = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ObraUpdate }): Promise<Obra> => {
      const { data, error } = await supabase
        .from('obras')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          responsavel:usuarios!obras_responsavel_id_fkey(id, nome, email),
          cliente:clientes(id, nome, email)
        `)
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar obra: ${error.message}`);
      }

      return data;
    },
    onSuccess: (updatedObra) => {
      // Invalidar cache de obras
      invalidateQueries.obras();
      
      // Atualizar a obra específica no cache
      queryClient.setQueryData(
        queryKeys.obras.detail(updatedObra.id),
        updatedObra
      );

      // Invalidar obras do responsável
      if (updatedObra.responsavel_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.obras.byUser(updatedObra.responsavel_id)
        });
      }
    },
    onError: (error) => {
      console.error('Erro ao atualizar obra:', error);
    },
  });
};

// Hook para deletar obra (soft delete)
export const useDeleteObra = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('obras')
        .update({ ativo: false, deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao deletar obra: ${error.message}`);
      }
    },
    onSuccess: (_, deletedId) => {
      // Invalidar cache de obras
      invalidateQueries.obras();
      
      // Remover a obra específica do cache
      queryClient.removeQueries({
        queryKey: queryKeys.obras.detail(deletedId)
      });

      // Invalidar RDOs da obra
      invalidateQueries.rdosByObra(deletedId);
    },
    onError: (error) => {
      console.error('Erro ao deletar obra:', error);
    },
  });
};

// Hook para alterar status da obra
export const useUpdateObraStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }): Promise<Obra> => {
      const updates: ObraUpdate = { status };
      
      // Se estiver finalizando, adicionar data de conclusão
      if (status === 'concluida') {
        updates.data_conclusao = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('obras')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          responsavel:usuarios!obras_responsavel_id_fkey(id, nome, email),
          cliente:clientes(id, nome, email)
        `)
        .single();

      if (error) {
        throw new Error(`Erro ao alterar status da obra: ${error.message}`);
      }

      return data;
    },
    onSuccess: (updatedObra) => {
      // Invalidar cache de obras
      invalidateQueries.obras();
      
      // Atualizar a obra específica no cache
      queryClient.setQueryData(
        queryKeys.obras.detail(updatedObra.id),
        updatedObra
      );

      // Invalidar obras do responsável
      if (updatedObra.responsavel_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.obras.byUser(updatedObra.responsavel_id)
        });
      }
    },
    onError: (error) => {
      console.error('Erro ao alterar status da obra:', error);
    },
  });
};

// Hook para estatísticas da obra
export const useObraStats = (id: string | undefined) => {
  return useQuery({
    queryKey: [...queryKeys.obras.detail(id || ''), 'stats'],
    queryFn: async () => {
      if (!id) return null;

      // Buscar estatísticas dos RDOs da obra
      const { data: rdosStats, error: rdosError } = await supabase
        .from('rdos')
        .select('status')
        .eq('obra_id', id);

      if (rdosError) {
        throw new Error(`Erro ao buscar estatísticas: ${rdosError.message}`);
      }

      const stats = {
        total_rdos: rdosStats?.length || 0,
        rdos_pendentes: rdosStats?.filter(r => r.status === 'pendente').length || 0,
        rdos_aprovados: rdosStats?.filter(r => r.status === 'aprovado').length || 0,
        rdos_rejeitados: rdosStats?.filter(r => r.status === 'rejeitado').length || 0,
      };

      return stats;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};