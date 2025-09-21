import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ConfigItem {
  id: string;
  nome: string;
  ativo: boolean;
  ordem: number;
  cor?: string;
  icone?: string;
}

export interface CondicaoClimatica extends ConfigItem {
  valor: string;
  descricao?: string;
}

interface ConfigState {
  // Tipos de Atividades
  tiposAtividade: ConfigItem[];
  addTipoAtividade: (item: Omit<ConfigItem, 'id'>) => void;
  updateTipoAtividade: (id: string, item: Partial<ConfigItem>) => void;
  deleteTipoAtividade: (id: string) => void;
  reorderTiposAtividade: (items: ConfigItem[]) => void;

  // Condições Climáticas
  condicoesClimaticas: CondicaoClimatica[];
  addCondicaoClimatica: (item: Omit<CondicaoClimatica, 'id'>) => void;
  updateCondicaoClimatica: (id: string, item: Partial<CondicaoClimatica>) => void;
  deleteCondicaoClimatica: (id: string) => void;
  reorderCondicoesClimaticas: (items: CondicaoClimatica[]) => void;

  // Tipos de Ocorrências
  tiposOcorrencia: ConfigItem[];
  addTipoOcorrencia: (item: Omit<ConfigItem, 'id'>) => void;
  updateTipoOcorrencia: (id: string, item: Partial<ConfigItem>) => void;
  deleteTipoOcorrencia: (id: string) => void;
  reorderTiposOcorrencia: (items: ConfigItem[]) => void;

  // Funções/Cargos
  funcoesCargos: ConfigItem[];
  addFuncaoCargo: (item: Omit<ConfigItem, 'id'>) => void;
  updateFuncaoCargo: (id: string, item: Partial<ConfigItem>) => void;
  deleteFuncaoCargo: (id: string) => void;
  reorderFuncoesCargos: (items: ConfigItem[]) => void;

  // Tipos de Equipamentos
  tiposEquipamento: ConfigItem[];
  addTipoEquipamento: (item: Omit<ConfigItem, 'id'>) => void;
  updateTipoEquipamento: (id: string, item: Partial<ConfigItem>) => void;
  deleteTipoEquipamento: (id: string) => void;
  reorderTiposEquipamento: (items: ConfigItem[]) => void;

  // Materiais
  materiais: ConfigItem[];
  addMaterial: (item: Omit<ConfigItem, 'id'>) => void;
  updateMaterial: (id: string, item: Partial<ConfigItem>) => void;
  deleteMaterial: (id: string) => void;
  reorderMateriais: (items: ConfigItem[]) => void;

  // Funções utilitárias
  resetToDefaults: () => void;
  exportConfig: () => string;
  importConfig: (config: string) => void;
}

// Dados padrão baseados no que foi encontrado no código
const defaultTiposAtividade: ConfigItem[] = [
  { id: '1', nome: 'Escavação', ativo: true, ordem: 1 },
  { id: '2', nome: 'Fundação', ativo: true, ordem: 2 },
  { id: '3', nome: 'Concretagem', ativo: true, ordem: 3 },
  { id: '4', nome: 'Alvenaria', ativo: true, ordem: 4 },
  { id: '5', nome: 'Instalação Elétrica', ativo: true, ordem: 5 },
  { id: '6', nome: 'Instalação Hidráulica', ativo: true, ordem: 6 },
  { id: '7', nome: 'Revestimento', ativo: true, ordem: 7 },
  { id: '8', nome: 'Pintura', ativo: true, ordem: 8 }
];

const defaultCondicoesClimaticas: CondicaoClimatica[] = [
  { id: '1', nome: 'Ensolarado', valor: 'ensolarado', ativo: true, ordem: 1, icone: 'Sun' },
  { id: '2', nome: 'Parcialmente Nublado', valor: 'parcialmente_nublado', ativo: true, ordem: 2, icone: 'Cloud' },
  { id: '3', nome: 'Nublado', valor: 'nublado', ativo: true, ordem: 3, icone: 'Cloud' },
  { id: '4', nome: 'Chuvisco', valor: 'chuvisco', ativo: true, ordem: 4, icone: 'CloudRain' },
  { id: '5', nome: 'Chuva Leve', valor: 'chuva_leve', ativo: true, ordem: 5, icone: 'CloudRain' },
  { id: '6', nome: 'Chuva Forte', valor: 'chuva_forte', ativo: true, ordem: 6, icone: 'CloudRain' }
];

