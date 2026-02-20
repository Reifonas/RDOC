-- ========================================
-- MIGRATION: Row Level Security Policies
-- Data: 2024-12-02
-- Descrição: Políticas RLS para isolamento multi-tenant
-- ========================================

-- ========================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ========================================

ALTER TABLE public.organizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizacao_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdo_atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdo_mao_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdo_equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdo_ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdo_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdo_inspecoes_solda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdo_verificacoes_torque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizacao_metricas ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS PARA ORGANIZAÇÕES
-- ========================================

-- Usuários podem ver organizações onde são membros
CREATE POLICY "Usuários veem suas organizações" ON public.organizacoes
  FOR SELECT USING (
    id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

-- Apenas owners podem atualizar organização
CREATE POLICY "Owners podem atualizar organização" ON public.organizacoes
  FOR UPDATE USING (
    id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() 
        AND role = 'owner' 
        AND ativo = true
    )
  );

-- Qualquer usuário autenticado pode criar organização (signup)
CREATE POLICY "Usuários autenticados podem criar organização" ON public.organizacoes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ========================================
-- POLÍTICAS PARA USUÁRIOS
-- ========================================

-- Usuários veem outros usuários da mesma organização
CREATE POLICY "Usuários veem membros da organização" ON public.usuarios
  FOR SELECT USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

-- Usuários podem atualizar próprio perfil
CREATE POLICY "Usuários podem atualizar próprio perfil" ON public.usuarios
  FOR UPDATE USING (id = auth.uid());

-- Admins e owners podem inserir novos usuários
CREATE POLICY "Admins podem criar usuários" ON public.usuarios
  FOR INSERT WITH CHECK (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() 
        AND role IN ('owner', 'admin') 
        AND ativo = true
    )
  );

-- ========================================
-- POLÍTICAS PARA ORGANIZACAO_USUARIOS
-- ========================================

-- Usuários veem membros da própria organização
CREATE POLICY "Ver membros da organização" ON public.organizacao_usuarios
  FOR SELECT USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

-- Owners e admins podem gerenciar membros
CREATE POLICY "Admins gerenciam membros" ON public.organizacao_usuarios
  FOR ALL USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() 
        AND role IN ('owner', 'admin') 
        AND ativo = true
    )
  );

-- ========================================
-- POLÍTICAS PARA CONVITES
-- ========================================

-- Membros da organização veem convites
CREATE POLICY "Ver convites da organização" ON public.convites
  FOR SELECT USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

-- Admins podem criar convites
CREATE POLICY "Admins criam convites" ON public.convites
  FOR INSERT WITH CHECK (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() 
        AND role IN ('owner', 'admin') 
        AND ativo = true
    )
  );

-- Admins podem atualizar/cancelar convites
CREATE POLICY "Admins gerenciam convites" ON public.convites
  FOR UPDATE USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() 
        AND role IN ('owner', 'admin') 
        AND ativo = true
    )
  );

-- ========================================
-- POLÍTICAS PARA OBRAS
-- ========================================

-- Usuários veem obras da organização
CREATE POLICY "Ver obras da organização" ON public.obras
  FOR SELECT USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

-- Engenheiros, admins e owners podem criar obras
CREATE POLICY "Engenheiros criam obras" ON public.obras
  FOR INSERT WITH CHECK (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() 
        AND role IN ('owner', 'admin', 'engenheiro') 
        AND ativo = true
    )
  );

-- Responsáveis, engenheiros, admins e owners podem atualizar obras
CREATE POLICY "Responsáveis atualizam obras" ON public.obras
  FOR UPDATE USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() 
        AND (
          role IN ('owner', 'admin', 'engenheiro')
          OR usuario_id = responsavel_id
        )
        AND ativo = true
    )
  );

-- Apenas admins e owners podem deletar obras
CREATE POLICY "Admins deletam obras" ON public.obras
  FOR DELETE USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() 
        AND role IN ('owner', 'admin') 
        AND ativo = true
    )
  );

-- ========================================
-- POLÍTICAS PARA RDOs
-- ========================================

-- Usuários veem RDOs da organização
CREATE POLICY "Ver RDOs da organização" ON public.rdos
  FOR SELECT USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

-- Usuários podem criar RDOs em obras da organização
CREATE POLICY "Criar RDOs" ON public.rdos
  FOR INSERT WITH CHECK (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
    AND criado_por = auth.uid()
  );

