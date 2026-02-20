import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Camera, Plus, FileText, CheckCircle, Clock, AlertCircle, Edit, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { supabase } from '../lib/supabase';

interface RDO {
  id: string;
  data: string;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado';
  responsavel: string;
  atividades: number;
  ocorrencias: number;
}

interface Foto {
  id: string;
  url: string;
  data: string;
  descricao: string;
  nome_arquivo: string;
}

interface Obra {
  id: string;
  nome: string;
  endereco: string;
  descricao: string;
  dataInicio: string;
  dataPrevistaFim: string;
  progresso: number;
  status: string;
  responsavel: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'aprovado': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'enviado': return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'rascunho': return <AlertCircle className="w-4 h-4 text-gray-500" />;
    case 'rejeitado': return <X className="w-4 h-4 text-red-500" />;
    default: return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'aprovado': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    case 'enviado': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'rascunho': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    case 'rejeitado': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export default function ObraDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'info' | 'rdos' | 'fotos' | 'tarefas'>('info');

  const [obra, setObra] = useState<Obra | null>(null);
  const [rdos, setRdos] = useState<RDO[]>([]);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editedObra, setEditedObra] = useState<Obra | null>(null);

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (obraId: string) => {
    // Check for valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(obraId)) {
      console.error('ID inválido:', obraId);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch Obra Details from Supabase
      const { data: obraData, error: obraError } = await (supabase.from('obras') as any).select(`*`).eq('id', obraId).single();

      if (obraError) {
        console.error('Erro ao buscar obra:', obraError);
        return;
      }

      if (obraData) {
        setObra({
          id: obraData.id,
          nome: obraData.nome,
          endereco: obraData.endereco || '',
          descricao: obraData.descricao || '',
          dataInicio: obraData.data_inicio || '',
          dataPrevistaFim: obraData.data_prevista_fim || '',
          progresso: obraData.progresso_geral || 0,
          status: obraData.status,
          responsavel: obraData.responsavel_id || ''
        });
        setEditedObra({
          id: obraData.id, // Added id to editedObra
          nome: obraData.nome,
          descricao: obraData.descricao || '',
          endereco: obraData.endereco || '',
          dataInicio: obraData.data_inicio || '',
          dataPrevistaFim: obraData.data_prevista_fim || '',
          progresso: obraData.progresso_geral || 0, // Added progresso
          status: obraData.status,
          responsavel: obraData.responsavel_id || ''
        });
      }

      // Fetch RDOs
      // We need counts of activities and occurences. Supabase allows count on joined tables.
      // But for simplicity/performance in this specialized query, we might fetch them and process, or use RPC if exists.
      // Given the schema, we can try counting IDs.
      const { data: rdosData, error: rdosError } = await supabase
        .from('rdos')
        .select(`
          id,
          data_relatorio,
          status,
          criado_por,
          responsavel:usuarios(nome),
          rdo_atividades(count),
          rdo_ocorrencias(count)
        `)
        .eq('obra_id', obraId)
        .order('data_relatorio', { ascending: false });

      if (rdosError) {
        console.error('Erro ao buscar RDOs:', rdosError);
      } else {
        const mappedRdos: RDO[] = rdosData.map((r: any) => ({
          id: r.id,
          data: r.data_relatorio,
          status: r.status,
          responsavel: r.responsavel?.nome || 'Desconhecido',
          atividades: r.rdo_atividades?.[0]?.count || 0,
          ocorrencias: r.rdo_ocorrencias?.[0]?.count || 0
        }));
        setRdos(mappedRdos);
      }

      // Fetch Fotos (from rdo_anexos where type implies image or just all for now)
      // Assuming we want all attachments for this obra's RDOs? Or just a gallery.
      // The mock showed specific photos. "Galeria de Fotos".
      // Let's fetch attachments linked to RDOs of this obra.
      // This requires a join: rdo_anexos -> rdos -> obra_id = id.
      const { data: fotosData, error: fotosError } = await supabase
        .from('rdo_anexos')
        .select(`
          id,
          url_storage,
          created_at,
          descricao,
          nome_arquivo,
          rdos!inner(obra_id)
        `)
        .eq('rdos.obra_id', obraId)
        .order('created_at', { ascending: false });

      if (fotosError) {
        console.error('Erro ao buscar fotos:', fotosError);
      } else {
        const mappedFotos: Foto[] = fotosData.map((f: any) => ({
          id: f.id,
          url: f.url_storage, // This might need getPublicUrl if it's a path
          data: f.created_at,
          descricao: f.descricao || f.nome_arquivo,
          nome_arquivo: f.nome_arquivo
        }));
        // If url_storage is a path, we should transform it.
        // Assuming for now it is a signed url or public url if stored that way. 
        // If it is a relative path in bucket, we need `supabase.storage.from(...).getPublicUrl(...)`.
        // For the migration script, we might mock URLs or use placeholder.
        setFotos(mappedFotos);
      }

    } catch (error) {
      console.error('Erro geral:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveObra = async () => {
    if (!editedObra || !obra) return;
    try {
      const { error } = await (supabase
        .from('obras') as any)
        .update({
          descricao: editedObra.descricao,
          data_inicio: editedObra.dataInicio,
          data_prevista_fim: editedObra.dataPrevistaFim
        })
        .eq('id', obra.id);

      if (error) throw error;

      setObra(editedObra);
      setIsEditing(false);
    } catch (err) {
      console.error('Erro ao atualizar obra:', err);
      alert('Erro ao atualizar obra');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!obra) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Obra não encontrada</h2>
          <Link to="/cadastros" className="text-blue-600 hover:underline">Voltar para Cadastros</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                to="/cadastros"
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
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1 overflow-x-auto scrollbar-hide">
            {[
              { key: 'info', label: 'Informações', icon: FileText },
              { key: 'rdos', label: 'RDOs', icon: FileText },
              { key: 'fotos', label: 'Fotos', icon: Camera },
              { key: 'tarefas', label: 'Tarefas', icon: CheckCircle }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as 'info' | 'rdos' | 'fotos' | 'tarefas')}
                className={`flex-1 min-w-fit flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === key
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
                        onClick={handleSaveObra}
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
                  {isEditing && editedObra ? (
                    <textarea
                      value={editedObra.descricao}
                      onChange={(e) => setEditedObra({ ...editedObra, descricao: e.target.value })}
                      aria-label="Descrição da obra"
                      className="w-full mt-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{obra.descricao}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Responsável</label>
                  {isEditing && editedObra ? (
                    <input
                      type="text"
                      disabled
                      value={editedObra.responsavel}
                      aria-label="Responsável pela obra"
                      className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-300 cursor-not-allowed"
                      title="Alteração de responsável deve ser feita via admin"
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
                  {isEditing && editedObra ? (
                    <input
                      type="text"
                      value={editedObra.dataInicio}
                      onChange={(e) => setEditedObra({ ...editedObra, dataInicio: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="aaaa-mm-dd"
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
                  {isEditing && editedObra ? (
                    <input
                      type="text"
                      value={editedObra.dataPrevistaFim}
                      onChange={(e) => setEditedObra({ ...editedObra, dataPrevistaFim: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="aaaa-mm-dd"
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
                        /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
                        // @ts-ignore
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

            {rdos.length > 0 ? (
              rdos.map((rdo, index) => (
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
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                Nenhum RDO encontrado.
              </div>
            )}
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
              {fotos.length > 0 ? (
                fotos.map((foto, index) => (
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
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-gray-500">
                  Nenhuma foto encontrada.
                </div>
              )}
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