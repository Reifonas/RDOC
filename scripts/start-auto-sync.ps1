# Script Principal - Sistema de Auto-Sync RDO-C
# Integra todos os componentes: sync, logs, notificações e monitoramento
# Uso: .\scripts\start-auto-sync.ps1 [opções]

param(
    [ValidateSet("start", "stop", "restart", "status", "setup", "test")]
    [string]$Action = "start",
    

    [switch]$EnableNotifications,
    [switch]$EnableFileWatch,
    [switch]$Verbose,
    [switch]$DryRun,
    [switch]$Force,
    
    [int]$SyncInterval = 300,  # 5 minutos

    [string]$ConfigFile = "auto-sync-config.json",
    [string]$LogLevel = "INFO"
)

# Importar módulos necessários
$scriptDir = Split-Path $MyInvocation.MyCommand.Path -Parent
$rootDir = Split-Path $scriptDir -Parent

try {
    Import-Module "$scriptDir\logging-notifications.ps1" -Force
    Write-LogEntry "INFO" "Módulo de logging carregado com sucesso" "System"
} catch {
    Write-Host "❌ Erro ao carregar módulo de logging: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Configurações globais
$script:AutoSyncConfig = @{
    IsRunning = $false
    StartTime = $null
    ProcessId = $null
    SyncCount = 0
    ErrorCount = 0
    LastSync = $null
    StatusFile = "auto-sync-status.json"
    PidFile = "auto-sync.pid"
}

# Verificar dependências
function Test-Dependencies {
    Write-LogEntry "INFO" "Verificando dependências do sistema..." "System"
    
    $dependencies = @(
        @{ Name = "Git"; Command = "git --version" },
        @{ Name = "Node.js"; Command = "node --version" },
        @{ Name = "NPM"; Command = "npm --version" }
    )
    
    $missing = @()
    
    foreach ($dep in $dependencies) {
        try {
            $result = Invoke-Expression $dep.Command 2>$null
            if ($result) {
                Write-LogEntry "SUCCESS" "$($dep.Name) encontrado: $($result.Split([Environment]::NewLine)[0])" "System"
            } else {
                $missing += $dep.Name
            }
        } catch {
            $missing += $dep.Name
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-LogEntry "ERROR" "Dependências não encontradas: $($missing -join ', ')" "System"
        return $false
    }
    
    Write-LogEntry "SUCCESS" "Todas as dependências foram verificadas" "System"
    return $true
}

# Configurar ambiente
function Initialize-Environment {
    Write-LogEntry "INFO" "Inicializando ambiente de auto-sync..." "System"
    
    # Verificar se é um repositório Git
    if (-not (Test-Path ".git")) {
        Write-LogEntry "ERROR" "Diretório atual não é um repositório Git" "Git"
        return $false
    }
    
    # Verificar configuração do Git
    try {
        $gitUser = git config user.name
        $gitEmail = git config user.email
        
        if (-not $gitUser -or -not $gitEmail) {
            Write-LogEntry "ERROR" "Configuração do Git incompleta (user.name ou user.email)" "Git"
            return $false
        }
        
        Write-LogEntry "SUCCESS" "Git configurado para: $gitUser <$gitEmail>" "Git"
    } catch {
        Write-LogEntry "ERROR" "Erro ao verificar configuração do Git: $($_.Exception.Message)" "Git"
        return $false
    }
    
    # Verificar conectividade com repositório remoto
    try {
        $remoteUrl = git config --get remote.origin.url
        if ($remoteUrl) {
            Write-LogEntry "SUCCESS" "Repositório remoto: $remoteUrl" "Git"
            
            # Testar conectividade
            git ls-remote origin HEAD 2>$null | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-LogEntry "SUCCESS" "Conectividade com repositório remoto verificada" "Git"
            } else {
                Write-LogEntry "WARN" "Falha na conectividade com repositório remoto" "Git"
            }
        } else {
            Write-LogEntry "WARN" "Nenhum repositório remoto configurado" "Git"
        }
    } catch {
        Write-LogEntry "WARN" "Erro ao verificar repositório remoto: $($_.Exception.Message)" "Git"
    }
    
    # Criar diretórios necessários
    $directories = @("logs", "temp", "scripts")
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-LogEntry "SUCCESS" "Diretório criado: $dir" "System"
        }
    }
    
    # Configurar Git hooks se necessário
    if (Test-Path "$scriptDir\setup-git-hooks.ps1") {
        Write-LogEntry "INFO" "Configurando Git hooks..." "Git"
        & "$scriptDir\setup-git-hooks.ps1"
    }
    
    return $true
}

