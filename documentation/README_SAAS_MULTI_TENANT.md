# 🏗️ RDO - Sistema SaaS Multi-Tenant

## 📖 Sobre o Projeto

Sistema de gestão de RDO (Relatório Diário de Obra) focado em estruturas metálicas, transformado em modelo SaaS multi-tenant para permitir que múltiplas empresas de construção usem a mesma plataforma de forma isolada e segura.

---

## 📚 DOCUMENTAÇÃO COMPLETA

### 🎯 **Comece por aqui:**
1. **[RESUMO_ACOES_PRIORITARIAS.md](./RESUMO_ACOES_PRIORITARIAS.md)** ⭐
   - Visão geral rápida
   - Próximos passos imediatos
   - Ordem de implementação

2. **[CHECKLIST_IMPLEMENTACAO.md](./CHECKLIST_IMPLEMENTACAO.md)** ✅
   - Checklist interativo
   - Marque conforme avança
   - Estimativas de tempo

### 📋 **Documentação Técnica:**
3. **[PLANO_SAAS_MULTI_TENANT.md](./PLANO_SAAS_MULTI_TENANT.md)**
   - Plano completo detalhado
   - Todas as fases explicadas
   - Modelo de negócio sugerido

4. **[ARQUITETURA_MULTI_TENANT.md](./ARQUITETURA_MULTI_TENANT.md)**
   - Diagramas de arquitetura
   - Fluxos de dados
   - Explicação do RLS

5. **[INSTRUCOES_DEPLOY_SUPABASE.md](./INSTRUCOES_DEPLOY_SUPABASE.md)**
   - Como aplicar migrations
   - Opções de deploy
   - Troubleshooting

---

## 🚀 INÍCIO RÁPIDO

### Pré-requisitos
- Node.js 18+
- Supabase CLI instalado
- Conta no Supabase
- Projeto RDO criado no Supabase

### 1️⃣ Aplicar Migrations (PRIMEIRO PASSO)

```bash
# Linkar projeto
supabase link --project-ref bbyzrywmgjiufqtnkslu

# Aplicar migrations
supabase db push

# Verificar
node check-supabase-status.js
```

### 2️⃣ Instalar Dependências

```bash
npm install
```

### 3️⃣ Configurar Variáveis de Ambiente

