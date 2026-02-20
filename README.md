# 🏗️ TSteelRDO - Sistema de Gestão de Diário de Obra (RDO)

Este é um sistema multi-tenant para gestão de canteiros de obras, construído com React, Vite e Supabase.

## 🚀 Como Começar

1. **Instalar dependências:**

   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   - O arquivo `.env` já deve estar configurado na raiz.

3. **Rodar em desenvolvimento:**

   ```bash
   npm run dev
   ```

4. **Rodar scripts de utilidade (Banco/Deploy):**

   ```bash
   # Verificar status do Supabase
   node scripts/check-supabase-status.js
   
   # Aplicar Migrations (modo Manual/Script)
   node scripts/deploy-migrations.js
   ```

## 📂 Estrutura do Projeto

- **`src/`**: Código fonte da aplicação frontend (React).
  - `components/`: Componentes reutilizáveis.
  - `pages/`: Páginas da aplicação.
  - `hooks/`: Custom hooks.
  - `lib/`: Configurações de serviços (Supabase cliente, etc).
  
- **`documentation/`**: Documentação detalhada, arquitetura, manuais e guias de implementação (antigos e novos).
  - Consulte `documentation/ARQUITETURA_MULTI_TENANT.md` para entender o modelo de dados.

- **`scripts/`**: Scripts de automação, deploy, verificação de status e testes manuais.

- **`database_scripts/`**: Backups, scripts SQL manuais e dumps.

- **`supabase/`**: Configurações oficiais do Supabase (migrations, seeds).

## 🛠️ Tecnologias

- **Frontend**: React + Vite + TypeScript
- **Estilização**: TailwindCSS
- **Backend/Banco**: Supabase (PostgreSQL + Auth + Storage)
- **Mobile**: Capacitor (Configurado para Android/iOS)

## 🔐 Autenticação e Multi-Tenancy

O sistema utiliza RLS (Row Level Security) nativo do Postgres e Supabase Auth para garantir isolamento total dos dados entre organizações (Tenants).

---

> _Para mais detalhes, consulte a pasta `documentation/`._
