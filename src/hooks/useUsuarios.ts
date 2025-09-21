import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '../lib/supabase'

type Usuario = Tables<'usuarios'>
type UsuarioInsert = TablesInsert<'usuarios'>
type UsuarioUpdate = TablesUpdate<'usuarios'>

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar todos os usuários
  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nome')
      
      if (error) throw error
      
      setUsuarios(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar usuários')
    } finally {
      setLoading(false)
    }
  }

  // Buscar usuário por ID
  const getUsuarioById = async (id: string): Promise<Usuario | null> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      console.error('Erro ao buscar usuário:', err)
      return null
    }
  }

  // Criar novo usuário
  const createUsuario = async (usuario: UsuarioInsert): Promise<Usuario | null> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert(usuario)
        .select()
        .single()
      
      if (error) throw error
      
      // Atualizar lista local
      if (data) {
        setUsuarios(prev => [...prev, data])
      }
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário')
      return null
    }
  }

  // Atualizar usuário
  const updateUsuario = async (id: string, updates: UsuarioUpdate): Promise<Usuario | null> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      // Atualizar lista local
      if (data) {
        setUsuarios(prev => prev.map(u => u.id === id ? data : u))
      }
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário')
      return null
    }
  }

  // Deletar usuário
  const deleteUsuario = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Remover da lista local
      setUsuarios(prev => prev.filter(u => u.id !== id))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar usuário')
      return false
    }
  }

  // Buscar usuários por obra
  const getUsuariosByObra = async (obraId: string): Promise<Usuario[]> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          obra_usuarios!inner(
            obra_id
          )
        `)
        .eq('obra_usuarios.obra_id', obraId)
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erro ao buscar usuários da obra:', err)
      return []
    }
  }

  // Buscar usuários por role
  const getUsuariosByRole = async (role: string): Promise<Usuario[]> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('role', role)
        .order('nome')
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erro ao buscar usuários por role:', err)
      return []
    }
  }

  // Verificar se usuário tem permissão em obra
  const hasPermissionInObra = async (usuarioId: string, obraId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('obra_usuarios')
        .select('id')
        .eq('usuario_id', usuarioId)
        .eq('obra_id', obraId)
        .single()
      
      return !error && !!data
    } catch (err) {
      return false
    }
  }

  // Carregar usuários na inicialização
  useEffect(() => {
    fetchUsuarios()
  }, [])

  // Configurar real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('usuarios-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'usuarios'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setUsuarios(prev => [...prev, payload.new as Usuario])
          } else if (payload.eventType === 'UPDATE') {
            setUsuarios(prev => prev.map(u => 
              u.id === payload.new.id ? payload.new as Usuario : u
            ))
          } else if (payload.eventType === 'DELETE') {
            setUsuarios(prev => prev.filter(u => u.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    usuarios,
    loading,
    error,
    fetchUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    getUsuariosByObra,
    getUsuariosByRole,
    hasPermissionInObra,
    refetch: fetchUsuarios
  }
}

export default useUsuarios