-- Migration: Criar estrutura completa do banco de dados RDO
-- Data: 2024-01-20
-- Descrição: Criação de todas as tabelas, índices, triggers e políticas RLS

-- ========================================
-- EXTENSÕES NECESSÁRIAS
-- ========================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- TABELAS PRINCIPAIS
-- ========================================

-- Tabela de usuários (estende auth.users)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    cargo VARCHAR(100),
    role VARCHAR(50) DEFAULT 'usuario' CHECK (role IN ('admin', 'engenheiro', 'mestre_obra', 'usuario')),
    ativo BOOLEAN DEFAULT true,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de obras
CREATE TABLE IF NOT EXISTS public.obras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    cliente VARCHAR(255),
    contrato VARCHAR(100),
    valor_contrato DECIMAL(15,2),
    data_inicio DATE,
    data_fim_prevista DATE,
    data_fim_real DATE,
    status VARCHAR(50) DEFAULT 'planejamento' CHECK (status IN ('planejamento', 'em_andamento', 'pausada', 'concluida', 'cancelada')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento obra-usuários
CREATE TABLE IF NOT EXISTS public.obra_usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(obra_id, usuario_id)
);

-- Tabela de RDOs
CREATE TABLE IF NOT EXISTS public.rdos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero INTEGER NOT NULL,
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    clima VARCHAR(50),
    temperatura_min DECIMAL(5,2),
    temperatura_max DECIMAL(5,2),
    observacoes_gerais TEXT,
    observacoes_clima TEXT,
    status VARCHAR(50) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviado', 'aprovado', 'rejeitado')),
    data_envio TIMESTAMP WITH TIME ZONE,
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    data_rejeicao TIMESTAMP WITH TIME ZONE,
    observacoes_aprovacao TEXT,
    motivo_rejeicao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(obra_id, numero)
);

-- Tabela de funcionários do RDO
CREATE TABLE IF NOT EXISTS public.rdo_funcionarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rdo_id UUID NOT NULL REFERENCES public.rdos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    funcao VARCHAR(100),
    horas_trabalhadas DECIMAL(5,2) DEFAULT 0,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de equipamentos do RDO
CREATE TABLE IF NOT EXISTS public.rdo_equipamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rdo_id UUID NOT NULL REFERENCES public.rdos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    horas_utilizadas DECIMAL(5,2) DEFAULT 0,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de materiais do RDO
CREATE TABLE IF NOT EXISTS public.rdo_materiais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rdo_id UUID NOT NULL REFERENCES public.rdos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    unidade VARCHAR(20),
    quantidade_utilizada DECIMAL(10,3) DEFAULT 0,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de serviços do RDO
CREATE TABLE IF NOT EXISTS public.rdo_servicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rdo_id UUID NOT NULL REFERENCES public.rdos(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    unidade VARCHAR(20),
    quantidade_executada DECIMAL(10,3) DEFAULT 0,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fotos do RDO
CREATE TABLE IF NOT EXISTS public.rdo_fotos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rdo_id UUID NOT NULL REFERENCES public.rdos(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    descricao TEXT,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de anexos do RDO
CREATE TABLE IF NOT EXISTS public.rdo_anexos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rdo_id UUID NOT NULL REFERENCES public.rdos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    tipo VARCHAR(100),
    tamanho INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS public.configuracoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descricao TEXT,
    tipo VARCHAR(50) DEFAULT 'string' CHECK (tipo IN ('string', 'number', 'boolean', 'json')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para usuários
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON public.usuarios(role);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON public.usuarios(ativo);

-- Índices para obras
CREATE INDEX IF NOT EXISTS idx_obras_status ON public.obras(status);
CREATE INDEX IF NOT EXISTS idx_obras_cliente ON public.obras(cliente);
CREATE INDEX IF NOT EXISTS idx_obras_data_inicio ON public.obras(data_inicio);

-- Índices para obra_usuarios
CREATE INDEX IF NOT EXISTS idx_obra_usuarios_obra_id ON public.obra_usuarios(obra_id);
CREATE INDEX IF NOT EXISTS idx_obra_usuarios_usuario_id ON public.obra_usuarios(usuario_id);

-- Índices para RDOs
CREATE INDEX IF NOT EXISTS idx_rdos_obra_id ON public.rdos(obra_id);
CREATE INDEX IF NOT EXISTS idx_rdos_usuario_id ON public.rdos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_rdos_data ON public.rdos(data);
CREATE INDEX IF NOT EXISTS idx_rdos_status ON public.rdos(status);
CREATE INDEX IF NOT EXISTS idx_rdos_numero ON public.rdos(obra_id, numero);

-- Índices para tabelas relacionadas ao RDO
CREATE INDEX IF NOT EXISTS idx_rdo_funcionarios_rdo_id ON public.rdo_funcionarios(rdo_id);
CREATE INDEX IF NOT EXISTS idx_rdo_equipamentos_rdo_id ON public.rdo_equipamentos(rdo_id);
CREATE INDEX IF NOT EXISTS idx_rdo_materiais_rdo_id ON public.rdo_materiais(rdo_id);
CREATE INDEX IF NOT EXISTS idx_rdo_servicos_rdo_id ON public.rdo_servicos(rdo_id);
CREATE INDEX IF NOT EXISTS idx_rdo_fotos_rdo_id ON public.rdo_fotos(rdo_id);
CREATE INDEX IF NOT EXISTS idx_rdo_anexos_rdo_id ON public.rdo_anexos(rdo_id);

-- Índices para configurações
CREATE INDEX IF NOT EXISTS idx_configuracoes_chave ON public.configuracoes(chave);

-- ========================================
-- TRIGGERS PARA UPDATED_AT
-- ========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_obras_updated_at BEFORE UPDATE ON public.obras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rdos_updated_at BEFORE UPDATE ON public.rdos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON public.configuracoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FUNÇÃO PARA CRIAR USUÁRIO AUTOMATICAMENTE
-- ========================================

-- Função para criar perfil de usuário automaticamente após registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, nome, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
        NEW.email,
        'usuario'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar usuário automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obra_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdo_funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdo_equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdo_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdo_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdo_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdo_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS RLS BÁSICAS
-- ========================================

-- Políticas para usuários
CREATE POLICY "Usuários podem ver próprio perfil" ON public.usuarios
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil" ON public.usuarios
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para obras (usuários só veem obras que participam)
CREATE POLICY "Usuários veem obras que participam" ON public.obras
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.obra_usuarios 
            WHERE obra_id = id AND usuario_id = auth.uid()
        )
    );

-- Políticas para obra_usuarios
CREATE POLICY "Usuários veem próprias associações" ON public.obra_usuarios
    FOR SELECT USING (usuario_id = auth.uid());

-- Políticas para RDOs (usuários só veem RDOs de obras que participam)
CREATE POLICY "Usuários veem RDOs de suas obras" ON public.rdos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.obra_usuarios 
            WHERE obra_id = rdos.obra_id AND usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar RDOs em suas obras" ON public.rdos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.obra_usuarios 
            WHERE obra_id = rdos.obra_id AND usuario_id = auth.uid()
        ) AND usuario_id = auth.uid()
    );

