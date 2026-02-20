/**
 * Componente de Setup MFA
 * 
 * Exibe QR Code e permite configuração do MFA
 */

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useMFA } from '../../hooks/useMFA';
import { Shield, Copy, Check, AlertCircle, Download } from 'lucide-react';

interface MFASetupProps {
    onComplete?: () => void;
    onCancel?: () => void;
}

export const MFASetup: React.FC<MFASetupProps> = ({ onComplete, onCancel }) => {
    const { enrollment, backupCodes, startEnrollment, verifyEnrollment, loading, error } = useMFA();
    const [verificationCode, setVerificationCode] = useState('');
    const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Iniciar enrollment automaticamente
        if (!enrollment) {
            startEnrollment('Authenticator App');
        }
    }, [enrollment, startEnrollment]);

    const handleCopySecret = () => {
        if (enrollment) {
            navigator.clipboard.writeText(enrollment.secret);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleVerify = async () => {
        const result = await verifyEnrollment(verificationCode);

        if (result.success) {
            setStep('backup');
        }
    };

    const handleDownloadBackupCodes = () => {
        const text = backupCodes.map(c => c.code).join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mfa-backup-codes.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleComplete = () => {
        onComplete?.();
    };

    if (loading && !enrollment) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Autenticação de Dois Fatores
                </h2>
                <p className="text-gray-600">
                    Adicione uma camada extra de segurança à sua conta
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Step 1: Setup */}
            {step === 'setup' && enrollment && (
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">
                            1. Escaneie o QR Code
                        </h3>

                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                                <QRCodeSVG value={enrollment.uri} size={200} />
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 text-center mb-4">
                            Use um aplicativo autenticador como Google Authenticator, Authy ou Microsoft Authenticator
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-2">Ou insira manualmente:</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 text-sm font-mono bg-white px-3 py-2 rounded border border-gray-200">
                                    {enrollment.secret}
                                </code>
                                <button
                                    onClick={handleCopySecret}
                                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                                    title="Copiar código"
                                >
                                    {copied ? (
                                        <Check className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <Copy className="w-5 h-5 text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">
                            2. Digite o código de verificação
                        </h3>

                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            className="w-full text-center text-2xl font-mono tracking-widest px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            maxLength={6}
                        />

                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Digite o código de 6 dígitos do seu aplicativo autenticador
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                        )}
                        <button
                            onClick={handleVerify}
                            disabled={verificationCode.length !== 6 || loading}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {loading ? 'Verificando...' : 'Verificar e Ativar'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Backup Codes */}
            {step === 'backup' && backupCodes.length > 0 && (
                <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Códigos de Backup
                        </h3>
                        <p className="text-sm text-yellow-800 mb-4">
                            Guarde estes códigos em um local seguro. Você pode usá-los para acessar sua conta se perder acesso ao seu aplicativo autenticador.
                        </p>

                        <div className="grid grid-cols-2 gap-2 bg-white rounded-lg p-4 border border-yellow-300">
                            {backupCodes.map((backup, index) => (
                                <code key={index} className="text-sm font-mono text-gray-900">
                                    {backup.code}
                                </code>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleDownloadBackupCodes}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                        >
                            <Download className="w-5 h-5" />
                            Baixar Códigos
                        </button>
                        <button
                            onClick={handleComplete}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Concluir
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
