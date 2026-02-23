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

        console.log('✅ useAuth: Sessão recuperada:', session?.user?.email);

        // Se não tiver usuário, finaliza loading imediatamente
        if (!session?.user) {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: null
          });
          console.log('⚠️ useAuth: Nenhuma sessão ativa');
          return;
        }

        // Se tiver usuário, mantém loading true enquanto busca perfil
        setAuthState(prev => ({
          ...prev,
          user: session.user,
          session,
          loading: true, // Mantém carregando
          error: null
        }));

        // CRÍTICO: Carregar dados do perfil (role, organização) no refresh
        console.log('🔄 useAuth: Recuperando perfil do usuário após refresh...', session.user.id);

        try {
          // Garantir que o perfil existe antes de buscar
          await syncUserProfile(session.user);

          const { useUserStore } = await import('../stores/useUserStore');
          const profilePromise = useUserStore.getState().fetchCurrentUser(session.user.id);

          let timeoutId: ReturnType<typeof setTimeout>;
          const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('Timeout fetchCurrentUser')), 15000);
          });

          await Promise.race([profilePromise, timeoutPromise]);
          clearTimeout(timeoutId!);
          console.log('✅ useAuth: Perfil carregado com sucesso');
        } catch (err) {
          console.error('❌ useAuth: Erro/Timeout ao carregar perfil:', err);
        } finally {
          // Só agora libera o loading
          setAuthState(prev => ({ ...prev, loading: false }));
        }

      } catch (error: unknown) {
        let errorMessage = 'Erro desconhecido';
        if (error instanceof Error) errorMessage = error.message;

        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: errorMessage
        });
      }
    };

    getSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state changed:', event, session?.user?.email);

        // Se estiver fazendo login, não tira o loading ainda, deixa o fluxo de login/getSession lidar
        // Mas se for atualização de token ou signout, atualiza

        if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: null
          });
          return;
        }

        // Se o usuário fez login (ou token refresh), sincronizar
        if (session?.user) {
          // Atualiza sessão mas mantém loading se for login inicial (tratado pelo getSession ou login)
          // Para eventos intermediários (TOKEN_REFRESHED), apenas atualiza sessão
          setAuthState(prev => ({
            ...prev,
            user: session.user,
            session,
            // Não forçamos loading false aqui para não sobrescrever operações em andamento
          }));

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            console.log('🔄 Sincronizando perfil (Auth Change)...');
            try {
              // Sync já tem timeout interno
              await syncUserProfile(session.user);

              // Garantir que temos os dados no store (com timeout)
              const { useUserStore } = await import('../stores/useUserStore');
              const currentUser = useUserStore.getState().currentUser;

              if (!currentUser || currentUser.id !== session.user.id) {
                const profilePromise = useUserStore.getState().fetchCurrentUser(session.user.id);

                let timeoutId: ReturnType<typeof setTimeout>;
                const timeoutPromise = new Promise((_, reject) => {
                  timeoutId = setTimeout(() => reject(new Error('Timeout fetchCurrentUser AuthChange')), 15000);
                });

                await Promise.race([profilePromise, timeoutPromise]);
                clearTimeout(timeoutId!);
              }
            } catch (err) {
              console.error('Erro/Timeout ao sincronizar perfil no AuthChange:', err);
            } finally {
              // Finaliza loading após garantir dados
              setAuthState(prev => ({ ...prev, loading: false }));
            }
          } else {
            // Para outros eventos onde temos user mas não é login/refresh (ex: USER_UPDATED),
            // garantimos que loading não fique preso se estava true
            setAuthState(prev => ({ ...prev, loading: false }));
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const syncUserProfile = async (user: User) => {
    try {
      console.log('🔄 syncUserProfile: Sincronizando dados:', user.email);
      
      let fetchTimeoutId: ReturnType<typeof setTimeout>;
      const fetchTimeout = new Promise((_, reject) => {
        fetchTimeoutId = setTimeout(() => reject(new Error('Timeout syncUserProfile fetch')), 15000);
      });

      // Verificar se o usuário existe na tabela usuarios
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fetchPromise = (supabase as any)
        .from('usuarios')
        .select('*')
        .eq('email', user.email)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingUser, error: fetchError } = await Promise.race([fetchPromise, fetchTimeout]) as any;
      clearTimeout(fetchTimeoutId!);

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erro ao buscar usuário (Sync):', fetchError);
        return;
      }

      // Se não existe, criar registro completo
      if (!existingUser) {
        console.log('👤 Novo usuário detectado. Criando registros...');
        
        let orgTimeoutId: ReturnType<typeof setTimeout>;
        const orgTimeout = new Promise((_, reject) => {
          orgTimeoutId = setTimeout(() => reject(new Error('Timeout creating org')), 15000);
        });

        // 1. Criar organização padrão
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const orgPromise = (supabase as any)
          .from('organizacoes')
          .insert({
            slug: `org-${user.id.slice(0, 8)}`,
            nome: `Organização de ${user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'}`,
            status: 'ativa',
            plano: 'trial'
          })
          .select()
          .single();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: org, error: orgError } = await Promise.race([orgPromise, orgTimeout]) as any;
        clearTimeout(orgTimeoutId!);

        if (orgError) {
          console.error('Erro ao criar organização:', orgError);
          return;
        }

        console.log('✅ Organização criada:', org.id);

        // 2. Criar usuário
        let userTimeoutId: ReturnType<typeof setTimeout>;
        const userTimeout = new Promise((_, reject) => {
          userTimeoutId = setTimeout(() => reject(new Error('Timeout creating user')), 15000);
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userPromise = (supabase as any)
          .from('usuarios')
          .insert({
            id: user.id,
            email: user.email!,
            organizacao_id: org.id,
            nome: user.user_metadata?.full_name || user.user_metadata?.nome || user.email?.split('@')[0] || 'Usuário',
            ativo: true
          });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: userError } = await Promise.race([userPromise, userTimeout]) as any;
        clearTimeout(userTimeoutId!);

        if (userError) {
          console.error('Erro ao criar usuário:', userError);
          return;
        }

        console.log('✅ Usuário criado');

        // 3. Criar registro em organizacao_usuarios (CRÍTICO!)
        let memTimeoutId: ReturnType<typeof setTimeout>;
        const memTimeout = new Promise((_, reject) => {
          memTimeoutId = setTimeout(() => reject(new Error('Timeout creating membership')), 15000);
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const memPromise = (supabase as any)
          .from('organizacao_usuarios')
          .insert({
            organizacao_id: org.id,
            usuario_id: user.id,
            role: 'owner', // Primeiro usuário é owner
            ativo: true
          });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: memError } = await Promise.race([memPromise, memTimeout]) as any;
        clearTimeout(memTimeoutId!);

        if (memError) {
          console.error('Erro ao criar membership:', memError);
          return;
        }

        console.log('✅ Membership criado - Usuário agora tem acesso!');
      } else {
        console.log('✅ Usuário já existe:', existingUser.id);
      }
    } catch (error) {
      console.error('Erro/Timeout na sincronização do perfil:', error);
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

      // Carregar perfil completo do usuário (com organizacao_id) no store global
      if (data.user) {
        // Importação dinâmica para evitar ciclos se necessário, ou assumir import no topo
        const { useUserStore } = await import('../stores/useUserStore');
        await useUserStore.getState().fetchCurrentUser(data.user.id);
      }

      return { success: true, data };
    } catch (error: unknown) {
      console.log('❌ useAuth: Erro no login:', error instanceof Error ? error.message : String(error));
      const errorMessage = getAuthErrorMessage(error as AuthError);
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
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error: unknown) {
      const errorMessage = getAuthErrorMessage(error as AuthError);
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    console.log('🚪 useAuth: Iniciando logout imediato...');

    // 1. Limpar tokens do localStorage (exceto preferências de tema talvez, mas por segurança limpamos chaves auth)
    Object.keys(localStorage).forEach(key => {
      if (key.includes('sb-') || key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });

    // 2. Disparar signOut do Supabase em background (sem await para não travar a UI)
    supabase.auth.signOut().catch(err => console.warn('Erro silencioso no signOut:', err));

    // 3. Limpar estado local do hook
    setAuthState({
      user: null,
      session: null,
      loading: false,
      error: null
    });

    // 4. Redirecionar forçadamente para /login
    // Usamos replace para não permitir voltar
    window.location.replace('/login');

    return { success: true };
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: getAuthErrorMessage(error as AuthError) };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: getAuthErrorMessage(error as AuthError) };
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any)
        .from('usuarios')
        .update(updates)
        .eq('id', authState.user.id);

      if (dbError) throw dbError;

      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: getAuthErrorMessage(error as AuthError) };
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
        role: 'authenticated',
        app_metadata: {},
        created_at: new Date().toISOString()
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
        user: mockUser as unknown as User,
        session: mockSession as unknown as Session,
        loading: false,
        error: null
      });

      console.log('✅ useAuth: Bypass concluído com sucesso');
      return { success: true, data: { user: mockUser as unknown as User, session: mockSession as unknown as Session } };
    } catch (error: unknown) {
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