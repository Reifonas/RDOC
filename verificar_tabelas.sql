-- ============================================================================
-- VERIFICAR ESTRUTURA DO BANCO
-- ============================================================================

-- 1. Listar todas as tabelas no schema public
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verificar se as tabelas críticas existem
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuarios') 
        THEN '✅ usuarios existe'
        ELSE '❌ usuarios NÃO existe'
    END as usuarios_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizacoes') 
        THEN '✅ organizacoes existe'
        ELSE '❌ organizacoes NÃO existe'
    END as organizacoes_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizacao_usuarios') 
        THEN '✅ organizacao_usuarios existe'
        ELSE '❌ organizacao_usuarios NÃO existe'
    END as organizacao_usuarios_status;

-- 3. Verificar políticas RLS nas tabelas que existem
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
