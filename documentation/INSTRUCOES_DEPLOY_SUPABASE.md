# 🚀 Instruções para Deploy no Supabase

## ✅ O QUE JÁ FOI CRIADO

Criei 4 migrations SQL completas para transformar seu sistema em SaaS multi-tenant:

1. **20241202000001_create_multi_tenant_schema.sql** - Estrutura de tabelas
2. **20241202000002_create_functions_and_triggers.sql** - Funções e triggers
3. **20241202000003_create_rls_policies.sql** - Políticas de segurança RLS
4. **20241202000004_seed_initial_data.sql** - Dados iniciais e helpers

## 📋 OPÇÕES PARA APLICAR AS MIGRATIONS

### **OPÇÃO 1: Via Supabase Dashboard (Mais Fácil)**

1. Acesse: https://supabase.com/dashboard/project/bbyzrywmgjiufqtnkslu

2. No menu lateral, clique em **SQL Editor**

3. Clique em **New Query**

4. Copie e cole o conteúdo de cada migration na ordem:
   - Primeiro: `20241202000001_create_multi_tenant_schema.sql`
   - Segundo: `20241202000002_create_functions_and_triggers.sql`
   - Terceiro: `20241202000003_create_rls_policies.sql`
   - Quarto: `20241202000004_seed_initial_data.sql`

5. Execute cada uma clicando em **Run** (ou Ctrl+Enter)

6. Verifique se não há erros no console

### **OPÇÃO 2: Via Supabase CLI (Recomendado)**

#### Pré-requisitos:
- Supabase CLI instalado ✅ (você já tem)
- Projeto linkado ao Supabase remoto

#### Passos:

1. **Linkar o projeto ao Supabase remoto:**
```bash
supabase link --project-ref bbyzrywmgjiufqtnkslu
```

Quando solicitar, use:
- **Database password**: A senha do banco de dados do seu projeto Supabase
  (Você pode encontrar em: Dashboard > Settings > Database > Database Password)

2. **Aplicar as migrations:**
```bash
supabase db push
```

Isso vai aplicar todas as migrations da pasta `supabase/migrations/` automaticamente.

3. **Verificar se foi aplicado:**
```bash
supabase db diff
```

Se não houver diferenças, significa que tudo foi aplicado com sucesso!

### **OPÇÃO 3: Via Script Node.js (Alternativa)**

Criei um script que você pode executar:

```bash
node apply-migrations.js
```

(Vou criar esse script agora)

## 🔐 ONDE ENCONTRAR A SENHA DO BANCO

1. Acesse: https://supabase.com/dashboard/project/bbyzrywmgjiufqtnkslu/settings/database

2. Procure por **Database Password**

3. Se você não lembra a senha:
   - Clique em **Reset Database Password**
   - Copie a nova senha
   - **IMPORTANTE**: Atualize a senha em todos os lugares onde usa

## ✅ VERIFICAR SE DEU CERTO

Após aplicar as migrations, execute este comando para verificar:

```bash
node check-supabase-status.js
```

Ou acesse o SQL Editor no Supabase e execute:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Contar registros na organização demo
SELECT COUNT(*) FROM public.organizacoes;
```

## 🎯 PRÓXIMOS PASSOS APÓS APLICAR

1. ✅ Verificar se todas as tabelas foram criadas
2. ✅ Testar criação de uma organização
3. ✅ Testar criação de um usuário
4. ✅ Atualizar o código frontend para usar o novo schema
5. ✅ Implementar roteamento com slug
6. ✅ Criar telas de onboarding

## 🆘 PROBLEMAS COMUNS

### "Permission denied for schema public"
**Solução**: Você precisa estar autenticado como owner do projeto. Use a senha correta do banco.

### "Relation already exists"
**Solução**: Algumas tabelas já existem. Você pode:
- Dropar as tabelas antigas primeiro (CUIDADO: vai perder dados)
- Ou ajustar as migrations para usar `CREATE TABLE IF NOT EXISTS`

### "Cannot link project"
**Solução**: Verifique se o project-ref está correto: `bbyzrywmgjiufqtnkslu`

## 📞 PRECISA DE AJUDA?

Se encontrar algum erro, me envie:
1. A mensagem de erro completa
2. Qual migration estava executando
3. Print da tela (se possível)

---

**Qual opção você prefere usar?**
- Opção 1 (Dashboard) é mais visual e fácil
- Opção 2 (CLI) é mais profissional e recomendada
- Opção 3 (Script) é automática mas precisa de configuração
