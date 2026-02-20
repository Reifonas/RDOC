// Tipos para validação de formulários e dados do sistema RDO
// Implementa schemas de validação e tipos para formulários

import type {
  UsuarioId,
  ObraId,
  RDOId,
  UserRoleType,
  ObraStatusType,
  TarefaStatusType,
  TarefaPrioridadeType,
  Endereco,
  CondicoesClimaticas,
  ConfiguracoesObra,
  MetadadosTarefa
} from './domain.types'

// === TIPOS BASE DE VALIDAÇÃO ===

// Resultado de validação de campo
export interface ValidacaoCampo {
  campo: string
  valido: boolean
  mensagem?: string
  codigo_erro?: string
}

// Resultado de validação completa
export interface ResultadoValidacao {
  valido: boolean
  erros: ValidacaoCampo[]
  avisos: ValidacaoCampo[]
}

// Regras de validação
export interface RegraValidacao {
  obrigatorio?: boolean
  tamanho_minimo?: number
  tamanho_maximo?: number
  padrao_regex?: RegExp
  valores_permitidos?: string[]
  validacao_customizada?: (valor: any) => boolean | string
}

// === SCHEMAS DE VALIDAÇÃO PARA ENTIDADES ===

// Schema de validação para usuário
export interface SchemaValidacaoUsuario {
  nome: RegraValidacao
  email: RegraValidacao
  telefone: RegraValidacao
  cargo: RegraValidacao
  role: RegraValidacao
}

// Schema de validação para obra
export interface SchemaValidacaoObra {
  nome: RegraValidacao
  descricao: RegraValidacao
  endereco: RegraValidacao
  cep: RegraValidacao
  cidade: RegraValidacao
  estado: RegraValidacao
  responsavel_id: RegraValidacao
  data_inicio: RegraValidacao
  data_prevista_fim: RegraValidacao
  status: RegraValidacao
}

// Schema de validação para RDO
export interface SchemaValidacaoRDO {
  obra_id: RegraValidacao
  data_relatorio: RegraValidacao
  condicoes_climaticas: RegraValidacao
  observacoes_gerais: RegraValidacao
  atividades: RegraValidacao
  mao_obra: RegraValidacao
  equipamentos: RegraValidacao
}

// === TIPOS PARA FORMULÁRIOS ===

// Estado de campo de formulário
export interface EstadoCampoFormulario<T = any> {
  valor: T
  tocado: boolean
  erro?: string
  validando: boolean
  desabilitado: boolean
}

// Estado de formulário
export interface EstadoFormulario<T extends Record<string, any>> {
  campos: {
    [K in keyof T]: EstadoCampoFormulario<T[K]>
  }
  valido: boolean
  enviando: boolean
  erro_geral?: string
  sucesso: boolean
}

// Configuração de campo de formulário
export interface ConfiguracaoCampoFormulario {
  tipo: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file'
  label: string
  placeholder?: string
  obrigatorio: boolean
  desabilitado?: boolean
  opcoes?: { valor: string; label: string }[]
  validacao?: RegraValidacao
  dependencias?: string[]
  condicional?: (valores: Record<string, any>) => boolean
}

// === FORMULÁRIOS ESPECÍFICOS ===

// Dados do formulário de usuário
export interface DadosFormularioUsuario {
  nome: string
  email: string
  telefone: string
  cargo: string
  role: UserRoleType
  ativo: boolean
}

// Dados do formulário de obra
export interface DadosFormularioObra {
  nome: string
  descricao: string
  endereco: Endereco
  responsavel_id: UsuarioId | null
  data_inicio: string | null
  data_prevista_fim: string | null
  status: ObraStatusType
  configuracoes: ConfiguracoesObra
}

// Dados do formulário de RDO
export interface DadosFormularioRDO {
  obra_id: ObraId
  data_relatorio: string
  condicoes_climaticas: CondicoesClimaticas
  observacoes_gerais: string
  atividades: DadosFormularioAtividade[]
  mao_obra: DadosFormularioMaoObra[]
  equipamentos: DadosFormularioEquipamento[]
  ocorrencias: DadosFormularioOcorrencia[]
}

// Dados do formulário de atividade
export interface DadosFormularioAtividade {
  tipo_atividade: string
  descricao: string
  localizacao: string
  percentual_concluido: number
  ordem: number
}

// Dados do formulário de mão de obra
export interface DadosFormularioMaoObra {
  funcao: string
  quantidade: number
  horas_trabalhadas: number
  observacoes: string
}

// Dados do formulário de equipamento
export interface DadosFormularioEquipamento {
  nome: string
  tipo: string
  horas_utilizadas: number
  operador: string
  observacoes: string
}

// Dados do formulário de ocorrência
export interface DadosFormularioOcorrencia {
  tipo: string
  descricao: string
  gravidade: 'baixa' | 'media' | 'alta' | 'critica'
  acao_tomada: string
  responsavel: string
}

// Dados do formulário de tarefa
export interface DadosFormularioTarefa {
  obra_id: ObraId
  titulo: string
  descricao: string
  status: TarefaStatusType
  prioridade: TarefaPrioridadeType
  responsavel_id: UsuarioId | null
  data_inicio: string | null
  data_fim: string | null
  progresso: number
  metadados: MetadadosTarefa
}

