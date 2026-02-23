-- ============================================================================
-- CORREÇÃO DE RLS PARA LOGIN DO GOOGLE E NOVOS USUÁRIOS
-- ============================================================================
-- Execute este script no SQL Editor do seu Painel do Supabase.
-- Ele garante que a tabela "usuarios" aceite novos perfis criados no 
-- momento do primeiro login via Google ou E-mail.

-- 1. Garante que qualquer usuário autenticado possa INSERIR a si próprio
DROP POLICY IF EXISTS "Usuários podem criar seu próprio perfil" ON public.usuarios;

CREATE POLICY "Usuários podem criar seu próprio perfil" ON public.usuarios
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- 2. (Garantia) Permite que o Super Admin "dev" crie ou edite qualquer perfil
DROP POLICY IF EXISTS "Dev can insert profiles" ON public.usuarios;

CREATE POLICY "Dev can insert profiles" ON public.usuarios
    FOR INSERT 
    WITH CHECK (
        (SELECT role FROM public.usuarios WHERE id = auth.uid()) = 'dev'
    );

-- 3. Caso não exista de antes, reafirma a permissão de Update do usuário
DROP POLICY IF EXISTS "Users can update own profile" ON public.usuarios;

CREATE POLICY "Users can update own profile" ON public.usuarios
    FOR UPDATE 
    USING (auth.uid() = id);

-- ============================================================================
-- FIM. Novos cadastros do Google agora fluirão perfeitamente!