const defaultTiposOcorrencia: ConfigItem[] = [
  { id: '1', nome: 'Acidente de Trabalho', ativo: true, ordem: 1, cor: '#ef4444' },
  { id: '2', nome: 'Atraso na Entrega', ativo: true, ordem: 2, cor: '#f59e0b' },
  { id: '3', nome: 'Problema de Qualidade', ativo: true, ordem: 3, cor: '#f59e0b' },
  { id: '4', nome: 'Falta de Material', ativo: true, ordem: 4, cor: '#f59e0b' },
  { id: '5', nome: 'Problema Climático', ativo: true, ordem: 5, cor: '#6b7280' },
  { id: '6', nome: 'Equipamento Quebrado', ativo: true, ordem: 6, cor: '#ef4444' },
  { id: '7', nome: 'Outros', ativo: true, ordem: 7, cor: '#6b7280' }
];

const defaultFuncoesCargos: ConfigItem[] = [
  { id: '1', nome: 'Pedreiro', ativo: true, ordem: 1 },
  { id: '2', nome: 'Servente', ativo: true, ordem: 2 },
  { id: '3', nome: 'Armador', ativo: true, ordem: 3 },
  { id: '4', nome: 'Encarregado', ativo: true, ordem: 4 },
  { id: '5', nome: 'Mestre de Obras', ativo: true, ordem: 5 },
  { id: '6', nome: 'Engenheiro Civil', ativo: true, ordem: 6 },
  { id: '7', nome: 'Arquiteto', ativo: true, ordem: 7 },
  { id: '8', nome: 'Eletricista', ativo: true, ordem: 8 },
  { id: '9', nome: 'Encanador', ativo: true, ordem: 9 },
  { id: '10', nome: 'Pintor', ativo: true, ordem: 10 }
];

const defaultTiposEquipamento: ConfigItem[] = [
  { id: '1', nome: 'Betoneira', ativo: true, ordem: 1 },
  { id: '2', nome: 'Guindaste', ativo: true, ordem: 2 },
  { id: '3', nome: 'Escavadeira', ativo: true, ordem: 3 },
  { id: '4', nome: 'Guincho de Coluna', ativo: true, ordem: 4 },
  { id: '5', nome: 'Compactador', ativo: true, ordem: 5 },
  { id: '6', nome: 'Furadeira', ativo: true, ordem: 6 },
  { id: '7', nome: 'Serra Circular', ativo: true, ordem: 7 },
  { id: '8', nome: 'Andaime', ativo: true, ordem: 8 }
];

const defaultMateriais: ConfigItem[] = [
  { id: '1', nome: 'Cimento', ativo: true, ordem: 1 },
  { id: '2', nome: 'Areia', ativo: true, ordem: 2 },
  { id: '3', nome: 'Brita', ativo: true, ordem: 3 },
  { id: '4', nome: 'Ferro/Aço', ativo: true, ordem: 4 },
  { id: '5', nome: 'Tijolo', ativo: true, ordem: 5 },
  { id: '6', nome: 'Bloco de Concreto', ativo: true, ordem: 6 },
  { id: '7', nome: 'Madeira', ativo: true, ordem: 7 },
  { id: '8', nome: 'Tinta', ativo: true, ordem: 8 },
  { id: '9', nome: 'Argamassa', ativo: true, ordem: 9 },
  { id: '10', nome: 'Cerâmica', ativo: true, ordem: 10 }
];

// Funções auxiliares
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const createCRUDActions = <T extends ConfigItem>(key: keyof ConfigState) => ({
  [`add${key.toString().charAt(0).toUpperCase() + key.toString().slice(1, -1)}`]: (item: Omit<T, 'id'>) => (state: ConfigState) => {
    const newItem = { ...item, id: generateId() } as T;
    const items = state[key] as T[];
    return {
      [key]: [...items, newItem].sort((a, b) => a.ordem - b.ordem)
    };
  },
  [`update${key.toString().charAt(0).toUpperCase() + key.toString().slice(1, -1)}`]: (id: string, updates: Partial<T>) => (state: ConfigState) => {
    const items = state[key] as T[];
    return {
      [key]: items.map(item => item.id === id ? { ...item, ...updates } : item)
    };
  },
  [`delete${key.toString().charAt(0).toUpperCase() + key.toString().slice(1, -1)}`]: (id: string) => (state: ConfigState) => {
    const items = state[key] as T[];
    return {
      [key]: items.filter(item => item.id !== id)
    };
  },
  [`reorder${key.toString().charAt(0).toUpperCase() + key.toString().slice(1)}`]: (newItems: T[]) => () => ({
    [key]: newItems
  })
});