# Salvar status do sistema
function Save-SystemStatus {
    $status = @{
        is_running = $script:AutoSyncConfig.IsRunning
        start_time = $script:AutoSyncConfig.StartTime
        process_id = $script:AutoSyncConfig.ProcessId
        sync_count = $script:AutoSyncConfig.SyncCount
        error_count = $script:AutoSyncConfig.ErrorCount
        last_sync = $script:AutoSyncConfig.LastSync
        last_update = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        config_file = $ConfigFile
        log_level = $LogLevel
        features = @{

            notifications_enabled = $EnableNotifications
            file_watch_enabled = $EnableFileWatch
        }
    }
    
    try {
        $status | ConvertTo-Json -Depth 3 | Set-Content $script:AutoSyncConfig.StatusFile
        
        # Salvar PID se em execução
        if ($script:AutoSyncConfig.IsRunning) {
            $PID | Set-Content $script:AutoSyncConfig.PidFile
        }
    } catch {
        Write-LogEntry "ERROR" "Erro ao salvar status: $($_.Exception.Message)" "System"
    }
}

# Carregar status do sistema
function Get-SystemStatus {
    if (Test-Path $script:AutoSyncConfig.StatusFile) {
        try {
            return Get-Content $script:AutoSyncConfig.StatusFile | ConvertFrom-Json
        } catch {
            Write-LogEntry "WARN" "Erro ao carregar status: $($_.Exception.Message)" "System"
        }
    }
    return $null
}

# Executar sincronização
function Invoke-AutoSync {
    Write-LogEntry "INFO" "Iniciando sincronização automática..." "Sync"
    
    try {
        # Verificar mudanças
        $changes = git status --porcelain
        
        if (-not $changes) {
            Write-LogEntry "INFO" "Nenhuma mudança detectada" "Sync"
            return $true
        }
        
        Write-LogEntry "INFO" "Mudanças detectadas: $($changes.Count) arquivos" "Sync" @{ files = $changes.Count }
        
        if ($DryRun) {
            Write-LogEntry "INFO" "[DRY RUN] Sincronização simulada" "Sync"
            return $true
        }
        
        # Executar script de sync
        if (Test-Path "$scriptDir\auto-sync-github.ps1") {
            $syncResult = & "$scriptDir\auto-sync-github.ps1" -AutoCommit -Push
            
            if ($syncResult) {
                $script:AutoSyncConfig.SyncCount++
                $script:AutoSyncConfig.LastSync = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                Write-LogEntry "SUCCESS" "Sincronização concluída com sucesso" "Sync" @{ count = $script:AutoSyncConfig.SyncCount }
                return $true
            } else {
                $script:AutoSyncConfig.ErrorCount++
                Write-LogEntry "ERROR" "Falha na sincronização" "Sync"
                return $false
            }
        } else {
            Write-LogEntry "ERROR" "Script de sincronização não encontrado" "Sync"
            return $false
        }
    } catch {
        $script:AutoSyncConfig.ErrorCount++
        Write-LogEntry "ERROR" "Erro durante sincronização: $($_.Exception.Message)" "Sync"
        return $false
    }
}



# Loop principal de monitoramento
function Start-AutoSyncLoop {
    Write-LogEntry "SUCCESS" "Sistema de auto-sync iniciado" "System"
    
    $script:AutoSyncConfig.IsRunning = $true
    $script:AutoSyncConfig.StartTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $script:AutoSyncConfig.ProcessId = $PID
    
    $lastSyncTime = Get-Date

    
    # Iniciar file watcher se habilitado
    $fileWatcherJob = $null
    if ($EnableFileWatch -and (Test-Path "$scriptDir\file-watcher.ps1")) {
        Write-LogEntry "INFO" "Iniciando monitoramento de arquivos..." "FileWatch"
        $fileWatcherJob = Start-Job -ScriptBlock {
            param($ScriptPath, $RootDir)
            Set-Location $RootDir
            & $ScriptPath -Continuous
        } -ArgumentList "$scriptDir\file-watcher.ps1", $rootDir
    }
    
    try {
        while ($script:AutoSyncConfig.IsRunning) {
            $currentTime = Get-Date
            
            # Salvar status periodicamente
            Save-SystemStatus
            
            # Verificar se é hora de sincronizar
            if (($currentTime - $lastSyncTime).TotalSeconds -ge $SyncInterval) {
                Invoke-AutoSync
                $lastSyncTime = $currentTime
            }
            

            
            # Aguardar antes da próxima verificação
            Start-Sleep -Seconds 30
            
            # Verificar se deve parar (arquivo de controle)
            if (Test-Path "auto-sync.stop") {
                Write-LogEntry "INFO" "Arquivo de parada detectado" "System"
                Remove-Item "auto-sync.stop" -Force
                break
            }
        }
    } catch {
        Write-LogEntry "ERROR" "Erro no loop principal: $($_.Exception.Message)" "System"
    } finally {
        # Limpar recursos
        if ($fileWatcherJob) {
            Stop-Job $fileWatcherJob -Force
            Remove-Job $fileWatcherJob -Force
        }
        
        $script:AutoSyncConfig.IsRunning = $false
        Save-SystemStatus
        
        # Remover arquivo PID
        if (Test-Path $script:AutoSyncConfig.PidFile) {
            Remove-Item $script:AutoSyncConfig.PidFile -Force
        }
        
        Write-LogEntry "INFO" "Sistema de auto-sync finalizado" "System"
    }
}

