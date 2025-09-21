import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, MapPin, Clock, Wrench, Users, Truck, AlertTriangle, Camera, FileText, CheckCircle, Edit } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';

interface Atividade {
  id: string;
  tipo: string;
  descricao: string;
  localizacao: string;
  percentual_concluido: number;
  hora_inicio: string;
  hora_fim: string;
}

interface MaoDeObra {
  id: string;
  nome: string;
  funcao: string;
  horas_trabalhadas: number;
}

interface Equipamento {
  id: string;
  nome: string;
  horas_utilizadas: number;
  combustivel_consumido: number;
}

interface Ocorrencia {
  id: string;
  tipo: 'normal' | 'atencao' | 'critica';
  descricao: string;
  hora: string;
}

interface RDOData {
  id: string;
  data: string;
  status: 'rascunho' | 'enviado' | 'aprovado';
  responsavel: string;
  obra: string;
  clima: string;
  temperatura: string;
  observacoes: string;
  atividades: Atividade[];
  maoDeObra: MaoDeObra[];
  equipamentos: Equipamento[];
  ocorrencias: Ocorrencia[];
  fotos: string[];
}

// Mock data para demonstração
const mockRDOData: RDOData = {
  id: '1',
  data: '2024-01-14',
  status: 'aprovado',
  responsavel: 'João Silva',
  obra: 'Edifício Residencial Aurora',
  clima: 'Ensolarado',
  temperatura: '28°C',
  observacoes: 'Dia produtivo, todas as atividades foram executadas conforme planejado. Equipe trabalhou em ritmo acelerado.',
  atividades: [
    {
      id: '1',
      tipo: 'Estrutura',
      descricao: 'Concretagem da laje do 3º pavimento',
      localizacao: '3º Pavimento - Bloco A',
      percentual_concluido: 100,
      hora_inicio: '07:00',
      hora_fim: '12:00'
    },
    {
      id: '2',
      tipo: 'Alvenaria',
      descricao: 'Levantamento de paredes internas',
      localizacao: '2º Pavimento - Apartamentos 201-204',
      percentual_concluido: 75,
      hora_inicio: '13:00',
      hora_fim: '17:00'
    }
  ],
  maoDeObra: [
    {
      id: '1',
      nome: 'Carlos Santos',
      funcao: 'Pedreiro',
      horas_trabalhadas: 8
    },
    {
      id: '2',
      nome: 'Maria Oliveira',
      funcao: 'Servente',
      horas_trabalhadas: 8
    },
    {
      id: '3',
      nome: 'Pedro Costa',
      funcao: 'Armador',
      horas_trabalhadas: 6
    }
  ],
  equipamentos: [
    {
      id: '1',
      nome: 'Betoneira 400L',
      horas_utilizadas: 5,
      combustivel_consumido: 12
    },
    {
      id: '2',
      nome: 'Guincho de Coluna',
      horas_utilizadas: 8,
      combustivel_consumido: 25
    }
  ],
  ocorrencias: [
    {
      id: '1',
      tipo: 'normal',
      descricao: 'Entrega de material conforme programado',
      hora: '08:30'
    },
    {
      id: '2',
      tipo: 'atencao',
      descricao: 'Pequeno atraso na chegada da equipe devido ao trânsito',
      hora: '07:15'
    }
  ],
  fotos: [
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50MSkiLz4KPGV4dCB4PSIyMDAiIHk9IjIwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiI+Rm90byAxPC90ZXh0Pgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudDEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojM0I4MkY2O3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4QjVDRjY7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50MikiLz4KPGV4dCB4PSIyMDAiIHk9IjIwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiI+Rm90byAyPC90ZXh0Pgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudDIiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMTBCOTgxO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMzQjgyRjY7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50MykiLz4KPGV4dCB4PSIyMDAiIHk9IjIwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiI+Rm90byAzPC90ZXh0Pgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudDMiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRjU5RTBCO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNFRjQ0NDQ7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+'
  ]
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'rascunho': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    case 'enviado': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    case 'aprovado': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'rascunho': return <Edit className="w-4 h-4" />;
    case 'enviado': return <Clock className="w-4 h-4" />;
    case 'aprovado': return <CheckCircle className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

const getOcorrenciaColor = (tipo: string) => {
  switch (tipo) {
    case 'normal': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    case 'atencao': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    case 'critica': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  }
};

export default function RDODetails() {
  const { obraId, rdoId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('geral');
  
  // Em uma aplicação real, você buscaria os dados baseado no rdoId
  const rdo = mockRDOData;

  const tabs = [
    { id: 'geral', label: 'Geral', icon: FileText },
    { id: 'atividades', label: 'Atividades', icon: Wrench },
    { id: 'recursos', label: 'Recursos', icon: Users },
    { id: 'ocorrencias', label: 'Ocorrências', icon: AlertTriangle },
    { id: 'fotos', label: 'Fotos', icon: Camera }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/obra/${obraId}`)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  RDO - {new Date(rdo.data).toLocaleDateString('pt-BR')}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">{rdo.obra}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(rdo.status)}`}>
                {getStatusIcon(rdo.status)}
                {rdo.status.charAt(0).toUpperCase() + rdo.status.slice(1)}
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/70 dark:bg-gray-800/70 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        {/* Informações Gerais */}
        {activeTab === 'geral' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Data</label>
                  <p className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(rdo.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Responsável</label>
                  <p className="text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {rdo.responsavel}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Clima</label>
                  <p className="text-gray-900 dark:text-white">{rdo.clima}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Temperatura</label>
                  <p className="text-gray-900 dark:text-white">{rdo.temperatura}</p>
                </div>
              </div>
            </div>

            {rdo.observacoes && (
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Observações</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{rdo.observacoes}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Atividades */}
        {activeTab === 'atividades' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {rdo.atividades.map((atividade, index) => (
              <motion.div
                key={atividade.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium">
                        {atividade.tipo}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {atividade.hora_inicio} - {atividade.hora_fim}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">{atividade.descricao}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {atividade.localizacao}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {atividade.percentual_concluido}%
                    </div>
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${atividade.percentual_concluido}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Recursos (Mão de Obra e Equipamentos) */}
        {activeTab === 'recursos' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Mão de Obra */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Mão de Obra
              </h3>
              <div className="space-y-3">
                {rdo.maoDeObra.map((funcionario) => (
                  <div key={funcionario.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{funcionario.nome}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{funcionario.funcao}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">{funcionario.horas_trabalhadas}h</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">trabalhadas</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipamentos */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Equipamentos
              </h3>
              <div className="space-y-3">
                {rdo.equipamentos.map((equipamento) => (
                  <div key={equipamento.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{equipamento.nome}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{equipamento.horas_utilizadas}h utilizadas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">{equipamento.combustivel_consumido}L</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">combustível</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Ocorrências */}
        {activeTab === 'ocorrencias' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {rdo.ocorrencias.length > 0 ? (
              rdo.ocorrencias.map((ocorrencia, index) => (
                <motion.div
                  key={ocorrencia.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getOcorrenciaColor(ocorrencia.tipo)}`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getOcorrenciaColor(ocorrencia.tipo)}`}>
                          {ocorrencia.tipo.charAt(0).toUpperCase() + ocorrencia.tipo.slice(1)}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ocorrencia.hora}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-white">{ocorrencia.descricao}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">Nenhuma ocorrência registrada neste dia</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Fotos */}
        {activeTab === 'fotos' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {rdo.fotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {rdo.fotos.map((foto, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={foto}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg text-center">
                <Camera className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">Nenhuma foto foi adicionada a este RDO</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}