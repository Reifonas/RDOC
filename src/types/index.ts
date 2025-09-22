// Exportações centralizadas de todos os tipos do sistema RDO
// Este arquivo serve como ponto único de entrada para todos os tipos

// === TIPOS DE BANCO DE DADOS ===
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Usuario,
  Obra,
  RDO,
  RDOAtividade,
  RDOMaoObra,
  RDOEquipamento,
  RDOOcorrencia,
  RDOAnexo,
  RDOInspecaoSolda,
  RDOVerificacaoTorque,
  Tarefa,
  TaskLog,
  RDOCompleto,
  RDOCompletoInsert,
  ObraCompleta,
  AuthUser,
  FiltroRDO,
  FiltroObra,
  FiltroTarefa
} from './database.types'

// === TIPOS DE DOMÍNIO ===
export type {
  // Branded Types
  Brand,
  UsuarioId,
  ObraId,
  RDOId,
  TarefaId,
  AtividadeId,
  EquipamentoId,
  OcorrenciaId,
  AnexoId,
  InspecaoSoldaId,
  VerificacaoTorqueId,
  TaskLogId,
  
  // Enums e Constantes
  UserRoleType,
  ObraStatusType,
  RDOStatusType,
  TarefaStatusType,
  TarefaPrioridadeType,
  TaskLogTipoEventoType,
  StatusVerificacaoType,
  TipoNotificacaoType,
  
  // Tipos Específicos
  Coordenadas,
  Endereco,
  Periodo,
  CondicoesClimaticas,
  ProgressoDetalhado,
  ConfiguracoesObra,
  MetadadosTarefa,
  DetalhesEventoLog,
  
  // Validação
  ResultadoValidacao,
  ValidacaoRDO,
  
  // Relatórios
  EstatisticasObra,
  RelatorioProdutividade,
  
  // Busca e Filtros
  CriteriosOrdenacao,
  Paginacao,
  ResultadoPaginado,
  FiltrosAvancadosRDO,
  FiltrosAvancadosObra,
  
  // Notificações
  Notificacao,
  
  // Integração
  ConfiguracaoIntegracao,
  ResultadoSincronizacao,
  
  // Utilitários
  PartialExcept,
  RequiredExcept,
  ExtractUnion,
  CamposAuditoria,
  EntidadeBase,
  EntidadeComAuditoria
} from './domain.types'

// === CONSTANTES DE DOMÍNIO ===
export {
  UserRole,
  ObraStatus,
  RDOStatus,
  TarefaStatus,
  TarefaPrioridade,
  TaskLogTipoEvento,
  StatusVerificacao,
  TipoNotificacao,
  createUsuarioId,
  createObraId,
  createRDOId,
  createTarefaId,
  createAtividadeId,
  createEquipamentoId,
  createOcorrenciaId,
  createAnexoId,
  createInspecaoSoldaId,
  createVerificacaoTorqueId,
  createTaskLogId
} from './domain.types'

// === TIPOS DE VALIDAÇÃO ===
export type {
  // Validação Base
  ValidacaoCampo,
  RegraValidacao,
  
  // Schemas de Validação
  SchemaValidacaoUsuario,
  SchemaValidacaoObra,
  SchemaValidacaoRDO,
  
  // Formulários
  EstadoCampoFormulario,
  EstadoFormulario,
  ConfiguracaoCampoFormulario,
  DadosFormularioUsuario,
  DadosFormularioObra,
  DadosFormularioRDO,
  DadosFormularioAtividade,
  DadosFormularioMaoObra,
  DadosFormularioEquipamento,
  DadosFormularioOcorrencia,
  DadosFormularioTarefa,
  
  // Validações Específicas
  ValidacaoDocumento,
  ValidacaoCEP,
  ValidacaoEmail,
  ValidacaoSenha,
  
  // Upload
  EstadoUpload,
  ConfiguracaoUpload,
  ResultadoUpload,
  
  // Busca e Filtros
  FiltroBusca,
  ConfiguracaoBusca,
  
  // Relatórios
  ParametrosRelatorio,
  EstadoRelatorio,
  
  // Notificações
  ConfiguracaoNotificacao,
  
  // Utilitários
  FuncaoValidacao,
  ValidadorComposto,
  ContextoValidacao
} from './validation.types'

