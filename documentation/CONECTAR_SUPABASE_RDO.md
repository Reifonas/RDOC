# 🔗 CONECTAR AO PROJETO SUPABASE "RDO"

## 📋 PASSO A PASSO

### 1️⃣ OBTER AS CREDENCIAIS DO NOVO PROJETO

#### No Dashboard do Supabase:

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto **"RDO"** (o novo)
3. Clique em **Settings** (engrenagem) no menu lateral
4. Vá para **API** (ou **Configuration**)
5. Copie as seguintes informações:

```
Project URL (VITE_SUPABASE_URL):
https://[seu-project-id].supabase.co

Anon Public Key (VITE_SUPABASE_ANON_KEY):
eyJhbGciOiJIUzI1NiIs...
```

---

### 2️⃣ ATUALIZAR O ARQUIVO .env

Abra o arquivo `.env` na raiz do projeto e substitua:

```env
# ANTES (projeto antigo)
VITE_SUPABASE_URL=https://bbyzrywmgjiufqtnkslu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# DEPOIS (novo projeto RDO)
VITE_SUPABASE_URL=https://[seu-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[sua-anon-key]
```

**Exemplo:**
```env
VITE_SUPABASE_URL=https://xyzabc123def456.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjeWphYmMxMjNkZWY0NTYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczMzE0NTYwMCwiZXhwIjoyMDQ4NzIxNjAwfQ.abc123...
```

---

### 3️⃣ LINKAR O PROJETO SUPABASE CLI

Se você vai usar o Supabase CLI para aplicar as migrations:

```bash
# Deslinkar projeto antigo (se necessário)
supabase unlink

# Linkar novo projeto RDO
supabase link --project-ref [seu-project-id]
```

**Onde encontrar o project-ref:**
- Dashboard Supabase → Settings → General
- Procure por "Project ID" ou "Reference ID"
- Exemplo: `xyzabc123def456`

Quando solicitar a senha do banco:
- Vá em: Settings → Database → Database Password
- Copie e cole a senha

---

### 4️⃣ VERIFICAR A CONEXÃO

Execute o script de verificação:

```bash
node check-supabase-status.js
```

**Resultado esperado:**
```
✅ Conexão estabelecida com sucesso!
📋 Verificando tabelas existentes...
❌ Banco está vazio (normal para novo projeto)
```

---

### 5️⃣ APLICAR AS MIGRATIONS

Agora que está conectado, aplique as migrations:

```bash
# Opção 1: Via Supabase CLI (Recomendado)
supabase db push

# Opção 2: Via Dashboard (Manual)
# Copie e cole cada migration no SQL Editor
```

---

## 🔍 ONDE ENCONTRAR AS CREDENCIAIS

### No Dashboard Supabase:

```
Dashboard → Seu Projeto "RDO" → Settings → API
```

Você verá:

```
┌─────────────────────────────────────────┐
│ Project URL                             │
│ https://xyzabc123def456.supabase.co     │ ← VITE_SUPABASE_URL
├─────────────────────────────────────────┤
│ Anon public key                         │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │ ← VITE_SUPABASE_ANON_KEY
├─────────────────────────────────────────┤
│ Service role key                        │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │ ← SUPABASE_SERVICE_ROLE_KEY
└─────────────────────────────────────────┘
```

---

## ⚠️ IMPORTANTE

### Segurança
- ✅ **VITE_SUPABASE_URL** - Pode ser público (está no frontend)
- ✅ **VITE_SUPABASE_ANON_KEY** - Pode ser público (está no frontend)
- ❌ **SUPABASE_SERVICE_ROLE_KEY** - NUNCA compartilhe ou coloque no frontend!

### Variáveis de Ambiente
- Arquivo `.env` é local (não é commitado no git)
- Cada desenvolvedor tem seu próprio `.env`
- Em produção, configure as variáveis no Vercel/Netlify

---

## 🧪 TESTAR A CONEXÃO

Após atualizar o `.env`, teste a conexão:

```bash
# 1. Parar o dev server (se estiver rodando)
# Ctrl+C

# 2. Reiniciar o dev server
npm run dev

# 3. Abrir o navegador
# http://localhost:5173

# 4. Abrir o console (F12)
# Procure por mensagens de erro
```

Se tudo estiver certo, você verá a aplicação carregando normalmente.

---

## 🆘 PROBLEMAS COMUNS

### "Erro de conexão com Supabase"
**Solução:**
1. Verifique se as credenciais estão corretas
2. Verifique se não há espaços em branco extras
3. Reinicie o dev server

### "Projeto não encontrado"
**Solução:**
1. Verifique se o project-ref está correto
2. Verifique se o projeto existe no Supabase
3. Verifique se você está logado na conta correta

### "Erro de autenticação"
**Solução:**
1. Verifique se a ANON_KEY está correta
2. Verifique se não há caracteres faltando
3. Copie novamente do dashboard

---

## ✅ CHECKLIST

- [ ] Acessei o dashboard do Supabase
- [ ] Selecionei o projeto "RDO"
- [ ] Copiei a Project URL
- [ ] Copiei a Anon Public Key
- [ ] Atualizei o arquivo `.env`
- [ ] Executei `node check-supabase-status.js`
- [ ] Conexão está funcionando ✅

---

## 📞 PRÓXIMO PASSO

Após conectar com sucesso:

1. **Aplicar as migrations:**
   ```bash
   supabase link --project-ref [seu-project-id]
   supabase db push
   ```

2. **Seguir o guia de implementação:**
   - Abra: `COMECE_AQUI.md`
   - Siga: `CHECKLIST_IMPLEMENTACAO.md`

---

**Pronto para conectar? 🚀**

Envie-me as credenciais do novo projeto RDO e vou ajudar você a configurar tudo!
