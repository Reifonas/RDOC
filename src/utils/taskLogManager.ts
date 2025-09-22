import { TaskLog, TaskLogEvent, TaskLogEventType, TaskLogStorage } from '../types/taskLog';

const STORAGE_KEY = 'task_logs';

export class TaskLogManager {
  private static instance: TaskLogManager;
  private logs: TaskLogStorage = {};

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): TaskLogManager {
    if (!TaskLogManager.instance) {
      TaskLogManager.instance = new TaskLogManager();
    }
    return TaskLogManager.instance;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar logs do localStorage:', error);
      this.logs = {};
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Erro ao salvar logs no localStorage:', error);
    }
  }

  public addEvent(
    taskId: string,
    type: TaskLogEventType,
    usuario: string = 'Usuário Atual',
    descricao?: string,
    detalhes?: TaskLogEvent['detalhes']
  ): void {
    const now = new Date().toISOString();
    
    // Inicializar log da tarefa se não existir
    if (!this.logs[taskId]) {
      this.logs[taskId] = {
        taskId,
        eventos: [],
        criadoEm: now,
        atualizadoEm: now
      };
    }

    // Criar novo evento
    const evento: TaskLogEvent = {
      id: `${taskId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskId,
      type,
      timestamp: now,
      usuario,
      ...(descricao !== undefined && { descricao }),
      ...(detalhes !== undefined && { detalhes })
    };

    // Adicionar evento ao log
    this.logs[taskId].eventos.push(evento);
    this.logs[taskId].atualizadoEm = now;

    // Salvar no localStorage
    this.saveToStorage();
  }

  public getTaskLog(taskId: string): TaskLog | null {
    return this.logs[taskId] || null;
  }

  public getTaskEvents(taskId: string): TaskLogEvent[] {
    const log = this.getTaskLog(taskId);
    return log ? log.eventos.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ) : [];
  }

  public getAllLogs(): TaskLogStorage {
    return { ...this.logs };
  }

  public clearTaskLog(taskId: string): void {
    delete this.logs[taskId];
    this.saveToStorage();
  }

  public clearAllLogs(): void {
    this.logs = {};
    this.saveToStorage();
  }

  // Métodos de conveniência para eventos específicos
  public logTaskStart(taskId: string, usuario?: string): void {
    this.addEvent(taskId, 'inicio', usuario, 'Tarefa iniciada');
  }

  public logTaskPause(taskId: string, usuario?: string): void {
    this.addEvent(taskId, 'pausa', usuario, 'Tarefa pausada');
  }

  public logTaskResume(taskId: string, usuario?: string): void {
    this.addEvent(taskId, 'retomada', usuario, 'Tarefa retomada');
  }

  public logTaskComplete(taskId: string, usuario?: string): void {
    this.addEvent(taskId, 'conclusao', usuario, 'Tarefa concluída');
  }

  public logTaskEdit(
    taskId: string, 
    camposAlterados: string[], 
    usuario?: string,
    observacoes?: string
  ): void {
    const detalhes: TaskLogEvent['detalhes'] = {
      camposAlterados,
      ...(observacoes !== undefined && { observacoes })
    };
    
    this.addEvent(
      taskId, 
      'edicao', 
      usuario, 
      `Tarefa editada: ${camposAlterados.join(', ')}`,
      detalhes
    );
  }

  public logTaskCancel(taskId: string, usuario?: string, motivo?: string): void {
    const detalhes: TaskLogEvent['detalhes'] = motivo !== undefined 
      ? { observacoes: motivo }
      : undefined;
      
    this.addEvent(
      taskId, 
      'cancelamento', 
      usuario, 
      'Tarefa cancelada',
      detalhes
    );
  }

  public logStatusChange(
    taskId: string,
    statusAnterior: string,
    statusNovo: string,
    usuario?: string
  ): void {
    let type: TaskLogEventType;
    let descricao: string;

    switch (statusNovo) {
      case 'em_andamento':
        type = statusAnterior === 'pausada' ? 'retomada' : 'inicio';
        descricao = statusAnterior === 'pausada' ? 'Tarefa retomada' : 'Tarefa iniciada';
        break;
      case 'pausada':
        type = 'pausa';
        descricao = 'Tarefa pausada';
        break;
      case 'concluida':
        type = 'conclusao';
        descricao = 'Tarefa concluída';
        break;
      case 'cancelada':
        type = 'cancelamento';
        descricao = 'Tarefa cancelada';
        break;
      default:
        type = 'edicao';
        descricao = `Status alterado de ${statusAnterior} para ${statusNovo}`;
    }

    this.addEvent(taskId, type, usuario, descricao, {
      statusAnterior,
      statusNovo
    });
  }
}

// Instância singleton
export const taskLogManager = TaskLogManager.getInstance();

// Função de conveniência para compatibilidade com imports existentes
export const addTaskLogEvent = (
  taskId: string,
  type: string,
  descricao: string,
  usuario?: string
): void => {
  let eventType: TaskLogEventType;
  
  switch (type) {
    case 'start':
      eventType = 'inicio';
      break;
    case 'resume':
      eventType = 'retomada';
      break;
    case 'pause':
      eventType = 'pausa';
      break;
    case 'complete':
      eventType = 'conclusao';
      break;
    case 'edit':
      eventType = 'edicao';
      break;
    case 'cancel':
      eventType = 'cancelamento';
      break;
    default:
      eventType = 'edicao';
  }
  
  taskLogManager.addEvent(taskId, eventType, usuario, descricao);
};