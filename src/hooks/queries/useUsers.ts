import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { queryKeys, invalidateQueries } from '../../lib/queryClient';
import type { User, UserInsert, UserUpdate } from '../../types/database';

// Hook para buscar todos os usuários
export const useUsers = (filters?: {
  role?: string;
  ativo?: boolean;
  search?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.users.list(filters || {}),
    queryFn: async (): Promise<User[]> => {
      let query = supabase
        .from('usuarios')
        .select('*')
        .order('nome');

      if (filters?.role) {
        query = query.eq('role', filters.role);
      }

      if (filters?.ativo !== undefined) {
        query = query.eq('ativo', filters.ativo);
      }

      if (filters?.search) {
        query = query.or(`nome.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar usuários: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar usuário por ID
export const useUser = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id || ''),
    queryFn: async (): Promise<User | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Usuário não encontrado
        }
        throw new Error(`Erro ao buscar usuário: ${error.message}`);
      }

      return data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para buscar perfil do usuário atual
export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.users.profile(),
    queryFn: async (): Promise<User | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Perfil não encontrado
        }
        throw new Error(`Erro ao buscar perfil: ${error.message}`);
      }

      return data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
};

// Hook para criar usuário
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: UserInsert): Promise<User> => {
      const { data, error } = await supabase
        .from('usuarios')
        .insert(userData)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar usuário: ${error.message}`);
      }

      return data;
    },
    onSuccess: (newUser) => {
      // Invalidar cache de usuários
      invalidateQueries.users();
      
      // Adicionar o novo usuário ao cache
      queryClient.setQueryData(
        queryKeys.users.detail(newUser.id),
        newUser
      );
    },
    onError: (error) => {
      console.error('Erro ao criar usuário:', error);
    },
  });
};

// Hook para atualizar usuário
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UserUpdate }): Promise<User> => {
      const { data, error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar usuário: ${error.message}`);
      }

      return data;
    },
    onSuccess: (updatedUser) => {
      // Invalidar cache de usuários
      invalidateQueries.users();
      
      // Atualizar o usuário específico no cache
      queryClient.setQueryData(
        queryKeys.users.detail(updatedUser.id),
        updatedUser
      );

      // Se for o perfil atual, atualizar também
      const currentProfile = queryClient.getQueryData(queryKeys.users.profile());
      if (currentProfile && (currentProfile as User).id === updatedUser.id) {
        queryClient.setQueryData(queryKeys.users.profile(), updatedUser);
      }
    },
    onError: (error) => {
      console.error('Erro ao atualizar usuário:', error);
    },
  });
};

// Hook para deletar usuário (soft delete)
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('usuarios')
        .update({ ativo: false, deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao deletar usuário: ${error.message}`);
      }
    },
    onSuccess: (_, deletedId) => {
      // Invalidar cache de usuários
      invalidateQueries.users();
      
      // Remover o usuário específico do cache
      queryClient.removeQueries({
        queryKey: queryKeys.users.detail(deletedId)
      });
    },
    onError: (error) => {
      console.error('Erro ao deletar usuário:', error);
    },
  });
};

// Hook para reativar usuário
export const useReactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<User> => {
      const { data, error } = await supabase
        .from('usuarios')
        .update({ ativo: true, deleted_at: null })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao reativar usuário: ${error.message}`);
      }

      return data;
    },
    onSuccess: (reactivatedUser) => {
      // Invalidar cache de usuários
      invalidateQueries.users();
      
      // Atualizar o usuário no cache
      queryClient.setQueryData(
        queryKeys.users.detail(reactivatedUser.id),
        reactivatedUser
      );
    },
    onError: (error) => {
      console.error('Erro ao reativar usuário:', error);
    },