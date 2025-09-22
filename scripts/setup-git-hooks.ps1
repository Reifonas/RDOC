# Script para configurar Git Hooks no Windows
# Executa: .\scripts\setup-git-hooks.ps1

Write-Host "🔧 Configurando Git Hooks para RDO-C..." -ForegroundColor Yellow

# Verificar se estamos no diretório correto
if (-not (Test-Path ".git")) {
    Write-Host "❌ Erro: Execute este script na raiz do repositório Git" -ForegroundColor Red
    exit 1
}

# Criar diretórios necessários
$directories = @(
    ".git\hooks\logs",
    "backups\pre-commit",
    "backups\post-commit",
    "logs\git-hooks"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "📁 Criado diretório: $dir" -ForegroundColor Green
    }
}

# Verificar se os hooks existem
$hooks = @("pre-commit", "post-commit")
$hooksPath = ".git\hooks"

foreach ($hook in $hooks) {
    $hookFile = Join-Path $hooksPath $hook
    
    if (Test-Path $hookFile) {
        Write-Host "✅ Hook encontrado: $hook" -ForegroundColor Green
        
        # No Windows, precisamos garantir que o arquivo seja executável
        # Vamos criar um wrapper .bat para cada hook
        $batFile = "$hookFile.bat"
        
        $batContent = @"
@echo off
REM Wrapper para executar git hook no Windows
REM Tenta usar Git Bash primeiro, depois WSL, depois PowerShell

REM Verificar se Git Bash está disponível
where git >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('where git') do (
        set "GIT_DIR=%%~dpi"
        goto :found_git
    )
)

:found_git
if exist "%GIT_DIR%\..\bin\bash.exe" (
    "%GIT_DIR%\..\bin\bash.exe" "%~dp0$hook"
    exit /b %errorlevel%
)

REM Tentar WSL se disponível
where wsl >nul 2>&1
if %errorlevel% equ 0 (
    wsl bash "%~dp0$hook"
    exit /b %errorlevel%
)

REM Fallback: executar versão PowerShell
if exist "%~dp0$hook.ps1" (
    powershell -ExecutionPolicy Bypass -File "%~dp0$hook.ps1"
    exit /b %errorlevel%
)

echo Nenhum interpretador disponível para executar o hook $hook
exit /b 1
"@
        
        Set-Content -Path $batFile -Value $batContent -Encoding ASCII
        Write-Host "🔄 Criado wrapper Windows: $hook.bat" -ForegroundColor Cyan
        
        # Criar versão PowerShell do hook como fallback
        $psFile = "$hookFile.ps1"
        $psContent = Convert-ShellToPowerShell -HookName $hook
        Set-Content -Path $psFile -Value $psContent -Encoding UTF8
        Write-Host "🔄 Criada versão PowerShell: $hook.ps1" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Hook não encontrado: $hook" -ForegroundColor Red
    }
}

