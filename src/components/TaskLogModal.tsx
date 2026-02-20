import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  User,
  Play,
  Pause,
  CheckCircle2,
  Edit3,
  RotateCcw,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { TaskLogEvent, eventTypeLabels, eventTypeColors } from '../types/taskLog';
import { taskLogManager } from '../utils/taskLogManager';

interface TaskLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
}

const iconMap = {
  Play,
  Pause,
  CheckCircle2,
  Edit3,
  RotateCcw,
  X: AlertCircle
};

const TaskLogModal: React.FC<TaskLogModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskTitle
}) => {
  const [events, setEvents] = useState<TaskLogEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && taskId) {
      loadEvents();
    }
  }, [isOpen, taskId]);

  const loadEvents = () => {
    setLoading(true);
    try {
      const taskEvents = taskLogManager.getTaskEvents(taskId);
      setEvents(taskEvents);
    } catch (error) {
      console.error('Erro ao carregar eventos da tarefa:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getEventIcon = (type: string) => {
    const iconName = type === 'inicio' || type === 'retomada' ? 'Play' :
                    type === 'pausa' ? 'Pause' :
                    type === 'conclusao' ? 'CheckCircle2' :
                    type === 'edicao' ? 'Edit3' :
                    type === 'revisao' ? 'RotateCcw' : 'X';
    
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent;
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - eventTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
    
    return formatDateTime(timestamp).date;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1">Histórico da Tarefa</h2>
                <p className="text-blue-100 text-sm truncate">{taskTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-300">Carregando histórico...</span>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhum evento registrado
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Esta tarefa ainda não possui histórico de atividades.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event, index) => {
                  const IconComponent = getEventIcon(event.type);
                  const { date, time } = formatDateTime(event.timestamp);
                  const isFirst = index === 0;
                  const isLast = index === events.length - 1;

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      {/* Timeline line */}
                      {!isLast && (
                        <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200 dark:bg-gray-700 -z-10" />
                      )}
                      
                      <div className="flex gap-4">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${eventTypeColors[event.type as keyof typeof eventTypeColors]} ${isFirst ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800' : ''}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {eventTypeLabels[event.type as keyof typeof eventTypeLabels]}
                              </h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                {getRelativeTime(event.timestamp)}
                              </span>
                            </div>
                            
                            {event.descricao && (
                              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                                {event.descricao}
                              </p>
                            )}
                            
                            {/* Details */}
                            {event.detalhes && (
                              <div className="space-y-2 text-sm">
                                {event.detalhes.statusAnterior && event.detalhes.statusNovo && (
                                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <span>Status:</span>
                                    <span className="font-medium">{event.detalhes.statusAnterior}</span>
                                    <span>→</span>
                                    <span className="font-medium">{event.detalhes.statusNovo}</span>
                                  </div>
                                )}
                                
                                {event.detalhes.camposAlterados && event.detalhes.camposAlterados.length > 0 && (
                                  <div className="text-gray-600 dark:text-gray-400">
                                    <span>Campos alterados: </span>
                                    <span className="font-medium">
                                      {event.detalhes.camposAlterados.join(', ')}
                                    </span>
                                  </div>
                                )}
                                
                                {event.detalhes.observacoes && (
                                  <div className="text-gray-600 dark:text-gray-400">
                                    <span>Observações: </span>
                                    <span className="font-medium">{event.detalhes.observacoes}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Footer */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <User className="w-3 h-3" />
                                <span>{event.usuario}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <Calendar className="w-3 h-3" />
                                <span>{date} às {time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskLogModal;