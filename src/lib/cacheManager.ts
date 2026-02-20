/**
 * Gerenciador de Cache Inteligente
 * 
 * Gerencia cache de dados com TTL, invalidação automática,
 * prefetch e compressão.
 */

import { db } from '../db/db';
import { supabase } from '../lib/supabase';

/**
 * Configurações de cache
 */
const CACHE_CONFIG = {
    defaultTTL: 1000 * 60 * 30, // 30 minutos
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    compressionThreshold: 10 * 1024, // 10KB
    prefetchTables: ['obras', 'funcionarios', 'tipos_atividade', 'equipamentos']
};

/**
 * Metadados de cache
 */
interface CacheMetadata {
    key: string;
    size: number;
    ttl: number;
    compressed: boolean;
    lastAccessed: number;
}

/**
 * Gerenciador de Cache
 */
export class CacheManager {
    private metadata: Map<string, CacheMetadata> = new Map();

    constructor() {
        this.loadMetadata();
        this.startCleanupInterval();
    }

    /**
     * Carrega metadados do localStorage
     */
    private loadMetadata(): void {
        const stored = localStorage.getItem('cache_metadata');
        if (stored) {
            const data = JSON.parse(stored);
            this.metadata = new Map(Object.entries(data));
        }
    }

    /**
     * Salva metadados no localStorage
     */
    private saveMetadata(): void {
        const data = Object.fromEntries(this.metadata);
        localStorage.setItem('cache_metadata', JSON.stringify(data));
    }

    /**
     * Inicia limpeza automática de cache expirado
     */
    private startCleanupInterval(): void {
        // Limpar cache a cada 5 minutos
        setInterval(() => {
            this.cleanExpiredCache();
        }, 1000 * 60 * 5);
    }

    /**
     * Obtém dados do cache
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async get<T = any>(key: string): Promise<T | null> {
        try {
            const cached = await db.cache.get(key);

            if (!cached) return null;

            const meta = this.metadata.get(key);

            // Verificar TTL
            if (meta && Date.now() - cached.lastUpdated > meta.ttl) {
                await this.delete(key);
                return null;
            }

            // Atualizar último acesso
            if (meta) {
                meta.lastAccessed = Date.now();
                this.metadata.set(key, meta);
                this.saveMetadata();
            }

            // Descomprimir se necessário
            let data = cached.data;
            if (meta?.compressed && typeof data === 'string') {
                data = this.decompress(data);
            }

            return data as T;

        } catch (error) {
            console.error(`Erro ao obter cache ${key}:`, error);
            return null;
        }
    }

    /**
     * Armazena dados no cache
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async set(key: string, data: any, ttl: number = CACHE_CONFIG.defaultTTL): Promise<void> {
        try {
            let processedData = data;
            let compressed = false;
            const dataStr = JSON.stringify(data);
            const size = new Blob([dataStr]).size;

            // Comprimir se exceder threshold
            if (size > CACHE_CONFIG.compressionThreshold) {
                processedData = this.compress(dataStr);
                compressed = true;
            }

            // Verificar tamanho total do cache
            await this.ensureCacheSpace(size);

            // Salvar no Dexie
            await db.cache.put({
                key,
                data: processedData,
                lastUpdated: Date.now()
            });

            // Atualizar metadados
            this.metadata.set(key, {
                key,
                size,
                ttl,
                compressed,
                lastAccessed: Date.now()
            });
            this.saveMetadata();

            console.log(`✅ Cache salvo: ${key} (${this.formatBytes(size)})`);

        } catch (error) {
            console.error(`Erro ao salvar cache ${key}:`, error);
        }
    }

    /**
     * Remove dados do cache
     */
    async delete(key: string): Promise<void> {
        await db.cache.delete(key);
        this.metadata.delete(key);
        this.saveMetadata();
    }

