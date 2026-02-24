# 🎯 CONFIGURAÇÃO EXATA - rdo.tracksteel.com.br

## ✅ VALORES PRONTOS PARA COPIAR E COLAR

---

## 1️⃣ NETLIFY - VARIÁVEIS DE AMBIENTE

### Acesse:
https://app.netlify.com → Seu Site → Site settings → Environment variables

### Adicione estas 2 variáveis:

**Variável 1:**
```
Key: VITE_SUPABASE_URL
Value: https://xzudfhifaancyxxfdejx.supabase.co
```

**Variável 2:**
```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dWRmaGlmYWFuY3l4eGZkZWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjE0MTAsImV4cCI6MjA4NjkzNzQxMH0.c5CHWhfXcMrm27LfxEt6OZtttXXvVJOeWu-IbnNLfWY
```

### ⚠️ IMPORTANTE:
Após adicionar as variáveis, clique em **"Trigger deploy"** para fazer um novo deploy!

---

## 2️⃣ SUPABASE - REDIRECT URLs

### Acesse:
https://supabase.com/dashboard/project/xzudfhifaancyxxfdejx/auth/url-configuration

### Na seção "Redirect URLs", adicione estas URLs (uma por linha):

```
https://rdo.tracksteel.com.br/auth/callback
https://rdo.tracksteel.com.br/*
http://localhost:5173/auth/callback
http://localhost:3000/auth/callback
```

### Na seção "Site URL", configure:
```
https://rdo.tracksteel.com.br
```

### Clique em **Save**

---

## 3️⃣ GOOGLE CLOUD CONSOLE - OAUTH

### Acesse:
https://console.cloud.google.com/apis/credentials

### Clique no seu OAuth 2.0 Client ID

### Na seção "Authorized redirect URIs", adicione estas URIs:

```
https://xzudfhifaancyxxfdejx.supabase.co/auth/v1/callback
https://rdo.tracksteel.com.br/auth/callback
http://localhost:5173/auth/callback
http://localhost:3000/auth/callback
```

### Clique em **Save**

---

## 4️⃣ TESTE APÓS CONFIGURAR

### Teste 1: Verificar Variáveis de Ambiente

1. Abra: https://rdo.tracksteel.com.br
2. Pressione **F12** (Console do navegador)
3. Cole este código:

```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 30) + '...')
```

**Resultado esperado:**
```
URL: https://xzudfhifaancyxxfdejx.supabase.co
Key: eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...
```

**Se retornar `undefined`:**
- ❌ Variáveis não foram configuradas no Netlify
- ❌ Ou você não fez o novo deploy após configurar

---

### Teste 2: Login com Google

1. Acesse: https://rdo.tracksteel.com.br
2. Clique em **"Login com Google"**
3. Autorize o app
4. Deve redirecionar para: `https://rdo.tracksteel.com.br/auth/callback`
5. Deve fazer login com sucesso e ir para a página inicial

---

## 📋 CHECKLIST DE EXECUÇÃO

- [ ] 1. Configurar variáveis no Netlify
- [ ] 2. Fazer novo deploy no Netlify (Trigger deploy)
- [ ] 3. Aguardar deploy finalizar (2-3 minutos)
- [ ] 4. Configurar Redirect URLs no Supabase
- [ ] 5. Configurar OAuth no Google Cloud
- [ ] 6. Testar variáveis de ambiente (Teste 1)
- [ ] 7. Testar login com Google (Teste 2)

---

## 🔍 DIAGNÓSTICO DE PROBLEMAS

### Problema: Variáveis retornam `undefined`
**Solução:**
1. Verifique se adicionou as variáveis no Netlify
2. Verifique se fez o novo deploy
3. Aguarde o deploy finalizar completamente
4. Limpe o cache do navegador (Ctrl+Shift+Delete)

### Problema: "Invalid redirect URL"
**Solução:**
1. Verifique se adicionou as URLs no Supabase (passo 2)
2. Verifique se adicionou as URIs no Google Cloud (passo 3)
3. Aguarde 1-2 minutos para as configurações propagarem

### Problema: Erro 401 após login
**Solução:**
- ✅ Já resolvido! Você executou o SQL corretamente

### Problema: Login funciona mas volta para tela de login
**Solução:**
1. Verifique se as variáveis de ambiente estão configuradas
2. Verifique se o novo deploy foi feito
3. Limpe o cache do navegador

---

## 🎯 RESUMO RÁPIDO

**3 lugares para configurar:**

1. **Netlify** → Variáveis de ambiente + Novo deploy
2. **Supabase** → Redirect URLs
3. **Google Cloud** → Redirect URIs

**Tempo estimado:** 10-15 minutos

---

## 💡 DICA IMPORTANTE

Após configurar tudo, aguarde 2-3 minutos para:
- Deploy do Netlify finalizar
- Configurações do Supabase propagarem
- Configurações do Google Cloud propagarem

Depois teste o login!

---

**Qualquer dúvida, me avise em qual passo você está!**

