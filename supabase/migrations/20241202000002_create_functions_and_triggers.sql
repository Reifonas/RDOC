-- ========================================
-- MIGRATION: Functions and Triggers (FIXED)
-- Data: 2024-12-02
-- Descrição: Funções auxiliares e triggers automáticos
-- ========================================

-- ========================================
-- 1. FUNÇÃO PARA ATUALIZAR UPDATED_AT
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas relevantes
CREATE TRIGGER update_organizacoes_updated_at BEFORE UPDATE ON public.organizacoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizacao_usuarios_updated_at BEFORE UPDATE ON public.organizacao_usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_obras_updated_at BEFORE UPDATE ON public.obras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rdos_updated_at BEFORE UPDATE ON public.rdos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tarefas_updated_at BEFORE UPDATE ON public.tarefas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 2. FUNÇÃO PARA CRIAR USUÁRIO AUTOMATICAMENTE
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_nome TEXT;
  v_email TEXT;
BEGIN
  -- Extrair dados do metadata
  v_nome := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email);
  v_email := NEW.email;
  v_org_id := (NEW.raw_user_meta_data->>'organizacao_id')::UUID;
  
  -- Se não tem org_id no metadata, não criar o perfil ainda
  -- (será criado quando aceitar um convite)
  IF v_org_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Criar perfil de usuário
  INSERT INTO public.usuarios (id, organizacao_id, nome, email)
  VALUES (NEW.id, v_org_id, v_nome, v_email)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar usuário automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 3. FUNÇÃO PARA AUTO-INCREMENTAR NÚMERO DO RDO
-- ========================================

CREATE OR REPLACE FUNCTION public.set_rdo_numero()
RETURNS TRIGGER AS $$
DECLARE
  v_max_numero INTEGER;
BEGIN
  -- Se já tem número, não fazer nada
  IF NEW.numero IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Buscar o maior número para esta obra
  SELECT COALESCE(MAX(numero), 0) INTO v_max_numero
  FROM public.rdos
  WHERE obra_id = NEW.obra_id;
  
  -- Atribuir próximo número
  NEW.numero := v_max_numero + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_rdo_numero_trigger
    BEFORE INSERT ON public.rdos
    FOR EACH ROW EXECUTE FUNCTION public.set_rdo_numero();

-- ========================================
-- 4. FUNÇÃO PARA PROPAGAR ORGANIZACAO_ID
-- ========================================

-- Quando criar um RDO, copiar organizacao_id da obra
CREATE OR REPLACE FUNCTION public.set_rdo_organizacao_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organizacao_id IS NULL THEN
    SELECT organizacao_id INTO NEW.organizacao_id
    FROM public.obras
    WHERE id = NEW.obra_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_rdo_organizacao_id_trigger
    BEFORE INSERT ON public.rdos
    FOR EACH ROW EXECUTE FUNCTION public.set_rdo_organizacao_id();

-- Propagar para tabelas relacionadas ao RDO
CREATE OR REPLACE FUNCTION public.set_rdo_child_organizacao_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organizacao_id IS NULL THEN
    SELECT organizacao_id INTO NEW.organizacao_id
    FROM public.rdos
    WHERE id = NEW.rdo_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_rdo_atividades_org_trigger
    BEFORE INSERT ON public.rdo_atividades
    FOR EACH ROW EXECUTE FUNCTION public.set_rdo_child_organizacao_id();

CREATE TRIGGER set_rdo_mao_obra_org_trigger
    BEFORE INSERT ON public.rdo_mao_obra
    FOR EACH ROW EXECUTE FUNCTION public.set_rdo_child_organizacao_id();

CREATE TRIGGER set_rdo_equipamentos_org_trigger
    BEFORE INSERT ON public.rdo_equipamentos
    FOR EACH ROW EXECUTE FUNCTION public.set_rdo_child_organizacao_id();

CREATE TRIGGER set_rdo_ocorrencias_org_trigger
    BEFORE INSERT ON public.rdo_ocorrencias
    FOR EACH ROW EXECUTE FUNCTION public.set_rdo_child_organizacao_id();

CREATE TRIGGER set_rdo_anexos_org_trigger
    BEFORE INSERT ON public.rdo_anexos
    FOR EACH ROW EXECUTE FUNCTION public.set_rdo_child_organizacao_id();

