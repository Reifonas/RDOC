-- ============================================================================
-- SCRIPT DE CORREÇÃO TOTAL DE PERMISSÕES (RLS) - TRACKSTEEL RDO
-- ============================================================================
-- OBJETIVO: Garantir que o usuário consiga ler seu próprio perfil (para saber que é Dev)
-- e que o Super Admin tenha acesso irrestrito.
-- ============================================================================

-- 1. TABELA USUARIOS (A MAIS IMPORTANTE)
-- ============================================================================
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Limpar policies antigas para evitar conflitos
DROP POLICY IF EXISTS "Permitir leitura do próprio perfil" ON public.usuarios;
DROP POLICY IF EXISTS "Dev e Admins veem todos usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Super Admin Total" ON public.usuarios;
DROP POLICY IF EXISTS "Atualizar proprio perfil" ON public.usuarios;

-- 1.1. REGRA BÁSICA: Todo usuário autenticado pode ler SEUS PRÓPRIOS DADOS
-- Sem isso, o sistema não sabe quem você é.
CREATE POLICY "Permitir leitura do próprio perfil" ON public.usuarios
    FOR SELECT USING (auth.uid() = id);

-- 1.2. REGRA DE EDIÇÃO: Usuário pode atualizar seus dados básicos
CREATE POLICY "Atualizar proprio perfil" ON public.usuarios
    FOR UPDATE USING (auth.uid() = id);

-- 1.3. REGRA DO SUPER ADMIN (Hardcoded para segurança máxima no momento)
-- O email admtracksteel@gmail.com pode FAZER TUDO em usuarios.
CREATE POLICY "Super Admin Total" ON public.usuarios
    FOR ALL USING (
        (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admtracksteel@gmail.com'
    );

-- 2. TABELA ORGANIZACOES
-- ============================================================================
ALTER TABLE public.organizacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura Organizacoes" ON public.organizacoes;
DROP POLICY IF EXISTS "Escrita Organizacoes Super Admin" ON public.organizacoes;

-- 2.1. Leitura: Usuários veem sua própria organização OU Super Admin vê todas
CREATE POLICY "Leitura Organizacoes" ON public.organizacoes
    FOR SELECT USING (
        id = (SELECT organizacao_id FROM public.usuarios WHERE id = auth.uid())
        OR 
        (SELECT role FROM public.usuarios WHERE id = auth.uid()) = 'dev'
    );

-- 2.2. Escrita: Apenas DEV pode criar/editar organizações (por enquanto)
CREATE POLICY "Escrita Organizacoes Super Admin" ON public.organizacoes
    FOR ALL USING (
        (SELECT role FROM public.usuarios WHERE id = auth.uid()) = 'dev'
    );


-- 3. REFORÇAR CONFIGURAÇÕES (Configs Globais)
-- ============================================================================
-- Garantir que tabelas de configuração sejam legíveis por todos que estão logados
ALTER TABLE public.tipos_atividade ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura Geral Configs" ON public.tipos_atividade;
CREATE POLICY "Leitura Geral Configs" ON public.tipos_atividade 
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Escrita Admin Configs" ON public.tipos_atividade;
CREATE POLICY "Escrita Admin Configs" ON public.tipos_atividade 
    FOR ALL USING (
        (SELECT role FROM public.usuarios WHERE id = auth.uid()) IN ('dev', 'admin')
    );

-- (Repetir lógica para as outras tabelas essencialmente garante acesso)
-- Aplicando o mesmo conceito para condicoes_climaticas, etc de forma simplificada:
-- Se precisar rodar para todas, o script setup_full_db.sql já cobriu, 
-- mas aqui o foco é desbloquear o ACESSO AO USUÁRIO/ADMIN.


-- 4. FORÇAR (NOVAMENTE) O CARGO DEV PARA O SUPER ADMIN
-- ============================================================================
-- Bypass RLS para garantir que o update ocorra agora no banco.
UPDATE public.usuarios 
SET role = 'dev', ativo = true 
WHERE email = 'admtracksteel@gmail.com';

-- Caso não exista na tabela usuarios (mas exista no Auth), insere forçado:
INSERT INTO public.usuarios (id, email, nome, role, ativo)
SELECT id, email, 'Super Admin', 'dev', true
FROM auth.users 
WHERE email = 'admtracksteel@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'dev', ativo = true;

-- ============================================================================
-- FIM DO SCRIPT DE CORREÇÃO
-- ============================================================================
