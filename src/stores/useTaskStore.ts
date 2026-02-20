import { create } from 'zustand'
// import { persist, subscribeWithSelector } from 'zustand/middleware' // Comentado temporariamente
import { supabase } from '../lib/supabase'
import type { Tarefa } from '../types/database.types'

export interface TaskState {
  // Estado
  tasks: Tarefa[];
  currentTask: Tarefa | null;
  loading: boolean;
  error: string | null;
  filters: {
    status?: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
    prioridade?: 'baixa' | 'media' | 'alta' | 'urgente';
    responsavel?: string;
    obra?: string;
    search?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  
  // Ações
  setTasks: (tasks: Tarefa[]) => void;
  setCurrentTask: (task: Tarefa | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<{
    status?: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada'
    prioridade?: 'baixa' | 'media' | 'alta' | 'urgente'
    responsavel?: string
    obra?: string
    search?: string
    dateRange?: {
      start: string
      end: string
    }
  }>) => void;
  
  // Operações assíncronas
  fetchTasks: () => Promise<void>;
  fetchTaskById: (taskId: string) => Promise<void>;
  fetchTasksByObra: (obraId: string) => Promise<void>;
  createTask: (taskData: Omit<Tarefa, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateTask: (taskId: string, updates: Partial<Tarefa>) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  updateTaskStatus: (taskId: string, status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada') => Promise<boolean>;
  assignTask: (taskId: string, responsavelId: string) => Promise<boolean>;
  
  // Utilitários
  clearError: () => void;
  clearFilters: () => void;
  reset: () => void;
}

const initialState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  filters: {},
};

export const useTaskStore = create<TaskState>((
  set, get) => ({
    ...initialState,
    
    // Ações síncronas
    setTasks: (tasks) => set({ tasks }),
    
    setCurrentTask: (task) => set({ currentTask: task }),
    
    setLoading: (loading) => set({ loading }),
    
    setError: (error) => set({ error }),
    
    setFilters: (newFilters) => set(
      (state) => ({ filters: { ...state.filters, ...newFilters } })
    ),
    
    clearError: () => set({ error: null }),
    
    clearFilters: () => set({ filters: {} }),
    
    reset: () => set(initialState),
    
    // Operações assíncronas
    fetchTasks: async () => {
      try {
        set({ loading: true, error: null });
        
        let query = supabase
          .from('tarefas')
          .select(`
            *,
            responsavel:usuarios!tarefas_responsavel_id_fkey(
              id,
              nome,
              email
            ),
            obra:obras!tarefas_obra_id_fkey(
              id,
              nome,
              status
            )
          `)
          .order('created_at', { ascending: false });
        
        const { filters } = get();
        
        // Aplicar filtros
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters.prioridade) {
          query = query.eq('prioridade', filters.prioridade);
        }
        
        if (filters.responsavel) {
          query = query.eq('responsavel_id', filters.responsavel);
        }
        
        if (filters.obra) {
          query = query.eq('obra_id', filters.obra);
        }
        
        if (filters.search) {
          query = query.or(`titulo.ilike.%${filters.search}%,descricao.ilike.%${filters.search}%`);
        }
        
        if (filters.dateRange) {
          query = query
            .gte('data_inicio', filters.dateRange.start)
            .lte('data_fim', filters.dateRange.end);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        set({ 
          tasks: data || [], 
          loading: false 
        });
      } catch (error: any) {
        console.error('Erro ao buscar tarefas:', error);
        set({ 
          error: error.message || 'Erro ao buscar tarefas', 
          loading: false 
        });
      }
    },
    
    fetchTaskById: async (taskId: string) => {
      try {
        set({ loading: true, error: null });
        
        const { data, error } = await supabase
          .from('tarefas')
          .select(`
            *,
            responsavel:usuarios!tarefas_responsavel_id_fkey(
              id,
              nome,
              email
            ),
            obra:obras!tarefas_obra_id_fkey(
              id,
              nome,
              status
            )
          `)
          .eq('id', taskId)
          .single();
        
        if (error) throw error;
        
        set({ 
          currentTask: data, 
          loading: false 
        });
      } catch (error: any) {
        console.error('Erro ao buscar tarefa:', error);
        set({ 
          error: error.message || 'Erro ao buscar tarefa', 
          loading: false 
        });
      }
    },
    
    fetchTasksByObra: async (obraId: string) => {
      try {
        set({ loading: true, error: null });

            
            let query = supabase
              .from('tarefas')
              .select(`
                *,
                responsavel:usuarios!tarefas_responsavel_id_fkey(
                  id,
                  nome,
                  email
                ),
                obra:obras!tarefas_obra_id_fkey(
                  id,
                  nome,
                  status
                )
              `)
              .order('created_at', { ascending: false });
            
            const { filters } = get();
            
            // Aplicar filtros
            if (filters.status) {
              query = query.eq('status', filters.status);
            }
            
            if (filters.prioridade) {
              query = query.eq('prioridade', filters.prioridade);
            }
            
            if (filters.responsavel) {
              query = query.eq('responsavel_id', filters.responsavel);
            }
            
            if (filters.obra) {
              query = query.eq('obra_id', filters.obra);
            }
            
            if (filters.search) {
              query = query.or(`titulo.ilike.%${filters.search}%,descricao.ilike.%${filters.search}%`);
            }
            
            if (filters.dateRange) {
              query = query
                .gte('data_inicio', filters.dateRange.start)
                .lte('data_fim', filters.dateRange.end);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            set({ 
              tasks: data || [], 
              loading: false 
            });
          } catch (error: any) {
            console.error('Erro ao buscar tarefas:', error);
            set({ 
              error: error.message || 'Erro ao buscar tarefas', 
              loading: false 
            });
          }
        },
        
        
        createTask: async (taskData) => {
          try {
            set({ loading: true, error: null });
            
            const { data, error } = await (supabase as any)
              .from('tarefas')
              .insert({
                ...taskData,
                status: 'pendente'
              })
              .select(`
                *,
                responsavel:usuarios!tarefas_responsavel_id_fkey(
                  id,
                  nome,
                  email
                ),
                obra:obras!tarefas_obra_id_fkey(
                  id,
                  nome,
                  status
                )
              `)
              .single();
            
            if (error) throw error;
            
            // Adicionar ao estado local
            const { tasks } = get();
            set({ 
              tasks: [data, ...tasks],
              loading: false 
            });
            
            return true;
          } catch (error: any) {
            console.error('Erro ao criar tarefa:', error);
            set({ 
              error: error.message || 'Erro ao criar tarefa', 
              loading: false 
            });
            return false;
          }
        },
        
        updateTask: async (taskId: string, updates: Partial<Tarefa>) => {
          try {
            set({ loading: true, error: null });
            
            const { data, error } = await (supabase as any)
              .from('tarefas')
              .update({
                ...updates,
                updated_at: new Date().toISOString()
              })
              .eq('id', taskId)
              .select(`
                *,
                responsavel:usuarios!tarefas_responsavel_id_fkey(
                  id,
                  nome,
                  email
                ),
                obra:obras!tarefas_obra_id_fkey(
                  id,
                  nome,
                  status
                )
              `)
              .single();
            
            if (error) throw error;
            
            // Atualizar estado local
            const { tasks, currentTask } = get();
            const updatedTasks = tasks.map(task => 
              task.id === taskId ? data : task
            );
            
            set({ 
              tasks: updatedTasks,
              currentTask: currentTask?.id === taskId ? data : currentTask,
              loading: false 
            });
            
            return true;
          } catch (error: any) {
            console.error('Erro ao atualizar tarefa:', error);
            set({ 
              error: error.message || 'Erro ao atualizar tarefa', 
              loading: false 
            });
            return false;
          }
        },
        
        updateTaskStatus: async (taskId: string, status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada') => {
          try {
            set({ loading: true, error: null });
            
            const updates: any = { 
              status,
              updated_at: new Date().toISOString()
            };
            
            // Adicionar timestamps baseados no status
            if (status === 'em_andamento') {
              updates.data_inicio_real = new Date().toISOString();
            } else if (status === 'concluida') {
              updates.data_fim_real = new Date().toISOString();
            }
            
            const { data, error } = await (supabase as any)
              .from('tarefas')
              .update(updates)
              .eq('id', taskId)
              .select(`
                *,
                responsavel:usuarios!tarefas_responsavel_id_fkey(
                  id,
                  nome,
                  email
                ),
                obra:obras!tarefas_obra_id_fkey(
                  id,
                  nome,
                  status
                )
              `)
              .single();
            
            if (error) throw error;
            
            // Atualizar estado local
            const { tasks, currentTask } = get();
            const updatedTasks = tasks.map(task => 
              task.id === taskId ? data : task
            );
            
            set({ 
              tasks: updatedTasks,
              currentTask: currentTask?.id === taskId ? data : currentTask,
              loading: false 
            });
            
            return true;
          } catch (error: any) {
            console.error('Erro ao atualizar status da tarefa:', error);
            set({ 
              error: error.message || 'Erro ao atualizar status da tarefa', 
              loading: false 
            });
            return false;
          }
        },
        
        assignTask: async (taskId: string, responsavelId: string) => {
          try {
            set({ loading: true, error: null });
            
            const { data, error } = await (supabase as any)
              .from('tarefas')
              .update({ 
                responsavel_id: responsavelId,
                updated_at: new Date().toISOString()
              })
              .eq('id', taskId)
              .select(`
                *,
                responsavel:usuarios!tarefas_responsavel_id_fkey(
                  id,
                  nome,
                  email
                ),
                obra:obras!tarefas_obra_id_fkey(
                  id,
                  nome,
                  status
                )
              `)
              .single();
            
            if (error) throw error;
            
            // Atualizar estado local
            const { tasks, currentTask } = get();
            const updatedTasks = tasks.map(task => 
              task.id === taskId ? data : task
            );
            
            set({ 
              tasks: updatedTasks,
              currentTask: currentTask?.id === taskId ? data : currentTask,
              loading: false 
            });
            
            return true;
          } catch (error: any) {
            console.error('Erro ao atribuir tarefa:', error);
            set({ 
              error: error.message || 'Erro ao atribuir tarefa', 
              loading: false 
            });
            return false;
          }
        },
        
        deleteTask: async (taskId: string) => {
          try {
            set({ loading: true, error: null });
            
            const { error } = await supabase
              .from('tarefas')
              .delete()
              .eq('id', taskId);
            
            if (error) throw error;
            
            // Remover do estado local
            const { tasks, currentTask } = get();
            const filteredTasks = tasks.filter(task => task.id !== taskId);
            
            set({ 
              tasks: filteredTasks,
              currentTask: currentTask?.id === taskId ? null : currentTask,
              loading: false 
            });
            
            return true;
          } catch (error: any) {
            console.error('Erro ao deletar tarefa:', error);
            set({ 
              error: error.message || 'Erro ao deletar tarefa', 
              loading: false 
            });
            return false;
          }
        },
      }
    )
  );

// Seletores para otimização de performance
export const useTasks = () => useTaskStore((state) => state.tasks);
export const useCurrentTask = () => useTaskStore((state) => state.currentTask);
export const useTaskLoading = () => useTaskStore((state) => state.loading);
export const useTaskError = () => useTaskStore((state) => state.error);
export const useTaskFilters = () => useTaskStore((state) => state.filters);

// Seletores derivados
export const useTasksByStatus = (status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada') => useTaskStore((state) => 
  state.tasks.filter(task => task.status === status)
);

export const useTasksByPrioridade = (prioridade: 'baixa' | 'media' | 'alta' | 'urgente') => useTaskStore((state) => 
  state.tasks.filter(task => task.prioridade === prioridade)
);

export const useTasksByResponsavel = (responsavelId: string) => useTaskStore((state) => 
  state.tasks.filter(task => task.responsavel_id === responsavelId)
);

export const useTasksByObra = (obraId: string) => useTaskStore((state) => 
  state.tasks.filter(task => task.obra_id === obraId)
);

export const useTaskById = (taskId: string) => useTaskStore((state) => 
  state.tasks.find(task => task.id === taskId)
);

export const useOverdueTasks = () => useTaskStore((state) => {
  const now = new Date().toISOString();
  return state.tasks.filter(task => 
    task.data_fim < now && 
    task.status !== 'concluida' && 
    task.status !== 'cancelada'
  );
});

export const useFilteredTasks = () => useTaskStore((state) => {
  let filtered = state.tasks;
  
  if (state.filters.status) {
    filtered = filtered.filter(task => task.status === state.filters.status);
  }
  
  if (state.filters.prioridade) {
    filtered = filtered.filter(task => task.prioridade === state.filters.prioridade);
  }
  
  if (state.filters.responsavel) {
    filtered = filtered.filter(task => task.responsavel_id === state.filters.responsavel);
  }
  
  if (state.filters.obra) {
    filtered = filtered.filter(task => task.obra_id === state.filters.obra);
  }
  
  if (state.filters.search) {
    const search = state.filters.search.toLowerCase();
    filtered = filtered.filter(task => 
      task.titulo.toLowerCase().includes(search) ||
      task.descricao?.toLowerCase().includes(search)
    );
  }
  
  if (state.filters.dateRange) {
    filtered = filtered.filter(task => 
      task.data_inicio >= state.filters.dateRange!.start &&
      task.data_fim <= state.filters.dateRange!.end
    );
  }
  
  return filtered;
});