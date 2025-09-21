import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Home, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  ArrowLeft,
  Settings,
  Plus,
  FileText,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  Upload,
  ExternalLink,
  Globe,
  Zap,
  Shield,
  AlertTriangle,
  Info,
  TrendingUp,
  DollarSign,
  Truck,
  Building,
  Download,
  WifiOff,
  Database,
  RefreshCw,
  Smartphone,
  HardDrive,
  Palette,
  ShieldCheck,
  Cloud,
  MapPin,
  Trash2,
  Lightbulb,
  Camera,
  Moon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

interface Capitulo {
  id: string;
  titulo: string;
  icone: React.ReactNode;
  conteudo: React.ReactNode;
}

const capitulos: Capitulo[] = [
  {
    id: 'introducao',
    titulo: 'Bem-vindo ao App RDO da TrackSteel',
    icone: <BookOpen className="w-5 h-5" />,
    conteudo: (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
          <h3 className="text-lg sm:text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">🎉 Parabéns por escolher o App RDO!</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Seu assistente completo para gerenciamento de obras e relatórios diários de obra (RDO). 
            O App RDO é como ter um assistente pessoal que nunca esquece de nada e está sempre pronto para ajudar!
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              O que você vai aprender
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Como navegar pelo aplicativo</li>
              <li>• Criar e gerenciar suas obras</li>
              <li>• Fazer RDOs completos e profissionais</li>
              <li>• Acompanhar progresso e métricas</li>
              <li>• Trabalhar offline e sincronizar</li>
            </ul>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Tempo de leitura
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Este manual foi feito para ser lido como um livro. Reserve cerca de 15-20 minutos para uma leitura completa, 
              ou navegue pelos capítulos conforme sua necessidade.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'primeiros-passos',
    titulo: 'Primeiros Passos',
    icone: <Home className="w-5 h-5" />,
    conteudo: (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/50">
          <h3 className="text-lg sm:text-xl font-semibold text-green-900 dark:text-green-100 mb-3">🚀 Vamos começar sua jornada!</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Pense no App RDO como sua nova casa digital para gerenciar obras. Assim como quando você chega em uma casa nova, 
            vamos fazer um tour pelos cômodos principais para você se sentir em casa!
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              1. O Dashboard - Sua Central de Comando
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              O Dashboard é como a sala de estar da sua casa - é onde você vê tudo que está acontecendo de uma só vez. 
              Aqui você encontra:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">📊 Resumo das Obras</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Quantas obras ativas, pausadas e concluídas</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">📋 RDOs do Dia</p>
                <p className="text-xs text-green-700 dark:text-green-300">Quantos relatórios foram feitos hoje</p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">🚀 Botões de Ação Rápida:</h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                  <Plus className="w-3 h-3" />
                  <span>Novo RDO</span>
                </div>
                <div className="flex items-center gap-1 text-purple-700 dark:text-purple-300">
                  <Plus className="w-3 h-3" />
                  <span>Nova Obra</span>
                </div>
                <div className="flex items-center gap-1 text-green-700 dark:text-green-300">
                  <FileText className="w-3 h-3" />
                  <span>Apontar Tarefa</span>
                </div>
                <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <Settings className="w-3 h-3" />
                  <span>Configurações</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-500" />
              2. Botões Importantes no Topo
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              No canto superior direito, você encontra três botões essenciais:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Manual</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">- Este botão que você clicou para chegar aqui!</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Settings className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Configurações</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">- Para personalizar listas e opções</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'criando-obra',
    titulo: 'Criando sua Primeira Obra',
    icone: <Plus className="w-5 h-5" />,
    conteudo: (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50">
          <h3 className="text-lg sm:text-xl font-semibold text-purple-900 dark:text-purple-100 mb-3">🏗️ Hora de criar sua primeira obra!</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Criar uma obra no app é como plantar uma semente em um jardim. Você vai dar todas as informações necessárias 
            para que ela cresça e seja bem cuidada durante todo o processo.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Encontre o Botão "Nova Obra"
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              No Dashboard, procure pelo botão azul "Nova Obra" no canto superior direito da seção "Suas Obras". 
              É como um botão mágico que abre as portas para sua nova construção!
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <strong>Dica:</strong> O botão tem um ícone de "+" e é bem visível!
              </p>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              Preencha as Informações
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Quando clicar no botão, uma janela vai aparecer pedindo algumas informações básicas. 
              É como preencher uma ficha de identificação da sua obra:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">📝 Nome da Obra</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Ex: "Edifício Residencial Aurora"</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">📍 Endereço</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Onde a obra está localizada</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">👤 Cliente</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Quem contratou a obra</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">📅 Datas</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Início e fim previsto</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'fazendo-rdo',
    titulo: 'Fazendo seu Primeiro RDO',
    icone: <FileText className="w-5 h-5" />,
    conteudo: (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-orange-200/50 dark:border-orange-700/50">
          <h3 className="text-lg sm:text-xl font-semibold text-orange-900 dark:text-orange-100 mb-3">📋 Seu primeiro Relatório Diário de Obra!</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            O RDO é como um diário da sua obra. Imagine que você está contando para um amigo tudo que aconteceu 
            no canteiro hoje - quem trabalhou, que atividades foram feitas, se choveu, se houve algum problema...
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Acesse a Obra
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              No Dashboard, você verá todas as suas obras em cartões. Cada cartão tem dois botões importantes:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-center gap-3">
                <Plus className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Criar RDO</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Para fazer um novo relatório</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Ver Detalhes</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Para ver todos os RDOs</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              Preencha o Relatório
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              O RDO é organizado em seções expansíveis para facilitar o preenchimento:
            </p>
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Informações Básicas
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">Data, condições climáticas e observações gerais</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Atividades Executadas
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Tipo, localização e descrição das atividades</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Mão de Obra & Equipamentos
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">Equipe, funções, horas e equipamentos utilizados</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Inspeção de Qualidade
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">Controle de soldas, torque e qualidade</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Ocorrências & Anexos
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">Incidentes, fotos e documentos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'acompanhando-progresso',
    titulo: 'Acompanhando o Progresso',
    icone: <BarChart3 className="w-5 h-5" />,
    conteudo: (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-teal-200/50 dark:border-teal-700/50">
          <h3 className="text-lg sm:text-xl font-semibold text-teal-900 dark:text-teal-100 mb-3">📈 Vendo sua obra crescer!</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Acompanhar o progresso da obra é como assistir uma planta crescer. A cada dia, você pode ver 
            o quanto avançou e o que ainda falta para chegar ao final. O app te mostra isso de forma visual e fácil!
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-500" />
              Sistema de Relatórios Avançado
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Acesse relatórios detalhados com filtros personalizáveis e exportação em múltiplos formatos:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Relatório de Produtividade
                </h5>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Análise de rendimento por equipe, atividade e período com gráficos interativos.
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h5 className="font-semibold text-green-900 dark:text-green-300 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Relatório Financeiro
                </h5>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Controle de custos, orçamento vs realizado e projeções financeiras.
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h5 className="font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Relatório de Equipamentos
                </h5>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  Utilização, manutenção e custos operacionais dos equipamentos.
                </p>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <h5 className="font-semibold text-orange-900 dark:text-orange-300 mb-2 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Relatório de Obras
                </h5>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  Progresso geral, marcos e cronograma de cada obra.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportação Flexível
              </h5>
              <p className="text-sm text-gray-700 dark:text-gray-400 mb-2">
                Exporte seus relatórios em diferentes formatos:
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded">PDF</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded">Excel</span>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded">CSV</span>
                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs rounded">JSON</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Status das Obras
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Cada obra tem um status que te conta rapidamente como ela está:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">Ativa</p>
                <p className="text-xs text-green-700 dark:text-green-300">Trabalhando normalmente</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Pausada</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">Temporariamente parada</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Concluída</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Obra finalizada</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'configuracoes',
    titulo: 'Personalizando o App',
    icone: <Settings className="w-5 h-5" />,
    conteudo: (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-indigo-200/50 dark:border-indigo-700/50">
          <h3 className="text-lg sm:text-xl font-semibold text-indigo-900 dark:text-indigo-100 mb-3">⚙️ Deixando o app com a sua cara!</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            As configurações são como o armário de ferramentas do app. Aqui você pode personalizar listas, 
            adicionar novos tipos de atividades e deixar tudo do jeito que funciona melhor para você!
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-500" />
              Acessando as Configurações
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Clique no botão "Configurações" no canto superior direito do Dashboard. 
              É como abrir a gaveta de ferramentas para ajustar o que precisar!
            </p>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
              <p className="text-sm text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <strong>Lembre-se:</strong> Só administradores podem acessar as configurações!
              </p>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-500" />
              Centro de Configurações
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Personalize completamente o sistema com configurações organizadas por categoria:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Tipos de Atividade
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">Soldas, montagem, pintura, estruturas</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Condições Climáticas
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Sol, chuva, vento, nublado, garoa</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <p className="text-sm font-medium text-green-900 dark:text-green-100 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Funções da Equipe
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">Soldador, montador, operador, técnico</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Equipamentos
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">Guindastes, soldas, compressores</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <p className="text-sm font-medium text-red-900 dark:text-red-100 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Tipos de Ocorrência
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">Incidentes, não conformidades, paradas</p>
              </div>
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3">
                <p className="text-sm font-medium text-teal-900 dark:text-teal-100 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Localizações
                </p>
                <p className="text-xs text-teal-700 dark:text-teal-300">Eixos, pavimentos, setores da obra</p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Backup e Restauração
              </h5>
              <p className="text-sm text-gray-700 dark:text-gray-400 mb-2">
                Gerencie suas configurações:
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded">Exportar Configurações</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded">Importar Configurações</span>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs rounded">Restaurar Padrões</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'offline',
    titulo: 'Modo Offline',
    icone: <WifiOff className="w-5 h-5" />,
    conteudo: (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-orange-200/50 dark:border-orange-700/50">
          <h3 className="text-lg sm:text-xl font-semibold text-orange-900 dark:text-orange-100 mb-3">📱 Trabalhe sem internet!</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            O App RDO funciona completamente offline. Crie RDOs, gerencie obras e configure o sistema mesmo sem conexão com a internet.
            Quando a conexão voltar, tudo será sincronizado automaticamente!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Armazenamento Local
            </h4>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-400">
                <h5 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  Dados Seguros
                </h5>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Todos os seus dados ficam salvos no dispositivo. RDOs, obras, configurações - tudo fica disponível offline.
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-400">
                <h5 className="font-semibold text-green-900 dark:text-green-300 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Sem Perda de Dados
                </h5>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Mesmo que a internet caia no meio do trabalho, seus dados estão protegidos e salvos localmente.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-green-600 dark:text-green-400" />
              Sincronização Inteligente
            </h4>
            <div className="space-y-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-l-4 border-orange-400">
                <h5 className="font-semibold text-orange-900 dark:text-orange-300 mb-2 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Status Visível
                </h5>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  Veja o indicador de conexão no canto da tela. Ele mostra quantas operações estão aguardando sincronização.
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-400">
                <h5 className="font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Sync Automático
                </h5>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  Quando a internet voltar, o sistema sincroniza automaticamente todos os dados pendentes em segundo plano.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Gerenciamento Offline
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h5 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Cache Local</h5>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Visualize o tamanho do cache e dados armazenados localmente
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <RefreshCw className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h5 className="font-semibold text-green-900 dark:text-green-300 mb-2">Sync Manual</h5>
              <p className="text-sm text-green-800 dark:text-green-200">
                Force a sincronização quando necessário através do painel de status
              </p>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h5 className="font-semibold text-red-900 dark:text-red-300 mb-2">Limpar Cache</h5>
              <p className="text-sm text-red-800 dark:text-red-200">
                Limpe o cache local quando necessário para liberar espaço
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'dicas',
    titulo: 'Dicas e Truques',
    icone: <Lightbulb className="w-5 h-5" />,
    conteudo: (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-700/50">
          <h3 className="text-lg sm:text-xl font-semibold text-emerald-900 dark:text-emerald-100 mb-3">💡 Segredos para usar o app como um profissional!</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Aqui estão algumas dicas especiais que vão fazer você usar o App RDO como um verdadeiro expert. 
            São pequenos truques que fazem uma grande diferença no dia a dia!
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              ⏰ RDOs Diários
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Use as seções expansíveis para organizar melhor as informações. Preencha sempre no final do expediente!
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>Dica:</strong> Clique nas setas para expandir/recolher seções!
              </p>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <WifiOff className="w-5 h-5 text-green-500" />
              📱 Modo Offline
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Trabalhe sem internet! O app sincroniza automaticamente quando a conexão voltar.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
              <p className="text-xs text-green-800 dark:text-green-200">
                <strong>Status:</strong> Monitore o indicador no canto da tela!
              </p>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-500" />
              📸 Fotos & Anexos
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Anexe fotos aos RDOs para documentar o progresso. Especialmente útil para inspeções!
            </p>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2">
              <p className="text-xs text-purple-800 dark:text-purple-200">
                <strong>Tip:</strong> Fotos antes/depois são muito valiosas!
              </p>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-500" />
              ⚙️ Personalize Tudo
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Configure tipos de atividades, condições climáticas e outros parâmetros nas configurações.
            </p>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2">
              <p className="text-xs text-orange-800 dark:text-orange-200">
                <strong>Estratégia:</strong> Adapte às necessidades da sua obra!
              </p>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-500" />
              📊 Relatórios Avançados
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Explore diferentes tipos de relatórios e formatos de exportação (PDF, Excel, CSV, JSON).
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
              <p className="text-xs text-red-800 dark:text-red-200">
                <strong>Filtros:</strong> Use filtros para relatórios específicos!
              </p>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-500" />
              🌙 Modo Escuro
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Alterne entre temas claro e escuro para trabalhar confortavelmente em qualquer ambiente.
            </p>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-2">
              <p className="text-xs text-indigo-800 dark:text-indigo-200">
                <strong>Conforto:</strong> Reduz cansaço visual durante uso prolongado!
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-5 border border-yellow-200/50 dark:border-yellow-700/50">
          <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            🎯 Dica de Ouro
          </h4>
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            <strong>O segredo do sucesso:</strong> Use o app todos os dias, mesmo que seja só para dar uma olhada rápida. 
            Assim você sempre sabe como suas obras estão andando e pode tomar decisões mais inteligentes!
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'conclusao',
    titulo: 'Parabéns! Você chegou ao fim',
    icone: <CheckCircle className="w-5 h-5" />,
    conteudo: (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/50">
          <h3 className="text-lg sm:text-xl font-semibold text-green-900 dark:text-green-100 mb-3">🎉 Parabéns, você é agora um usuário expert do App RDO!</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Você chegou ao final deste manual e agora tem todas as ferramentas necessárias para usar o App RDO 
            como um verdadeiro profissional. É hora de colocar a mão na massa!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              ✅ O que você aprendeu
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Como navegar pelo Dashboard</li>
              <li>• Criar e gerenciar obras</li>
              <li>• Fazer RDOs completos</li>
              <li>• Acompanhar o progresso</li>
              <li>• Personalizar configurações</li>
              <li>• Dicas de uso profissional</li>
            </ul>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Home className="w-5 h-5 text-blue-500" />
              🚀 Próximos passos
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Agora é hora de praticar! Comece criando sua primeira obra e fazendo seu primeiro RDO. 
              Lembre-se: a prática leva à perfeição!
            </p>
            <Link 
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Home className="w-4 h-4" />
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-200/50 dark:border-blue-700/50 text-center">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💙 Obrigado por usar o App RDO!</h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Este manual sempre estará aqui quando você precisar. Clique no botão "Manual" no Dashboard 
            sempre que quiser revisar algum conceito ou descobrir algo novo!
          </p>
        </div>
      </div>
    )
  }
];

export default function ManualInstrucoes() {
  const [capituloAtivo, setCapituloAtivo] = useState('introducao');
  const [menuAberto, setMenuAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  
  const capitulosFiltrados = capitulos.filter(capitulo => 
    capitulo.titulo.toLowerCase().includes(termoBusca.toLowerCase())
  );
  
  const capituloAtual = capitulos.find(cap => cap.id === capituloAtivo) || capitulos[0];
  const indiceAtual = capitulos.findIndex(cap => cap.id === capituloAtivo);
  const proximoCapitulo = capitulos[indiceAtual + 1];
  const capituloAnterior = capitulos[indiceAtual - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              {menuAberto ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 min-w-0">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <span className="hidden xs:inline">Manual do App RDO</span>
                <span className="xs:hidden">Manual</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                Guia completo para usar o aplicativo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
              title="Voltar ao Dashboard"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(menuAberto || window.innerWidth >= 1024) && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed lg:sticky top-[65px] sm:top-[73px] left-0 h-[calc(100vh-65px)] sm:h-[calc(100vh-73px)] w-full sm:w-80 lg:w-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50 z-30 lg:z-auto overflow-y-auto"
            >
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                {/* Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar no manual..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 bg-white/70 dark:bg-gray-700/70 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-xs sm:text-sm"
                  />
                </div>
                
                {/* Lista de Capítulos */}
                <nav className="space-y-1">
                  {capitulosFiltrados.map((capitulo, index) => (
                    <button
                      key={capitulo.id}
                      onClick={() => {
                        setCapituloAtivo(capitulo.id);
                        setMenuAberto(false);
                      }}
                      className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 rounded-xl text-left transition-all duration-200 ${
                        capituloAtivo === capitulo.id
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 shadow-sm'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className={`p-1.5 sm:p-2 rounded-lg ${
                        capituloAtivo === capitulo.id
                          ? 'bg-blue-200 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        <div className="w-3 h-3 sm:w-4 sm:h-4">{capitulo.icone}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                            capituloAtivo === capitulo.id
                              ? 'bg-blue-200 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium truncate mt-1">{capitulo.titulo}</p>
                      </div>
                      {capituloAtivo === capitulo.id && (
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay para mobile */}
        {menuAberto && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setMenuAberto(false)}
          />
        )}

        {/* Conteúdo Principal */}
        <div className="flex-1 lg:ml-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <motion.div
              key={capituloAtivo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 sm:space-y-6 lg:space-y-8"
            >
              {/* Cabeçalho do Capítulo */}
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                    <div className="w-4 h-4 sm:w-5 sm:h-5">{capituloAtual.icone}</div>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Capítulo {indiceAtual + 1} de {capitulos.length}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white px-4">
                  {capituloAtual.titulo}
                </h2>
              </div>

              {/* Conteúdo do Capítulo */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                {capituloAtual.conteudo}
              </div>

              {/* Navegação entre Capítulos */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 sm:pt-6 lg:pt-8">
                <div className="w-full sm:w-auto">
                  {capituloAnterior && (
                    <button
                      onClick={() => setCapituloAtivo(capituloAnterior.id)}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 w-full sm:w-auto"
                    >
                      <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      <div className="text-left">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Anterior</p>
                        <p className="truncate max-w-24 sm:max-w-32">{capituloAnterior.titulo}</p>
                      </div>
                    </button>
                  )}
                </div>
                
                <div className="text-center order-first sm:order-none">
                  <div className="flex gap-1">
                    {capitulos.map((_, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                          index === indiceAtual
                            ? 'bg-blue-500'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="w-full sm:w-auto">
                  {proximoCapitulo && (
                    <button
                      onClick={() => setCapituloAtivo(proximoCapitulo.id)}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 w-full sm:w-auto justify-end sm:justify-start"
                    >
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Próximo</p>
                        <p className="truncate max-w-24 sm:max-w-32">{proximoCapitulo.titulo}</p>
                      </div>
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}