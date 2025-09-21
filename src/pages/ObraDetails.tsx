import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Camera, Plus, FileText, CheckCircle, Clock, AlertCircle, Edit, Save, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { formatDateBR, convertBRToISO, getCurrentDateBR } from '../utils/dateUtils';

interface RDO {
  id: string;
  data: string;
  status: 'rascunho' | 'enviado' | 'aprovado';
  responsavel: string;
  atividades: number;
  ocorrencias: number;
}

interface Foto {
  id: string;
  url: string;
  data: string;
  descricao: string;
}

const mockRDOs: RDO[] = [
  {
    id: '1',
    data: '2024-01-15',
    status: 'aprovado',
    responsavel: 'João Silva',
    atividades: 5,
    ocorrencias: 0
  },
  {
    id: '2',
    data: '2024-01-14',
    status: 'aprovado',
    responsavel: 'Maria Santos',
    atividades: 3,
    ocorrencias: 1
  },
  {
    id: '3',
    data: '2024-01-13',
    status: 'enviado',
    responsavel: 'Pedro Costa',
    atividades: 4,
    ocorrencias: 0
  },
  {
    id: '4',
    data: '2024-01-12',
    status: 'rascunho',
    responsavel: 'Ana Costa',
    atividades: 2,
    ocorrencias: 0
  },
  {
    id: '5',
    data: '2024-01-11',
    status: 'aprovado',
    responsavel: 'Carlos Lima',
    atividades: 6,
    ocorrencias: 2
  }
];

const mockFotos: Foto[] = [
  {
    id: '1',
    url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=construction%20site%20concrete%20foundation%20work%20modern%20building&image_size=landscape_4_3',
    data: '2024-01-15',
    descricao: 'Fundação do edifício'
  },
  {
    id: '2',
    url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=construction%20workers%20steel%20structure%20building%20site&image_size=landscape_4_3',
    data: '2024-01-14',
    descricao: 'Estrutura metálica'
  },
  {
    id: '3',
    url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=construction%20site%20concrete%20pouring%20workers%20safety%20equipment&image_size=landscape_4_3',
    data: '2024-01-13',
    descricao: 'Concretagem da laje'
  },
  {
    id: '4',
    url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=construction%20site%20electrical%20installation%20modern%20building&image_size=landscape_4_3',
    data: '2024-01-12',
    descricao: 'Instalações elétricas'
  },
  {
    id: '5',
    url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=construction%20site%20plumbing%20installation%20modern%20building&image_size=landscape_4_3',
    data: '2024-01-11',
    descricao: 'Instalações hidráulicas'
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'aprovado': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'enviado': return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'rascunho': return <AlertCircle className="w-4 h-4 text-gray-500" />;
    default: return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'aprovado': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    case 'enviado': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'rascunho': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export default function ObraDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'info' | 'rdos' | 'fotos' | 'tarefas'>('info');

  const obra = {
    id: id || '1',
    nome: 'Edifício Residencial Aurora',
    endereco: 'Rua das Flores, 123 - Centro',
    descricao: 'Edifício residencial de 15 andares com 120 apartamentos',
    dataInicio: '2023-06-01',
    dataPrevistaFim: '2024-12-31',
    progresso: 75,
    status: 'ativa',
    responsavel: 'Eng. Carlos Mendes'
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editedObra, setEditedObra] = useState(obra);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{obra.nome}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {obra.endereco}
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            {[
              { key: 'info', label: 'Informações', icon: FileText },
              { key: 'rdos', label: 'RDOs', icon: FileText },
              { key: 'fotos', label: 'Fotos', icon: Camera },
              { key: 'tarefas', label: 'Tarefas', icon: CheckCircle }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === key
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Informações da Obra */}
        {activeTab === 'info' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detalhes da Obra</h3>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedObra(obra);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          // Atualizar os dados da obra com as alterações
                          Object.assign(obra, editedObra);
                          setIsEditing(false);
                          // TODO: Aqui seria feita a chamada para a API para salvar no backend
                          console.log('Dados salvos:', editedObra);
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Salvar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Descrição</label>
                  {isEditing ? (
                    <textarea
                      value={editedObra.descricao}
                      onChange={(e) => setEditedObra({...editedObra, descricao: e.target.value})}
                      className="w-full mt-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{obra.descricao}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Responsável</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedObra.responsavel}
                      onChange={(e) => setEditedObra({...editedObra, responsavel: e.target.value})}
                      className="w-full mt-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {obra.responsavel}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Data de Início</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedObra.dataInicio}
                      onChange={(e) => setEditedObra({...editedObra, dataInicio: e.target.value})}
                      className="w-full mt-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="dd/mm/aa"
                      maxLength={8}
                      onInput={(e) => {
                        let value = e.currentTarget.value.replace(/\D/g, '');
                        if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
                        if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5, 7);
                        e.currentTarget.value = value;
                      }}
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(obra.dataInicio).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Previsão de Término</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedObra.dataPrevistaFim}
                      onChange={(e) => setEditedObra({...editedObra, dataPrevistaFim: e.target.value})}
                      className="w-full mt-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="dd/mm/aa"
                      maxLength={8}
                      onInput={(e) => {
                        let value = e.currentTarget.value.replace(/\D/g, '');
                        if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
                        if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5, 7);
                        e.currentTarget.value = value;
                      }}
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(obra.dataPrevistaFim).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Progresso</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${obra.progresso}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{obra.progresso}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                to={`/obra/${obra.id}/rdo/novo`}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Criar RDO
              </Link>
              <Link
                to={`/obra/${obra.id}/tarefas`}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                Ver Tarefas
              </Link>
            </div>
          </motion.div>
        )}

        {/* Histórico de RDOs */}
        {activeTab === 'rdos' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Histórico de RDOs</h3>
              <Link
                to={`/obra/${obra.id}/rdo/novo`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Novo RDO
              </Link>
            </div>

            {mockRDOs.map((rdo, index) => (
              <motion.div
                key={rdo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
              >
                <Link to={`/obra/${obra.id}/rdo/${rdo.id}`} className="block">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          RDO - {new Date(rdo.data).toLocaleDateString('pt-BR')}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Por {rdo.responsavel}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(rdo.status)}
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(rdo.status)}`}>
                        {rdo.status.charAt(0).toUpperCase() + rdo.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{rdo.atividades} atividades</span>
                    <span>{rdo.ocorrencias} ocorrências</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Galeria de Fotos */}
        {activeTab === 'fotos' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Galeria de Fotos</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
                Adicionar Foto
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mockFotos.map((foto, index) => (
                <motion.div
                  key={foto.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={foto.url}
                      alt={foto.descricao}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {foto.descricao}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(foto.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tarefas */}
        {activeTab === 'tarefas' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tarefas da Obra</h3>
              <Link
                to={`/obra/${obra.id}/tarefas`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Ver Todas
              </Link>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg text-center">
              <CheckCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">Acesse a página de tarefas para ver o controle completo</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}