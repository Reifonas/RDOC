#!/usr/bin/env pwsh

# Script para aplicar migrations usando Supabase CLI (Windows)

Write-Output "`n╔═══════════════════════════════════════════════════════════════╗"
Write-Output "║                                                               ║"
Write-Output "║   🚀 APLICANDO MIGRATIONS - SUPABASE RDO                     ║"
Write-Output "║                                                               ║"
Write-Output "╚═══════════════════════════════════════════════════════════════╝`n"

# Project ID
$PROJECT_ID = "mnwrnblzabxgqtgjwxgl"

Write-Output "📍 Projeto: $PROJECT_ID`n"

# 1. Linkar projeto
Write-Output "1️⃣ Linkando projeto Supabase..."
supabase link --project-ref $PROJECT_ID

if ($LASTEXITCODE -ne 0) {
    Write-Output "❌ Erro ao linkar projeto"
    exit 1
}

Write-Output "✅ Projeto linkado com sucesso!`n"

# 2. Aplicar migrations
Write-Output "2️⃣ Aplicando migrations..."
supabase db push

if ($LASTEXITCODE -ne 0) {
    Write-Output "❌ Erro ao aplicar migrations"
    exit 1
}

Write-Output "✅ Migrations aplicadas com sucesso!`n"

# 3. Verificar
Write-Output "3️⃣ Verificando..."
node check-supabase-status.js

Write-Output "`n╔═══════════════════════════════════════════════════════════════╗"
Write-Output "║                                                               ║"
Write-Output "║   ✅ TUDO PRONTO!                                             ║"
Write-Output "║                                                               ║"
Write-Output "║   Próximo passo: npm run dev                                  ║"
Write-Output "║                                                               ║"
Write-Output "╚═══════════════════════════════════════════════════════════════╝`n"
