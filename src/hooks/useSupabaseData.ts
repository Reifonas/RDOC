import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
// import { useConfigStore } from '../stores/configStore';
// import type { ConfigItem, CondicaoClimatica } from '../stores/configStore';

/**
 * Hook para carregar dados do Supabase e sincronizar com as stores locais
 */
export const useSupabaseData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const configStore = useConfigStore();

  // Carregar tipos de atividade do Supabase
  const loadTiposAtividade = useCallback(async () => {
    try {
      console.log('🔄 Carregando tipos de atividade do Supabase...');
      const { data, error } = await supabase
        .from('tipos_atividade')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('❌ Erro ao carregar tipos de atividade:', error);
        throw error;
      }

      console.log('✅ Tipos de atividade carregados:', data);

      // Converter dados do Supabase para o formato da store
      // const tiposAtividade: ConfigItem[] = data?.map((item, index) => ({
      //   id: item.id.toString(),
      //   nome: item.nome,
      //   ativo: item.ativo,
      //   ordem: index + 1
      // })) || [];

      // Atualizar store com dados do Supabase
      // configStore.tiposAtividade = tiposAtividade;
      console.log('📊 Tipos de atividade carregados:', data);

      return data || [];
    } catch (err) {
      console.error('❌ Erro ao carregar tipos de atividade:', err);
      throw err;
    }
  }, []);

  // Carregar condições climáticas do Supabase
  const loadCondicoesClimaticas = useCallback(async () => {
    try {
      console.log('🔄 Carregando condições climáticas do Supabase...');
      const { data, error } = await supabase
        .from('condicoes_climaticas')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('❌ Erro ao carregar condições climáticas:', error);
        throw error;
      }

      console.log('✅ Condições climáticas carregadas:', data);

      // Converter dados do Supabase para o formato da store
      // const condicoesClimaticas: CondicaoClimatica[] = data?.map((item, index) => ({
      //   id: item.id.toString(),
      //   nome: item.nome,
      //   valor: item.valor || item.nome.toLowerCase().replace(/\s+/g, '_'),
      //   ativo: item.ativo,
      //   ordem: index + 1,
      //   descricao: item.descricao
      // })) || [];

      // Atualizar store com dados do Supabase
      // configStore.condicoesClimaticas = condicoesClimaticas;
      console.log('📊 Condições climáticas carregadas:', data);

      return data || [];
    } catch (err) {
      console.error('❌ Erro ao carregar condições climáticas:', err);
      throw err;
    }
  }, []);

  // Carregar funcionários do Supabase
  const loadFuncionarios = useCallback(async () => {
    try {
      console.log('🔄 Carregando funcionários do Supabase...');
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('❌ Erro ao carregar funcionários:', error);
        throw error;
      }

      console.log('✅ Funcionários carregados:', data);
      return data || [];
    } catch (err) {
      console.error('❌ Erro ao carregar funcionários:', err);
      throw err;
    }
  }, []);

  // Função principal para carregar todos os dados
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🚀 Iniciando carregamento de todos os dados do Supabase...');

      await Promise.all([
        loadTiposAtividade(),
        loadCondicoesClimaticas(),
        loadFuncionarios()
      ]);

      console.log('✅ Todos os dados carregados com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao carregar dados:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadTiposAtividade, loadCondicoesClimaticas, loadFuncionarios]);

  // Carregar dados automaticamente quando o hook é usado
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    loading,
    error,
    loadAllData,
    loadTiposAtividade,
    loadCondicoesClimaticas,
    loadFuncionarios
  };
};