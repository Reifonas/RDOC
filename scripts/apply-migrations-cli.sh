#!/bin/bash

# Script para aplicar migrations usando Supabase CLI

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║   🚀 APLICANDO MIGRATIONS - SUPABASE RDO                     ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Project ID
PROJECT_ID="ympbgdymeesivfajmgat"

echo "📍 Projeto: $PROJECT_ID"
echo ""

# 1. Linkar projeto
echo "1️⃣ Linkando projeto Supabase..."
supabase link --project-ref $PROJECT_ID

if [ $? -ne 0 ]; then
    echo "❌ Erro ao linkar projeto"
    exit 1
fi

echo "✅ Projeto linkado com sucesso!"
echo ""

# 2. Aplicar migrations
echo "2️⃣ Aplicando migrations..."
supabase db push

if [ $? -ne 0 ]; then
    echo "❌ Erro ao aplicar migrations"
    exit 1
fi

echo "✅ Migrations aplicadas com sucesso!"
echo ""

# 3. Verificar
echo "3️⃣ Verificando..."
node check-supabase-status.js

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║   ✅ TUDO PRONTO!                                             ║"
echo "║                                                               ║"
echo "║   Próximo passo: npm run dev                                  ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
