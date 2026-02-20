// Tipos para API e comunicação com o backend
// Define interfaces para requests, responses e hooks do React Query

import type {
  UsuarioId,
  ObraId,
  RDOId,
  TarefaId,
  UserRoleType,
  ObraStatusType,
  RDOStatusType,
  TarefaStatusType,
  TarefaPrioridadeType,
  FiltrosAvancadosObra,
  CriteriosOrdenacao,
  Paginacao
} from './domain.types'

import type {
  Usuario,
  Obra,
  RDO,
  Tarefa,
  RDOCompleto,
  ObraCompleta,
  TablesInsert,
  TablesUpdate
} from './database.types'

// === TIPOS BASE DA API ===

// Resposta padrão da API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

// Resposta de erro da API
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}

// Metadados de resposta
export interface ResponseMetadata {
  total_count?: number
  page?: number
  per_page?: number
  has_more?: boolean
  execution_time?: number
}

// Resposta paginada
export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  metadata: ResponseMetadata
  pagination: Paginacao
}

// === TIPOS PARA AUTENTICAÇÃO ===

// Request de login
export interface LoginRequest {
  email: string
  password: string
  remember_me?: boolean
}

// Response de login
export interface LoginResponse {
  user: Usuario
  access_token: string
  refresh_token: string
  expires_in: number
}

// Request de registro
export interface RegisterRequest {
  nome: string
  email: string
  password: string
  telefone?: string
  cargo?: string
}

// Request de reset de senha
export interface ResetPasswordRequest {
  email: string
}

// Request de mudança de senha
export interface ChangePasswordRequest {
  current_password: string
  new_password: string
  confirm_password: string
}

// === TIPOS PARA USUÁRIOS ===

// Request de criação de usuário
export interface CreateUsuarioRequest extends TablesInsert<'usuarios'> {}

// Request de atualização de usuário
export interface UpdateUsuarioRequest extends TablesUpdate<'usuarios'> {
  id: UsuarioId
}

// Filtros para listagem de usuários
export interface UsuarioFilters {
  role?: UserRoleType[]
  ativo?: boolean
  search?: string
  cargo?: string[]
}

// Parâmetros de busca de usuários
export interface UsuarioSearchParams extends UsuarioFilters {
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// === TIPOS PARA OBRAS ===

// Request de criação de obra
export interface CreateObraRequest extends TablesInsert<'obras'> {}

// Request de atualização de obra
export interface UpdateObraRequest extends TablesUpdate<'obras'> {
  id: ObraId
}

// Filtros para listagem de obras
export interface ObraFilters extends FiltrosAvancadosObra {
  responsavel_id?: UsuarioId
  status?: ObraStatusType[]
  data_inicio_from?: string
  data_inicio_to?: string
  progresso_min?: number
  progresso_max?: number
}

// Parâmetros de busca de obras
export interface ObraSearchParams extends ObraFilters {
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  include_stats?: boolean
}

// Estatísticas de obra
export interface ObraStats {
  total_rdos: number
  rdos_aprovados: number
  rdos_pendentes: number
  progresso_medio: number
  total_tarefas: number
  tarefas_concluidas: number
  ultima_atividade: string
}

// === TIPOS PARA RDOs ===

// Request de criação de RDO
export interface CreateRDORequest extends TablesInsert<'rdos'> {
  atividades?: TablesInsert<'rdo_atividades'>[]
  mao_obra?: TablesInsert<'rdo_mao_obra'>[]
  equipamentos?: TablesInsert<'rdo_equipamentos'>[]
  ocorrencias?: TablesInsert<'rdo_ocorrencias'>[]
  anexos?: TablesInsert<'rdo_anexos'>[]
}

// Request de atualização de RDO
export interface UpdateRDORequest extends TablesUpdate<'rdos'> {
  id: RDOId
  atividades?: TablesUpdate<'rdo_atividades'>[]
  mao_obra?: TablesUpdate<'rdo_mao_obra'>[]
  equipamentos?: TablesUpdate<'rdo_equipamentos'>[]
  ocorrencias?: TablesUpdate<'rdo_ocorrencias'>[]
  anexos?: TablesUpdate<'rdo_anexos'>[]
}

// Filtros para listagem de RDOs
export interface RDOFilters {
  obra_id?: ObraId
  criado_por?: UsuarioId
  status?: RDOStatusType[]
  data_relatorio_from?: string
  data_relatorio_to?: string
  aprovado_por?: UsuarioId
  obra_ids?: ObraId[]
  periodo?: { inicio: Date; fim: Date }
  aprovado_por_ids?: UsuarioId[]
  contem_ocorrencias?: boolean
  tipos_atividade?: string[]
  equipamentos_utilizados?: string[]
  texto_busca?: string
}

// Parâmetros de busca de RDOs
export interface RDOSearchParams extends RDOFilters {
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  include_details?: boolean
}

// Request de aprovação de RDO
export interface ApproveRDORequest {
  rdo_id: RDOId
  aprovado: boolean
  observacoes?: string
}

// === TIPOS PARA TAREFAS ===

// Request de criação de tarefa
export interface CreateTarefaRequest extends TablesInsert<'tarefas'> {}

// Request de atualização de tarefa
export interface UpdateTarefaRequest extends TablesUpdate<'tarefas'> {
  id: TarefaId
}

// Filtros para listagem de tarefas
export interface TarefaFilters {
  obra_id?: ObraId
  responsavel_id?: UsuarioId
  status?: TarefaStatusType[]
  prioridade?: TarefaPrioridadeType[]
  data_inicio_from?: string
  data_inicio_to?: string
  data_fim_from?: string
  data_fim_to?: string
  search?: string
}

// Parâmetros de busca de tarefas
export interface TarefaSearchParams extends TarefaFilters {
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// === TIPOS PARA UPLOAD DE ARQUIVOS ===

// Request de upload
export interface UploadRequest {
  file: File
  entity_type: 'rdo' | 'obra' | 'usuario'
  entity_id: string
  description?: string
}

// Response de upload
export interface UploadResponse {
  file_id: string
  file_name: string
  file_url: string
  file_size: number
  mime_type: string
  uploaded_at: string
}

// === TIPOS PARA RELATÓRIOS ===

// Request de geração de relatório
export interface GenerateReportRequest {
  type: 'rdo' | 'obra' | 'produtividade' | 'ocorrencias'
  format: 'pdf' | 'excel' | 'csv'
  filters: Record<string, any>
  date_range: {
    start: string
    end: string
  }
  include_charts?: boolean
  template_id?: string
}

// Response de relatório
export interface ReportResponse {
  report_id: string
  download_url: string
  expires_at: string
  file_size: number
  generated_at: string
}

// === TIPOS PARA HOOKS DO REACT QUERY ===

// Opções base para queries
export interface BaseQueryOptions {
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
  refetchOnWindowFocus?: boolean
  refetchOnMount?: boolean
  retry?: boolean | number
}

// Opções para mutations
export interface BaseMutationOptions<TData = any, TError = ApiError, TVariables = any> {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: TError, variables: TVariables) => void
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void
}

// Resultado de query paginada
export interface UsePaginatedQueryResult<T> {
  data: T[]
  isLoading: boolean
  isError: boolean
  error: ApiError | null
  pagination: Paginacao
  hasNextPage: boolean
  hasPreviousPage: boolean
  fetchNextPage: () => void
  fetchPreviousPage: () => void
  refetch: () => void
}

// Resultado de mutation
export interface UseMutationResult<TData, TError, TVariables> {
  mutate: (variables: TVariables) => void
  mutateAsync: (variables: TVariables) => Promise<TData>
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  error: TError | null
  data: TData | undefined
  reset: () => void
}

// === TIPOS PARA CACHE E SINCRONIZAÇÃO ===

// Configuração de cache
export interface CacheConfig {
  key: string
  ttl: number
  invalidateOn: string[]
  dependencies: string[]
}

// Estado de sincronização
export interface SyncState {
  lastSync: string
  syncing: boolean
  pendingChanges: number
  conflicts: any[]
}

// === TIPOS PARA WEBSOCKET ===

// Mensagem de WebSocket
export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: string
  user_id?: UsuarioId
}

