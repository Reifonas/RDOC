-- ============================================================================
-- MIGRAÇÃO DE MOCKUPS PARA DADOS REAIS - BALDON ENGEMETAL
-- ============================================================================

-- 0. Ajustes de Constraints (Enum) para suportar estados do Mockup
-- ============================================================================

-- Adicionar 'pausada' e 'atrasada' ao check constraint de status da tabela tarefas
-- Nota: PostgreSQL não permite alterar constraints CHECK facilmente, precisamos dropar e recriar ou atualizar o tipo se for ENUM.
-- Aqui assumimos que é uma constraint de texto. Vamos tentar ajustar.
DO $$
BEGIN
    -- Tenta remover a constraint existente (nome padrão gerado ou explícito se soubermos)
    -- O nome costuma ser tarefas_status_check
    ALTER TABLE public.tarefas DROP CONSTRAINT IF EXISTS tarefas_status_check;
    
    -- Recria com os novos valores
    ALTER TABLE public.tarefas ADD CONSTRAINT tarefas_status_check 
    CHECK (status IN ('pendente', 'em_andamento', 'pausada', 'concluida', 'cancelada', 'atrasada'));

    -- Ajuste para prioridade (adicionar 'critica' se não existir, ou mapear 'critica' -> 'urgente')
    -- O banco tem 'urgente'. O frontend usa 'critica'. Vamos permitir ambos para flexibilidade.
    ALTER TABLE public.tarefas DROP CONSTRAINT IF EXISTS tarefas_prioridade_check;
    ALTER TABLE public.tarefas ADD CONSTRAINT tarefas_prioridade_check 
    CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente', 'critica'));
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Não foi possível alterar constraints: %', SQLERRM;
END $$;

-- 0.1 Ajuste da Tabela Obras (Garantir colunas necessárias)
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS cliente VARCHAR(255);
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS valor_contrato NUMERIC(15,2);
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS data_inicio DATE;
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS data_prevista_fim DATE;
-- Garantir que progresso_geral existe (se não existir)
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS progresso_geral NUMERIC(5,2) DEFAULT 0;
-- Garantir que responsavel_id existe
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS responsavel_id UUID REFERENCES public.usuarios(id);

-- 0.2 Ajuste da Tabela Usuários (Garantir colunas para mock)
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS telefone VARCHAR(50);
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS cargo VARCHAR(100);

-- 0.3 Criação das Tabelas Principais (Tarefas e RDOs) se não existirem
CREATE TABLE IF NOT EXISTS public.tarefas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organizacao_id UUID REFERENCES public.organizacoes(id),
    obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    responsavel_id UUID REFERENCES public.usuarios(id),
    prioridade VARCHAR(50) CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente', 'critica')),
    status VARCHAR(50) CHECK (status IN ('pendente', 'em_andamento', 'pausada', 'concluida', 'cancelada', 'atrasada')),
    data_inicio DATE,
    data_fim DATE,
    progresso NUMERIC(5,2) DEFAULT 0,
    metadados JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rdos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organizacao_id UUID REFERENCES public.organizacoes(id),
    obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE,
    numero INTEGER,
    criado_por UUID REFERENCES public.usuarios(id),
    data_relatorio DATE NOT NULL,
    status VARCHAR(50) CHECK (status IN ('rascunho', 'enviado', 'aprovado', 'rejeitado')) DEFAULT 'rascunho',
    condicoes_climaticas VARCHAR(100),
    observacoes_gerais TEXT,
    aprovado_por UUID REFERENCES public.usuarios(id),
    aprovado_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para Tarefas e RDOs (Boas Práticas)
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso básicas (exemplo permissivo para garantir funcionamento inicial, ajuste conforme necessidade)
CREATE POLICY "Acesso Total Tarefas" ON public.tarefas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total RDOs" ON public.rdos FOR ALL USING (true) WITH CHECK (true);

-- 0.4 Ajuste da Tabela RDOs (Garantir colunas se tabela já existia)
ALTER TABLE public.rdos ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.rdos ADD COLUMN IF NOT EXISTS condicoes_climaticas VARCHAR(100);
ALTER TABLE public.rdos ADD COLUMN IF NOT EXISTS observacoes_gerais TEXT;
ALTER TABLE public.rdos ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES public.usuarios(id);
ALTER TABLE public.rdos ADD COLUMN IF NOT EXISTS aprovado_em TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.rdos ADD COLUMN IF NOT EXISTS criado_por UUID REFERENCES public.usuarios(id);
ALTER TABLE public.rdos ADD COLUMN IF NOT EXISTS data_relatorio DATE;
ALTER TABLE public.rdos ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'rascunho';

