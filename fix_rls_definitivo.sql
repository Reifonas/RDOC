-- ============================================================================
-- CORREÇÃO DEFINITIVA E BRUTAL DE RLS - TRACKSTEEL RDO
-- ============================================================================
-- Execute este script DEPOIS que o app estiver funcionando com RLS desabilitado
-- ============================================================================

-- 1. GARANTIR QUE O SUPER ADMIN EXISTE E TEM CARGO DEV
-- ============================================================================
UPDATE public.usuarios 
SET role = 'dev', ativo = true 
WHERE email = 'admtracksteel@gmail.com';

INSERT INTO public.usuarios (id, email, nome, role, ativo)
SELECT id, email, 'Super Admin', 'dev', true
FROM auth.users 
WHERE email = 'admtracksteel@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'dev', ativo = true;

-- 2. REABILITAR RLS NA TABELA USUARIOS
-- ============================================================================
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 3. LIMPAR TODAS AS POLICIES ANTIGAS
-- ============================================================================
DROP POLICY IF EXISTS "Permitir leitura do próprio perfil" ON public.usuarios;
DROP POLICY IF EXISTS "Dev e Admins veem todos usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Super Admin Total" ON public.usuarios;
DROP POLICY IF EXISTS "Atualizar proprio perfil" ON public.usuarios;
DROP POLICY IF EXISTS "Users can view own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Users can update own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.usuarios;

-- 4. CRIAR POLICIES CORRETAS E SIMPLES
-- ============================================================================

-- 4.1. TODO USUÁRIO PODE LER SEU PRÓPRIO PERFIL (ESSENCIAL!)
CREATE POLICY "Users can view own profile" ON public.usuarios
    FOR SELECT 
    USING (auth.uid() = id);

-- 4.2. TODO USUÁRIO PODE ATUALIZAR SEU PRÓPRIO PERFIL
CREATE POLICY "Users can update own profile" ON public.usuarios
    FOR UPDATE 
    USING (auth.uid() = id);

-- 4.3. USUÁRIOS COM ROLE 'dev' OU 'admin' PODEM VER TODOS OS PERFIS
CREATE POLICY "Admins can view all profiles" ON public.usuarios
    FOR SELECT 
    USING (
        (SELECT role FROM public.usuarios WHERE id = auth.uid()) IN ('dev', 'admin')
    );

-- 4.4. USUÁRIOS COM ROLE 'dev' PODEM FAZER TUDO
CREATE POLICY "Dev can do everything" ON public.usuarios
    FOR ALL 
    USING (
        (SELECT role FROM public.usuarios WHERE id = auth.uid()) = 'dev'
    );

-- 5. ORGANIZAÇÕES - POLICIES SIMPLES
-- ============================================================================
ALTER TABLE public.organizacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura Organizacoes" ON public.organizacoes;
DROP POLICY IF EXISTS "Escrita Organizacoes Super Admin" ON public.organizacoes;
DROP POLICY IF EXISTS "Users view own org" ON public.organizacoes;
DROP POLICY IF EXISTS "Dev view all orgs" ON public.organizacoes;
DROP POLICY IF EXISTS "Dev manage orgs" ON public.organizacoes;

-- Usuários veem sua própria organização
CREATE POLICY "Users view own org" ON public.organizacoes
    FOR SELECT 
    USING (
        id = (SELECT organizacao_id FROM public.usuarios WHERE id = auth.uid())
    );

-- Dev vê todas as organizações
CREATE POLICY "Dev view all orgs" ON public.organizacoes
    FOR SELECT 
    USING (
        (SELECT role FROM public.usuarios WHERE id = auth.uid()) = 'dev'
    );

-- Dev pode gerenciar organizações
CREATE POLICY "Dev manage orgs" ON public.organizacoes
    FOR ALL 
    USING (
        (SELECT role FROM public.usuarios WHERE id = auth.uid()) = 'dev'
    );

-- 6. TABELAS DE CONFIGURAÇÃO - ACESSO TOTAL PARA AUTENTICADOS
-- ============================================================================

-- Tipos de Atividade
ALTER TABLE public.tipos_atividade ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura Geral Configs" ON public.tipos_atividade;
DROP POLICY IF EXISTS "Escrita Admin Configs" ON public.tipos_atividade;
DROP POLICY IF EXISTS "Escrita Configs" ON public.tipos_atividade;

CREATE POLICY "Anyone authenticated can read" ON public.tipos_atividade
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage" ON public.tipos_atividade
    FOR ALL USING (
        (SELECT role FROM public.usuarios WHERE id = auth.uid()) IN ('dev', 'admin')
    );

-- Condições Climáticas
ALTER TABLE public.condicoes_climaticas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura Geral Configs Clima" ON public.condicoes_climaticas;
DROP POLICY IF EXISTS "Escrita Configs Clima" ON public.condicoes_climaticas;

CREATE POLICY "Anyone authenticated can read clima" ON public.condicoes_climaticas
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage clima" ON public.condicoes_climaticas
    FOR ALL USING (
        (SELECT role FROM public.usuarios WHERE id = auth.uid()) IN ('dev', 'admin')
    );

-- Tipos de Ocorrência
ALTER TABLE public.tipos_ocorrencia ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura Geral Configs Ocorrencia" ON public.tipos_ocorrencia;
DROP POLICY IF EXISTS "Escrita Configs Ocorrencia" ON public.tipos_ocorrencia;

CREATE POLICY "Anyone authenticated can read ocorrencia" ON public.tipos_ocorrencia
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage ocorrencia" ON public.tipos_ocorrencia
    FOR ALL USING (
        (SELECT role FROM public.usuarios WHERE id = auth.uid()) IN ('dev', 'admin')
    );

-- Funções/Cargos
ALTER TABLE public.funcoes_cargos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura Geral Configs Funcoes" ON public.funcoes_cargos;
DROP POLICY IF EXISTS "Escrita Configs Funcoes" ON public.funcoes_cargos;

CREATE POLICY "Anyone authenticated can read funcoes" ON public.funcoes_cargos
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage funcoes" ON public.funcoes_cargos
    FOR ALL USING (
        (SELECT role FROM public.usuarios WHERE id = auth.uid()) IN ('dev', 'admin')
    );

-- Equipamentos
ALTER TABLE public.equipamentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura Geral Configs Equip" ON public.equipamentos;
DROP POLICY IF EXISTS "Escrita Configs Equip" ON public.equipamentos;

CREATE POLICY "Anyone authenticated can read equip" ON public.equipamentos
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage equip" ON public.equipamentos
    FOR ALL USING (
        (SELECT role FROM public.usuarios WHERE id = auth.uid()) IN ('dev', 'admin')
    );

-- Materiais
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura Geral Configs Mat" ON public.materiais;
DROP POLICY IF EXISTS "Escrita Configs Mat" ON public.materiais;

CREATE POLICY "Anyone authenticated can read mat" ON public.materiais
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage mat" ON public.materiais
    FOR ALL USING (
        (SELECT role FROM public.usuarios WHERE id = auth.uid()) IN ('dev', 'admin')
    );

-- ============================================================================
-- FIM - AGORA O RLS ESTÁ CONFIGURADO CORRETAMENTE
-- ============================================================================
