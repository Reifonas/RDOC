import Dexie, { Table } from 'dexie';

// Tipos para RDOs pendentes
export interface PendingRDO {
    id?: number;
    uuid: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: Record<string, any>;
    status: 'pending' | 'syncing' | 'failed';
    createdAt: number;
}

// Fila de sincronização genérica
export interface SyncOperation {
    id?: number;
    table: string;
    type: 'INSERT' | 'UPDATE' | 'DELETE';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>;
    timestamp: number;
    retryCount?: number;
}

// Cache local
export interface CachedData {
    key: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    lastUpdated: number;
}

// Classe do banco local
export class RDOAppDatabase extends Dexie {
    pendingRDOs!: Table<PendingRDO>;
    syncQueue!: Table<SyncOperation>;
    cache!: Table<CachedData>;

    constructor() {
        super('RDO_Offline_DB');
        this.version(1).stores({
            pendingRDOs: '++id, uuid, status, createdAt',
            syncQueue: '++id, table, type, timestamp',
            cache: 'key'
        });
    }
}

export const db = new RDOAppDatabase();
