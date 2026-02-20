# ✅ CHECKLIST DE IMPLEMENTAÇÃO - SAAS MULTI-TENANT

## 📋 COMO USAR ESTE CHECKLIST

Marque cada item com `[x]` conforme for completando.
Exemplo: `- [x] Item concluído`

---

## 🗄️ FASE 1: BANCO DE DADOS

### Aplicar Migrations
- [ ] Linkar projeto Supabase: `supabase link --project-ref bbyzrywmgjiufqtnkslu`
- [ ] Aplicar migrations: `supabase db push`
- [ ] Verificar tabelas criadas: `node check-supabase-status.js`
- [ ] Confirmar RLS habilitado em todas as tabelas
- [ ] Testar criação de organização demo
- [ ] Verificar triggers funcionando

### Validar Estrutura
- [ ] 16 tabelas criadas
- [ ] Índices criados corretamente
- [ ] Funções SQL funcionando
- [ ] Políticas RLS ativas
- [ ] Sem erros no console do Supabase

**Tempo estimado:** 30-60 minutos

---

## 📝 FASE 2: TIPOS TYPESCRIPT

### Atualizar Tipos
- [ ] Gerar tipos do Supabase: `supabase gen types typescript`
- [ ] Atualizar `src/types/database.types.ts`
- [ ] Adicionar tipo `Organization`
- [ ] Adicionar tipo `OrganizacaoUsuario`
- [ ] Adicionar tipo `Convite`
- [ ] Atualizar tipos existentes com `organizacao_id`
- [ ] Verificar compilação sem erros: `npm run check`

### Criar Novos Tipos
- [ ] Criar `src/types/organization.types.ts`
- [ ] Definir `OrganizationContextType`
- [ ] Definir `UserRole` enum
- [ ] Definir `PlanType` enum
- [ ] Exportar todos os tipos

**Tempo estimado:** 1-2 horas

---

## 🎯 FASE 3: CONTEXTO DE ORGANIZAÇÃO

### Criar Context
- [ ] Criar arquivo `src/contexts/OrganizationContext.tsx`
- [ ] Implementar `OrganizationProvider`
- [ ] Implementar hook `useOrganization()`
- [ ] Adicionar estado de loading
- [ ] Adicionar estado de error
- [ ] Implementar `switchOrganization()`
- [ ] Implementar `updateOrganization()`
- [ ] Implementar `checkQuota()`

### Integrar no App
- [ ] Importar em `src/App.tsx`
- [ ] Envolver aplicação com `<OrganizationProvider>`
- [ ] Testar carregamento de organização
- [ ] Testar troca de organização
- [ ] Adicionar loading state na UI

**Tempo estimado:** 2-3 horas

---

## 🛣️ FASE 4: ROTEAMENTO COM SLUG

### Atualizar Rotas
- [ ] Modificar `src/config/routes.tsx`
- [ ] Adicionar `:orgSlug` em todas as rotas
- [ ] Atualizar paths: `/dashboard` → `/:orgSlug/dashboard`
- [ ] Atualizar todos os `Link` components
- [ ] Atualizar todos os `navigate()` calls

### Criar ProtectedOrgRoute
- [ ] Criar `src/components/auth/ProtectedOrgRoute.tsx`
- [ ] Extrair slug da URL
- [ ] Validar acesso do usuário à organização
- [ ] Carregar organização no context
- [ ] Redirecionar se não tiver acesso
- [ ] Mostrar loading enquanto valida

### Testar Navegação
- [ ] Testar acesso com slug válido
- [ ] Testar acesso com slug inválido
- [ ] Testar acesso sem permissão
- [ ] Testar navegação entre páginas
- [ ] Testar deep links

**Tempo estimado:** 3-4 horas

---

## 🔍 FASE 5: ATUALIZAR QUERIES

### Criar Helpers
- [ ] Criar `src/lib/supabase-tenant.ts`
- [ ] Implementar `useTenantQuery()`
- [ ] Implementar `useTenantMutation()`
- [ ] Implementar `getTenantData()`
- [ ] Adicionar validação de `organizacao_id`