-- 1. Criação da Tabela de Inventário de Equipamentos (Ativos)
-- Esta tabela armazena os equipamentos físicos (patrimônio), diferente da tabela 'equipamentos' que é apenas para tipos.
CREATE TABLE IF NOT EXISTS public.inventario_equipamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organizacao_id UUID REFERENCES public.organizacoes(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    modelo VARCHAR(100),
    fabricante VARCHAR(100),
    ano_fabricacao INTEGER,
    numero_serie VARCHAR(100),
    status VARCHAR(50) DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'em_uso', 'manutencao', 'inativo')),
    obra_atual_id UUID REFERENCES public.obras(id) ON DELETE SET NULL, -- Vincula à obra real
    proxima_manutencao DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para a nova tabela
ALTER TABLE public.inventario_equipamentos ENABLE ROW LEVEL SECURITY;

-- Política de leitura (igual às outras tabelas)
DROP POLICY IF EXISTS "Leitura Inventario" ON public.inventario_equipamentos;
CREATE POLICY "Leitura Inventario" ON public.inventario_equipamentos
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND (
            organizacao_id IN (SELECT organizacao_id FROM public.usuarios WHERE id = auth.uid())
            OR auth.jwt()->>'email' = 'admtracksteel@gmail.com'
        )
    );

-- Política de escrita
DROP POLICY IF EXISTS "Escrita Inventario" ON public.inventario_equipamentos;
CREATE POLICY "Escrita Inventario" ON public.inventario_equipamentos
    FOR ALL USING (
        auth.uid() IS NOT NULL
        AND (
            organizacao_id IN (SELECT organizacao_id FROM public.usuarios WHERE id = auth.uid())
            OR auth.jwt()->>'email' = 'admtracksteel@gmail.com'
        )
    );


-- 2. Bloco Anônimo para Inserção dos Dados
DO $$
DECLARE
    v_org_id UUID;
    v_user_id UUID;
    v_obra_id UUID;