# Parar sistema
function Stop-AutoSync {
    Write-LogEntry "INFO" "Parando sistema de auto-sync..." "System"
    
    # Criar arquivo de parada
    "stop" | Set-Content "auto-sync.stop"
    
    # Verificar se há processo em execução
    if (Test-Path $script:AutoSyncConfig.PidFile) {
        try {
            $pid = Get-Content $script:AutoSyncConfig.PidFile
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            
            if ($process) {
                Write-LogEntry "INFO" "Finalizando processo: $pid" "System"
                Stop-Process -Id $pid -Force
                Write-LogEntry "SUCCESS" "Processo finalizado" "System"
            }
        } catch {
            Write-LogEntry "WARN" "Erro ao finalizar processo: $($_.Exception.Message)" "System"
        }
    }
    
    $script:AutoSyncConfig.IsRunning = $false
    Save-SystemStatus
}

# Mostrar status
function Show-SystemStatus {
    $status = Get-SystemStatus
    
    Write-Host ""
    Write-Host "🔄 Status do Sistema Auto-Sync RDO-C" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    
    if ($status) {
        $statusColor = if ($status.is_running) { "Green" } else { "Red" }
        $statusText = if ($status.is_running) { "🟢 Executando" } else { "🔴 Parado" }
        
        Write-Host "Status: $statusText" -ForegroundColor $statusColor
        
        if ($status.start_time) {
            Write-Host "Iniciado em: $($status.start_time)" -ForegroundColor Gray
        }
        
        if ($status.process_id) {
            Write-Host "Process ID: $($status.process_id)" -ForegroundColor Gray
        }
        
        Write-Host ""
        Write-Host "📊 Estatísticas:" -ForegroundColor Yellow
        Write-Host "  Sincronizações: $($status.sync_count)" -ForegroundColor White

        Write-Host "  Erros: $($status.error_count)" -ForegroundColor White
        
        if ($status.last_sync) {
            Write-Host "  Última sincronização: $($status.last_sync)" -ForegroundColor White
        }
        

        
        Write-Host ""
        Write-Host "⚙️ Configurações:" -ForegroundColor Yellow

        Write-Host "  Notificações habilitadas: $($status.features.notifications_enabled)" -ForegroundColor White
        Write-Host "  Monitoramento de arquivos: $($status.features.file_watch_enabled)" -ForegroundColor White
        
    } else {
        Write-Host "Status: 🔴 Não inicializado" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Testar sistema
function Test-AutoSyncSystem {
    Write-Host "🧪 Testando Sistema Auto-Sync" -ForegroundColor Cyan
    Write-Host "=============================" -ForegroundColor Cyan
    
    $tests = @(
        @{ Name = "Dependências"; Test = { Test-Dependencies } },
        @{ Name = "Ambiente Git"; Test = { Test-Path ".git" } },
        @{ Name = "Scripts"; Test = { 
            (Test-Path "$scriptDir\auto-sync-github.ps1") -and
    
            (Test-Path "$scriptDir\file-watcher.ps1")
        }},
        @{ Name = "Configuração"; Test = { Test-Path $ConfigFile } },
        @{ Name = "Diretórios"; Test = { 
            (Test-Path "logs") -and (Test-Path "temp")
        }}
    )
    
    $passed = 0
    $total = $tests.Count
    
    foreach ($test in $tests) {
        try {
            $result = & $test.Test
            if ($result) {
                Write-Host "✅ $($test.Name)" -ForegroundColor Green
                $passed++
            } else {
                Write-Host "❌ $($test.Name)" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ $($test.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Resultado: $passed/$total testes passaram" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })
    
    return ($passed -eq $total)
}

# Função principal
function Main {
    Write-Host "🚀 RDO-C Auto-Sync System" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    
    switch ($Action) {
        "setup" {
            Write-Host "⚙️ Configurando sistema..." -ForegroundColor Yellow
            
            if (-not (Test-Dependencies)) {
                Write-Host "❌ Falha na verificação de dependências" -ForegroundColor Red
                exit 1
            }
            
            if (-not (Initialize-Environment)) {
                Write-Host "❌ Falha na inicialização do ambiente" -ForegroundColor Red
                exit 1
            }
            
            Write-Host "✅ Sistema configurado com sucesso" -ForegroundColor Green
        }
        
        "test" {
            $success = Test-AutoSyncSystem
            exit $(if ($success) { 0 } else { 1 })
        }
        
        "start" {
            if (-not (Initialize-Environment)) {
                Write-Host "❌ Falha na inicialização" -ForegroundColor Red
                exit 1
            }
            
            Start-AutoSyncLoop
        }
        
        "stop" {
            Stop-AutoSync
        }
        
        "restart" {
            Stop-AutoSync
            Start-Sleep -Seconds 3
            
            if (Initialize-Environment) {
                Start-AutoSyncLoop
            }
        }
        
        "status" {
            Show-SystemStatus
        }
    }
}

# Executar se chamado diretamente
if ($MyInvocation.InvocationName -ne '.') {
    Main
}