# ✅ CHECKLIST NETLIFY - CONFIGURAÇÃO COMPLETA

## STATUS ATUAL
- ✅ SQL executado com sucesso (2 usuários no banco)
- ✅ Políticas RLS configuradas
- ⚠️ Login ainda não funciona no Netlify

---

## 🔧 CONFIGURAÇÕES NECESSÁRIAS

### 1️⃣ VARIÁVEIS DE AMBIENTE NO NETLIFY

**CRÍTICO:** O Netlify NÃO lê o arquivo `.env` local!

#### Como configurar:

1. Acesse: https://app.netlify.com
2. Clique no seu site
3. Vá em: **Site settings** → **Environment variables**
4. Clique em **Add a variable**
5. Adicione estas 2 variáveis:

```
Key: VITE_SUPABASE_URL
Value: https://xzudfhifaancyxxfdejx.supabase.co

Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dWRmaGlmYWFuY3l4eGZkZWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjE0MTAsImV4cCI6MjA4NjkzNzQxMH0.c5CHWhfXcMrm27LfxEt6OZtttXXvVJOeWu-IbnNLfWY
```

6. **IMPORTANTE:** Após adicionar, clique em **Trigger deploy** para fazer um novo deploy

---

### 2️⃣ REDIRECT URLs NO SUPABASE

1. Acesse: https://supabase.com/dashboard/project/xzudfhifaancyxxfdejx/auth/url-configuration

2. Na seção **Redirect URLs**, adicione (substitua `SEU-SITE` pelo domínio real):

```
https://SEU-SITE.netlify.app/auth/callback
https://SEU-SITE.netlify.app/*
```

**Exemplo:**
```
https://rdo-tracksteel.netlify.app/auth/callback
https://rdo-tracksteel.netlify.app/*
```

3. Na seção **Site URL**, configure:
```
https://SEU-SITE.netlify.app
```

4. Clique em **Save**

---

### 3️⃣ GOOGLE CLOUD CONSOLE (OAuth)

1. Acesse: https://console.cloud.google.com/apis/credentials

2. Clique no seu **OAuth 2.0 Client ID**

3. Em **Authorized redirect URIs**, adicione:

```
https://xzudfhifaancyxxfdejx.supabase.co/auth/v1/callback
https://SEU-SITE.netlify.app/auth/callback
```

4. Clique em **Save**

---

## 🧪 COMO TESTAR

### Teste 1: Verificar Variáveis de Ambiente

Após fazer o deploy no Netlify:

1. Abra o site no Netlify
2. Pressione **F12** (Console do navegador)
3. Digite:

```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
```

**Resultado esperado:**
```
URL: https://xzudfhifaancyxxfdejx.supabase.co
Key: eyJhbGciOiJIUzI1NiIs...
```

**Se retornar `undefined`** = Variáveis não configuradas no Netlify!

---

### Teste 2: Verificar Login

1. Clique em "Login com Google"
2. Autorize o app
3. Deve redirecionar para `/auth/callback`
4. Deve fazer login com sucesso

---

## 🔍 DIAGNÓSTICO DE ERROS

### Erro: "Invalid redirect URL"
- ❌ Faltou adicionar URL no Supabase (passo 2)
- ❌ Faltou adicionar URI no Google Cloud (passo 3)

### Erro: "Environment variables not defined"
- ❌ Faltou configurar variáveis no Netlify (passo 1)
- ❌ Faltou fazer novo deploy após configurar

### Erro: 401 Unauthorized
- ✅ Já resolvido com o SQL que você executou!

### Login funciona mas volta para tela de login
- ❌ Variáveis de ambiente não configuradas
- ❌ Redirect URLs não configuradas

---

## 📋 ORDEM DE EXECUÇÃO

1. ✅ **SQL executado** (você já fez!)
2. ⬜ **Configurar variáveis no Netlify** (passo 1)
3. ⬜ **Fazer novo deploy no Netlify**
4. ⬜ **Configurar Redirect URLs no Supabase** (passo 2)
5. ⬜ **Configurar OAuth no Google Cloud** (passo 3)
6. ⬜ **Testar login**

---

## 🎯 QUAL É O SEU DOMÍNIO NETLIFY?

Para eu te dar os comandos exatos, me informe:

**Qual é a URL do seu site no Netlify?**

Exemplo: `https://rdo-tracksteel.netlify.app`

Com essa informação, posso te dar os valores exatos para copiar e colar!

---

## 💡 DICA RÁPIDA

Se você ainda não sabe a URL do Netlify:

1. Acesse: https://app.netlify.com
2. Clique no seu site
3. A URL está no topo da página (ex: `https://nome-do-site.netlify.app`)