CREATE TRIGGER set_rdo_inspecoes_org_trigger
    BEFORE INSERT ON public.rdo_inspecoes_solda
    FOR EACH ROW EXECUTE FUNCTION public.set_rdo_child_organizacao_id();

CREATE TRIGGER set_rdo_verificacoes_org_trigger
    BEFORE INSERT ON public.rdo_verificacoes_torque
    FOR EACH ROW EXECUTE FUNCTION public.set_rdo_child_organizacao_id();

-- Propagar para tarefas
CREATE OR REPLACE FUNCTION public.set_tarefa_organizacao_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organizacao_id IS NULL THEN
    SELECT organizacao_id INTO NEW.organizacao_id
    FROM public.obras
    WHERE id = NEW.obra_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tarefa_organizacao_id_trigger
    BEFORE INSERT ON public.tarefas
    FOR EACH ROW EXECUTE FUNCTION public.set_tarefa_organizacao_id();

-- Propagar para task_logs
CREATE OR REPLACE FUNCTION public.set_task_log_organizacao_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organizacao_id IS NULL THEN
    SELECT organizacao_id INTO NEW.organizacao_id
    FROM public.tarefas
    WHERE id = NEW.task_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_task_log_organizacao_id_trigger
    BEFORE INSERT ON public.task_logs
    FOR EACH ROW EXECUTE FUNCTION public.set_task_log_organizacao_id();

-- ========================================
-- 5. FUNÇÃO PARA ATUALIZAR MÉTRICAS
-- ========================================

CREATE OR REPLACE FUNCTION public.atualizar_metricas_organizacao()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_mes_ref DATE;
BEGIN
  -- Determinar organizacao_id baseado na operação
  IF TG_OP = 'DELETE' THEN
    v_org_id := OLD.organizacao_id;
  ELSE
    v_org_id := NEW.organizacao_id;
  END IF;
  
  v_mes_ref := DATE_TRUNC('month', CURRENT_DATE);
  
  -- Inserir ou atualizar métricas
  INSERT INTO public.organizacao_metricas (
    organizacao_id,
    mes_referencia,
    total_usuarios,
    total_obras,
    total_rdos,
    limite_usuarios,
    limite_obras,
    limite_rdos_mes,
    limite_storage_mb
  )
  SELECT 
    v_org_id,
    v_mes_ref,
    (SELECT COUNT(*) FROM public.usuarios WHERE organizacao_id = v_org_id AND ativo = true),
    (SELECT COUNT(*) FROM public.obras WHERE organizacao_id = v_org_id),
    (SELECT COUNT(*) FROM public.rdos WHERE organizacao_id = v_org_id AND DATE_TRUNC('month', created_at) = v_mes_ref),
    o.max_usuarios,
    o.max_obras,
    o.max_rdos_mes,
    o.max_storage_mb
  FROM public.organizacoes o
  WHERE o.id = v_org_id
  ON CONFLICT (organizacao_id, mes_referencia) 
  DO UPDATE SET
    total_usuarios = EXCLUDED.total_usuarios,
    total_obras = EXCLUDED.total_obras,
    total_rdos = EXCLUDED.total_rdos,
    limite_usuarios = EXCLUDED.limite_usuarios,
    limite_obras = EXCLUDED.limite_obras,
    limite_rdos_mes = EXCLUDED.limite_rdos_mes,
    limite_storage_mb = EXCLUDED.limite_storage_mb,
    updated_at = NOW();
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar métricas
CREATE TRIGGER atualizar_metricas_usuarios
    AFTER INSERT OR UPDATE OR DELETE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION public.atualizar_metricas_organizacao();

CREATE TRIGGER atualizar_metricas_obras
    AFTER INSERT OR DELETE ON public.obras
    FOR EACH ROW EXECUTE FUNCTION public.atualizar_metricas_organizacao();

CREATE TRIGGER atualizar_metricas_rdos
    AFTER INSERT OR DELETE ON public.rdos
    FOR EACH ROW EXECUTE FUNCTION public.atualizar_metricas_organizacao();

-- ========================================
-- 6. FUNÇÃO PARA VERIFICAR LIMITES DO PLANO
-- ========================================

