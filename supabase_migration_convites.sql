-- =================================================================
-- MIGRAÇÃO: Sistema de Convites + Super Admin
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =================================================================

-- 1. Remover tabela de convites se existir (para recriar limpa)
DROP TABLE IF EXISTS public.convites CASCADE;

-- 2. Criar tabela de convites
CREATE TABLE public.convites (
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

-- 3. Índices para performance
CREATE INDEX idx_convites_codigo ON public.convites(codigo);
CREATE INDEX idx_convites_organizacao ON public.convites(organizacao_id);
CREATE INDEX idx_convites_ativo ON public.convites(ativo);

-- 4. Habilitar RLS
ALTER TABLE public.convites ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS (com exceção para super admin)
CREATE POLICY "convites_select" ON public.convites
    FOR SELECT USING (
        auth.uid() IS NOT NULL 
        AND (
            ativo = true 
            OR auth.jwt()->>'email' = 'admtracksteel@gmail.com'
        )
    );

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

-- 6. Política para usuários atualizarem seu próprio organizacao_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'usuarios' 
        AND policyname = 'usuarios_update_own_org'
    ) THEN
        CREATE POLICY "usuarios_update_own_org" ON public.usuarios
            FOR UPDATE USING (auth.uid() = id)
            WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- 7. Função para usar um convite
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

-- 8. Função para gerar código aleatório
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
-- 9. CRIAR ORGANIZAÇÃO ESPECIAL: TrackSteel Admin
-- =================================================================
INSERT INTO public.organizacoes (
    nome,
    slug,
    razao_social,
    status,
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
    999,
    999,
    999999,
    999999
)
ON CONFLICT DO NOTHING;

-- =================================================================
-- 10. CRIAR PRIMEIRA ORGANIZAÇÃO: Baldon Engemetal
-- =================================================================
INSERT INTO public.organizacoes (
    nome,
    slug,
    razao_social,
    status,
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
    50,
    100,
    1000,
    5120
)
ON CONFLICT DO NOTHING;

-- 11. Gerar convite inicial para Baldon (admin, sem limite, sem expiração)
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
WHERE nome = 'Baldon Engemetal'
ON CONFLICT (codigo) DO NOTHING;

-- =================================================================
-- RESUMO:
-- 
-- SUPER ADMIN:
-- Email: admtracksteel@gmail.com
-- - Acesso automático à organização "TrackSteel Admin"
-- - Bypass de verificação de código de convite
-- - Pode criar convites para qualquer organização
-- - Acesso total ao sistema
--
-- PRIMEIRA ORGANIZAÇÃO:
-- Nome: Baldon Engemetal
-- Código de convite: BALDON01
-- Tipo: Admin, sem limite de usos, sem expiração
-- =================================================================