export const useConfigStore = create<ConfigState>()(persist<ConfigState>(
  (set, get) => ({
    // Estados iniciais
    tiposAtividade: defaultTiposAtividade,
    condicoesClimaticas: defaultCondicoesClimaticas,
    tiposOcorrencia: defaultTiposOcorrencia,
    funcoesCargos: defaultFuncoesCargos,
    tiposEquipamento: defaultTiposEquipamento,
    materiais: defaultMateriais,

    // CRUD para Tipos de Atividade
    addTipoAtividade: (item) => set((state) => ({
      tiposAtividade: [...state.tiposAtividade, { ...item, id: generateId() }].sort((a, b) => a.ordem - b.ordem)
    })),
    updateTipoAtividade: (id, updates) => set((state) => ({
      tiposAtividade: state.tiposAtividade.map(item => item.id === id ? { ...item, ...updates } : item)
    })),
    deleteTipoAtividade: (id) => set((state) => ({
      tiposAtividade: state.tiposAtividade.filter(item => item.id !== id)
    })),
    reorderTiposAtividade: (items) => set(() => ({ tiposAtividade: items })),

    // CRUD para Condições Climáticas
    addCondicaoClimatica: (item) => set((state) => ({
      condicoesClimaticas: [...state.condicoesClimaticas, { ...item, id: generateId() }].sort((a, b) => a.ordem - b.ordem)
    })),
    updateCondicaoClimatica: (id, updates) => set((state) => ({
      condicoesClimaticas: state.condicoesClimaticas.map(item => item.id === id ? { ...item, ...updates } : item)
    })),
    deleteCondicaoClimatica: (id) => set((state) => ({
      condicoesClimaticas: state.condicoesClimaticas.filter(item => item.id !== id)
    })),
    reorderCondicoesClimaticas: (items) => set(() => ({ condicoesClimaticas: items })),

    // CRUD para Tipos de Ocorrência
    addTipoOcorrencia: (item) => set((state) => ({
      tiposOcorrencia: [...state.tiposOcorrencia, { ...item, id: generateId() }].sort((a, b) => a.ordem - b.ordem)
    })),
    updateTipoOcorrencia: (id, updates) => set((state) => ({
      tiposOcorrencia: state.tiposOcorrencia.map(item => item.id === id ? { ...item, ...updates } : item)
    })),
    deleteTipoOcorrencia: (id) => set((state) => ({
      tiposOcorrencia: state.tiposOcorrencia.filter(item => item.id !== id)
    })),
    reorderTiposOcorrencia: (items) => set(() => ({ tiposOcorrencia: items })),

    // CRUD para Funções/Cargos
    addFuncaoCargo: (item) => set((state) => ({
      funcoesCargos: [...state.funcoesCargos, { ...item, id: generateId() }].sort((a, b) => a.ordem - b.ordem)
    })),
    updateFuncaoCargo: (id, updates) => set((state) => ({
      funcoesCargos: state.funcoesCargos.map(item => item.id === id ? { ...item, ...updates } : item)
    })),
    deleteFuncaoCargo: (id) => set((state) => ({
      funcoesCargos: state.funcoesCargos.filter(item => item.id !== id)
    })),
    reorderFuncoesCargos: (items) => set(() => ({ funcoesCargos: items })),

    // CRUD para Tipos de Equipamento
    addTipoEquipamento: (item) => set((state) => ({
      tiposEquipamento: [...state.tiposEquipamento, { ...item, id: generateId() }].sort((a, b) => a.ordem - b.ordem)
    })),
    updateTipoEquipamento: (id, updates) => set((state) => ({
      tiposEquipamento: state.tiposEquipamento.map(item => item.id === id ? { ...item, ...updates } : item)
    })),
    deleteTipoEquipamento: (id) => set((state) => ({
      tiposEquipamento: state.tiposEquipamento.filter(item => item.id !== id)
    })),
    reorderTiposEquipamento: (items) => set(() => ({ tiposEquipamento: items })),

    // CRUD para Materiais
    addMaterial: (item) => set((state) => ({
      materiais: [...state.materiais, { ...item, id: generateId() }].sort((a, b) => a.ordem - b.ordem)
    })),
    updateMaterial: (id, updates) => set((state) => ({
      materiais: state.materiais.map(item => item.id === id ? { ...item, ...updates } : item)
    })),
    deleteMaterial: (id) => set((state) => ({
      materiais: state.materiais.filter(item => item.id !== id)
    })),
    reorderMateriais: (items) => set(() => ({ materiais: items })),

    // Funções utilitárias
    resetToDefaults: () => set(() => ({
      tiposAtividade: defaultTiposAtividade,
      condicoesClimaticas: defaultCondicoesClimaticas,
      tiposOcorrencia: defaultTiposOcorrencia,
      funcoesCargos: defaultFuncoesCargos,
      tiposEquipamento: defaultTiposEquipamento,
      materiais: defaultMateriais
    })),

    exportConfig: () => {
      const state = useConfigStore.getState();
      return JSON.stringify({
        tiposAtividade: state.tiposAtividade,
        condicoesClimaticas: state.condicoesClimaticas,
        tiposOcorrencia: state.tiposOcorrencia,
        funcoesCargos: state.funcoesCargos,
        tiposEquipamento: state.tiposEquipamento,
        materiais: state.materiais
      }, null, 2);
    },

    importConfig: (configString) => {
      try {
        const config = JSON.parse(configString);
        set(() => ({
          tiposAtividade: config.tiposAtividade || defaultTiposAtividade,
          condicoesClimaticas: config.condicoesClimaticas || defaultCondicoesClimaticas,
          tiposOcorrencia: config.tiposOcorrencia || defaultTiposOcorrencia,
          funcoesCargos: config.funcoesCargos || defaultFuncoesCargos,
          tiposEquipamento: config.tiposEquipamento || defaultTiposEquipamento,
          materiais: config.materiais || defaultMateriais
        }));
      } catch (error) {
        console.error('Erro ao importar configurações:', error);
      }
    }
  }),
  {
    name: 'rdo-config-storage',
    version: 1
  }
));

