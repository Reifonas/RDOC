-- OPÇÃO NUCLEAR: Liberar leitura pública para tabelas de configuração e sistema
-- Objetivo: Confirmar se o bloqueio é RLS ou código.
-- Se após rodar isso os dados aparecerem, era RLS mal configurado.

-- 1. Tabelas de Configuração (Leitura Pública, Escrita Admin)
-- Materiais
DROP POLICY IF EXISTS "Public Read Materiais" ON materiais;
DROP POLICY IF EXISTS "Super Admin Total Materiais" ON materiais;
CREATE POLICY "Public Read Materiais" ON materiais FOR SELECT USING (true);
CREATE POLICY "Admin Write Materiais" ON materiais FOR ALL USING (auth.jwt() ->> 'email' = 'admtracksteel@gmail.com');

-- Atividades
DROP POLICY IF EXISTS "Public Read Atividades" ON tipos_atividade;
DROP POLICY IF EXISTS "Super Admin Total Tipos Atividade" ON tipos_atividade;
CREATE POLICY "Public Read Atividades" ON tipos_atividade FOR SELECT USING (true);
CREATE POLICY "Admin Write Atividades" ON tipos_atividade FOR ALL USING (auth.jwt() ->> 'email' = 'admtracksteel@gmail.com');

-- Clima
DROP POLICY IF EXISTS "Public Read Clima" ON condicoes_climaticas;
DROP POLICY IF EXISTS "Super Admin Total Condicoes Climaticas" ON condicoes_climaticas;
CREATE POLICY "Public Read Clima" ON condicoes_climaticas FOR SELECT USING (true);
CREATE POLICY "Admin Write Clima" ON condicoes_climaticas FOR ALL USING (auth.jwt() ->> 'email' = 'admtracksteel@gmail.com');

-- Ocorrências
DROP POLICY IF EXISTS "Public Read Ocorrencias" ON tipos_ocorrencia;
DROP POLICY IF EXISTS "Super Admin Total Tipos Ocorrencia" ON tipos_ocorrencia;
CREATE POLICY "Public Read Ocorrencias" ON tipos_ocorrencia FOR SELECT USING (true);
CREATE POLICY "Admin Write Ocorrencias" ON tipos_ocorrencia FOR ALL USING (auth.jwt() ->> 'email' = 'admtracksteel@gmail.com');

-- Funções
DROP POLICY IF EXISTS "Public Read Funcoes" ON funcoes_cargos;
DROP POLICY IF EXISTS "Super Admin Total Funcoes Cargos" ON funcoes_cargos;
CREATE POLICY "Public Read Funcoes" ON funcoes_cargos FOR SELECT USING (true);
CREATE POLICY "Admin Write Funcoes" ON funcoes_cargos FOR ALL USING (auth.jwt() ->> 'email' = 'admtracksteel@gmail.com');

-- Equipamentos
DROP POLICY IF EXISTS "Public Read Equipamentos" ON equipamentos;
DROP POLICY IF EXISTS "Super Admin Total Equipamentos" ON equipamentos;
CREATE POLICY "Public Read Equipamentos" ON equipamentos FOR SELECT USING (true);
CREATE POLICY "Admin Write Equipamentos" ON equipamentos FOR ALL USING (auth.jwt() ->> 'email' = 'admtracksteel@gmail.com');


-- 2. Tabelas de Sistema (Organizações - Leitura Autenticada, Convites - Leitura Autenticada)
-- Organizações
DROP POLICY IF EXISTS "Super Admin Ver Organizacoes" ON organizacoes;
DROP POLICY IF EXISTS "Users View Own Org" ON organizacoes;
CREATE POLICY "Universal Read Organizacoes" ON organizacoes FOR SELECT TO authenticated USING (true); -- Todo logado vê todas (Temporário para debug)

-- Convites
DROP POLICY IF EXISTS "Super Admin Ver Convites" ON convites;
CREATE POLICY "Universal Read Convites" ON convites FOR SELECT TO authenticated USING (true); -- Todo logado vê todos (Temporário para debug)
CREATE POLICY "Super Admin Write Convites" ON convites FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'admtracksteel@gmail.com');
UPDATE convites SET ativo = true WHERE ativo IS NULL; -- Garantir que convites não estejam nulos

-- 3. Usuarios (Garantir que usuários conseguem ler a si mesmos e o Admin vê tudo)
DROP POLICY IF EXISTS "Users Read Own" ON usuarios;
DROP POLICY IF EXISTS "Admin Read All Users" ON usuarios;
CREATE POLICY "Users Read Own" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin Read All Users" ON usuarios FOR ALL USING (auth.jwt() ->> 'email' = 'admtracksteel@gmail.com');
