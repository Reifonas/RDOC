# Sistema de Logs e Notificações para RDO-C
# Gerencia logs detalhados e notificações em tempo real
# Uso: Import-Module .\scripts\logging-notifications.ps1

# Configurações globais de logging
$script:LogConfig = @{
    LogDirectory = "logs"
    MaxLogSize = 10MB
    MaxLogFiles = 10
    LogLevels = @("TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL")
    DateFormat = "yyyy-MM-dd HH:mm:ss.fff"
    EnableConsole = $true
    EnableFile = $true
    EnableNotifications = $true
    NotificationTypes = @("desktop", "email", "webhook")
}

# Configurações de notificação
$script:NotificationConfig = @{
    Desktop = @{
        Enabled = $true
        ShowSuccess = $false
        ShowWarning = $true
        ShowError = $true
        Duration = 5000
    }
    Email = @{
        Enabled = $false
        SmtpServer = ""
        Port = 587
        Username = ""
        Password = ""
        From = ""
        To = @()
        Subject = "RDO-C Auto-Sync Notification"
    }
    Webhook = @{
        Enabled = $false
        Url = ""
        Method = "POST"
        Headers = @{}
        AuthToken = ""
    }
    Slack = @{
        Enabled = $false
        WebhookUrl = ""
        Channel = "#dev-notifications"
        Username = "RDO-C Bot"
        IconEmoji = ":robot_face:"
    }
    Discord = @{
        Enabled = $false
        WebhookUrl = ""
        Username = "RDO-C Auto-Sync"
        AvatarUrl = ""
    }
}

# Cores para diferentes níveis de log
$script:LogColors = @{
    TRACE = "DarkGray"
    DEBUG = "Gray"
    INFO = "White"
    WARN = "Yellow"
    ERROR = "Red"
    FATAL = "Magenta"
    SUCCESS = "Green"
}

# Emojis para notificações
$script:LogEmojis = @{
    TRACE = "🔍"
    DEBUG = "🐛"
    INFO = "ℹ️"
    WARN = "⚠️"
    ERROR = "❌"
    FATAL = "💀"
    SUCCESS = "✅"
    BACKUP = "💾"
    SYNC = "🔄"
    DEPLOY = "🚀"
    GIT = "📝"
}

# Classe para gerenciar logs estruturados
class LogEntry {
    [string]$Timestamp
    [string]$Level
    [string]$Category
    [string]$Message
    [hashtable]$Context
    [string]$Source
    [string]$Thread
    [string]$SessionId
    
    LogEntry([string]$level, [string]$message, [string]$category = "General", [hashtable]$context = @{}) {
        $this.Timestamp = Get-Date -Format $script:LogConfig.DateFormat
        $this.Level = $level.ToUpper()
        $this.Category = $category
        $this.Message = $message
        $this.Context = $context
        $this.Source = (Get-PSCallStack)[2].Command
        $this.Thread = [System.Threading.Thread]::CurrentThread.ManagedThreadId
        $this.SessionId = $env:RDO_SESSION_ID ?? (New-Guid).ToString().Substring(0,8)
    }
    
    [string] ToString() {
        $contextStr = if ($this.Context.Count -gt 0) {
            " | Context: $($this.Context | ConvertTo-Json -Compress)"
        } else { "" }
        
        return "[$($this.Timestamp)] [$($this.Level)] [$($this.Category)] [$($this.Source)] $($this.Message)$contextStr"
    }
    
    [hashtable] ToHashtable() {
        return @{
            timestamp = $this.Timestamp
            level = $this.Level
            category = $this.Category
            message = $this.Message
            context = $this.Context
            source = $this.Source
            thread = $this.Thread
            session_id = $this.SessionId
        }
    }
}

# Inicializar sistema de logging
function Initialize-LoggingSystem {
    param(
        [string]$ConfigPath = "logging-config.json"
    )
    
    # Criar diretório de logs
    if (-not (Test-Path $script:LogConfig.LogDirectory)) {
        New-Item -ItemType Directory -Path $script:LogConfig.LogDirectory -Force | Out-Null
    }
    
    # Carregar configuração personalizada se existir
    if (Test-Path $ConfigPath) {
        try {
            $customConfig = Get-Content $ConfigPath | ConvertFrom-Json
            
            # Mesclar configurações
            foreach ($key in $customConfig.PSObject.Properties.Name) {
                if ($script:LogConfig.ContainsKey($key)) {
                    $script:LogConfig[$key] = $customConfig.$key
                }
            }
            
            Write-LogEntry "INFO" "Configuração de logging carregada: $ConfigPath" "System"
        } catch {
            Write-LogEntry "WARN" "Falha ao carregar configuração: $($_.Exception.Message)" "System"
        }
    }
    
    # Configurar ID da sessão
    if (-not $env:RDO_SESSION_ID) {
        $env:RDO_SESSION_ID = (New-Guid).ToString().Substring(0,8)
    }
    
    Write-LogEntry "INFO" "Sistema de logging inicializado - Sessão: $env:RDO_SESSION_ID" "System"
    
    return $true
}