BEGIN
    -- a) Obter ID da Organização 'Baldon Engemetal'
    SELECT id INTO v_org_id FROM public.organizacoes WHERE slug = 'baldon-engemetal' LIMIT 1;
    
    -- Se não existir, tenta criar (backup) ou pega a primeira disponível
    IF v_org_id IS NULL THEN
        RAISE NOTICE 'Organização Baldon Engemetal não encontrada. Usando a primeira organização disponível.';
        SELECT id INTO v_org_id FROM public.organizacoes LIMIT 1;
    END IF;

    -- b) Obter um Usuário Real da Organização (ou o primeiro usuário do banco)
    -- Tenta pegar um usuário vinculado à organização
    SELECT id INTO v_user_id FROM public.usuarios WHERE organizacao_id = v_org_id LIMIT 1;
    
    -- Se não achar, pega qualquer usuário (fallback)
    IF v_user_id IS NULL THEN
        SELECT id INTO v_user_id FROM auth.users LIMIT 1;
        -- Se ainda assim for nulo (banco vazio), não tem como prosseguir com owner
    END IF;

    -- c) Inserir a Obra "Edifício Residencial Aurora"
    INSERT INTO public.obras (
        organizacao_id,
        nome,
        descricao,
        endereco,
        cliente,
        responsavel_id,
        data_inicio,
        data_prevista_fim,
        progresso_geral,
        status,
        valor_contrato
    ) VALUES (
        v_org_id,
        'Edifício Residencial Aurora',
        'Edifício residencial de 15 andares com 120 apartamentos',
        'Rua das Flores, 123 - Centro',
        'Construtora ABC Ltda',
        v_user_id, -- Usando usuário real como responsável
        '2024-01-01',
        '2024-12-31',
        45.0,
        'em_andamento',
        2500000.00
    )
    RETURNING id INTO v_obra_id;

    RAISE NOTICE 'Obra criada com ID: %', v_obra_id;

    -- d) Inserir Tarefas (Vinculadas à Obra Aurora e ao Usuário Real)
    -- Tarefa 1
    INSERT INTO public.tarefas (
        organizacao_id,
        obra_id,
        titulo,
        descricao,
        responsavel_id, -- Usuário real
        prioridade,
        status,
        data_inicio,
        data_fim, -- data_prazo no mock
        progresso,
        metadados
    ) VALUES (
        v_org_id,
        v_obra_id,
        'Concretagem da Laje do 2º Pavimento',
        'Executar a concretagem da laje do segundo pavimento conforme projeto estrutural',
        v_user_id,
        'alta',
        'em_andamento',
        '2024-01-15',
        '2024-01-18',
        65.0,
        jsonb_build_object(
            'categoria', 'Estrutura',
            'localizacao', '2º Pavimento',
            'tempo_estimado', 16,
            'tempo_trabalhado', 10.5,
            'anexos_count', 3,
            'comentarios_count', 2
        )
    );

    -- Tarefa 2
    INSERT INTO public.tarefas (
        organizacao_id,
        obra_id,
        titulo,
        descricao,
        responsavel_id,
        prioridade,
        status,
        data_inicio,
        data_fim,
        progresso,
        metadados
    ) VALUES (
        v_org_id,
        v_obra_id,
        'Instalação Elétrica - Sala 201',
        'Instalação completa do sistema elétrico da sala 201',
        v_user_id,
        'media',
        'pendente',
        '2024-01-20',
        '2024-01-25',
        0.0,
        jsonb_build_object(
            'categoria', 'Elétrica',
            'localizacao', '2º Pavimento - Sala 201',
            'tempo_estimado', 12
        )
    );

     -- Tarefa 3
    INSERT INTO public.tarefas (
        organizacao_id,
        obra_id,
        titulo,
        descricao,
        responsavel_id,
        prioridade,
        status,
        data_inicio,
        data_fim,
        progresso,
        metadados
    ) VALUES (
        v_org_id,
        v_obra_id,
        'Impermeabilização da Cobertura',
        'Aplicação de manta asfáltica na cobertura do edifício',
        v_user_id,
        'critica',
        'pausada',
        '2024-01-12',
        '2024-01-16',
        30.0,
        jsonb_build_object(
            'categoria', 'Impermeabilização',
            'localizacao', 'Cobertura',
            'tempo_estimado', 24
        )
    );

     -- Tarefa 4
    INSERT INTO public.tarefas (
        organizacao_id,
        obra_id,
        titulo,
        descricao,
        responsavel_id,
        prioridade,
        status,
        data_inicio,
        data_fim,
        progresso,
        metadados
    ) VALUES (
        v_org_id,
        v_obra_id,
        'Pintura Externa - Fachada Norte',
        'Aplicação de tinta acrílica na fachada norte do edifício',
        v_user_id,
        'baixa',
        'pendente',
        '2024-01-25',
        '2024-02-05',
        0.0,
        jsonb_build_object(
            'categoria', 'Acabamento',
            'localizacao', 'Fachada Norte',
            'tempo_estimado', 32
        )
    );

    -- e) Inserir Inventário de Equipamentos
    -- Betoneira (Em uso na obra Aurora)
    INSERT INTO public.inventario_equipamentos (
        organizacao_id,
        nome,
        tipo,
        modelo,
        fabricante,
        ano_fabricacao,
        numero_serie,
        status,
        obra_atual_id,
        proxima_manutencao
    ) VALUES (
        v_org_id,
        'Betoneira 400L',
        'Betoneira',
        'BT-400',
        'Menegotti',
        2022,
        'BT400-2022-001',
        'em_uso',
        v_obra_id, -- Vinculada à obra criada
        '2024-03-01'
    );

    -- Guindaste (Disponível)
    INSERT INTO public.inventario_equipamentos (
        organizacao_id,
        nome,
        tipo,
        modelo,
        fabricante,
        ano_fabricacao,
        numero_serie,
        status,
        obra_atual_id,
        proxima_manutencao
    ) VALUES (
        v_org_id,
        'Guindaste 20T',
        'Guindaste',
        'GR-20',
        'Liebherr',
        2021,
        'GR20-2021-005',
        'disponivel',
        NULL, -- Sem obra atual
        '2024-02-15'
    );

    -- f) Inserir RDOs (Histórico)
    -- RDO 1 (Aprovado)
    INSERT INTO public.rdos (
        organizacao_id,
        obra_id,
        numero,
        criado_por,
        data_relatorio,
        status,
        condicoes_climaticas,
        observacoes_gerais
    ) VALUES (
        v_org_id,
        v_obra_id,
        1,
        v_user_id,
        '2024-01-15',
        'aprovado',
        'ensolarado',
        'Dia produtivo, concretagem iniciada conforme planejado.'
    );

    -- RDO 2 (Aprovado)
    INSERT INTO public.rdos (
        organizacao_id,
        obra_id,
        numero,
        criado_por,
        data_relatorio,
        status,
        condicoes_climaticas,
        observacoes_gerais
    ) VALUES (
        v_org_id,
        v_obra_id,
        2,
        v_user_id,
        '2024-01-14',
        'aprovado',
        'parcialmente_nublado',
        'Preparação para concretagem.'
    );

    -- RDO 3 (Enviado)
    INSERT INTO public.rdos (
        organizacao_id,
        obra_id,
        numero,
        criado_por,
        data_relatorio,
        status,
        condicoes_climaticas
    ) VALUES (
        v_org_id,
        v_obra_id,
        3,
        v_user_id,
        '2024-01-13',
        'enviado',
        'chuva_leve'
    );

END $$;
