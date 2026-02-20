-- Verificar usuários criados
SELECT 
    id, 
    email, 
    nome, 
    organizacao_id,
    role,
    created_at
FROM public.usuarios
ORDER BY created_at DESC;

-- Verificar se o super admin está associado à org correta
SELECT 
    u.email,
    u.nome,
    u.role,
    o.nome as organizacao_nome,
    o.slug as organizacao_slug
FROM public.usuarios u
LEFT JOIN public.organizacoes o ON u.organizacao_id = o.id
WHERE u.email = 'admtracksteel@gmail.com';
