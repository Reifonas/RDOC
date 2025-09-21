import { motion } from 'framer-motion';
import { Plus, Building2, ListChecks, AlertTriangle, CheckCircle, Clock, Wrench, FileText, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

const mockObras = [
  { id: '1', nome: 'Edifício Residencial Aurora', progresso: 75, status: 'ativa' },
  { id: '2', nome: 'Shopping Center Plaza', progresso: 45, status: 'ativa' },
  { id: '3', nome: 'Condomínio Jardim Verde', progresso: 90, status: 'pausada' },
];

const mockTarefas = [
  { id: '1', titulo: 'Verificar torque dos parafusos - Setor A', obra: 'Ed. Aurora', prazo: 'Hoje' },
  { id: '2', titulo: 'Aprovar RDO 15/01', obra: 'Shopping Plaza', prazo: 'Amanhã' },
];

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
};

export default function Dashboard() {
  return (
    <>
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Bem-vindo, Engenheiro!</p>
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
          </div>
        </div>
      </div>

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
            <Link to="/obra/1/tarefas" className="flex flex-col items-center justify-center p-4 bg-green-100 dark:bg-green-900/30 rounded-2xl text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
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
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Minhas Tarefas Pendentes</h2>
          <div className="space-y-3">
            {mockTarefas.map(tarefa => (
              <div key={tarefa.id} className="flex items-center p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <CheckCircle className="w-6 h-6 mr-4 text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{tarefa.titulo}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{tarefa.obra} - <span className="font-semibold">{tarefa.prazo}</span></p>
                </div>
                <Link to={`/obra/1/tarefas`} className="text-blue-600 dark:text-blue-400 font-semibold text-sm">Ver</Link>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Obras em Andamento */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Obras em Andamento</h2>
            <Link to="/cadastros/obras" className="text-blue-600 dark:text-blue-400 font-semibold text-sm">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {mockObras.filter(o => o.status === 'ativa').map(obra => (
              <Link to={`/obra/${obra.id}`} key={obra.id} className="block p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 dark:text-white">{obra.nome}</p>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{obra.progresso}%</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div className={`h-2 rounded-full ${getProgressColor(obra.progresso)}`} style={{ width: `${obra.progresso}%` }}></div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}