# Função principal de logging
function Write-LogEntry {
    param(
        [Parameter(Mandatory=$true)]
        [ValidateSet("TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL", "SUCCESS")]
        [string]$Level,
        
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [string]$Category = "General",
        [hashtable]$Context = @{},
        [string]$LogFile = "",
        [switch]$NoConsole,
        [switch]$NoFile,
        [switch]$NoNotification
    )
    
    # Criar entrada de log
    $logEntry = [LogEntry]::new($Level, $Message, $Category, $Context)
    
    # Log no console
    if ($script:LogConfig.EnableConsole -and -not $NoConsole) {
        Write-ConsoleLog -LogEntry $logEntry
    }
    
    # Log em arquivo
    if ($script:LogConfig.EnableFile -and -not $NoFile) {
        Write-FileLog -LogEntry $logEntry -LogFile $LogFile
    }
    
    # Notificações
    if ($script:LogConfig.EnableNotifications -and -not $NoNotification) {
        Send-LogNotification -LogEntry $logEntry
    }
    
    return $logEntry
}

# Escrever log no console
function Write-ConsoleLog {
    param([LogEntry]$LogEntry)
    
    $color = $script:LogColors[$LogEntry.Level]
    $emoji = $script:LogEmojis[$LogEntry.Level]
    
    $prefix = "$emoji [$($LogEntry.Level)] [$($LogEntry.Category)]"
    $message = "$prefix $($LogEntry.Message)"
    
    Write-Host $message -ForegroundColor $color
    
    # Mostrar contexto se disponível
    if ($LogEntry.Context.Count -gt 0) {
        $contextStr = $LogEntry.Context | ConvertTo-Json -Compress
        Write-Host "   Context: $contextStr" -ForegroundColor DarkGray
    }
}

