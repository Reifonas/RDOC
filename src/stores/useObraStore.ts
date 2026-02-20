import { create } from 'zustand';
// import { devtools, persist } from 'zustand/middleware';
import type { Obra } from '../types';
import type { ObraStatusType } from '../types';
import { supabase } from '../lib/supabase';

interface ObraState {
  // Estado
  obras: Obra[];
  currentObra: Obra | null;
  loading: boolean;
  error: string | null;
  filters: {
    status?: ObraStatusType;
    responsavel?: string;
    search?: string;
  };
  
  // Ações
  setObras: (obras: Obra[]) => void;
  setCurrentObra: (obra: Obra | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<{ status?: ObraStatusType; responsavel?: string; search?: string; }>) => void;
  
  // Operações assíncronas
  fetchObras: () => Promise<void>;
  fetchObraById: (obraId: string) => Promise<void>;
  createObra: (obraData: Omit<Obra, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateObra: (obraId: string, updates: Partial<Obra>) => Promise<boolean>;
  deleteObra: (obraId: string) => Promise<boolean>;
  updateObraStatus: (obraId: string, status: ObraStatusType) => Promise<boolean>;
  
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

export const useObraStore = create<ObraState>()((set, get) => ({
        ...initialState,
        
        // Ações síncronas
        setObras: (obras) => set({ obras }),
        
        setCurrentObra: (obra) => set({ currentObra: obra }),
        
        setLoading: (loading) => set({ loading }),
        
        setError: (error) => set({ error }),
        
        setFilters: (newFilters) => set(
          (state) => ({ filters: { ...state.filters, ...newFilters } })
        ),
        
        clearError: () => set({ error: null }),
        
        clearFilters: () => set({ filters: {} }),
        
        reset: () => set(initialState),
        
        // Operações assíncronas
        fetchObras: async () => {
          try {
            set({ loading: true, error: null });
            
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
            });
          } catch (error: any) {
            console.error('Erro ao buscar obras:', error);
            set({ 
              error: error.message || 'Erro ao buscar obras', 
              loading: false 
            });
          }
        },
        
        fetchObraById: async (obraId: string) => {
          try {
            set({ loading: true, error: null });
            
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
            });
          } catch (error: any) {
            console.error('Erro ao buscar obra:', error);
            set({ 
              error: error.message || 'Erro ao buscar obra', 
              loading: false 
            });
          }
        },
        
        createObra: async (obraData) => {
          try {
            set({ loading: true, error: null });
            
            const { data, error } = await (supabase as any)
              .from('obras')
              .insert({
                ...obraData,
                status: 'planejamento' as ObraStatusType
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
            });
            
            return true;
          } catch (error: any) {
            console.error('Erro ao criar obra:', error);
            set({ 
              error: error.message || 'Erro ao criar obra', 
              loading: false 
            });
            return false;
          }
        },
        
        updateObra: async (obraId: string, updates: Partial<Obra>) => {
          try {
            set({ loading: true, error: null });
            
            const { data, error } = await (supabase as any)
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
            });
            
            return true;
          } catch (error: any) {
            console.error('Erro ao atualizar obra:', error);
            set({ 
              error: error.message || 'Erro ao atualizar obra', 
              loading: false 
            });
            return false;
          }
        },
        
        updateObraStatus: async (obraId: string, status: ObraStatusType) => {
          try {
            set({ loading: true, error: null });
            
            const { data, error } = await (supabase as any)
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
            });
            
            return true;
          } catch (error: any) {
            console.error('Erro ao atualizar status da obra:', error);
            set({ 
              error: error.message || 'Erro ao atualizar status da obra', 
              loading: false 
            });
            return false;
          }
        },
        
        deleteObra: async (obraId: string) => {
          try {
            set({ loading: true, error: null });
            
            const { error } = await (supabase as any)
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
            });
            
            return true;
          } catch (error: any) {
            console.error('Erro ao deletar obra:', error);
            set({ 
              error: error.message || 'Erro ao deletar obra', 
              loading: false 
            });
            return false;
          }
        },
  }));

// Seletores para otimização de performance
export const useObrasStore = () => useObraStore((state) => state.obras);
export const useCurrentObraStore = () => useObraStore((state) => state.currentObra);
export const useObraLoadingStore = () => useObraStore((state) => state.loading);
export const useObraErrorStore = () => useObraStore((state) => state.error);
export const useObraFiltersStore = () => useObraStore((state) => state.filters);

// Seletores derivados
export const useObrasByStatusStore = (status: ObraStatusType) => useObraStore((state) =>
  state.obras.filter(obra => obra.status === status)
);

export const useObrasByResponsavelStore = (responsavelId: string) => useObraStore((state) =>
  state.obras.filter(obra => obra.responsavel_id === responsavelId)
);

export const useObraByIdStore = (obraId: string) => useObraStore((state) =>
  state.obras.find(obra => obra.id === obraId)
);

export const useFilteredObrasStore = () => useObraStore((state) => {
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

// Exportar o tipo ObraState
export type { ObraState };