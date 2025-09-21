import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  Wrench,
  Cloud,
  AlertTriangle,
  Users,
  Truck,
  Package,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { TiposAtividadeConfig } from '../components/config/TiposAtividadeConfig';
import { CondicoesClimaticasConfig } from '../components/config/CondicoesClimaticasConfig';
import { TiposOcorrenciaConfig } from '../components/config/TiposOcorrenciaConfig';
import { FuncoesCargosConfig } from '../components/config/FuncoesCargosConfig';
import { TiposEquipamentoConfig } from '../components/config/TiposEquipamentoConfig';
import { MateriaisConfig } from '../components/config/MateriaisConfig';
import { useConfigStore } from '../stores/configStore';

type TabType = 'atividades' | 'clima' | 'ocorrencias' | 'funcoes' | 'equipamentos' | 'materiais';

interface Tab {
  id: TabType;
  label: string;
  icon: any;
  description: string;
  component: React.ComponentType;
}

const tabs: Tab[] = [
  {
    id: 'atividades',
    label: 'Tipos de Atividades',
    icon: Wrench,
    description: 'Configure os tipos de atividades disponíveis para os RDOs',
    component: TiposAtividadeConfig
  },
  {
    id: 'clima',
    label: 'Condições Climáticas',
    icon: Cloud,
    description: 'Gerencie as opções de condições climáticas',
    component: CondicoesClimaticasConfig
  },
  {
    id: 'ocorrencias',
    label: 'Tipos de Ocorrências',
    icon: AlertTriangle,
    description: 'Configure os tipos de ocorrências e incidentes',
    component: TiposOcorrenciaConfig
  },
  {
    id: 'funcoes',
    label: 'Funções/Cargos',
    icon: Users,
    description: 'Gerencie as funções e cargos da equipe',
    component: FuncoesCargosConfig
  },
  {
    id: 'equipamentos',
    label: 'Tipos de Equipamentos',
    icon: Truck,
    description: 'Configure os tipos de equipamentos disponíveis',
    component: TiposEquipamentoConfig
  },
  {
    id: 'materiais',
    label: 'Materiais',
    icon: Package,
    description: 'Gerencie os tipos de materiais utilizados',
    component: MateriaisConfig
  }
];

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState<TabType>('atividades');
  const [showImportExport, setShowImportExport] = useState(false);
  const { exportConfig, importConfig, resetToDefaults } = useConfigStore();

  const handleExport = () => {
    const config = exportConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rdo-configuracoes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        importConfig(content);
        alert('Configurações importadas com sucesso!');
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja restaurar todas as configurações para os valores padrão? Esta ação não pode ser desfeita.')) {
      resetToDefaults();
      alert('Configurações restauradas para os valores padrão!');
    }
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 w-full">
        <div className="px-3 sm:px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
              <Link
                to="/"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">Configurações</h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">Gerencie as listas de seleção do sistema</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="relative">
                <button
                  onClick={() => setShowImportExport(!showImportExport)}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 min-h-[44px] sm:min-h-0"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Gerenciar</span>
                </button>
                
                <AnimatePresence>
                  {showImportExport && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-56 sm:w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                    >
                      <button
                        onClick={handleExport}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-[44px]"
                      >
                        <Download className="w-4 h-4" />
                        Exportar Configurações
                      </button>
                      <label className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer min-h-[44px]">
                        <Upload className="w-4 h-4" />
                        Importar Configurações
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImport}
                          className="hidden"
                        />
                      </label>
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={handleReset}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px]"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restaurar Padrões
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Tabs 2x3 */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl transition-all duration-200 min-h-[72px] sm:min-h-[80px] lg:min-h-[88px] touch-manipulation ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-102'
                  }`}
                >
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  <span className={`font-medium text-xs sm:text-sm text-center leading-tight ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {tab.label.replace('Tipos de ', '').replace('Condições ', '')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto h-[calc(100vh-200px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {ActiveComponent && <ActiveComponent />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}