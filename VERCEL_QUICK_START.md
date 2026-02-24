# ⚡ VERCEL - INÍCIO RÁPIDO

## 🎯 DEPLOY EM 10 MINUTOS

### 1. Criar projeto na Vercel
- Acesse: https://vercel.com/new
- Importe: `Reifonas/RDOC`
- Framework: **Vite**

### 2. Adicionar variáveis de ambiente

```bash
VITE_SUPABASE_URL=https://xzudfhifaancyxxfdejx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dWRmaGlmYWFuY3l4eGZkZWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjE0MTAsImV4cCI6MjA4NjkzNzQxMH0.c5CHWhfXcMrm27LfxEt6OZtttXXvVJOeWu-IbnNLfWY
```

### 3. Deploy
- Clique em **"Deploy"**
- Aguarde 2-3 minutos
- Anote a URL gerada

### 4. Configurar Supabase

Adicione no Supabase (Auth → URL Configuration):

```
https://SUA-URL.vercel.app/auth/callback
https://rdo.tracksteel.com.br/auth/callback
```

### 5. Configurar Google Cloud

Adicione no Google Cloud Console:

```
https://xzudfhifaancyxxfdejx.supabase.co/auth/v1/callback
https://SUA-URL.vercel.app/auth/callback
https://rdo.tracksteel.com.br/auth/callback
```

### 6. Testar
- Abra a URL da Vercel
- Faça login com Google
- Deve funcionar! ✅

---

## 🔗 LINKS ÚTEIS

- **Dashboard Vercel**: https://vercel.com/dashboard
- **Supabase Auth Config**: https://supabase.com/dashboard/project/xzudfhifaancyxxfdejx/auth/url-configuration
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials

---

## 📝 NOTAS

- A Vercel tem melhor suporte para Vite que o Netlify
- Deploy automático via GitHub está configurado
- Domínio customizado pode ser configurado depois

---

**Guia completo em: DEPLOY_VERCEL.md**

