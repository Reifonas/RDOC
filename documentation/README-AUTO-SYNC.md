# 🚀 Sistema de Auto-Sync RDO-C

Sistema completo de automação para sincronização automática com o repositório GitHub [TS_RDO](https://github.com/Reifonas/TS_RDO.git).

## 📋 Funcionalidades

- ✅ **Sincronização Automática**: Detecta mudanças e faz commit/push automático
- ✅ **GitHub Actions**: Deploy automático no repositório remoto
- ✅ **Git Hooks**: Automação local com validações
- ✅ **Monitoramento de Arquivos**: Watch em tempo real das mudanças

- ✅ **Logs Detalhados**: Sistema completo de logging e notificações
- ✅ **Interface Unificada**: Script principal para gerenciar tudo

## 🛠️ Pré-requisitos

### Software Necessário
- **Git** (versão 2.0+)
- **Node.js** (versão 16+)
- **NPM** ou **PNPM**
- **PowerShell** 5.1+ (Windows)

### Verificar Dependências
```powershell
# Verificar Git
git --version

# Verificar Node.js
node --version

# Verificar NPM
npm --version
```

## 📦 Instalação

### 1. Configuração Inicial
```powershell
# Navegar para o diretório do projeto
cd C:\Users\Marcos\Documents\GitHub\RDO-C

# Executar configuração inicial
.\scripts\start-auto-sync.ps1 -Action setup
```

### 2. Configurar Git (se necessário)
```powershell
# Configurar usuário Git
git config user.name "Seu Nome"
git config user.email "seu.email@exemplo.com"

# Verificar repositório remoto
git remote -v
```

### 3. Configurar Git Hooks
```powershell
# Executar script de configuração dos hooks
.\scripts\setup-git-hooks.ps1
```

### 4. Testar Sistema
```powershell
# Executar testes do sistema
.\scripts\start-auto-sync.ps1 -Action test
```

## ⚙️ Configuração

### Arquivo de Configuração Principal
Edite o arquivo `auto-sync-config.json`:

```json
{
  "repository": {
    "remote_url": "https://github.com/Reifonas/TS_RDO.git",
    "branch": "main",
    "auto_push": true
  },
  "monitoring": {
    "sync_interval": 300,
    "file_watch_enabled": true,
    "excluded_patterns": ["node_modules", ".git", "logs", "temp"]
  },

  "logging": {
    "level": "INFO",
    "console_enabled": true,
    "file_enabled": true
  }
}
```

### Configuração de Notificações
Edite o arquivo `logging-config.json` para configurar notificações:

```json
{
  "notifications": {
    "desktop": {
      "enabled": true,
      "levels": ["SUCCESS", "ERROR"]
    },
    "email": {
      "enabled": false,
      "smtp_server": "smtp.gmail.com",
      "smtp_port": 587,
      "username": "seu.email@gmail.com",
      "password": "sua_senha_app",
      "to": "destinatario@exemplo.com"
    }
  }
}
```

## 🚀 Uso

### Comandos Principais

#### Iniciar Sistema
```powershell
# Iniciar com configurações padrão
.\scripts\start-auto-sync.ps1 -Action start

# Iniciar sistema
.\scripts\start-auto-sync.ps1 -Action start

# Iniciar com todas as funcionalidades
.\scripts\start-auto-sync.ps1 -Action start -EnableNotifications -EnableFileWatch
```

#### Parar Sistema
```powershell
.\scripts\start-auto-sync.ps1 -Action stop
```

#### Reiniciar Sistema
```powershell
.\scripts\start-auto-sync.ps1 -Action restart -EnableNotifications
```

#### Verificar Status
```powershell
.\scripts\start-auto-sync.ps1 -Action status
```

### Parâmetros Avançados

```powershell
# Configurar intervalos personalizados
.\scripts\start-auto-sync.ps1 -Action start -SyncInterval 180

# Modo verbose para debug
.\scripts\start-auto-sync.ps1 -Action start -Verbose

# Modo dry-run (simulação)
.\scripts\start-auto-sync.ps1 -Action start -DryRun

# Forçar execução
.\scripts\start-auto-sync.ps1 -Action start -Force
```

## 📁 Estrutura de Arquivos

```
RDO-C/
├── scripts/
│   ├── start-auto-sync.ps1      # Script principal
│   ├── auto-sync-github.ps1     # Sincronização Git
│   ├── file-watcher.ps1         # Monitoramento de arquivos

│   ├── logging-notifications.ps1 # Logs e notificações
│   └── setup-git-hooks.ps1      # Configuração de hooks
├── .github/
│   ├── workflows/
│   │   └── auto-sync-deploy.yml # GitHub Action
│   └── SECRETS_SETUP.md         # Configuração de secrets
├── logs/                        # Arquivos de log
├── temp/                        # Arquivos temporários
├── auto-sync-config.json        # Configuração principal
├── logging-config.json          # Configuração de logs
└── README-AUTO-SYNC.md         # Este arquivo
```

## 🔧 Scripts Individuais

### 1. Sincronização Manual
```powershell
# Sincronização simples
.\scripts\auto-sync-github.ps1

# Com commit automático
.\scripts\auto-sync-github.ps1 -AutoCommit

# Com push automático
.\scripts\auto-sync-github.ps1 -AutoCommit -Push
```

### 2. Monitoramento de Arquivos
```powershell
# Monitoramento contínuo
.\scripts\file-watcher.ps1 -Continuous

# Monitoramento com intervalo personalizado
.\scripts\file-watcher.ps1 -Continuous -SyncInterval 120
```

## 🔍 Monitoramento e Logs

### Localização dos Logs
- **Logs principais**: `logs/auto-sync-YYYYMMDD.log`
- **Logs de erro**: `logs/error-YYYYMMDD.log`
- **Status do sistema**: `auto-sync-status.json`

### Visualizar Logs em Tempo Real
```powershell
# Windows PowerShell
Get-Content logs\auto-sync-$(Get-Date -Format 'yyyyMMdd').log -Wait

# Ou usando tail (se disponível)
tail -f logs/auto-sync-$(Get-Date -Format 'yyyyMMdd').log
```

### Níveis de Log
- **ERROR**: Erros críticos
- **WARN**: Avisos importantes
- **INFO**: Informações gerais
- **SUCCESS**: Operações bem-sucedidas
- **DEBUG**: Informações de debug (apenas com -Verbose)

## 🔔 Notificações

### Notificações Desktop
Habilitadas por padrão no Windows. Mostra:
- ✅ Sincronizações bem-sucedidas
- ❌ Erros de sincronização

- ⚠️ Avisos importantes

### Notificações por Email
Configure no arquivo `logging-config.json`:
1. Habilite `email.enabled = true`
2. Configure servidor SMTP
3. Defina credenciais (use senhas de app para Gmail)

### Webhooks e Integrações
Suporta integração com:
- **Slack**: Configure webhook URL
- **Discord**: Configure webhook URL
- **Webhooks personalizados**: Configure URL e formato

## 🔒 GitHub Actions e Secrets

### Configurar Secrets no GitHub
1. Acesse: `Settings > Secrets and variables > Actions`
2. Adicione os secrets necessários:
   - `REMOTE_REPO_TOKEN`: Token de acesso ao repositório
   - `NETLIFY_AUTH_TOKEN`: Token do Netlify (se usar)
   - `NETLIFY_SITE_ID`: ID do site Netlify (se usar)

### Arquivo de Configuração
Veja instruções detalhadas em `.github/SECRETS_SETUP.md`

## 🐛 Solução de Problemas

### Problemas Comuns

#### 1. "Repositório não é um Git"
```powershell
# Inicializar repositório Git
git init
git remote add origin https://github.com/Reifonas/TS_RDO.git
```

#### 2. "Configuração do Git incompleta"
```powershell
git config user.name "Seu Nome"
git config user.email "seu.email@exemplo.com"
```

#### 3. "Falha na conectividade remota"
```powershell
# Testar conectividade
git ls-remote origin HEAD

# Verificar URL remota
git remote -v

# Reconfigurar se necessário
git remote set-url origin https://github.com/Reifonas/TS_RDO.git
```

#### 4. "Permissões de execução"
```powershell
# Permitir execução de scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 5. "Hooks não funcionam"
```powershell
# Reconfigurar hooks
.\scripts\setup-git-hooks.ps1 -Force

# Verificar permissões
ls -la .git/hooks/
```

### Debug Avançado

```powershell
# Executar com logs detalhados
.\scripts\start-auto-sync.ps1 -Action start -Verbose -LogLevel DEBUG

# Testar componentes individualmente
.\scripts\start-auto-sync.ps1 -Action test

# Verificar status detalhado
.\scripts\start-auto-sync.ps1 -Action status
```

### Logs de Debug
```powershell
# Ver logs de erro
Get-Content logs\error-$(Get-Date -Format 'yyyyMMdd').log

# Ver logs completos
Get-Content logs\auto-sync-$(Get-Date -Format 'yyyyMMdd').log | Select-String "ERROR"
```

## 📈 Monitoramento de Performance

### Métricas Disponíveis
- Número de sincronizações
- Número de erros
- Tempo de última sincronização
- Status do sistema

### Visualizar Estatísticas
```powershell
# Status completo
.\scripts\start-auto-sync.ps1 -Action status

# Verificar arquivo de status
Get-Content auto-sync-status.json | ConvertFrom-Json
```

## 🔄 Atualizações e Manutenção

### Atualizar Sistema
1. Pare o sistema: `start-auto-sync.ps1 -Action stop`
2. Atualize os scripts
3. Reinicie: `start-auto-sync.ps1 -Action restart`

### Limpeza de Logs
```powershell
# Limpar logs antigos (mais de 30 dias)
Get-ChildItem logs\*.log | Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-30)} | Remove-Item
```

### Backup de Configuração
```powershell
# Backup das configurações
Copy-Item auto-sync-config.json auto-sync-config.json.bak
Copy-Item logging-config.json logging-config.json.bak
```

## 📞 Suporte

### Informações do Sistema
```powershell
# Coletar informações para suporte
.\scripts\start-auto-sync.ps1 -Action test > system-info.txt
Get-Content auto-sync-status.json >> system-info.txt
Get-Content logs\auto-sync-$(Get-Date -Format 'yyyyMMdd').log | Select-Object -Last 50 >> system-info.txt
```

### Contato
- **Repositório**: [TS_RDO](https://github.com/Reifonas/TS_RDO.git)
- **Issues**: Use o sistema de issues do GitHub
- **Documentação**: Este arquivo README

---

## 📝 Changelog

### v1.0.0 (2024)
- ✅ Sistema completo de auto-sync
- ✅ GitHub Actions integradas
- ✅ Git Hooks configurados

- ✅ Monitoramento de arquivos
- ✅ Logs detalhados e notificações
- ✅ Interface unificada de gerenciamento

---

**🎉 Sistema RDO-C Auto-Sync pronto para uso!**

Para começar:
```powershell
.\scripts\start-auto-sync.ps1 -Action setup
.\scripts\start-auto-sync.ps1 -Action start -EnableNotifications
```