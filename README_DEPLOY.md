# 🚀 Guia de Deploy - Alternativas à Vercel

Este guia apresenta 4 alternativas gratuitas e fáceis de configurar para fazer deploy da sua aplicação React/Vite.

## 📊 Comparação Rápida

| Provedor | Gratuito | Facilidade | Build Automático | Domínio Customizado | SSL | CDN |
|----------|----------|------------|------------------|---------------------|-----|-----|
| **Netlify** | ✅ | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ✅ | ✅ |
| **GitHub Pages** | ✅ | ⭐⭐⭐⭐ | ✅ | ✅ | ✅ | ✅ |
| **Railway** | ✅* | ⭐⭐⭐ | ✅ | ✅ | ✅ | ❌ |
| **Render** | ✅* | ⭐⭐⭐ | ✅ | ✅ | ✅ | ✅ |

*Limitações no plano gratuito

---

## 🎯 1. Netlify (Recomendado)

### ✅ Prós
- Interface muito intuitiva
- Deploy automático via Git
- CDN global rápido
- Formulários e funções serverless
- Excelente para SPAs
- 100GB de largura de banda/mês

### ❌ Contras
- Limite de 300 minutos de build/mês
- Funções serverless limitadas no plano gratuito

### 📋 Passo a Passo

1. **Criar conta no Netlify**
   - Acesse [netlify.com](https://netlify.com)
   - Faça login com GitHub

2. **Conectar repositório**
   - Clique em "New site from Git"
   - Escolha GitHub e selecione seu repositório

3. **Configurar build**
   - Build command: `pnpm run build`
   - Publish directory: `dist`
   - O arquivo `netlify.toml` já está configurado!

4. **Deploy**
   - Clique em "Deploy site"
   - Aguarde o build completar

### 🔧 Comandos Úteis
```bash
# Instalar Netlify CLI (opcional)
npm install -g netlify-cli

# Deploy manual
netlify deploy --prod --dir=dist
```

---

## 🐙 2. GitHub Pages

### ✅ Prós
- Totalmente gratuito
- Integração perfeita com GitHub
- SSL automático
- Fácil configuração

### ❌ Contras
- Apenas sites estáticos
- Repositório deve ser público (plano gratuito)
- Limite de 1GB de armazenamento
- 100GB de largura de banda/mês

### 📋 Passo a Passo

1. **Configurar repositório**
   - Certifique-se que o código está no GitHub
   - O workflow `.github/workflows/deploy.yml` já está configurado!

2. **Ativar GitHub Pages**
   - Vá em Settings > Pages no seu repositório
   - Source: "GitHub Actions"

3. **Ajustar base path**
   - No `vite.config.ts`, ajuste a linha:
   ```typescript
   base: process.env.NODE_ENV === 'production' ? '/SEU-REPO-NOME/' : '/'
   ```

4. **Deploy automático**
   - Faça push para a branch `main`
   - O GitHub Actions fará o deploy automaticamente

### 🔧 URL do site
```
https://SEU-USUARIO.github.io/SEU-REPOSITORIO/
```

---

## 🚂 3. Railway

### ✅ Prós
- Deploy muito rápido
- Suporte a bancos de dados
- Logs em tempo real
- Fácil configuração de variáveis de ambiente

### ❌ Contras
- $5 de crédito gratuito/mês (depois paga)
- Menos recursos no plano gratuito
- Pode hibernar após inatividade

### 📋 Passo a Passo

1. **Criar conta no Railway**
   - Acesse [railway.app](https://railway.app)
   - Faça login com GitHub

2. **Criar novo projeto**
   - Clique em "New Project"
   - Escolha "Deploy from GitHub repo"
   - Selecione seu repositório

3. **Configuração automática**
   - O Railway detectará automaticamente que é um projeto Node.js
   - Os arquivos `railway.json` e `Dockerfile` já estão configurados!

4. **Deploy**
   - O deploy acontece automaticamente
   - Acesse a URL fornecida pelo Railway

### 🔧 Comandos Úteis
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy manual
railway up
```

---

## 🎨 4. Render

### ✅ Prós
- Plano gratuito generoso
- SSL automático
- CDN global
- Suporte a bancos de dados
- Não hiberna (diferente do Heroku)

### ❌ Contras
- Build pode ser mais lento
- Limite de 750 horas/mês no plano gratuito
- Menos integrações que outros provedores

### 📋 Passo a Passo

1. **Criar conta no Render**
   - Acesse [render.com](https://render.com)
   - Faça login com GitHub

2. **Criar Web Service**
   - Clique em "New +" > "Web Service"
   - Conecte seu repositório GitHub

3. **Configurar build**
   - Name: `rdo-app`
   - Build Command: `pnpm install && pnpm run build`
   - Start Command: `pnpm preview --host 0.0.0.0 --port $PORT`
   - O arquivo `render.yaml` já está configurado!

4. **Deploy**
   - Clique em "Create Web Service"
   - Aguarde o build completar

---

## 🛠️ Troubleshooting Comum

### Problema: "404 Not Found" ao navegar
**Solução**: Configure redirects para SPA
- ✅ Netlify: `netlify.toml` já configurado
- ✅ GitHub Pages: Workflow já configurado
- ✅ Railway: Usar `serve -s` no start command
- ✅ Render: `render.yaml` já configurado

### Problema: Build falha por falta de memória
**Solução**: 
```bash
# Adicionar no package.json
"build": "vite build --mode production"
```

### Problema: Variáveis de ambiente não funcionam
**Solução**: 
- Prefixe com `VITE_` para variáveis do frontend
- Configure no painel do provedor escolhido

### Problema: Assets não carregam (CSS/JS)
**Solução**: 
- Verifique o `base` no `vite.config.ts`
- Para GitHub Pages: deve ser `/nome-do-repo/`
- Para outros: pode ser `/`

---

## 🎯 Recomendações por Caso de Uso

### 🏆 Para iniciantes
**Netlify** - Interface mais amigável e documentação excelente

### 💰 Para projetos pessoais
**GitHub Pages** - Totalmente gratuito e sem limites de tempo

### 🚀 Para projetos que crescerão
**Railway** - Fácil escalar e adicionar banco de dados

### 🎨 Para portfolios e landing pages
**Render** - Boa performance e confiabilidade

---

## 📝 Checklist Final

Antes de fazer deploy, verifique:

- [ ] Código commitado e pushed para GitHub
- [ ] Build local funciona (`pnpm run build`)
- [ ] Variáveis de ambiente configuradas
- [ ] Base path correto no `vite.config.ts`
- [ ] Arquivo de configuração do provedor escolhido presente

---

## 🆘 Precisa de Ajuda?

1. **Verifique os logs** do build no painel do provedor
2. **Teste localmente** com `pnpm run build && pnpm run preview`
3. **Consulte a documentação** oficial de cada provedor
4. **Verifique issues** similares no GitHub do projeto

---

**💡 Dica**: Comece com o Netlify para ter a experiência mais suave, depois experimente outros provedores conforme suas necessidades evoluem!

**🔄 Última atualização**: Janeiro 2025