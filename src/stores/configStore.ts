import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Interfaces Básicas
export interface ConfigItem {
  id: string;
  nome: string;
  ativo: boolean;
  ordem: number;
  cor?: string;
  icone?: string;
  organizacao_id?: string | null;
}

export interface CondicaoClimatica extends ConfigItem {
  valor: string; // ex: 'ensolarado'
}

interface ConfigState {
  // Estados das listas
  tiposAtividade: ConfigItem[];
  condicoesClimaticas: CondicaoClimatica[];
  tiposOcorrencia: ConfigItem[];
  funcoesCargos: ConfigItem[];
  tiposEquipamento: ConfigItem[];
  materiais: ConfigItem[];

  loading: boolean;
  error: string | null;

  // Ações de Inicialização
  fetchAll: () => Promise<void>;

  // CRUD Genérico (dispara ações específicas para cada tipo)
  // Tipos de Atividade
  addTipoAtividade: (item: Omit<ConfigItem, 'id'>) => Promise<void>;
  updateTipoAtividade: (id: string, item: Partial<ConfigItem>) => Promise<void>;
  deleteTipoAtividade: (id: string) => Promise<void>;
  reorderTiposAtividade: (items: ConfigItem[]) => Promise<void>;

  // Condições Climáticas
  addCondicaoClimatica: (item: Omit<CondicaoClimatica, 'id'>) => Promise<void>;
  updateCondicaoClimatica: (id: string, item: Partial<CondicaoClimatica>) => Promise<void>;
  deleteCondicaoClimatica: (id: string) => Promise<void>;
  reorderCondicoesClimaticas: (items: CondicaoClimatica[]) => Promise<void>;

  // Ocorrências
  addTipoOcorrencia: (item: Omit<ConfigItem, 'id'>) => Promise<void>;
  updateTipoOcorrencia: (id: string, item: Partial<ConfigItem>) => Promise<void>;
  deleteTipoOcorrencia: (id: string) => Promise<void>;
  reorderTiposOcorrencia: (items: ConfigItem[]) => Promise<void>;

  // Funções/Cargos
  addFuncaoCargo: (item: Omit<ConfigItem, 'id'>) => Promise<void>;
  updateFuncaoCargo: (id: string, item: Partial<ConfigItem>) => Promise<void>;
  deleteFuncaoCargo: (id: string) => Promise<void>;
  reorderFuncoesCargos: (items: ConfigItem[]) => Promise<void>;

  // Equipamentos
  addTipoEquipamento: (item: Omit<ConfigItem, 'id'>) => Promise<void>;
  updateTipoEquipamento: (id: string, item: Partial<ConfigItem>) => Promise<void>;
  deleteTipoEquipamento: (id: string) => Promise<void>;
  reorderTiposEquipamento: (items: ConfigItem[]) => Promise<void>;

  // Materiais
  addMaterial: (item: Omit<ConfigItem, 'id'>) => Promise<void>;
  updateMaterial: (id: string, item: Partial<ConfigItem>) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  reorderMateriais: (items: ConfigItem[]) => Promise<void>;

  // Utilitários (mantidos para compatibilidade, mas agora operam em memória ou banco)
  resetToDefaults: () => void; // Depreciado ou limpa cache
  exportConfig: () => string;
  importConfig: (config: string) => void;
}

