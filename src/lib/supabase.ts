import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificar se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não estão definidas. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env')
}

// Cliente Supabase configurado
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'rdo-mobile-app'
    }
  }
})

// Tipos auxiliares para facilitar o uso
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Função para verificar se o usuário está autenticado
export const isAuthenticated = () => {
  return supabase.auth.getSession().then(({ data: { session } }) => {
    return !!session
  })
}

// Função para obter o usuário atual
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user || null
}

// Função para obter dados completos do usuário atual
export const getCurrentUserProfile = async () => {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Erro ao buscar perfil do usuário:', error)
    return null
  }

  return data
}

// Função para fazer logout
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Erro ao fazer logout:', error)
    throw error
  }
}

// Função para fazer login
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error('Erro ao fazer login:', error)
    throw error
  }

  return data
}

// Função para registrar novo usuário
export const signUp = async (email: string, password: string, userData: {
  nome: string
  telefone?: string
  cargo?: string
  role?: 'admin' | 'engenheiro' | 'mestre_obra' | 'usuario'
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })

  if (error) {
    console.error('Erro ao registrar usuário:', error)
    throw error
  }

  return data
}

// Função para resetar senha
export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })

  if (error) {
    console.error('Erro ao resetar senha:', error)
    throw error
  }
}

// Função para atualizar senha
export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    console.error('Erro ao atualizar senha:', error)
    throw error
  }
}

// Função para upload de arquivos
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Erro ao fazer upload:', error)
    throw error
  }

  return data
}

// Função para obter URL pública de arquivo
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

// Função para deletar arquivo
export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error('Erro ao deletar arquivo:', error)
    throw error
  }
}

// Configuração de real-time para diferentes tabelas
export const subscribeToTable = <T extends keyof Database['public']['Tables']>(
  table: T,
  callback: (payload: Record<string, unknown>) => void,
  filter?: string
) => {
  const channel = supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: filter
      },
      callback
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Função para verificar conexão com o banco
export const testConnection = async () => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Erro na conexão:', error)
      return false
    }

    console.log('Conexão com Supabase estabelecida com sucesso!')
    return true
  } catch (error) {
    console.error('Erro ao testar conexão:', error)
    return false
  }
}

// Exportar o cliente para uso direto quando necessário
export default supabase