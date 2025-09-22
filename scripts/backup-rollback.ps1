# Sistema de Backup e Rollback para RDO-C
# Gerencia backups automáticos e permite rollback seguro
# Uso: .\scripts\backup-rollback.ps1 -Action <backup|rollback|list|clean> [opções]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("backup", "rollback", "list", "clean", "restore", "schedule")]
    [string]$Action,
    
    [string]$BackupName = "",
    [string]$Description = "",
    [string]$RestorePoint = "",
    [int]$KeepDays = 30,
    [switch]$Force,
    [switch]$Compress,
    [switch]$Verbose,
    [string]$BackupPath = "backups",
    [string[]]$IncludePaths = @("src", "public", "package.json", "tsconfig.json", "vite.config.ts", ".github", "scripts"),
    [string[]]$ExcludePaths = @("node_modules", "dist", "build", ".git", "logs", "temp", "*.log")
)

# Configurações globais
$script:BackupConfig = @{
    BasePath = $BackupPath
    MetadataFile = "backup-metadata.json"
    MaxBackups = 50
    CompressionLevel = "Optimal"
    EncryptionEnabled = $false
}

# Cores para output
$Colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
    Debug = "Gray"
}

# Função de logging
function Write-BackupLog {
    param(
        [string]$Message,
        [string]$Level = "Info",
        [string]$LogFile = "logs\backup-rollback.log"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Criar diretório de logs se necessário
    $logDir = Split-Path $LogFile -Parent
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    # Escrever no arquivo
    Add-Content -Path $LogFile -Value $logEntry
    
    # Exibir no console
    $color = switch ($Level) {
        "Success" { $Colors.Success }
        "Warning" { $Colors.Warning }
        "Error" { $Colors.Error }
        "Debug" { $Colors.Debug }
        default { $Colors.Info }
    }
    
    if ($Verbose -or $Level -in @("Warning", "Error", "Success")) {
        Write-Host $logEntry -ForegroundColor $color
    }
}

# Inicializar sistema de backup
function Initialize-BackupSystem {
    Write-BackupLog "Inicializando sistema de backup..." "Info"
    
    # Criar diretórios necessários
    $directories = @(
        $script:BackupConfig.BasePath,
        "$($script:BackupConfig.BasePath)\full",
        "$($script:BackupConfig.BasePath)\incremental",
        "$($script:BackupConfig.BasePath)\snapshots",
        "logs",
        "temp"
    )
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-BackupLog "Diretório criado: $dir" "Success"
        }
    }
    
    # Inicializar arquivo de metadados
    $metadataPath = Join-Path $script:BackupConfig.BasePath $script:BackupConfig.MetadataFile
    if (-not (Test-Path $metadataPath)) {
        $initialMetadata = @{
            version = "1.0"
            created = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
            backups = @()
            last_cleanup = $null
            total_backups = 0
        }
        
        $initialMetadata | ConvertTo-Json -Depth 4 | Set-Content $metadataPath
        Write-BackupLog "Arquivo de metadados inicializado" "Success"
    }
    
    return $true
}

# Carregar metadados
function Get-BackupMetadata {
    $metadataPath = Join-Path $script:BackupConfig.BasePath $script:BackupConfig.MetadataFile
    
    if (Test-Path $metadataPath) {
        try {
            return Get-Content $metadataPath | ConvertFrom-Json
        } catch {
            Write-BackupLog "Erro ao carregar metadados: $($_.Exception.Message)" "Error"
            return $null
        }
    }
    
    return $null
}

# Salvar metadados
function Save-BackupMetadata {
    param([object]$Metadata)
    
    $metadataPath = Join-Path $script:BackupConfig.BasePath $script:BackupConfig.MetadataFile
    
    try {
        $Metadata | ConvertTo-Json -Depth 4 | Set-Content $metadataPath
        return $true
    } catch {
        Write-BackupLog "Erro ao salvar metadados: $($_.Exception.Message)" "Error"
        return $false
    }
}