### Atualizar Hooks Existentes
- [ ] Atualizar `src/hooks/useSupabaseData.ts`
- [ ] Atualizar `src/hooks/queries/useObras.ts`
- [ ] Atualizar `src/hooks/queries/useRDOs.ts`
- [ ] Atualizar `src/hooks/queries/useTarefas.ts`
- [ ] Adicionar `.eq('organizacao_id', orgId)` em todas as queries

### Atualizar Stores
- [ ] Atualizar `src/stores/useObraStore.ts`
- [ ] Atualizar `src/stores/useTaskStore.ts`
- [ ] Atualizar `src/stores/useUserStore.ts`
- [ ] Remover dados globais
- [ ] Filtrar por organização

### Atualizar Páginas
- [ ] Atualizar `src/pages/Dashboard.tsx`
- [ ] Atualizar `src/pages/Cadastros.tsx`
- [ ] Atualizar `src/pages/CreateRDO.tsx`
- [ ] Atualizar `src/pages/ObraDetails.tsx`
- [ ] Atualizar `src/pages/Tasks.tsx`
- [ ] Atualizar todas as outras páginas

### Validar Queries
- [ ] Verificar que TODAS as queries incluem `organizacao_id`
- [ ] Testar isolamento de dados
- [ ] Verificar performance
- [ ] Adicionar error handling

**Tempo estimado:** 1-2 dias

---

## 🚪 FASE 6: ONBOARDING - SIGNUP

### Criar Página de Signup
- [ ] Criar `src/pages/SignupOrganization.tsx`
- [ ] Criar formulário com validação
- [ ] Campo: Nome da organização
- [ ] Campo: Slug (validar unicidade em tempo real)
- [ ] Campo: Email
- [ ] Campo: Nome do usuário
- [ ] Campo: Senha
- [ ] Campo: CNPJ (opcional)

### Implementar Lógica
- [ ] Validar slug disponível
- [ ] Criar conta no Supabase Auth
- [ ] Chamar `criar_organizacao_com_owner()`
- [ ] Tratar erros
- [ ] Mostrar loading
- [ ] Redirecionar para `/:slug/dashboard`

### Criar Página de Boas-Vindas
- [ ] Criar `src/pages/Welcome.tsx`
- [ ] Tour guiado da aplicação
- [ ] Configuração inicial
- [ ] Convidar primeiro membro

### Testar Fluxo
- [ ] Testar signup completo
- [ ] Testar validação de campos
- [ ] Testar slug duplicado
- [ ] Testar email duplicado
- [ ] Testar redirecionamento

**Tempo estimado:** 4-6 horas

---

## 👥 FASE 7: SISTEMA DE CONVITES

### Criar Página de Gerenciamento
- [ ] Criar `src/pages/TeamManagement.tsx`
- [ ] Listar membros da equipe
- [ ] Mostrar role de cada membro
- [ ] Botão "Convidar Membro"
- [ ] Listar convites pendentes
- [ ] Opção de cancelar convite

### Criar Modal de Convite
- [ ] Criar `src/components/InviteModal.tsx`
- [ ] Campo: Email
- [ ] Campo: Role (select)
- [ ] Validar email
- [ ] Chamar `criar_convite()`
- [ ] Gerar link de convite
- [ ] Copiar link para clipboard
- [ ] Enviar email (opcional)

### Criar Página de Aceitar Convite
- [ ] Criar `src/pages/AcceptInvite.tsx`
- [ ] Rota: `/convite/:token`
- [ ] Validar token
- [ ] Mostrar informações da organização
- [ ] Formulário de cadastro
- [ ] Chamar `aceitar_convite()`
- [ ] Redirecionar para dashboard

### Implementar Envio de Email
- [ ] Configurar Supabase Email Templates
- [ ] Template de convite
- [ ] Incluir link de aceite
- [ ] Incluir informações da organização
- [ ] Testar envio

