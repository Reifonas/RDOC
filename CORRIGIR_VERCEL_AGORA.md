# 🚨 CORRIGIR VERCEL - VARIÁVEIS DE AMBIENTE

## ❌ PROBLEMA ATUAL

Erro: **"Missing Publishable Key"**

Isso significa que as variáveis de ambiente NÃO foram configuradas ou NÃO foram aplicadas no build.

---

## ✅ SOLUÇÃO PASSO A PASSO

### 1. Verificar se as variáveis existem

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto **rdots** (ou o nome do seu projeto)
3. Vá em **Settings** → **Environment Variables**
4. Verifique se existem estas 2 variáveis:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

### 2. Se as variáveis NÃO existem:

Adicione-as agora:

**Variável 1:**
```
Key: VITE_SUPABASE_URL
Value: https://xzudfhifaancyxxfdejx.supabase.co
Environments: Production ✅ Preview ✅ Development ✅
```

**Variável 2:**
```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dWRmaGlmYWFuY3l4eGZkZWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjE0MTAsImV4cCI6MjA4NjkzNzQxMH0.c5CHWhfXcMrm27LfxEt6OZtttXXvVJOeWu-IbnNLfWY
Environments: Production ✅ Preview ✅ Development ✅
```

**IMPORTANTE:** Marque as 3 checkboxes (Production, Preview, Development)!

---

### 3. Se as variáveis JÁ existem:

Verifique se estão marcadas para **Production**:

1. Clique no ícone de lápis (editar) ao lado de cada variável
2. Certifique-se que **Production** está marcado ✅
3. Clique em **Save**

---

### 4. Fazer um novo deploy (OBRIGATÓRIO!)

Após adicionar/editar as variáveis, você DEVE fazer um novo deploy:

**Opção A - Redeploy:**
1. Vá em **Deployments**
2. Clique nos 3 pontos do último deploy
3. Clique em **"Redeploy"**
4. Marque **"Use existing Build Cache"** = ❌ (desmarque!)
5. Clique em **"Redeploy"**

**Opção B - Trigger via Git:**
```bash
# No terminal local
git commit --allow-empty -m "trigger: Forçar rebuild na Vercel"
git push origin main
```

---

### 5. Aguardar o build finalizar

1. Vá em **Deployments**
2. Aguarde o novo deploy ficar **"Ready"** (verde)
3. Clique no deploy
4. Clique em **"Visit"** para abrir o site

---

## 🧪 TESTAR SE FUNCIONOU

Após o novo deploy:

1. Abra: https://rdots.vercel.app (ou sua URL)
2. Pressione **Ctrl+Shift+R** (hard refresh)
3. Abra o DevTools (F12)
4. Vá na aba **Console**
5. Veja se o erro "Missing Publishable Key" sumiu

---

## 🔍 VERIFICAR SE AS VARIÁVEIS ESTÃO CARREGANDO

No console do navegador (F12), digite:

```javascript
// Isso NÃO vai funcionar no console, mas você pode ver no código fonte
// Vá em Sources → Procure por arquivos .js → Procure por "xzudfhifaancyxxfdejx"
```

Se encontrar "xzudfhifaancyxxfdejx" no código = ✅ Variáveis carregadas!
Se NÃO encontrar = ❌ Variáveis não foram injetadas no build

---

## 📋 CHECKLIST

- [ ] Variáveis existem em Settings → Environment Variables
- [ ] Variáveis estão marcadas para Production
- [ ] Fiz um novo deploy (Redeploy)
- [ ] Aguardei o build finalizar
- [ ] Fiz hard refresh no navegador (Ctrl+Shift+R)
- [ ] Erro "Missing Publishable Key" sumiu

---

## 🆘 SE AINDA NÃO FUNCIONAR

Me envie:
1. Print da tela de Environment Variables da Vercel
2. Print do console (F12) mostrando os erros
3. URL do seu projeto na Vercel

