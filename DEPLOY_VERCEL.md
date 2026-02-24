# 🚀 DEPLOY NA VERCEL - rdo.tracksteel.com.br

## ✅ VANTAGENS DA VERCEL

- ✅ Melhor suporte para Vite/React
- ✅ Deploy automático via GitHub
- ✅ Configuração de variáveis mais simples
- ✅ Edge Functions nativas
- ✅ Melhor performance global

---

## 📋 PASSO A PASSO COMPLETO

### 1️⃣ CRIAR PROJETO NA VERCEL (5 minutos)

1. Acesse: https://vercel.com/login
2. Faça login com GitHub
3. Clique em **"Add New..."** → **"Project"**
4. Selecione o repositório: **Reifonas/RDOC**
5. Clique em **"Import"**

---

### 2️⃣ CONFIGURAR O PROJETO

Na tela de configuração:

#### Framework Preset:
```
Vite
```

#### Build Command:
```
npm run build
```

#### Output Directory:
```
dist
```

#### Install Command:
```
npm ci
```

---

### 3️⃣ ADICIONAR VARIÁVEIS DE AMBIENTE

Na seção **"Environment Variables"**, adicione:

**Variável 1:**
```
Name: VITE_SUPABASE_URL
Value: https://xzudfhifaancyxxfdejx.supabase.co
```

**Variável 2:**
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dWRmaGlmYWFuY3l4eGZkZWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjE0MTAsImV4cCI6MjA4NjkzNzQxMH0.c5CHWhfXcMrm27LfxEt6OZtttXXvVJOeWu-IbnNLfWY
```

**IMPORTANTE:** Marque para aplicar em **Production**, **Preview** e **Development**

---

### 4️⃣ FAZER O DEPLOY

1. Clique em **"Deploy"**
2. Aguarde o build finalizar (2-3 minutos)
3. Anote a URL gerada (ex: `https://rdoc-xxx.vercel.app`)

---

### 5️⃣ CONFIGURAR DOMÍNIO CUSTOMIZADO

1. No dashboard do projeto, vá em **"Settings"** → **"Domains"**
2. Clique em **"Add"**
3. Digite: `rdo.tracksteel.com.br`
4. Clique em **"Add"**

#### Configurar DNS:

A Vercel vai mostrar os registros DNS necessários. Configure no seu provedor de DNS:

**Opção A - CNAME (Recomendado):**
```
Type: CNAME
Name: rdo
Value: cname.vercel-dns.com
```

**Opção B - A Record:**
```
Type: A
Name: rdo
Value: 76.76.21.21
```

---

### 6️⃣ CONFIGURAR SUPABASE

Acesse: https://supabase.com/dashboard/project/xzudfhifaancyxxfdejx/auth/url-configuration

#### Redirect URLs (adicione estas):

```
https://rdo.tracksteel.com.br/auth/callback
https://rdo.tracksteel.com.br/*
https://rdoc-xxx.vercel.app/auth/callback
https://rdoc-xxx.vercel.app/*
http://localhost:5173/auth/callback
http://localhost:3000/auth/callback
```

**Substitua `rdoc-xxx` pela URL real que a Vercel gerou!**

#### Site URL:
```
https://rdo.tracksteel.com.br
```

Clique em **Save**

---

### 7️⃣ CONFIGURAR GOOGLE CLOUD

Acesse: https://console.cloud.google.com/apis/credentials

Clique no seu **OAuth 2.0 Client ID**

#### Authorized redirect URIs (adicione estas):

```
https://xzudfhifaancyxxfdejx.supabase.co/auth/v1/callback
https://rdo.tracksteel.com.br/auth/callback
https://rdoc-xxx.vercel.app/auth/callback
http://localhost:5173/auth/callback
http://localhost:3000/auth/callback
```

**Substitua `rdoc-xxx` pela URL real que a Vercel gerou!**

Clique em **Save**

---

## 🧪 TESTAR O DEPLOY

### Teste 1: Acessar o site

1. Abra: `https://rdoc-xxx.vercel.app` (URL da Vercel)
2. Ou: `https://rdo.tracksteel.com.br` (após configurar DNS)
3. O site deve carregar normalmente

---

### Teste 2: Verificar variáveis

1. Abra o DevTools (F12)
2. Vá na aba **Network**
3. Recarregue a página
4. Procure por requisições para `xzudfhifaancyxxfdejx.supabase.co`
5. Se aparecer = ✅ Variáveis configuradas!

---

### Teste 3: Login com Google

1. Clique em **"Login com Google"**
2. Autorize o app
3. Deve redirecionar para `/auth/callback`
4. Deve fazer login com sucesso ✅

---

## 🔄 DEPLOY AUTOMÁTICO

A Vercel faz deploy automático quando você faz push para o GitHub:

- **Branch `main`** → Deploy em produção
- **Outras branches** → Deploy de preview

---

## 📊 MONITORAMENTO

### Ver logs de build:
1. Acesse: https://vercel.com/dashboard
2. Clique no projeto
3. Vá em **"Deployments"**
4. Clique em um deploy para ver os logs

### Ver logs de runtime:
1. No dashboard do projeto
2. Vá em **"Logs"**
3. Veja erros em tempo real

---

## 🔧 CONFIGURAÇÕES AVANÇADAS

### Variáveis de ambiente por ambiente:

- **Production**: Usado no domínio principal
- **Preview**: Usado em branches de teste
- **Development**: Usado localmente com `vercel dev`

### Revalidar cache:

Se fizer mudanças e não aparecerem:
1. Vá em **"Deployments"**
2. Clique nos 3 pontos do deploy
3. Clique em **"Redeploy"**

---

## 🆚 COMPARAÇÃO: VERCEL vs NETLIFY

| Recurso | Vercel | Netlify |
|---------|--------|---------|
| Build Vite | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Deploy automático | ✅ | ✅ |
| Edge Functions | ✅ Nativo | ✅ Limitado |
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Configuração | Mais simples | Mais complexa |
| Logs | Excelente | Bom |

---

## 📋 CHECKLIST FINAL

- [ ] Projeto criado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] Domínio customizado configurado
- [ ] DNS configurado (aguardar propagação)
- [ ] Redirect URLs adicionadas no Supabase
- [ ] Redirect URIs adicionadas no Google Cloud
- [ ] Teste de login realizado com sucesso

---

## 🎯 RESULTADO ESPERADO

Após seguir todos os passos:

✅ Site acessível em `https://rdo.tracksteel.com.br`
✅ Login com Google funcionando
✅ Deploy automático via GitHub
✅ Variáveis de ambiente configuradas
✅ Performance otimizada

---

## 💡 DICAS

1. **Aguarde a propagação DNS** (pode levar até 24h, mas geralmente 5-10 minutos)
2. **Use a URL da Vercel** (`rdoc-xxx.vercel.app`) para testar antes do DNS propagar
3. **Limpe o cache** do navegador após cada deploy
4. **Monitore os logs** para identificar problemas rapidamente

---

## 🆘 PROBLEMAS COMUNS

### Build falha:
- Verifique os logs de build
- Verifique se as dependências estão corretas
- Tente fazer build local: `npm run build`

### Variáveis não carregam:
- Verifique se adicionou as variáveis
- Verifique se marcou para Production
- Faça um novo deploy

### Login não funciona:
- Verifique se adicionou as redirect URLs no Supabase
- Verifique se adicionou as redirect URIs no Google Cloud
- Aguarde 1-2 minutos para propagação

---

**Qualquer dúvida, me avise em qual passo você está!**

