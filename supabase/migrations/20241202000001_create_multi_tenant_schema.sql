-- ========================================
-- MIGRATION: Multi-Tenant SaaS Schema (FIXED)
-- Data: 2024-12-02
-- Descrição: Estrutura completa para SaaS multi-tenant
-- ========================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- 1. TABELA DE ORGANIZAÇÕES (TENANTS)
-- ========================================

CREATE TABLE IF NOT EXISTS public.organizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  slug VARCHAR(100) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  razao_social VARCHAR(255),
  cnpj VARCHAR(18) UNIQUE,
  
  -- Contato
  email_contato VARCHAR(255),
  telefone VARCHAR(20),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  
  -- Plano e limites
  plano VARCHAR(50) DEFAULT 'trial' CHECK (plano IN ('trial', 'basic', 'professional', 'enterprise')),
  max_usuarios INTEGER DEFAULT 5,
  max_obras INTEGER DEFAULT 3,
  max_rdos_mes INTEGER DEFAULT 100,
  max_storage_mb INTEGER DEFAULT 500,
  
  -- Personalização
  logo_url TEXT,
  cor_primaria VARCHAR(7) DEFAULT '#3B82F6',
  cor_secundaria VARCHAR(7) DEFAULT '#1E40AF',
  configuracoes JSONB DEFAULT '{}'::jsonb,
  
  -- Status e controle
  status VARCHAR(50) DEFAULT 'ativa' CHECK (status IN ('ativa', 'suspensa', 'cancelada', 'trial')),
  data_trial_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_trial_fim TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
  data_proxima_cobranca TIMESTAMP WITH TIME ZONE,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT slug_length CHECK (length(slug) >= 3 AND length(slug) <= 100)
);

-- Índices para organizações
CREATE INDEX IF NOT EXISTS idx_organizacoes_slug ON public.organizacoes(slug);
CREATE INDEX IF NOT EXISTS idx_organizacoes_status ON public.organizacoes(status);
CREATE INDEX IF NOT EXISTS idx_organizacoes_plano ON public.organizacoes(plano);

-- ========================================
-- 2. TABELA DE USUÁRIOS
-- ========================================

CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organizacao_id UUID REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  
  -- Informações pessoais
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  cpf VARCHAR(14),
  cargo VARCHAR(100),
  
  -- Avatar
  avatar_url TEXT,
  
  -- Status
  ativo BOOLEAN DEFAULT true,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(organizacao_id, email)
);

