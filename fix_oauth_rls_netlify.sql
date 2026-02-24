-- ============================================================================
-- CORREÇÃO RLS PARA OAUTH NO NETLIFY
-- ============================================================================
-- Este script corrige as políticas RLS para permitir autenticação OAuth
-- quando o app está hospedado no Netlify
-- ============================================================================

-- 1. PERMITIR CRIAÇÃO AUTOMÁTICA DE PERFIL APÓS OAUTH
-- ============================================================================

DROP POLICY IF EXISTS "Users can create own profile" ON public.usuarios;

CREATE POLICY "Users can create own profile" ON public.usuarios
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- 2. CORRIGIR FUNÇÃO DE CRIAÇÃO DE USUÁRIO
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir novo usuário na tabela public.usuarios
    INSERT INTO public.usuarios (
        id,
        email,
        nome,
        role,
        ativo
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'nome',
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'full_name',
            split_part(NEW.email, '@', 1)
        ),
        'usuario',
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        nome = COALESCE(EXCLUDED.nome, public.usuarios.nome),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. GARANTIR QUE O TRIGGER ESTÁ ATIVO
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. PERMITIR LEITURA DE ORGANIZAÇÕES PARA NOVOS USUÁRIOS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view orgs during signup" ON public.organizacoes;

CREATE POLICY "Users can view orgs during signup" ON public.organizacoes
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- 5. PERMITIR CRIAÇÃO DE ORGANIZAÇÃO PARA NOVOS USUÁRIOS
-- ============================================================================

DROP POLICY IF EXISTS "Users can create org" ON public.organizacoes;

CREATE POLICY "Users can create org" ON public.organizacoes
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- 6. PERMITIR CRIAÇÃO DE VÍNCULO ORGANIZAÇÃO-USUÁRIO
-- ============================================================================

DROP POLICY IF EXISTS "Users can create org membership" ON public.organizacao_usuarios;

CREATE POLICY "Users can create org membership" ON public.organizacao_usuarios
    FOR INSERT 
    WITH CHECK (
        usuario_id = auth.uid() 
        OR organizacao_id IN (
            SELECT organizacao_id 
            FROM public.organizacao_usuarios 
            WHERE usuario_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- 7. CORRIGIR POLÍTICA DE LEITURA DE USUÁRIOS
-- ============================================================================

-- Remover política antiga que pode estar causando recursão
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.usuarios;

-- Criar política sem recursão
CREATE POLICY "Admins can view all profiles" ON public.usuarios
    FOR SELECT 
    USING (
        -- Usuário pode ver próprio perfil
        auth.uid() = id
        OR
        -- Ou é admin/dev (verificação direta sem subquery recursiva)
        EXISTS (
            SELECT 1 FROM public.usuarios u
            WHERE u.id = auth.uid() 
            AND u.role IN ('dev', 'admin')
            LIMIT 1
        )
        OR
        -- Ou está na mesma organização
        organizacao_id IN (
            SELECT u2.organizacao_id 
            FROM public.usuarios u2
            WHERE u2.id = auth.uid()
        )
    );

-- 8. GARANTIR PERMISSÕES PARA AUTHENTICATED ROLE
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.usuarios TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.organizacoes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.organizacao_usuarios TO authenticated;

-- 9. CRIAR FUNÇÃO AUXILIAR PARA VERIFICAR SE USUÁRIO EXISTE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.user_profile_exists(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.usuarios WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar se as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('usuarios', 'organizacoes', 'organizacao_usuarios')
ORDER BY tablename, policyname;

-- Verificar se o trigger está ativo
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
AND event_object_table = 'users';

-- ============================================================================
-- FIM DA CORREÇÃO
-- ============================================================================

-- INSTRUÇÕES DE USO:
-- 1. Copie todo este script
-- 2. Acesse: https://supabase.com/dashboard/project/xzudfhifaancyxxfdejx/sql/new
-- 3. Cole o script e clique em "Run"
-- 4. Verifique se não há erros
-- 5. Teste o login OAuth no Netlify

