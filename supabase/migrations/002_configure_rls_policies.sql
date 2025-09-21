-- Configuração completa de Row Level Security (RLS)
-- Baseado na Arquitetura Completa de Banco de Dados RDO

-- Habilitar RLS em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdo_atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdo_mao_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdo_equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdo_ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdo_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdo_inspecoes_solda ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdo_verificacoes_torque ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_logs ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para verificar role do usuário
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM usuarios WHERE id = auth.uid()),
    'usuario'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para usuários
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON usuarios;
CREATE POLICY "Usuários podem ver próprio perfil" ON usuarios 
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON usuarios;
CREATE POLICY "Usuários podem atualizar próprio perfil" ON usuarios 
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins podem gerenciar usuários" ON usuarios;
CREATE POLICY "Admins podem gerenciar usuários" ON usuarios 
  FOR ALL USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Usuários podem ver outros usuários" ON usuarios;
CREATE POLICY "Usuários podem ver outros usuários" ON usuarios 
  FOR SELECT USING (true); -- Permite visualizar outros usuários para seleção

-- Políticas para obras
DROP POLICY IF EXISTS "Usuários podem ver obras onde participam" ON obras;
CREATE POLICY "Usuários podem ver obras onde participam" ON obras 
  FOR SELECT USING (
    auth.uid() = responsavel_id OR 
    get_user_role() IN ('admin', 'engenheiro')
  );

DROP POLICY IF EXISTS "Engenheiros e admins podem criar obras" ON obras;
CREATE POLICY "Engenheiros e admins podem criar obras" ON obras 
  FOR INSERT WITH CHECK (
    get_user_role() IN ('admin', 'engenheiro')
  );

DROP POLICY IF EXISTS "Responsáveis podem atualizar suas obras" ON obras;
CREATE POLICY "Responsáveis podem atualizar suas obras" ON obras 
  FOR UPDATE USING (
    auth.uid() = responsavel_id OR 
    get_user_role() IN ('admin', 'engenheiro')
  );

DROP POLICY IF EXISTS "Admins podem deletar obras" ON obras;
CREATE POLICY "Admins podem deletar obras" ON obras 
  FOR DELETE USING (get_user_role() = 'admin');

-- Políticas para RDOs
DROP POLICY IF EXISTS "Usuários podem ver RDOs de suas obras" ON rdos;
CREATE POLICY "Usuários podem ver RDOs de suas obras" ON rdos 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM obras 
      WHERE obras.id = rdos.obra_id 
      AND (obras.responsavel_id = auth.uid() OR get_user_role() IN ('admin', 'engenheiro'))
    ) OR rdos.criado_por = auth.uid()
  );

DROP POLICY IF EXISTS "Usuários podem criar RDOs" ON rdos;
CREATE POLICY "Usuários podem criar RDOs" ON rdos 
  FOR INSERT WITH CHECK (
    auth.uid() = criado_por AND
    EXISTS (
      SELECT 1 FROM obras 
      WHERE obras.id = obra_id 
      AND (obras.responsavel_id = auth.uid() OR get_user_role() IN ('admin', 'engenheiro', 'mestre_obra'))
    )
  );

DROP POLICY IF EXISTS "Criadores podem atualizar próprios RDOs" ON rdos;
CREATE POLICY "Criadores podem atualizar próprios RDOs" ON rdos 
  FOR UPDATE USING (
    (auth.uid() = criado_por AND status = 'rascunho') OR
    get_user_role() IN ('admin', 'engenheiro')
  );

DROP POLICY IF EXISTS "Admins podem deletar RDOs" ON rdos;
CREATE POLICY "Admins podem deletar RDOs" ON rdos 
  FOR DELETE USING (get_user_role() = 'admin');

-- Políticas para rdo_atividades
DROP POLICY IF EXISTS "Acesso baseado no RDO" ON rdo_atividades;
CREATE POLICY "Acesso baseado no RDO" ON rdo_atividades 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rdos 
      WHERE rdos.id = rdo_atividades.rdo_id 
      AND (rdos.criado_por = auth.uid() OR get_user_role() IN ('admin', 'engenheiro'))
    )
  );

-- Políticas para rdo_mao_obra
DROP POLICY IF EXISTS "Acesso baseado no RDO" ON rdo_mao_obra;
CREATE POLICY "Acesso baseado no RDO" ON rdo_mao_obra 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rdos 
      WHERE rdos.id = rdo_mao_obra.rdo_id 
      AND (rdos.criado_por = auth.uid() OR get_user_role() IN ('admin', 'engenheiro'))
    )
  );

-- Políticas para rdo_equipamentos
DROP POLICY IF EXISTS "Acesso baseado no RDO" ON rdo_equipamentos;
CREATE POLICY "Acesso baseado no RDO" ON rdo_equipamentos 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rdos 
      WHERE rdos.id = rdo_equipamentos.rdo_id 
      AND (rdos.criado_por = auth.uid() OR get_user_role() IN ('admin', 'engenheiro'))
    )
  );

