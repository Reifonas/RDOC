-- ========================================
-- MIGRATION: Seed Initial Data
-- Data: 2024-12-02
-- Descrição: Dados iniciais e configurações padrão
-- ========================================

-- ========================================
-- 1. CRIAR ORGANIZAÇÃO DEMO (OPCIONAL)
-- ========================================

-- Inserir organização demo para testes
INSERT INTO public.organizacoes (
  slug,
  nome,
  razao_social,
  email_contato,
  plano,
  max_usuarios,
  max_obras,
  max_rdos_mes,
  max_storage_mb,
  status,
  configuracoes
) VALUES (
  'demo-construcoes',
  'Demo Construções',
  'Demo Construções Ltda',
  'contato@demo.com',
  'professional',
  20,
  10,
  500,
  5000,
  'ativa',
  '{
    "tipos_atividade": [
      "Montagem de Estrutura Metálica",
      "Soldagem",
      "Pintura",
      "Instalação de Telhas",
      "Fundação",
      "Concretagem",
      "Alvenaria",
      "Instalações Elétricas",
      "Instalações Hidráulicas",
      "Acabamento"
    ],
    "funcoes_mao_obra": [
      "Engenheiro",
      "Mestre de Obras",
      "Soldador",
      "Montador",
      "Pintor",
      "Pedreiro",
      "Servente",
      "Eletricista",
      "Encanador",
      "Carpinteiro",
      "Armador"
    ],
    "tipos_equipamento": [
      "Guindaste",
      "Empilhadeira",
      "Betoneira",
      "Compressor",
      "Gerador",
      "Andaime",
      "Plataforma Elevatória",
      "Máquina de Solda",
      "Esmerilhadeira",
      "Furadeira"
    ],
    "condicoes_climaticas": [
      "Ensolarado",
      "Parcialmente Nublado",
      "Nublado",
      "Chuvisco",
      "Chuva Leve",
      "Chuva Forte",
      "Tempestade",
      "Neblina"
    ],
    "tipos_ocorrencia": [
      "Acidente de Trabalho",
      "Falta de Material",
      "Equipamento Quebrado",
      "Atraso de Fornecedor",
      "Problema de Qualidade",
      "Condição Climática Adversa",
      "Falta de Energia",
      "Problema de Acesso",
      "Outro"
    ],
    "aprovacao_automatica_rdo": false,
    "notificacoes_email": true,
    "backup_automatico": true,
    "campos_rdo_obrigatorios": ["condicoes_climaticas", "observacoes_gerais"]
  }'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- 2. CONFIGURAÇÕES PADRÃO PARA NOVAS ORGANIZAÇÕES
-- ========================================

-- Criar função para aplicar configurações padrão
CREATE OR REPLACE FUNCTION public.aplicar_configuracoes_padrao()
RETURNS TRIGGER AS $$
BEGIN
  -- Se configuracoes está vazio, aplicar padrões
  IF NEW.configuracoes = '{}'::jsonb THEN
    NEW.configuracoes := '{
      "tipos_atividade": [
        "Montagem de Estrutura Metálica",
        "Soldagem",
        "Pintura",
        "Instalação de Telhas",
        "Fundação",
        "Concretagem",
        "Alvenaria"
      ],
      "funcoes_mao_obra": [
        "Engenheiro",
        "Mestre de Obras",
        "Soldador",
        "Montador",
        "Pedreiro",
        "Servente"
      ],
      "tipos_equipamento": [
        "Guindaste",
        "Empilhadeira",
        "Betoneira",
        "Compressor",
        "Gerador"
      ],
      "condicoes_climaticas": [
        "Ensolarado",
        "Nublado",
        "Chuvoso"
      ],
      "tipos_ocorrencia": [
        "Acidente de Trabalho",
        "Falta de Material",
        "Equipamento Quebrado",
        "Outro"
      ],
      "aprovacao_automatica_rdo": false,
      "notificacoes_email": true,
      "backup_automatico": true
    }'::jsonb;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER aplicar_configuracoes_padrao_trigger
    BEFORE INSERT ON public.organizacoes
    FOR EACH ROW EXECUTE FUNCTION public.aplicar_configuracoes_padrao();

-- ========================================
-- 3. FUNÇÃO PARA CRIAR PRIMEIRA ORGANIZAÇÃO
-- ========================================

