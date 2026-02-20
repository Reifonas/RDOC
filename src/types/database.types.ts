// Tipos TypeScript gerados para o banco de dados RDO
// Baseado na arquitetura completa documentada

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          email: string
          nome: string
          organizacao_id: string
          telefone: string | null
          cargo: string | null
          role: 'admin' | 'engenheiro' | 'mestre_obra' | 'usuario'
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          nome: string
          organizacao_id?: string
          telefone?: string | null
          cargo?: string | null
          role?: 'admin' | 'engenheiro' | 'mestre_obra' | 'usuario'
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nome?: string
          organizacao_id?: string
          telefone?: string | null
          cargo?: string | null
          role?: 'admin' | 'engenheiro' | 'mestre_obra' | 'usuario'
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      obras: {
        Row: {
          id: string
          organizacao_id: string
          nome: string
          descricao: string | null
          endereco: string | null
          cep: string | null
          cidade: string | null
          estado: string | null
          responsavel_id: string | null
          data_inicio: string | null
          data_prevista_fim: string | null
          data_conclusao: string | null
          progresso_geral: number
          status: 'ativa' | 'pausada' | 'concluida' | 'cancelada'
          configuracoes: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizacao_id: string
          nome: string
          descricao?: string | null
          endereco?: string | null
          cep?: string | null
          cidade?: string | null
          estado?: string | null
          responsavel_id?: string | null
          data_inicio?: string | null
          data_prevista_fim?: string | null
          data_conclusao?: string | null
          progresso_geral?: number
          status?: 'ativa' | 'pausada' | 'concluida' | 'cancelada'
          configuracoes?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organizacao_id?: string
          nome?: string
          descricao?: string | null
          endereco?: string | null
          cep?: string | null
          cidade?: string | null
          estado?: string | null
          responsavel_id?: string | null
          data_inicio?: string | null
          data_prevista_fim?: string | null
          data_conclusao?: string | null
          progresso_geral?: number
          status?: 'ativa' | 'pausada' | 'concluida' | 'cancelada'
          configuracoes?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      rdos: {
        Row: {
          id: string
          organizacao_id: string
          obra_id: string
          criado_por: string
          data_relatorio: string
          condicoes_climaticas: string
          observacoes_gerais: string | null
          status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado'
          aprovado_por: string | null
          aprovado_em: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizacao_id?: string
          obra_id: string
          criado_por: string
          data_relatorio: string
          condicoes_climaticas: string
          observacoes_gerais?: string | null
          status?: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado'
          aprovado_por?: string | null
          aprovado_em?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organizacao_id?: string
          obra_id?: string
          criado_por?: string
          data_relatorio?: string
          condicoes_climaticas?: string
          observacoes_gerais?: string | null
          status?: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado'
          aprovado_por?: string | null
          aprovado_em?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rdo_atividades: {
        Row: {
          id: string
          rdo_id: string
          tipo_atividade: string
          descricao: string
          localizacao: string | null
          percentual_concluido: number
          ordem: number
          created_at: string
        }
        Insert: {
          id?: string
          rdo_id: string
          tipo_atividade: string
          descricao: string
          localizacao?: string | null
          percentual_concluido?: number
          ordem?: number
          created_at?: string
        }
        Update: {
          id?: string
          rdo_id?: string
          tipo_atividade?: string
          descricao?: string
          localizacao?: string | null
          percentual_concluido?: number
          ordem?: number
          created_at?: string
        }
      }
      rdo_mao_obra: {
        Row: {
          id: string
          rdo_id: string
          funcao: string
          quantidade: number
          horas_trabalhadas: number
          observacoes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          rdo_id: string
          funcao: string
          quantidade?: number
          horas_trabalhadas?: number
          observacoes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          rdo_id?: string
          funcao?: string
          quantidade?: number
          horas_trabalhadas?: number
          observacoes?: string | null
          created_at?: string
        }
      }
      rdo_equipamentos: {
        Row: {
          id: string
          rdo_id: string
          nome_equipamento: string
          tipo: string | null
          horas_utilizadas: number
          combustivel_gasto: number
          observacoes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          rdo_id: string
          nome_equipamento: string
          tipo?: string | null
          horas_utilizadas?: number
          combustivel_gasto?: number
          observacoes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          rdo_id?: string
          nome_equipamento?: string
          tipo?: string | null
          horas_utilizadas?: number
          combustivel_gasto?: number
          observacoes?: string | null
          created_at?: string
        }
      }
      rdo_ocorrencias: {
        Row: {
          id: string
          rdo_id: string
          tipo_ocorrencia: string
          descricao: string
          gravidade: 'baixa' | 'media' | 'alta' | 'critica'
          acao_tomada: string | null
          created_at: string
        }
        Insert: {
          id?: string
          rdo_id: string
          tipo_ocorrencia: string
          descricao: string
          gravidade?: 'baixa' | 'media' | 'alta' | 'critica'
          acao_tomada?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          rdo_id?: string
          tipo_ocorrencia?: string
          descricao?: string
          gravidade?: 'baixa' | 'media' | 'alta' | 'critica'
          acao_tomada?: string | null
          created_at?: string
        }
      }
      rdo_anexos: {
        Row: {
          id: string
          rdo_id: string
          nome_arquivo: string
          tipo_arquivo: string | null
          url_storage: string
          tamanho_bytes: number | null
          descricao: string | null
          created_at: string
        }
        Insert: {
          id?: string
          rdo_id: string
          nome_arquivo: string
          tipo_arquivo?: string | null
          url_storage: string
          tamanho_bytes?: number | null
          descricao?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          rdo_id?: string
          nome_arquivo?: string
          tipo_arquivo?: string | null
          url_storage?: string
          tamanho_bytes?: number | null
          descricao?: string | null
          created_at?: string
        }
      }
      rdo_inspecoes_solda: {
        Row: {
          id: string
          rdo_id: string
          identificacao_junta: string
          status_inspecao: 'aprovado' | 'reprovado' | 'pendente'
          metodo_inspecao: string | null
          observacoes: string | null
          inspecionado_por: string | null
          created_at: string
        }
        Insert: {
          id?: string
          rdo_id: string
          identificacao_junta: string
          status_inspecao?: 'aprovado' | 'reprovado' | 'pendente'
          metodo_inspecao?: string | null
          observacoes?: string | null
          inspecionado_por?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          rdo_id?: string
          identificacao_junta?: string
          status_inspecao?: 'aprovado' | 'reprovado' | 'pendente'
          metodo_inspecao?: string | null
          observacoes?: string | null
          inspecionado_por?: string | null
          created_at?: string
        }
      }
      rdo_verificacoes_torque: {
        Row: {
          id: string
          rdo_id: string
          identificacao_parafuso: string
          torque_especificado: number
          torque_aplicado: number
          status_verificacao: 'conforme' | 'nao_conforme'
          observacoes: string | null
          verificado_por: string | null
          created_at: string
        }
        Insert: {
          id?: string
          rdo_id: string
          identificacao_parafuso: string
          torque_especificado?: number
          torque_aplicado: number
          status_verificacao?: 'conforme' | 'nao_conforme'
          observacoes?: string | null
          verificado_por?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          rdo_id?: string
          identificacao_parafuso?: string
          torque_especificado?: number
          torque_aplicado?: number
          status_verificacao?: 'conforme' | 'nao_conforme'
          observacoes?: string | null
          verificado_por?: string | null
          created_at?: string
        }
      }
      tarefas: {
        Row: {
          id: string
          organizacao_id: string
          obra_id: string
          titulo: string
          descricao: string | null
          status: 'pendente' | 'em_andamento' | 'pausada' | 'concluida' | 'cancelada' | 'atrasada'
          prioridade: 'baixa' | 'media' | 'alta' | 'urgente' | 'critica'
          responsavel_id: string | null
          data_inicio: string | null
          data_fim: string | null
          progresso: number
          metadados: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizacao_id?: string
          obra_id: string
          titulo: string
          descricao?: string | null
          status?: 'pendente' | 'em_andamento' | 'pausada' | 'concluida' | 'cancelada' | 'atrasada'
          prioridade?: 'baixa' | 'media' | 'alta' | 'urgente' | 'critica'
          responsavel_id?: string | null
          data_inicio?: string | null
          data_fim?: string | null
          progresso?: number
          metadados?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organizacao_id?: string
          obra_id?: string
          titulo?: string
          descricao?: string | null
          status?: 'pendente' | 'em_andamento' | 'pausada' | 'concluida' | 'cancelada' | 'atrasada'
          prioridade?: 'baixa' | 'media' | 'alta' | 'urgente' | 'critica'
          responsavel_id?: string | null
          data_inicio?: string | null
          data_fim?: string | null
          progresso?: number
          metadados?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      inventario_equipamentos: {
        Row: {
          id: string
          organizacao_id: string
          nome: string
          codigo: string | null
          marca: string | null
          modelo: string | null
          numero_serie: string | null
          status: 'disponivel' | 'em_uso' | 'manutencao' | 'inativo' | 'danificado' | 'perdido'
          obra_atual_id: string | null
          data_aquisicao: string | null
          valor: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizacao_id?: string
          nome: string
          codigo?: string | null
          marca?: string | null
          modelo?: string | null
          numero_serie?: string | null
          status?: 'disponivel' | 'em_uso' | 'manutencao' | 'inativo' | 'danificado' | 'perdido'
          obra_atual_id?: string | null
          data_aquisicao?: string | null
          valor?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organizacao_id?: string
          nome?: string
          codigo?: string | null
          marca?: string | null
          modelo?: string | null
          numero_serie?: string | null
          status?: 'disponivel' | 'em_uso' | 'manutencao' | 'inativo' | 'danificado' | 'perdido'
          obra_atual_id?: string | null
          data_aquisicao?: string | null
          valor?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      task_logs: {
        Row: {
          id: string
          task_id: string
          usuario_id: string
          tipo_evento: 'inicio' | 'pausa' | 'retomada' | 'conclusao' | 'revisao' | 'edicao' | 'cancelamento'
          descricao: string | null
          detalhes: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          usuario_id: string
          tipo_evento: 'inicio' | 'pausa' | 'retomada' | 'conclusao' | 'revisao' | 'edicao' | 'cancelamento'
          descricao?: string | null
          detalhes?: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          usuario_id?: string
          tipo_evento?: 'inicio' | 'pausa' | 'retomada' | 'conclusao' | 'revisao' | 'edicao' | 'cancelamento'
          descricao?: string | null
          detalhes?: Record<string, any>
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Tipos auxiliares para facilitar o uso
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Tipos específicos das entidades
export type Usuario = Tables<'usuarios'>
export type UsuarioInsert = TablesInsert<'usuarios'>
export type UsuarioUpdate = TablesUpdate<'usuarios'>

export type Obra = Tables<'obras'>
export type ObraInsert = TablesInsert<'obras'>
export type ObraUpdate = TablesUpdate<'obras'>

export type RDO = Tables<'rdos'>
export type RDOInsert = TablesInsert<'rdos'>
export type RDOUpdate = TablesUpdate<'rdos'>
export type RDOAtividade = Tables<'rdo_atividades'>
export type RDOMaoObra = Tables<'rdo_mao_obra'>
export type RDOEquipamento = Tables<'rdo_equipamentos'>
export type RDOOcorrencia = Tables<'rdo_ocorrencias'>
export type RDOAnexo = Tables<'rdo_anexos'>
export type RDOInspecaoSolda = Tables<'rdo_inspecoes_solda'>
export type RDOVerificacaoTorque = Tables<'rdo_verificacoes_torque'>
export type Tarefa = Tables<'tarefas'>
export type TaskLog = Tables<'task_logs'>

// Tipos compostos para RDO completo
export type RDOCompleto = RDO & {
  atividades: RDOAtividade[]
  mao_obra: RDOMaoObra[]
  equipamentos: RDOEquipamento[]
  ocorrencias: RDOOcorrencia[]
  anexos: RDOAnexo[]
  inspecoes_solda: RDOInspecaoSolda[]
  verificacoes_torque: RDOVerificacaoTorque[]
  obra: Obra
  criador: Usuario
}

// Tipos para inserção de RDO completo
export type RDOCompletoInsert = TablesInsert<'rdos'> & {
  atividades?: TablesInsert<'rdo_atividades'>[]
  mao_obra?: TablesInsert<'rdo_mao_obra'>[]
  equipamentos?: TablesInsert<'rdo_equipamentos'>[]
  ocorrencias?: TablesInsert<'rdo_ocorrencias'>[]
  anexos?: TablesInsert<'rdo_anexos'>[]
  inspecoes_solda?: TablesInsert<'rdo_inspecoes_solda'>[]
  verificacoes_torque?: TablesInsert<'rdo_verificacoes_torque'>[]
}

// Tipos para obra com detalhes
export type ObraCompleta = Obra & {
  responsavel: Usuario | null
  rdos: RDO[]
  tarefas: Tarefa[]
}

// Tipos para autenticação
export interface AuthUser {
  id: string
  email: string
  role: Usuario['role']
  nome: string
  cargo: string | null
}

// Tipos para filtros e consultas
export interface FiltroRDO {
  obra_id?: string
  data_inicio?: string
  data_fim?: string
  status?: RDO['status']
  criado_por?: string
}

export interface FiltroObra {
  status?: Obra['status']
  responsavel_id?: string
  data_inicio?: string
  data_fim?: string
}

export interface FiltroTarefa {
  obra_id?: string
  status?: Tarefa['status']
  prioridade?: Tarefa['prioridade']
  responsavel_id?: string
  data_inicio?: string
  data_fim?: string
}