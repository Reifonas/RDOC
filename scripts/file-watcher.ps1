# Sistema de Monitoramento de Arquivos para RDO-C
# Monitora mudanças em tempo real e executa ações automáticas
# Uso: .\scripts\file-watcher.ps1 [-Action <sync|notify>] [-Interval <seconds>]

param(
    [string]$Action = "sync",  # sync, notify, all
    [int]$Interval = 5,        # Intervalo em segundos para verificação
    [string]$ConfigFile = "auto-sync-config.json",
    [switch]$Daemon,           # Executar como daemon
    [switch]$Verbose,          # Log detalhado
    [string]$LogLevel = "info" # debug, info, warn, error
)

# Configurações
$script:Config = $null
$script:WatcherJobs = @()
$script:LastSync = Get-Date
$script:IsRunning = $false
$script:LogFile = "logs\file-watcher.log"
$script:StatsFile = "logs\watcher-stats.json"

# Cores para output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
    Magenta = "Magenta"
}

# Função de logging
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "info",
        [string]$Color = "White"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Criar diretório de logs se não existir
    $logDir = Split-Path $script:LogFile -Parent
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    # Escrever no arquivo de log
    Add-Content -Path $script:LogFile -Value $logEntry
    
    # Exibir no console se verbose ou nível apropriado
    if ($Verbose -or $Level -in @("warn", "error")) {
        Write-Host $logEntry -ForegroundColor $Color
    }
}

# Carregar configuração
function Load-Config {
    if (Test-Path $ConfigFile) {
        try {
            $script:Config = Get-Content $ConfigFile | ConvertFrom-Json
            Write-Log "Configuração carregada de $ConfigFile" "info" "Green"
        } catch {
            Write-Log "Erro ao carregar configuração: $($_.Exception.Message)" "error" "Red"
            return $false
        }
    } else {
        Write-Log "Arquivo de configuração não encontrado: $ConfigFile" "warn" "Yellow"
        # Criar configuração padrão
        Create-DefaultConfig
    }
    return $true
}

# Criar configuração padrão
function Create-DefaultConfig {
    $defaultConfig = @{
        repository = @{
            remote_url = "https://github.com/Reifonas/TS_RDO.git"
            branch = "main"
            auto_push = $true
        }
        monitoring = @{
            enabled = $true
            interval_seconds = 5
            watch_patterns = @("*.ts", "*.tsx", "*.js", "*.jsx", "*.json", "*.md", "*.yml", "*.yaml")
            ignore_patterns = @("node_modules/**", "dist/**", "build/**", ".git/**", "logs/**")
            directories = @("src", "public", ".github", "scripts")
        }
        actions = @{
            on_change = @("sync")
            on_error = @("log", "notify")
            debounce_ms = 2000
        }

        notifications = @{
            enabled = $true
            methods = @("console", "file")
        }
    }
    
    $defaultConfig | ConvertTo-Json -Depth 4 | Set-Content $ConfigFile
    $script:Config = $defaultConfig
    Write-Log "Configuração padrão criada em $ConfigFile" "info" "Cyan"
}

# Inicializar sistema de monitoramento
function Initialize-Watcher {
    Write-Log "Inicializando sistema de monitoramento..." "info" "Yellow"
    
    # Verificar se Git está disponível
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Log "Git não encontrado no PATH" "error" "Red"
        return $false
    }
    
    # Verificar se estamos em um repositório Git
    if (-not (Test-Path ".git")) {
        Write-Log "Não é um repositório Git válido" "error" "Red"
        return $false
    }
    
    # Criar diretórios necessários
    $dirs = @("logs", "temp")
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Log "Diretório criado: $dir" "info" "Green"
        }
    }
    
    # Inicializar estatísticas
    Initialize-Stats
    
    $script:IsRunning = $true
    Write-Log "Sistema de monitoramento inicializado" "info" "Green"
    return $true
}

# Inicializar estatísticas
function Initialize-Stats {
    if (-not (Test-Path $script:StatsFile)) {
        $stats = @{
            start_time = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
            total_changes = 0
            total_syncs = 0

            last_change = $null
            last_sync = $null
            errors = 0
            uptime_seconds = 0
        }
        
        $stats | ConvertTo-Json -Depth 2 | Set-Content $script:StatsFile
    }
}

