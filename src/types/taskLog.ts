export type TaskLogEventType = 
  | 'inicio'
  | 'pausa'
  | 'retomada'
  | 'conclusao'
  | 'revisao'
  | 'edicao'
  | 'cancelamento';

export interface TaskLogEvent {
  id: string;
  taskId: string;
  type: TaskLogEventType;
  timestamp: string;
  usuario: string;
  descricao?: string;
  detalhes?: {
    statusAnterior?: string;
    statusNovo?: string;
    progressoAnterior?: number;
    progressoNovo?: number;
    camposAlterados?: string[];
    observacoes?: string;
  };
}

export interface TaskLog {
  taskId: string;
  eventos: TaskLogEvent[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface TaskLogStorage {
  [taskId: string]: TaskLog;
}

export const eventTypeLabels: Record<TaskLogEventType, string> = {
  inicio: 'Tarefa Iniciada',
  pausa: 'Tarefa Pausada',
  retomada: 'Tarefa Retomada',
  conclusao: 'Tarefa Concluída',
  revisao: 'Tarefa Revisada',
  edicao: 'Tarefa Editada',
  cancelamento: 'Tarefa Cancelada'
};

export const eventTypeIcons: Record<TaskLogEventType, string> = {
  inicio: 'Play',
  pausa: 'Pause',
  retomada: 'Play',
  conclusao: 'CheckCircle2',
  revisao: 'RotateCcw',
  edicao: 'Edit3',
  cancelamento: 'X'
};

export const eventTypeColors: Record<TaskLogEventType, string> = {
  inicio: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  pausa: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
  retomada: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  conclusao: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  revisao: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  edicao: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
  cancelamento: 'text-red-600 bg-red-100 dark:bg-red-900/30'
};