// === VALIDAÇÕES ESPECÍFICAS ===

// Validação de CPF/CNPJ
export interface ValidacaoDocumento {
  tipo: 'cpf' | 'cnpj'
  numero: string
  valido: boolean
  formatado: string
}

// Validação de CEP
export interface ValidacaoCEP {
  cep: string
  valido: boolean
  endereco_encontrado?: {
    logradouro: string
    bairro: string
    cidade: string
    estado: string
  }
}

// Validação de email
export interface ValidacaoEmail {
  email: string
  valido: boolean
  disponivel?: boolean
  sugestoes?: string[]
}

// Validação de senha
export interface ValidacaoSenha {
  senha: string
  forca: 'fraca' | 'media' | 'forte' | 'muito_forte'
  criterios: {
    tamanho_minimo: boolean
    possui_maiuscula: boolean
    possui_minuscula: boolean
    possui_numero: boolean
    possui_simbolo: boolean
  }
  sugestoes: string[]
}

// === TIPOS PARA UPLOAD DE ARQUIVOS ===

// Estado de upload
export interface EstadoUpload {
  arquivo: File
  progresso: number
  status: 'pendente' | 'enviando' | 'concluido' | 'erro'
  erro?: string
  url_resultado?: string
}

// Configuração de upload
export interface ConfiguracaoUpload {
  tipos_permitidos: string[]
  tamanho_maximo: number
  multiplos_arquivos: boolean
  redimensionar_imagem?: {
    largura_maxima: number
    altura_maxima: number
    qualidade: number
  }
}

// Resultado de upload
export interface ResultadoUpload {
  sucesso: boolean
  arquivos: {
    nome_original: string
    nome_arquivo: string
    url: string
    tamanho: number
    tipo: string
  }[]
  erros: string[]
}

// === TIPOS PARA BUSCA E FILTROS ===

// Filtro de busca
export interface FiltroBusca {
  campo: string
  operador: 'igual' | 'diferente' | 'contem' | 'inicia_com' | 'termina_com' | 'maior_que' | 'menor_que' | 'entre'
  valor: any
  valor_secundario?: any // Para operador 'entre'
}

// Configuração de busca
export interface ConfiguracaoBusca {
  campos_busca: string[]
  filtros_disponiveis: {
    campo: string
    label: string
    tipo: 'text' | 'select' | 'date' | 'number'
    opcoes?: { valor: string; label: string }[]
  }[]
  ordenacao_padrao: {
    campo: string
    direcao: 'asc' | 'desc'
  }
}

// === TIPOS PARA RELATÓRIOS ===

// Parâmetros de relatório
export interface ParametrosRelatorio {
  tipo: 'rdo' | 'obra' | 'produtividade' | 'ocorrencias'
  formato: 'pdf' | 'excel' | 'csv'
  periodo_inicio: string
  periodo_fim: string
  filtros: Record<string, any>
  campos_incluir: string[]
  agrupamento?: string
  ordenacao?: {
    campo: string
    direcao: 'asc' | 'desc'
  }
}

// Estado de geração de relatório
export interface EstadoRelatorio {
  gerando: boolean
  progresso: number
  erro?: string
  url_download?: string
  concluido: boolean
}

// === TIPOS PARA NOTIFICAÇÕES ===

// Configuração de notificação
export interface ConfiguracaoNotificacao {
  email_ativo: boolean
  push_ativo: boolean
  tipos_notificacao: {
    tipo: string
    ativo: boolean
    email: boolean
    push: boolean
  }[]
}

// === UTILITÁRIOS DE VALIDAÇÃO ===

// Função de validação
export type FuncaoValidacao<T> = (valor: T, contexto?: any) => boolean | string

// Validador composto
export interface ValidadorComposto<T> {
  validadores: FuncaoValidacao<T>[]
  parar_no_primeiro_erro: boolean
}

// Contexto de validação
export interface ContextoValidacao {
  entidade: string
  operacao: 'criar' | 'atualizar' | 'deletar'
  usuario_atual?: UsuarioId
  dados_existentes?: Record<string, any>
}

// === CONSTANTES DE VALIDAÇÃO ===

// Mensagens de erro padrão
export const MENSAGENS_ERRO = {
  CAMPO_OBRIGATORIO: 'Este campo é obrigatório',
  EMAIL_INVALIDO: 'Email inválido',
  TELEFONE_INVALIDO: 'Telefone inválido',
  CEP_INVALIDO: 'CEP inválido',
  DATA_INVALIDA: 'Data inválida',
  NUMERO_INVALIDO: 'Número inválido',
  TAMANHO_MINIMO: 'Deve ter pelo menos {min} caracteres',
  TAMANHO_MAXIMO: 'Deve ter no máximo {max} caracteres',
  VALOR_DUPLICADO: 'Este valor já existe',
  FORMATO_INVALIDO: 'Formato inválido',
  ARQUIVO_MUITO_GRANDE: 'Arquivo muito grande',
  TIPO_ARQUIVO_INVALIDO: 'Tipo de arquivo não permitido'
} as const

// Padrões regex comuns
export const PADROES_VALIDACAO = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TELEFONE: /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/,
  CEP: /^\d{5}-?\d{3}$/,
  CPF: /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
  CNPJ: /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/,
  SENHA_FORTE: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
} as const