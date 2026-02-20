-- Migration to create missing auxiliary tables and stop frontend errors
-- Date: 2024-12-06

-- 1. TIPOS_ATIVIDADE
CREATE TABLE IF NOT EXISTS public.tipos_atividade (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tipos_atividade ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read
CREATE POLICY "Authenticated users can read tipos_atividade" ON public.tipos_atividade
    FOR SELECT USING (auth.role() = 'authenticated');

-- Insert default data
INSERT INTO public.tipos_atividade (nome, ordem) VALUES
('Escavação', 1),
('Fundação', 2),
('Concretagem', 3),
('Alvenaria', 4),
('Instalação Elétrica', 5),
('Instalação Hidráulica', 6),
('Revestimento', 7),
('Pintura', 8)
ON CONFLICT DO NOTHING;


-- 2. CONDICOES_CLIMATICAS
CREATE TABLE IF NOT EXISTS public.condicoes_climaticas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    valor TEXT NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    icone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.condicoes_climaticas ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read
CREATE POLICY "Authenticated users can read condicoes_climaticas" ON public.condicoes_climaticas
    FOR SELECT USING (auth.role() = 'authenticated');

-- Insert default data
INSERT INTO public.condicoes_climaticas (nome, valor, ordem, icone) VALUES
('Ensolarado', 'ensolarado', 1, 'Sun'),
('Parcialmente Nublado', 'parcialmente_nublado', 2, 'Cloud'),
('Nublado', 'nublado', 3, 'Cloud'),
('Chuvisco', 'chuvisco', 4, 'CloudRain'),
('Chuva Leve', 'chuva_leve', 5, 'CloudRain'),
('Chuva Forte', 'chuva_forte', 6, 'CloudRain')
ON CONFLICT DO NOTHING;


-- 3. FUNCIONARIOS (Mão de Obra / Laborers)
CREATE TABLE IF NOT EXISTS public.funcionarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    funcao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read
CREATE POLICY "Authenticated users can read funcionarios" ON public.funcionarios
    FOR SELECT USING (auth.role() = 'authenticated');

-- Insert default data (Mock)
INSERT INTO public.funcionarios (nome, funcao) VALUES
('João da Silva', 'Pedreiro'),
('José Santos', 'Servente'),
('Maria Oliveira', 'Engenheira'),
('Carlos Souza', 'Mestre de Obras')
ON CONFLICT DO NOTHING;