// === CONSTANTES DE VALIDAÇÃO ===
export {
  MENSAGENS_ERRO,
  PADROES_VALIDACAO
} from './validation.types'

// === TIPOS DE API ===
export type {
  // Base da API
  ApiResponse,
  ApiError,
  ResponseMetadata,
  PaginatedApiResponse,
  
  // Autenticação
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  
  // Usuários
  CreateUsuarioRequest,
  UpdateUsuarioRequest,
  UsuarioFilters,
  UsuarioSearchParams,
  
  // Obras
  CreateObraRequest,
  UpdateObraRequest,
  ObraFilters,
  ObraSearchParams,
  ObraStats,
  
  // RDOs
  CreateRDORequest,
  UpdateRDORequest,
  RDOFilters,
  RDOSearchParams,
  ApproveRDORequest,
  
  // Tarefas
  CreateTarefaRequest,
  UpdateTarefaRequest,
  TarefaFilters,
  TarefaSearchParams,
  
  // Upload
  UploadRequest,
  UploadResponse,
  
  // Relatórios
  GenerateReportRequest,
  ReportResponse,
  
  // Hooks React Query
  BaseQueryOptions,
  BaseMutationOptions,
  UsePaginatedQueryResult,
  UseMutationResult,
  
  // Cache e Sincronização
  CacheConfig,
  SyncState,
  
  // WebSocket
  WebSocketMessage,
  WebSocketEvents,
  
  // Utilitários
  ExtractApiData,
  ExtractApiParams,
  QueryKey,
  InvalidateQueriesFilter,
  ErrorCodeType
} from './api.types'

// === CONSTANTES DE API ===
export {
  API_ENDPOINTS,
  HTTP_STATUS,
  ERROR_CODES
} from './api.types'

// === TIPOS LEGADOS (para compatibilidade) ===
// Estes tipos são mantidos para compatibilidade com código existente
// e devem ser gradualmente migrados para os novos tipos

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface Equipamento {
  id: string
  nome: string
  tipo: string
  status: 'disponivel' | 'em_uso' | 'manutencao'
  localizacao?: string
}

export interface ReportData {
  id: string
  title: string
  data: any[]
  generatedAt: string
  type: 'rdo' | 'obra' | 'produtividade'
}

export interface Atividade {
  id: string
  descricao: string
  tipo: string
  percentual_concluido: number
  localizacao?: string
}

export interface MaoDeObra {
  id: string
  funcao: string
  quantidade: number
  horas_trabalhadas: number
  observacoes?: string
}

export interface Ocorrencia {
  id: string
  tipo: string
  descricao: string
  gravidade: 'baixa' | 'media' | 'alta' | 'critica'
  data_ocorrencia: string
  acao_tomada?: string
}

// === RE-EXPORTAÇÕES PARA COMPATIBILIDADE ===
// Aliases para manter compatibilidade com imports existentes
export type { Usuario as User } from './database.types'
export type { Obra as Project } from './database.types'
export type { RDO as Report } from './database.types'
export type { Tarefa as TaskEntity } from './database.types'

// === TIPOS UTILITÁRIOS GLOBAIS ===

// Tipo para IDs genéricos
export type ID = string

// Tipo para timestamps
export type Timestamp = string

// Tipo para status genérico
export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled'

// Tipo para prioridade genérica
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

// Tipo para operações CRUD
export type CrudOperation = 'create' | 'read' | 'update' | 'delete'

// Tipo para permissões
export type Permission = 'read' | 'write' | 'delete' | 'admin'

// Tipo para ambiente
export type Environment = 'development' | 'staging' | 'production'

// === GUARDS DE TIPO ===

// Guard para verificar se um valor é um ID válido
export const isValidId = (value: any): value is string => {
  return typeof value === 'string' && value.length > 0
}

// Guard para verificar se um objeto tem propriedade id
export const hasId = (obj: any): obj is { id: string } => {
  return obj && typeof obj === 'object' && 'id' in obj && isValidId(obj.id)
}

// Guard para verificar se um objeto é uma entidade com auditoria
export const hasAuditFields = (obj: any): obj is import('./domain.types').CamposAuditoria => {
  return obj && typeof obj === 'object' && 'created_at' in obj && 'updated_at' in obj
}