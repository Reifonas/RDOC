-- ============================================================================
-- SCRIPT DE CONFIGURAÇÃO TOTAL DO BANCO DE DADOS - TRACKSTEEL RDO (V2 - IDEMPOTENTE)
-- ============================================================================
-- Instruções:
-- 1. Copie todo o conteúdo deste arquivo.
-- 2. Vá para o painel do Supabase -> SQL Editor.
-- 3. Cole e execute (Run).
-- ============================================================================

-- 1. GARANTIR ACESSO SUPER ADMIN (DEV)
-- ============================================================================
UPDATE public.usuarios 
SET role = 'dev', ativo = true 
WHERE email = 'admtracksteel@gmail.com';

-- Se por acaso o usuário não existir na tabela 'usuarios' mas existir no Auth:
INSERT INTO public.usuarios (id, email, nome, role, ativo, "organizacao_id")
SELECT id, email, raw_user_meta_data->>'full_name', 'dev', true, NULL
FROM auth.users 
WHERE email = 'admtracksteel@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'dev', ativo = true;


-- 2. CRIAR TABELAS DE CONFIGURAÇÃO (Se não existirem)
-- ============================================================================

-- Tabela: Tipos de Atividade
CREATE TABLE IF NOT EXISTS public.tipos_atividade (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    organizacao_id UUID REFERENCES public.organizacoes(id) ON DELETE CASCADE,
    icone TEXT
);

-- Tabela: Condições Climáticas
CREATE TABLE IF NOT EXISTS public.condicoes_climaticas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT NOT NULL,
    valor TEXT NOT NULL, -- ex: ensonalrado, nublado
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    organizacao_id UUID REFERENCES public.organizacoes(id) ON DELETE CASCADE,
    icone TEXT
);

-- Tabela: Tipos de Ocorrência
CREATE TABLE IF NOT EXISTS public.tipos_ocorrencia (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    organizacao_id UUID REFERENCES public.organizacoes(id) ON DELETE CASCADE,
    cor TEXT, -- hex color
    icone TEXT
);

-- Tabela: Funções e Cargos
CREATE TABLE IF NOT EXISTS public.funcoes_cargos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    organizacao_id UUID REFERENCES public.organizacoes(id) ON DELETE CASCADE
);

-- Tabela: Equipamentos
CREATE TABLE IF NOT EXISTS public.equipamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    organizacao_id UUID REFERENCES public.organizacoes(id) ON DELETE CASCADE
);

-- Tabela: Materiais
CREATE TABLE IF NOT EXISTS public.materiais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    organizacao_id UUID REFERENCES public.organizacoes(id) ON DELETE CASCADE
);


-- 3. HABILITAR RLS E LIMPAR POLÍTICAS ANTIGAS (Para evitar erros de duplicidade)
-- ============================================================================

-- Habilitar RLS (Idempotente)
ALTER TABLE public.tipos_atividade ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condicoes_climaticas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_ocorrencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcoes_cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;

-- Dropar Policies antigas (Idempotente)
DROP POLICY IF EXISTS "Leitura Geral Configs" ON public.tipos_atividade;
DROP POLICY IF EXISTS "Leitura Geral Configs Clima" ON public.condicoes_climaticas;
DROP POLICY IF EXISTS "Leitura Geral Configs Ocorrencia" ON public.tipos_ocorrencia;
DROP POLICY IF EXISTS "Leitura Geral Configs Funcoes" ON public.funcoes_cargos;
DROP POLICY IF EXISTS "Leitura Geral Configs Equip" ON public.equipamentos;
DROP POLICY IF EXISTS "Leitura Geral Configs Mat" ON public.materiais;

DROP POLICY IF EXISTS "Escrita Configs" ON public.tipos_atividade;
DROP POLICY IF EXISTS "Escrita Configs Clima" ON public.condicoes_climaticas;
DROP POLICY IF EXISTS "Escrita Configs Ocorrencia" ON public.tipos_ocorrencia;
DROP POLICY IF EXISTS "Escrita Configs Funcoes" ON public.funcoes_cargos;
DROP POLICY IF EXISTS "Escrita Configs Equip" ON public.equipamentos;
DROP POLICY IF EXISTS "Escrita Configs Mat" ON public.materiais;

-- Criar Policies Novamente
-- Leitura
CREATE POLICY "Leitura Geral Configs" ON public.tipos_atividade FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Leitura Geral Configs Clima" ON public.condicoes_climaticas FOR SELECT USING (true);
CREATE POLICY "Leitura Geral Configs Ocorrencia" ON public.tipos_ocorrencia FOR SELECT USING (true);
CREATE POLICY "Leitura Geral Configs Funcoes" ON public.funcoes_cargos FOR SELECT USING (true);
CREATE POLICY "Leitura Geral Configs Equip" ON public.equipamentos FOR SELECT USING (true);
CREATE POLICY "Leitura Geral Configs Mat" ON public.materiais FOR SELECT USING (true);