### Testar Fluxo Completo
- [ ] Admin cria convite
- [ ] Email é enviado
- [ ] Convidado clica no link
- [ ] Convidado cria conta
- [ ] Convidado é vinculado à organização
- [ ] Convidado acessa dashboard

**Tempo estimado:** 6-8 horas

---

## ⚙️ FASE 8: DASHBOARD DE ADMIN

### Criar Página Principal
- [ ] Criar `src/pages/OrganizationSettings.tsx`
- [ ] Criar navegação por abas
- [ ] Aba: Geral
- [ ] Aba: Equipe
- [ ] Aba: Plano e Uso
- [ ] Aba: Personalização

### Aba: Geral
- [ ] Campo: Nome da organização
- [ ] Campo: Razão social
- [ ] Campo: CNPJ
- [ ] Campo: Email de contato
- [ ] Campo: Telefone
- [ ] Upload de logo
- [ ] Seletor de cor primária
- [ ] Seletor de cor secundária
- [ ] Botão salvar

### Aba: Equipe
- [ ] Reutilizar `TeamManagement`
- [ ] Listar membros
- [ ] Editar role de membro
- [ ] Desativar membro
- [ ] Convidar novo membro

### Aba: Plano e Uso
- [ ] Mostrar plano atual
- [ ] Mostrar limites do plano
- [ ] Mostrar uso atual
- [ ] Gráficos de uso
- [ ] Botão "Fazer Upgrade"
- [ ] Histórico de uso

### Aba: Personalização
- [ ] Gerenciar tipos de atividade
- [ ] Gerenciar funções de mão de obra
- [ ] Gerenciar tipos de equipamento
- [ ] Gerenciar condições climáticas
- [ ] Gerenciar tipos de ocorrência
- [ ] Configurações de aprovação
- [ ] Configurações de notificações

### Testar Funcionalidades
- [ ] Atualizar informações gerais
- [ ] Upload de logo
- [ ] Alterar cores
- [ ] Gerenciar equipe
- [ ] Visualizar uso
- [ ] Editar configurações

**Tempo estimado:** 1-2 dias

---

## 📊 FASE 9: VALIDAÇÃO DE QUOTAS

### Criar Quota Checker
- [ ] Criar `src/lib/quota-checker.ts`
- [ ] Implementar `checkQuota()`
- [ ] Implementar `getUsage()`
- [ ] Implementar `getLimits()`
- [ ] Implementar `getUsagePercentage()`

### Integrar em Operações
- [ ] Validar antes de criar obra
- [ ] Validar antes de criar RDO
- [ ] Validar antes de convidar usuário
- [ ] Validar antes de fazer upload

### Criar Componentes de UI
- [ ] Criar `src/components/QuotaWarning.tsx`
- [ ] Modal de limite atingido
- [ ] Banner de aviso (80% do limite)
- [ ] Indicador de uso no dashboard
- [ ] Link para upgrade de plano

### Testar Validações
- [ ] Testar criação dentro do limite
- [ ] Testar bloqueio ao atingir limite
- [ ] Testar mensagens de erro
- [ ] Testar avisos de 80%
- [ ] Testar upgrade de plano

**Tempo estimado:** 4-6 horas

---

## 🎨 FASE 10: PERSONALIZAÇÃO

### Implementar Tema Dinâmico
- [ ] Criar `src/hooks/useTheme.ts`
- [ ] Aplicar cores da organização
- [ ] Aplicar logo da organização
- [ ] Atualizar CSS variables
- [ ] Testar em todas as páginas

### Carregar Configurações Dinâmicas
- [ ] Criar `src/hooks/useOrgConfig.ts`
- [ ] Carregar tipos de atividade
- [ ] Carregar funções de mão de obra
- [ ] Carregar tipos de equipamento
- [ ] Carregar condições climáticas
- [ ] Cachear configurações

### Aplicar em Formulários
- [ ] Atualizar formulário de RDO
- [ ] Usar tipos de atividade da org
- [ ] Usar funções da org
- [ ] Usar equipamentos da org
- [ ] Usar condições climáticas da org

