# Parâmetros de linha de comando
param(
    [switch]$Once,
    [int]$Interval = 15,
    [string]$BranchName = "main"
)

# Configurações
$PossiblePaths = @(
  "c:\Users\Administrator\Documents\GitHub\RDO-D",
  "c:\Users\Marcos\Documents\GitHub\RDO-D"
)
$Branch = $BranchName
$IntervalSeconds = $Interval
$RunOnce = $Once.IsPresent
$RemoteUrl = "https://github.com/Reifonas/RDO-D.git"

# Função para verificar se é um repositório Git válido
function Test-GitRepository($path) {
    if (-not (Test-Path $path)) { return $false }
    if (-not (Test-Path (Join-Path $path ".git"))) { return $false }
    
    $currentDir = Get-Location
    try {
        Set-Location $path
        $gitStatus = git status 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    } finally {
        Set-Location $currentDir
    }
}

# Detecta automaticamente o caminho correto
$RepoPath = $null
foreach ($path in $PossiblePaths) {
    if (Test-GitRepository $path) {
        $RepoPath = $path
        Write-Host "Usando repositório em: $RepoPath" -ForegroundColor Green
        break
    }
}

if (-not $RepoPath) {
    Write-Host "ERRO: Nenhum repositório Git válido foi encontrado:" -ForegroundColor Red
    foreach ($path in $PossiblePaths) {
        $exists = Test-Path $path
        $isGit = if ($exists) { Test-Path (Join-Path $path ".git") } else { $false }
        Write-Host "  - $path (Existe: $exists, Git: $isGit)" -ForegroundColor Yellow
    }
    Write-Host "Verifique se o repositório existe e é um repositório Git válido." -ForegroundColor Red
    exit 1
}

# Função para verificar e configurar o remote
function Ensure-RemoteConfiguration {
    Write-Host "Verificando configuração do remote..." -ForegroundColor Cyan
    
    $currentRemote = git -C $RepoPath remote get-url origin 2>&1
    if ($LASTEXITCODE -eq 0 -and $currentRemote -ne $RemoteUrl) {
        Write-Host "Atualizando remote de '$currentRemote' para '$RemoteUrl'" -ForegroundColor Yellow
        git -C $RepoPath remote set-url origin $RemoteUrl
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Remote atualizado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "Erro ao atualizar remote." -ForegroundColor Red
            return $false
        }
    } elseif ($LASTEXITCODE -ne 0) {
        Write-Host "Configurando remote para '$RemoteUrl'" -ForegroundColor Yellow
        git -C $RepoPath remote add origin $RemoteUrl
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Remote configurado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "Erro ao configurar remote." -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "Remote já está configurado corretamente: $RemoteUrl" -ForegroundColor Green
    }
    return $true
}

# Função para sincronizar o repositório
function Sync-Repository {
    Write-Host "Verificando alterações no repositório..." -ForegroundColor Cyan
    
    # Garante que o remote está configurado corretamente
    if (-not (Ensure-RemoteConfiguration)) {
        return $false
    }
    
    # Verifica o status do repositório
    $remoteStatus = git -C $RepoPath fetch --dry-run 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Aviso: Não foi possível verificar o repositório remoto." -ForegroundColor Yellow
    }
    
    $status = git -C $RepoPath status --porcelain
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Git retornou erro. Verifique se o repositório está correto." -ForegroundColor Red
        return $false
    }
    
    if (-not $status) {
        Write-Host "Nenhuma alteração detectada." -ForegroundColor Gray
        return $true
    }
    
    Write-Host "Alterações detectadas:" -ForegroundColor Yellow
    $status | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    
    Write-Host "Comitando e enviando para $Branch..." -ForegroundColor Cyan
    git -C $RepoPath add -A | Out-Null
    
    # Evita commit vazio
    $diffCached = git -C $RepoPath diff --cached --name-only
    if (-not $diffCached) {
        Write-Host "Nenhuma alteração para commit após staging." -ForegroundColor Gray
        return $true
    }
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $commitResult = git -C $RepoPath commit -m "chore: autosync from Trae $timestamp" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erro no commit: $commitResult" -ForegroundColor Red
        return $false
    }
    
    # Faz pull antes do push para evitar rejeições
    Write-Host "Fazendo pull de $Branch..." -ForegroundColor Yellow
    $pullResult = git -C $RepoPath pull origin $Branch 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Falha no pull: $pullResult" -ForegroundColor Red
        Write-Host "Tentando fazer merge automático..." -ForegroundColor Yellow
        $mergeResult = git -C $RepoPath merge --no-edit origin/$Branch 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Conflitos de merge detectados: $mergeResult" -ForegroundColor Red
            Write-Host "Intervenção manual necessária." -ForegroundColor Red
            return $false
        }
    }
    
    # Agora faz o push
    $pushResult = git -C $RepoPath push origin $Branch 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Push realizado com sucesso para $Branch em $timestamp" -ForegroundColor Green
        return $true
    } else {
        Write-Host "Falha no push: $pushResult" -ForegroundColor Red
        Write-Host "Verifique autenticação/regras da branch." -ForegroundColor Red
        return $false
    }
}

# Loop principal
do {
    try {
        $syncResult = Sync-Repository
        if (-not $syncResult) {
            Write-Host "Sincronização falhou. Tentando novamente em $IntervalSeconds segundos..." -ForegroundColor Red
        }
    } catch {
        Write-Host "Erro inesperado: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Continuando em $IntervalSeconds segundos..." -ForegroundColor Yellow
    }
    
    if ($RunOnce) {
        Write-Host "Execução única concluída." -ForegroundColor Green
        break
    }
    
    Write-Host "Próxima verificação em $IntervalSeconds segundos. Pressione Ctrl+C para parar." -ForegroundColor Gray
    Start-Sleep -Seconds $IntervalSeconds
} while (-not $RunOnce)

Write-Host "Script finalizado." -ForegroundColor Green