# Criar backup completo
function New-FullBackup {
    param(
        [string]$Name,
        [string]$Description
    )
    
    Write-BackupLog "Iniciando backup completo..." "Info"
    
    # Gerar nome único se não fornecido
    if (-not $Name) {
        $Name = "full_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    }
    
    $backupDir = Join-Path $script:BackupConfig.BasePath "full\$Name"
    
    try {
        # Criar diretório do backup
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        
        # Informações do backup
        $backupInfo = @{
            id = [System.Guid]::NewGuid().ToString()
            name = $Name
            type = "full"
            description = $Description
            created = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            path = $backupDir
            size_bytes = 0
            files_count = 0
            git_commit = ""
            git_branch = ""
            compressed = $Compress
            status = "in_progress"
        }
        
        # Obter informações do Git
        try {
            $backupInfo.git_commit = git rev-parse HEAD
            $backupInfo.git_branch = git branch --show-current
        } catch {
            Write-BackupLog "Aviso: Não foi possível obter informações do Git" "Warning"
        }
        
        # Copiar arquivos
        $totalSize = 0
        $fileCount = 0
        
        foreach ($includePath in $IncludePaths) {
            if (Test-Path $includePath) {
                Write-BackupLog "Copiando: $includePath" "Info"
                
                $destPath = Join-Path $backupDir $includePath
                $destParent = Split-Path $destPath -Parent
                
                if (-not (Test-Path $destParent)) {
                    New-Item -ItemType Directory -Path $destParent -Force | Out-Null
                }
                
                if (Test-Path $includePath -PathType Container) {
                    # Diretório
                    Copy-Item $includePath $destPath -Recurse -Force -Exclude $ExcludePaths
                    
                    # Contar arquivos e tamanho
                    $files = Get-ChildItem $destPath -Recurse -File
                    $fileCount += $files.Count
                    $totalSize += ($files | Measure-Object -Property Length -Sum).Sum
                } else {
                    # Arquivo individual
                    Copy-Item $includePath $destPath -Force
                    $file = Get-Item $destPath
                    $fileCount++
                    $totalSize += $file.Length
                }
            } else {
                Write-BackupLog "Caminho não encontrado: $includePath" "Warning"
            }
        }
        
        # Atualizar informações do backup
        $backupInfo.size_bytes = $totalSize
        $backupInfo.files_count = $fileCount
        $backupInfo.status = "completed"
        
        # Salvar informações do backup
        $backupInfoPath = Join-Path $backupDir "backup-info.json"
        $backupInfo | ConvertTo-Json -Depth 3 | Set-Content $backupInfoPath
        
        # Comprimir se solicitado
        if ($Compress) {
            Write-BackupLog "Comprimindo backup..." "Info"
            $zipPath = "$backupDir.zip"
            
            Add-Type -AssemblyName System.IO.Compression.FileSystem
            [System.IO.Compression.ZipFile]::CreateFromDirectory($backupDir, $zipPath, $script:BackupConfig.CompressionLevel, $false)
            
            # Remover diretório original
            Remove-Item $backupDir -Recurse -Force
            
            $backupInfo.path = $zipPath
            $backupInfo.compressed = $true
            $backupInfo.size_bytes = (Get-Item $zipPath).Length
        }
        
        # Atualizar metadados
        $metadata = Get-BackupMetadata
        if ($metadata) {
            $metadata.backups += $backupInfo
            $metadata.total_backups++
            $metadata.last_backup = $backupInfo.created
            
            Save-BackupMetadata -Metadata $metadata
        }
        
        Write-BackupLog "Backup completo criado: $Name" "Success"
        Write-BackupLog "Arquivos: $fileCount | Tamanho: $([math]::Round($totalSize / 1MB, 2)) MB" "Info"
        
        return $backupInfo
        
    } catch {
        Write-BackupLog "Erro ao criar backup: $($_.Exception.Message)" "Error"
        
        # Limpar backup incompleto
        if (Test-Path $backupDir) {
            Remove-Item $backupDir -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        return $null
    }
}

# Listar backups disponíveis
function Get-BackupList {
    $metadata = Get-BackupMetadata
    
    if (-not $metadata -or -not $metadata.backups) {
        Write-BackupLog "Nenhum backup encontrado" "Warning"
        return @()
    }
    
    Write-Host ""
    Write-Host "📦 Backups Disponíveis" -ForegroundColor Cyan
    Write-Host "=====================" -ForegroundColor Cyan
    
    $backups = $metadata.backups | Sort-Object created -Descending
    
    foreach ($backup in $backups) {
        $sizeStr = if ($backup.size_bytes -gt 1GB) {
            "$([math]::Round($backup.size_bytes / 1GB, 2)) GB"
        } elseif ($backup.size_bytes -gt 1MB) {
            "$([math]::Round($backup.size_bytes / 1MB, 2)) MB"
        } else {
            "$([math]::Round($backup.size_bytes / 1KB, 2)) KB"
        }
        
        $statusColor = switch ($backup.status) {
            "completed" { "Green" }
            "in_progress" { "Yellow" }
            "failed" { "Red" }
            default { "Gray" }
        }
        
        Write-Host ""
        Write-Host "🔹 $($backup.name)" -ForegroundColor White
        Write-Host "   ID: $($backup.id)" -ForegroundColor Gray
        Write-Host "   Tipo: $($backup.type)" -ForegroundColor Gray
        Write-Host "   Data: $($backup.created)" -ForegroundColor Gray
        Write-Host "   Tamanho: $sizeStr" -ForegroundColor Gray
        Write-Host "   Arquivos: $($backup.files_count)" -ForegroundColor Gray
        Write-Host "   Status: $($backup.status)" -ForegroundColor $statusColor
        
        if ($backup.description) {
            Write-Host "   Descrição: $($backup.description)" -ForegroundColor Gray
        }
        
        if ($backup.git_commit) {
            Write-Host "   Git: $($backup.git_branch) ($($backup.git_commit.Substring(0,8)))" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "Total de backups: $($backups.Count)" -ForegroundColor Cyan
    
    return $backups
}

# Restaurar backup
function Restore-Backup {
    param(
        [string]$BackupId,
        [string]$BackupName,
        [switch]$CreateRestorePoint
    )
    
    Write-BackupLog "Iniciando restauração..." "Info"
    
    $metadata = Get-BackupMetadata
    if (-not $metadata) {
        Write-BackupLog "Metadados não encontrados" "Error"
        return $false
    }
    
    # Encontrar backup
    $backup = $null
    if ($BackupId) {
        $backup = $metadata.backups | Where-Object { $_.id -eq $BackupId }
    } elseif ($BackupName) {
        $backup = $metadata.backups | Where-Object { $_.name -eq $BackupName }
    }
    
    if (-not $backup) {
        Write-BackupLog "Backup não encontrado" "Error"
        return $false
    }
    
    # Criar ponto de restauração se solicitado
    if ($CreateRestorePoint) {
        Write-BackupLog "Criando ponto de restauração..." "Info"
        $restorePoint = New-FullBackup -Name "restore_point_$(Get-Date -Format 'yyyyMMdd_HHmmss')" -Description "Ponto de restauração antes de restaurar $($backup.name)"
        
        if (-not $restorePoint) {
            Write-BackupLog "Falha ao criar ponto de restauração" "Error"
            if (-not $Force) {
                return $false
            }
        }
    }
    
    try {
        # Verificar se o backup existe
        if (-not (Test-Path $backup.path)) {
            Write-BackupLog "Arquivo de backup não encontrado: $($backup.path)" "Error"
            return $false
        }
        
        # Preparar diretório temporário
        $tempDir = "temp\restore_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
        
        # Extrair backup se comprimido
        if ($backup.compressed) {
            Write-BackupLog "Extraindo backup comprimido..." "Info"
            Add-Type -AssemblyName System.IO.Compression.FileSystem
            [System.IO.Compression.ZipFile]::ExtractToDirectory($backup.path, $tempDir)
        } else {
            # Copiar arquivos do backup
            Copy-Item "$($backup.path)\*" $tempDir -Recurse -Force
        }
        
        # Restaurar arquivos
        Write-BackupLog "Restaurando arquivos..." "Info"
        
        foreach ($includePath in $IncludePaths) {
            $sourcePath = Join-Path $tempDir $includePath
            
            if (Test-Path $sourcePath) {
                Write-BackupLog "Restaurando: $includePath" "Info"
                
                # Remover arquivo/diretório atual se existir
                if (Test-Path $includePath) {
                    Remove-Item $includePath -Recurse -Force
                }
                
                # Copiar do backup
                Copy-Item $sourcePath $includePath -Recurse -Force
            }
        }
        
        # Limpar diretório temporário
        Remove-Item $tempDir -Recurse -Force
        
        Write-BackupLog "Restauração concluída com sucesso" "Success"
        Write-BackupLog "Backup restaurado: $($backup.name) ($(backup.created))" "Success"
        
        return $true
        
    } catch {
        Write-BackupLog "Erro durante restauração: $($_.Exception.Message)" "Error"
        
        # Limpar diretório temporário em caso de erro
        if (Test-Path $tempDir) {
            Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        return $false
    }
}

# Limpar backups antigos
function Clear-OldBackups {
    param([int]$KeepDays = 30)
    
    Write-BackupLog "Limpando backups antigos (>$KeepDays dias)..." "Info"
    
    $metadata = Get-BackupMetadata
    if (-not $metadata) {
        return
    }
    
    $cutoffDate = (Get-Date).AddDays(-$KeepDays)
    $backupsToRemove = @()
    $removedCount = 0
    $freedSpace = 0
    
    foreach ($backup in $metadata.backups) {
        $backupDate = [DateTime]::ParseExact($backup.created, "yyyy-MM-dd HH:mm:ss", $null)
        
        if ($backupDate -lt $cutoffDate) {
            Write-BackupLog "Removendo backup antigo: $($backup.name)" "Info"
            
            # Remover arquivo/diretório do backup
            if (Test-Path $backup.path) {
                $size = if ($backup.compressed) {
                    (Get-Item $backup.path).Length
                } else {
                    (Get-ChildItem $backup.path -Recurse -File | Measure-Object -Property Length -Sum).Sum
                }
                
                Remove-Item $backup.path -Recurse -Force
                $freedSpace += $size
                $removedCount++
            }
            
            $backupsToRemove += $backup.id
        }
    }
    
    # Atualizar metadados
    if ($backupsToRemove.Count -gt 0) {
        $metadata.backups = $metadata.backups | Where-Object { $_.id -notin $backupsToRemove }
        $metadata.last_cleanup = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        
        Save-BackupMetadata -Metadata $metadata
        
        $freedSpaceStr = if ($freedSpace -gt 1GB) {
            "$([math]::Round($freedSpace / 1GB, 2)) GB"
        } else {
            "$([math]::Round($freedSpace / 1MB, 2)) MB"
        }
        
        Write-BackupLog "Limpeza concluída: $removedCount backups removidos, $freedSpaceStr liberados" "Success"
    } else {
        Write-BackupLog "Nenhum backup antigo para remover" "Info"
    }
}

# Função principal
function Main {
    Write-Host "💾 Sistema de Backup e Rollback - RDO-C" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    # Inicializar sistema
    if (-not (Initialize-BackupSystem)) {
        Write-Host "❌ Falha ao inicializar sistema de backup" -ForegroundColor Red
        exit 1
    }
    
    switch ($Action) {
        "backup" {
            Write-Host "📦 Criando backup..." -ForegroundColor Yellow
            $result = New-FullBackup -Name $BackupName -Description $Description
            
            if ($result) {
                Write-Host "✅ Backup criado com sucesso: $($result.name)" -ForegroundColor Green
            } else {
                Write-Host "❌ Falha ao criar backup" -ForegroundColor Red
                exit 1
            }
        }
        
        "list" {
            Get-BackupList | Out-Null
        }
        
        "restore" {
            Write-Host "🔄 Restaurando backup..." -ForegroundColor Yellow
            
            if (-not $RestorePoint -and -not $BackupName) {
                Write-Host "❌ Especifique -RestorePoint (ID) ou -BackupName" -ForegroundColor Red
                exit 1
            }
            
            $success = Restore-Backup -BackupId $RestorePoint -BackupName $BackupName -CreateRestorePoint:(-not $Force)
            
            if ($success) {
                Write-Host "✅ Restauração concluída com sucesso" -ForegroundColor Green
            } else {
                Write-Host "❌ Falha na restauração" -ForegroundColor Red
                exit 1
            }
        }
        
        "clean" {
            Write-Host "🧹 Limpando backups antigos..." -ForegroundColor Yellow
            Clear-OldBackups -KeepDays $KeepDays
        }
        
        "schedule" {
            Write-Host "⏰ Configurando backup agendado..." -ForegroundColor Yellow
            # TODO: Implementar agendamento com Task Scheduler
            Write-Host "⚠️ Funcionalidade em desenvolvimento" -ForegroundColor Yellow
        }
    }
}

# Executar função principal
if ($MyInvocation.InvocationName -ne '.') {
    Main
}