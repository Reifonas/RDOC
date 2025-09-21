-- Fix permissions for all existing tables
-- Grant basic read access to anon role and full access to authenticated role

-- Core tables
GRANT SELECT ON usuarios TO anon;
GRANT ALL PRIVILEGES ON usuarios TO authenticated;

GRANT SELECT ON empresas TO anon;
GRANT ALL PRIVILEGES ON empresas TO authenticated;

GRANT SELECT ON funcoes_cargos TO anon;
GRANT ALL PRIVILEGES ON funcoes_cargos TO authenticated;

GRANT SELECT ON funcionarios TO anon;
GRANT ALL PRIVILEGES ON funcionarios TO authenticated;

GRANT SELECT ON obras TO anon;
GRANT ALL PRIVILEGES ON obras TO authenticated;

GRANT SELECT ON obra_funcionarios TO anon;
GRANT ALL PRIVILEGES ON obra_funcionarios TO authenticated;

-- Equipment and materials
GRANT SELECT ON tipos_equipamento TO anon;
GRANT ALL PRIVILEGES ON tipos_equipamento TO authenticated;

GRANT SELECT ON equipamentos TO anon;
GRANT ALL PRIVILEGES ON equipamentos TO authenticated;

GRANT SELECT ON materiais TO anon;
GRANT ALL PRIVILEGES ON materiais TO authenticated;

-- Activity and occurrence types
GRANT SELECT ON tipos_atividade TO anon;
GRANT ALL PRIVILEGES ON tipos_atividade TO authenticated;

GRANT SELECT ON tipos_ocorrencia TO anon;
GRANT ALL PRIVILEGES ON tipos_ocorrencia TO authenticated;

GRANT SELECT ON condicoes_climaticas TO anon;
GRANT ALL PRIVILEGES ON condicoes_climaticas TO authenticated;

-- RDO tables
GRANT SELECT ON rdos TO anon;
GRANT ALL PRIVILEGES ON rdos TO authenticated;

GRANT SELECT ON rdo_atividades TO anon;
GRANT ALL PRIVILEGES ON rdo_atividades TO authenticated;

GRANT SELECT ON rdo_mao_obra TO anon;
GRANT ALL PRIVILEGES ON rdo_mao_obra TO authenticated;

GRANT SELECT ON rdo_equipamentos TO anon;
GRANT ALL PRIVILEGES ON rdo_equipamentos TO authenticated;

GRANT SELECT ON rdo_materiais TO anon;
GRANT ALL PRIVILEGES ON rdo_materiais TO authenticated;

GRANT SELECT ON rdo_ocorrencias TO anon;
GRANT ALL PRIVILEGES ON rdo_ocorrencias TO authenticated;

-- Tasks
GRANT SELECT ON tarefas TO anon;
GRANT ALL PRIVILEGES ON tarefas TO authenticated;

GRANT SELECT ON tarefa_logs TO anon;
GRANT ALL PRIVILEGES ON tarefa_logs TO authenticated;

GRANT SELECT ON tarefa_dependencias TO anon;
GRANT ALL PRIVILEGES ON tarefa_dependencias TO authenticated;

GRANT SELECT ON tarefa_anexos TO anon;
GRANT ALL PRIVILEGES ON tarefa_anexos TO authenticated;

-- Files and documents
GRANT SELECT ON tipos_arquivo TO anon;
GRANT ALL PRIVILEGES ON tipos_arquivo TO authenticated;

GRANT SELECT ON arquivos TO anon;
GRANT ALL PRIVILEGES ON arquivos TO authenticated;

GRANT SELECT ON obra_fotos TO anon;
GRANT ALL PRIVILEGES ON obra_fotos TO authenticated;

GRANT SELECT ON obra_documentos TO anon;
GRANT ALL PRIVILEGES ON obra_documentos TO authenticated;

GRANT SELECT ON rdo_fotos TO anon;
GRANT ALL PRIVILEGES ON rdo_fotos TO authenticated;

-- Digital signatures
GRANT SELECT ON assinaturas_digitais TO anon;
GRANT ALL PRIVILEGES ON assinaturas_digitais TO authenticated;

-- Reports
GRANT SELECT ON relatorio_templates TO anon;
GRANT ALL PRIVILEGES ON relatorio_templates TO authenticated;

GRANT SELECT ON relatorios_gerados TO anon;
GRANT ALL PRIVILEGES ON relatorios_gerados TO authenticated;

-- Metrics and dashboard
GRANT SELECT ON metricas_obra TO anon;
GRANT ALL PRIVILEGES ON metricas_obra TO authenticated;

GRANT SELECT ON dashboard_widgets TO anon;
GRANT ALL PRIVILEGES ON dashboard_widgets TO authenticated;

-- Notifications and audit
GRANT SELECT ON notificacoes TO anon;
GRANT ALL PRIVILEGES ON notificacoes TO authenticated;

GRANT SELECT ON auditoria TO anon;
GRANT ALL PRIVILEGES ON auditoria TO authenticated;

-- Enable RLS on tables that don't have it yet
ALTER TABLE rdo_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE obra_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios_gerados ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdo_ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdo_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_atividade ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_ocorrencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE condicoes_climaticas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_arquivo ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcoes_cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorio_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdo_atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_equipamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE assinaturas_digitais ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdo_equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefa_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefa_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefa_dependencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE obra_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdo_mao_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE obra_funcionarios ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for authenticated users
CREATE POLICY "Allow authenticated users full access" ON usuarios FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON empresas FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON funcoes_cargos FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON funcionarios FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON obras FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON equipamentos FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON materiais FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON tipos_atividade FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON tipos_ocorrencia FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON condicoes_climaticas FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON rdos FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON rdo_atividades FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON rdo_mao_obra FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON rdo_equipamentos FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON rdo_materiais FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON rdo_ocorrencias FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON tarefas FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON arquivos FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON notificacoes FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON auditoria FOR ALL TO authenticated USING (true);

-- Allow anon users to read reference data
CREATE POLICY "Allow anon read access" ON tipos_atividade FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON tipos_ocorrencia FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON condicoes_climaticas FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON funcoes_cargos FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON tipos_equipamento FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON tipos_arquivo FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON materiais FOR SELECT TO anon USING (true);