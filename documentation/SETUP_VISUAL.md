# 🎨 GUIA VISUAL - CONECTAR AO SUPABASE RDO

## 📍 ONDE VOCÊ ESTÁ

```
Projeto antigo (bbyzrywmgjiufqtnkslu) ❌
         ↓
Projeto novo "RDO" ← VOCÊ ESTÁ AQUI 👈
         ↓
Aplicação conectada ✅
```

---

## 🔧 OPÇÃO 1: SETUP AUTOMÁTICO (Recomendado)

### Execute este comando:

```bash
node setup-supabase.js
```

### O script vai:
1. ✅ Pedir as credenciais do novo projeto
2. ✅ Validar as credenciais
3. ✅ Atualizar o arquivo `.env`
4. ✅ Mostrar os próximos passos

**Tempo:** 2 minutos

---

## 🔧 OPÇÃO 2: SETUP MANUAL

### Passo 1: Obter Credenciais

Acesse: https://supabase.com/dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Clique no projeto "RDO"                                  │
│                                                             │
│    [Seu Projeto] [RDO] ← Clique aqui                       │
└─────────────────────────────────────────────────────────────┘
```

### Passo 2: Ir para Settings → API

```
┌─────────────────────────────────────────────────────────────┐
│ Menu Lateral:                                               │
│                                                             │
│ 🏠 Home                                                     │
│ 📊 SQL Editor                                               │
│ 🗄️ Database                                                │
│ 🔐 Authentication                                           │
│ 💾 Storage                                                  │
│ ⚙️ Settings ← Clique aqui                                  │
│    └─ API ← Depois aqui                                    │
└─────────────────────────────────────────────────────────────┘
```

### Passo 3: Copiar Credenciais

```
┌─────────────────────────────────────────────────────────────┐
│ API Settings                                                │
│                                                             │
│ Project URL                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://xyzabc123def456.supabase.co                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│ [Copiar] ← Clique aqui                                      │
│                                                             │
│ Anon public key                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...       │ │
│ └─────────────────────────────────────────────────────────┘ │
│ [Copiar] ← Clique aqui                                      │
│                                                             │
│ Service role key                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...       │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ⚠️ Não copie este (é secreto!)                             │
└─────────────────────────────────────────────────────────────┘
```

### Passo 4: Atualizar .env

Abra o arquivo `.env` na raiz do projeto:

```env
# ANTES
VITE_SUPABASE_URL=https://bbyzrywmgjiufqtnkslu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# DEPOIS (Cole as credenciais que copiou)
VITE_SUPABASE_URL=https://xyzabc123def456.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Salve o arquivo (Ctrl+S)**

---

## ✅ VERIFICAR A CONEXÃO

### Execute:

```bash
node check-supabase-status.js
```

### Resultado esperado:

```
🔍 Verificando status do Supabase...

📍 URL: https://xyzabc123def456.supabase.co
🔑 Anon Key: eyJhbGciOiJIUzI1NiIs...

1️⃣ Testando conexão...
✅ Conexão estabelecida com sucesso!

2️⃣ Verificando tabelas existentes...
📋 Verificando tabelas conhecidas:

   ❌ usuarios                  (não existe)
   ❌ organizacoes              (não existe)
   ❌ obras                     (não existe)
   ... (todas não existem - normal para novo projeto)

3️⃣ Resumo:
   📊 Tabelas encontradas: 0/11
   🗄️  Banco de dados: VAZIO

💡 O banco está vazio. Precisamos executar as migrations!
```

---

## 🚀 PRÓXIMOS PASSOS

### 1️⃣ Linkar Projeto Supabase CLI

```bash
supabase link --project-ref xyzabc123def456
```

**Quando solicitar a senha:**
- Acesse: https://supabase.com/dashboard/project/xyzabc123def456/settings/database
- Procure por "Database Password"
- Copie e cole

### 2️⃣ Aplicar Migrations

```bash
supabase db push
```

**Resultado esperado:**
```
✅ Migrations aplicadas com sucesso!
✅ 16 tabelas criadas
✅ RLS habilitado
✅ Funções e triggers funcionando
```

### 3️⃣ Verificar Novamente

```bash
node check-supabase-status.js
```

**Resultado esperado:**
```
✅ 16 tabelas criadas
✅ RLS habilitado em todas
✅ Banco de dados: POPULADO
```

### 4️⃣ Iniciar Desenvolvimento

```bash
npm run dev
```

---

## 📊 FLUXO VISUAL COMPLETO

```
┌─────────────────────────────────────────────────────────────┐
│ 1. OBTER CREDENCIAIS                                        │
│    Dashboard Supabase → Projeto RDO → Settings → API        │
│    Copiar: URL + Anon Key                                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ATUALIZAR .env                                           │
│    VITE_SUPABASE_URL = [URL copiada]                        │
│    VITE_SUPABASE_ANON_KEY = [Anon Key copiada]              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. VERIFICAR CONEXÃO                                        │
│    node check-supabase-status.js                            │
│    Resultado: ✅ Conexão OK, banco vazio                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. LINKAR PROJETO CLI                                       │
│    supabase link --project-ref [seu-project-id]             │
│    Inserir: Database Password                               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. APLICAR MIGRATIONS                                       │
│    supabase db push                                         │
│    Resultado: ✅ 16 tabelas criadas                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. VERIFICAR NOVAMENTE                                      │
│    node check-supabase-status.js                            │
│    Resultado: ✅ Banco populado com 16 tabelas              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. INICIAR DESENVOLVIMENTO                                  │
│    npm run dev                                              │
│    Resultado: ✅ App rodando em http://localhost:5173       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 CHECKLIST

### Configuração
- [ ] Acessei o dashboard do Supabase
- [ ] Selecionei o projeto "RDO"
- [ ] Copiei a Project URL
- [ ] Copiei a Anon Public Key
- [ ] Atualizei o arquivo `.env`
- [ ] Salvei o arquivo `.env`

### Verificação
- [ ] Executei `node check-supabase-status.js`
- [ ] Conexão está funcionando ✅
- [ ] Banco está vazio (normal)

### Deploy
- [ ] Executei `supabase link --project-ref [seu-id]`
- [ ] Executei `supabase db push`
- [ ] Executei `node check-supabase-status.js` novamente
- [ ] 16 tabelas foram criadas ✅

### Desenvolvimento
- [ ] Executei `npm run dev`
- [ ] App está rodando em http://localhost:5173
- [ ] Sem erros no console

---

## 🆘 PROBLEMAS?

### "Erro de conexão"
```bash
# Solução: Verifique as credenciais
node check-supabase-status.js
```

### "Projeto não encontrado"
```bash
# Solução: Verifique o project-ref
# Acesse: Settings → General → Project ID
```

### "Erro ao aplicar migrations"
```bash
# Solução: Verifique a senha do banco
# Acesse: Settings → Database → Database Password
```

---

## ✅ PRONTO!

Após completar todos os passos, você terá:

✅ App conectado ao novo projeto Supabase "RDO"
✅ 16 tabelas criadas
✅ RLS habilitado
✅ Pronto para implementação

**Próximo passo:** Abra `COMECE_AQUI.md` para continuar!

---

**Tempo total:** ~15 minutos
**Dificuldade:** ⭐ Fácil