// Helper para CRUD no Supabase
// T = Tipo do Item (ConfigItem)
// Table = Nome da tabela no banco
const createCRUDActions = (set: (fn: (state: ConfigState) => Partial<ConfigState>) => void, get: () => ConfigState, table: string, stateKey: keyof ConfigState) => ({
  add: async (item: Omit<ConfigItem, 'id'>) => {
    try {
      // Insert real
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from(table)
        .insert([item])
        .select()
        .single();

      if (error) throw error;

      // Atualiza com o dado real do banco (incluindo ID gerado)
      set((state) => {
        const currentItems = state[stateKey] as ConfigItem[];
        return {
          [stateKey]: [...currentItems, data].sort((a, b) => a.ordem - b.ordem)
        } as Partial<ConfigState>;
      });
    } catch (error) {
      console.error(`Erro ao adicionar em ${table}:`, error);
    }
  },
  update: async (id: string, updates: Partial<ConfigItem>) => {
    try {
      // Update local otimista
      set((state) => {
        const currentItems = state[stateKey] as ConfigItem[];
        return {
          [stateKey]: currentItems.map(i => i.id === id ? { ...i, ...updates } : i)
        } as Partial<ConfigState>;
      });

      // Update no banco
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from(table)
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Erro ao atualizar em ${table}:`, error);
    }
  },
  delete: async (id: string) => {
    try {
      // Delete local otimista
      set((state) => {
        const currentItems = state[stateKey] as ConfigItem[];
        return {
          [stateKey]: currentItems.filter(i => i.id !== id)
        } as Partial<ConfigState>;
      });

      // Delete no banco
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from(table).delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Erro ao deletar em ${table}:`, error);
    }
  },
  reorder: async (items: ConfigItem[]) => {
    // Atualiza localmente
    set(() => ({ [stateKey]: items } as Partial<ConfigState>));

    // Atualiza ordem no banco
    try {
      const updates = items.map((item, index) => ({
        id: item.id,
        ordem: index + 1
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from(table)
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;
    } catch (error) {
      console.error(`Erro ao reordenar em ${table}:`, error);
    }
  }
});

export const useConfigStore = create<ConfigState>((set, get) => ({
  tiposAtividade: [],
  condicoesClimaticas: [],
  tiposOcorrencia: [],
  funcoesCargos: [],
  tiposEquipamento: [],
  materiais: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    const store = get();
    // Evita chamadas duplicadas se já estiver carregando
    if (store.loading) {
      console.warn('⚠️ ConfigStore: fetchAll já está em andamento. Ignorando chamada duplicada.');
      return;
    }

    set({ loading: true, error: null });
    console.log('🚀 ConfigStore: INICIANDO fetchAll (Modo Robusto)...');

    // Executa requests via RAW FETCH para BURLAR o bloqueio do client Supabase Auth
    try {
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const fetchTable = async (table: string) => {
        console.log(`📡 Buscando ${table} via RAW FETCH...`);
        try {
          const res = await fetch(`${baseUrl}/rest/v1/${table}?select=*&order=ordem.asc`, {
            headers: {
              'apikey': anonKey,
              'Authorization': `Bearer ${anonKey}`, // Usa Anon Key pois RLS é público
              'Content-Type': 'application/json'
            }
          });
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
          const data = await res.json();
          console.log(`✅ ${table}: ${data.length}`);
          return data;
        } catch (e: any) {
          console.error(`❌ Erro RAW em ${table}:`, e);
          return [];
        }
      };

      // Sequencial para não sobrecarregar
      const atividadesData = await fetchTable('tipos_atividade');
      const climaData = await fetchTable('condicoes_climaticas');
      const ocorrenciasData = await fetchTable('tipos_ocorrencia');
      const funcoesData = await fetchTable('funcoes_cargos');
      const equipamentosData = await fetchTable('equipamentos');
      const materiaisData = await fetchTable('materiais');

      set({
        tiposAtividade: atividadesData,
        condicoesClimaticas: climaData,
        tiposOcorrencia: ocorrenciasData,
        funcoesCargos: funcoesData,
        tiposEquipamento: equipamentosData,
        materiais: materiaisData,
        loading: false
      });
      console.log('🏁 ConfigStore: fetchAll CONCLUÍDO via RAW FETCH.');

    } catch (error: any) {
      console.error('🔥 Erro no fetchAll RAW:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Tipos de Atividade
  ...(() => {
    const actions = createCRUDActions(set, get, 'tipos_atividade', 'tiposAtividade');
    return {
      addTipoAtividade: actions.add,
      updateTipoAtividade: actions.update,
      deleteTipoAtividade: actions.delete,
      reorderTiposAtividade: actions.reorder
    };
  })(),

  // Condições Climáticas
  ...(() => {
    const actions = createCRUDActions(set, get, 'condicoes_climaticas', 'condicoesClimaticas');
    return {
      addCondicaoClimatica: actions.add,
      updateCondicaoClimatica: actions.update,
      deleteCondicaoClimatica: actions.delete,
      reorderCondicoesClimaticas: actions.reorder
    };
  })(),

  // Ocorrências
  ...(() => {
    const actions = createCRUDActions(set, get, 'tipos_ocorrencia', 'tiposOcorrencia');
    return {
      addTipoOcorrencia: actions.add,
      updateTipoOcorrencia: actions.update,
      deleteTipoOcorrencia: actions.delete,
      reorderTiposOcorrencia: actions.reorder
    };
  })(),

  // Funções
  ...(() => {
    const actions = createCRUDActions(set, get, 'funcoes_cargos', 'funcoesCargos');
    return {
      addFuncaoCargo: actions.add,
      updateFuncaoCargo: actions.update,
      deleteFuncaoCargo: actions.delete,
      reorderFuncoesCargos: actions.reorder
    };
  })(),

  // Equipamentos
  ...(() => {
    const actions = createCRUDActions(set, get, 'equipamentos', 'tiposEquipamento'); // Atenção: tabela 'equipamentos', state 'tiposEquipamento'
    return {
      addTipoEquipamento: actions.add,
      updateTipoEquipamento: actions.update,
      deleteTipoEquipamento: actions.delete,
      reorderTiposEquipamento: actions.reorder
    };
  })(),

  // Materiais
  ...(() => {
    const actions = createCRUDActions(set, get, 'materiais', 'materiais');
    return {
      addMaterial: actions.add,
      updateMaterial: actions.update,
      deleteMaterial: actions.delete,
      reorderMateriais: actions.reorder
    };
  })(),

  // Legado / Utilitários (Não persistem no banco diretamente da mesma forma, ou precisam de lógica extra)
  resetToDefaults: () => {
    console.warn('resetToDefaults: Esta ação não afeta o banco de dados diretamente na nova versão. Use setup_full_db.sql para resetar o banco.');
  },
  exportConfig: () => {
    const state = get();
    return JSON.stringify({
      tiposAtividade: state.tiposAtividade,
      condicoesClimaticas: state.condicoesClimaticas,
      tiposOcorrencia: state.tiposOcorrencia,
      funcoesCargos: state.funcoesCargos,
      tiposEquipamento: state.tiposEquipamento,
      materiais: state.materiais
    }, null, 2);
  },
  importConfig: () => {
    console.warn('importConfig: Importação em massa ainda não implementada para o banco.');
    alert('Importação em massa desativada temporariamente na versão com Banco de Dados.');
  }
}));

// Hooks (mantidos para compatibilidade com componentes existentes)
export const useTiposAtividade = () => {
  const store = useConfigStore();
  return {
    items: store.tiposAtividade.filter(item => item.ativo),
    allItems: store.tiposAtividade,
    add: store.addTipoAtividade,
    update: store.updateTipoAtividade,
    delete: store.deleteTipoAtividade,
    reorder: store.reorderTiposAtividade
  };
};

export const useCondicoesClimaticas = () => {
  const store = useConfigStore();
  return {
    items: store.condicoesClimaticas.filter(item => item.ativo),
    allItems: store.condicoesClimaticas,
    add: store.addCondicaoClimatica,
    update: store.updateCondicaoClimatica,
    delete: store.deleteCondicaoClimatica,
    reorder: store.reorderCondicoesClimaticas
  };
};

export const useTiposOcorrencia = () => {
  const store = useConfigStore();
  return {
    items: store.tiposOcorrencia.filter(item => item.ativo),
    allItems: store.tiposOcorrencia,
    add: store.addTipoOcorrencia,
    update: store.updateTipoOcorrencia,
    delete: store.deleteTipoOcorrencia,
    reorder: store.reorderTiposOcorrencia
  };
};

export const useFuncoesCargos = () => {
  const store = useConfigStore();
  return {
    items: store.funcoesCargos.filter(item => item.ativo),
    allItems: store.funcoesCargos,
    add: store.addFuncaoCargo,
    update: store.updateFuncaoCargo,
    delete: store.deleteFuncaoCargo,
    reorder: store.reorderFuncoesCargos
  };
};

export const useTiposEquipamento = () => {
  const store = useConfigStore();
  return {
    items: store.tiposEquipamento.filter(item => item.ativo),
    allItems: store.tiposEquipamento,
    add: store.addTipoEquipamento,
    update: store.updateTipoEquipamento,
    delete: store.deleteTipoEquipamento,
    reorder: store.reorderTiposEquipamento
  };
};

export const useMateriais = () => {
  const store = useConfigStore();
  return {
    items: store.materiais.filter(item => item.ativo),
    allItems: store.materiais,
    add: store.addMaterial,
    update: store.updateMaterial,
    delete: store.deleteMaterial,
    reorder: store.reorderMateriais
  };
};