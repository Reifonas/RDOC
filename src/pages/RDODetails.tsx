import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, MapPin, Clock, Wrench, Users, Truck, AlertTriangle, Camera, FileText, CheckCircle, Edit, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useRDO } from '../hooks/useRDO';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'rascunho': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    case 'enviado': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    case 'aprovado': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    case 'rejeitado': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
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
  // Ajuste simplificado pois o tipo no banco é livre, ou podemos mapear para gravidade
  if (tipo.toLowerCase().includes('crítica') || tipo.toLowerCase().includes('grave')) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  if (tipo.toLowerCase().includes('atenção') || tipo.toLowerCase().includes('alerta')) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
  return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
};

export default function RDODetails() {
  const { obraId, rdoId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('geral');

  const { rdo, loading, error, refetch } = useRDO(rdoId);

  const tabs = [
    { id: 'geral', label: 'Geral', icon: FileText },
    { id: 'atividades', label: 'Atividades', icon: Wrench },
    { id: 'recursos', label: 'Recursos', icon: Users },
    { id: 'ocorrencias', label: 'Ocorrências', icon: AlertTriangle },
    { id: 'fotos', label: 'Fotos', icon: Camera }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando detalhes do RDO...</p>
        </div>
      </div>
    );
  }

  if (error || !rdo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-red-200 dark:border-red-900/30 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Erro ao carregar RDO</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'RDO não encontrado.'}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Voltar</button>
            <button onClick={refetch} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Tentar Novamente</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10 transition-all">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/obra/${obraId}`)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                title="Voltar para a obra"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  RDO - {new Date(rdo.data_relatorio).toLocaleDateString('pt-BR')}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">{rdo.obra?.nome || 'Obra não identificada'}</p>
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

      {/* Tabs - Sticky abaixo do header se necessário, mas aqui deixaremos normal */}
      <div className="px-6 py-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
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
      <div className="px-6 pb-8 max-w-7xl mx-auto">
        {/* Informações Gerais */}
        {activeTab === 'geral' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
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
                    {new Date(rdo.data_relatorio).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Responsável</label>
                  <p className="text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {rdo.criador?.nome || 'Carregando...'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Clima</label>
                  <p className="text-gray-900 dark:text-white">{rdo.condicoes_climaticas}</p>
                </div>
                {/* Temperatura não está no schema principal de rdos, removido ou precisa vir de obs */}
              </div>
            </div>

            {rdo.observacoes_gerais && (
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Observações Gerais</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{rdo.observacoes_gerais}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Atividades */}
        {activeTab === 'atividades' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {rdo.atividades && rdo.atividades.length > 0 ? (
              rdo.atividades.map((atividade, index) => (
                <motion.div
                  key={atividade.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:border-blue-200/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium">
                          {atividade.tipo_atividade}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">{atividade.descricao}</h4>
                      {atividade.localizacao && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {atividade.localizacao}
                        </p>
                      )}
                    </div>
                    {atividade.percentual_concluido != null && (
                      <div className="text-right min-w-[80px]">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {atividade.percentual_concluido}%
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all duration-500"
                            /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
                            // @ts-ignore
                            style={{ width: `${atividade.percentual_concluido}%` }}
                            role="progressbar"
                            aria-label="Progresso da atividade"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma atividade registrada.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Recursos (Mão de Obra e Equipamentos) */}
        {activeTab === 'recursos' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
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
                {rdo.mao_obra && rdo.mao_obra.length > 0 ? (
                  rdo.mao_obra.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.funcao}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Qtd: {item.quantidade}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">{item.horas_trabalhadas}h</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">trabalhadas</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-sm">Nenhuma mão de obra registrada.</p>
                )}
              </div>
            </div>

            {/* Equipamentos */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Equipamentos
              </h3>
              <div className="space-y-3">
                {rdo.equipamentos && rdo.equipamentos.length > 0 ? (
                  rdo.equipamentos.map((equip) => (
                    <div key={equip.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{equip.nome_equipamento}</p>
                        {equip.tipo && <p className="text-sm text-gray-600 dark:text-gray-400">{equip.tipo}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">{equip.horas_utilizadas}h uso</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-sm">Nenhum equipamento registrado.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Ocorrências */}
        {activeTab === 'ocorrencias' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {rdo.ocorrencias && rdo.ocorrencias.length > 0 ? (
              rdo.ocorrencias.map((ocorrencia, index) => (
                <motion.div
                  key={ocorrencia.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getOcorrenciaColor(ocorrencia.gravidade || 'normal')}`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getOcorrenciaColor(ocorrencia.gravidade || 'normal')}`}>
                          {(ocorrencia.gravidade || 'Geral').toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                          {ocorrencia.tipo_ocorrencia}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-white mt-2">{ocorrencia.descricao}</p>
                      {ocorrencia.acao_tomada && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 border-l-2 border-gray-300 pl-3">
                          <span className="font-semibold">Ação tomada:</span> {ocorrencia.acao_tomada}
                        </div>
                      )}
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {rdo.anexos && rdo.anexos.filter(a => a.tipo_arquivo?.startsWith('image/') || true).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {rdo.anexos.map((foto, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group relative"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {foto.url_storage ? (
                        <img
                          src={foto.url_storage}
                          alt={foto.descricao || `Foto ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Camera className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    {foto.descricao && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs truncate">{foto.descricao}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg text-center">
                <Camera className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">Nenhuma foto encontrada neste RDO</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}