-- Índices para usuários
CREATE INDEX IF NOT EXISTS idx_usuarios_org ON public.usuarios(organizacao_id, id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON public.usuarios(ativo);

-- ========================================
-- 3. TABELA DE ROLES E PERMISSÕES
-- ========================================

CREATE TABLE IF NOT EXISTS public.organizacao_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  
  -- Role na organização
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'engenheiro', 'mestre_obra', 'usuario')),
  
  -- Permissões customizadas (opcional)
  permissoes_customizadas JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  ativo BOOLEAN DEFAULT true,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(organizacao_id, usuario_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_org_usuarios_org ON public.organizacao_usuarios(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_org_usuarios_user ON public.organizacao_usuarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_org_usuarios_role ON public.organizacao_usuarios(role);

-- ========================================
-- 4. TABELA DE CONVITES
-- ========================================

CREATE TABLE IF NOT EXISTS public.convites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  
  -- Dados do convite
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'engenheiro', 'mestre_obra', 'usuario')),
  token VARCHAR(255) UNIQUE NOT NULL DEFAULT encode(random()::text::bytea, 'hex'),
  
  -- Quem convidou
  convidado_por UUID REFERENCES public.usuarios(id),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceito', 'expirado', 'cancelado')),
  
  -- Datas
  expira_em TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  aceito_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(organizacao_id, email, status)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_convites_org ON public.convites(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_convites_token ON public.convites(token);
CREATE INDEX IF NOT EXISTS idx_convites_status ON public.convites(status);

-- ========================================
-- 5. TABELA DE OBRAS
-- ========================================

CREATE TABLE IF NOT EXISTS public.obras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  
  -- Informações básicas
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  codigo VARCHAR(50),
  
  -- Localização
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  coordenadas JSONB,
  
  -- Cliente e contrato
  cliente VARCHAR(255),
  contrato VARCHAR(100),
  valor_contrato DECIMAL(15,2),
  
  -- Responsável
  responsavel_id UUID REFERENCES public.usuarios(id),
  
  -- Datas
  data_inicio DATE,
  data_prevista_fim DATE,
  data_conclusao DATE,
  
  -- Progresso
  progresso_geral DECIMAL(5,2) DEFAULT 0 CHECK (progresso_geral >= 0 AND progresso_geral <= 100),
  
  -- Status
  status VARCHAR(50) DEFAULT 'planejamento' CHECK (status IN ('planejamento', 'ativa', 'pausada', 'concluida', 'cancelada')),
  
  -- Configurações específicas da obra
  configuracoes JSONB DEFAULT '{}'::jsonb,
  
  -- Observações
  observacoes TEXT,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_obras_org ON public.obras(organizacao_id, id);
CREATE INDEX IF NOT EXISTS idx_obras_status ON public.obras(status);
CREATE INDEX IF NOT EXISTS idx_obras_responsavel ON public.obras(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_obras_data_inicio ON public.obras(data_inicio);

-- ========================================
-- 6. TABELA DE RDOs
-- ========================================

CREATE TABLE IF NOT EXISTS public.rdos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  
  -- Número sequencial por obra
  numero INTEGER NOT NULL,
  
  -- Criador
  criado_por UUID NOT NULL REFERENCES public.usuarios(id),
  
  -- Data do relatório
  data_relatorio DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Condições climáticas
  condicoes_climaticas VARCHAR(50),
  temperatura_min DECIMAL(5,2),
  temperatura_max DECIMAL(5,2),
  observacoes_clima TEXT,
  
  -- Observações gerais
  observacoes_gerais TEXT,
  
  -- Status e aprovação
  status VARCHAR(50) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviado', 'aprovado', 'rejeitado')),
  aprovado_por UUID REFERENCES public.usuarios(id),
  aprovado_em TIMESTAMP WITH TIME ZONE,
  motivo_rejeicao TEXT,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(obra_id, numero),
  UNIQUE(obra_id, data_relatorio)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_rdos_org ON public.rdos(organizacao_id, id);
CREATE INDEX IF NOT EXISTS idx_rdos_obra ON public.rdos(obra_id);
CREATE INDEX IF NOT EXISTS idx_rdos_criador ON public.rdos(criado_por);
CREATE INDEX IF NOT EXISTS idx_rdos_data ON public.rdos(data_relatorio);
CREATE INDEX IF NOT EXISTS idx_rdos_status ON public.rdos(status);

-- ========================================
-- 7. TABELAS RELACIONADAS AO RDO
-- ========================================

-- 7.1 Atividades do RDO
CREATE TABLE IF NOT EXISTS public.rdo_atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  rdo_id UUID NOT NULL REFERENCES public.rdos(id) ON DELETE CASCADE,
  
  tipo_atividade VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  localizacao VARCHAR(255),
  percentual_concluido DECIMAL(5,2) DEFAULT 0 CHECK (percentual_concluido >= 0 AND percentual_concluido <= 100),
  ordem INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rdo_atividades_org ON public.rdo_atividades(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_rdo_atividades_rdo ON public.rdo_atividades(rdo_id);

-- 7.2 Mão de Obra
CREATE TABLE IF NOT EXISTS public.rdo_mao_obra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  rdo_id UUID NOT NULL REFERENCES public.rdos(id) ON DELETE CASCADE,
  
  nome VARCHAR(255) NOT NULL,
  funcao VARCHAR(100) NOT NULL,
  quantidade INTEGER DEFAULT 1,
  horas_trabalhadas DECIMAL(5,2) DEFAULT 8,
  observacoes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rdo_mao_obra_org ON public.rdo_mao_obra(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_rdo_mao_obra_rdo ON public.rdo_mao_obra(rdo_id);

-- 7.3 Equipamentos
CREATE TABLE IF NOT EXISTS public.rdo_equipamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  rdo_id UUID NOT NULL REFERENCES public.rdos(id) ON DELETE CASCADE,
  
  nome_equipamento VARCHAR(255) NOT NULL,
  tipo VARCHAR(100),
  horas_utilizadas DECIMAL(5,2) DEFAULT 0,
  combustivel_gasto DECIMAL(10,2) DEFAULT 0,
  observacoes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rdo_equipamentos_org ON public.rdo_equipamentos(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_rdo_equipamentos_rdo ON public.rdo_equipamentos(rdo_id);

-- 7.4 Ocorrências
CREATE TABLE IF NOT EXISTS public.rdo_ocorrencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  rdo_id UUID NOT NULL REFERENCES public.rdos(id) ON DELETE CASCADE,
  
  tipo_ocorrencia VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  gravidade VARCHAR(50) DEFAULT 'media' CHECK (gravidade IN ('baixa', 'media', 'alta', 'critica')),
  acao_tomada TEXT,
  resolvida BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rdo_ocorrencias_org ON public.rdo_ocorrencias(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_rdo_ocorrencias_rdo ON public.rdo_ocorrencias(rdo_id);
CREATE INDEX IF NOT EXISTS idx_rdo_ocorrencias_gravidade ON public.rdo_ocorrencias(gravidade);

-- 7.5 Anexos (Fotos e Documentos)
CREATE TABLE IF NOT EXISTS public.rdo_anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  rdo_id UUID NOT NULL REFERENCES public.rdos(id) ON DELETE CASCADE,
  
  nome_arquivo VARCHAR(255) NOT NULL,
  tipo_arquivo VARCHAR(100),
  url_storage TEXT NOT NULL,
  tamanho_bytes BIGINT,
  descricao TEXT,
  ordem INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rdo_anexos_org ON public.rdo_anexos(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_rdo_anexos_rdo ON public.rdo_anexos(rdo_id);

-- 7.6 Inspeções de Solda (específico para estruturas metálicas)
CREATE TABLE IF NOT EXISTS public.rdo_inspecoes_solda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  rdo_id UUID NOT NULL REFERENCES public.rdos(id) ON DELETE CASCADE,
  
  identificacao_junta VARCHAR(100) NOT NULL,
  status_inspecao VARCHAR(50) DEFAULT 'pendente' CHECK (status_inspecao IN ('aprovado', 'reprovado', 'pendente')),
  metodo_inspecao VARCHAR(100),
  observacoes TEXT,
  inspecionado_por VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rdo_inspecoes_org ON public.rdo_inspecoes_solda(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_rdo_inspecoes_rdo ON public.rdo_inspecoes_solda(rdo_id);

-- 7.7 Verificações de Torque (específico para estruturas metálicas)
CREATE TABLE IF NOT EXISTS public.rdo_verificacoes_torque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  rdo_id UUID NOT NULL REFERENCES public.rdos(id) ON DELETE CASCADE,
  
  identificacao_parafuso VARCHAR(100) NOT NULL,
  torque_especificado DECIMAL(10,2) DEFAULT 0,
  torque_aplicado DECIMAL(10,2) NOT NULL,
  status_verificacao VARCHAR(50) DEFAULT 'conforme' CHECK (status_verificacao IN ('conforme', 'nao_conforme')),
  observacoes TEXT,
  verificado_por VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rdo_verificacoes_org ON public.rdo_verificacoes_torque(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_rdo_verificacoes_rdo ON public.rdo_verificacoes_torque(rdo_id);

-- ========================================
-- 8. TABELA DE TAREFAS
-- ========================================

CREATE TABLE IF NOT EXISTS public.tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  
  status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
  prioridade VARCHAR(50) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
  
  responsavel_id UUID REFERENCES public.usuarios(id),
  
  data_inicio DATE,
  data_fim DATE,
  progresso DECIMAL(5,2) DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  
  metadados JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tarefas_org ON public.tarefas(organizacao_id, id);
CREATE INDEX IF NOT EXISTS idx_tarefas_obra ON public.tarefas(obra_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_responsavel ON public.tarefas(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON public.tarefas(status);

-- ========================================
-- 9. TABELA DE LOGS DE TAREFAS
-- ========================================

CREATE TABLE IF NOT EXISTS public.task_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tarefas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id),
  
  tipo_evento VARCHAR(50) NOT NULL CHECK (tipo_evento IN ('inicio', 'pausa', 'retomada', 'conclusao', 'revisao', 'edicao', 'cancelamento')),
  descricao TEXT,
  detalhes JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_logs_org ON public.task_logs(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_task ON public.task_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_usuario ON public.task_logs(usuario_id);

-- ========================================
-- 10. TABELA DE MÉTRICAS E USO
-- ========================================

CREATE TABLE IF NOT EXISTS public.organizacao_metricas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  mes_referencia DATE NOT NULL,
  
  -- Contadores
  total_usuarios INTEGER DEFAULT 0,
  total_obras INTEGER DEFAULT 0,
  total_rdos INTEGER DEFAULT 0,
  storage_usado_mb DECIMAL(10,2) DEFAULT 0,
  
  -- Limites do plano
  limite_usuarios INTEGER,
  limite_obras INTEGER,
  limite_rdos_mes INTEGER,
  limite_storage_mb INTEGER,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organizacao_id, mes_referencia)
);

CREATE INDEX IF NOT EXISTS idx_org_metricas_org ON public.organizacao_metricas(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_org_metricas_mes ON public.organizacao_metricas(mes_referencia);

-- ========================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ========================================

COMMENT ON TABLE public.organizacoes IS 'Organizações/empresas (tenants) do sistema SaaS';
COMMENT ON TABLE public.usuarios IS 'Usuários do sistema vinculados a organizações';
COMMENT ON TABLE public.organizacao_usuarios IS 'Relacionamento entre usuários e organizações com roles';
COMMENT ON TABLE public.convites IS 'Convites pendentes para novos usuários';
COMMENT ON TABLE public.obras IS 'Obras/projetos de construção';
COMMENT ON TABLE public.rdos IS 'Relatórios Diários de Obra';
COMMENT ON TABLE public.rdo_atividades IS 'Atividades executadas registradas no RDO';
COMMENT ON TABLE public.rdo_mao_obra IS 'Mão de obra presente no dia do RDO';
COMMENT ON TABLE public.rdo_equipamentos IS 'Equipamentos utilizados no dia do RDO';
COMMENT ON TABLE public.rdo_ocorrencias IS 'Ocorrências e problemas reportados no RDO';
COMMENT ON TABLE public.rdo_anexos IS 'Fotos e documentos anexados ao RDO';
COMMENT ON TABLE public.rdo_inspecoes_solda IS 'Inspeções de solda para estruturas metálicas';
COMMENT ON TABLE public.rdo_verificacoes_torque IS 'Verificações de torque de parafusos';
COMMENT ON TABLE public.tarefas IS 'Tarefas planejadas para as obras';
COMMENT ON TABLE public.task_logs IS 'Histórico de eventos das tarefas';
COMMENT ON TABLE public.organizacao_metricas IS 'Métricas de uso por organização';
