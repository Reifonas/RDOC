-- =================================================================
-- MIGRAÇÃO COMPLETA: Sistema RDO com Multi-Tenancy e Super Admin
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =================================================================

-- =================================================================
-- PARTE 1: CRIAR TABELAS BASE
-- =================================================================

-- 1. Tabela de Organizações
CREATE TABLE IF NOT EXISTS public.organizacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    razao_social TEXT,
    cnpj TEXT,
    status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa', 'suspensa')),
    plano TEXT DEFAULT 'trial' CHECK (plano IN ('trial', 'basico', 'profissional', 'enterprise')),
    max_usuarios INTEGER DEFAULT 5,
    max_obras INTEGER DEFAULT 10,
    max_rdos_mes INTEGER DEFAULT 100,
    max_storage_mb INTEGER DEFAULT 1024,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Usuários
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organizacao_id UUID REFERENCES public.organizacoes(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    nome TEXT NOT NULL,
    role TEXT DEFAULT 'usuario' CHECK (role IN ('dev', 'admin', 'engenheiro', 'mestre_obra', 'usuario')),
    avatar_url TEXT,
    telefone TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Convites
CREATE TABLE IF NOT EXISTS public.convites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
    codigo TEXT NOT NULL UNIQUE,
    criado_por UUID REFERENCES auth.users(id),
    email_convidado TEXT,
    role TEXT DEFAULT 'usuario',
    max_usos INTEGER DEFAULT 1,
    usos_atuais INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    expira_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- PARTE 2: ÍNDICES PARA PERFORMANCE
-- =================================================================

CREATE INDEX IF NOT EXISTS idx_usuarios_organizacao ON public.usuarios(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_convites_codigo ON public.convites(codigo);
CREATE INDEX IF NOT EXISTS idx_convites_organizacao ON public.convites(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_convites_ativo ON public.convites(ativo);

-- =================================================================
-- PARTE 3: HABILITAR ROW LEVEL SECURITY (RLS)
-- =================================================================

ALTER TABLE public.organizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convites ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- PARTE 4: POLÍTICAS RLS
-- =================================================================

-- Políticas para ORGANIZACOES
DROP POLICY IF EXISTS "organizacoes_select" ON public.organizacoes;
CREATE POLICY "organizacoes_select" ON public.organizacoes
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND (
            id IN (SELECT organizacao_id FROM public.usuarios WHERE id = auth.uid())
            OR auth.jwt()->>'email' = 'admtracksteel@gmail.com'
        )
    );

-- Políticas para USUARIOS
DROP POLICY IF EXISTS "usuarios_select" ON public.usuarios;
CREATE POLICY "usuarios_select" ON public.usuarios
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND (
            organizacao_id IN (SELECT organizacao_id FROM public.usuarios WHERE id = auth.uid())
            OR auth.jwt()->>'email' = 'admtracksteel@gmail.com'
        )
    );

DROP POLICY IF EXISTS "usuarios_insert" ON public.usuarios;
CREATE POLICY "usuarios_insert" ON public.usuarios
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "usuarios_update_own_org" ON public.usuarios;
CREATE POLICY "usuarios_update_own_org" ON public.usuarios
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Políticas para CONVITES
DROP POLICY IF EXISTS "convites_select" ON public.convites;
CREATE POLICY "convites_select" ON public.convites
    FOR SELECT USING (
        auth.uid() IS NOT NULL 
        AND (
            ativo = true 
            OR auth.jwt()->>'email' = 'admtracksteel@gmail.com'
        )
    );

DROP POLICY IF EXISTS "convites_insert" ON public.convites;
CREATE POLICY "convites_insert" ON public.convites
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND (
            organizacao_id IN (
                SELECT u.organizacao_id FROM public.usuarios u WHERE u.id = auth.uid()
            )
            OR auth.jwt()->>'email' = 'admtracksteel@gmail.com'
        )
    );

DROP POLICY IF EXISTS "convites_update" ON public.convites;
CREATE POLICY "convites_update" ON public.convites
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
        AND (
            organizacao_id IN (
                SELECT u.organizacao_id FROM public.usuarios u WHERE u.id = auth.uid()
            )
            OR auth.jwt()->>'email' = 'admtracksteel@gmail.com'
        )
    );

DROP POLICY IF EXISTS "convites_delete" ON public.convites;
CREATE POLICY "convites_delete" ON public.convites
    FOR DELETE USING (
        auth.uid() IS NOT NULL
        AND (
            organizacao_id IN (
                SELECT u.organizacao_id FROM public.usuarios u WHERE u.id = auth.uid()
            )
            OR auth.jwt()->>'email' = 'admtracksteel@gmail.com'
        )
    );

