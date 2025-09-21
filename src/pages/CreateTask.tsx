import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  X,
  Calendar,
  User,
  MapPin,
  AlertCircle,
  FileText,
  Tag
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { toast } from 'sonner';
import { formatDateBR, convertBRToISO, getCurrentDateBR, formatBRDateInput, validateBRDate, formatDateBRFull } from '../utils/dateUtils';

interface TaskFormData {
  titulo: string;
  descricao: string;
  responsavel: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  data_inicio: string;
  data_prazo: string;
  categoria: string;
  localizacao: string;
}

const prioridadeOptions = [
  { value: 'baixa', label: 'Baixa', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { value: 'media', label: 'Média', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  { value: 'critica', label: 'Crítica', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' }
];

const categoriaOptions = [
  'Estrutura',
  'Elétrica',
  'Hidráulica',
  'Acabamento',
  'Impermeabilização',
  'Pintura',
  'Alvenaria',
  'Cobertura',
  'Fundação',
  'Outros'
];

export default function CreateTask() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<TaskFormData>>({});
  
  const [formData, setFormData] = useState<TaskFormData>({
    titulo: '',
    descricao: '',
    responsavel: '',
    prioridade: 'media',
    data_inicio: '',
    data_prazo: '',
    categoria: '',
    localizacao: ''
  });

  const handleInputChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TaskFormData> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.responsavel.trim()) {
      newErrors.responsavel = 'Responsável é obrigatório';
    }

    if (!formData.data_inicio) {
      newErrors.data_inicio = 'Data de início é obrigatória';
    }

    if (!formData.data_prazo) {
      newErrors.data_prazo = 'Data prazo é obrigatória';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Categoria é obrigatória';
    }

    // Validar se data prazo é posterior à data início
    if (formData.data_inicio && formData.data_prazo) {
      const dataInicio = new Date(formData.data_inicio);
      const dataPrazo = new Date(formData.data_prazo);
      if (dataPrazo <= dataInicio) {
        newErrors.data_prazo = 'Data prazo deve ser posterior à data de início';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular salvamento da tarefa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirecionar de volta para a lista de tarefas
      navigate(`/obra/${id}/tarefas`);
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/obra/${id}/tarefas`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to={`/obra/${id}/tarefas`}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Nova Tarefa
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Obra #{id}
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Título *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${errors.titulo ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                placeholder="Digite o título da tarefa"
              />
              {errors.titulo && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.titulo}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição *
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border ${errors.descricao ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                placeholder="Descreva detalhadamente a tarefa a ser executada"
              />
              {errors.descricao && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.descricao}
                </p>
              )}
            </div>

            {/* Grid de campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Responsável */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Responsável *
                </label>
                <input
                  type="text"
                  value={formData.responsavel}
                  onChange={(e) => handleInputChange('responsavel', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.responsavel ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                  placeholder="Nome do responsável"
                />
                {errors.responsavel && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.responsavel}
                  </p>
                )}
              </div>

              {/* Prioridade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prioridade
                </label>
                <select
                  value={formData.prioridade}
                  onChange={(e) => handleInputChange('prioridade', e.target.value as TaskFormData['prioridade'])}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                >
                  {prioridadeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data Início */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Data de Início *
                </label>
                <input
                  type="text"
                  value={formData.data_inicio}
                  onChange={(e) => handleInputChange('data_inicio', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.data_inicio ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                  placeholder="dd/mm/aaaa"
                  maxLength={10}
                  onInput={(e) => {
                    const formatted = formatBRDateInput(e.currentTarget.value);
                    e.currentTarget.value = formatted;
                    handleInputChange('data_inicio', formatted);
                  }}
                />
                {errors.data_inicio && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.data_inicio}
                  </p>
                )}
              </div>

              {/* Data Prazo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Data Prazo *
                </label>
                <input
                  type="text"
                  value={formData.data_prazo}
                  onChange={(e) => handleInputChange('data_prazo', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.data_prazo ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                  placeholder="dd/mm/aaaa"
                  maxLength={10}
                  onInput={(e) => {
                    const formatted = formatBRDateInput(e.currentTarget.value);
                    e.currentTarget.value = formatted;
                    handleInputChange('data_prazo', formatted);
                  }}
                />
                {errors.data_prazo && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.data_prazo}
                  </p>
                )}
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Categoria *
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => handleInputChange('categoria', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.categoria ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white`}
                >
                  <option value="">Selecione uma categoria</option>
                  {categoriaOptions.map(categoria => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
                {errors.categoria && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.categoria}
                  </p>
                )}
              </div>

              {/* Localização */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Localização
                </label>
                <input
                  type="text"
                  value={formData.localizacao}
                  onChange={(e) => handleInputChange('localizacao', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Ex: 2º Pavimento, Sala 201"
                />
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-5 h-5" />
                {isSubmitting ? 'Salvando...' : 'Salvar Tarefa'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}