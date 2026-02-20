-- Arquivo atualizado para corrigir e validar permissões do Super Admin
-- Rode este script no Editor SQL do dashboard do Supabase

-- 1. Primeiro, removemos políticas antigas para evitar conflitos/duplicatas
drop policy if exists "Super Admin pode ver todas organizações" on organizacoes;
drop policy if exists "Super Admin pode criar organizações" on organizacoes;
drop policy if exists "Super Admin pode ver todos convites" on convites;
drop policy if exists "Super Admin pode criar convites" on convites;
drop policy if exists "Super Admin pode atualizar organizações" on organizacoes;
drop policy if exists "Super Admin pode deletar convites" on convites;

-- 2. Recriamos as políticas de forma robusta e garantida
-- Usamos auth.jwt() ->> 'email' que é mais confiável em alguns contextos do Supabase
-- E também verificamos se o usuário está autenticado

-- ORGANIZAÇÕES: SELECT (Ver Todas)
create policy "Super Admin pode ver todas organizações"
on organizacoes
for select
to authenticated
using (
  auth.jwt() ->> 'email' = 'admtracksteel@gmail.com'
);

-- ORGANIZAÇÕES: INSERT (Criar Novas)
create policy "Super Admin pode criar organizações"
on organizacoes
for insert
to authenticated
with check (
  auth.jwt() ->> 'email' = 'admtracksteel@gmail.com'
);

-- ORGANIZAÇÕES: UPDATE (Editar)
create policy "Super Admin pode atualizar organizações"
on organizacoes
for update
to authenticated
using (
  auth.jwt() ->> 'email' = 'admtracksteel@gmail.com'
);

-- CONVITES: SELECT (Ver Todos)
create policy "Super Admin pode ver todos convites"
on convites
for select
to authenticated
using (
  auth.jwt() ->> 'email' = 'admtracksteel@gmail.com'
);

-- CONVITES: INSERT (Criar Novos)
create policy "Super Admin pode criar convites"
on convites
for insert
to authenticated
with check (
  auth.jwt() ->> 'email' = 'admtracksteel@gmail.com'
);

-- CONVITES: DELETE (Deletar)
create policy "Super Admin pode deletar convites"
on convites
for delete
to authenticated
using (
  auth.jwt() ->> 'email' = 'admtracksteel@gmail.com'
);

-- 3. Verificação (Opcional - apenas para garantir que o usuário existe)
-- Se este select retornar o usuário, o email está correto no auth.users
select id, email from auth.users where email = 'admtracksteel@gmail.com';
