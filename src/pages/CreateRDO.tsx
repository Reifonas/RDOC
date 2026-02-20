import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  ArrowLeft, Save, Send, Plus, Trash2, FileText, Users, Wrench, ChevronDown, ChevronUp, ShieldCheck, Camera
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { CameraCapture } from '../components/CameraCapture';
import { useTiposAtividade, useCondicoesClimaticas, useFuncoesCargos } from '../stores/configStore';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { db } from '../db/db';
import { syncService } from '../services/syncService';

const rdoSchema = z.object({
  data_relatorio: z.string().min(1, 'Data é obrigatória'),
  condicoes_climaticas: z.string().min(1, 'Condições climáticas são obrigatórias'),
  observacoes_gerais: z.string().optional(),
});

type RDOFormData = z.infer<typeof rdoSchema>;

// Interfaces específicas
interface Atividade { id: string; tipo: string; descricao: string; localizacao: string; }
interface MaoDeObra { id: string; funcao: string; quantidade: number; horas: number; }


interface InspecaoSolda { id: string; junta: string; status: 'aprovado' | 'reprovado' | 'pendente'; }
interface VerificacaoTorque { id: string; parafuso: string; torque_aplicado: number; status: 'conforme' | 'nao_conforme'; }

export default function CreateRDO() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Hooks do Zustand para popular selects
  const { items: tiposAtividade } = useTiposAtividade();
  const { items: condicoesClimaticas } = useCondicoesClimaticas();

  const { items: funcoesCargos } = useFuncoesCargos();
  const { loading: loadingSupabase, error: errorSupabase } = useSupabaseData();



  const [expandedSections, setExpandedSections] = useState({
    basicas: true, atividades: true, maoObra: true, equipamentos: false, inspecaoQualidade: true, ocorrencias: false, anexos: false
  });

  // Estados para as seções dinâmicas
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [maoDeObra, setMaoDeObra] = useState<MaoDeObra[]>([]);

  const [inspecoesSolda, setInspecaoSolda] = useState<InspecaoSolda[]>([]);
  const [verificacoesTorque, setVerificacaoTorque] = useState<VerificacaoTorque[]>([]);



  // Fotos
  const [showCamera, setShowCamera] = useState(false);
  const [anexos, setAnexos] = useState<File[]>([]);
  const { register, handleSubmit, formState: { errors } } = useForm<RDOFormData>({
    resolver: zodResolver(rdoSchema),
    defaultValues: { data_relatorio: new Date().toISOString().split('T')[0] }
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Funções genéricas para adicionar/remover itens
  const addItem = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, newItem: T) => {
    console.log('🔄 Função addItem executada!');
    console.log('📝 Adicionando item:', newItem);
    console.log('📊 Estado atual antes da adição:', setter);
    setter(prev => {
      console.log('📋 Estado anterior:', prev);
      const newState = [...prev, newItem];
      console.log('✅ Novo estado:', newState);
      return newState;
    });
  };
  const removeItem = <T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>, id: string) => {
    console.log('🗑️ Função removeItem executada!');
    console.log('🔍 Removendo item com ID:', id);
    setter(prev => {
      console.log('📋 Estado anterior:', prev);
      const newState = prev.filter(item => item.id !== id);
      console.log('✅ Novo estado:', newState);
      return newState;
    });
  };


  const onSubmit = async (data: RDOFormData) => {
    const toastId = toast.loading('Processando RDO...');

    // Preparar payload compatível com o banco (snake_case)
    const rdoPayload = {
      rdo: {
        ...data,
        obra_id: id,
        status: 'pendente'
      },
      atividades: atividades.map(a => ({
        tipo_atividade: a.tipo,
        descricao: a.descricao,
        localizacao: a.localizacao
      })),
      mao_obra: maoDeObra.map(m => ({
        funcao: m.funcao,
        quantidade: m.quantidade,
        horas_trabalhadas: m.horas
      })),
      // Adicionar outros relacionamentos conforme necessário
      fotos: anexos, // Arquivos (File/Blob) serão armazenados no IndexedDB
    };

    try {
      if (navigator.onLine) {
        // Tentar salvar e sincronizar imediatamente via Service
        // Adiciona ao Dexie primeiro para garantir persistência
        const uuid = crypto.randomUUID();
        const pendingId = await db.pendingRDOs.add({
          uuid,
          payload: rdoPayload,
          createdAt: new Date().toISOString(),
          status: 'pending',
          updatedAt: new Date().toISOString()
        });

        // Força sincronização
        await syncService.processQueue();

        // Verifica se ainda está pendente ou falhou
        const item = await db.pendingRDOs.get(pendingId);
        if (item && item.status === 'failed') {
          throw new Error('Falha na sincronização');
        } else if (!item) {
          // Se item sumiu, foi syncado e deletado com sucesso
          toast.success("RDO sincronizado com sucesso!", { id: toastId });
        } else {
          toast.success("RDO salvo e sincronizando em segundo plano.", { id: toastId });
        }

      } else {
        throw new Error('Offline');
      }
    } catch (error) {
      console.log('Salvando offline devido a erro ou falta de conexão:', error);

      // Se já não salvou no try (ex: erro de rede direto no if onLine), salva agora
      // Mas minha lógica acima já salva no Dexie antes de tentar sync.
      // Se caiu aqui e foi erro de 'Offline' lançado manualmente:
      if ((error as Error).message === 'Offline') {
        await db.pendingRDOs.add({
          uuid: crypto.randomUUID(),
          payload: rdoPayload,
          createdAt: new Date().toISOString(),
          status: 'pending',
          updatedAt: new Date().toISOString()
        });
        toast.info("Sem internet. RDO salvo no dispositivo.", { id: toastId, duration: 5000 });
      } else {
        // Se foi erro de sync (Item status failed), avisa o user
        toast.warning("RDO salvo localmente, mas houve erro na sincronização. Tentaremos novamente depois.", { id: toastId, duration: 5000 });
      }
    }

    navigate(`/obra/${id}`);
  };

  const SectionHeader = ({ title, icon: Icon, section, count }: { title: string; icon: React.ElementType; section: keyof typeof expandedSections; count?: number; }) => (
    <button type="button" onClick={() => toggleSection(section)} className="w-full flex items-center justify-between p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{title} {count !== undefined && `(${count})`}</h3>
      </div>
      {expandedSections[section] ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">


      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/obra/${id}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl" title="Voltar para a obra"><ArrowLeft className="w-5 h-5" /></Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Criar RDO</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Obra: Edifício Aurora</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Status do carregamento dos dados */}
        {loadingSupabase && (
          <div className="mx-4 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-700 dark:text-blue-300 text-sm">🔄 Carregando dados do Supabase...</p>
          </div>
        )}

        {errorSupabase && (
          <div className="mx-4 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">❌ Erro ao carregar dados: {errorSupabase}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4">
        {/* Informações Básicas */}
        <SectionHeader title="Informações Básicas" icon={FileText} section="basicas" />
        <AnimatePresence>
          {expandedSections.basicas && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Data</label>
                  <input
                    type="date"
                    {...register('data_relatorio')}
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl"
                  />
                  {errors.data_relatorio && <p className="text-red-500 text-sm mt-1">{errors.data_relatorio.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Clima</label>
                  <select {...register('condicoes_climaticas')} aria-label="Condições Climáticas" title="Selecione as condições climáticas" className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white">
                    {condicoesClimaticas.map(c => <option key={c.id} value={c.nome} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">{c.nome}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Observações Gerais</label>
                <textarea {...register('observacoes_gerais')} rows={3} className="w-full p-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Atividades Executadas */}
        <SectionHeader title="Atividades Executadas" icon={Wrench} section="atividades" count={atividades.length} />
        <AnimatePresence>
          {expandedSections.atividades && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg space-y-4">
              {atividades.map((item, index) => (
                <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">Atividade {index + 1}</span>
                    <button type="button" onClick={() => removeItem(setAtividades, item.id)} title="Remover atividade"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                  <select className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" defaultValue="" aria-label="Tipo de Atividade" title="Selecione o tipo de atividade">
                    <option value="" disabled className="text-gray-500 dark:text-gray-400">Selecione o tipo</option>
                    {tiposAtividade.map(t => <option key={t.id} value={t.nome} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">{t.nome}</option>)}
                  </select>
                  <input type="text" placeholder="Localização (Ex: Eixo A, 1º Pavimento)" className="w-full p-2 border rounded" />
                  <textarea placeholder="Descrição detalhada da atividade" rows={2} className="w-full p-2 border rounded" />
                </div>
              ))}
              <button type="button" onClick={() => {
                console.log('🎯 BOTÃO ADICIONAR ATIVIDADE CLICADO!');
                console.log('📊 Estado atual atividades:', atividades);
                alert('Botão Adicionar Atividade clicado!');
                const novaAtividade = { id: Date.now().toString(), tipo: '', descricao: '', localizacao: '' };
                console.log('🆕 Nova atividade a ser adicionada:', novaAtividade);
                addItem(setAtividades, novaAtividade);
                console.log('✅ Função addItem chamada para atividades');
              }} className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-100 text-blue-700 rounded-xl">
                <Plus className="w-5 h-5" /> Adicionar Atividade
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inspeção de Qualidade (Estruturas Metálicas) */}
        <SectionHeader title="Inspeção de Qualidade" icon={ShieldCheck} section="inspecaoQualidade" count={inspecoesSolda.length + verificacoesTorque.length} />
        <AnimatePresence>
          {expandedSections.inspecaoQualidade && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg space-y-4">
              {/* Inspeção de Solda */}
              <h4 className="font-semibold">Inspeção de Solda</h4>
              {inspecoesSolda.map((item, index) => (
                <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg grid grid-cols-3 gap-2 items-center">
                  <input type="text" placeholder={`Junta #${index + 1}`} className="col-span-1 p-2 border rounded" />
                  <select className="col-span-1 p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" aria-label="Status da Solda" title="Selecione o status da solda">
                    <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Aprovado</option>
                    <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Reprovado</option>
                    <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Pendente</option>
                  </select>
                  <button type="button" onClick={() => removeItem(setInspecaoSolda, item.id)} className="justify-self-end" title="Remover inspeção de solda"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              ))}
              <button type="button" onClick={() => {
                console.log('🎯 BOTÃO ADICIONAR INSPEÇÃO DE SOLDA CLICADO!');
                console.log('📊 Estado atual inspeções solda:', inspecoesSolda);
                alert('Botão Adicionar Inspeção de Solda clicado!');
                const novaInspecao = { id: Date.now().toString(), junta: '', status: 'pendente' };
                console.log('🆕 Nova inspeção a ser adicionada:', novaInspecao);
                addItem(setInspecaoSolda, novaInspecao);
                console.log('✅ Função addItem chamada para inspeções de solda');
              }} className="w-full text-sm flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-xl">
                <Plus className="w-4 h-4" /> Adicionar Inspeção de Solda
              </button>

              {/* Verificação de Torque */}
              <h4 className="font-semibold mt-4">Verificação de Torque de Parafusos</h4>
              {verificacoesTorque.map((item, index) => (
                <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg grid grid-cols-3 gap-2 items-center">
                  <input type="text" placeholder={`Parafuso/Lote #${index + 1}`} className="col-span-1 p-2 border rounded" />
                  <select className="col-span-1 p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" aria-label="Status do Torque" title="Selecione o status do torque">
                    <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Conforme</option>
                    <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Não Conforme</option>
                  </select>
                  <button type="button" onClick={() => removeItem(setVerificacaoTorque, item.id)} className="justify-self-end" title="Remover verificação de torque"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              ))}
              <button type="button" onClick={() => {
                console.log('🎯 BOTÃO ADICIONAR VERIFICAÇÃO DE TORQUE CLICADO!');
                console.log('📊 Estado atual verificações torque:', verificacoesTorque);
                alert('Botão Adicionar Verificação de Torque clicado!');
                const novaVerificacao = { id: Date.now().toString(), parafuso: '', torque_aplicado: 0, status: 'conforme' };
                console.log('🆕 Nova verificação a ser adicionada:', novaVerificacao);
                addItem(setVerificacaoTorque, novaVerificacao);
                console.log('✅ Função addItem chamada para verificações de torque');
              }} className="w-full text-sm flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-xl">
                <Plus className="w-4 h-4" /> Adicionar Verificação de Torque
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mão de Obra */}
        <SectionHeader title="Mão de Obra" icon={Users} section="maoObra" count={maoDeObra.length} />
        <AnimatePresence>
          {expandedSections.maoObra && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg space-y-4">
              {maoDeObra.map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg grid grid-cols-4 gap-2 items-center">
                  <select className="col-span-2 p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" aria-label="Função da Mão de Obra" title="Selecione a função">
                    <option value="" disabled className="text-gray-500 dark:text-gray-400">Selecione a função</option>
                    {funcoesCargos.map(f => <option key={f.id} value={f.nome} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">{f.nome}</option>)}
                  </select>
                  <input type="number" placeholder="Qtd" className="p-2 border rounded" />
                  <button type="button" onClick={() => removeItem(setMaoDeObra, item.id)} className="justify-self-end" title="Remover mão de obra"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              ))}
              <button type="button" onClick={() => addItem(setMaoDeObra, { id: Date.now().toString(), funcao: '', quantidade: 1, horas: 8 })} className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-100 text-blue-700 rounded-xl">
                <Plus className="w-5 h-5" /> Adicionar Mão de Obra
              </button>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Registros Fotográficos */}
        <SectionHeader title="Registros Fotográficos" icon={Camera} section="anexos" count={anexos.length} />
        <AnimatePresence>
          {expandedSections.anexos && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg space-y-4">

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {anexos.map((file, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setAnexos(prev => prev.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remover foto"
                      aria-label="Remover foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                      {file.name}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="flex flex-col items-center justify-center gap-2 aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 text-gray-500 hover:text-blue-500 transition-colors bg-gray-50 dark:bg-gray-800/50"
                >
                  <Camera className="w-8 h-8" />
                  <span className="text-sm font-medium">Tirar Foto</span>
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Botões de Ação */}
        <div className="flex gap-4 pt-4">
          <button type="button" className="flex-1 py-3 px-4 rounded-xl bg-gray-600 text-white hover:bg-gray-700 flex items-center justify-center gap-2">
            <Save className="w-5 h-5" /> Salvar Rascunho
          </button>
          <button type="submit" className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2">
            <Send className="w-5 h-5" /> Enviar RDO
          </button>
        </div>
      </form>

      {/* Modal de Câmera */}
      {
        showCamera && (
          <CameraCapture
            onCapture={(file) => {
              setAnexos(prev => [...prev, file]);
              setShowCamera(false);
            }}
            onClose={() => setShowCamera(false)}
          />
        )
      }
    </div >
  );
}