import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {
    RDOCompleto
} from '../types/database.types';

export const useRDO = (rdoId: string | undefined) => {
    const [rdo, setRdo] = useState<RDOCompleto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRDO = useCallback(async () => {
        if (!rdoId) return;

        try {
            setLoading(true);
            setError(null);

            // 1. Buscar dados principais do RDO
            const { data: rdoData, error: rdoError } = await supabase
                .from('rdos')
                .select(`
          *,
          obra:obras(*),
          criador:usuarios!rdos_criado_por_fkey(*)
        `)
                .eq('id', rdoId)
                .single();

            if (rdoError) throw rdoError;
            if (!rdoData) throw new Error('RDO não encontrado');

            // 2. Buscar dados relacionados em paralelo
            const [
                { data: atividades },
                { data: maoDeObra },
                { data: equipamentos },
                { data: ocorrencias },
                { data: anexos },
                { data: inspecoesSolda },
                { data: verificacoesTorque }
            ] = await Promise.all([
                supabase.from('rdo_atividades').select('*').eq('rdo_id', rdoId).order('ordem'),
                supabase.from('rdo_mao_obra').select('*').eq('rdo_id', rdoId),
                supabase.from('rdo_equipamentos').select('*').eq('rdo_id', rdoId),
                supabase.from('rdo_ocorrencias').select('*').eq('rdo_id', rdoId),
                supabase.from('rdo_anexos').select('*').eq('rdo_id', rdoId),
                supabase.from('rdo_inspecoes_solda').select('*').eq('rdo_id', rdoId),
                supabase.from('rdo_verificacoes_torque').select('*').eq('rdo_id', rdoId)
            ]);

            // Montar objeto completo seguindo o tipo RDOCompleto (adaptado)
            // Nota: RDOCompleto em database.types.ts espera propriedades estritas. 
            // Faremos o cast ou montagem segura aqui.

            const rdoCompleto: any = {
                ...rdoData,
                atividades: atividades || [],
                mao_obra: maoDeObra || [],
                equipamentos: equipamentos || [],
                ocorrencias: ocorrencias || [],
                anexos: anexos || [],
                inspecoes_solda: inspecoesSolda || [],
                verificacoes_torque: verificacoesTorque || []
            };

            setRdo(rdoCompleto);

        } catch (err: any) {
            console.error('Erro ao buscar RDO:', err);
            setError(err.message || 'Erro ao carregar RDO');
        } finally {
            setLoading(false);
        }
    }, [rdoId]);

    useEffect(() => {
        fetchRDO();
    }, [fetchRDO]);

    return { rdo, loading, error, refetch: fetchRDO };
};
