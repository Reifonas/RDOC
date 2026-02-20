// Tipos específicos do domínio RDO com branded types para maior type safety
// Implementa branded types para IDs únicos e tipos de domínio específicos

// === BRANDED TYPES PARA IDs ===
// Branded types garantem que IDs de diferentes entidades não sejam intercambiáveis

export type Brand<T, K> = T & { __brand: K }

// IDs tipados por entidade
export type UsuarioId = Brand<string, 'UsuarioId'>
export type ObraId = Brand<string, 'ObraId'>
export type RDOId = Brand<string, 'RDOId'>
export type TarefaId = Brand<string, 'TarefaId'>
export type AtividadeId = Brand<string, 'AtividadeId'>
export type EquipamentoId = Brand<string, 'EquipamentoId'>
export type OcorrenciaId = Brand<string, 'OcorrenciaId'>
export type AnexoId = Brand<string, 'AnexoId'>
export type InspecaoSoldaId = Brand<string, 'InspecaoSoldaId'>
export type VerificacaoTorqueId = Brand<string, 'VerificacaoTorqueId'>
export type TaskLogId = Brand<string, 'TaskLogId'>

// Funções helper para criar IDs tipados
export const createUsuarioId = (id: string): UsuarioId => id as UsuarioId
export const createObraId = (id: string): ObraId => id as ObraId
export const createRDOId = (id: string): RDOId => id as RDOId
export const createTarefaId = (id: string): TarefaId => id as TarefaId
export const createAtividadeId = (id: string): AtividadeId => id as AtividadeId
export const createEquipamentoId = (id: string): EquipamentoId => id as EquipamentoId
export const createOcorrenciaId = (id: string): OcorrenciaId => id as OcorrenciaId
export const createAnexoId = (id: string): AnexoId => id as AnexoId
export const createInspecaoSoldaId = (id: string): InspecaoSoldaId => id as InspecaoSoldaId
export const createVerificacaoTorqueId = (id: string): VerificacaoTorqueId => id as VerificacaoTorqueId
export const createTaskLogId = (id: string): TaskLogId => id as TaskLogId

// === ENUMS E CONSTANTES DO DOMÍNIO ===

// Roles de usuário
export const UserRole = {
  ADMIN: 'admin',
  ENGENHEIRO: 'engenheiro',
  MESTRE_OBRA: 'mestre_obra',
  USUARIO: 'usuario'
} as const

export type UserRoleType = typeof UserRole[keyof typeof UserRole]

// Status de obra
export const ObraStatus = {
  ATIVA: 'ativa',
  PAUSADA: 'pausada',
  CONCLUIDA: 'concluida',
  CANCELADA: 'cancelada'
} as const

export type ObraStatusType = typeof ObraStatus[keyof typeof ObraStatus]

// Status de RDO
export const RDOStatus = {
  RASCUNHO: 'rascunho',
  ENVIADO: 'enviado',
  APROVADO: 'aprovado',
  REJEITADO: 'rejeitado'
} as const

export type RDOStatusType = typeof RDOStatus[keyof typeof RDOStatus]

// Status de tarefa
export const TarefaStatus = {
  PENDENTE: 'pendente',
  EM_ANDAMENTO: 'em_andamento',
  CONCLUIDA: 'concluida',
  CANCELADA: 'cancelada'
} as const

export type TarefaStatusType = typeof TarefaStatus[keyof typeof TarefaStatus]

// Prioridade de tarefa
export const TarefaPrioridade = {
  BAIXA: 'baixa',
  MEDIA: 'media',
  ALTA: 'alta',
  URGENTE: 'urgente'
} as const

export type TarefaPrioridadeType = typeof TarefaPrioridade[keyof typeof TarefaPrioridade]

// Tipos de evento de task log
export const TaskLogTipoEvento = {
  INICIO: 'inicio',
  PAUSA: 'pausa',
  RETOMADA: 'retomada',
  CONCLUSAO: 'conclusao',
  REVISAO: 'revisao',
  EDICAO: 'edicao',
  CANCELAMENTO: 'cancelamento'
} as const

export type TaskLogTipoEventoType = typeof TaskLogTipoEvento[keyof typeof TaskLogTipoEvento]

// Status de verificação
export const StatusVerificacao = {
  CONFORME: 'conforme',
  NAO_CONFORME: 'nao_conforme'
} as const

export type StatusVerificacaoType = typeof StatusVerificacao[keyof typeof StatusVerificacao]

// === TIPOS DE DOMÍNIO ESPECÍFICOS ===

// Coordenadas geográficas
export interface Coordenadas {
  latitude: number
  longitude: number
}

// Endereço completo
export interface Endereco {
  logradouro: string
  numero?: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  coordenadas?: Coordenadas
}

// Período de tempo
export interface Periodo {
  inicio: Date
  fim: Date
}

// Condições climáticas estruturadas
export interface CondicoesClimaticas {
  temperatura?: number
  umidade?: number
  vento?: string
  precipitacao?: string
  visibilidade?: string
  observacoes?: string
}

// Progresso com detalhes
export interface ProgressoDetalhado {
  percentual: number
  etapa_atual: string
  etapas_concluidas: string[]
  proximas_etapas: string[]
  observacoes?: string
}

