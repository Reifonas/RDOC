-- Migration to fix infinite recursion in RLS policies
-- Date: 2024-12-06
-- Description: Introduces security definer function to fetch user organizations safely and updates policies.

-- 1. Create helper function to get user's organizations (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_my_org_ids()
RETURNS UUID[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT organizacao_id
    FROM public.organizacao_usuarios
    WHERE usuario_id = auth.uid()
      AND ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_my_org_ids() IS 'Retorna lista de IDs das organizações do usuário (Security Definer para evitar recursão)';

-- 2. Drop recursive policies

-- Organizacao Usuarios
DROP POLICY IF EXISTS "Ver membros da organização" ON public.organizacao_usuarios;
DROP POLICY IF EXISTS "Admins gerenciam membros" ON public.organizacao_usuarios;

-- Usuarios
DROP POLICY IF EXISTS "Usuários veem membros da organização" ON public.usuarios;
DROP POLICY IF EXISTS "Admins podem criar usuários" ON public.usuarios;


-- 3. Re-create policies using the safe function

-- ========================================
-- ORGANIZACAO_USUARIOS
-- ========================================

-- Usuários veem membros das organizações que participam
CREATE POLICY "Ver membros da organização" ON public.organizacao_usuarios
  FOR SELECT USING (
    organizacao_id = ANY(public.get_my_org_ids())
  );

-- Admins gerenciam membros (precisamos verificar role também)
CREATE POLICY "Admins gerenciam membros" ON public.organizacao_usuarios
  FOR ALL USING (
    organizacao_id = ANY(public.get_my_org_ids())
    AND (
      SELECT role FROM public.organizacao_usuarios 
      WHERE usuario_id = auth.uid() 
        AND organizacao_id = public.organizacao_usuarios.organizacao_id
    ) IN ('owner', 'admin')
  );
  -- Note: The subquery above might still be recursive if not careful.
  -- But since we are checking the row being accessed 'public.organizacao_usuarios.organizacao_id',
  -- and matching it against 'auth.uid()', we are looking up OUR OWN role in that specific org.
  -- To be absolutely safe and avoid recursion in 'role' lookup, we should use get_user_role() function which is SECURITY DEFINER.

DROP POLICY IF EXISTS "Admins gerenciam membros" ON public.organizacao_usuarios;
CREATE POLICY "Admins gerenciam membros" ON public.organizacao_usuarios
  FOR ALL USING (
    organizacao_id = ANY(public.get_my_org_ids())
    AND public.get_user_role(auth.uid(), organizacao_id) IN ('owner', 'admin')
  );


-- ========================================
-- USUARIOS
-- ========================================

-- Usuários veem outros usuários da mesma organização
CREATE POLICY "Usuários veem membros da organização" ON public.usuarios
  FOR SELECT USING (
    organizacao_id = ANY(public.get_my_org_ids())
  );

-- Admins podem criar usuários
CREATE POLICY "Admins podem criar usuários" ON public.usuarios
  FOR INSERT WITH CHECK (
    organizacao_id = ANY(public.get_my_org_ids())
    AND public.get_user_role(auth.uid(), organizacao_id) IN ('owner', 'admin')
  );

-- ========================================
-- OUTRAS TABELAS (Otimização opcional, mas recomendada para consistência)
-- ========================================

-- Atualizar convites
DROP POLICY IF EXISTS "Ver convites da organização" ON public.convites;
CREATE POLICY "Ver convites da organização" ON public.convites
  FOR SELECT USING (
    organizacao_id = ANY(public.get_my_org_ids())
  );

-- Atualizar tarefas
DROP POLICY IF EXISTS "Ver tarefas da organização" ON public.tarefas;
CREATE POLICY "Ver tarefas da organização" ON public.tarefas
  FOR SELECT USING (
    organizacao_id = ANY(public.get_my_org_ids())
  );