// Eventos de WebSocket
export interface WebSocketEvents {
  'rdo:created': { rdo: RDO }
  'rdo:updated': { rdo: RDO }
  'rdo:approved': { rdo: RDO, approved_by: UsuarioId }
  'obra:updated': { obra: Obra }
  'tarefa:assigned': { tarefa: Tarefa, assigned_to: UsuarioId }
  'notification': { message: string, type: string }
}

// === CONSTANTES DA API ===

// Endpoints da API
export const API_ENDPOINTS = {
  // Autenticação
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  
  // Usuários
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  USER_PROFILE: '/users/profile',
  
  // Obras
  OBRAS: '/obras',
  OBRA_BY_ID: (id: string) => `/obras/${id}`,
  OBRA_STATS: (id: string) => `/obras/${id}/stats`,
  
  // RDOs
  RDOS: '/rdos',
  RDO_BY_ID: (id: string) => `/rdos/${id}`,
  RDO_APPROVE: (id: string) => `/rdos/${id}/approve`,
  RDO_EXPORT: (id: string) => `/rdos/${id}/export`,
  
  // Tarefas
  TAREFAS: '/tarefas',
  TAREFA_BY_ID: (id: string) => `/tarefas/${id}`,
  
  // Upload
  UPLOAD: '/upload',
  UPLOAD_BY_ID: (id: string) => `/upload/${id}`,
  
  // Relatórios
  REPORTS: '/reports',
  REPORT_GENERATE: '/reports/generate',
  REPORT_DOWNLOAD: (id: string) => `/reports/${id}/download`,
  
  // Configurações
  SETTINGS: '/settings',
  SETTINGS_BY_KEY: (key: string) => `/settings/${key}`
} as const

// Códigos de status HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
} as const

// Códigos de erro da aplicação
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  BUSINESS_RULE_ERROR: 'BUSINESS_RULE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR'
} as const

export type ErrorCodeType = typeof ERROR_CODES[keyof typeof ERROR_CODES]

// === UTILITÁRIOS DE TIPO ===

// Extrai o tipo de dados de uma resposta da API
export type ExtractApiData<T> = T extends ApiResponse<infer U> ? U : never

// Extrai o tipo de parâmetros de uma função de API
export type ExtractApiParams<T> = T extends (...args: infer P) => any ? P[0] : never

// Tipo para query keys do React Query
export type QueryKey = readonly [string, ...any[]]

// Tipo para invalidação de queries
export type InvalidateQueriesFilter = {
  queryKey?: QueryKey
  exact?: boolean
  type?: 'active' | 'inactive' | 'all'
}