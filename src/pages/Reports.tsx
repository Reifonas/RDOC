import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Building2,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Printer,
  Mail,
  Share2,
  Settings,
  Search
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { toast } from 'sonner';
import { formatDateBR, convertBRToISO, getCurrentDateBR } from '../utils/dateUtils';

interface ReportData {
  id: string;
  title: string;
  description: string;
  type: 'obras' | 'rdos' | 'equipamentos' | 'usuarios' | 'financeiro' | 'produtividade';
  icon: any;
  data: any;
  lastGenerated: string;
  status: 'updated' | 'outdated' | 'generating';
}

interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  obras: string[];
  status: string[];
  usuarios: string[];
}

const mockReports: ReportData[] = [
  {
    id: '1',
    title: 'Relatório de Obras',
    description: 'Status geral das obras em andamento',
    type: 'obras',
    icon: Building2,
    data: {
      total: 15,
      em_andamento: 8,
      concluidas: 5,
      pausadas: 2,
      progresso_medio: 67
    },
    lastGenerated: '2024-01-15T10:30:00',
    status: 'updated'
  },
  {
    id: '2',
    title: 'Relatório de RDOs',
    description: 'Análise dos relatórios diários de obra',
    type: 'rdos',
    icon: FileText,
    data: {
      total_mes: 124,
      pendentes: 8,
      aprovados: 110,
      rejeitados: 6,
      media_diaria: 4.1
    },
    lastGenerated: '2024-01-15T09:15:00',
    status: 'updated'
  },
  {
    id: '3',
    title: 'Relatório de Equipamentos',
    description: 'Status e utilização dos equipamentos',
    type: 'equipamentos',
    icon: Wrench,
    data: {
      total: 45,
      em_uso: 32,
      disponivel: 8,
      manutencao: 3,
      inativo: 2,
      taxa_utilizacao: 71
    },
    lastGenerated: '2024-01-15T08:45:00',
    status: 'updated'
  },
  {
    id: '4',
    title: 'Relatório de Produtividade',
    description: 'Análise de produtividade por obra e equipe',
    type: 'produtividade',
    icon: TrendingUp,
    data: {
      eficiencia_media: 85,
      horas_trabalhadas: 1240,
      atividades_concluidas: 89,
      atrasos: 12,
      meta_mensal: 95
    },
    lastGenerated: '2024-01-15T07:20:00',
    status: 'outdated'
  },
  {
    id: '5',
    title: 'Relatório Financeiro',
    description: 'Custos e orçamentos das obras',
    type: 'financeiro',
    icon: BarChart3,
    data: {
      orcamento_total: 12500000,
      gasto_atual: 8750000,
      economia: 125000,
      obras_no_orcamento: 12,
      obras_acima_orcamento: 3
    },
    lastGenerated: '2024-01-14T16:30:00',
    status: 'outdated'
  },
  {
    id: '6',
    title: 'Relatório de Usuários',
    description: 'Atividade e engajamento dos usuários',
    type: 'usuarios',
    icon: Users,
    data: {
      total_usuarios: 28,
      ativos_mes: 24,
      novos_cadastros: 3,
      ultimo_acesso_medio: 2,
      rdos_por_usuario: 4.4
    },
    lastGenerated: '2024-01-15T11:00:00',
    status: 'updated'
  }
];

const statusConfig = {
  updated: {
    label: 'Atualizado',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    icon: CheckCircle
  },
  outdated: {
    label: 'Desatualizado',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    icon: AlertTriangle
  },
  generating: {
    label: 'Gerando...',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    icon: Clock
  }
};

