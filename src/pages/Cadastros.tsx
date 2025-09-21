import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Truck,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  Shield,
  MoreVertical,
  Eye,
  Edit3,
  Trash2,
  Settings,
  Wrench
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

interface Obra {
  id: string;
  nome: string;
  endereco: string;
  cliente: string;
  responsavel: string;
  data_inicio: string;
  data_previsao: string;
  status: 'planejamento' | 'em_andamento' | 'pausada' | 'concluida';
  progresso: number;
  orcamento: number;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  funcao: string;
  empresa: string;
  status: 'ativo' | 'inativo';
  data_cadastro: string;
  ultimo_acesso: string;
}

interface Equipamento {
  id: string;
  nome: string;
  tipo: string;
  modelo: string;
  fabricante: string;
  ano_fabricacao: number;
  numero_serie: string;
  status: 'disponivel' | 'em_uso' | 'manutencao' | 'inativo';
  obra_atual?: string;
  proximo_manutencao: string;
}

const mockObras: Obra[] = [
  {
    id: '1',
    nome: 'Edifício Residencial Aurora',
    endereco: 'Rua das Flores, 123 - Centro',
    cliente: 'Construtora ABC Ltda',
    responsavel: 'João Silva',
    data_inicio: '2024-01-01',
    data_previsao: '2024-12-31',
    status: 'em_andamento',
    progresso: 45,
    orcamento: 2500000
  },
  {
    id: '2',
    nome: 'Centro Comercial Plaza',
    endereco: 'Av. Principal, 456 - Bairro Novo',
    cliente: 'Investimentos XYZ S.A.',
    responsavel: 'Maria Santos',
    data_inicio: '2024-02-15',
    data_previsao: '2025-06-30',
    status: 'em_andamento',
    progresso: 25,
    orcamento: 5000000
  }
];

const mockUsuarios: Usuario[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao.silva@empresa.com',
    telefone: '(11) 99999-9999',
    funcao: 'Engenheiro Civil',
    empresa: 'Construtora ABC',
    status: 'ativo',
    data_cadastro: '2024-01-01',
    ultimo_acesso: '2024-01-15'
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria.santos@empresa.com',
    telefone: '(11) 88888-8888',
    funcao: 'Arquiteta',
    empresa: 'Construtora ABC',
    status: 'ativo',
    data_cadastro: '2024-01-05',
    ultimo_acesso: '2024-01-14'
  }
];

const mockEquipamentos: Equipamento[] = [
  {
    id: '1',
    nome: 'Betoneira 400L',
    tipo: 'Betoneira',
    modelo: 'BT-400',
    fabricante: 'Menegotti',
    ano_fabricacao: 2022,
    numero_serie: 'BT400-2022-001',
    status: 'em_uso',
    obra_atual: 'Edifício Residencial Aurora',
    proximo_manutencao: '2024-03-01'
  },
  {
    id: '2',
    nome: 'Guindaste 20T',
    tipo: 'Guindaste',
    modelo: 'GR-20',
    fabricante: 'Liebherr',
    ano_fabricacao: 2021,
    numero_serie: 'GR20-2021-005',
    status: 'disponivel',
    proximo_manutencao: '2024-02-15'
  }
];

type TabType = 'obras' | 'usuarios' | 'equipamentos';