// Configurações de obra
export interface ConfiguracoesObra {
  tipos_atividade_permitidos: string[]
  funcoes_mao_obra: string[]
  equipamentos_disponiveis: string[]
  templates_relatorio: string[]
  aprovacao_automatica: boolean
  notificacoes_email: boolean
  backup_automatico: boolean
}

// Metadados de tarefa
export interface MetadadosTarefa {
  tags: string[]
  categoria: string
  estimativa_horas?: number
  recursos_necessarios: string[]
  dependencias: TarefaId[]
  anexos: string[]
}

// Detalhes de evento de log
export interface DetalhesEventoLog {
  campo_alterado?: string
  valor_anterior?: any
  valor_novo?: any
  motivo?: string
  observacoes?: string
  anexos?: string[]
}

// === TIPOS DE VALIDAÇÃO ===

// Resultado de validação
export interface ResultadoValidacao {
  valido: boolean
  erros: string[]
  avisos: string[]
}

// Validação de RDO
export interface ValidacaoRDO extends ResultadoValidacao {
  campos_obrigatorios_faltantes: string[]
  atividades_invalidas: number[]
  equipamentos_invalidos: number[]
  inconsistencias_horario: string[]
}

// === TIPOS DE RELATÓRIO ===

// Estatísticas de obra
export interface EstatisticasObra {
  total_rdos: number
  rdos_aprovados: number
  rdos_pendentes: number
  progresso_medio: number
  atividades_concluidas: number
  total_horas_trabalhadas: number
  equipamentos_utilizados: number
  ocorrencias_reportadas: number
}

// Relatório de produtividade
export interface RelatorioProdutividade {
  periodo: Periodo
  obra_id: ObraId
  total_atividades: number
  atividades_concluidas: number
  horas_trabalhadas: number
  eficiencia_percentual: number
  gargalos_identificados: string[]
  recomendacoes: string[]
}

// === TIPOS DE BUSCA E FILTROS ===

// Critérios de ordenação
export interface CriteriosOrdenacao {
  campo: string
  direcao: 'asc' | 'desc'
}

// Paginação
export interface Paginacao {
  pagina: number
  itens_por_pagina: number
  total_itens?: number
  total_paginas?: number
}

// Resultado paginado
export interface ResultadoPaginado<T> {
  dados: T[]
  paginacao: Paginacao
}

// Filtros avançados para RDO
export interface FiltrosAvancadosRDO {
  obra_ids?: ObraId[]
  periodo?: Periodo
  status?: RDOStatusType[]
  criado_por?: UsuarioId[]
  aprovado_por?: UsuarioId[]
  contem_ocorrencias?: boolean
  tipos_atividade?: string[]
  equipamentos_utilizados?: string[]
  texto_busca?: string
}

// Filtros avançados para obras
export interface FiltrosAvancadosObra {
  status?: ObraStatusType[]
  responsavel_ids?: UsuarioId[]
  periodo_inicio?: Periodo
  periodo_fim?: Periodo
  progresso_minimo?: number
  progresso_maximo?: number
  cidades?: string[]
  estados?: string[]
  texto_busca?: string
}

// === TIPOS DE NOTIFICAÇÃO ===

// Tipos de notificação
export const TipoNotificacao = {
  RDO_CRIADO: 'rdo_criado',
  RDO_APROVADO: 'rdo_aprovado',
  RDO_REJEITADO: 'rdo_rejeitado',
  TAREFA_ATRIBUIDA: 'tarefa_atribuida',
  TAREFA_VENCIDA: 'tarefa_vencida',
  OBRA_ATUALIZADA: 'obra_atualizada',
  OCORRENCIA_REPORTADA: 'ocorrencia_reportada'
} as const

export type TipoNotificacaoType = typeof TipoNotificacao[keyof typeof TipoNotificacao]

// Notificação
export interface Notificacao {
  id: string
  tipo: TipoNotificacaoType
  titulo: string
  mensagem: string
  usuario_id: UsuarioId
  lida: boolean
  dados_contexto: Record<string, any>
  created_at: Date
}

// === TIPOS DE INTEGRAÇÃO ===

// Configuração de integração externa
export interface ConfiguracaoIntegracao {
  nome: string
  ativa: boolean
  url_base: string
  chave_api?: string
  configuracoes: Record<string, any>
  ultima_sincronizacao?: Date
}

// Resultado de sincronização
export interface ResultadoSincronizacao {
  sucesso: boolean
  itens_sincronizados: number
  erros: string[]
  timestamp: Date
}

// === UTILITÁRIOS DE TIPO ===

// Torna todas as propriedades opcionais exceto as especificadas
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>

// Torna todas as propriedades obrigatórias exceto as especificadas
export type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>

// Extrai tipos de união
export type ExtractUnion<T, U> = T extends U ? T : never

// Tipo para campos de auditoria
export interface CamposAuditoria {
  created_at: Date
  updated_at: Date
  created_by?: UsuarioId
  updated_by?: UsuarioId
}

// Tipo base para entidades
export interface EntidadeBase {
  id: string
}

// Tipo para entidades com auditoria
export interface EntidadeComAuditoria extends EntidadeBase, CamposAuditoria {}