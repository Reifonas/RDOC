import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryKeys, invalidateQueries } from '../lib/queryClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Hook para sincronização em tempo real de usuários
export const useUsersRealtime = () => {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Criar canal de subscription
    channelRef.current = supabase
      .channel('usuarios-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'usuarios',
        },
        (payload) => {
          console.log('Usuário alterado:', payload);
          
          // Invalidar queries relacionadas a usuários
          invalidateQueries.users();
          
          // Se for um usuário específico, invalidar também
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            queryClient.invalidateQueries({
              queryKey: queryKeys.users.detail(payload.new.id as string)
            });
          }
        }
      )
      .subscribe();

    // Cleanup na desmontagem
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [queryClient]);

  return channelRef.current;
};

// Hook para sincronização em tempo real de obras
export const useObrasRealtimeSync = () => {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    channelRef.current = supabase
      .channel('obras-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'obras',
        },
        (payload) => {
          console.log('Obra alterada:', payload);
          
          // Invalidar queries relacionadas a obras
          invalidateQueries.obras();
          
          // Se for uma obra específica, invalidar também
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            queryClient.invalidateQueries({
              queryKey: queryKeys.obras.detail(payload.new.id as string)
            });
            
            // Invalidar RDOs da obra também
            invalidateQueries.rdosByObra(payload.new.id as string);
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [queryClient]);

  return channelRef.current;
};

// Hook para sincronização em tempo real de RDOs
export const useRdosRealtimeSync = (obraId?: string) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    channelRef.current = supabase
      .channel('rdos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rdos',
          filter: obraId ? `obra_id=eq.${obraId}` : undefined,
        },
        (payload) => {
          console.log('RDO alterado:', payload);
          
          // Invalidar queries relacionadas a RDOs
          invalidateQueries.rdos();
          
          if (payload.new && typeof payload.new === 'object') {
            const newRdo = payload.new as any;
            
            // Invalidar RDO específico
            if ('id' in newRdo) {
              queryClient.invalidateQueries({
                queryKey: queryKeys.rdos.detail(newRdo.id)
              });
            }
            
            // Invalidar RDOs da obra
            if ('obra_id' in newRdo) {
              invalidateQueries.rdosByObra(newRdo.obra_id);
            }
            
            // Invalidar RDOs do usuário
            if ('usuario_id' in newRdo) {
              queryClient.invalidateQueries({
                queryKey: queryKeys.rdos.byUser(newRdo.usuario_id)
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [queryClient, obraId]);

  return channelRef.current;
};

// Hook principal para sincronização completa
export const useRealtimeSync = (options?: {
  enableUsers?: boolean;
  enableObras?: boolean;
  enableRdos?: boolean;
  obraId?: string;
}) => {
  const {
    enableUsers = true,
    enableObras = true,
    enableRdos = true,
    obraId,
  } = options || {};

  const usersChannel = useUsersRealtime();
  const obrasChannel = useObrasRealtimeSync();
  const rdosChannel = useRdosRealtimeSync(obraId);

  // Retornar status das conexões
  return {
    usersChannel: enableUsers ? usersChannel : null,
    obrasChannel: enableObras ? obrasChannel : null,
    rdosChannel: enableRdos ? rdosChannel : null,
    isConnected: {
      users: enableUsers && usersChannel?.state === 'joined',
      obras: enableObras && obrasChannel?.state === 'joined',
      rdos: enableRdos && rdosChannel?.state === 'joined',
    },
  };
};

// Hook para monitorar status de conectividade
export const useConnectionStatus = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => {
      console.log('Conexão restaurada - invalidando queries');
      // Quando voltar online, invalidar todas as queries para sincronizar
      invalidateQueries.all();
    };

    const handleOffline = () => {
      console.log('Conexão perdida');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);

  return {
    isOnline: navigator.onLine,
  };
};