-- Escrita
CREATE POLICY "Escrita Configs" ON public.tipos_atividade FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Escrita Configs Clima" ON public.condicoes_climaticas FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Escrita Configs Ocorrencia" ON public.tipos_ocorrencia FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Escrita Configs Funcoes" ON public.funcoes_cargos FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Escrita Configs Equip" ON public.equipamentos FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Escrita Configs Mat" ON public.materiais FOR ALL USING (auth.uid() IS NOT NULL);


-- 4. POPULAR DADOS PADRÃO (SEED) - SEM DUPLICAÇÃO
-- ============================================================================

-- Tipos de Atividade
INSERT INTO public.tipos_atividade (nome, ordem, organizacao_id)
SELECT nome, ordem, NULL FROM (VALUES 
    ('Escavação'::text, 1),
    ('Fundação', 2),
    ('Concretagem', 3),
    ('Alvenaria', 4),
    ('Instalação Elétrica', 5),
    ('Instalação Hidráulica', 6),
    ('Revestimento', 7),
    ('Pintura', 8)
) AS t(nome, ordem)
WHERE NOT EXISTS (SELECT 1 FROM public.tipos_atividade WHERE nome = t.nome AND organizacao_id IS NULL);

-- Condições Climáticas
INSERT INTO public.condicoes_climaticas (nome, valor, ordem, icone, organizacao_id)
SELECT nome, valor, ordem, icone, NULL FROM (VALUES 
    ('Ensolarado'::text, 'ensolarado'::text, 1, 'Sun'::text),
    ('Parcialmente Nublado', 'parcialmente_nublado', 2, 'Cloud'),
    ('Nublado', 'nublado', 3, 'Cloud'),
    ('Chuvisco', 'chuvisco', 4, 'CloudRain'),
    ('Chuva Leve', 'chuva_leve', 5, 'CloudRain'),
    ('Chuva Forte', 'chuva_forte', 6, 'CloudRain')
) AS t(nome, valor, ordem, icone)
WHERE NOT EXISTS (SELECT 1 FROM public.condicoes_climaticas WHERE nome = t.nome AND organizacao_id IS NULL);

-- Tipos de Ocorrência
INSERT INTO public.tipos_ocorrencia (nome, ordem, cor, organizacao_id)
SELECT nome, ordem, cor, NULL FROM (VALUES 
    ('Acidente de Trabalho'::text, 1, '#ef4444'::text),
    ('Atraso na Entrega', 2, '#f59e0b'),
    ('Problema de Qualidade', 3, '#f59e0b'),
    ('Falta de Material', 4, '#f59e0b'),
    ('Problema Climático', 5, '#6b7280'),
    ('Equipamento Quebrado', 6, '#ef4444'),
    ('Outros', 7, '#6b7280')
) AS t(nome, ordem, cor)
WHERE NOT EXISTS (SELECT 1 FROM public.tipos_ocorrencia WHERE nome = t.nome AND organizacao_id IS NULL);

-- Funções / Cargos
INSERT INTO public.funcoes_cargos (nome, ordem, organizacao_id)
SELECT nome, ordem, NULL FROM (VALUES 
    ('Pedreiro'::text, 1),
    ('Servente', 2),
    ('Armador', 3),
    ('Encarregado', 4),
    ('Mestre de Obras', 5),
    ('Engenheiro Civil', 6),
    ('Arquiteto', 7),
    ('Eletricista', 8),
    ('Encanador', 9),
    ('Pintor', 10)
) AS t(nome, ordem)
WHERE NOT EXISTS (SELECT 1 FROM public.funcoes_cargos WHERE nome = t.nome AND organizacao_id IS NULL);

-- Equipamentos
INSERT INTO public.equipamentos (nome, ordem, organizacao_id)
SELECT nome, ordem, NULL FROM (VALUES 
    ('Betoneira'::text, 1),
    ('Guindaste', 2),
    ('Escavadeira', 3),
    ('Guincho de Coluna', 4),
    ('Compactador', 5),
    ('Furadeira', 6),
    ('Serra Circular', 7),
    ('Andaime', 8)
) AS t(nome, ordem)
WHERE NOT EXISTS (SELECT 1 FROM public.equipamentos WHERE nome = t.nome AND organizacao_id IS NULL);

-- Materiais
INSERT INTO public.materiais (nome, ordem, organizacao_id)
SELECT nome, ordem, NULL FROM (VALUES 
    ('Cimento'::text, 1),
    ('Areia', 2),
    ('Brita', 3),
    ('Ferro/Aço', 4),
    ('Tijolo', 5),
    ('Bloco de Concreto', 6),
    ('Madeira', 7),
    ('Tinta', 8),
    ('Argamassa', 9),
    ('Cerâmica', 10)
) AS t(nome, ordem)
WHERE NOT EXISTS (SELECT 1 FROM public.materiais WHERE nome = t.nome AND organizacao_id IS NULL);

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
