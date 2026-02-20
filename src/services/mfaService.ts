/**
 * Serviço de Multi-Factor Authentication (MFA)
 * 
 * Gerencia TOTP (Time-based One-Time Password) usando Supabase Auth
 */

import { supabase } from '../lib/supabase';

export interface MFAEnrollment {
    id: string;
    type: 'totp';
    friendlyName: string;
    qrCode: string;
    secret: string;
    uri: string;
}

export interface BackupCode {
    code: string;
    used: boolean;
}

export class MFAService {
    /**
     * Inicia o processo de enrollment do MFA
     * Gera QR Code e secret para configuração no authenticator app
     */
    static async enroll(friendlyName: string = 'Authenticator'): Promise<{
        data: MFAEnrollment | null;
        error: string | null;
    }> {
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp',
                friendlyName,
            });

            if (error) throw error;

            if (!data) {
                throw new Error('Nenhum dado retornado do enrollment');
            }

            return {
                data: {
                    id: data.id,
                    type: data.type as 'totp',
                    friendlyName: data.friendly_name || friendlyName,
                    qrCode: data.totp.qr_code,
                    secret: data.totp.secret,
                    uri: data.totp.uri,
                },
                error: null,
            };
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Erro ao iniciar MFA',
            };
        }
    }

    /**
     * Verifica o código TOTP e completa o enrollment
     */
    static async verify(factorId: string, code: string): Promise<{
        success: boolean;
        error: string | null;
    }> {
        try {
            const { error } = await supabase.auth.mfa.challengeAndVerify({
                factorId,
                code,
            });

            if (error) throw error;

            return {
                success: true,
                error: null,
            };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Código inválido',
            };
        }
    }

    /**
     * Cria um challenge para verificação MFA durante login
     */
    static async challenge(factorId: string): Promise<{
        challengeId: string | null;
        error: string | null;
    }> {
        try {
            const { data, error } = await supabase.auth.mfa.challenge({
                factorId,
            });

            if (error) throw error;

            return {
                challengeId: data.id,
                error: null,
            };
        } catch (err) {
            return {
                challengeId: null,
                error: err instanceof Error ? err.message : 'Erro ao criar challenge',
            };
        }
    }

    /**
     * Verifica código TOTP durante login
     */
    static async verifyChallenge(factorId: string, challengeId: string, code: string): Promise<{
        success: boolean;
        error: string | null;
    }> {
        try {
            const { error } = await supabase.auth.mfa.verify({
                factorId,
                challengeId,
                code,
            });

            if (error) throw error;

            return {
                success: true,
                error: null,
            };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Código inválido',
            };
        }
    }

    /**
     * Lista todos os fatores MFA do usuário
     */
    static async listFactors(): Promise<{
        factors: Array<{
            id: string;
            type: string;
            friendlyName: string;
            status: string;
        }>;
        error: string | null;
    }> {
        try {
            const { data, error } = await supabase.auth.mfa.listFactors();

            if (error) throw error;

            const factors = (data?.totp || []).map(factor => ({
                id: factor.id,
                type: 'totp',
                friendlyName: factor.friendly_name || 'Authenticator',
                status: factor.status,
            }));

            return {
                factors,
                error: null,
            };
        } catch (err) {
            return {
                factors: [],
                error: err instanceof Error ? err.message : 'Erro ao listar fatores',
            };
        }
    }

    /**
     * Remove um fator MFA
     */
    static async unenroll(factorId: string): Promise<{
        success: boolean;
        error: string | null;
    }> {
        try {
            const { error } = await supabase.auth.mfa.unenroll({
                factorId,
            });

            if (error) throw error;

            return {
                success: true,
                error: null,
            };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Erro ao remover MFA',
            };
        }
    }

    /**
     * Gera códigos de backup (simulado - Supabase não tem API nativa)
     * Em produção, você deve implementar isso no backend
     */
    static generateBackupCodes(count: number = 10): BackupCode[] {
        const codes: BackupCode[] = [];

        for (let i = 0; i < count; i++) {
            // Gera código de 8 dígitos
            const code = Math.random().toString(36).substring(2, 10).toUpperCase();
            codes.push({
                code,
                used: false,
            });
        }

        return codes;
    }

    /**
     * Verifica se usuário tem MFA ativado
     */
    static async hasMFA(): Promise<boolean> {
        const { factors } = await this.listFactors();
        return factors.some(f => f.status === 'verified');
    }

    /**
     * Obtém o nível de garantia de autenticação (AAL)
     */
    static async getAAL(): Promise<{
        currentLevel: 'aal1' | 'aal2' | null;
        nextLevel: 'aal1' | 'aal2' | null;
        error: string | null;
    }> {
        try {
            const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

            if (error) throw error;

            return {
                currentLevel: data.currentLevel as 'aal1' | 'aal2',
                nextLevel: data.nextLevel as 'aal1' | 'aal2',
                error: null,
            };
        } catch (err) {
            return {
                currentLevel: null,
                nextLevel: null,
                error: err instanceof Error ? err.message : 'Erro ao obter AAL',
            };
        }
    }
}
