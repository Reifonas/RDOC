import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '../lib/supabase'

type Obra = Tables<'obras'>
type ObraInsert = TablesInsert<'obras'>
type ObraUpdate = TablesUpdate<'obras'>

export const useObras = () => {
  const [obras, setObras] = useState<Obra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar todas as obras
  const fetchObras = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .order('nome')
      
      if (error) throw error
      
      setObras(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar obras')
    } finally {
      setLoading(false)
    }
  }

  // Buscar obra por ID
  const getObraById = async (id: string): Promise<Obra | null> => {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      console.error('Erro ao buscar obra:', err)
      return null
    }
  }

  // Buscar obras com detalhes completos
  const getObrasWithDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select(`
          *,
          obra_usuarios(
            id,
            usuario_id,
            usuarios(
              id,
              nome,
              email,
              role
            )
          ),
          rdos(
            id,
            numero,
            data,
            status
          )
        `)
        .order('nome')
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erro ao buscar obras com detalhes:', err)
      return []
    }
  }

  // Criar nova obra
  const createObra = async (obra: ObraInsert): Promise<Obra | null> => {
    try {
      const { data, error } = await supabase
        .from('obras')
        .insert(obra)
        .select()
        .single()
      
      if (error) throw error
      
      // Atualizar lista local
      if (data) {
        setObras(prev => [...prev, data])
      }
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar obra')
      return null
    }
  }

  // Atualizar obra
  const updateObra = async (id: string, updates: ObraUpdate): Promise<Obra | null> => {
    try {
      const { data, error } = await supabase
        .from('obras')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      // Atualizar lista local
      if (data) {
        setObras(prev => prev.map(o => o.id === id ? data : o))
      }
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar obra')
      return null
    }
  }

  // Deletar obra
  const deleteObra = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('obras')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Remover da lista local
      setObras(prev => prev.filter(o => o.id !== id))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar obra')
      return false
    }
  }

  // Buscar obras por status
  const getObrasByStatus = async (status: string): Promise<Obra[]> => {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .eq('status', status)
        .order('nome')
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erro ao buscar obras por status:', err)
      return []
    }
  }

  // Buscar obras do usuário
  const getObrasByUsuario = async (usuarioId: string): Promise<Obra[]> => {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select(`
          *,
          obra_usuarios!inner(
            usuario_id
          )
        `)
        .eq('obra_usuarios.usuario_id', usuarioId)
        .order('nome')
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erro ao buscar obras do usuário:', err)
      return []
    }
  }

  // Adicionar usuário à obra
  const addUsuarioToObra = async (obraId: string, usuarioId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('obra_usuarios')
        .insert({
          obra_id: obraId,
          usuario_id: usuarioId
        })
      
      if (error) throw error
      return true
    } catch (err) {
      console.error('Erro ao adicionar usuário à obra:', err)
      return false
    }
  }

  // Remover usuário da obra
  const removeUsuarioFromObra = async (obraId: string, usuarioId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('obra_usuarios')
        .delete()
        .eq('obra_id', obraId)
        .eq('usuario_id', usuarioId)
      
      if (error) throw error
      return true
    } catch (err) {
      console.error('Erro ao remover usuário da obra:', err)
      return false
    }
  }

  // Obter estatísticas da obra
  const getObraStats = async (obraId: string) => {
    try {
      const [rdosResult, usuariosResult] = await Promise.all([
        supabase
          .from('rdos')
          .select('status')
          .eq('obra_id', obraId),
        supabase
          .from('obra_usuarios')
          .select('id')
          .eq('obra_id', obraId)
      ])

      const rdos = rdosResult.data || []
      const usuarios = usuariosResult.data || []

      const stats = {
        totalRdos: rdos.length,
        rdosRascunho: rdos.filter(r => r.status === 'rascunho').length,
        rdosEnviados: rdos.filter(r => r.status === 'enviado').length,
        rdosAprovados: rdos.filter(r => r.status === 'aprovado').length,
        rdosRejeitados: rdos.filter(r => r.status === 'rejeitado').length,
        totalUsuarios: usuarios.length
      }

      return stats
    } catch (err) {
      console.error('Erro ao obter estatísticas da obra:', err)
      return null
    }
  }

  // Carregar obras na inicialização
  useEffect(() => {
    fetchObras()
  }, [])

  // Configurar real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('obras-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'obras'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setObras(prev => [...prev, payload.new as Obra])
          } else if (payload.eventType === 'UPDATE') {
            setObras(prev => prev.map(o => 
              o.id === payload.new.id ? payload.new as Obra : o
            ))
          } else if (payload.eventType === 'DELETE') {
            setObras(prev => prev.filter(o => o.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    obras,
    loading,
    error,
    fetchObras,
    getObraById,
    getObrasWithDetails,
    createObra,
    updateObra,
    deleteObra,
    getObrasByStatus,
    getObrasByUsuario,
    addUsuarioToObra,
    removeUsuarioFromObra,
    getObraStats,
    refetch: fetchObras
  }
}

export default useObras