# Escrever log em arquivo
function Write-FileLog {
    param(
        [LogEntry]$LogEntry,
        [string]$LogFile = ""
    )
    
    # Determinar arquivo de log
    if (-not $LogFile) {
        $date = Get-Date -Format "yyyy-MM-dd"
        $LogFile = Join-Path $script:LogConfig.LogDirectory "rdo-auto-sync-$date.log"
    } else {
        $LogFile = Join-Path $script:LogConfig.LogDirectory $LogFile
    }
    
    try {
        # Verificar rotação de logs
        if (Test-Path $LogFile) {
            $fileInfo = Get-Item $LogFile
            if ($fileInfo.Length -gt $script:LogConfig.MaxLogSize) {
                Rotate-LogFile -LogFile $LogFile
            }
        }
        
        # Escrever entrada
        $logLine = $LogEntry.ToString()
        Add-Content -Path $LogFile -Value $logLine -Encoding UTF8
        
    } catch {
        Write-Host "❌ Erro ao escrever log: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Rotacionar arquivos de log
function Rotate-LogFile {
    param([string]$LogFile)
    
    $directory = Split-Path $LogFile -Parent
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($LogFile)
    $extension = [System.IO.Path]::GetExtension($LogFile)
    
    # Mover arquivos existentes
    for ($i = $script:LogConfig.MaxLogFiles - 1; $i -gt 0; $i--) {
        $oldFile = Join-Path $directory "$baseName.$i$extension"
        $newFile = Join-Path $directory "$baseName.$($i + 1)$extension"
        
        if (Test-Path $oldFile) {
            if ($i -eq ($script:LogConfig.MaxLogFiles - 1)) {
                Remove-Item $oldFile -Force
            } else {
                Move-Item $oldFile $newFile -Force
            }
        }
    }
    
    # Mover arquivo atual
    $rotatedFile = Join-Path $directory "$baseName.1$extension"
    Move-Item $LogFile $rotatedFile -Force
    
    Write-LogEntry "INFO" "Log rotacionado: $LogFile" "System"
}

# Enviar notificações
function Send-LogNotification {
    param([LogEntry]$LogEntry)
    
    # Filtrar por nível
    $shouldNotify = switch ($LogEntry.Level) {
        "SUCCESS" { $script:NotificationConfig.Desktop.ShowSuccess }
        "WARN" { $script:NotificationConfig.Desktop.ShowWarning }
        "ERROR" { $script:NotificationConfig.Desktop.ShowError }
        "FATAL" { $true }
        default { $false }
    }
    
    if (-not $shouldNotify) { return }
    
    # Notificação desktop
    if ($script:NotificationConfig.Desktop.Enabled) {
        Send-DesktopNotification -LogEntry $LogEntry
    }
    
    # Notificação por email
    if ($script:NotificationConfig.Email.Enabled) {
        Send-EmailNotification -LogEntry $LogEntry
    }
    
    # Webhook genérico
    if ($script:NotificationConfig.Webhook.Enabled) {
        Send-WebhookNotification -LogEntry $LogEntry
    }
    
    # Slack
    if ($script:NotificationConfig.Slack.Enabled) {
        Send-SlackNotification -LogEntry $LogEntry
    }
    
    # Discord
    if ($script:NotificationConfig.Discord.Enabled) {
        Send-DiscordNotification -LogEntry $LogEntry
    }
}

# Notificação desktop (Windows)
function Send-DesktopNotification {
    param([LogEntry]$LogEntry)
    
    try {
        $emoji = $script:LogEmojis[$LogEntry.Level]
        $title = "RDO-C Auto-Sync $emoji"
        $message = "[$($LogEntry.Category)] $($LogEntry.Message)"
        
        # Usar Windows Toast Notification
        Add-Type -AssemblyName System.Windows.Forms
        
        $notification = New-Object System.Windows.Forms.NotifyIcon
        $notification.Icon = [System.Drawing.SystemIcons]::Information
        $notification.BalloonTipTitle = $title
        $notification.BalloonTipText = $message
        $notification.Visible = $true
        
        $notification.ShowBalloonTip($script:NotificationConfig.Desktop.Duration)
        
        # Limpar após exibição
        Start-Sleep -Milliseconds 100
        $notification.Dispose()
        
    } catch {
        Write-Host "⚠️ Falha na notificação desktop: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Notificação Slack
function Send-SlackNotification {
    param([LogEntry]$LogEntry)
    
    try {
        $emoji = $script:LogEmojis[$LogEntry.Level]
        $color = switch ($LogEntry.Level) {
            "SUCCESS" { "good" }
            "WARN" { "warning" }
            "ERROR" { "danger" }
            "FATAL" { "danger" }
            default { "#36a64f" }
        }
        
        $payload = @{
            channel = $script:NotificationConfig.Slack.Channel
            username = $script:NotificationConfig.Slack.Username
            icon_emoji = $script:NotificationConfig.Slack.IconEmoji
            attachments = @(
                @{
                    color = $color
                    title = "$emoji RDO-C Auto-Sync - $($LogEntry.Level)"
                    text = $LogEntry.Message
                    fields = @(
                        @{
                            title = "Categoria"
                            value = $LogEntry.Category
                            short = $true
                        },
                        @{
                            title = "Timestamp"
                            value = $LogEntry.Timestamp
                            short = $true
                        }
                    )
                    footer = "RDO-C Auto-Sync"
                    ts = [int][double]::Parse((Get-Date -UFormat %s))
                }
            )
        }
        
        $json = $payload | ConvertTo-Json -Depth 4
        Invoke-RestMethod -Uri $script:NotificationConfig.Slack.WebhookUrl -Method POST -Body $json -ContentType "application/json"
        
    } catch {
        Write-Host "⚠️ Falha na notificação Slack: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Notificação Discord
function Send-DiscordNotification {
    param([LogEntry]$LogEntry)
    
    try {
        $emoji = $script:LogEmojis[$LogEntry.Level]
        $color = switch ($LogEntry.Level) {
            "SUCCESS" { 65280 }  # Verde
            "WARN" { 16776960 }  # Amarelo
            "ERROR" { 16711680 }  # Vermelho
            "FATAL" { 8388736 }   # Roxo
            default { 3447003 }   # Azul
        }
        
        $payload = @{
            username = $script:NotificationConfig.Discord.Username
            avatar_url = $script:NotificationConfig.Discord.AvatarUrl
            embeds = @(
                @{
                    title = "$emoji RDO-C Auto-Sync - $($LogEntry.Level)"
                    description = $LogEntry.Message
                    color = $color
                    fields = @(
                        @{
                            name = "Categoria"
                            value = $LogEntry.Category
                            inline = $true
                        },
                        @{
                            name = "Fonte"
                            value = $LogEntry.Source
                            inline = $true
                        }
                    )
                    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                    footer = @{
                        text = "Sessão: $($LogEntry.SessionId)"
                    }
                }
            )
        }
        
        $json = $payload | ConvertTo-Json -Depth 4
        Invoke-RestMethod -Uri $script:NotificationConfig.Discord.WebhookUrl -Method POST -Body $json -ContentType "application/json"
        
    } catch {
        Write-Host "⚠️ Falha na notificação Discord: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Funções de conveniência para diferentes categorias
function Write-GitLog {
    param([string]$Level, [string]$Message, [hashtable]$Context = @{})
    Write-LogEntry -Level $Level -Message $Message -Category "Git" -Context $Context
}

function Write-BackupLog {
    param([string]$Level, [string]$Message, [hashtable]$Context = @{})
    Write-LogEntry -Level $Level -Message $Message -Category "Backup" -Context $Context
}

function Write-SyncLog {
    param([string]$Level, [string]$Message, [hashtable]$Context = @{})
    Write-LogEntry -Level $Level -Message $Message -Category "Sync" -Context $Context
}

function Write-DeployLog {
    param([string]$Level, [string]$Message, [hashtable]$Context = @{})
    Write-LogEntry -Level $Level -Message $Message -Category "Deploy" -Context $Context
}

function Write-WatchLog {
    param([string]$Level, [string]$Message, [hashtable]$Context = @{})
    Write-LogEntry -Level $Level -Message $Message -Category "FileWatch" -Context $Context
}

# Análise de logs
function Get-LogAnalysis {
    param(
        [string]$LogFile = "",
        [int]$LastHours = 24,
        [string[]]$Levels = @(),
        [string[]]$Categories = @()
    )
    
    if (-not $LogFile) {
        $date = Get-Date -Format "yyyy-MM-dd"
        $LogFile = Join-Path $script:LogConfig.LogDirectory "rdo-auto-sync-$date.log"
    }
    
    if (-not (Test-Path $LogFile)) {
        Write-Host "❌ Arquivo de log não encontrado: $LogFile" -ForegroundColor Red
        return
    }
    
    $cutoffTime = (Get-Date).AddHours(-$LastHours)
    $logs = Get-Content $LogFile | ForEach-Object {
        if ($_ -match '\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\] \[([A-Z]+)\] \[([^\]]+)\]') {
            $timestamp = [DateTime]::ParseExact($matches[1], $script:LogConfig.DateFormat, $null)
            
            if ($timestamp -gt $cutoffTime) {
                @{
                    Timestamp = $timestamp
                    Level = $matches[2]
                    Category = $matches[3]
                    FullLine = $_
                }
            }
        }
    } | Where-Object { $_ -ne $null }
    
    # Filtrar por níveis e categorias
    if ($Levels.Count -gt 0) {
        $logs = $logs | Where-Object { $_.Level -in $Levels }
    }
    
    if ($Categories.Count -gt 0) {
        $logs = $logs | Where-Object { $_.Category -in $Categories }
    }
    
    # Estatísticas
    $stats = @{
        Total = $logs.Count
        ByLevel = $logs | Group-Object Level | ForEach-Object { @{ $_.Name = $_.Count } }
        ByCategory = $logs | Group-Object Category | ForEach-Object { @{ $_.Name = $_.Count } }
        TimeRange = @{
            Start = ($logs | Sort-Object Timestamp | Select-Object -First 1).Timestamp
            End = ($logs | Sort-Object Timestamp | Select-Object -Last 1).Timestamp
        }
    }
    
    Write-Host ""
    Write-Host "📊 Análise de Logs - Últimas $LastHours horas" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "Total de entradas: $($stats.Total)" -ForegroundColor White
    
    Write-Host ""
    Write-Host "Por Nível:" -ForegroundColor Yellow
    $stats.ByLevel | ForEach-Object {
        $_.GetEnumerator() | ForEach-Object {
            $emoji = $script:LogEmojis[$_.Key]
            Write-Host "  $emoji $($_.Key): $($_.Value)" -ForegroundColor White
        }
    }
    
    Write-Host ""
    Write-Host "Por Categoria:" -ForegroundColor Yellow
    $stats.ByCategory | ForEach-Object {
        $_.GetEnumerator() | ForEach-Object {
            Write-Host "  📁 $($_.Key): $($_.Value)" -ForegroundColor White
        }
    }
    
    return $stats
}

# Exportar funções
Export-ModuleMember -Function @(
    'Initialize-LoggingSystem',
    'Write-LogEntry',
    'Write-GitLog',
    'Write-BackupLog', 
    'Write-SyncLog',
    'Write-DeployLog',
    'Write-WatchLog',
    'Get-LogAnalysis',
    'Send-LogNotification'
)

# Inicializar automaticamente se importado
if ($MyInvocation.InvocationName -eq 'Import-Module' -or $MyInvocation.InvocationName -eq '.') {
    Initialize-LoggingSystem
}