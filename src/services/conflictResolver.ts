/**
 * Serviço de Resolução de Conflitos
 * 
 * Gerencia conflitos de dados quando múltiplos dispositivos
 * modificam os mesmos registros offline.
 */

export type ConflictStrategy = 'last-write-wins' | 'manual' | 'merge';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DataConflict<T = any> {
  id: string;
  table: string;
  localVersion: T;
  remoteVersion: T;
  localTimestamp: number;
  remoteTimestamp: number;
  strategy: ConflictStrategy;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ConflictResolution<T = any> {
  resolved: boolean;
  data: T;
  strategy: ConflictStrategy;
  requiresManualReview: boolean;
}

/**
 * Resolve conflitos entre versões local e remota de dados
 */
export class ConflictResolver {
  /**
   * Detecta se há conflito entre versões local e remota
   */
  static detectConflict<T extends { updated_at?: string; id: string }>(
    localData: T,
    remoteData: T
  ): boolean {
    if (!localData.updated_at || !remoteData.updated_at) {
      return false;
    }

    const localTime = new Date(localData.updated_at).getTime();
    const remoteTime = new Date(remoteData.updated_at).getTime();

    // Conflito se ambos foram modificados e os timestamps são diferentes
    return Math.abs(localTime - remoteTime) > 1000; // Tolerância de 1 segundo
  }

  /**
   * Resolve conflito usando estratégia last-write-wins
   */
  static resolveLastWriteWins<T extends { updated_at?: string }>(
    conflict: DataConflict<T>
  ): ConflictResolution<T> {
    const useLocal = conflict.localTimestamp > conflict.remoteTimestamp;

    return {
      resolved: true,
      data: useLocal ? conflict.localVersion : conflict.remoteVersion,
      strategy: 'last-write-wins',
      requiresManualReview: false
    };
  }

  /**
   * Tenta fazer merge automático de campos não conflitantes
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static resolveMerge<T extends Record<string, any>>(
    conflict: DataConflict<T>
  ): ConflictResolution<T> {
    const merged = { ...conflict.remoteVersion };
    const conflicts: string[] = [];

    // Comparar cada campo
    for (const key in conflict.localVersion) {
      const localValue = conflict.localVersion[key];
      const remoteValue = conflict.remoteVersion[key];

      // Se os valores são diferentes, há conflito
      if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
        // Usar valor mais recente
        if (conflict.localTimestamp > conflict.remoteTimestamp) {
          merged[key] = localValue;
        }
        conflicts.push(key);
      }
    }

    return {
      resolved: true,
      data: merged as T,
      strategy: 'merge',
      requiresManualReview: conflicts.length > 3 // Muitos conflitos = revisão manual
    };
  }

  /**
   * Marca conflito para resolução manual
   */
  static requireManualResolution<T>(
    conflict: DataConflict<T>
  ): ConflictResolution<T> {
    return {
      resolved: false,
      data: conflict.localVersion, // Temporariamente usa versão local
      strategy: 'manual',
      requiresManualReview: true
    };
  }

  /**
   * Resolve conflito usando a estratégia apropriada
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static resolve<T extends Record<string, any>>(
    conflict: DataConflict<T>
  ): ConflictResolution<T> {
    switch (conflict.strategy) {
      case 'last-write-wins':
        return this.resolveLastWriteWins(conflict);

      case 'merge':
        return this.resolveMerge(conflict);

      case 'manual':
        return this.requireManualResolution(conflict);

      default:
        // Padrão: last-write-wins
        return this.resolveLastWriteWins(conflict);
    }
  }

  /**
   * Cria um objeto de conflito a partir de dados local e remoto
   */
  static createConflict<T extends { updated_at?: string; id: string }>(
    table: string,
    localData: T,
    remoteData: T,
    strategy: ConflictStrategy = 'last-write-wins'
  ): DataConflict<T> {
    return {
      id: localData.id,
      table,
      localVersion: localData,
      remoteVersion: remoteData,
      localTimestamp: localData.updated_at
        ? new Date(localData.updated_at).getTime()
        : Date.now(),
      remoteTimestamp: remoteData.updated_at
        ? new Date(remoteData.updated_at).getTime()
        : Date.now(),
      strategy
    };
  }
}

/**
 * Armazena conflitos não resolvidos para revisão manual
 */
export class ConflictStore {
  private static STORAGE_KEY = 'rdo_unresolved_conflicts';

  /**
   * Salva conflito não resolvido
   */
  static saveUnresolvedConflict(conflict: DataConflict): void {
    const conflicts = this.getUnresolvedConflicts();
    conflicts.push({
      ...conflict,
      savedAt: Date.now()
    });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(conflicts));
  }

  /**
   * Obtém todos os conflitos não resolvidos
   */
  static getUnresolvedConflicts(): Array<DataConflict & { savedAt: number }> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Remove conflito resolvido
   */
  static removeConflict(conflictId: string): void {
    const conflicts = this.getUnresolvedConflicts();
    const filtered = conflicts.filter(c => c.id !== conflictId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Limpa todos os conflitos
   */
  static clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Conta conflitos não resolvidos
   */
  static count(): number {
    return this.getUnresolvedConflicts().length;
  }
}
