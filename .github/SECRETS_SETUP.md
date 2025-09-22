# Configuração de Secrets para GitHub Actions

Para que a automação funcione corretamente, você precisa configurar os seguintes secrets no seu repositório GitHub:

## Como Configurar Secrets

1. Vá para o seu repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** > **Actions**
4. Clique em **New repository secret**
5. Adicione cada secret listado abaixo

## Secrets Necessários

### 🔑 REMOTE_REPO_TOKEN
**Descrição:** Token de acesso pessoal para o repositório remoto `https://github.com/Reifonas/TS_RDO.git`

**Como obter:**
1. Vá para GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Clique em "Generate new token (classic)"
3. Selecione as permissões:
   - `repo` (acesso completo a repositórios)
   - `workflow` (atualizar workflows)
   - `write:packages` (se usar packages)
4. Copie o token gerado
5. Cole no secret `REMOTE_REPO_TOKEN`

### 🌐 NETLIFY_AUTH_TOKEN (Opcional)
**Descrição:** Token de autenticação do Netlify para deploy automático

**Como obter:**
1. Faça login no Netlify
2. Vá para User settings > Applications > Personal access tokens
3. Clique em "New access token"
4. Dê um nome e clique em "Generate token"
5. Copie o token e cole no secret `NETLIFY_AUTH_TOKEN`

### 🆔 NETLIFY_SITE_ID (Opcional)
**Descrição:** ID do site no Netlify

**Como obter:**
1. No dashboard do Netlify, clique no seu site
2. Vá para Site settings > General > Site details
3. Copie o "Site ID"
4. Cole no secret `NETLIFY_SITE_ID`

## Verificação da Configuração

Após configurar os secrets, você pode testar a automação:

1. **Teste Manual:**
   - Vá para Actions no seu repositório
   - Clique em "Auto Sync and Deploy"
   - Clique em "Run workflow"
   - Marque "Force deploy" se quiser forçar

2. **Teste Automático:**
   - Faça qualquer alteração no código
   - Commit e push para a branch main
   - A action será executada automaticamente

## Estrutura dos Secrets

```
Repository Secrets:
├── REMOTE_REPO_TOKEN     # Token para repositório remoto (OBRIGATÓRIO)
├── NETLIFY_AUTH_TOKEN    # Token Netlify (opcional)
├── NETLIFY_SITE_ID       # ID do site Netlify (opcional)
└── GITHUB_TOKEN          # Automático (não precisa configurar)
```

## Troubleshooting

### ❌ Erro: "Authentication failed"
- Verifique se o `REMOTE_REPO_TOKEN` está correto
- Confirme se o token tem as permissões necessárias
- Verifique se o token não expirou

### ❌ Erro: "Repository not found"
- Confirme se o repositório `Reifonas/TS_RDO` existe
- Verifique se o token tem acesso ao repositório

### ❌ Erro de Deploy Netlify
- Verifique se `NETLIFY_AUTH_TOKEN` e `NETLIFY_SITE_ID` estão corretos
- Confirme se o site existe no Netlify

## Logs e Monitoramento

Para acompanhar a execução:
1. Vá para **Actions** no seu repositório
2. Clique na execução desejada
3. Expanda os jobs para ver os logs detalhados

## Segurança

⚠️ **IMPORTANTE:**
- Nunca compartilhe seus tokens
- Use tokens com permissões mínimas necessárias
- Revogue tokens antigos quando não precisar mais
- Monitore o uso dos tokens regularmente

## Frequência de Execução

A action executa:
- ✅ A cada push na branch main ou develop
- ✅ A cada pull request para main
- ✅ A cada 30 minutos (agendado)
- ✅ Manualmente quando solicitado

Para alterar a frequência, edite o arquivo `.github/workflows/auto-sync-deploy.yml`