-- =================================================================
-- PARTE 5: FUNÇÕES POSTGRESQL
-- =================================================================

-- Função para usar um convite
CREATE OR REPLACE FUNCTION public.usar_convite(
    p_codigo TEXT,
    p_usuario_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_convite RECORD;
    v_usuario RECORD;
BEGIN
    -- Buscar convite válido
    SELECT * INTO v_convite
    FROM public.convites
    WHERE codigo = UPPER(TRIM(p_codigo))
      AND ativo = true
      AND (expira_em IS NULL OR expira_em > NOW())
      AND (max_usos = 0 OR usos_atuais < max_usos);

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Código de convite inválido, expirado ou já utilizado.'
        );
    END IF;

    -- Verificar se convite é para email específico
    IF v_convite.email_convidado IS NOT NULL THEN
        SELECT * INTO v_usuario FROM public.usuarios WHERE id = p_usuario_id;
        IF v_usuario.email != v_convite.email_convidado THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Este convite é destinado a outro email.'
            );
        END IF;
    END IF;

    -- Verificar se usuário já tem organização
    SELECT * INTO v_usuario FROM public.usuarios WHERE id = p_usuario_id;
    IF v_usuario.organizacao_id IS NOT NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Você já pertence a uma organização.'
        );
    END IF;

    -- Associar usuário à organização
    UPDATE public.usuarios
    SET organizacao_id = v_convite.organizacao_id,
        role = v_convite.role,
        updated_at = NOW()
    WHERE id = p_usuario_id;

    -- Incrementar usos do convite
    UPDATE public.convites
    SET usos_atuais = usos_atuais + 1,
        ativo = CASE 
            WHEN max_usos > 0 AND usos_atuais + 1 >= max_usos THEN false 
            ELSE ativo 
        END,
        updated_at = NOW()
    WHERE id = v_convite.id;

    RETURN json_build_object(
        'success', true,
        'organizacao_id', v_convite.organizacao_id,
        'organizacao_nome', (SELECT nome FROM public.organizacoes WHERE id = v_convite.organizacao_id),
        'role', v_convite.role
    );
END;
$$;

-- Função para gerar código aleatório
CREATE OR REPLACE FUNCTION public.gerar_codigo_convite()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_codigo TEXT;
    v_exists BOOLEAN;
BEGIN
    LOOP
        v_codigo := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));
        SELECT EXISTS(SELECT 1 FROM public.convites WHERE codigo = v_codigo) INTO v_exists;
        EXIT WHEN NOT v_exists;
    END LOOP;
    RETURN v_codigo;
END;
$$;

-- =================================================================
-- PARTE 6: DADOS INICIAIS
-- =================================================================

-- Criar organização TrackSteel Admin (para super admin)
INSERT INTO public.organizacoes (
    nome,
    slug,
    razao_social,
    status,
    plano,
    max_usuarios,
    max_obras,
    max_rdos_mes,
    max_storage_mb
)
VALUES (
    'TrackSteel Admin',
    'tracksteel-admin',
    'TrackSteel Desenvolvimento Ltda',
    'ativa',
    'enterprise',
    999,
    999,
    999999,
    999999
)
ON CONFLICT (slug) DO NOTHING;

-- Criar organização Baldon Engemetal
INSERT INTO public.organizacoes (
    nome,
    slug,
    razao_social,
    status,
    plano,
    max_usuarios,
    max_obras,
    max_rdos_mes,
    max_storage_mb
)
VALUES (
    'Baldon Engemetal',
    'baldon-engemetal',
    'Baldon Engemetal Ltda',
    'ativa',
    'profissional',
    50,
    100,
    1000,
    5120
)
ON CONFLICT (slug) DO NOTHING;

-- Gerar convite inicial para Baldon Engemetal
INSERT INTO public.convites (
    organizacao_id,
    codigo,
    role,
    max_usos,
    ativo
)
SELECT 
    id,
    'BALDON01',
    'admin',
    0,
    true
FROM public.organizacoes
WHERE slug = 'baldon-engemetal'
ON CONFLICT (codigo) DO NOTHING;

-- =================================================================
-- CONCLUÍDO!
-- 
-- SUPER ADMIN:
-- Email: admtracksteel@gmail.com
-- - Acesso automático à organização "TrackSteel Admin"
-- - Bypass de verificação de código de convite
-- - Role: 'dev'
--
-- PRIMEIRA ORGANIZAÇÃO:
-- Nome: Baldon Engemetal
-- Código de convite: BALDON01
-- =================================================================
