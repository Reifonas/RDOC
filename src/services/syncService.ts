import { db, type PendingRDO, type SyncOperation } from '../db/db';
import { supabase } from '../lib/supabase';
import { ConflictResolver, ConflictStore, type DataConflict } from './conflictResolver';

/**
 * Configurações de retry
 */
const RETRY_CONFIG = {
    maxRetries: 5,
    initialDelay: 1000, // 1 segundo
    maxDelay: 30000, // 30 segundos
    backoffMultiplier: 2
};

/**
 * Serviço de Sincronização Offline
 * 
 * Gerencia a sincronização de dados entre o banco local (Dexie)
 * e o Supabase quando a conexão é restabelecida.
 */
export class SyncService {
    private isSyncing = false;
    private syncListeners: Array<(status: SyncStatus) => void> = [];

    constructor() {
        // Escutar eventos de conexão
        window.addEventListener('online', () => this.processQueue());
    }

    /**
     * Adiciona listener para eventos de sincronização
     */
    onSyncStatusChange(callback: (status: SyncStatus) => void): () => void {
        this.syncListeners.push(callback);
        return () => {
            this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Notifica listeners sobre mudança de status
     */
    private notifyListeners(status: SyncStatus): void {
        this.syncListeners.forEach(callback => callback(status));
    }

    /**
     * Verifica se está online
     */
    private get isOnline(): boolean {
        return navigator.onLine;
    }

    /**
     * Processa a fila de operações pendentes
     */
    async processQueue(): Promise<void> {
        if (!this.isOnline || this.isSyncing) return;

        try {
            this.isSyncing = true;
            console.log('🔄 Iniciando sincronização offline...');

            this.notifyListeners({
                status: 'syncing',
                message: 'Sincronizando dados...',
                progress: 0
            });

            // Processar fila de operações genéricas
            await this.processSyncQueue();

            // Processar RDOs pendentes
            await this.processPendingRDOs();

            console.log('✅ Sincronização concluída!');
            this.notifyListeners({
                status: 'success',
                message: 'Sincronização concluída',
                progress: 100
            });

        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
            this.notifyListeners({
                status: 'error',
                message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
                progress: 0
            });
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Processa fila de operações genéricas (INSERT/UPDATE/DELETE)
     */
    private async processSyncQueue(): Promise<void> {
        const operations = await db.syncQueue
            .orderBy('timestamp')
            .toArray();

        if (operations.length === 0) return;

        console.log(`📋 Processando ${operations.length} operações...`);

        for (const [index, operation] of operations.entries()) {
            const progress = ((index + 1) / operations.length) * 50; // 50% do progresso total
            this.notifyListeners({
                status: 'syncing',
                message: `Sincronizando operação ${index + 1}/${operations.length}`,
                progress
            });

            await this.syncOperation(operation);
        }
    }

    /**
     * Sincroniza uma operação individual com retry
     */
    private async syncOperation(operation: SyncOperation): Promise<void> {
        let retries = 0;
        let delay = RETRY_CONFIG.initialDelay;

        while (retries <= RETRY_CONFIG.maxRetries) {
            try {
                await this.executeSyncOperation(operation);

                // Sucesso: remove da fila
                await db.syncQueue.delete(operation.id!);
                console.log(`✅ Operação ${operation.type} em ${operation.table} sincronizada`);
                return;

            } catch (error) {
                retries++;
                console.warn(`⚠️ Tentativa ${retries}/${RETRY_CONFIG.maxRetries} falhou:`, error);

                if (retries > RETRY_CONFIG.maxRetries) {
                    // Falha definitiva: atualizar retry count
                    await db.syncQueue.update(operation.id!, {
                        retryCount: retries
                    });
                    throw error;
                }

                // Aguardar antes de tentar novamente (exponential backoff)
                await this.sleep(Math.min(delay, RETRY_CONFIG.maxDelay));
                delay *= RETRY_CONFIG.backoffMultiplier;
            }
        }
    }

    /**
     * Executa uma operação de sincronização
     */
    private async executeSyncOperation(operation: SyncOperation): Promise<void> {
        const { type, table, data } = operation;

        switch (type) {
            case 'INSERT': {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error: insertError } = await supabase
                    .from(table)
                    .insert(data as any);
                if (insertError) throw insertError;
                break;
            }

            case 'UPDATE': {
                // Verificar conflitos antes de atualizar
                if (data.id) {
                    await this.checkAndResolveConflict(table, data);
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error: updateError } = await supabase
                    .from(table)
                    .update(data as any)
                    .eq('id', data.id);
                if (updateError) throw updateError;
                break;
            }

            case 'DELETE': {
                const { error: deleteError } = await supabase
                    .from(table)
                    .delete()
                    .eq('id', data.id);
                if (deleteError) throw deleteError;
                break;
            }
        }
    }

    /**
     * Verifica e resolve conflitos de dados
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async checkAndResolveConflict(table: string, localData: any): Promise<void> {
        // Buscar versão remota atual
        const { data: remoteData, error } = await supabase
            .from(table)
            .select('*')
            .eq('id', localData.id)
            .single();

        if (error || !remoteData) return; // Sem conflito se não existe remotamente

        // Detectar conflito
        if (ConflictResolver.detectConflict(localData, remoteData)) {
            console.warn(`⚠️ Conflito detectado em ${table}:`, localData.id);

            // Criar objeto de conflito
            const conflict: DataConflict = ConflictResolver.createConflict(
                table,
                localData,
                remoteData,
                'last-write-wins' // Estratégia padrão
            );

            // Resolver conflito
            const resolution = ConflictResolver.resolve(conflict);

            if (resolution.requiresManualReview) {
                // Salvar para revisão manual
                ConflictStore.saveUnresolvedConflict(conflict);
                console.warn(`⚠️ Conflito requer revisão manual: ${table}:${localData.id}`);
            } else {
                // Usar dados resolvidos
                Object.assign(localData, resolution.data);
                console.log(`✅ Conflito resolvido automaticamente (${resolution.strategy})`);
            }
        }
    }

    /**
     * Processa RDOs pendentes
     */
    private async processPendingRDOs(): Promise<void> {
        const pendingRDOs = await db.pendingRDOs
            .where('status')
            .equals('pending')
            .toArray();

        if (pendingRDOs.length === 0) {
            console.log('✅ Nenhum RDO pendente.');
            return;
        }

        console.log(`📋 Processando ${pendingRDOs.length} RDOs pendentes...`);

        for (const [index, item] of pendingRDOs.entries()) {
            const progress = 50 + ((index + 1) / pendingRDOs.length) * 50; // 50-100% do progresso
            this.notifyListeners({
                status: 'syncing',
                message: `Sincronizando RDO ${index + 1}/${pendingRDOs.length}`,
                progress
            });

            await this.syncRDO(item);
        }
    }

    /**
     * Envia um RDO específico para o Supabase
     */
    private async syncRDO(item: PendingRDO): Promise<void> {
        let retries = 0;
        let delay = RETRY_CONFIG.initialDelay;

        while (retries <= RETRY_CONFIG.maxRetries) {
            try {
                // Atualiza status para 'syncing'
                await db.pendingRDOs.update(item.id!, { status: 'syncing' });

                // Validar integridade dos dados
                this.validateRDOPayload(item.payload);

                const { payload } = item;

                // Separar dados do header e tabelas relacionadas
                const rdoHeader = { ...(payload.rdo as Record<string, unknown>) };
                delete rdoHeader.atividades;
                delete rdoHeader.mao_obra;
                delete rdoHeader.equipamentos;
                delete rdoHeader.ocorrencias;
                delete rdoHeader.fotos;

                // 1. Inserir RDO Header
                const { data: rdoData, error: rdoError } = await supabase
                    .from('rdos')
                    .upsert(rdoHeader as any)
                    .select()
                    .single();

                if (rdoError) throw rdoError;
                if (!rdoData) throw new Error('Não foi possível recuperar o RDO inserido');

                const realRdoId = (rdoData as any).id;

                // 2. Inserir Relacionados
                const promises = [];

                // Atividades
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const atividadesList = payload.atividades as any[];
                if (Array.isArray(atividadesList) && atividadesList.length) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const atividades = atividadesList.map((a: any) => ({ ...a, rdo_id: realRdoId }));
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    promises.push(supabase.from('rdo_atividades').upsert(atividades as any));
                }

                // Mão de Obra
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const maoObraList = payload.mao_obra as any[];
                if (Array.isArray(maoObraList) && maoObraList.length) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const maoObra = maoObraList.map((m: any) => ({ ...m, rdo_id: realRdoId }));
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    promises.push(supabase.from('rdo_mao_obra').upsert(maoObra as any));
                }

                // Upload de Fotos
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const fotosList = payload.fotos as any[];
                if (Array.isArray(fotosList) && fotosList.length) {
                    const uploadPromises = fotosList.map(async (file: File) => {
                        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                        const filePath = `${realRdoId}/${fileName}`;

                        const { error: uploadError } = await supabase.storage
                            .from('rdo-photos')
                            .upload(filePath, file);

                        if (uploadError) throw uploadError;

                        const { data: { publicUrl } } = supabase.storage
                            .from('rdo-photos')
                            .getPublicUrl(filePath);

                        return {
                            rdo_id: realRdoId,
                            nome_arquivo: file.name,
                            tipo_arquivo: file.type,
                            tamanho_bytes: file.size,
                            url_storage: publicUrl
                        };
                    });

                    const anexosParaInserir = await Promise.all(uploadPromises);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    promises.push(supabase.from('rdo_anexos').upsert(anexosParaInserir as any));
                }

                await Promise.all(promises);

                // Sucesso: Remove do Dexie
                await db.pendingRDOs.delete(item.id!);
                console.log(`✅ RDO ${item.uuid} sincronizado com sucesso.`);
                return;

            } catch (error) {
                retries++;
                console.warn(`⚠️ Tentativa ${retries}/${RETRY_CONFIG.maxRetries} falhou para RDO ${item.uuid}:`, error);

                if (retries > RETRY_CONFIG.maxRetries) {
                    // Falha definitiva
                    await db.pendingRDOs.update(item.id!, { status: 'failed' });
                    console.error(`❌ RDO ${item.uuid} falhou após ${retries} tentativas`);
                    throw error;
                }

                // Aguardar antes de tentar novamente
                await this.sleep(Math.min(delay, RETRY_CONFIG.maxDelay));
                delay *= RETRY_CONFIG.backoffMultiplier;
            }
        }
    }

    /**
     * Valida integridade do payload do RDO
     */
    private validateRDOPayload(payload: Record<string, unknown>): void {
        if (!payload.rdo) {
            throw new Error('Payload inválido: campo "rdo" ausente');
        }

        const rdo = payload.rdo as Record<string, unknown>;

        if (!rdo.obra_id) {
            throw new Error('Payload inválido: "obra_id" ausente');
        }

        if (!rdo.data_relatorio) {
            throw new Error('Payload inválido: "data_relatorio" ausente');
        }

        // Validações adicionais conforme necessário
    }

    /**
     * Aguarda um período de tempo
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Método público para forçar sincronização manual
     */
    async forceSync(): Promise<void> {
        await this.processQueue();
    }

    /**
     * Obtém estatísticas de sincronização
     */
    async getSyncStats(): Promise<SyncStats> {
        const pendingRDOs = await db.pendingRDOs.count();
        const syncQueue = await db.syncQueue.count();
        const unresolvedConflicts = ConflictStore.count();

        return {
            pendingRDOs,
            pendingOperations: syncQueue,
            unresolvedConflicts,
            isOnline: this.isOnline,
            isSyncing: this.isSyncing
        };
    }
}

/**
 * Tipos auxiliares
 */
export interface SyncStatus {
    status: 'idle' | 'syncing' | 'success' | 'error';
    message: string;
    progress: number; // 0-100
}

export interface SyncStats {
    pendingRDOs: number;
    pendingOperations: number;
    unresolvedConflicts: number;
    isOnline: boolean;
    isSyncing: boolean;
}

// Instância singleton
export const syncService = new SyncService();

