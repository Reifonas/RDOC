# Configurações
$RepoPath = "C:\Users\Marcos\Documents\GitHub\RDO"
$Branch   = "main"
$IntervalSeconds = 15  # ajuste se quiser mais/menos frequente

# Loop infinito: verifica mudanças, commita e faz push
while ($true) {
  try {
    $status = git -C $RepoPath status --porcelain
    if ($LASTEXITCODE -ne 0) {
      Write-Host "Git retornou erro. Verifique se o repositório está correto." -ForegroundColor Yellow
    } elseif ($status) {
      Write-Host "Alterações detectadas. Comitando e enviando para $Branch..." -ForegroundColor Cyan
      git -C $RepoPath add -A | Out-Null
      # Evita commit vazio
      $diffCached = git -C $RepoPath diff --cached --name-only
      if ($diffCached) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git -C $RepoPath commit -m "chore: autosync from Trae $timestamp" | Out-Null
        
        # Faz pull antes do push para evitar rejeições
        Write-Host "Fazendo pull de $Branch..." -ForegroundColor Yellow
        git -C $RepoPath pull origin $Branch
        if ($LASTEXITCODE -ne 0) {
          Write-Host "Falha no pull. Pode haver conflitos de merge." -ForegroundColor Red
          Write-Host "Tentando fazer merge automático..." -ForegroundColor Yellow
          git -C $RepoPath merge --no-edit origin/$Branch
          if ($LASTEXITCODE -ne 0) {
            Write-Host "Conflitos de merge detectados. Intervenção manual necessária." -ForegroundColor Red
            continue
          }
        }
        
        # Agora faz o push
        git -C $RepoPath push origin $Branch
        if ($LASTEXITCODE -eq 0) {
          Write-Host "Push OK para $Branch em $timestamp" -ForegroundColor Green
        } else {
          Write-Host "Falha no push. Verifique autenticação/regras da branch." -ForegroundColor Red
        }
      }
    }
  } catch {
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
  }
  Start-Sleep -Seconds $IntervalSeconds
}