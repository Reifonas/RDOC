-- Script para inserir dados fictícios adicionais no banco de dados
-- Usando UUIDs únicos e valores que não conflitam com dados existentes

-- Inserir tipos de atividade adicionais (se não existirem)
INSERT INTO tipos_atividade (id, nome, descricao, ativo, created_at) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'Estrutura Metálica', 'Montagem de estruturas metálicas', true, NOW()),
('750e8400-e29b-41d4-a716-446655440002', 'Alvenaria', 'Construção de paredes e muros', true, NOW()),
('750e8400-e29b-41d4-a716-446655440003', 'Instalações Elétricas', 'Instalação de sistemas elétricos', true, NOW()),
('750e8400-e29b-41d4-a716-446655440004', 'Instalações Hidráulicas', 'Instalação de sistemas hidráulicos', true, NOW()),
('750e8400-e29b-41d4-a716-446655440005', 'Acabamento', 'Serviços de acabamento e pintura', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserir condições climáticas adicionais (com valores únicos)
INSERT INTO condicoes_climaticas (id, nome, valor, descricao, ativo, created_at) VALUES
('650e8400-e29b-41d4-a716-446655440011', 'Tempo Bom', 'tempo_bom', 'Condições ideais para trabalho', true, NOW()),
('650e8400-e29b-41d4-a716-446655440012', 'Garoa', 'garoa', 'Chuva muito leve', true, NOW()),
('650e8400-e29b-41d4-a716-446655440013', 'Neblina', 'neblina', 'Visibilidade reduzida', true, NOW()),
('650e8400-e29b-41d4-a716-446655440014', 'Calor Intenso', 'calor_intenso', 'Temperatura muito alta', true, NOW())
ON CONFLICT (valor) DO NOTHING;

-- Inserir tipos de ocorrência
INSERT INTO tipos_ocorrencia (id, nome, descricao, ativo, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Acidente de Trabalho', 'Acidentes durante execução', true, NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Problema de Qualidade', 'Problemas na qualidade do serviço', true, NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Atraso de Material', 'Atraso na entrega de materiais', true, NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Problema Climático', 'Interrupção por condições climáticas', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserir funções e cargos
INSERT INTO funcoes_cargos (id, nome, descricao, ativo, created_at) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'Soldador', 'Profissional especializado em soldagem', true, NOW()),
('850e8400-e29b-41d4-a716-446655440002', 'Montador', 'Responsável pela montagem de estruturas', true, NOW()),
('850e8400-e29b-41d4-a716-446655440003', 'Pintor Industrial', 'Especialista em pintura anticorrosiva', true, NOW()),
('850e8400-e29b-41d4-a716-446655440004', 'Inspetor de Qualidade', 'Responsável pela inspeção e controle', true, NOW()),
('850e8400-e29b-41d4-a716-446655440005', 'Operador de Guindaste', 'Opera equipamentos de elevação', true, NOW()),
('850e8400-e29b-41d4-a716-446655440006', 'Encarregado', 'Supervisiona equipes de trabalho', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserir usuários fictícios
INSERT INTO usuarios (id, nome, email, telefone, tipo_usuario, ativo, created_at) VALUES
('950e8400-e29b-41d4-a716-446655440001', 'João Silva', 'joao.silva@empresa.com', '(11) 99999-0001', 'engenheiro', true, NOW()),
('950e8400-e29b-41d4-a716-446655440002', 'Maria Santos', 'maria.santos@empresa.com', '(11) 99999-0002', 'gestor', true, NOW()),
('950e8400-e29b-41d4-a716-446655440003', 'Pedro Oliveira', 'pedro.oliveira@empresa.com', '(11) 99999-0003', 'mestre', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Inserir obras fictícias
INSERT INTO obras (id, nome, descricao, endereco, status, data_inicio, created_at) VALUES
('a50e8400-e29b-41d4-a716-446655440001', 'Edifício Aurora', 'Construção de edifício comercial', 'Rua das Flores, 123 - Centro', 'em_andamento', '2024-01-15', NOW()),
('a50e8400-e29b-41d4-a716-446655440002', 'Galpão Industrial Beta', 'Construção de galpão para indústria', 'Av. Industrial, 456 - Distrito Industrial', 'em_andamento', '2024-02-01', NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserir funcionários fictícios
INSERT INTO funcionarios (id, nome, cpf, funcao_id, ativo, created_at) VALUES
('b50e8400-e29b-41d4-a716-446655440001', 'Carlos Ferreira', '123.456.789-01', '850e8400-e29b-41d4-a716-446655440001', true, NOW()),
('b50e8400-e29b-41d4-a716-446655440002', 'Ana Costa', '987.654.321-02', '850e8400-e29b-41d4-a716-446655440002', true, NOW()),
('b50e8400-e29b-41d4-a716-446655440003', 'Roberto Lima', '456.789.123-03', '850e8400-e29b-41d4-a716-446655440003', true, NOW()),
('b50e8400-e29b-41d4-a716-446655440004', 'Lucia Mendes', '789.123.456-04', '850e8400-e29b-41d4-a716-446655440004', true, NOW())
ON CONFLICT (cpf) DO NOTHING;

-- Conceder permissões para as tabelas
GRANT SELECT, INSERT, UPDATE, DELETE ON tipos_atividade TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON condicoes_climaticas TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tipos_ocorrencia TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON funcoes_cargos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON usuarios TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON obras TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON funcionarios TO anon, authenticated;