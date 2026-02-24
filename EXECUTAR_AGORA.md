# 🚨 EXECUTAR AGORA - CORREÇÃO ERRO 401

## ❌ PROBLEMA ATUAL
Erro 401 ao tentar fazer login - RLS bloqueando acesso à tabela `usuarios`

## ✅ SOLUÇÃO IMEDIATA (5 minutos)

### PASSO 1: Executar SQL no Supabase

1. Acesse: https://supabase.com/dashboard/project/xzudfhifaancyxxfdejx/sql/new

2. Copie TODO o conteúdo do arquivo: **fix_rls_401_urgente.sql**

3. Cole no SQL Editor e clique em **RUN**

4. Aguarde a mensagem de sucesso

### PASSO 2: Testar Login

1. Abra o app no Netlify (ou localhost)

2. Tente fazer login com Google

3. Deve funcionar agora!

---

## 🔍 O QUE O SQL FAZ

1. ✅ Remove TODAS as políticas RLS antigas que estavam causando conflito
2. ✅ Cria políticas SUPER PERMISSIVAS temporárias (qualquer autenticado acessa tudo)
3. ✅ Corrige a função `handle_new_user()` para criar perfil automaticamente
4. ✅ Garante permissões para role `authenticated`

---

## ⚠️ IMPORTANTE

Estas políticas são MUITO PERMISSIVAS e servem apenas para fazer o login funcionar.

Depois que confirmar que está funcionando, você pode aplicar políticas mais restritivas baseadas em `organizacao_id`.

---

## 🧪 VERIFICAÇÃO

Após executar o SQL, teste no console do navegador (F12):

```javascript
// No site do Netlify, após fazer login
const { data, error } = await supabase.from('usuarios').select('*').limit(1)
console.log('Teste RLS:', data, error)
```

Se retornar dados (ou array vazio) sem erro = ✅ Funcionando
Se retornar erro 401 = ❌ Execute o SQL novamente

---

## 📞 PRÓXIMOS PASSOS

1. Execute o SQL
2. Teste o login
3. Me avise se funcionou
4. Depois refinamos as políticas RLS para segurança adequada

