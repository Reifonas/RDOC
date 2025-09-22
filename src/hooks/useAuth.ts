import { useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  nome: string;
  cpf?: string;
  telefone?: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null
        });
      } catch (error: any) {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: error.message
        });
      }
    };

    getSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null
        });

        // Se o usuário fez login, sincronizar dados do perfil
        if (event === 'SIGNED_IN' && session?.user) {
          await syncUserProfile(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const syncUserProfile = async (user: User) => {
    try {
      // Verificar se o usuário existe na tabela usuarios
      const { data: existingUser, error: fetchError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', user.email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erro ao buscar usuário:', fetchError);
        return;
      }

      // Se não existe, criar registro na tabela usuarios
      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert({
            id: user.id,
            email: user.email!,
            nome: user.user_metadata?.nome || user.email?.split('@')[0] || 'Usuário',
            role: 'usuario',
            ativo: true
          } as any);

        if (insertError) {
          console.error('Erro ao criar perfil do usuário:', insertError);
        }
      }
    } catch (error) {
      console.error('Erro na sincronização do perfil:', error);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('🔐 useAuth: Iniciando login...');
      console.log('📧 useAuth: Email:', credentials.email);
      
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('🌐 useAuth: Chamando supabase.auth.signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      console.log('📊 useAuth: Resposta do Supabase:', { data: !!data, error: error?.message });

      if (error) throw error;

      console.log('✅ useAuth: Login bem-sucedido');
      return { success: true, data };
    } catch (error: any) {
      console.log('❌ useAuth: Erro no login:', error.message);
      const errorMessage = getAuthErrorMessage(error);
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            nome: credentials.nome,
            cpf: credentials.cpf,
            telefone: credentials.telefone
          }
        }
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: getAuthErrorMessage(error) };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: getAuthErrorMessage(error) };
    }
  };

  const updateProfile = async (updates: Partial<{ nome: string; cpf: string; telefone: string }>) => {
    try {
      if (!authState.user) throw new Error('Usuário não autenticado');

      // Atualizar metadados do usuário
      const { error: authError } = await supabase.auth.updateUser({
        data: updates
      });

      if (authError) throw authError;

      // Atualizar tabela usuarios
      const { error: dbError } = await (supabase as any)
        .from('usuarios')
        .update(updates)
        .eq('id', authState.user.id);

      if (dbError) throw dbError;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: getAuthErrorMessage(error) };
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  // Função de bypass para desenvolvimento
  const bypassLogin = async () => {
    console.log('🚧 useAuth: Iniciando bypass de desenvolvimento...');
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simular um usuário autenticado
      const mockUser = {
        id: 'bypass-user-' + Date.now(),
        email: 'bypass@desenvolvimento.com',
        user_metadata: {
          nome: 'Usuário Bypass'
        },
        aud: 'authenticated',
        role: 'authenticated'
      };
      
      const mockSession = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser
      };
      
      // Atualizar estado de autenticação
      setAuthState({
        user: mockUser as any,
        session: mockSession as any,
        loading: false,
        error: null
      });
      
      console.log('✅ useAuth: Bypass concluído com sucesso');
      return { success: true, data: { user: mockUser, session: mockSession } };
    } catch (error: any) {
      console.error('❌ useAuth: Erro no bypass:', error);
      setAuthState(prev => ({ ...prev, loading: false, error: 'Erro no bypass' }));
      return { success: false, error: 'Erro no bypass' };
    }
  };

  return {
    // Estado
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    
    // Ações
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    clearError,
    bypassLogin
  };
};

// Função auxiliar para traduzir erros de autenticação
const getAuthErrorMessage = (error: AuthError | Error): string => {
  if ('message' in error) {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Credenciais de login inválidas';
      case 'Email not confirmed':
        return 'Email não confirmado. Verifique sua caixa de entrada';
      case 'User already registered':
        return 'Usuário já cadastrado com este email';
      case 'Password should be at least 6 characters':
        return 'A senha deve ter pelo menos 6 caracteres';
      case 'Unable to validate email address: invalid format':
        return 'Formato de email inválido';
      case 'Email rate limit exceeded':
        return 'Limite de emails excedido. Tente novamente mais tarde';
      default:
        return error.message;
    }
  }
  return 'Erro desconhecido';
};

export default useAuth;