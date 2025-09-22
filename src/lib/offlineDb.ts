import Dexie, { Table } from 'dexie';
import type { Usuario, Obra, RDO } from '../types/database.types';

// Interfaces para dados offline
export interface OfflineUsuario extends Usuario {
  _lastSync?: number;
  _pendingSync?: boolean;
  _deleted?: boolean;
}

export interface OfflineObra extends Obra {
  _lastSync?: number;
  _pendingSync?: boolean;
  _deleted?: boolean;
}

export interface OfflineRDO extends RDO {
  _lastSync?: number;
  _pendingSync?: boolean;
  _deleted?: boolean;
}

// Interface para operações pendentes
export interface PendingOperation {
  id?: number;
  table: 'usuarios' | 'obras' | 'rdos';
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
  error?: string;
}

// Interface para configurações offline
export interface OfflineConfig {
  id?: number;
  key: string;
  value: any;
  updatedAt: number;
}

// Classe do banco de dados offline
class OfflineDatabase extends Dexie {
  // Tabelas principais
  usuarios!: Table<OfflineUsuario>;
  obras!: Table<OfflineObra>;
  rdos!: Table<OfflineRDO>;
  
  // Tabelas de controle
  pendingOperations!: Table<PendingOperation>;
  offlineConfig!: Table<OfflineConfig>;

  constructor() {
    super('RDOOfflineDB');
    
    this.version(1).stores({
      usuarios: '++id, email, nome, tipo, ativo, created_at, updated_at, _lastSync, _pendingSync, _deleted',
      obras: '++id, nome, descricao, endereco, status, usuario_responsavel_id, created_at, updated_at, _lastSync, _pendingSync, _deleted',
      rdos: '++id, obra_id, usuario_id, data, turno, atividades, observacoes, status, created_at, updated_at, _lastSync, _pendingSync, _deleted',
      pendingOperations: '++id, table, operation, timestamp, retryCount',
      offlineConfig: '++id, key, updatedAt'
    });
  }
}

// Instância do banco de dados
export const offlineDb = new OfflineDatabase();

// Utilitários para gerenciamento offline
export class OfflineManager {
  // Verificar se está offline
  static isOffline(): boolean {
    return !navigator.onLine;
  }

  // Salvar dados no cache offline
  static async cacheData<T extends { id: string }>(
    table: 'usuarios' | 'obras' | 'rdos',
    data: T[]
  ): Promise<void> {
    try {
      const now = Date.now();
      const dataWithSync = data.map(item => ({
        ...item,
        _lastSync: now,
        _pendingSync: false,
        _deleted: false
      }));

      await offlineDb[table].clear();
      await offlineDb[table].clear();
      await (offlineDb[table] as any).bulkAdd(dataWithSync);
      
      console.log(`Cached ${data.length} items in ${table}`);
    } catch (error) {
      console.error(`Error caching data in ${table}:`, error);
    }
  }

  // Obter dados do cache offline
  static async getCachedData<T>(
    table: 'usuarios' | 'obras' | 'rdos',
    filter?: (item: T) => boolean
  ): Promise<T[]> {
    try {
      let query = offlineDb[table].where('_deleted').notEqual(1);
      const data = await query.toArray();
      
      if (filter) {
        return data.filter(filter as any) as T[];
      }
      
      return data as T[];
    } catch (error) {
      console.error(`Error getting cached data from ${table}:`, error);
      return [];
    }
  }

  // Adicionar operação pendente
  static async addPendingOperation(
    table: 'usuarios' | 'obras' | 'rdos',
    operation: 'create' | 'update' | 'delete',
    data: any
  ): Promise<void> {
    try {
      await offlineDb.pendingOperations.add({
        table,
        operation,
        data,
        timestamp: Date.now(),
        retryCount: 0
      });
      
      console.log(`Added pending ${operation} operation for ${table}`);
    } catch (error) {
      console.error('Error adding pending operation:', error);
    }
  }

  // Obter operações pendentes
  static async getPendingOperations(): Promise<PendingOperation[]> {
    try {
      return await offlineDb.pendingOperations
        .orderBy('timestamp')
        .toArray();
    } catch (error) {
      console.error('Error getting pending operations:', error);
      return [];
    }
  }

  // Remover operação pendente
  static async removePendingOperation(id: number): Promise<void> {
    try {
      await offlineDb.pendingOperations.delete(id);
    } catch (error) {
      console.error('Error removing pending operation:', error);
    }
  }

  // Marcar operação como com erro
  static async markOperationError(id: number, error: string): Promise<void> {
    try {
      await offlineDb.pendingOperations.update(id, {
        error,
        retryCount: await offlineDb.pendingOperations
          .get(id)
          .then(op => (op?.retryCount || 0) + 1)
      });
    } catch (err) {
      console.error('Error marking operation error:', err);
    }
  }

  // Salvar configuração offline
  static async setConfig(key: string, value: any): Promise<void> {
    try {
      // Primeiro, tenta encontrar uma configuração existente
      const existing = await offlineDb.offlineConfig.where('key').equals(key).first();
      
      if (existing) {
        // Atualiza a configuração existente
        await offlineDb.offlineConfig.update(existing.id!, {
          value,
          updatedAt: Date.now()
        });
      } else {
        // Cria uma nova configuração
        await offlineDb.offlineConfig.add({
          key,
          value,
          updatedAt: Date.now()
        });
      }
    } catch (error) {
      console.error('Error setting offline config:', error);
      throw error;
    }
  }

  // Obter configuração offline
  static async getConfig(key: string): Promise<any> {
    try {
      const config = await offlineDb.offlineConfig.where('key').equals(key).first();
      return config?.value;
    } catch (error) {
      console.error('Error getting offline config:', error);
      return null;
    }
  }

  // Limpar dados antigos (mais de 30 dias)
  static async cleanOldData(): Promise<void> {
    try {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      // Limpar operações pendentes antigas com muitos erros
      await offlineDb.pendingOperations
        .where('retryCount')
        .above(5)
        .delete();
      
      // Limpar configurações antigas
      await offlineDb.offlineConfig
        .where('updatedAt')
        .below(thirtyDaysAgo)
        .delete();
      
      console.log('Cleaned old offline data');
    } catch (error) {
      console.error('Error cleaning old data:', error);
    }
  }

  // Obter estatísticas do cache
  static async getCacheStats(): Promise<{
    usuarios: number;
    obras: number;
    rdos: number;
    pendingOperations: number;
    lastSync?: number;
  }> {
    try {
      const [usuarios, obras, rdos, pendingOperations, lastSyncConfig] = await Promise.all([
        offlineDb.usuarios.count(),
        offlineDb.obras.count(),
        offlineDb.rdos.count(),
        offlineDb.pendingOperations.count(),
        this.getConfig('lastFullSync')
      ]);

      return {
        usuarios,
        obras,
        rdos,
        pendingOperations,
        lastSync: lastSyncConfig
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        usuarios: 0,
        obras: 0,
        rdos: 0,
        pendingOperations: 0
      };
    }
  }

  // Limpar todo o cache
  static async clearCache(): Promise<void> {
    try {
      await Promise.all([
        offlineDb.usuarios.clear(),
        offlineDb.obras.clear(),
        offlineDb.rdos.clear(),
        offlineDb.pendingOperations.clear(),
        offlineDb.offlineConfig.clear()
      ]);
      
      console.log('Cleared all offline cache');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

// Inicializar banco de dados
offlineDb.open().catch(error => {
  console.error('Error opening offline database:', error);
});