-- Função helper para criar organização completa com primeiro usuário
CREATE OR REPLACE FUNCTION public.criar_organizacao_com_owner(
  p_slug VARCHAR(100),
  p_nome VARCHAR(255),
  p_email_usuario VARCHAR(255),
  p_nome_usuario VARCHAR(255),
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Criar organização
  INSERT INTO public.organizacoes (slug, nome, email_contato, status)
  VALUES (p_slug, p_nome, p_email_usuario, 'trial')
  RETURNING id INTO v_org_id;
  
  -- Criar usuário
  INSERT INTO public.usuarios (id, organizacao_id, nome, email)
  VALUES (p_user_id, v_org_id, p_nome_usuario, p_email_usuario)
  ON CONFLICT (id) DO UPDATE SET
    organizacao_id = v_org_id,
    nome = p_nome_usuario,
    email = p_email_usuario;
  
  -- Associar usuário como owner
  INSERT INTO public.organizacao_usuarios (organizacao_id, usuario_id, role)
  VALUES (v_org_id, p_user_id, 'owner');
  
  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 4. FUNÇÃO PARA ACEITAR CONVITE
-- ========================================

CREATE OR REPLACE FUNCTION public.aceitar_convite(
  p_token VARCHAR(255),
  p_user_id UUID,
  p_nome_usuario VARCHAR(255),
  p_email_usuario VARCHAR(255)
)
RETURNS JSONB AS $$
DECLARE
  v_convite RECORD;
  v_org_id UUID;
BEGIN
  -- Buscar convite
  SELECT * INTO v_convite
  FROM public.convites
  WHERE token = p_token
    AND status = 'pendente'
    AND expira_em > NOW();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Convite inválido ou expirado'
    );
  END IF;
  
  -- Verificar se email corresponde
  IF v_convite.email != p_email_usuario THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Email não corresponde ao convite'
    );
  END IF;
  
  v_org_id := v_convite.organizacao_id;
  
  -- Criar usuário
  INSERT INTO public.usuarios (id, organizacao_id, nome, email)
  VALUES (p_user_id, v_org_id, p_nome_usuario, p_email_usuario)
  ON CONFLICT (id) DO UPDATE SET
    organizacao_id = v_org_id,
    nome = p_nome_usuario,
    email = p_email_usuario;
  
  -- Associar usuário à organização com role do convite
  INSERT INTO public.organizacao_usuarios (organizacao_id, usuario_id, role)
  VALUES (v_org_id, p_user_id, v_convite.role)
  ON CONFLICT (organizacao_id, usuario_id) DO UPDATE SET
    role = v_convite.role,
    ativo = true;
  
  -- Marcar convite como aceito
  UPDATE public.convites
  SET status = 'aceito', aceito_em = NOW()
  WHERE id = v_convite.id;
  
  RETURN jsonb_build_object(
    'success', true,
    'organizacao_id', v_org_id,
    'role', v_convite.role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 5. FUNÇÃO PARA CRIAR CONVITE
-- ========================================

CREATE OR REPLACE FUNCTION public.criar_convite(
  p_organizacao_id UUID,
  p_email VARCHAR(255),
  p_role VARCHAR(50),
  p_convidado_por UUID
)
RETURNS JSONB AS $$
DECLARE
  v_convite_id UUID;
  v_token VARCHAR(255);
  v_user_role TEXT;
BEGIN
  -- Verificar se quem está convidando tem permissão
  SELECT role INTO v_user_role
  FROM public.organizacao_usuarios
  WHERE organizacao_id = p_organizacao_id
    AND usuario_id = p_convidado_por
    AND ativo = true;
  
  IF v_user_role NOT IN ('owner', 'admin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Sem permissão para criar convites'
    );
  END IF;
  
  -- Cancelar convites pendentes anteriores para o mesmo email
  UPDATE public.convites
  SET status = 'cancelado'
  WHERE organizacao_id = p_organizacao_id
    AND email = p_email
    AND status = 'pendente';
  
  -- Criar novo convite
  INSERT INTO public.convites (
    organizacao_id,
    email,
    role,
    convidado_por
  ) VALUES (
    p_organizacao_id,
    p_email,
    p_role,
    p_convidado_por
  )
  RETURNING id, token INTO v_convite_id, v_token;
  
  RETURN jsonb_build_object(
    'success', true,
    'convite_id', v_convite_id,
    'token', v_token
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 6. VIEW PARA ESTATÍSTICAS DA ORGANIZAÇÃO
-- ========================================

CREATE OR REPLACE VIEW public.v_organizacao_estatisticas AS
SELECT 
  o.id AS organizacao_id,
  o.slug,
  o.nome,
  o.plano,
  o.status,
  
  -- Contadores
  COUNT(DISTINCT u.id) FILTER (WHERE u.ativo = true) AS total_usuarios_ativos,
  COUNT(DISTINCT ob.id) AS total_obras,
  COUNT(DISTINCT ob.id) FILTER (WHERE ob.status = 'ativa') AS obras_ativas,
  COUNT(DISTINCT r.id) AS total_rdos,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'aprovado') AS rdos_aprovados,
  COUNT(DISTINCT t.id) AS total_tarefas,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'concluida') AS tarefas_concluidas,
  
  -- Limites
  o.max_usuarios,
  o.max_obras,
  o.max_rdos_mes,
  o.max_storage_mb,
  
  -- Percentuais de uso
  ROUND((COUNT(DISTINCT u.id) FILTER (WHERE u.ativo = true)::DECIMAL / NULLIF(o.max_usuarios, 0)) * 100, 2) AS percentual_usuarios,
  ROUND((COUNT(DISTINCT ob.id)::DECIMAL / NULLIF(o.max_obras, 0)) * 100, 2) AS percentual_obras,
  
  -- Datas
  o.data_trial_fim,
  o.data_proxima_cobranca,
  o.created_at

FROM public.organizacoes o
LEFT JOIN public.usuarios u ON u.organizacao_id = o.id
LEFT JOIN public.obras ob ON ob.organizacao_id = o.id
LEFT JOIN public.rdos r ON r.organizacao_id = o.id
LEFT JOIN public.tarefas t ON t.organizacao_id = o.id
GROUP BY o.id;

-- ========================================
-- COMENTÁRIOS
-- ========================================

COMMENT ON FUNCTION criar_organizacao_com_owner(VARCHAR, VARCHAR, VARCHAR, VARCHAR, UUID) IS 
  'Cria uma nova organização com o primeiro usuário como owner';

COMMENT ON FUNCTION aceitar_convite(VARCHAR, UUID, VARCHAR, VARCHAR) IS 
  'Processa aceitação de convite e vincula usuário à organização';

COMMENT ON FUNCTION criar_convite(UUID, VARCHAR, VARCHAR, UUID) IS 
  'Cria um novo convite para usuário entrar na organização';

COMMENT ON VIEW v_organizacao_estatisticas IS 
  'View com estatísticas consolidadas de cada organização';