# Função para converter shell script para PowerShell (versão simplificada)
function Convert-ShellToPowerShell {
    param([string]$HookName)
    
    if ($HookName -eq "pre-commit") {
        return @'
# Pre-commit hook em PowerShell para Windows
# Versão simplificada do hook shell

Write-Host "🔍 Executando verificações pre-commit..." -ForegroundColor Yellow

# Verificar se há arquivos staged
$stagedFiles = git diff --cached --name-only
if (-not $stagedFiles) {
    Write-Host "❌ Nenhum arquivo staged para commit" -ForegroundColor Red
    exit 1
}

Write-Host "📝 Verificando arquivos TypeScript/JavaScript..." -ForegroundColor Yellow
$tsFiles = $stagedFiles | Where-Object { $_ -match "\.(ts|tsx|js|jsx)$" }

if ($tsFiles) {
    # Verificar se npm/pnpm está disponível
    if (Get-Command npx -ErrorAction SilentlyContinue) {
        Write-Host "🔧 Executando verificação de tipos..." -ForegroundColor Yellow
        $tscResult = npx tsc --noEmit --skipLibCheck
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Erro de tipos TypeScript encontrado" -ForegroundColor Red
            exit 1
        }
        
        # ESLint se disponível
        if (Test-Path "package.json") {
            $packageContent = Get-Content "package.json" | ConvertFrom-Json
            if ($packageContent.devDependencies.eslint -or $packageContent.dependencies.eslint) {
                Write-Host "🧹 Executando ESLint..." -ForegroundColor Yellow
                npx eslint $tsFiles --fix
            }
        }
        
        # Prettier se disponível
        if (Test-Path "package.json") {
            $packageContent = Get-Content "package.json" | ConvertFrom-Json
            if ($packageContent.devDependencies.prettier -or $packageContent.dependencies.prettier) {
                Write-Host "💅 Formatando código com Prettier..." -ForegroundColor Yellow
                npx prettier --write $tsFiles
                git add $tsFiles
            }
        }
    }
}

# Criar backup
Write-Host "💾 Criando backup..." -ForegroundColor Yellow
$backupDir = "backups\pre-commit\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

foreach ($file in $stagedFiles) {
    if (Test-Path $file) {
        $destDir = Join-Path $backupDir (Split-Path $file -Parent)
        if ($destDir -and -not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item $file (Join-Path $backupDir $file) -Force
    }
}

Write-Host "✅ Pre-commit verificações concluídas" -ForegroundColor Green
Write-Host "📊 Arquivos a serem commitados: $($stagedFiles.Count)" -ForegroundColor Green

exit 0
'@
    } elseif ($HookName -eq "post-commit") {
        return @'
# Post-commit hook em PowerShell para Windows

Write-Host "🚀 Executando ações post-commit..." -ForegroundColor Blue

# Obter informações do commit
$commitHash = git rev-parse HEAD
$commitMsg = git log -1 --pretty=%B
$commitAuthor = git log -1 --pretty=%an
$branchName = git branch --show-current

Write-Host "📝 Commit: $($commitHash.Substring(0,8))" -ForegroundColor Green
Write-Host "🌿 Branch: $branchName" -ForegroundColor Green
Write-Host "👤 Autor: $commitAuthor" -ForegroundColor Green

# Log do commit
$logDir = ".git\hooks\logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$logEntry = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Commit: $commitHash por $commitAuthor na branch $branchName"
Add-Content -Path "$logDir\post-commit.log" -Value $logEntry

# Atualizar estatísticas
$statsFile = "$logDir\commit-stats.json"
$totalCommits = git rev-list --count HEAD
$filesModified = (git diff-tree --no-commit-id --name-only -r $commitHash).Count

$stats = @{
    total_commits = [int]$totalCommits
    last_commit = $commitHash
    last_commit_date = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
    last_commit_message = ($commitMsg -split "`n")[0]
    files_modified_last = $filesModified
    branch = $branchName
    author = $commitAuthor
}

$stats | ConvertTo-Json -Depth 3 | Set-Content $statsFile

Write-Host "📊 Estatísticas atualizadas" -ForegroundColor Cyan
Write-Host "✅ Post-commit concluído" -ForegroundColor Green

exit 0
'@
    }
    
    return ""
}

# Configurar Git para usar os hooks
Write-Host "⚙️ Configurando Git..." -ForegroundColor Yellow

# Definir core.hooksPath se necessário (opcional)
# git config core.hooksPath .git/hooks

# Verificar configuração atual
$currentHooksPath = git config --get core.hooksPath
if ($currentHooksPath) {
    Write-Host "📍 Hooks path atual: $currentHooksPath" -ForegroundColor Cyan
} else {
    Write-Host "📍 Usando hooks path padrão: .git/hooks" -ForegroundColor Cyan
}

# Criar arquivo de configuração dos hooks
$hookConfig = @{
    enabled = $true
    hooks = @{
        "pre-commit" = @{
            enabled = $true
            checks = @("typescript", "eslint", "prettier", "file-size", "secrets")
        }
        "post-commit" = @{
            enabled = $true
            actions = @("stats", "backup", "log")
        }
    }
    backup = @{
        enabled = $true
        retention_days = 7
    }
    logging = @{
        enabled = $true
        level = "info"
    }
}

$hookConfig | ConvertTo-Json -Depth 4 | Set-Content ".git/hooks/config.json"

Write-Host "✅ Git Hooks configurados com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Faça um commit de teste para verificar os hooks" -ForegroundColor White
Write-Host "   2. Verifique os logs em .git/hooks/logs/" -ForegroundColor White
Write-Host "   3. Configure o sistema de watch com: .\scripts\auto-sync-github.ps1 -Watch" -ForegroundColor White
Write-Host ""