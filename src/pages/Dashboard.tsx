import { motion } from 'framer-motion';
import { Building2, ListChecks, AlertTriangle, CheckCircle, Clock, Wrench, FileText, BookOpen, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuthContext } from '../contexts/AuthContext';
import { useCurrentUser } from '../stores/useUserStore';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';


const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
};

// Componente isolado para a barra de progresso para evitar alertas de linter sobre style inline
const ProgressBar = ({ progress, colorClass }: { progress: number, colorClass: string }) => {
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
      <div
        ref={(el) => {
          if (el) el.style.width = `${progress}%`;
        }}
        className={`h-2 rounded-full ${colorClass}`}
      />
    </div>
  );
};

export default function Dashboard() {
  const currentUser = useCurrentUser();
  const { logout } = useAuthContext();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [organizationName, setOrganizationName] = useState<string>('Carregando...');

  // States for real data
  const [obras, setObras] = useState<any[]>([]);
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!currentUser?.organizacao_id) return;

      try {
        setLoading(true);

        // Fetch Organization Name
        const { data: orgData, error: orgError } = await supabase
          .from('organizacoes')
          .select('nome')
          .eq('id', currentUser.organizacao_id)
          .single();

        if (orgData && !orgError) {
          setOrganizationName(orgData.nome);
        } else {
          // Fallback or error handling
          console.error('Error fetching org name:', orgError);
          setOrganizationName(orgError ? 'Erro' : 'Não identificada');
        }

        // Fetch Obras (Active)
        const { data: obrasData, error: obrasError } = await supabase
          .from('obras')
          .select('*')
          .eq('organizacao_id', currentUser.organizacao_id)
          .neq('status', 'cancelada') // Show active, paused, finished but maybe filter more in UI
          .order('progresso_geral', { ascending: false })
          .limit(5);

        if (obrasError) {
          console.error('Error fetching obras:', obrasError);
        }

        if (obrasData) {
          setObras(obrasData);
        }

        // Fetch My Pending Tasks (Assignments for current user)
        // If current user is admin, maybe show all pending? For now stick to assigned.
        const { data: tarefasData, error: tarefasError } = await supabase
          .from('tarefas')
          .select(`
                *,
                obra:obras(nome)
            `)
          .eq('organizacao_id', currentUser.organizacao_id)
          .eq('responsavel_id', currentUser.id)
          .in('status', ['pendente', 'em_andamento', 'atrasada'])
          .order('data_fim', { ascending: true })
          .limit(5);

        if (tarefasError) {
          console.error('Error fetching tarefas:', tarefasError);
        }

        if (tarefasData) {
          setTarefas(tarefasData);
        }

      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-10 w-full shadow-sm">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Bem-vindo, {currentUser?.nome || 'Usuário'}, à empresa {organizationName}!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/manual"
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              title="Manual de Instruções"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Manual</span>
            </Link>
            <ThemeToggle />
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              title="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmação de logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Deseja sair?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Você será desconectado da sua conta.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg"
                >
                  Sair
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="p-4 sm:p-6 space-y-6">
        {/* Acesso Rápido */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Acesso Rápido</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link to="/rdo/novo" className="flex flex-col items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
              <FileText className="w-8 h-8 mb-2" />
              <span className="text-sm font-semibold text-center">Novo RDO</span>
            </Link>
            <Link to="/cadastros/obras" className="flex flex-col items-center justify-center p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
              <Building2 className="w-8 h-8 mb-2" />
              <span className="text-sm font-semibold text-center">Nova Obra</span>
            </Link>
            <Link
              to={obras.length > 0 ? `/obra/${obras[0].id}/tarefas` : '/cadastros/obras'}
              className={`flex flex-col items-center justify-center p-4 bg-green-100 dark:bg-green-900/30 rounded-2xl text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <ListChecks className="w-8 h-8 mb-2" />
              <span className="text-sm font-semibold text-center">Apontar Tarefa</span>
            </Link>
            <Link to="/configuracoes" className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Wrench className="w-8 h-8 mb-2" />
              <span className="text-sm font-semibold text-center">Configurar</span>
            </Link>
          </div>
        </motion.div>

        {/* Avisos Importantes */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Avisos Importantes</h2>
          <div className="space-y-3">
            <div className="flex items-center p-4 bg-red-100 dark:bg-red-900/30 rounded-2xl text-red-800 dark:text-red-200">
              <AlertTriangle className="w-6 h-6 mr-3" />
              <div className="flex-1">
                <p className="font-semibold">Segurança</p>
                <p className="text-sm">EPIs da equipe de montagem precisam de inspeção.</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl text-yellow-800 dark:text-yellow-200">
              <Clock className="w-6 h-6 mr-3" />
              <div className="flex-1">
                <p className="font-semibold">Prazo Apertado</p>
                <p className="text-sm">Entrega da estrutura do Setor B vence em 3 dias.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Minhas Tarefas */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Minhas Tarefas Pendentes</h2>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-gray-500">Carregando tarefas...</p>
            ) : tarefas.length === 0 ? (
              <p className="text-gray-500">Nenhuma tarefa pendente encontrada.</p>
            ) : (
              tarefas.map(tarefa => (
                <div key={tarefa.id} className="flex items-center p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                  <CheckCircle className="w-6 h-6 mr-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{tarefa.titulo}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {tarefa.obra?.nome || 'Obra não def.'} - <span className="font-semibold">{tarefa.data_fim ? new Date(tarefa.data_fim).toLocaleDateString() : 'Sem prazo'}</span>
                    </p>
                  </div>
                  {/* Link to obra tasks */}
                  <Link to={`/obra/${tarefa.obra_id}/tarefas`} className="text-blue-600 dark:text-blue-400 font-semibold text-sm">Ver</Link>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Obras em Andamento */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Obras em Andamento</h2>
            <Link to="/cadastros/obras" className="text-blue-600 dark:text-blue-400 font-semibold text-sm">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-gray-500">Carregando obras...</p>
            ) : obras.length === 0 ? (
              <p className="text-gray-500">Nenhuma obra ativa encontrada.</p>
            ) : (
              obras.map(obra => (
                <Link to={`/obra/${obra.id}`} key={obra.id} className="block p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 dark:text-white">{obra.nome}</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{Number(obra.progresso_geral || 0).toFixed(0)}%</p>
                  </div>
                  <ProgressBar progress={Number(obra.progresso_geral || 0)} colorClass={getProgressColor(Number(obra.progresso_geral || 0))} />
                </Link>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}