const exportFormats = [
  { id: 'pdf', label: 'PDF', icon: FileText },
  { id: 'excel', label: 'Excel', icon: BarChart3 },
  { id: 'csv', label: 'CSV', icon: FileText }
];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      start: '2024-01-01',
      end: '2024-01-31'
    },
    obras: [],
    status: [],
    usuarios: []
  });
  const [generatingReports, setGeneratingReports] = useState<string[]>([]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleGenerateReport = async (reportId: string) => {
    setGeneratingReports(prev => [...prev, reportId]);
    
    // Simular geração do relatório
    setTimeout(() => {
      setGeneratingReports(prev => prev.filter(id => id !== reportId));
      // Aqui você faria a chamada real para gerar o relatório
      console.log(`Relatório ${reportId} gerado com sucesso`);
    }, 3000);
  };

  const handleExportReport = (reportId: string, format: string) => {
    // Aqui você implementaria a lógica de exportação
    console.log(`Exportando relatório ${reportId} em formato ${format}`);
  };

  const ReportCard = ({ report }: { report: ReportData }) => {
    const Icon = report.icon;
    const StatusIcon = statusConfig[report.status].icon;
    const isGenerating = generatingReports.includes(report.id);
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {report.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {report.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isGenerating ? statusConfig.generating.color : statusConfig[report.status].color
            }`}>
              <StatusIcon className="w-3 h-3" />
              {isGenerating ? 'Gerando...' : statusConfig[report.status].label}
            </span>
          </div>
        </div>

        {/* Dados do Relatório */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {report.type === 'obras' && (
            <>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {report.data.total}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Total</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {report.data.em_andamento}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Em Andamento</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {report.data.progresso_medio}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Progresso Médio</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {report.data.concluidas}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Concluídas</div>
              </div>
            </>
          )}
          
          {report.type === 'rdos' && (
            <>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {report.data.total_mes}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Total do Mês</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {report.data.aprovados}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Aprovados</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {report.data.pendentes}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Pendentes</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {report.data.media_diaria}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Média Diária</div>
              </div>
            </>
          )}
          
          {report.type === 'equipamentos' && (
            <>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {report.data.total}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Total</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {report.data.em_uso}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Em Uso</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {report.data.taxa_utilizacao}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Taxa Utilização</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {report.data.manutencao}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Manutenção</div>
              </div>
            </>
          )}
          
          {report.type === 'financeiro' && (
            <>
              <div className="col-span-2 text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(report.data.orcamento_total)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Orçamento Total</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(report.data.gasto_atual)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Gasto Atual</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(report.data.economia)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Economia</div>
              </div>
            </>
          )}
          
          {(report.type === 'produtividade' || report.type === 'usuarios') && (
            <>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {report.type === 'produtividade' ? `${report.data.eficiencia_media}%` : report.data.total_usuarios}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {report.type === 'produtividade' ? 'Eficiência' : 'Total Usuários'}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {report.type === 'produtividade' ? report.data.atividades_concluidas : report.data.ativos_mes}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {report.type === 'produtividade' ? 'Atividades' : 'Ativos'}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {report.type === 'produtividade' ? report.data.horas_trabalhadas : report.data.novos_cadastros}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {report.type === 'produtividade' ? 'Horas' : 'Novos'}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {report.type === 'produtividade' ? report.data.atrasos : report.data.rdos_por_usuario}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {report.type === 'produtividade' ? 'Atrasos' : 'RDOs/Usuário'}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Última atualização: {formatDate(report.lastGenerated)}
          </span>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Visualizar
          </button>
          
          <button
            onClick={() => handleGenerateReport(report.id)}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Settings className="w-4 h-4" />
              </motion.div>
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isGenerating ? 'Gerando...' : 'Gerar'}
          </button>
        </div>

        {/* Opções de Exportação */}
        <AnimatePresence>
          {selectedReport === report.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Exportar Relatório
              </h4>
              
              <div className="grid grid-cols-3 gap-2 mb-3">
                {exportFormats.map((format) => {
                  const FormatIcon = format.icon;
                  return (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedFormat === format.id
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <FormatIcon className="w-4 h-4" />
                      {format.label}
                    </button>
                  );
                })}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportReport(report.id, selectedFormat)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Exportar {selectedFormat.toUpperCase()}
                </button>
                
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Printer className="w-4 h-4" />
                </button>
                
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Mail className="w-4 h-4" />
                </button>
                
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Relatórios
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Análises e relatórios consolidados do sistema
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar relatórios..."
                  className="pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <ThemeToggle />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-colors ${
                  showFilters
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                    : 'bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filtros Avançados
              </button>
            </div>
          </div>

          {/* Filtros */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-600"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 inline mr-2" />
                      Data Início
                    </label>
                    <input
                      type="text"
                      value={filters.dateRange.start}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="dd/mm/aa"
                      maxLength={8}
                      onInput={(e) => {
                        let value = e.currentTarget.value.replace(/\D/g, '');
                        if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
                        if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5, 7);
                        e.currentTarget.value = value;
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 inline mr-2" />
                      Data Fim
                    </label>
                    <input
                      type="text"
                      value={filters.dateRange.end}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="dd/mm/aa"
                      maxLength={8}
                      onInput={(e) => {
                        let value = e.currentTarget.value.replace(/\D/g, '');
                        if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
                        if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5, 7);
                        e.currentTarget.value = value;
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Obras
                    </label>
                    <select className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Todas as obras</option>
                      <option value="1">Edifício Residencial Aurora</option>
                      <option value="2">Centro Comercial Plaza</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500 inline mr-2" />
                      Status
                    </label>
                    <select className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Todos os status</option>
                      <option value="updated">Atualizado</option>
                      <option value="outdated">Desatualizado</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <button className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    Limpar Filtros
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Aplicar Filtros
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {mockReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}