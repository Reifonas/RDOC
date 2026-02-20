import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Usuario } from '../types';
import { supabase, type Tables, type TablesInsert } from '../lib/supabase';

interface UserState {
  // Estado
  currentUser: Usuario | null;
  users: Usuario[];
  loading: boolean;
  error: string | null;
  
  // Ações
  setCurrentUser: (user: Usuario | null) => void;
  setUsers: (users: Usuario[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Operações assíncronas
  fetchCurrentUser: (userId: string) => Promise<void>;
  fetchUsers: () => Promise<void>;
  updateUser: (userId: string, updates: Partial<Tables<'usuarios'>>) => Promise<boolean>;
  createUser: (userData: TablesInsert<'usuarios'>) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  
  // Utilitários
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  currentUser: null,
  users: [],
  loading: false,
  error: null,
};

export const useUserStore = create<UserState>()(  devtools(    persist(      (set, get) => ({
        ...initialState,
        
        // Ações síncronas
        setCurrentUser: (user) => set({ currentUser: user }, false, 'setCurrentUser'),
        
        setUsers: (users) => set({ users }, false, 'setUsers'),
        
        setLoading: (loading) => set({ loading }, false, 'setLoading'),
        
        setError: (error) => set({ error }, false, 'setError'),
        
        clearError: () => set({ error: null }, false, 'clearError'),
        
        reset: () => set(initialState, false, 'reset'),
        
        // Operações assíncronas
        fetchCurrentUser: async (userId: string) => {
          try {
            set({ loading: true, error: null }, false, 'fetchCurrentUser:start');
            
            const { data, error } = await supabase
              .from('usuarios')
              .select('*')
              .eq('id', userId)
              .single();
            
            if (error) throw error;
            
            set({ 
              currentUser: data, 
              loading: false 
            }, false, 'fetchCurrentUser:success');
          } catch (error: any) {
            console.error('Erro ao buscar usuário atual:', error);
            set({ 
              error: error.message || 'Erro ao buscar usuário', 
              loading: false 
            }, false, 'fetchCurrentUser:error');
          }
        },
        
        fetchUsers: async () => {
          try {
            set({ loading: true, error: null }, false, 'fetchUsers:start');
            
            const { data, error } = await supabase
              .from('usuarios')
              .select('*')
              .order('nome');
            
            if (error) throw error;
            
            set({ 
              users: data || [], 
              loading: false 
            }, false, 'fetchUsers:success');
          } catch (error: any) {
            console.error('Erro ao buscar usuários:', error);
            set({ 
              error: error.message || 'Erro ao buscar usuários', 
              loading: false 
            }, false, 'fetchUsers:error');
          }
        },
        
        updateUser: async (userId: string, updates: Partial<Tables<'usuarios'>>) => {
          try {
            set({ loading: true, error: null }, false, 'updateUser:start');
            
            const { data, error } = await (supabase as any)
              .from('usuarios')
              .update({
                ...updates,
                updated_at: new Date().toISOString()
              })
              .eq('id', userId)
              .select()
              .single();
            
            if (error) throw error;
            
            // Atualizar estado local
            const { users, currentUser } = get();
            const updatedUsers = users.map(user => 
              user.id === userId ? data : user
            );
            
            set({ 
              users: updatedUsers,
              currentUser: currentUser?.id === userId ? data : currentUser,
              loading: false 
            }, false, 'updateUser:success');
            
            return true;
          } catch (error: any) {
            console.error('Erro ao atualizar usuário:', error);
            set({ 
              error: error.message || 'Erro ao atualizar usuário', 
              loading: false 
            }, false, 'updateUser:error');
            return false;
          }
        },
        
        createUser: async (userData) => {
          try {
            set({ loading: true, error: null }, false, 'createUser:start');
            
            const { data, error } = await (supabase as any)
              .from('usuarios')
              .insert(userData)
              .select()
              .single();
            
            if (error) throw error;
            
            // Adicionar ao estado local
            const { users } = get();
            set({ 
              users: [...users, data],
              loading: false 
            }, false, 'createUser:success');
            
            return true;
          } catch (error: any) {
            console.error('Erro ao criar usuário:', error);
            set({ 
              error: error.message || 'Erro ao criar usuário', 
              loading: false 
            }, false, 'createUser:error');
            return false;
          }
        },
        
        deleteUser: async (userId: string) => {
          try {
            set({ loading: true, error: null }, false, 'deleteUser:start');
            
            const { error } = await supabase
              .from('usuarios')
              .delete()
              .eq('id', userId);
            
            if (error) throw error;
            
            // Remover do estado local
            const { users, currentUser } = get();
            const filteredUsers = users.filter(user => user.id !== userId);
            
            set({ 
              users: filteredUsers,
              currentUser: currentUser?.id === userId ? null : currentUser,
              loading: false 
            }, false, 'deleteUser:success');
            
            return true;
          } catch (error: any) {
            console.error('Erro ao deletar usuário:', error);
            set({ 
              error: error.message || 'Erro ao deletar usuário', 
              loading: false 
            }, false, 'deleteUser:error');
            return false;
          }
        },
      }),
      {
        name: 'user-store',
        partialize: (state) => ({
          currentUser: state.currentUser,
          users: state.users,
        }),
      }
    )
  )
);

// Seletores para otimização de performance
export const useCurrentUser = () => useUserStore((state) => state.currentUser);
export const useUsers = () => useUserStore((state) => state.users);
export const useUserLoading = () => useUserStore((state) => state.loading);
export const useUserError = () => useUserStore((state) => state.error);

// Seletores derivados
export const useActiveUsers = () => useUserStore((state) => 
  state.users.filter(user => user.ativo)
);

export const useUsersByRole = (role: string) => useUserStore((state) => 
  state.users.filter(user => user.role === role)
);

export const useUserById = (userId: string) => useUserStore((state) => 
  state.users.find(user => user.id === userId)
);

// Exportar o tipo UserState
export type { UserState };