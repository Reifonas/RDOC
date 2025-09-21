-- Políticas RLS para todas as tabelas do sistema RDO
-- Aplicar apenas às tabelas existentes no banco

-- Política para tabela usuarios
CREATE POLICY "usuarios_select_policy" ON usuarios
  FOR SELECT USING (auth.uid()::text = id::text OR auth.role() = 'authenticated');

CREATE POLICY "usuarios_insert_policy" ON usuarios
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "usuarios_update_policy" ON usuarios
  FOR UPDATE USING (auth.uid()::text = id::text OR auth.role() = 'authenticated');

-- Política para tabela empresas
CREATE POLICY "empresas_select_policy" ON empresas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "empresas_insert_policy" ON empresas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "empresas_update_policy" ON empresas
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela funcoes_cargos
CREATE POLICY "funcoes_cargos_select_policy" ON funcoes_cargos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "funcoes_cargos_insert_policy" ON funcoes_cargos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "funcoes_cargos_update_policy" ON funcoes_cargos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela funcionarios
CREATE POLICY "funcionarios_select_policy" ON funcionarios
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "funcionarios_insert_policy" ON funcionarios
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "funcionarios_update_policy" ON funcionarios
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela obras
CREATE POLICY "obras_select_policy" ON obras
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "obras_insert_policy" ON obras
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "obras_update_policy" ON obras
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela obra_funcionarios
CREATE POLICY "obra_funcionarios_select_policy" ON obra_funcionarios
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "obra_funcionarios_insert_policy" ON obra_funcionarios
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "obra_funcionarios_update_policy" ON obra_funcionarios
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela equipamentos
CREATE POLICY "equipamentos_select_policy" ON equipamentos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "equipamentos_insert_policy" ON equipamentos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "equipamentos_update_policy" ON equipamentos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela tipos_equipamento
CREATE POLICY "tipos_equipamento_select_policy" ON tipos_equipamento
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "tipos_equipamento_insert_policy" ON tipos_equipamento
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "tipos_equipamento_update_policy" ON tipos_equipamento
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela materiais
CREATE POLICY "materiais_select_policy" ON materiais
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "materiais_insert_policy" ON materiais
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "materiais_update_policy" ON materiais
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela tipos_atividade
CREATE POLICY "tipos_atividade_select_policy" ON tipos_atividade
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "tipos_atividade_insert_policy" ON tipos_atividade
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "tipos_atividade_update_policy" ON tipos_atividade
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela condicoes_climaticas
CREATE POLICY "condicoes_climaticas_select_policy" ON condicoes_climaticas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "condicoes_climaticas_insert_policy" ON condicoes_climaticas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "condicoes_climaticas_update_policy" ON condicoes_climaticas
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela tipos_ocorrencia
CREATE POLICY "tipos_ocorrencia_select_policy" ON tipos_ocorrencia
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "tipos_ocorrencia_insert_policy" ON tipos_ocorrencia
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "tipos_ocorrencia_update_policy" ON tipos_ocorrencia
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela rdos
CREATE POLICY "rdos_select_policy" ON rdos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "rdos_insert_policy" ON rdos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "rdos_update_policy" ON rdos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela rdo_atividades
CREATE POLICY "rdo_atividades_select_policy" ON rdo_atividades
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "rdo_atividades_insert_policy" ON rdo_atividades
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "rdo_atividades_update_policy" ON rdo_atividades
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela rdo_mao_obra
CREATE POLICY "rdo_mao_obra_select_policy" ON rdo_mao_obra
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "rdo_mao_obra_insert_policy" ON rdo_mao_obra
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "rdo_mao_obra_update_policy" ON rdo_mao_obra
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela rdo_equipamentos
CREATE POLICY "rdo_equipamentos_select_policy" ON rdo_equipamentos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "rdo_equipamentos_insert_policy" ON rdo_equipamentos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "rdo_equipamentos_update_policy" ON rdo_equipamentos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela rdo_materiais
CREATE POLICY "rdo_materiais_select_policy" ON rdo_materiais
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "rdo_materiais_insert_policy" ON rdo_materiais
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "rdo_materiais_update_policy" ON rdo_materiais
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela rdo_ocorrencias
CREATE POLICY "rdo_ocorrencias_select_policy" ON rdo_ocorrencias
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "rdo_ocorrencias_insert_policy" ON rdo_ocorrencias
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "rdo_ocorrencias_update_policy" ON rdo_ocorrencias
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela tarefas
CREATE POLICY "tarefas_select_policy" ON tarefas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "tarefas_insert_policy" ON tarefas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "tarefas_update_policy" ON tarefas
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela tarefa_logs
CREATE POLICY "tarefa_logs_select_policy" ON tarefa_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "tarefa_logs_insert_policy" ON tarefa_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para tabela tarefa_dependencias
CREATE POLICY "tarefa_dependencias_select_policy" ON tarefa_dependencias
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "tarefa_dependencias_insert_policy" ON tarefa_dependencias
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "tarefa_dependencias_update_policy" ON tarefa_dependencias
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela tipos_arquivo
CREATE POLICY "tipos_arquivo_select_policy" ON tipos_arquivo
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "tipos_arquivo_insert_policy" ON tipos_arquivo
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "tipos_arquivo_update_policy" ON tipos_arquivo
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela arquivos
CREATE POLICY "arquivos_select_policy" ON arquivos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "arquivos_insert_policy" ON arquivos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "arquivos_update_policy" ON arquivos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela obra_fotos
CREATE POLICY "obra_fotos_select_policy" ON obra_fotos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "obra_fotos_insert_policy" ON obra_fotos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "obra_fotos_update_policy" ON obra_fotos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela rdo_fotos
CREATE POLICY "rdo_fotos_select_policy" ON rdo_fotos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "rdo_fotos_insert_policy" ON rdo_fotos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "rdo_fotos_update_policy" ON rdo_fotos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela obra_documentos
CREATE POLICY "obra_documentos_select_policy" ON obra_documentos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "obra_documentos_insert_policy" ON obra_documentos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "obra_documentos_update_policy" ON obra_documentos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela tarefa_anexos
CREATE POLICY "tarefa_anexos_select_policy" ON tarefa_anexos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "tarefa_anexos_insert_policy" ON tarefa_anexos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "tarefa_anexos_update_policy" ON tarefa_anexos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela assinaturas_digitais
CREATE POLICY "assinaturas_digitais_select_policy" ON assinaturas_digitais
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "assinaturas_digitais_insert_policy" ON assinaturas_digitais
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "assinaturas_digitais_update_policy" ON assinaturas_digitais
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela relatorio_templates
CREATE POLICY "relatorio_templates_select_policy" ON relatorio_templates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "relatorio_templates_insert_policy" ON relatorio_templates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "relatorio_templates_update_policy" ON relatorio_templates
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela relatorios_gerados
CREATE POLICY "relatorios_gerados_select_policy" ON relatorios_gerados
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "relatorios_gerados_insert_policy" ON relatorios_gerados
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "relatorios_gerados_update_policy" ON relatorios_gerados
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela metricas_obra
CREATE POLICY "metricas_obra_select_policy" ON metricas_obra
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "metricas_obra_insert_policy" ON metricas_obra
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "metricas_obra_update_policy" ON metricas_obra
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela dashboard_widgets
CREATE POLICY "dashboard_widgets_select_policy" ON dashboard_widgets
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "dashboard_widgets_insert_policy" ON dashboard_widgets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "dashboard_widgets_update_policy" ON dashboard_widgets
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela notificacoes
CREATE POLICY "notificacoes_select_policy" ON notificacoes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "notificacoes_insert_policy" ON notificacoes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "notificacoes_update_policy" ON notificacoes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para tabela auditoria
CREATE POLICY "auditoria_select_policy" ON auditoria
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "auditoria_insert_policy" ON auditoria
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Conceder permissões básicas aos roles anon e authenticated
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;