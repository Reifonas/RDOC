-- Execute este SQL para adicionar política temporária de debug
-- Isso permite que qualquer usuário autenticado se insira na tabela usuarios

DROP POLICY IF EXISTS "usuarios_insert_temp" ON public.usuarios;
CREATE POLICY "usuarios_insert_temp" ON public.usuarios
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Verificar se as organizações foram criadas
SELECT id, nome, slug FROM public.organizacoes;

-- Verificar se há usuários
SELECT id, email, nome, organizacao_id, role FROM public.usuarios;
