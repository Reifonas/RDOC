# 🔧 TROUBLESHOOTING - VERCEL BUILD

## 🚨 ERROS COMUNS E SOLUÇÕES

### 1. Erro: "Module not found" ou "Cannot find module"

**Solução:**
```bash
# No terminal local, teste o build:
npm run build

# Se funcionar local mas falhar na Vercel:
# Verifique se todas as dependências estão no package.json
```

---

### 2. Erro: "TypeScript errors"

**Solução A - Desabilitar verificação de tipos no build:**

Adicione no `vite.config.ts`:
```typescript
export default defineConfig({
  build: {
    // ... outras configs
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})
```

**Solução B - Ignorar erros de TypeScript:**

No `package.json`, mude o build command:
```json
"build": "vite build --mode production"
```

---

### 3. Erro: "Out of memory" ou "JavaScript heap out of memory"

**Solução:**

Adicione no `package.json`:
```json
"scripts": {
  "build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
}
```

Ou configure na Vercel:
- Settings → General → Build & Development Settings
- Build Command: `NODE_OPTIONS='--max-old-space-size=4096' npm run build`

---

### 4. Erro: "Failed to resolve import"

**Solução:**

Verifique se todos os imports estão corretos:
```typescript
// ❌ Errado
import { Component } from './Component'

// ✅ Correto
import { Component } from './Component.tsx'
```

Ou adicione no `vite.config.ts`:
```typescript
export default defineConfig({
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  }
})
```

---

### 5. Erro: "Environment variables not defined"

**Solução:**

Verifique se as variáveis estão configuradas na Vercel:
- Settings → Environment Variables
- Certifique-se que estão marcadas para Production

---

### 6. Erro: "Build exceeded maximum duration"

**Solução:**

Otimize o build no `vite.config.ts`:
```typescript
export default defineConfig({
  build: {
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: undefined // Desabilita chunk splitting
      }
    }
  }
})
```

---

## 🧪 TESTE LOCAL ANTES DE FAZER DEPLOY

```bash
# 1. Limpar cache
npm run clean
rm -rf node_modules
rm package-lock.json

# 2. Reinstalar dependências
npm install

# 3. Testar build
npm run build

# 4. Testar preview
npm run preview
```

Se funcionar local, deve funcionar na Vercel!

---

## 📋 CHECKLIST DE VERIFICAÇÃO

- [ ] Build funciona localmente (`npm run build`)
- [ ] Todas as dependências estão no `package.json`
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Node version compatível (v18 ou v20)
- [ ] Sem imports de arquivos que não existem
- [ ] Sem erros de TypeScript críticos

---

## 🔍 COMO VER O LOG DE ERRO NA VERCEL

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto
3. Vá em **"Deployments"**
4. Clique no deploy que falhou
5. Role até a seção **"Build Logs"**
6. Copie a mensagem de erro completa

---

## 💡 SOLUÇÃO RÁPIDA - BUILD SIMPLIFICADO

Se nada funcionar, crie um `vercel.json` simplificado:

```json
{
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🆘 AINDA NÃO FUNCIONA?

Me envie:
1. Print do log de erro completo da Vercel
2. Resultado de `npm run build` no seu terminal local
3. Versão do Node que você está usando: `node -v`

