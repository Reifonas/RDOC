# 🔧 CORREÇÃO: Autenticação no Netlify

## 🎯 PROBLEMA IDENTIFICADO

O app funciona localmente (localhost:5173 e :3000) mas falha ao autenticar no Netlify devido a:

1. ❌ Variáveis de ambiente não configuradas no Netlify
2. ❌ URLs de callback OAuth não configuradas no Supabase
3. ❌ Políticas RLS bloqueando acesso após OAuth

---

## ✅ SOLUÇÃO COMPLETA

### 1️⃣ CONFIGURAR VARIÁVEIS DE AMBIENTE NO NETLIFY

Acesse: https://app.netlify.com → Seu Site → Site settings → Environment variables

Adicione estas variáveis:

```
VITE_SUPABASE_URL=https://xzudfhifaancyxxfdejx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dWRmaGlmYWFuY3l4eGZkZWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjE0MTAsImV4cCI6MjA4NjkzNzQxMH0.c5CHWhfXcMrm27LfxEt6OZtttXXvVJOeWu-IbnNLfWY
```

**IMPORTANTE:** Após adicionar, faça um novo deploy!

---

### 2️⃣ CONFIGURAR REDIRECT URLs NO SUPABASE

Acesse: https://supabase.com/dashboard/project/xzudfhifaancyxxfdejx/auth/url-configuration

Na seção **Redirect URLs**, adicione:

```
https://SEU-SITE.netlify.app/auth/callback
https://SEU-SITE.netlify.app/*
```

**Exemplo:**
```
https://rdo-tracksteel.netlify.app/auth/callback
https://rdo-tracksteel.netlify.app/*
```

Na seção **Site URL**, configure:
```
https://SEU-SITE.netlify.app
```

---

### 3️⃣ CORRIGIR POLÍTICAS RLS PARA OAUTH

O problema principal: quando um usuário faz login via Google OAuth, o Supabase cria o registro em `auth.users`, mas a política RLS impede a criação automática do perfil em `public.usuarios`.

Execute este SQL no Supabase (SQL Editor):

```sql
-- ============================================================================
-- CORREÇÃO RLS PARA OAUTH - PERMITIR CRIAÇÃO AUTOMÁTICA DE PERFIL
-- ============================================================================

-- 1. Permitir INSERT na tabela usuarios para usuários autenticados
DROP POLICY IF EXISTS "Users can create own profile" ON public.usuarios;

CREATE POLICY "Users can create own profile" ON public.usuarios
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- 2. Garantir que o trigger handle_new_user funciona
-- Verificar se a função existe
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir novo usuário na tabela public.usuarios
    INSERT INTO public.usuarios (
        id,
        email,
        nome,
        role,
        ativo
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'usuario',
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        nome = COALESCE(EXCLUDED.nome, public.usuarios.nome),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Garantir que o trigger está ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. Permitir leitura de organizações para usuários sem organização (signup)
DROP POLICY IF EXISTS "Users can view orgs during signup" ON public.organizacoes;

CREATE POLICY "Users can view orgs during signup" ON public.organizacoes
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- 5. Permitir criação de organização para novos usuários
DROP POLICY IF EXISTS "Users can create org" ON public.organizacoes;

CREATE POLICY "Users can create org" ON public.organizacoes
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- FIM DA CORREÇÃO
-- ============================================================================
```

---

### 4️⃣ VERIFICAR CONFIGURAÇÃO DO GOOGLE OAUTH

No Google Cloud Console (https://console.cloud.google.com):

1. Acesse: APIs & Services → Credentials
2. Clique no seu OAuth 2.0 Client ID
3. Em **Authorized redirect URIs**, adicione:

```
https://xzudfhifaancyxxfdejx.supabase.co/auth/v1/callback
https://SEU-SITE.netlify.app/auth/callback
```

---

## 🧪 TESTAR A CORREÇÃO

### Teste 1: Variáveis de Ambiente
```bash
# No console do navegador (F12) no site Netlify:
console.log(import.meta.env.VITE_SUPABASE_URL)
```
Deve retornar: `https://xzudfhifaancyxxfdejx.supabase.co`

### Teste 2: Login OAuth
1. Acesse seu site no Netlify
2. Clique em "Login com Google"
3. Autorize o app
4. Deve redirecionar e autenticar com sucesso

### Teste 3: Verificar Perfil Criado
No Supabase SQL Editor:
```sql
SELECT * FROM public.usuarios WHERE email = 'seu-email@gmail.com';
```

---

## 🔍 DIAGNÓSTICO DE PROBLEMAS

### Erro: "Invalid redirect URL"
- ✅ Verifique se adicionou a URL no Supabase (passo 2)
- ✅ Verifique se adicionou no Google Cloud (passo 4)

### Erro: "User not found" ou "Permission denied"
- ✅ Execute o SQL de correção RLS (passo 3)
- ✅ Verifique se o trigger `handle_new_user` está ativo

### Erro: "Environment variables not defined"
- ✅ Configure variáveis no Netlify (passo 1)
- ✅ Faça um novo deploy após adicionar

### Login funciona mas não carrega dados
- ✅ Problema de RLS - execute o SQL do passo 3
- ✅ Verifique se o usuário foi criado em `public.usuarios`

---

## 📋 CHECKLIST FINAL

- [ ] Variáveis de ambiente configuradas no Netlify
- [ ] Novo deploy realizado após configurar variáveis
- [ ] Redirect URLs adicionadas no Supabase
- [ ] Redirect URIs adicionadas no Google Cloud
- [ ] SQL de correção RLS executado no Supabase
- [ ] Teste de login OAuth realizado com sucesso
- [ ] Perfil do usuário criado em `public.usuarios`

---

## 🎯 RESULTADO ESPERADO

Após seguir todos os passos:

✅ Login via Google funciona no Netlify
✅ Perfil do usuário é criado automaticamente
✅ Usuário consegue acessar o app normalmente
✅ RLS permite acesso aos dados da organização

---

**Data:** 24/02/2026
**Status:** Aguardando aplicação das correções
