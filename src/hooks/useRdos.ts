import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '../lib/supabase'
import type { RDOCompleto } from '../types/database.types'

type RDO = Tables<'rdos'>
type RDOInsert = TablesInsert<'rdos'>
type RDOUpdate = TablesUpdate<'rdos'>

export const useRdos = () => {
  const [rdos, setRdos] = useState<RDO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar todos os RDOs
  const fetchRdos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('rdos')
        .select('*')
        .order('data', { ascending: false })
      
      if (error) throw error
      
      setRdos(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar RDOs')
    } finally {
      setLoading(false)
    }
  }

  // Buscar RDO por ID
  const getRdoById = async (id: string): Promise<RDO | null> => {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      console.error('Erro ao buscar RDO:', err)
      return null
    }
  }

  // Buscar RDO completo com todos os relacionamentos
  const getRdoCompleto = async (id: string): Promise<RDOCompleto | null> => {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .select(`
          *,
          obras(
            id,
            nome,
            endereco,
            cliente
          ),
          usuarios(
            id,
            nome,
            email,
            cargo
          ),
          rdo_funcionarios(
            id,
            nome,
            funcao,
            horas_trabalhadas,
            observacoes
          ),
          rdo_equipamentos(
            id,
            nome,
            tipo,
            horas_utilizadas,
            observacoes
          ),
          rdo_materiais(
            id,
            nome,
            unidade,
            quantidade_utilizada,
            observacoes
          ),
          rdo_servicos(
            id,
            descricao,
            unidade,
            quantidade_executada,
            observacoes
          ),
          rdo_fotos(
            id,
            url,
            descricao,
            ordem
          ),
          rdo_anexos(
            id,
            nome,
            url,
            tipo,
            tamanho
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as RDOCompleto
    } catch (err) {
      console.error('Erro ao buscar RDO completo:', err)
      return null
    }
  }

  // Criar novo RDO
  const createRdo = async (rdo: RDOInsert): Promise<RDO | null> => {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .insert(rdo)
        .select()
        .single()
      
      if (error) throw error
      
      // Atualizar lista local
      if (data) {
        setRdos(prev => [data, ...prev])
      }
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar RDO')
      return null
    }
  }

  // Atualizar RDO
  const updateRdo = async (id: string, updates: RDOUpdate): Promise<RDO | null> => {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      // Atualizar lista local
      if (data) {
        setRdos(prev => prev.map(r => r.id === id ? data : r))
      }
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar RDO')
      return null
    }
  }

  // Deletar RDO
  const deleteRdo = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('rdos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Remover da lista local
      setRdos(prev => prev.filter(r => r.id !== id))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar RDO')
      return false
    }
  }

  // Buscar RDOs por obra
  const getRdosByObra = async (obraId: string): Promise<RDO[]> => {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .select('*')
        .eq('obra_id', obraId)
        .order('data', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erro ao buscar RDOs da obra:', err)
      return []
    }
  }

  // Buscar RDOs por status
  const getRdosByStatus = async (status: string): Promise<RDO[]> => {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .select('*')
        .eq('status', status)
        .order('data', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erro ao buscar RDOs por status:', err)
      return []
    }
  }

  // Buscar RDOs por usuário
  const getRdosByUsuario = async (usuarioId: string): Promise<RDO[]> => {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .select('*')
        .eq('usuario_id', usuarioId)
        .order('data', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erro ao buscar RDOs do usuário:', err)
      return []
    }
  }

  // Buscar RDOs por período
  const getRdosByPeriodo = async (dataInicio: string, dataFim: string): Promise<RDO[]> => {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .select('*')
        .gte('data', dataInicio)
        .lte('data', dataFim)
        .order('data', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erro ao buscar RDOs por período:', err)
      return []
    }
  }

  // Gerar próximo número de RDO para uma obra
  const getProximoNumero = async (obraId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .select('numero')
        .eq('obra_id', obraId)
        .order('numero', { ascending: false })
        .limit(1)
      
      if (error) throw error
      
      const ultimoNumero = data && data.length > 0 ? data[0].numero : 0
      return ultimoNumero + 1
    } catch (err) {
      console.error('Erro ao gerar próximo número:', err)
      return 1
    }
  }

  // Enviar RDO (alterar status para enviado)
  const enviarRdo = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('rdos')
        .update({ 
          status: 'enviado',
          data_envio: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      // Atualizar lista local
      setRdos(prev => prev.map(r => 
        r.id === id 
          ? { ...r, status: 'enviado', data_envio: new Date().toISOString() }
          : r
      ))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar RDO')
      return false
    }
  }

  // Aprovar RDO
  const aprovarRdo = async (id: string, observacoes?: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('rdos')
        .update({ 
          status: 'aprovado',
          data_aprovacao: new Date().toISOString(),
          observacoes_aprovacao: observacoes
        })
        .eq('id', id)
      
      if (error) throw error
      
      // Atualizar lista local
      setRdos(prev => prev.map(r => 
        r.id === id 
          ? { 
              ...r, 
              status: 'aprovado', 
              data_aprovacao: new Date().toISOString(),
              observacoes_aprovacao: observacoes
            }
          : r
      ))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aprovar RDO')
      return false
    }
  }

  // Rejeitar RDO
  const rejeitarRdo = async (id: string, motivo: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('rdos')
        .update({ 
          status: 'rejeitado',
          data_rejeicao: new Date().toISOString(),
          motivo_rejeicao: motivo
        })
        .eq('id', id)
      
      if (error) throw error
      
      // Atualizar lista local
      setRdos(prev => prev.map(r => 
        r.id === id 
          ? { 
              ...r, 
              status: 'rejeitado', 
              data_rejeicao: new Date().toISOString(),
              motivo_rejeicao: motivo
            }
          : r
      ))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao rejeitar RDO')
      return false
    }
  }

  // Carregar RDOs na inicialização
  useEffect(() => {
    fetchRdos()
  }, [])

  // Configurar real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('rdos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rdos'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRdos(prev => [payload.new as RDO, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setRdos(prev => prev.map(r => 
              r.id === payload.new.id ? payload.new as RDO : r
            ))
          } else if (payload.eventType === 'DELETE') {
            setRdos(prev => prev.filter(r => r.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    rdos,
    loading,
    error,
    fetchRdos,
    getRdoById,
    getRdoCompleto,
    createRdo,
    updateRdo,
    deleteRdo,
    getRdosByObra,
    getRdosByStatus,
    getRdosByUsuario,
    getRdosByPeriodo,
    getProximoNumero,
    enviarRdo,
    aprovarRdo,
    rejeitarRdo,
    refetch: fetchRdos
  }
}

export default useRdos