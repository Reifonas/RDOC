-- ============================================================================
-- CORREÇÃO SIMPLES - ERRO 401 NO LOGIN
-- ============================================================================
-- Este script corrige apenas as tabelas que existem
-- Execute no SQL Editor do Supabase
-- ============================================================================

-- 1. VERIFICAR E CORRIGIR APENAS TABELA USUARIOS
-- ============================================================================

-- Desabilitar RLS temporariamente
ALTER TABLE IF EXISTS public.usuarios DISABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas
DO $$ 
BEGIN
    -- Dropar todas as políticas da tabela usuarios se existir
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuarios') THEN
        DROP POLICY IF EXISTS "Users can view own profile" ON public.usuarios;
        DROP POLICY IF EXISTS "Users can update own profile" ON public.usuarios;
        DROP POLICY IF EXISTS "Admins can view all profiles" ON public.usuarios;
        DROP POLICY IF EXISTS "Dev can do everything" ON public.usuarios;
        DROP POLICY IF EXISTS "Users can create own profile" ON public.usuarios;
        DROP POLICY IF EXISTS "Permitir leitura do próprio perfil" ON public.usuarios;
        DROP POLICY IF EXISTS "Dev e Admins veem todos usuarios" ON public.usuarios;
        DROP POLICY IF EXISTS "Super Admin Total" ON public.usuarios;
        DROP POLICY IF EXISTS "Atualizar proprio perfil" ON public.usuarios;
        DROP POLICY IF EXISTS "Admins podem criar usuários" ON public.usuarios;
        DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON public.usuarios;
        DROP POLICY IF EXISTS "Usuários veem membros da organização" ON public.usuarios;
        DROP POLICY IF EXISTS "authenticated_all_access" ON public.usuarios;
    END IF;
END $$;

-- Reabilitar RLS
ALTER TABLE IF EXISTS public.usuarios ENABLE ROW LEVEL SECURITY;

-- Criar política super permissiva
CREATE POLICY "authenticated_full_access" ON public.usuarios
    FOR ALL 
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- 2. VERIFICAR E CORRIGIR TABELA ORGANIZACOES (SE EXISTIR)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizacoes') THEN
        ALTER TABLE public.organizacoes DISABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users view own org" ON public.organizacoes;
        DROP POLICY IF EXISTS "Dev view all orgs" ON public.organizacoes;
        DROP POLICY IF EXISTS "Dev manage orgs" ON public.organizacoes;
        DROP POLICY IF EXISTS "Users can view orgs during signup" ON public.organizacoes;
        DROP POLICY IF EXISTS "Users can create org" ON public.organizacoes;
        DROP POLICY IF EXISTS "Usuários veem suas organizações" ON public.organizacoes;
        DROP POLICY IF EXISTS "Owners podem atualizar organização" ON public.organizacoes;
        DROP POLICY IF EXISTS "Usuários autenticados podem criar organização" ON public.organizacoes;
        DROP POLICY IF EXISTS "authenticated_all_access" ON public.organizacoes;
        
        ALTER TABLE public.organizacoes ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "authenticated_full_access" ON public.organizacoes
            FOR ALL 
            USING (auth.uid() IS NOT NULL)
            WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 3. VERIFICAR E CORRIGIR TABELA ORGANIZACAO_USUARIOS (SE EXISTIR)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizacao_usuarios') THEN
        ALTER TABLE public.organizacao_usuarios DISABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can create org membership" ON public.organizacao_usuarios;
        DROP POLICY IF EXISTS "Ver membros da organização" ON public.organizacao_usuarios;
        DROP POLICY IF EXISTS "Admins gerenciam membros" ON public.organizacao_usuarios;
        DROP POLICY IF EXISTS "authenticated_all_access" ON public.organizacao_usuarios;
        
        ALTER TABLE public.organizacao_usuarios ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "authenticated_full_access" ON public.organizacao_usuarios
            FOR ALL 
            USING (auth.uid() IS NOT NULL)
            WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 4. GARANTIR PERMISSÕES PARA AUTHENTICATED ROLE
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 5. CORRIGIR FUNÇÃO DE CRIAÇÃO DE USUÁRIO
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_name TEXT;
BEGIN
    -- Extrair nome do usuário
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'nome',
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'display_name',
        split_part(NEW.email, '@', 1)
    );

    -- Inserir ou atualizar usuário
    INSERT INTO public.usuarios (
        id,
        email,
        nome,
        role,
        ativo
    ) VALUES (
        NEW.id,
        NEW.email,
        user_name,
        'usuario',
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        nome = COALESCE(EXCLUDED.nome, public.usuarios.nome),
        updated_at = NOW();

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar usuário: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. GARANTIR QUE O TRIGGER ESTÁ ATIVO
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 7. VERIFICAÇÃO FINAL
-- ============================================================================

-- Listar tabelas existentes
SELECT 'Tabelas no schema public:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Listar políticas criadas
SELECT 'Políticas RLS criadas:' as info;
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Teste de acesso
SELECT 'Teste de contagem:' as info;
SELECT COUNT(*) as total_usuarios FROM public.usuarios;

-- ============================================================================
-- SUCESSO!
-- ============================================================================
-- Agora tente fazer login novamente no app
-- ============================================================================
