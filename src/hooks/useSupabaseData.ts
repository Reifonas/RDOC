import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useConfigStore } from '../stores/configStore';
import type { ConfigItem, CondicaoClimatica } from '../stores/configStore';

/**
 * Hook para carregar dados do Supabase e sincronizar com as stores locais
 */
export const useSupabaseData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const configStore = useConfigStore();

  // Carregar tipos de atividade do Supabase
  const loadTiposAtividade = async () => {
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
      const tiposAtividade: ConfigItem[] = data?.map((item, index) => ({
        id: item.id.toString(),
        nome: item.nome,
        ativo: item.ativo,
        ordem: index + 1
      })) || [];

      // Atualizar store com dados do Supabase
      configStore.tiposAtividade = tiposAtividade;
      console.log('📊 Store atualizada com tipos de atividade:', tiposAtividade);
      
      return tiposAtividade;
    } catch (err) {
      console.error('❌ Erro ao carregar tipos de atividade:', err);
      throw err;
    }
  };

  // Carregar condições climáticas do Supabase
  const loadCondicoesClimaticas = async () => {
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
      const condicoesClimaticas: CondicaoClimatica[] = data?.map((item, index) => ({
        id: item.id.toString(),
        nome: item.nome,
        valor: item.valor || item.nome.toLowerCase().replace(/\s+/g, '_'),
        ativo: item.ativo,
        ordem: index + 1,
        descricao: item.descricao
      })) || [];

      // Atualizar store com dados do Supabase
      configStore.condicoesClimaticas = condicoesClimaticas;
      console.log('📊 Store atualizada com condições climáticas:', condicoesClimaticas);
      
      return condicoesClimaticas;
    } catch (err) {
      console.error('❌ Erro ao carregar condições climáticas:', err);
      throw err;
    }
  };

  // Carregar funcionários do Supabase
  const loadFuncionarios = async () => {
    try {
      console.log('🔄 Carregando funcionários do Supabase...');
      const { data, error } = await supabase
        .from('funcionarios')
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
  };

  // Função principal para carregar todos os dados
  const loadAllData = async () => {
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
  };

  // Carregar dados automaticamente quando o hook é usado
  useEffect(() => {
    loadAllData();
  }, []);

  return {
    loading,
    error,
    loadAllData,
    loadTiposAtividade,
    loadCondicoesClimaticas,
    loadFuncionarios
  };
};