-- Políticas para rdo_ocorrencias
DROP POLICY IF EXISTS "Acesso baseado no RDO" ON rdo_ocorrencias;
CREATE POLICY "Acesso baseado no RDO" ON rdo_ocorrencias 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rdos 
      WHERE rdos.id = rdo_ocorrencias.rdo_id 
      AND (rdos.criado_por = auth.uid() OR get_user_role() IN ('admin', 'engenheiro'))
    )
  );

-- Políticas para rdo_anexos
DROP POLICY IF EXISTS "Acesso baseado no RDO" ON rdo_anexos;
CREATE POLICY "Acesso baseado no RDO" ON rdo_anexos 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rdos 
      WHERE rdos.id = rdo_anexos.rdo_id 
      AND (rdos.criado_por = auth.uid() OR get_user_role() IN ('admin', 'engenheiro'))
    )
  );

-- Políticas para rdo_inspecoes_solda
DROP POLICY IF EXISTS "Acesso baseado no RDO" ON rdo_inspecoes_solda;
CREATE POLICY "Acesso baseado no RDO" ON rdo_inspecoes_solda 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rdos 
      WHERE rdos.id = rdo_inspecoes_solda.rdo_id 
      AND (rdos.criado_por = auth.uid() OR get_user_role() IN ('admin', 'engenheiro'))
    )
  );

-- Políticas para rdo_verificacoes_torque
DROP POLICY IF EXISTS "Acesso baseado no RDO" ON rdo_verificacoes_torque;
CREATE POLICY "Acesso baseado no RDO" ON rdo_verificacoes_torque 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rdos 
      WHERE rdos.id = rdo_verificacoes_torque.rdo_id 
      AND (rdos.criado_por = auth.uid() OR get_user_role() IN ('admin', 'engenheiro'))
    )
  );

-- Políticas para tarefas
DROP POLICY IF EXISTS "Usuários podem ver tarefas de suas obras" ON tarefas;
CREATE POLICY "Usuários podem ver tarefas de suas obras" ON tarefas 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM obras 
      WHERE obras.id = tarefas.obra_id 
      AND (obras.responsavel_id = auth.uid() OR get_user_role() IN ('admin', 'engenheiro'))
    ) OR responsavel_id = auth.uid()
  );

DROP POLICY IF EXISTS "Usuários podem criar tarefas" ON tarefas;
CREATE POLICY "Usuários podem criar tarefas" ON tarefas 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM obras 
      WHERE obras.id = obra_id 
      AND (obras.responsavel_id = auth.uid() OR get_user_role() IN ('admin', 'engenheiro', 'mestre_obra'))
    )
  );

DROP POLICY IF EXISTS "Usuários podem atualizar tarefas" ON tarefas;
CREATE POLICY "Usuários podem atualizar tarefas" ON tarefas 
  FOR UPDATE USING (
    responsavel_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM obras 
      WHERE obras.id = tarefas.obra_id 
      AND (obras.responsavel_id = auth.uid() OR get_user_role() IN ('admin', 'engenheiro'))
    )
  );

DROP POLICY IF EXISTS "Admins podem deletar tarefas" ON tarefas;
CREATE POLICY "Admins podem deletar tarefas" ON tarefas 
  FOR DELETE USING (get_user_role() = 'admin');

-- Políticas para task_logs
DROP POLICY IF EXISTS "Usuários podem ver logs de suas tarefas" ON task_logs;
CREATE POLICY "Usuários podem ver logs de suas tarefas" ON task_logs 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tarefas 
      WHERE tarefas.id = task_logs.task_id 
      AND (tarefas.responsavel_id = auth.uid() OR get_user_role() IN ('admin', 'engenheiro'))
    ) OR usuario_id = auth.uid()
  );

DROP POLICY IF EXISTS "Usuários podem criar logs" ON task_logs;
CREATE POLICY "Usuários podem criar logs" ON task_logs 
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Garantir permissões para roles anon e authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT EXECUTE ON FUNCTION get_user_role() TO anon, authenticated;

-- Comentários para documentação
COMMENT ON FUNCTION get_user_role() IS 'Função auxiliar para obter o role do usuário autenticado';
COMMENT ON POLICY "Usuários podem ver próprio perfil" ON usuarios IS 'Permite que usuários vejam apenas seu próprio perfil';
COMMENT ON POLICY "Admins podem gerenciar usuários" ON usuarios IS 'Administradores têm acesso completo aos usuários';
COMMENT ON POLICY "Usuários podem ver obras onde participam" ON obras IS 'Usuários podem ver obras onde são responsáveis ou têm permissão por role';
COMMENT ON POLICY "Usuários podem ver RDOs de suas obras" ON rdos IS 'Acesso aos RDOs baseado na participação na obra ou criação do RDO';