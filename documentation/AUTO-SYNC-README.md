# Auto-Sync RDO v3.0

Sistema otimizado de sincronização automática com GitHub para o projeto RDO.

## 🚀 Características

- **Monitoramento em tempo real** usando chokidar
- **Sincronização inteligente** a cada 15 segundos quando há mudanças
- **Execução em segundo plano** eficiente
- **Logs detalhados** com rotação automática
- **Tratamento robusto de erros**
- **Configuração automática do Git**

## 📦 Instalação

As dependências já estão instaladas. O sistema usa:
- Node.js (já instalado)
- chokidar (para monitoramento de arquivos)

## 🎯 Como Usar

### Opção 1: Script NPM (Recomendado)
```bash
npm run auto-sync
```

### Opção 2: Arquivo Batch (Windows)
```bash
start-auto-sync.bat
```

### Opção 3: Diretamente com Node
```bash
node auto-sync.js
```

## ⚙️ Configuração

O script está pré-configurado para:
- **Repositório**: `https://github.com/Reifonas/TS_RDO.git`
- **Branch**: `main`
- **Intervalo**: 15 segundos
- **Monitoramento**: Todos os arquivos exceto node_modules, .git, dist, etc.

## 📁 Arquivos Monitorados

O sistema monitora todos os arquivos do projeto, **excluindo**:
- `node_modules/`
- `.git/`
- `dist/`
- `build/`
- `logs/`

- `*.log`
- `.env.local`

## 📊 Logs

- **Localização**: `logs/auto-sync-YYYY-MM-DD.log`
- **Rotação**: Logs antigos (>7 dias) são removidos automaticamente
- **Níveis**: INFO, WARN, ERROR, SUCCESS

## 🔄 Funcionamento

1. **Inicialização**: Verifica se é um repositório Git (inicializa se necessário)
2. **Monitoramento**: Detecta mudanças em tempo real nos arquivos
3. **Sincronização**: A cada 15 segundos, se houver mudanças:
   - Faz `git pull` (se necessário)
   - Adiciona arquivos (`git add .`)
   - Cria commit com mensagem automática
   - Faz push para o GitHub

## 🛑 Como Parar

Pressione `Ctrl+C` no terminal para parar o monitoramento.

## 🔧 Vantagens sobre o Script Anterior

### ✅ Melhorias
- **Monitoramento em tempo real** (vs. verificação por intervalo)
- **Menor uso de recursos** (só sincroniza quando necessário)
- **Mais rápido** (Node.js vs. PowerShell)
- **Melhor tratamento de erros**
- **Logs mais limpos e organizados**
- **Configuração mais simples**

### 📈 Performance
- **Antes**: Verificação a cada 30s, independente de mudanças
- **Agora**: Detecção instantânea + sincronização a cada 15s apenas se houver mudanças

## 🚨 Solução de Problemas

### Erro: "git not found"
- Certifique-se de que o Git está instalado e no PATH

### Erro: "permission denied"
- Execute como administrador se necessário
- Verifique as credenciais do Git

### Erro: "chokidar not found"
- Execute: `npm install chokidar`

## 📝 Exemplo de Uso

```bash
# Iniciar o auto-sync
npm run auto-sync

# Saída esperada:
# [2024-01-15 10:30:00] [SUCCESS] === Auto-Sync RDO v3.0 ===
# [2024-01-15 10:30:00] [INFO] Repositório: https://github.com/Reifonas/TS_RDO.git
# [2024-01-15 10:30:00] [INFO] Branch: main
# [2024-01-15 10:30:00] [INFO] Intervalo de sincronização: 15s
# [2024-01-15 10:30:01] [SUCCESS] Monitoramento de arquivos ativo!
# [2024-01-15 10:30:01] [SUCCESS] Sistema de auto-sync ativo! Pressione Ctrl+C para parar.
```

## 🔄 Migração do Script Anterior

O novo sistema substitui completamente os scripts PowerShell anteriores:
- `auto-sync-github.ps1` ❌
- `auto-syncRDO.ps1` ❌
- `file-watcher.ps1` ❌

Use apenas o novo `auto-sync.js` ✅

---

**Desenvolvido para o projeto RDO - Sistema de mon