### Testar Personalização
- [ ] Alterar cores e verificar aplicação
- [ ] Alterar logo e verificar exibição
- [ ] Adicionar tipo de atividade customizado
- [ ] Usar tipo customizado em RDO
- [ ] Verificar isolamento entre orgs

**Tempo estimado:** 3-4 horas

---

## 🧪 FASE 11: TESTES

### Testes de Isolamento
- [ ] Criar 2 organizações de teste
- [ ] Criar usuários em cada uma
- [ ] Criar obras em cada uma
- [ ] Verificar que Org A não vê dados de Org B
- [ ] Verificar que Org B não vê dados de Org A
- [ ] Testar com diferentes roles

### Testes de Permissões
- [ ] Testar como owner
- [ ] Testar como admin
- [ ] Testar como engenheiro
- [ ] Testar como mestre de obra
- [ ] Testar como usuário básico
- [ ] Verificar restrições por role

### Testes de Quotas
- [ ] Criar organização com plano basic
- [ ] Atingir limite de usuários
- [ ] Atingir limite de obras
- [ ] Atingir limite de RDOs
- [ ] Verificar bloqueios
- [ ] Verificar mensagens

### Testes de Fluxo
- [ ] Signup completo
- [ ] Login e acesso
- [ ] Convite e aceite
- [ ] Criação de obra
- [ ] Criação de RDO
- [ ] Navegação entre páginas

### Testes de Performance
- [ ] Medir tempo de carregamento
- [ ] Verificar queries N+1
- [ ] Verificar uso de índices
- [ ] Testar com muitos dados
- [ ] Otimizar queries lentas

**Tempo estimado:** 1-2 dias

---

## 🚀 FASE 12: DEPLOY E PRODUÇÃO

### Preparar para Produção
- [ ] Revisar variáveis de ambiente
- [ ] Configurar domínio customizado
- [ ] Configurar SSL
- [ ] Configurar CORS
- [ ] Configurar rate limiting

### Deploy
- [ ] Build de produção: `npm run build`
- [ ] Testar build localmente
- [ ] Deploy no Vercel/Netlify
- [ ] Verificar funcionamento
- [ ] Testar em diferentes dispositivos

### Monitoramento
- [ ] Configurar Sentry (error tracking)
- [ ] Configurar analytics
- [ ] Configurar logs
- [ ] Configurar alertas
- [ ] Configurar backups

### Documentação
- [ ] Documentar API
- [ ] Documentar fluxos
- [ ] Criar guia do usuário
- [ ] Criar guia do admin
- [ ] Documentar troubleshooting

**Tempo estimado:** 1 dia

---

## 📈 RESUMO DE PROGRESSO

### Fases Concluídas: 0/12

- [ ] Fase 1: Banco de Dados
- [ ] Fase 2: Tipos TypeScript
- [ ] Fase 3: Contexto de Organização
- [ ] Fase 4: Roteamento com Slug
- [ ] Fase 5: Atualizar Queries
- [ ] Fase 6: Onboarding - Signup
- [ ] Fase 7: Sistema de Convites
- [ ] Fase 8: Dashboard de Admin
- [ ] Fase 9: Validação de Quotas
- [ ] Fase 10: Personalização
- [ ] Fase 11: Testes
- [ ] Fase 12: Deploy e Produção

### Tempo Total Estimado: 15-20 dias úteis

---

## 🎯 PRÓXIMO PASSO IMEDIATO

**COMEÇAR AGORA:**
```bash
# 1. Linkar projeto Supabase
supabase link --project-ref bbyzrywmgjiufqtnkslu

# 2. Aplicar migrations
supabase db push

# 3. Verificar
node check-supabase-status.js
```

**Após concluir, marque:**
- [x] Fase 1: Banco de Dados ✅

---

## 💡 DICAS

- ✅ Faça commits frequentes
- ✅ Teste cada fase antes de avançar
- ✅ Documente decisões importantes
- ✅ Peça ajuda quando travar
- ✅ Celebre cada fase concluída! 🎉

---

**Boa sorte na implementação! 🚀**
