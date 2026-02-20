-- Arquivo para corrigir permissões do Super Admin no Supabase
-- Rode este script no Editor SQL do dashboard do Supabase

-- 1. Garante que o usuário admin tenha acesso total à tabela de organizações
create policy "Super Admin pode ver todas organizações"
on organizacoes
for select
to authenticated
using (
  auth.email() = 'admtracksteel@gmail.com'
);

-- 2. Garante que o usuário admin possa criar organizações (se necessário)
create policy "Super Admin pode criar organizações"
on organizacoes
for insert
to authenticated
with check (
  auth.email() = 'admtracksteel@gmail.com'
);

-- 3. Garante que o usuário admin possa ver todos os convites
create policy "Super Admin pode ver todos convites"
on convites
for select
to authenticated
using (
  auth.email() = 'admtracksteel@gmail.com'
);

-- 4. Garante que o usuário admin possa criar convites para qualquer organização
create policy "Super Admin pode criar convites"
on convites
for insert
to authenticated
with check (
  auth.email() = 'admtracksteel@gmail.com'
);

-- 5. Se o admin precisar deletar ou atualizar
create policy "Super Admin pode atualizar organizações"
on organizacoes
for update
to authenticated
using (
  auth.email() = 'admtracksteel@gmail.com'
);

create policy "Super Admin pode deletar convites"
on convites
for delete
to authenticated
using (
  auth.email() = 'admtracksteel@gmail.com'
);
