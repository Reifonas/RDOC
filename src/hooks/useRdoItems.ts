import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '../lib/supabase'

type RdoFuncionario = Tables<'rdo_funcionarios'>
type RdoEquipamento = Tables<'rdo_equipamentos'>
type RdoMaterial = Tables<'rdo_materiais'>
type RdoServico = Tables<'rdo_servicos'>
type RdoFoto = Tables<'rdo_fotos'>
type RdoAnexo = Tables<'rdo_anexos'>

type RdoFuncionarioInsert = TablesInsert<'rdo_funcionarios'>
type RdoEquipamentoInsert = TablesInsert<'rdo_equipamentos'>
type RdoMaterialInsert = TablesInsert<'rdo_materiais'>
type RdoServicoInsert = TablesInsert<'rdo_servicos'>
type RdoFotoInsert = TablesInsert<'rdo_fotos'>
type RdoAnexoInsert = TablesInsert<'rdo_anexos'>

type RdoFuncionarioUpdate = TablesUpdate<'rdo_funcionarios'>
type RdoEquipamentoUpdate = TablesUpdate<'rdo_equipamentos'>
type RdoMaterialUpdate = TablesUpdate<'rdo_materiais'>
type RdoServicoUpdate = TablesUpdate<'rdo_servicos'>
type RdoFotoUpdate = TablesUpdate<'rdo_fotos'>
type RdoAnexoUpdate = TablesUpdate<'rdo_anexos'>

export const useRdoItems = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ========== FUNCIONÁRIOS ==========
  
  const getFuncionariosByRdo = async (rdoId: string): Promise<RdoFuncionario[]> => {
    try {
      const { data, error } = await supabase
        .from('rdo_funcionarios')
        .select('*')
        .eq('rdo_id', rdoId)
        .order('nome')
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erro ao buscar funcionários do RDO:', err)
      return []
    }
  }

  const createFuncionario = async (funcionario: RdoFuncionarioInsert): Promise<RdoFuncionario | null> => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rdo_funcionarios')
        .insert(funcionario)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar funcionário')
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateFuncionario = async (id: string, updates: RdoFuncionarioUpdate): Promise<RdoFuncionario | null> => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rdo_funcionarios')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar funcionário')
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteFuncionario = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('rdo_funcionarios')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar funcionário')
      return false
    } finally {
      setLoading(false)
    }
  }

  // ========== EQUIPAMENTOS ==========
  
  const getEquipamentosByRdo = async (rdoId: string): Promise<RdoEquipamento[]> => {
    try {
      const { data, error } = await supabase
        .from('rdo_equipamentos')
        .select('*')
        .eq('rdo_id', rdoId)
        .order('nome')
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erro ao buscar equipamentos do RDO:', err)
      return []
    }
  }

  const createEquipamento = async (equipamento: RdoEquipamentoInsert): Promise<RdoEquipamento | null> => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rdo_equipamentos')
        .insert(equipamento)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar equipamento')
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateEquipamento = async (id: string, updates: RdoEquipamentoUpdate): Promise<RdoEquipamento | null> => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rdo_equipamentos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar equipamento')
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteEquipamento = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('rdo_equipamentos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar equipamento')
      return false
    } finally {
      setLoading(false)
    }
  }

  // ========== MATERIAIS ==========
  
  const getMateriaisByRdo = async (rdoId: string): Promise<RdoMaterial[]> => {
    try {
      const { data, error } = await supabase
        .from('rdo_materiais')
        .select('*')
        .eq('rdo_id', rdoId)
        .order('nome')
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erro ao buscar materiais do RDO:', err)
      return []
    }
  }

  const createMaterial = async (material: RdoMaterialInsert): Promise<RdoMaterial | null> => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rdo_materiais')
        .insert(material)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar material')
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateMaterial = async (id: string, updates: RdoMaterialUpdate): Promise<RdoMaterial | null> => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rdo_materiais')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar material')
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteMaterial = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('rdo_materiais')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar material')
      return false
    } finally {
      setLoading(false)
    }
  }

  // ========== SERVIÇOS ==========
  
  const getServicosByRdo = async (rdoId: string): Promise<RdoServico[]> => {
    try {
      const { data, error } = await supabase
        .from('rdo_servicos')
        .select('*')
        .eq('rdo_id', rdoId)
        .order('descricao')
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erro ao buscar serviços do RDO:', err)
      return []
    }
  }

  const createServico = async (servico: RdoServicoInsert): Promise<RdoServico | null> => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rdo_servicos')
        .insert(servico)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar serviço')
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateServico = async (id: string, updates: RdoServicoUpdate): Promise<RdoServico | null> => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rdo_servicos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar serviço')
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteServico = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('rdo_servicos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar serviço')
      return false
    } finally {
      setLoading(false)
    }
  }

  // ========== FOTOS ==========
  
  const getFotosByRdo = async (rdoId: string): Promise<RdoFoto[]> => {
    try {
      const { data, error } = await supabase
        .from('rdo_fotos')
        .select('*')
        .eq('rdo_id', rdoId)
        .order('ordem')
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erro ao buscar fotos do RDO:', err)
      return []
    }
  }

  const createFoto = async (foto: RdoFotoInsert): Promise<RdoFoto | null> => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rdo_fotos')
        .insert(foto)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar foto')
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateFoto = async (id: string, updates: RdoFotoUpdate): Promise<RdoFoto | null> => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rdo_fotos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar foto')
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteFoto = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('rdo_fotos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar foto')
      return false
    } finally {
      setLoading(false)
    }
  }

  // ========== ANEXOS ==========
  
  const getAnexosByRdo = async (rdoId: string): Promise<RdoAnexo[]> => {
    try {
      const { data, error } = await supabase
        .from('rdo_anexos')
        .select('*')
        .eq('rdo_id', rdoId)
        .order('nome')
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erro ao buscar anexos do RDO:', err)
      return []
    }
  }

  const createAnexo = async (anexo: RdoAnexoInsert): Promise<RdoAnexo | null> => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rdo_anexos')
        .insert(anexo)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar anexo')
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateAnexo = async (id: string, updates: RdoAnexoUpdate): Promise<RdoAnexo | null> => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rdo_anexos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar anexo')
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteAnexo = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('rdo_anexos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar anexo')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    
    // Funcionários
    getFuncionariosByRdo,
    createFuncionario,
    updateFuncionario,
    deleteFuncionario,
    
    // Equipamentos
    getEquipamentosByRdo,
    createEquipamento,
    updateEquipamento,
    deleteEquipamento,
    
    // Materiais
    getMateriaisByRdo,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    
    // Serviços
    getServicosByRdo,
    createServico,
    updateServico,
    deleteServico,
    
    // Fotos
    getFotosByRdo,
    createFoto,
    updateFoto,
    deleteFoto,
    
    // Anexos
    getAnexosByRdo,
    createAnexo,
    updateAnexo,
    deleteAnexo
  }
}

export default useRdoItems