import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Save,
  AlertCircle,
  AlertTriangle,
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import { useTiposOcorrencia } from '../../stores/configStore';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: { id: string; nome: string; descricao?: string; severidade?: string; cor?: string };
  onSave: (data: { nome: string; descricao?: string; severidade?: string; cor?: string }) => void;
}

const severidadeOptions = [
  { value: 'baixa', label: 'Baixa', color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'media', label: 'Média', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { value: 'alta', label: 'Alta', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { value: 'critica', label: 'Crítica', color: 'text-red-600', bgColor: 'bg-red-100' }
];

const iconOptions = [
  { value: 'alert-triangle', label: 'Alerta', icon: AlertTriangle },
  { value: 'clock', label: 'Tempo', icon: Clock },
  { value: 'shield', label: 'Segurança', icon: Shield },
  { value: 'zap', label: 'Urgente', icon: Zap }
];

function Modal({ isOpen, onClose, item, onSave }: ModalProps) {
  const [nome, setNome] = useState(item?.nome || '');
  const [descricao, setDescricao] = useState(item?.descricao || '');
  const [severidade, setSeveridade] = useState(item?.severidade || 'media');
  const [cor, setCor] = useState(item?.cor || 'alert-triangle');
  const [errors, setErrors] = useState<{ nome?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { nome?: string } = {};
    if (!nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave({ 
      nome: nome.trim(), 
      descricao: descricao.trim() || undefined,
      severidade,
      cor
    });
    onClose();
    setNome('');
    setDescricao('');
    setSeveridade('media');
    setCor('alert-triangle');
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    setNome('');
    setDescricao('');
    setSeveridade('media');
    setCor('alert-triangle');
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {item ? 'Editar' : 'Novo'} Tipo de Ocorrência
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                errors.nome
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:outline-none`}
              placeholder="Ex: Acidente, Atraso, Problema técnico..."
            />
            {errors.nome && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.nome}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Severidade
            </label>
            <div className="grid grid-cols-2 gap-2">
              {severidadeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSeveridade(option.value)}
                  className={`p-3 rounded-xl border-2 transition-colors flex items-center justify-center gap-2 ${
                    severidade === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${option.bgColor}`}></div>
                  <span className={`text-sm font-medium ${
                    severidade === option.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ícone
            </label>
            <div className="grid grid-cols-4 gap-2">
              {iconOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setCor(option.value)}
                    className={`p-3 rounded-xl border-2 transition-colors flex flex-col items-center gap-1 ${
                      cor === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 ${
                      cor === option.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'
                    }`} />
                    <span className={`text-xs ${
                      cor === option.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'
                    }`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:outline-none resize-none"
              placeholder="Descrição opcional do tipo de ocorrência..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function getIconComponent(iconName: string) {
  const iconMap: { [key: string]: any } = {
    'alert-triangle': AlertTriangle,
    'clock': Clock,
    'shield': Shield,
    'zap': Zap
  };
  return iconMap[iconName] || AlertTriangle;
}

function getSeveridadeBadge(severidade: string) {
  const severidadeMap: { [key: string]: { label: string; color: string; bgColor: string } } = {
    'baixa': { label: 'Baixa', color: 'text-green-700', bgColor: 'bg-green-100' },
    'media': { label: 'Média', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    'alta': { label: 'Alta', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    'critica': { label: 'Crítica', color: 'text-red-700', bgColor: 'bg-red-100' }
  };
  return severidadeMap[severidade] || severidadeMap['media'];
}

export function TiposOcorrenciaConfig() {
  const { items, add: addItem, update: updateItem, delete: removeItem } = useTiposOcorrencia();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string; nome: string; descricao?: string; severidade?: string; cor?: string } | null>(null);

  const filteredItems = items.filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: { id: string; nome: string; descricao?: string; severidade?: string; cor?: string }) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este tipo de ocorrência?')) {
      removeItem(id);
    }
  };

  const handleSave = (data: { nome: string; descricao?: string; severidade?: string; cor?: string }) => {
    if (editingItem) {
      updateItem(editingItem.id, data);
    } else {
      addItem(data);
    }
  };

  return (
    <div className="p-6 h-full">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tipos de Ocorrências</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Configure os tipos de ocorrências e incidentes disponíveis para registro nos RDOs
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar tipos de ocorrências..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"/>
          </div>
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Nova Ocorrência
          </button>
        </div>

        {/* Desktop Table - Hidden on mobile */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ocorrência
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Severidade
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {filteredItems.map((item) => {
                    const IconComponent = getIconComponent(item.cor || 'alert-triangle');
                    const severidadeBadge = getSeveridadeBadge(item.severidade || 'media');
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <IconComponent className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.nome}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severidadeBadge.bgColor} ${severidadeBadge.color}`}>
                            {severidadeBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {item.descricao || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards - Visible only on mobile */}
        <div className="block md:hidden space-y-4">
          <AnimatePresence>
            {filteredItems.map((item) => {
              const IconComponent = getIconComponent(item.cor || 'alert-triangle');
              const severidadeBadge = getSeveridadeBadge(item.severidade || 'media');
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  {/* Header with icon and name */}
                  <div className="flex items-center gap-3 mb-3">
                    <IconComponent className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        {item.nome}
                      </h3>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severidadeBadge.bgColor} ${severidadeBadge.color}`}>
                      {severidadeBadge.label}
                    </span>
                  </div>

                  {/* Description */}
                  {item.descricao && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {item.descricao}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhuma ocorrência cadastrada'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm
                  ? 'Tente ajustar os termos da busca'
                  : 'Comece adicionando um novo tipo de ocorrência'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleAdd}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Nova Ocorrência
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={editingItem}
        onSave={handleSave}
      />
    </div>
  );
}