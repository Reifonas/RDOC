import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Obra, StatusObra } from '../types/database';
import { supabase } from '../lib/supabase';

interface ObraState {
  // Estado
  obras: Obra[];
  currentObra: Obra | null;
  loading: boolean;
  error: string | null;
  filters: {
    status?: StatusObra;
    responsavel?: string;
    search?: string;
  };
  
  // Ações
  setObras: (obras: Obra[]) => void;
  setCurrentObra: (obra: Obra | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ObraState['filters']>) => void;
  
  // Operações assíncronas
  fetchObras: () => Promise<void>;
  fetchObraById: (obraId: string) => Promise<void>;
  createObra: (obraData: Omit<Obra, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateObra: (obraId: string, updates: Partial<Obra>) => Promise<boolean>;
  deleteObra: (obraId: string) => Promise<boolean>;
  updateObraStatus: (obraId: string, status: StatusObra) => Promise<boolean>;
  
  // Utilitários
  clearError: () => void;
  clearFilters: () => void;
  reset: () => void;
}

const initialState = {
  obras: [],
  currentObra: null,
  loading: false,
  error: null,
  filters: {},
};

export const useObraStore = create<ObraState>()()
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Ações síncronas
        setObras: (obras) => set({ obras }, false, 'setObras'),
        
        setCurrentObra: (obra) => set({ currentObra: obra }, false, 'setCurrentObra'),
        
        setLoading: (loading) => set({ loading }, false, 'setLoading'),
        
        setError: (error) => set({ error }, false, 'setError'),
        
        setFilters: (newFilters) => set(
          (state) => ({ filters: { ...state.filters, ...newFilters } }),
          false,
          'setFilters'
        ),
        
        clearError: () => set({ error: null }, false, 'clearError'),
        
        clearFilters: () => set({ filters: {} }, false, 'clearFilters'),
        
        reset: () => set(initialState, false, 'reset'),
        
