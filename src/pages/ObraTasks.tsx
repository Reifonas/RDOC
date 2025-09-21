import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  MapPin,
  MoreVertical,
  Edit3,
  Trash2,
  Play,
  Pause,
  Square,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import TaskLogModal from '../components/TaskLogModal';
import { addTaskLogEvent } from '../utils/taskLogManager';

interface Task {
  id: string;
  titulo: string;
  descricao: string;
  obra_id: string;
  obra_nome: string;
  responsavel: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'pendente' | 'em_andamento' | 'pausada' | 'concluida' | 'cancelada';
  data_inicio: string;
  data_prazo: string;
  progresso: number;
  tempo_estimado: number; // em horas
  tempo_trabalhado: number; // em horas
  categoria: string;
  localizacao?: string;
  anexos?: number;
  comentarios?: number;
}

const mockTasks: Task[] = [
  {
    id: '1',
    titulo: 'Concretagem da Laje do 2º Pavimento',
    descricao: 'Executar a concretagem da laje do segundo pavimento conforme projeto estrutural',
    obra_id: '1',
    obra_nome: 'Edifício Residencial Aurora',
    responsavel: 'João Silva',
    prioridade: 'alta',
    status: 'em_andamento',
    data_inicio: '2024-01-15',
    data_prazo: '2024-01-18',
    progresso: 65,
    tempo_estimado: 16,
    tempo_trabalhado: 10.5,
    categoria: 'Estrutura',
    localizacao: '2º Pavimento',
    anexos: 3,
    comentarios: 2
  },
  {
    id: '2',
    titulo: 'Instalação Elétrica - Sala 201',
    descricao: 'Instalação completa do sistema elétrico da sala 201',
    obra_id: '1',
    obra_nome: 'Edifício Residencial Aurora',
    responsavel: 'Carlos Santos',
    prioridade: 'media',
    status: 'pendente',
    data_inicio: '2024-01-20',
    data_prazo: '2024-01-25',
    progresso: 0,
    tempo_estimado: 12,
    tempo_trabalhado: 0,
    categoria: 'Elétrica',
    localizacao: '2º Pavimento - Sala 201',
    anexos: 1,
    comentarios: 0
  },
  {
    id: '3',
    titulo: 'Impermeabilização da Cobertura',
    descricao: 'Aplicação de manta asfáltica na cobertura do edifício',
    obra_id: '1',
    obra_nome: 'Edifício Residencial Aurora',
    responsavel: 'Pedro Costa',
    prioridade: 'critica',
    status: 'pausada',
    data_inicio: '2024-01-12',
    data_prazo: '2024-01-16',
    progresso: 30,
    tempo_estimado: 24,
    tempo_trabalhado: 7,
    categoria: 'Impermeabilização',
    localizacao: 'Cobertura',
    anexos: 2,
    comentarios: 4
  },
  {
    id: '4',
    titulo: 'Pintura Externa - Fachada Norte',
    descricao: 'Aplicação de tinta acrílica na fachada norte do edifício',
    obra_id: '1',
    obra_nome: 'Edifício Residencial Aurora',
    responsavel: 'Ana Costa',
    prioridade: 'baixa',
    status: 'pendente',
    data_inicio: '2024-01-25',
    data_prazo: '2024-02-05',
    progresso: 0,
    tempo_estimado: 32,
    tempo_trabalhado: 0,
    categoria: 'Acabamento',
    localizacao: 'Fachada Norte',
    anexos: 0,
    comentarios: 1
  }
];

const statusConfig = {
  pendente: {
    label: 'Pendente',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    icon: Circle
  },
  em_andamento: {
    label: 'Em Andamento',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    icon: Play
  },
  pausada: {
    label: 'Pausada',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    icon: Pause
  },
  concluida: {
    label: 'Concluída',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    icon: CheckCircle2
  },
  cancelada: {
    label: 'Cancelada',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    icon: Square
  }
};

const prioridadeConfig = {
  baixa: {
    label: 'Baixa',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  },
  media: {
    label: 'Média',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
  },
  alta: {
    label: 'Alta',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
  },
  critica: {
    label: 'Crítica',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  }
};

