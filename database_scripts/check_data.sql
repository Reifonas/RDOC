-- Verificar dados nas tabelas principais
SELECT 'obras' as tabela, COUNT(*) as total FROM obras
UNION ALL
SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'rdos' as tabela, COUNT(*) as total FROM rdos
UNION ALL
SELECT 'tipos_atividade' as tabela, COUNT(*) as total FROM tipos_atividade
UNION ALL
SELECT 'condicoes_climaticas' as tabela, COUNT(*) as total FROM condicoes_climaticas
UNION ALL
SELECT 'funcionarios' as tabela, COUNT(*) as total FROM funcionarios
ORDER BY tabela;