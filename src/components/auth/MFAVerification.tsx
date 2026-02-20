/**
 * Componente de Verificação MFA
 * 
 * Usado durante o login para verificar código TOTP
 */

import React, { useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { useMFA } from '../../hooks/useMFA';

interface MFAVerificationProps {
    factorId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const MFAVerification: React.FC<MFAVerificationProps> = ({
    factorId,
    onSuccess,
    onCancel,
}) => {
    const { verifyCode, loading, error } = useMFA();
    const [code, setCode] = useState('');

    const handleVerify = async () => {
        const result = await verifyCode(factorId, code);

        if (result.success) {
            onSuccess?.();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && code.length === 6) {
            handleVerify();
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Verificação em Duas Etapas
                </h2>
                <p className="text-gray-600">
                    Digite o código do seu aplicativo autenticador
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-800">Código inválido</p>
                        <p className="text-xs text-red-700 mt-1">{error}</p>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label htmlFor="mfa-code" className="block text-sm font-medium text-gray-700 mb-2">
                        Código de Verificação
                    </label>
                    <input
                        id="mfa-code"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        onKeyPress={handleKeyPress}
                        placeholder="000000"
                        autoFocus
                        className="w-full text-center text-3xl font-mono tracking-widest px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        Digite o código de 6 dígitos
                    </p>
                </div>

                <div className="flex gap-3">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Voltar
                        </button>
                    )}
                    <button
                        onClick={handleVerify}
                        disabled={code.length !== 6 || loading}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {loading ? 'Verificando...' : 'Verificar'}
                    </button>
                </div>

                <div className="text-center">
                    <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        onClick={() => {
                            // TODO: Implementar uso de código de backup
                            alert('Funcionalidade de código de backup será implementada');
                        }}
                    >
                        Usar código de backup
                    </button>
                </div>
            </div>
        </div>
    );
};
