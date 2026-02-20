# Script de Sincronização Automática com GitHub
# Autor: Sistema RDO
# Versão: 2.0
# Descrição: Script avançado para sincronização automática com repositório GitHub

param(
    [string]$RemoteRepo = "https://github.com/Reifonas/TS_RDO.git",
    [string]$Branch = "main",
    [int]$WatchInterval = 30,
    [switch]$ContinuousMode,
    [switch]$Verbose
)

# Configurações
$ProjectPath = Split-Path -Parent $PSScriptRoot
$LogPath = Join-Path $ProjectPath "logs"

$ConfigPath = Join-Path $ProjectPath "auto-sync-config.json"

# Criar diretórios necessários
if (!(Test-Path $LogPath)) { New-Item -ItemType Directory -Path $LogPath -Force }


# Função de logging
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    $logFile = Join-Path $LogPath "auto-sync-$(Get-Date -Format 'yyyy-MM-dd').log"
    
    Write-Host $logMessage -ForegroundColor $(switch($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "White" }
    })
    
    Add-Content -Path $logFile -Value $logMessage
}

# Função para verificar se é um repositório Git
function Test-GitRepository {
    try {
        $null = git rev-parse --git-dir 2>$null
        return $true
    } catch {
        return $false
    }
}

# Função para inicializar repositório Git
function Initialize-GitRepository {
    Write-Log "Inicializando repositório Git..." "INFO"
    
    try {
        # Inicializar repositório
        git init
        
        # Configurar remote
        git remote add origin $RemoteRepo
        
        # Configurar branch principal
        git branch -M $Branch
        
        Write-Log "Repositório Git inicializado com sucesso" "SUCCESS"
        return $true
    } catch {
        Write-Log "Erro ao inicializar repositório: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Função para verificar mudanças
function Test-HasChanges {
    try {
        $status = git status --porcelain 2>$null
        return ![string]::IsNullOrEmpty($status)
    } catch {
        Write-Log "Erro ao verificar mudanças: $($_.Exception.Message)" "ERROR"
        return $false
    }
}



# Função para gerar mensagem de commit automática
function Get-AutoCommitMessage {
    $changedFiles = git diff --name-only HEAD 2>$null
    $newFiles = git ls-files --others --exclude-standard 2>$null
    $deletedFiles = git diff --name-only --diff-filter=D HEAD 2>$null
    
    $changes = @()
    if ($changedFiles) { $changes += "Modified: $($changedFiles.Count) files" }
    if ($newFiles) { $changes += "Added: $($newFiles.Count) files" }
    if ($deletedFiles) { $changes += "Deleted: $($deletedFiles.Count) files" }
    
    $message = "Auto-sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    if ($changes.Count -gt 0) {
        $message += " - " + ($changes -join ", ")
    }
    
    return $message
}

# Função principal de sincronização
function Sync-WithGitHub {
    param([bool]$CreateBackup = $false)
    
    Write-Log "Iniciando sincronização com GitHub..." "INFO"
    
    # Verificar se é repositório Git
    if (!(Test-GitRepository)) {
        Write-Log "Não é um repositório Git. Inicializando..." "WARN"
        if (!(Initialize-GitRepository)) {
            return $false
        }
    }
    
    # Verificar mudanças
    if (!(Test-HasChanges)) {
        Write-Log "Nenhuma mudança detectada" "INFO"
        return $true
    }
    
    try {

        
        # Fazer pull das mudanças remotas
        Write-Log "Fazendo pull das mudanças remotas..." "INFO"
        git pull origin $Branch --rebase 2>$null
        
        # Adicionar todos os arquivos
        Write-Log "Adicionando arquivos..." "INFO"
        git add .
        
        # Commit com mensagem automática
        $commitMessage = Get-AutoCommitMessage
        Write-Log "Fazendo commit: $commitMessage" "INFO"
        git commit -m $commitMessage
        
        # Push para o repositório remoto
        Write-Log "Enviando para GitHub..." "INFO"
        git push origin $Branch
        
        Write-Log "Sincronização concluída com sucesso!" "SUCCESS"
        return $true
        
    } catch {
        Write-Log "Erro durante sincronização: $($_.Exception.Message)" "ERROR"
        
        # Log do erro para análise
        if ($false) {
            Write-Log "Tentando rollback..." "WARN"
            try {
                git reset --hard HEAD~1 2>$null
                Write-Log "Rollback realizado" "SUCCESS"
            } catch {
                Write-Log "Falha no rollback: $($_.Exception.Message)" "ERROR"
            }
        }
        
        return $false
    }
}

# Função de monitoramento contínuo
function Start-ContinuousSync {
    Write-Log "Iniciando monitoramento contínuo (intervalo: $WatchInterval segundos)" "INFO"
    Write-Log "Pressione Ctrl+C para parar" "INFO"
    
    $lastSyncTime = Get-Date
    
    try {
        while ($true) {
            $currentTime = Get-Date
            
            # Verificar se passou o intervalo
            if (($currentTime - $lastSyncTime).TotalSeconds -ge $WatchInterval) {
                if (Test-HasChanges) {
                    Write-Log "Mudanças detectadas. Iniciando sincronização..." "INFO"
                    if (Sync-WithGitHub) {
                        $lastSyncTime = $currentTime
                    }
                } elseif ($Verbose) {
                    Write-Log "Verificação realizada - sem mudanças" "INFO"
                }
                
                $lastSyncTime = $currentTime
            }
            
            Start-Sleep -Seconds 5
        }
    } catch {
        Write-Log "Monitoramento interrompido: $($_.Exception.Message)" "WARN"
    }
}

# Função para limpar logs antigos
function Clear-OldLogs {
    param([int]$DaysToKeep = 7)
    
    try {
        $cutoffDate = (Get-Date).AddDays(-$DaysToKeep)
        $oldLogs = Get-ChildItem -Path $LogPath -Filter "*.log" | Where-Object { $_.LastWriteTime -lt $cutoffDate }
        
        foreach ($log in $oldLogs) {
            Remove-Item $log.FullName -Force
            Write-Log "Log antigo removido: $($log.Name)" "INFO"
        }
    } catch {
        Write-Log "Erro ao limpar logs antigos: $($_.Exception.Message)" "ERROR"
    }
}



# Execução principal
function Main {
    Write-Log "=== Iniciando Auto-Sync GitHub ==="
    Write-Log "Repositório: $RemoteRepo"
    Write-Log "Branch: $Branch"
    Write-Log "Diretório: $ProjectPath"
    
    # Mudar para o diretório do projeto
    Set-Location $ProjectPath
    
    # Limpar arquivos antigos
    Clear-OldLogs

    
    if ($ContinuousMode) {
        Start-ContinuousSync
    } else {
        $result = Sync-WithGitHub
        if ($result) {
            Write-Log "Sincronização única concluída com sucesso" "SUCCESS"
            exit 0
        } else {
            Write-Log "Falha na sincronização" "ERROR"
            exit 1
        }
    }
}

# Executar script principal
Main