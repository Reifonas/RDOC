/**
 * Hook para gerenciar MFA
 */

import { useState, useCallback } from 'react';
import { MFAService, type MFAEnrollment, type BackupCode } from '../services/mfaService';

export const useMFA = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [enrollment, setEnrollment] = useState<MFAEnrollment | null>(null);
    const [backupCodes, setBackupCodes] = useState<BackupCode[]>([]);

    /**
     * Inicia enrollment do MFA
     */
    const startEnrollment = useCallback(async (friendlyName?: string) => {
        setLoading(true);
        setError(null);

        const { data, error: enrollError } = await MFAService.enroll(friendlyName);

        if (enrollError) {
            setError(enrollError);
            setLoading(false);
            return { success: false, error: enrollError };
        }

        setEnrollment(data);
        setLoading(false);
        return { success: true, data };
    }, []);

    /**
     * Verifica código e completa enrollment
     */
    const verifyEnrollment = useCallback(async (code: string) => {
        if (!enrollment) {
            setError('Nenhum enrollment ativo');
            return { success: false, error: 'Nenhum enrollment ativo' };
        }

        setLoading(true);
        setError(null);

        const { error: verifyError } = await MFAService.verify(enrollment.id, code);

        if (verifyError) {
            setError(verifyError);
            setLoading(false);
            return { success: false, error: verifyError };
        }

        // Gerar códigos de backup
        const codes = MFAService.generateBackupCodes();
        setBackupCodes(codes);

        setLoading(false);
        return { success: true, backupCodes: codes };
    }, [enrollment]);

    /**
     * Desativa MFA
     */
    const disableMFA = useCallback(async (factorId: string) => {
        setLoading(true);
        setError(null);

        const { error: unenrollError } = await MFAService.unenroll(factorId);

        if (unenrollError) {
            setError(unenrollError);
            setLoading(false);
            return { success: false, error: unenrollError };
        }

        setEnrollment(null);
        setBackupCodes([]);
        setLoading(false);
        return { success: true };
    }, []);

    /**
     * Verifica código durante login
     */
    const verifyCode = useCallback(async (factorId: string, code: string) => {
        setLoading(true);
        setError(null);

        // Criar challenge
        const { challengeId, error: challengeError } = await MFAService.challenge(factorId);

        if (challengeError || !challengeId) {
            setError(challengeError || 'Erro ao criar challenge');
            setLoading(false);
            return { success: false, error: challengeError };
        }

        // Verificar código
        const { error: verifyError } = await MFAService.verifyChallenge(
            factorId,
            challengeId,
            code
        );

        if (verifyError) {
            setError(verifyError);
            setLoading(false);
            return { success: false, error: verifyError };
        }

        setLoading(false);
        return { success: true };
    }, []);

    /**
     * Lista fatores MFA
     */
    const listFactors = useCallback(async () => {
        setLoading(true);
        setError(null);

        const { factors, error: listError } = await MFAService.listFactors();

        if (listError) {
            setError(listError);
            setLoading(false);
            return { factors: [], error: listError };
        }

        setLoading(false);
        return { factors, error: null };
    }, []);

    /**
     * Verifica se MFA está ativo
     */
    const checkMFAStatus = useCallback(async () => {
        const hasMFA = await MFAService.hasMFA();
        return hasMFA;
    }, []);

    /**
     * Limpa erro
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        loading,
        error,
        enrollment,
        backupCodes,
        startEnrollment,
        verifyEnrollment,
        disableMFA,
        verifyCode,
        listFactors,
        checkMFAStatus,
        clearError,
    };
};
