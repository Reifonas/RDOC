import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../lib/queryClient';
import { useAppStateStore } from '@/stores/useAppStateStore';

interface QueryProviderProps {
  children: React.ReactNode;
}

// Componente interno para monitoramento
function QueryMonitor() {
  useEffect(() => {
    // Monitorar eventos do cache para debug
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (import.meta.env.DEV && event?.type === 'updated') {
        console.debug('Query cache updated:', event);
      }
    });

    // Monitorar mutations para debug
    const unsubscribeMutation = queryClient.getMutationCache().subscribe((event) => {
      if (import.meta.env.DEV && event?.type === 'updated') {
        console.debug('Mutation updated:', event);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeMutation();
    };
  }, []);

  return null;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryMonitor />
      {children}
      {/* DevTools apenas em desenvolvimento */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
};

export default QueryProvider;