const statusConfig = {
  obras: {
    planejamento: { label: 'Planejamento', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
    em_andamento: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    pausada: { label: 'Pausada', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
    concluida: { label: 'Concluída', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' }
  },
  usuarios: {
    ativo: { label: 'Ativo', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    inativo: { label: 'Inativo', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' }
  },
  equipamentos: {
    disponivel: { label: 'Disponível', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    em_uso: { label: 'Em Uso', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    manutencao: { label: 'Manutenção', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
    inativo: { label: 'Inativo', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' }
  }
};

export default function Cadastros() {
  const [activeTab, setActiveTab] = useState<TabType>('obras');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const tabs = [
    { id: 'obras' as TabType, label: 'Obras', icon: Building2, count: mockObras.length },
    { id: 'usuarios' as TabType, label: 'Usuários', icon: Users, count: mockUsuarios.length },
    { id: 'equipamentos' as TabType, label: 'Equipamentos', icon: Wrench, count: mockEquipamentos.length }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const ObraCard = ({ obra }: { obra: Obra }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
            {obra.nome}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4" />
              {obra.endereco}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <User className="w-4 h-4" />
              {obra.cliente}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Calendar className="w-4 h-4" />
              {formatDate(obra.data_inicio)} - {formatDate(obra.data_previsao)}
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setSelectedItem(selectedItem === obra.id ? null : obra.id)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </button>
          
          <AnimatePresence>
            {selectedItem === obra.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10"
              >
                <div className="p-2">
                  <Link
                    to={`/obra/${obra.id}`}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Visualizar
                  </Link>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Edit3 className="w-4 h-4" />
                    Editar
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.obras[obra.status].color}`}>
          {statusConfig.obras[obra.status].label}
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {formatCurrency(obra.orcamento)}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progresso
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {obra.progresso}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${obra.progresso}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-2 bg-blue-500 rounded-full"
          />
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-300">
        <strong>Responsável:</strong> {obra.responsavel}
      </div>
    </motion.div>
  );

  const UsuarioCard = ({ usuario }: { usuario: Usuario }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {usuario.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {usuario.nome}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {usuario.funcao}
            </p>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setSelectedItem(selectedItem === usuario.id ? null : usuario.id)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </button>
          
          <AnimatePresence>
            {selectedItem === usuario.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10"
              >
                <div className="p-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                    Visualizar
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Edit3 className="w-4 h-4" />
                    Editar
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Mail className="w-4 h-4" />
          {usuario.email}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Phone className="w-4 h-4" />
          {usuario.telefone}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Building2 className="w-4 h-4" />
          {usuario.empresa}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.usuarios[usuario.status].color}`}>
          {statusConfig.usuarios[usuario.status].label}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Último acesso: {formatDate(usuario.ultimo_acesso)}
        </span>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Cadastrado em: {formatDate(usuario.data_cadastro)}
      </div>
    </motion.div>
  );

  const EquipamentoCard = ({ equipamento }: { equipamento: Equipamento }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
            {equipamento.nome}
          </h3>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Tipo:</strong> {equipamento.tipo}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Modelo:</strong> {equipamento.modelo}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Fabricante:</strong> {equipamento.fabricante}
            </p>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setSelectedItem(selectedItem === equipamento.id ? null : equipamento.id)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </button>
          
          <AnimatePresence>
            {selectedItem === equipamento.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10"
              >
                <div className="p-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                    Visualizar
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                    Manutenção
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Edit3 className="w-4 h-4" />
                    Editar
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.equipamentos[equipamento.status].color}`}>
          {statusConfig.equipamentos[equipamento.status].label}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {equipamento.ano_fabricacao}
        </span>
      </div>

      {equipamento.obra_atual && (
        <div className="mb-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Obra atual:</strong> {equipamento.obra_atual}
          </p>
        </div>
      )}

      <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
        <p><strong>Série:</strong> {equipamento.numero_serie}</p>
        <p><strong>Próxima manutenção:</strong> {formatDate(equipamento.proximo_manutencao)}</p>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'obras':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {mockObras.map((obra) => (
                <ObraCard key={obra.id} obra={obra} />
              ))}
            </AnimatePresence>
          </div>
        );
      case 'usuarios':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {mockUsuarios.map((usuario) => (
                <UsuarioCard key={usuario.id} usuario={usuario} />
              ))}
            </AnimatePresence>
          </div>
        );
      case 'equipamentos':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {mockEquipamentos.map((equipamento) => (
                <EquipamentoCard key={equipamento.id} equipamento={equipamento} />
              ))}
            </AnimatePresence>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Cadastros
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Gerencie obras, usuários e equipamentos
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                to={`/cadastros/${activeTab}/new`}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Novo {activeTab === 'obras' ? 'Obra' : activeTab === 'usuarios' ? 'Usuário' : 'Equipamento'}
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder={`Buscar ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {renderContent()}
      </div>
    </div>
  );
}