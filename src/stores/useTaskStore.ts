import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Tarefa, StatusTarefa, PrioridadeTarefa } from '../types/database';
import { supabase } from '../lib/supabase';

interface TaskState {
  // Estado
  tasks: Tarefa[];
  currentTask: Tarefa | null;
  loading: boolean;
  error: string | null;
  filters: {
    status?: StatusTarefa;
    prioridade?: PrioridadeTarefa;
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
  setFilters: (filters: Partial<TaskState['filters']>) => void;
  
  // Operações assíncronas
  fetchTasks: () => Promise<void>;
  fetchTaskById: (taskId: string) => Promise<void>;
  fetchTasksByObra: (obraId: string) => Promise<void>;
  createTask: (taskData: Omit<Tarefa, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateTask: (taskId: string, updates: Partial<Tarefa>) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  updateTaskStatus: (taskId: string, status: StatusTarefa) => Promise<boolean>;
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

export const useTaskStore = create<TaskState>()()
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Ações síncronas
        setTasks: (tasks) => set({ tasks }, false, 'setTasks'),
        
        setCurrentTask: (task) => set({ currentTask: task }, false, 'setCurrentTask'),
        
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
        fetchTasks: async () => {
          try {
            set({ loading: true, error: null }, false, 'fetchTasks:start');
            
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
            }, false, 'fetchTasks:success');
          } catch (error: any) {
            console.error('Erro ao buscar tarefas:', error);
            set({ 
              error: error.message || 'Erro ao buscar tarefas', 
              loading: false 
            }, false, 'fetchTasks:error');
          }
        },
        
        fetchTaskById: async (taskId: string) => {
          try {
            set({ loading: true, error: null }, false, 'fetchTaskById:start');
            
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
            }, false, 'fetchTaskById:success');
          } catch (error: any) {
            console.error('Erro ao buscar tarefa:', error);
            set({ 
              error: error.message || 'Erro ao buscar tarefa', 
              loading: false 
            }, false, 'fetchTaskById:error');
          }
        },
        
        fetchTasksByObra: async (obraId: string) => {
          try {
            set({ loading: true, error: null }, false, 'fetchTasksByObra:start');
            
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
              .eq('obra_id', obraId)
              .order('data_inicio', { ascending: true });
            
            if (error) throw error;
            
            set({ 
              tasks: data || [], 
              loading: false 
            }, false, 'fetchTasksByObra:success');
          } catch (error: any) {
            console.error('Erro ao buscar tarefas da obra:', error);
            set({ 
              error: error.message || 'Erro ao buscar tarefas da obra', 
              loading: false 
            }, false, 'fetchTasksByObra:error');
          }
        },
        
        createTask: async (taskData) => {
          try {
            set({ loading: true, error: null }, false, 'createTask:start');
            
            const { data, error } = await supabase
              .from('tarefas')
              .insert({
                ...taskData,
                status: 'pendente' as StatusTarefa
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
            }, false, 'createTask:success');
            
            return true;
          } catch (error: any) {
            console.error('Erro ao criar tarefa:', error);
            set({ 
              error: error.message || 'Erro ao criar tarefa', 
              loading: false 
            }, false, 'createTask:error');
            return false;
          }
        },
        
        updateTask: async (taskId: string, updates: Partial<Tarefa>) => {
          try {
            set({ loading: true, error: null }, false, 'updateTask:start');
            
            const { data, error } = await supabase
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
            }, false, 'updateTask:success');
            
            return true;
          } catch (error: any) {
            console.error('Erro ao atualizar tarefa:', error);
            set({ 
              error: error.message || 'Erro ao atualizar tarefa', 
              loading: false 
            }, false, 'updateTask:error');
            return false;
          }
        },
        
        updateTaskStatus: async (taskId: string, status: StatusTarefa) => {
          try {
            set({ loading: true, error: null }, false, 'updateTaskStatus:start');
            
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
            
            const { data, error } = await supabase
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
            }, false, 'updateTaskStatus:success');
            
            return true;
          } catch (error: any) {
            console.error('Erro ao atualizar status da tarefa:', error);
            set({ 
              error: error.message || 'Erro ao atualizar status da tarefa', 
              loading: false 
            }, false, 'updateTaskStatus:error');
            return false;
          }
        },
        
        assignTask: async (taskId: string, responsavelId: string) => {
          try {
            set({ loading: true, error: null }, false, 'assignTask:start');
            
            const { data, error } = await supabase
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
            }, false, 'assignTask:success');
            
            return true;
          } catch (error: any) {
            console.error('Erro ao atribuir tarefa:', error);
            set({ 
              error: error.message || 'Erro ao atribuir tarefa', 
              loading: false 
            }, false, 'assignTask:error');
            return false;
          }
        },
        
        deleteTask: async (taskId: string) => {
          try {
            set({ loading: true, error: null }, false, 'deleteTask:start');
            
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
            }, false, 'deleteTask:success');
            
            return true;
          } catch (error: any) {
            console.error('Erro ao deletar tarefa:', error);
            set({ 
              error: error.message || 'Erro ao deletar tarefa', 
              loading: false 
            }, false, 'deleteTask:error');
            return false;
          }
        },
      }),
      {
        name: 'task-store',
        partialize: (state) => ({
          tasks: state.tasks,
          currentTask: state.currentTask,
          filters: state.filters,
        }),
      }
    ),
    {
      name: 'task-store',
    }
  );

// Seletores para otimização de performance
export const useTasks = () => useTaskStore((state) => state.tasks);
export const useCurrentTask = () => useTaskStore((state) => state.currentTask);
export const useTaskLoading = () => useTaskStore((state) => state.loading);
export const useTaskError = () => useTaskStore((state) => state.error);
export const useTaskFilters = () => useTaskStore((state) => state.filters);

// Seletores derivados
export const useTasksByStatus = (status: StatusTarefa) => useTaskStore((state) => 
  state.tasks.filter(task => task.status === status)
);

export const useTasksByPrioridade = (prioridade: PrioridadeTarefa) => useTaskStore((state) => 
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