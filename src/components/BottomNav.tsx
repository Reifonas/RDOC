import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, ListChecks, BarChart3, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/cadastros/obras', label: 'Obras', icon: Building2 },
  { path: '/rdo/novo', label: 'Adicionar', icon: Plus, isCentral: true },
  { path: '/obra/1/tarefas', label: 'Tarefas', icon: ListChecks }, // Exemplo, idealmente levaria a uma página geral de tarefas
  { path: '/reports', label: 'Relatórios', icon: BarChart3 },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200/80 dark:border-gray-700/80 z-50">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isCentral) {
            return (
              <Link key={item.path} to={item.path} className="-mt-8">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/50"
                >
                  <Icon className="w-8 h-8" />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center w-16 h-16"
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-6 h-6 transition-colors',
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                  )}
                />
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                  />
                )}
              </div>
              <span
                className={cn(
                  'text-xs mt-1 transition-colors',
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}