// Hooks personalizados para facilitar o uso
export const useTiposAtividade = () => {
  const { tiposAtividade, addTipoAtividade, updateTipoAtividade, deleteTipoAtividade, reorderTiposAtividade } = useConfigStore();
  return {
    items: tiposAtividade.filter(item => item.ativo),
    allItems: tiposAtividade,
    add: addTipoAtividade,
    update: updateTipoAtividade,
    delete: deleteTipoAtividade,
    reorder: reorderTiposAtividade
  };
};

export const useCondicoesClimaticas = () => {
  const { condicoesClimaticas, addCondicaoClimatica, updateCondicaoClimatica, deleteCondicaoClimatica, reorderCondicoesClimaticas } = useConfigStore();
  return {
    items: condicoesClimaticas.filter(item => item.ativo),
    allItems: condicoesClimaticas,
    add: addCondicaoClimatica,
    update: updateCondicaoClimatica,
    delete: deleteCondicaoClimatica,
    reorder: reorderCondicoesClimaticas
  };
};

export const useTiposOcorrencia = () => {
  const { tiposOcorrencia, addTipoOcorrencia, updateTipoOcorrencia, deleteTipoOcorrencia, reorderTiposOcorrencia } = useConfigStore();
  return {
    items: tiposOcorrencia.filter(item => item.ativo),
    allItems: tiposOcorrencia,
    add: addTipoOcorrencia,
    update: updateTipoOcorrencia,
    delete: deleteTipoOcorrencia,
    reorder: reorderTiposOcorrencia
  };
};

export const useFuncoesCargos = () => {
  const { funcoesCargos, addFuncaoCargo, updateFuncaoCargo, deleteFuncaoCargo, reorderFuncoesCargos } = useConfigStore();
  return {
    items: funcoesCargos.filter(item => item.ativo),
    allItems: funcoesCargos,
    add: addFuncaoCargo,
    update: updateFuncaoCargo,
    delete: deleteFuncaoCargo,
    reorder: reorderFuncoesCargos
  };
};

export const useTiposEquipamento = () => {
  const { tiposEquipamento, addTipoEquipamento, updateTipoEquipamento, deleteTipoEquipamento, reorderTiposEquipamento } = useConfigStore();
  return {
    items: tiposEquipamento.filter(item => item.ativo),
    allItems: tiposEquipamento,
    add: addTipoEquipamento,
    update: updateTipoEquipamento,
    delete: deleteTipoEquipamento,
    reorder: reorderTiposEquipamento
  };
};

export const useMateriais = () => {
  const { materiais, addMaterial, updateMaterial, deleteMaterial, reorderMateriais } = useConfigStore();
  return {
    items: materiais.filter(item => item.ativo),
    allItems: materiais,
    add: addMaterial,
    update: updateMaterial,
    delete: deleteMaterial,
    reorder: reorderMateriais
  };
};