# Atualizar estatísticas
function Update-Stats {
    param(
        [string]$Event,
        [hashtable]$Data = @{}
    )
    
    try {
        $stats = Get-Content $script:StatsFile | ConvertFrom-Json
        
        switch ($Event) {
            "change" {
                $stats.total_changes++
                $stats.last_change = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            }
            "sync" {
                $stats.total_syncs++
                $stats.last_sync = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            }

            "error" {
                $stats.errors++
            }
        }
        
        # Calcular uptime
        $startTime = [DateTime]::ParseExact($stats.start_time, "yyyy-MM-dd HH:mm:ss", $null)
        $stats.uptime_seconds = [int]((Get-Date) - $startTime).TotalSeconds
        
        $stats | ConvertTo-Json -Depth 2 | Set-Content $script:StatsFile
    } catch {
        Write-Log "Erro ao atualizar estatísticas: $($_.Exception.Message)" "error" "Red"
    }
}

# Criar FileSystemWatcher
function Start-FileWatcher {
    param([string]$Path, [string[]]$Patterns)
    
    try {
        $watcher = New-Object System.IO.FileSystemWatcher
        $watcher.Path = $Path
        $watcher.IncludeSubdirectories = $true
        $watcher.EnableRaisingEvents = $true
        
        # Eventos a monitorar
        $watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite -bor
                               [System.IO.NotifyFilters]::FileName -bor
                               [System.IO.NotifyFilters]::DirectoryName
        
        # Registrar eventos
        $action = {
            $path = $Event.SourceEventArgs.FullPath
            $changeType = $Event.SourceEventArgs.ChangeType
            $name = $Event.SourceEventArgs.Name
            
            # Verificar se o arquivo deve ser ignorado
            if (Should-IgnoreFile -FilePath $name) {
                return
            }
            
            Write-Log "Mudança detectada: $changeType - $name" "info" "Cyan"
            
            # Atualizar estatísticas
            Update-Stats -Event "change"
            
            # Executar ações configuradas
            Invoke-ChangeActions -FilePath $path -ChangeType $changeType
        }
        
        Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action
        Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action $action
        Register-ObjectEvent -InputObject $watcher -EventName "Deleted" -Action $action
        Register-ObjectEvent -InputObject $watcher -EventName "Renamed" -Action $action
        
        $script:WatcherJobs += $watcher
        Write-Log "FileWatcher iniciado para: $Path" "info" "Green"
        
        return $watcher
    } catch {
        Write-Log "Erro ao iniciar FileWatcher: $($_.Exception.Message)" "error" "Red"
        return $null
    }
}

# Verificar se arquivo deve ser ignorado
function Should-IgnoreFile {
    param([string]$FilePath)
    
    $ignorePatterns = $script:Config.monitoring.ignore_patterns
    
    foreach ($pattern in $ignorePatterns) {
        if ($FilePath -like $pattern) {
            return $true
        }
    }
    
    return $false
}

# Executar ações quando mudanças são detectadas
function Invoke-ChangeActions {
    param(
        [string]$FilePath,
        [string]$ChangeType
    )
    
    $actions = $script:Config.actions.on_change
    
    foreach ($actionType in $actions) {
        switch ($actionType) {

            "sync" {
                if ($script:Config.repository.auto_push) {
                    Start-Sync
                }
            }
            "notify" {
                Send-Notification -Message "Arquivo modificado: $FilePath" -Type $ChangeType
            }
        }
    }
}



# Sincronizar com repositório
function Start-Sync {
    # Debounce - evitar múltiplas sincronizações muito próximas
    $timeSinceLastSync = (Get-Date) - $script:LastSync
    if ($timeSinceLastSync.TotalMilliseconds -lt $script:Config.actions.debounce_ms) {
        Write-Log "Sincronização ignorada (debounce)" "debug" "Gray"
        return
    }
    
    try {
        Write-Log "Iniciando sincronização..." "info" "Yellow"
        
        # Verificar se há mudanças
        $status = git status --porcelain
        if (-not $status) {
            Write-Log "Nenhuma mudança para sincronizar" "info" "Gray"
            return
        }
        
        # Executar script de sincronização
        $syncScript = "scripts\auto-sync-github.ps1"
        if (Test-Path $syncScript) {
            & $syncScript -AutoCommit -Push
            Write-Log "Sincronização concluída" "info" "Green"
            
            Update-Stats -Event "sync"
            $script:LastSync = Get-Date
        } else {
            Write-Log "Script de sincronização não encontrado: $syncScript" "warn" "Yellow"
        }
    } catch {
        Write-Log "Erro na sincronização: $($_.Exception.Message)" "error" "Red"
        Update-Stats -Event "error"
    }
}