CREATE OR REPLACE FUNCTION public.verificar_limite_usuarios()
RETURNS TRIGGER AS $$
DECLARE
  v_total_usuarios INTEGER;
  v_limite INTEGER;
BEGIN
  -- Contar usuários ativos da organização
  SELECT COUNT(*) INTO v_total_usuarios
  FROM public.usuarios
  WHERE organizacao_id = NEW.organizacao_id AND ativo = true;
  
  -- Buscar limite do plano
  SELECT max_usuarios INTO v_limite
  FROM public.organizacoes
  WHERE id = NEW.organizacao_id;
  
  -- Verificar se excedeu o limite
  IF v_total_usuarios >= v_limite THEN
    RAISE EXCEPTION 'Limite de usuários atingido para esta organização. Plano atual permite % usuários.', v_limite;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER verificar_limite_usuarios_trigger
    BEFORE INSERT ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION public.verificar_limite_usuarios();

CREATE OR REPLACE FUNCTION public.verificar_limite_obras()
RETURNS TRIGGER AS $$
DECLARE
  v_total_obras INTEGER;
  v_limite INTEGER;
BEGIN
  -- Contar obras da organização
  SELECT COUNT(*) INTO v_total_obras
  FROM public.obras
  WHERE organizacao_id = NEW.organizacao_id;
  
  -- Buscar limite do plano
  SELECT max_obras INTO v_limite
  FROM public.organizacoes
  WHERE id = NEW.organizacao_id;
  
  -- Verificar se excedeu o limite
  IF v_total_obras >= v_limite THEN
    RAISE EXCEPTION 'Limite de obras atingido para esta organização. Plano atual permite % obras.', v_limite;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER verificar_limite_obras_trigger
    BEFORE INSERT ON public.obras
    FOR EACH ROW EXECUTE FUNCTION public.verificar_limite_obras();

-- ========================================
-- 7. FUNÇÕES AUXILIARES PARA QUERIES
-- ========================================

-- Função para obter role do usuário em uma organização
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID, p_org_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.organizacao_usuarios 
    WHERE usuario_id = p_user_id 
      AND organizacao_id = p_org_id 
      AND ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário tem permissão
CREATE OR REPLACE FUNCTION public.user_has_permission(
  p_user_id UUID,
  p_org_id UUID,
  p_permissao TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := public.get_user_role(p_user_id, p_org_id);
  
  -- Lógica de permissões baseada em role
  RETURN CASE
    WHEN v_role = 'owner' THEN true
    WHEN v_role = 'admin' THEN true
    WHEN v_role = 'engenheiro' AND p_permissao IN ('criar_rdo', 'aprovar_rdo', 'criar_obra', 'editar_obra') THEN true
    WHEN v_role = 'mestre_obra' AND p_permissao IN ('criar_rdo', 'editar_rdo') THEN true
    WHEN v_role = 'usuario' AND p_permissao IN ('visualizar_rdo', 'visualizar_obra') THEN true
    ELSE false
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter organizacao_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organizacao_id 
    FROM public.usuarios 
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- COMENTÁRIOS
-- ========================================

COMMENT ON FUNCTION update_updated_at_column() IS 'Atualiza automaticamente o campo updated_at';
COMMENT ON FUNCTION handle_new_user() IS 'Cria perfil de usuário automaticamente após registro no auth';
COMMENT ON FUNCTION set_rdo_numero() IS 'Define automaticamente o número sequencial do RDO por obra';
COMMENT ON FUNCTION atualizar_metricas_organizacao() IS 'Atualiza métricas de uso da organização';
COMMENT ON FUNCTION verificar_limite_usuarios() IS 'Verifica se organização não excedeu limite de usuários do plano';
COMMENT ON FUNCTION verificar_limite_obras() IS 'Verifica se organização não excedeu limite de obras do plano';
COMMENT ON FUNCTION get_user_role(UUID, UUID) IS 'Retorna o role do usuário em uma organização';
COMMENT ON FUNCTION user_has_permission(UUID, UUID, TEXT) IS 'Verifica se usuário tem uma permissão específica';
COMMENT ON FUNCTION get_current_user_org_id() IS 'Retorna o organizacao_id do usuário autenticado';