CREATE POLICY "Usuários podem atualizar próprios RDOs" ON public.rdos
    FOR UPDATE USING (usuario_id = auth.uid());

-- Políticas para tabelas relacionadas ao RDO
CREATE POLICY "Usuários veem funcionários de seus RDOs" ON public.rdo_funcionarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rdos 
            WHERE id = rdo_id AND usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem gerenciar funcionários de seus RDOs" ON public.rdo_funcionarios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.rdos 
            WHERE id = rdo_id AND usuario_id = auth.uid()
        )
    );

-- Aplicar políticas similares para outras tabelas relacionadas
CREATE POLICY "Usuários veem equipamentos de seus RDOs" ON public.rdo_equipamentos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rdos 
            WHERE id = rdo_id AND usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem gerenciar equipamentos de seus RDOs" ON public.rdo_equipamentos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.rdos 
            WHERE id = rdo_id AND usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários veem materiais de seus RDOs" ON public.rdo_materiais
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rdos 
            WHERE id = rdo_id AND usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem gerenciar materiais de seus RDOs" ON public.rdo_materiais
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.rdos 
            WHERE id = rdo_id AND usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários veem serviços de seus RDOs" ON public.rdo_servicos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rdos 
            WHERE id = rdo_id AND usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem gerenciar serviços de seus RDOs" ON public.rdo_servicos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.rdos 
            WHERE id = rdo_id AND usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários veem fotos de seus RDOs" ON public.rdo_fotos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rdos 
            WHERE id = rdo_id AND usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem gerenciar fotos de seus RDOs" ON public.rdo_fotos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.rdos 
            WHERE id = rdo_id AND usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários veem anexos de seus RDOs" ON public.rdo_anexos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rdos 
            WHERE id = rdo_id AND usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem gerenciar anexos de seus RDOs" ON public.rdo_anexos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.rdos 
            WHERE id = rdo_id AND usuario_id = auth.uid()
        )
    );

-- Políticas para configurações (apenas admins)
CREATE POLICY "Apenas admins veem configurações" ON public.configuracoes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Apenas admins podem gerenciar configurações" ON public.configuracoes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================
-- DADOS INICIAIS
-- ========================================

-- Inserir configurações padrão do sistema
INSERT INTO public.configuracoes (chave, valor, descricao, tipo) VALUES
    ('app_name', 'RDO Mobile', 'Nome da aplicação', 'string'),
    ('app_version', '1.0.0', 'Versão da aplicação', 'string'),
    ('max_fotos_rdo', '10', 'Máximo de fotos por RDO', 'number'),
    ('max_anexos_rdo', '5', 'Máximo de anexos por RDO', 'number'),
    ('auto_backup', 'true', 'Backup automático habilitado', 'boolean'),
    ('offline_sync_interval', '300', 'Intervalo de sincronização offline (segundos)', 'number')
ON CONFLICT (chave) DO NOTHING;

-- ========================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ========================================

COMMENT ON TABLE public.usuarios IS 'Perfis de usuários do sistema';
COMMENT ON TABLE public.obras IS 'Obras/projetos de construção';
COMMENT ON TABLE public.obra_usuarios IS 'Relacionamento entre obras e usuários';
COMMENT ON TABLE public.rdos IS 'Relatórios Diários de Obra';
COMMENT ON TABLE public.rdo_funcionarios IS 'Funcionários registrados em cada RDO';
COMMENT ON TABLE public.rdo_equipamentos IS 'Equipamentos utilizados em cada RDO';
COMMENT ON TABLE public.rdo_materiais IS 'Materiais utilizados em cada RDO';
COMMENT ON TABLE public.rdo_servicos IS 'Serviços executados em cada RDO';
COMMENT ON TABLE public.rdo_fotos IS 'Fotos anexadas aos RDOs';
COMMENT ON TABLE public.rdo_anexos IS 'Arquivos anexados aos RDOs';
COMMENT ON TABLE public.configuracoes IS 'Configurações gerais do sistema';