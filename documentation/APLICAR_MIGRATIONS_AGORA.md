# 🚀 APLICAR MIGRATIONS AGORA

## ✅ STATUS

```
✅ .env atualizado com credenciais do novo projeto RDO
✅ Scripts de deploy criados
✅ Pronto para aplicar migrations!
```

---

## 🎯 PRÓXIMO PASSO

Aplicar as 4 migrations que criam o schema multi-tenant completo:

1. `20241202000001_create_multi_tenant_schema.sql` - Tabelas
2. `20241202000002_create_functions_and_triggers.sql` - Funções e triggers
3. `20241202000003_create_rls_policies.sql` - Segurança RLS
4. `20241202000004_seed_initial_data.sql` - Dados iniciais

---

## 🔧 COMO APLICAR

### Opção 1: Via Supabase CLI (Recomendado)

#### Windows (PowerShell):
```powershell
.\apply-migrations.ps1
```

#### Mac/Linux (Bash):
```bash
bash apply-migrations-cli.sh
```

#### Manual:
```bash
# 1. Linkar projeto
supabase link --project-ref mnwrnblzabxgqtgjwxgl

# 2. Aplicar migrations
supabase db push

# 3. Verificar
node check-supabase-status.js
```

### Opção 2: Via Dashboard Supabase (Manual)

1. Acesse: https://supabase.com/dashboard/project/mnwrnblzabxgqtgjwxgl/sql/new
2. Copie e cole cada migration na ordem:
   - `supabase/migrations/20241202000001_create_multi_tenant_schema.sql`
   - `supabase/migrations/20241202000002_create_functions_and_triggers.sql`
   - `supabase/migrations/20241202000003_create_rls_policies.sql`
   - `supabase/migrations/20241202000004_seed_initial_data.sql`
3. Execute cada uma

---

## ⏱️ TEMPO ESTIMADO

```
Linkar projeto:     2 min
Aplicar migrations: 3 min
Verificar:          1 min
─────────────────────────
TOTAL:              6 minutos
```

---

## ✅ RESULTADO ESPERADO

Após aplicar as migrations, você terá:

✅ **16 tabelas criadas:**
- organizacoes (tenants)
- usuarios
- organizacao_usuarios (roles)
- convites
- obras
- rdos
- rdo_atividades
- rdo_mao_obra
- rdo_equipamentos
- rdo_ocorrencias
- rdo_anexos
- rdo_inspecoes_solda
- rdo_verificacoes_torque
- tarefas
- task_logs
- organizacao_metricas

✅ **40+ Políticas RLS** para segurança multi-tenant

✅ **10+ Funções SQL** para automação

✅ **20+ Triggers** para propagação de dados

✅ **30+ Índices** para performance

---

## 🔍 VERIFICAR

Após aplicar, execute:

```bash
node check-supabase-status.js
```

**Resultado esperado:**
```
✅ Conexão estabelecida
✅ 16 tabelas criadas
✅ RLS habilitado em todas
✅ Banco de dados: POPULADO
```

---

## 🚀 DEPOIS DE APLICAR

1. **Iniciar desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Abrir no navegador:**
   ```
   http://localhost:5173
   ```

3. **Seguir o checklist:**
   Abra: `CHECKLIST_IMPLEMENTACAO.md`

---

## 📊 CREDENCIAIS CONFIGURADAS

```
URL:              https://mnwrnblzabxgqtgjwxgl.supabase.co
Anon Key:         eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎯 COMECE AGORA!

### Windows:
```powershell
.\apply-migrations.ps1
```

### Mac/Linux:
```bash
bash apply-migrations-cli.sh
```

### Manual:
```bash
supabase link --project-ref mnwrnblzabxgqtgjwxgl
supabase db push
```

---

**Tempo até estar pronto:** ~10 minutos ⏱️

**Próximo:** `COMECE_AQUI.md`