    /**
     * Limpa cache expirado
     */
    async cleanExpiredCache(): Promise<void> {
        const now = Date.now();
        const expiredKeys: string[] = [];

        // Identificar chaves expiradas
        for (const [key, meta] of this.metadata.entries()) {
            const cached = await db.cache.get(key);
            if (!cached || now - cached.lastUpdated > meta.ttl) {
                expiredKeys.push(key);
            }
        }

        // Remover chaves expiradas
        for (const key of expiredKeys) {
            await this.delete(key);
        }

        if (expiredKeys.length > 0) {
            console.log(`🧹 Cache limpo: ${expiredKeys.length} itens expirados removidos`);
        }
    }

    /**
     * Garante espaço suficiente no cache
     */
    private async ensureCacheSpace(requiredSize: number): Promise<void> {
        const totalSize = this.getTotalCacheSize();

        if (totalSize + requiredSize > CACHE_CONFIG.maxCacheSize) {
            // Remover itens menos acessados (LRU)
            await this.evictLRU(requiredSize);
        }
    }

    /**
     * Remove itens menos recentemente usados (LRU)
     */
    private async evictLRU(requiredSize: number): Promise<void> {
        const entries = Array.from(this.metadata.entries())
            .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

        let freedSpace = 0;

        for (const [key, meta] of entries) {
            if (freedSpace >= requiredSize) break;

            await this.delete(key);
            freedSpace += meta.size;
        }

        console.log(`🧹 Cache LRU: ${this.formatBytes(freedSpace)} liberados`);
    }

    /**
     * Calcula tamanho total do cache
     */
    private getTotalCacheSize(): number {
        let total = 0;
        for (const meta of this.metadata.values()) {
            total += meta.size;
        }
        return total;
    }

    /**
     * Comprime dados (simulação - em produção usar biblioteca como pako)
     */
    private compress(data: string): string {
        // Simulação de compressão (em produção, usar biblioteca real)
        // Por enquanto, apenas retorna o dado original
        return data;
    }

    /**
     * Descomprime dados
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private decompress(data: string): any {
        // Simulação de descompressão
        return JSON.parse(data);
    }

    /**
     * Formata bytes para leitura humana
     */
    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Prefetch de dados essenciais
     */
    async prefetchEssentialData(): Promise<void> {
        console.log('🔄 Iniciando prefetch de dados essenciais...');

        for (const table of CACHE_CONFIG.prefetchTables) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*');

                if (error) throw error;

                await this.set(`table_${table}`, data);
                console.log(`✅ Prefetch: ${table} (${data?.length || 0} registros)`);

            } catch (error) {
                console.error(`❌ Erro no prefetch de ${table}:`, error);
            }
        }

        console.log('✅ Prefetch concluído!');
    }

    /**
     * Invalida cache de uma tabela específica
     */
    async invalidateTable(table: string): Promise<void> {
        await this.delete(`table_${table}`);
        console.log(`🔄 Cache invalidado: ${table}`);
    }

    /**
     * Limpa todo o cache
     */
    async clearAll(): Promise<void> {
        await db.cache.clear();
        this.metadata.clear();
        this.saveMetadata();
        console.log('🧹 Todo o cache foi limpo');
    }

    /**
     * Obtém estatísticas do cache
     */
    getStats(): CacheStats {
        const totalSize = this.getTotalCacheSize();
        const itemCount = this.metadata.size;
        const usagePercent = (totalSize / CACHE_CONFIG.maxCacheSize) * 100;

        return {
            totalSize,
            itemCount,
            usagePercent,
            maxSize: CACHE_CONFIG.maxCacheSize,
            formattedSize: this.formatBytes(totalSize)
        };
    }
}

/**
 * Estatísticas do cache
 */
export interface CacheStats {
    totalSize: number;
    itemCount: number;
    usagePercent: number;
    maxSize: number;
    formattedSize: string;
}

// Instância singleton
export const cacheManager = new CacheManager();