Arquivo `.env` já está configurado com:
```env
VITE_SUPABASE_URL=https://bbyzrywmgjiufqtnkslu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 4️⃣ Iniciar Desenvolvimento

```bash
npm run dev
```

---

## 📁 ESTRUTURA DO PROJETO

```
├── supabase/
│   └── migrations/              # Migrations SQL
│       ├── 20241202000001_create_multi_tenant_schema.sql
│       ├── 20241202000002_create_functions_and_triggers.sql
│       ├── 20241202000003_create_rls_policies.sql
│       └── 20241202000004_seed_initial_data.sql
│
├── src/
│   ├── components/              # Componentes React
│   ├── contexts/                # Contexts (Auth, Organization)
│   ├── hooks/                   # Custom hooks
│   ├── lib/                     # Utilitários (Supabase, etc)
│   ├── pages/                   # Páginas da aplicação
│   ├── stores/                  # Zustand stores
│   ├── types/                   # TypeScript types
│   └── utils/                   # Funções auxiliares
│
├── docs/                        # Documentação (este arquivo)
│   ├── RESUMO_ACOES_PRIORITARIAS.md
│   ├── CHECKLIST_IMPLEMENTACAO.md
│   ├── PLANO_SAAS_MULTI_TENANT.md
│   ├── ARQUITETURA_MULTI_TENANT.md
│   └── INSTRUCOES_DEPLOY_SUPABASE.md
│
├── check-supabase-status.js     # Script de verificação
├── apply-migrations.js          # Script de deploy
└── package.json
```

---

## 🗄️ SCHEMA DO BANCO DE DADOS

### Tabelas Principais

#### **organizacoes** (Tenants)
- Cada empresa é uma organização
- Slug único para URLs amigáveis
- Planos: trial, basic, professional, enterprise
- Limites configuráveis por plano
- Personalização (logo, cores, configurações)

#### **usuarios**
- Vinculados a uma organização
- Perfil estendido do auth.users

#### **organizacao_usuarios**
- Relacionamento N:N entre usuários e organizações
- Roles: owner, admin, engenheiro, mestre_obra, usuario
- Permissões customizáveis

#### **convites**
- Sistema de onboarding
- Token único e seguro
- Expiração configurável

#### **obras, rdos, tarefas, etc.**
- Todas as tabelas existentes
- Adicionado `organizacao_id` para isolamento
- RLS habilitado

### Segurança (RLS)

Todas as tabelas têm Row Level Security habilitado:
- Usuários só veem dados da própria organização
- Validação automática em todas as queries
- Impossível acessar dados de outra organização

---

## 🎯 FUNCIONALIDADES PRINCIPAIS

### ✅ Já Implementado (Backend)
- [x] Schema multi-tenant completo
- [x] Row Level Security (RLS)
- [x] Sistema de roles e permissões
- [x] Sistema de convites
- [x] Validação de quotas por plano
- [x] Triggers automáticos
- [x] Funções auxiliares

### 🚧 A Implementar (Frontend)
- [ ] OrganizationContext
- [ ] Roteamento com slug
- [ ] Signup de organização
- [ ] Sistema de convites (UI)
- [ ] Dashboard de admin
- [ ] Validação de quotas (UI)
- [ ] Personalização de tema
- [ ] Configurações dinâmicas

---

## 🔐 SEGURANÇA

### Row Level Security (RLS)
Todas as tabelas têm políticas RLS que garantem:
- Isolamento total entre organizações
- Validação no nível do banco de dados
- Não depende do frontend

### Roles e Permissões
- **Owner**: Acesso total, pode deletar organização
- **Admin**: Gerencia usuários, obras e configurações
- **Engenheiro**: Cria obras, aprova RDOs
- **Mestre de Obra**: Cria e edita RDOs
- **Usuário**: Visualização e tarefas básicas

### Tokens e Convites
- Tokens únicos e seguros
- Expiração configurável (padrão: 7 dias)
- Validação de email

---

## 📊 PLANOS E LIMITES

### Trial (14 dias grátis)
- 5 usuários
- 3 obras
- 100 RDOs/mês
- 500 MB storage

### Basic (R$ 99/mês)
- 10 usuários
- 5 obras
- 300 RDOs/mês
- 2 GB storage

### Professional (R$ 299/mês)
- 30 usuários
- 15 obras
- 1000 RDOs/mês
- 10 GB storage
- Personalização de marca

### Enterprise (Customizado)
- Ilimitado
- API dedicada
- Suporte 24/7

---

## 🛠️ SCRIPTS ÚTEIS

### Desenvolvimento
```bash
npm run dev          # Iniciar dev server
npm run build        # Build de produção
npm run preview      # Preview do build
npm run check        # Type checking
```

### Supabase
```bash
supabase link        # Linkar projeto
supabase db push     # Aplicar migrations
supabase db pull     # Baixar schema
supabase gen types   # Gerar tipos TypeScript
```

### Verificação
```bash
node check-supabase-status.js    # Verificar banco
node apply-migrations.js         # Aplicar migrations
```

---

## 📈 ROADMAP

### Fase 1: Fundação (Semana 1)
- [x] Schema multi-tenant
- [ ] OrganizationContext
- [ ] Roteamento com slug
- [ ] Atualizar queries

### Fase 2: Onboarding (Semana 2)
- [ ] Signup de organização
- [ ] Sistema de convites
- [ ] Dashboard de admin

### Fase 3: Refinamento (Semana 3)
- [ ] Validação de quotas
- [ ] Personalização
- [ ] Testes completos

### Fase 4: Produção (Semana 4)
- [ ] Deploy
- [ ] Monitoramento
- [ ] Documentação final

---

## 🧪 TESTES

### Testar Isolamento
```bash
# Criar 2 organizações
# Verificar que não há vazamento de dados
```

### Testar Permissões
```bash
# Testar cada role
# Verificar restrições
```

### Testar Quotas
```bash
# Atingir limites
# Verificar bloqueios
```

---

## 📞 SUPORTE

### Documentação
- Veja os arquivos .md na raiz do projeto
- Cada fase tem explicação detalhada

### Problemas Comuns
- **Migrations falhando**: Veja `INSTRUCOES_DEPLOY_SUPABASE.md`
- **RLS bloqueando queries**: Verifique políticas
- **Tipos TypeScript**: Regenere com `supabase gen types`

### Contato
- Abra uma issue no repositório
- Consulte a documentação técnica
- Revise os exemplos de código

---

## 🎉 CONTRIBUINDO

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📄 LICENÇA

Este projeto está sob a licença MIT. Veja o arquivo `LICENCE.md` para mais detalhes.

---

## 🙏 AGRADECIMENTOS

- Supabase pela plataforma incrível
- React e Vite pela base sólida
- Comunidade open source

---

## 📊 STATUS DO PROJETO

**Versão:** 2.0.0-alpha (Multi-tenant)
**Status:** Em desenvolvimento
**Última atualização:** 02/12/2024

### Progresso Geral: 40%

- ✅ Backend (100%)
- 🚧 Frontend (0%)
- 🚧 Testes (0%)
- 🚧 Documentação (80%)

---

**Pronto para transformar seu RDO em um SaaS de sucesso! 🚀**

Para começar, veja: [RESUMO_ACOES_PRIORITARIAS.md](./RESUMO_ACOES_PRIORITARIAS.md)