export default function ObraTasks() {
  const { id } = useParams<{ id: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>('todas');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [obraInfo, setObraInfo] = useState<{ nome: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logTaskId, setLogTaskId] = useState<string | null>(null);

  useEffect(() => {
    // Filtrar tarefas pela obra específica
    const obraTasks = mockTasks.filter(task => task.obra_id === id);
    setTasks(obraTasks);
    
    // Buscar informações da obra
    if (obraTasks.length > 0) {
      setObraInfo({ nome: obraTasks[0].obra_nome });
    }
  }, [id]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || task.status === statusFilter;
    const matchesPrioridade = prioridadeFilter === 'todas' || task.prioridade === prioridadeFilter;
    
    return matchesSearch && matchesStatus && matchesPrioridade;
  });

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      // Registrar evento no log baseado na mudança de status
      if (newStatus === 'em_andamento' && task.status === 'pendente') {
        addTaskLogEvent(taskId, 'start', 'Tarefa iniciada');
      } else if (newStatus === 'em_andamento' && task.status === 'pausada') {
        addTaskLogEvent(taskId, 'resume', 'Tarefa retomada');
      } else if (newStatus === 'pausada') {
        addTaskLogEvent(taskId, 'pause', 'Tarefa pausada');
      } else if (newStatus === 'concluida') {
        addTaskLogEvent(taskId, 'complete', 'Tarefa concluída');
      }
    }
    
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleViewLog = (taskId: string) => {
    setLogTaskId(taskId);
    setShowLogModal(true);
    setSelectedTask(null);
  };

  const handleEditTask = (task: Task) => {
    addTaskLogEvent(task.id, 'edit', 'Tarefa editada');
    setTaskToEdit(task);
    setShowEditModal(true);
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
    setShowDeleteModal(true);
    setSelectedTask(null);
  };

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      setTasks(tasks.filter(task => task.id !== taskToDelete));
      setTaskToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setTaskToDelete(null);
    setShowDeleteModal(false);
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressColor = (progress: number, status: string) => {
    if (status === 'concluida') return 'bg-green-500';
    if (status === 'cancelada') return 'bg-red-500';
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const StatusIcon = statusConfig[task.status].icon;
    const daysUntilDeadline = getDaysUntilDeadline(task.data_prazo);
    const isOverdue = daysUntilDeadline < 0;
    const isUrgent = daysUntilDeadline <= 2 && daysUntilDeadline >= 0;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {task.titulo}
              </h3>
              {(isOverdue || isUrgent) && (
                <AlertCircle className={`w-5 h-5 ${isOverdue ? 'text-red-500' : 'text-yellow-500'}`} />
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              {task.descricao}
            </p>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </button>
            
            <AnimatePresence>
              {selectedTask === task.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                >
                  <div className="p-2">
                    <button 
                      onClick={() => handleViewLog(task.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Ver Log
                    </button>
                    <button 
                      onClick={() => handleEditTask(task)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[task.status].color}`}>
            <StatusIcon className="w-3 h-3 inline mr-1" />
            {statusConfig[task.status].label}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${prioridadeConfig[task.prioridade].color}`}>
            {prioridadeConfig[task.prioridade].label}
          </span>
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
            {task.categoria}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progresso
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {task.progresso}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${task.progresso}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-2 rounded-full ${getProgressColor(task.progresso, task.status)}`}
            />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {task.responsavel}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {task.localizacao || 'Não especificado'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className={`text-sm ${
              isOverdue ? 'text-red-600 dark:text-red-400 font-medium' :
              isUrgent ? 'text-yellow-600 dark:text-yellow-400 font-medium' :
              'text-gray-600 dark:text-gray-300'
            }`}>
              {isOverdue ? `${Math.abs(daysUntilDeadline)} dias atrasado` :
               daysUntilDeadline === 0 ? 'Vence hoje' :
               `${daysUntilDeadline} dias restantes`}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {task.tempo_trabalhado}h / {task.tempo_estimado}h
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {task.status === 'pendente' && (
            <button
              onClick={() => updateTaskStatus(task.id, 'em_andamento')}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Iniciar
            </button>
          )}
          
          {task.status === 'em_andamento' && (
            <>
              <button
                onClick={() => updateTaskStatus(task.id, 'pausada')}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors"
              >
                <Pause className="w-4 h-4" />
                Pausar
              </button>
              <button
                onClick={() => updateTaskStatus(task.id, 'concluida')}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Concluir
              </button>
            </>
          )}
          
          {task.status === 'pausada' && (
            <button
              onClick={() => updateTaskStatus(task.id, 'em_andamento')}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Retomar
            </button>
          )}
          
          {task.status === 'concluida' && (
            <div className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              Concluída
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                to={`/obra/${id}`}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Tarefas da Obra
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {obraInfo?.nome || 'Carregando...'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                to={`/obra/${id}/tarefa/nova`}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Nova Tarefa
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                  showFilters
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                    : 'bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filtros
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    >
                      <option value="todos">Todos os Status</option>
                      <option value="pendente">Pendente</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="pausada">Pausada</option>
                      <option value="concluida">Concluída</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prioridade
                    </label>
                    <select
                      value={prioridadeFilter}
                      onChange={(e) => setPrioridadeFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    >
                      <option value="todas">Todas as Prioridades</option>
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="px-6 py-6">
        {filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhuma tarefa encontrada
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {tasks.length === 0 
                  ? 'Esta obra ainda não possui tarefas cadastradas'
                  : 'Tente ajustar os filtros ou criar uma nova tarefa'
                }
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={cancelDelete}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Excluir Tarefa
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Esta ação não pode ser desfeita
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Tem certeza que deseja excluir esta tarefa? Todos os dados relacionados serão perdidos permanentemente.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteTask}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {showEditModal && taskToEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Edit3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Editar Tarefa
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Modifique os dados da tarefa
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    defaultValue={taskToEdit.titulo}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    rows={3}
                    defaultValue={taskToEdit.descricao}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      defaultValue={taskToEdit.status}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="pausada">Pausada</option>
                      <option value="concluida">Concluída</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prioridade
                    </label>
                    <select
                      defaultValue={taskToEdit.prioridade}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    >
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Responsável
                    </label>
                    <input
                      type="text"
                      defaultValue={taskToEdit.responsavel}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Progresso (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={taskToEdit.progresso}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    // Aqui seria implementada a lógica de salvar as alterações
                    setShowEditModal(false);
                    setTaskToEdit(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}      </AnimatePresence>

      {/* Task Log Modal */}
      {showLogModal && logTaskId && (
        <TaskLogModal
          taskId={logTaskId}
          taskTitle={tasks.find(t => t.id === logTaskId)?.titulo || 'Tarefa'}
          isOpen={showLogModal}
          onClose={() => {
            setShowLogModal(false);
            setLogTaskId(null);
          }}
        />
      )}
    </div>
  );
}