-- OPÇÃO NUCLEAR V2: Liberar leitura pública para tabelas de configuração e sistema (IDEMPOTENTE)
-- Correção: Agora dropa explicitamente TODAS as políticas que tenta criar para evitar erro "already exists"

-- 1. Materiais
DROP POLICY IF EXISTS "Public Read Materiais" ON materiais;
DROP POLICY IF EXISTS "Super Admin Total Materiais" ON materiais;
DROP POLICY IF EXISTS "Admin Write Materiais" ON materiais; -- ADICIONADO
CREATE POLICY "Public Read Materiais" ON materiais FOR SELECT USING (true);
CREATE POLICY "Admin Write Materiais" ON materiais FOR ALL USING (auth.jwt() ->> 'email' = 'admtracksteel@gmail.com');

-- 2. Atividades
DROP POLICY IF EXISTS "Public Read Atividades" ON tipos_atividade;
DROP POLICY IF EXISTS "Super Admin Total Tipos Atividade" ON tipos_atividade;
DROP POLICY IF EXISTS "Admin Write Atividades" ON tipos_atividade; -- ADICIONADO
CREATE POLICY "Public Read Atividades" ON tipos_atividade FOR SELECT USING (true);
CREATE POLICY "Admin Write Atividades" ON tipos_atividade FOR ALL USING (auth.jwt() ->> 'email' = 'admtracksteel@gmail.com');

-- 3. Clima
DROP POLICY IF EXISTS "Public Read Clima" ON condicoes_climaticas;
DROP POLICY IF EXISTS "Super Admin Total Condicoes Climaticas" ON condicoes_climaticas;
DROP POLICY IF EXISTS "Admin Write Clima" ON condicoes_climaticas; -- ADICIONADO
CREATE POLICY "Public Read Clima" ON condicoes_climaticas FOR SELECT USING (true);
CREATE POLICY "Admin Write Clima" ON condicoes_climaticas FOR ALL USING (auth.jwt() ->> 'email' = 'admtracksteel@gmail.com');

-- 4. Ocorrências
DROP POLICY IF EXISTS "Public Read Ocorrencias" ON tipos_ocorrencia;
DROP POLICY IF EXISTS "Super Admin Total Tipos Ocorrencia" ON tipos_ocorrencia;
DROP POLICY IF EXISTS "Admin Write Ocorrencias" ON tipos_ocorrencia; -- ADICIONADO
CREATE POLICY "Public Read Ocorrencias" ON tipos_ocorrencia FOR SELECT USING (true);
CREATE POLICY "Admin Write Ocorrencias" ON tipos_ocorrencia FOR ALL USING (auth.jwt() ->> 'email' = 'admtracksteel@gmail.com');

-- 5. Funções
DROP POLICY IF EXISTS "Public Read Funcoes" ON funcoes_cargos;
DROP POLICY IF EXISTS "Super Admin Total Funcoes Cargos" ON funcoes_cargos;
DROP POLICY IF EXISTS "Admin Write Funcoes" ON funcoes_cargos; -- ADICIONADO
CREATE POLICY "Public Read Funcoes" ON funcoes_cargos FOR SELECT USING (true);
CREATE POLICY "Admin Write Funcoes" ON funcoes_cargos FOR ALL USING (auth.jwt() ->> 'email' = 'admtracksteel@gmail.com');

-- 6. Equipamentos
DROP POLICY IF EXISTS "Public Read Equipamentos" ON equipamentos;
DROP POLICY IF EXISTS "Super Admin Total Equipamentos" ON equipamentos;
DROP POLICY IF EXISTS "Admin Write Equipamentos" ON equipamentos; -- ADICIONADO
CREATE POLICY "Public Read Equipamentos" ON equipamentos FOR SELECT USING (true);
CREATE POLICY "Admin Write Equipamentos" ON equipamentos FOR ALL USING (auth.jwt() ->> 'email' = 'admtracksteel@gmail.com');


-- 7. Organizações
DROP POLICY IF EXISTS "Super Admin Ver Organizacoes" ON organizacoes;
DROP POLICY IF EXISTS "Users View Own Org" ON organizacoes;
DROP POLICY IF EXISTS "Universal Read Organizacoes" ON organizacoes; -- ADICIONADO
CREATE POLICY "Universal Read Organizacoes" ON organizacoes FOR SELECT TO authenticated USING (true); 

-- 8. Convites
DROP POLICY IF EXISTS "Super Admin Ver Convites" ON convites;
DROP POLICY IF EXISTS "Universal Read Convites" ON convites; -- ADICIONADO
DROP POLICY IF EXISTS "Super Admin Write Convites" ON convites; -- ADICIONADO
CREATE POLICY "Universal Read Convites" ON convites FOR SELECT TO authenticated USING (true); 
CREATE POLICY "Super Admin Write Convites" ON convites FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'admtracksteel@gmail.com');

-- Garantir validação de dados
UPDATE convites SET ativo = true WHERE ativo IS NULL;

-- 9. Usuários
DROP POLICY IF EXISTS "Users Read Own" ON usuarios;
DROP POLICY IF EXISTS "Admin Read All Users" ON usuarios;
CREATE POLICY "Users Read Own" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin Read All Users" ON usuarios FOR ALL USING (auth.jwt() ->> 'email' = 'admtracksteel@gmail.com');