        // Operações assíncronas
        fetchObras: async () => {
          try {
            set({ loading: true, error: null }, false, 'fetchObras:start');
            
            let query = supabase
              .from('obras')
              .select(`
                *,
                responsavel:usuarios!obras_responsavel_id_fkey(
                  id,
                  nome,
                  email
                )
              `)
              .order('created_at', { ascending: false });
            
            const { filters } = get();
            
            // Aplicar filtros
            if (filters.status) {
              query = query.eq('status', filters.status);
            }
            
            if (filters.responsavel) {
              query = query.eq('responsavel_id', filters.responsavel);
            }
            
            if (filters.search) {
              query = query.or(`nome.ilike.%${filters.search}%,descricao.ilike.%${filters.search}%`);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            set({ 
              obras: data || [], 
              loading: false 
            }, false, 'fetchObras:success');
          } catch (error: any) {
            console.error('Erro ao buscar obras:', error);
            set({ 
              error: error.message || 'Erro ao buscar obras', 
              loading: false 
            }, false, 'fetchObras:error');
          }
        },
        
        fetchObraById: async (obraId: string) => {
          try {
            set({ loading: true, error: null }, false, 'fetchObraById:start');
            
            const { data, error } = await supabase
              .from('obras')
              .select(`
                *,
                responsavel:usuarios!obras_responsavel_id_fkey(
                  id,
                  nome,
                  email
                )
              `)
              .eq('id', obraId)
              .single();
            
            if (error) throw error;
            
            set({ 
              currentObra: data, 
              loading: false 
            }, false, 'fetchObraById:success');
          } catch (error: any) {
            console.error('Erro ao buscar obra:', error);
            set({ 
              error: error.message || 'Erro ao buscar obra', 
              loading: false 
            }, false, 'fetchObraById:error');
          }
        },
        
        createObra: async (obraData) => {
          try {
            set({ loading: true, error: null }, false, 'createObra:start');
            
            const { data, error } = await supabase
              .from('obras')
              .insert({
                ...obraData,
                status: 'planejamento' as StatusObra
              })
              .select(`
                *,
                responsavel:usuarios!obras_responsavel_id_fkey(
                  id,
                  nome,
                  email
                )
              `)
              .single();
            
            if (error) throw error;
            
            // Adicionar ao estado local
            const { obras } = get();
            set({ 
              obras: [data, ...obras],
              loading: false 
            }, false, 'createObra:success');
            
            return true;
          } catch (error: any) {
            console.error('Erro ao criar obra:', error);
            set({ 
              error: error.message || 'Erro ao criar obra', 
              loading: false 
            }, false, 'createObra:error');
            return false;
          }
        },
        
        updateObra: async (obraId: string, updates: Partial<Obra>) => {
          try {
            set({ loading: true, error: null }, false, 'updateObra:start');
            
            const { data, error } = await supabase
              .from('obras')
              .update({
                ...updates,
                updated_at: new Date().toISOString()
              })
              .eq('id', obraId)
              .select(`
                *,
                responsavel:usuarios!obras_responsavel_id_fkey(
                  id,
                  nome,
                  email
                )
              `)
              .single();
            
            if (error) throw error;
            
            // Atualizar estado local
            const { obras, currentObra } = get();
            const updatedObras = obras.map(obra => 
              obra.id === obraId ? data : obra
            );
            
            set({ 
              obras: updatedObras,
              currentObra: currentObra?.id === obraId ? data : currentObra,
              loading: false 
            }, false, 'updateObra:success');
            
            return true;
          } catch (error: any) {
            console.error('Erro ao atualizar obra:', error);
            set({ 
              error: error.message || 'Erro ao atualizar obra', 
              loading: false 
            }, false, 'updateObra:error');
            return false;
          }
        },
        
        updateObraStatus: async (obraId: string, status: StatusObra) => {
          try {
            set({ loading: true, error: null }, false, 'updateObraStatus:start');
            
            const { data, error } = await supabase
              .from('obras')
              .update({ 
                status,
                updated_at: new Date().toISOString()
              })
              .eq('id', obraId)
              .select(`
                *,
                responsavel:usuarios!obras_responsavel_id_fkey(
                  id,
                  nome,
                  email
                )
              `)
              .single();
            
            if (error) throw error;
            
            // Atualizar estado local
            const { obras, currentObra } = get();
            const updatedObras = obras.map(obra => 
              obra.id === obraId ? data : obra
            );
            
            set({ 
              obras: updatedObras,
              currentObra: currentObra?.id === obraId ? data : currentObra,
              loading: false 
            }, false, 'updateObraStatus:success');
            
            return true;
          } catch (error: any) {
            console.error('Erro ao atualizar status da obra:', error);
            set({ 
              error: error.message || 'Erro ao atualizar status da obra', 
              loading: false 
            }, false, 'updateObraStatus:error');
            return false;
          }
        },
        
        deleteObra: async (obraId: string) => {
          try {
            set({ loading: true, error: null }, false, 'deleteObra:start');
            
            const { error } = await supabase
              .from('obras')
              .delete()
              .eq('id', obraId);
            
            if (error) throw error;
            
            // Remover do estado local
            const { obras, currentObra } = get();
            const filteredObras = obras.filter(obra => obra.id !== obraId);
            
            set({ 
              obras: filteredObras,
              currentObra: currentObra?.id === obraId ? null : currentObra,
              loading: false 
            }, false, 'deleteObra:success');
            
            return true;
          } catch (error: any) {
            console.error('Erro ao deletar obra:', error);
            set({ 
              error: error.message || 'Erro ao deletar obra', 
              loading: false 
            }, false, 'deleteObra:error');
            return false;
          }
        },
      }),
      {
        name: 'obra-store',
        partialize: (state) => ({
          obras: state.obras,
          currentObra: state.currentObra,
          filters: state.filters,
        }),
      }
    ),
    {
      name: 'obra-store',
    }
  );

// Seletores para otimização de performance
export const useObras = () => useObraStore((state) => state.obras);
export const useCurrentObra = () => useObraStore((state) => state.currentObra);
export const useObraLoading = () => useObraStore((state) => state.loading);
export const useObraError = () => useObraStore((state) => state.error);
export const useObraFilters = () => useObraStore((state) => state.filters);

// Seletores derivados
export const useObrasByStatus = (status: StatusObra) => useObraStore((state) => 
  state.obras.filter(obra => obra.status === status)
);

export const useObrasByResponsavel = (responsavelId: string) => useObraStore((state) => 
  state.obras.filter(obra => obra.responsavel_id === responsavelId)
);

export const useObraById = (obraId: string) => useObraStore((state) => 
  state.obras.find(obra => obra.id === obraId)
);

export const useFilteredObras = () => useObraStore((state) => {
  let filtered = state.obras;
  
  if (state.filters.status) {
    filtered = filtered.filter(obra => obra.status === state.filters.status);
  }
  
  if (state.filters.responsavel) {
    filtered = filtered.filter(obra => obra.responsavel_id === state.filters.responsavel);
  }
  
  if (state.filters.search) {
    const search = state.filters.search.toLowerCase();
    filtered = filtered.filter(obra => 
      obra.nome.toLowerCase().includes(search) ||
      obra.descricao?.toLowerCase().includes(search)
    );
  }
  
  return filtered;
});