-- Criadores podem atualizar próprios RDOs em rascunho
-- Engenheiros e admins podem atualizar qualquer RDO
CREATE POLICY "Atualizar RDOs" ON public.rdos
  FOR UPDATE USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() 
        AND (
          role IN ('owner', 'admin', 'engenheiro')
          OR (criado_por = auth.uid() AND status = 'rascunho')
        )
        AND ativo = true
    )
  );

-- Apenas admins podem deletar RDOs
CREATE POLICY "Admins deletam RDOs" ON public.rdos
  FOR DELETE USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() 
        AND role IN ('owner', 'admin') 
        AND ativo = true
    )
  );

-- ========================================
-- POLÍTICAS PARA TABELAS RELACIONADAS AO RDO
-- ========================================

-- Política genérica para todas as tabelas filhas do RDO
-- Acesso baseado no acesso ao RDO pai

CREATE POLICY "Acesso via RDO - atividades" ON public.rdo_atividades
  FOR ALL USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Acesso via RDO - mao_obra" ON public.rdo_mao_obra
  FOR ALL USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Acesso via RDO - equipamentos" ON public.rdo_equipamentos
  FOR ALL USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Acesso via RDO - ocorrencias" ON public.rdo_ocorrencias
  FOR ALL USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Acesso via RDO - anexos" ON public.rdo_anexos
  FOR ALL USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Acesso via RDO - inspecoes" ON public.rdo_inspecoes_solda
  FOR ALL USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Acesso via RDO - verificacoes" ON public.rdo_verificacoes_torque
  FOR ALL USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

-- ========================================
-- POLÍTICAS PARA TAREFAS
-- ========================================

-- Usuários veem tarefas da organização
CREATE POLICY "Ver tarefas da organização" ON public.tarefas
  FOR SELECT USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

-- Usuários podem criar tarefas
CREATE POLICY "Criar tarefas" ON public.tarefas
  FOR INSERT WITH CHECK (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

-- Responsáveis e superiores podem atualizar tarefas
CREATE POLICY "Atualizar tarefas" ON public.tarefas
  FOR UPDATE USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() 
        AND (
          role IN ('owner', 'admin', 'engenheiro')
          OR usuario_id = responsavel_id
        )
        AND ativo = true
    )
  );

-- Apenas admins podem deletar tarefas
CREATE POLICY "Admins deletam tarefas" ON public.tarefas
  FOR DELETE USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() 
        AND role IN ('owner', 'admin') 
        AND ativo = true
    )
  );

-- ========================================
-- POLÍTICAS PARA TASK_LOGS
-- ========================================

-- Usuários veem logs de tarefas da organização
CREATE POLICY "Ver logs da organização" ON public.task_logs
  FOR SELECT USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

-- Usuários podem criar logs
CREATE POLICY "Criar logs" ON public.task_logs
  FOR INSERT WITH CHECK (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
    AND usuario_id = auth.uid()
  );

-- ========================================
-- POLÍTICAS PARA MÉTRICAS
-- ========================================

-- Apenas admins e owners veem métricas
CREATE POLICY "Admins veem métricas" ON public.organizacao_metricas
  FOR SELECT USING (
    organizacao_id IN (
      SELECT organizacao_id 
      FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() 
        AND role IN ('owner', 'admin') 
        AND ativo = true
    )
  );

-- Sistema pode atualizar métricas (via triggers)
CREATE POLICY "Sistema atualiza métricas" ON public.organizacao_metricas
  FOR ALL USING (true);

-- ========================================
-- PERMISSÕES PARA ROLES
-- ========================================

-- Garantir permissões para roles anon e authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Permissões específicas para anon (apenas leitura limitada)
GRANT SELECT ON public.organizacoes TO anon;
GRANT SELECT ON public.convites TO anon;

-- ========================================
-- COMENTÁRIOS
-- ========================================

COMMENT ON POLICY "Usuários veem suas organizações" ON public.organizacoes IS 
  'Usuários só podem ver organizações onde são membros ativos';

COMMENT ON POLICY "Ver obras da organização" ON public.obras IS 
  'Isolamento multi-tenant: usuários só veem obras da própria organização';

COMMENT ON POLICY "Ver RDOs da organização" ON public.rdos IS 
  'Isolamento multi-tenant: usuários só veem RDOs da própria organização';

COMMENT ON POLICY "Atualizar RDOs" ON public.rdos IS 
  'Criadores podem editar RDOs em rascunho, engenheiros e admins podem editar qualquer RDO';