# Enviar notificação
function Send-Notification {
    param(
        [string]$Message,
        [string]$Type = "info"
    )
    
    if (-not $script:Config.notifications.enabled) {
        return
    }
    
    $methods = $script:Config.notifications.methods
    
    foreach ($method in $methods) {
        switch ($method) {
            "console" {
                $color = switch ($Type) {
                    "error" { "Red" }
                    "warn" { "Yellow" }
                    "success" { "Green" }
                    default { "Cyan" }
                }
                Write-Host "🔔 $Message" -ForegroundColor $color
            }
            "file" {
                Write-Log "NOTIFICATION: $Message" "info" "Cyan"
            }
        }
    }
}

# Parar monitoramento
function Stop-Watcher {
    Write-Log "Parando sistema de monitoramento..." "info" "Yellow"
    
    foreach ($watcher in $script:WatcherJobs) {
        if ($watcher) {
            $watcher.EnableRaisingEvents = $false
            $watcher.Dispose()
        }
    }
    
    # Limpar jobs de eventos
    Get-EventSubscriber | Unregister-Event
    
    $script:IsRunning = $false
    Write-Log "Sistema de monitoramento parado" "info" "Green"
}

# Exibir estatísticas
function Show-Stats {
    if (Test-Path $script:StatsFile) {
        $stats = Get-Content $script:StatsFile | ConvertFrom-Json
        
        Write-Host ""
        Write-Host "📊 Estatísticas do File Watcher" -ForegroundColor Cyan
        Write-Host "================================" -ForegroundColor Cyan
        Write-Host "Início: $($stats.start_time)" -ForegroundColor White
        Write-Host "Uptime: $([math]::Round($stats.uptime_seconds / 3600, 2)) horas" -ForegroundColor White
        Write-Host "Total de mudanças: $($stats.total_changes)" -ForegroundColor Green
        Write-Host "Total de sincronizações: $($stats.total_syncs)" -ForegroundColor Green

        Write-Host "Erros: $($stats.errors)" -ForegroundColor $(if ($stats.errors -gt 0) { "Red" } else { "Green" })
        
        if ($stats.last_change) {
            Write-Host "Última mudança: $($stats.last_change)" -ForegroundColor Yellow
        }
        if ($stats.last_sync) {
            Write-Host "Última sincronização: $($stats.last_sync)" -ForegroundColor Yellow
        }
        Write-Host ""
    }
}

# Função principal
function Main {
    Write-Host "🔍 File Watcher para RDO-C" -ForegroundColor Cyan
    Write-Host "==========================" -ForegroundColor Cyan
    
    # Carregar configuração
    if (-not (Load-Config)) {
        Write-Host "❌ Falha ao carregar configuração" -ForegroundColor Red
        exit 1
    }
    
    # Inicializar sistema
    if (-not (Initialize-Watcher)) {
        Write-Host "❌ Falha ao inicializar watcher" -ForegroundColor Red
        exit 1
    }
    
    # Iniciar monitoramento para cada diretório configurado
    foreach ($dir in $script:Config.monitoring.directories) {
        if (Test-Path $dir) {
            $watcher = Start-FileWatcher -Path (Resolve-Path $dir) -Patterns $script:Config.monitoring.watch_patterns
            if ($watcher) {
                Write-Host "✅ Monitorando: $dir" -ForegroundColor Green
            }
        } else {
            Write-Log "Diretório não encontrado: $dir" "warn" "Yellow"
        }
    }
    
    Write-Host ""
    Write-Host "🚀 File Watcher ativo!" -ForegroundColor Green
    Write-Host "Pressione Ctrl+C para parar ou 's' para estatísticas" -ForegroundColor Yellow
    Write-Host ""
    
    # Loop principal
    try {
        while ($script:IsRunning) {
            if ([Console]::KeyAvailable) {
                $key = [Console]::ReadKey($true)
                switch ($key.KeyChar) {
                    's' { Show-Stats }
                    'q' { 
                        Write-Host "Parando..." -ForegroundColor Yellow
                        break
                    }
                }
            }
            
            Start-Sleep -Seconds $Interval
        }
    } catch {
        Write-Log "Erro no loop principal: $($_.Exception.Message)" "error" "Red"
    } finally {
        Stop-Watcher
    }
}

# Tratamento de Ctrl+C
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    Stop-Watcher
}

# Executar função principal
if ($MyInvocation.InvocationName -ne '.') {
    Main
}