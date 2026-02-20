# Plano de Consolidação do Gerenciamento de Estado

## Problemas Identificados

### 1. Duplicação de Funcionalidades
- **Zustand Stores**: `useUserStore`, `useObraStore`, `useTaskStore`
- **React Query Hooks**: `useUsers`, `useObras`, `useRdos`
- Ambos fazem operações CRUD idênticas
- Duplicação de lógica de loading, error handling
- Cache duplicado e potencialmente inconsistente

### 2. Complexidade Desnecessária
- Múltiplos seletores derivados nos stores
- Lógica de sincronização manual nos stores
- Estado local persistido que pode ficar desatualizado

## Estratégia de Consolidação

### Fase 1: Manter React Query + Zustand Focado

**React Query** (para operações de servidor):
- Todas as operações CRUD (Create, Read, Update, Delete)
- Cache automático e inteligente
- Sincronização com servidor
- Estados de loading/error automáticos
- Invalidação de cache otimizada

**Zustand** (para estado da aplicação):
- Estado de UI (tema, idioma, configurações)
- Estado de navegação e filtros
- Estado de sincronização offline
- Notificações e alertas
- Configurações do usuário

### Fase 2: Migração Gradual

1. **Remover operações CRUD dos Zustand stores**
2. **Manter apenas estado de UI no Zustand**
3. **Migrar componentes para usar React Query**
4. **Remover hooks duplicados**
5. **Otimizar configurações do React Query**

### Fase 3: Limpeza Final

1. **Remover stores não utilizados**
2. **Consolidar seletores**
3. **Otimizar imports**
4. **Atualizar documentação**

## Benefícios Esperados

- ✅ Redução de ~60% do código de gerenciamento de estado
- ✅ Cache mais eficiente e consistente
- ✅ Melhor performance com menos re-renders
- ✅ Sincronização automática com servidor
- ✅ Código mais simples e maintível
- ✅ Melhor experiência offline/online