# 🔧 CONFIGURAR SUPABASE PARA VERCEL

## 🎯 PROBLEMA

Erro 404 em `/auth/callback` após login com Google.

**Causa:** A URL da Vercel não está autorizada no Supabase.

---

## ✅ SOLUÇÃO

### 1. Adicionar Redirect URLs no Supabase

1. Acesse: https://supabase.com/dashboard/project/xzudfhifaancyxxfdejx/auth/url-configuration

2. Na seção **"Redirect URLs"**, adicione estas URLs (uma por linha):

```
https://rdots.vercel.app/auth/callback
https://rdots.vercel.app/*
https://rdo.tracksteel.com.br/auth/callback
https://rdo.tracksteel.com.br/*
http://localhost:5173/auth/callback
http://localhost:3000/auth/callback
```

3. Na seção **"Site URL"**, configure:
```
https://rdots.vercel.app
```

4. Clique em **"Save"**

---

### 2. Configurar Google Cloud Console

1. Acesse: https://console.cloud.google.com/apis/credentials

2. Clique no seu **OAuth 2.0 Client ID**

3. Na seção **"Authorized redirect URIs"**, adicione:

```
https://xzudfhifaancyxxfdejx.supabase.co/auth/v1/callback
https://rdots.vercel.app/auth/callback
https://rdo.tracksteel.com.br/auth/callback
http://localhost:5173/auth/callback
http://localhost:3000/auth/callback
```

4. Clique em **"Save"**

---

### 3. Aguardar Deploy da Vercel

O push que acabei de fazer vai disparar um novo deploy na Vercel.

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto
3. Vá em **"Deployments"**
4. Aguarde o deploy ficar **"Ready"** (verde) - 2-3 minutos

---

### 4. Testar Login

Após o deploy finalizar:

1. Abra: https://rdots.vercel.app
2. Pressione **Ctrl+Shift+R** (hard refresh)
3. Clique em **"Login com Google"**
4. Autorize o app
5. Deve redirecionar para `/auth/callback` ✅
6. Deve fazer login com sucesso ✅

---

## 📋 CHECKLIST

- [ ] Redirect URLs adicionadas no Supabase
- [ ] Site URL configurada no Supabase
- [ ] Redirect URIs adicionadas no Google Cloud
- [ ] Deploy da Vercel finalizado (aguardar 2-3 min)
- [ ] Hard refresh no navegador (Ctrl+Shift+R)
- [ ] Teste de login realizado

---

## 🔍 SE AINDA DER ERRO

### Erro: "Invalid redirect URL"
- Verifique se adicionou as URLs no Supabase
- Aguarde 1-2 minutos para propagação

### Erro: 404 em /auth/callback
- Aguarde o deploy da Vercel finalizar
- Verifique se o vercel.json foi aplicado
- Faça hard refresh (Ctrl+Shift+R)

### Erro: "Missing Publishable Key"
- Configure as variáveis de ambiente na Vercel
- Faça um redeploy sem cache

---

## 🎯 ORDEM DE EXECUÇÃO

1. ✅ **Configurar Supabase** (passo 1) - FAÇA AGORA
2. ✅ **Configurar Google Cloud** (passo 2) - FAÇA AGORA
3. ⏳ **Aguardar deploy** (passo 3) - 2-3 minutos
4. 🧪 **Testar login** (passo 4)

---

**Comece pelo passo 1 e 2 AGORA enquanto o deploy está rodando!**

