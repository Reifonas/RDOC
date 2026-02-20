import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

    const startCamera = useCallback(async () => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            setLoading(true);
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode }
            });
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
            setLoading(false);
        } catch (err) {
            console.error('Erro ao acessar câmera:', err);
            toast.error('Não foi possível acessar a câmera. Verifique as permissões.');
            setLoading(false);
        }
    }, [facingMode]);

    useEffect(() => {
        startCamera();

        // Tentar pegar localização
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.warn('Geolocalização não permitida:', error);
                    toast.warning('Localização não permitida. A foto ficará sem coordenadas.');
                }
            );
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [startCamera]);

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Configura tamanho do canvas igual ao vídeo
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Desenha o frame do vídeo
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Adiciona Marca d'água (Overlay)
        const padding = 20;
        const fontSize = Math.max(16, canvas.width / 25); // Dinâmico com a largura
        const lineHeight = fontSize * 1.5;

        // Fundo escuro semitransparente na parte inferior
        const footerHeight = lineHeight * 3 + padding * 2;
        context.fillStyle = 'rgba(0, 0, 0, 0.6)';
        context.fillRect(0, canvas.height - footerHeight, canvas.width, footerHeight);

        // Texto Branco
        context.fillStyle = '#ffffff';
        context.font = `${fontSize}px sans-serif`;
        context.textBaseline = 'bottom';

        const date = new Date().toLocaleString('pt-BR');

        // Linha 1: Data e Hora
        context.fillText(date, padding, canvas.height - footerHeight + padding + fontSize);

        // Linha 2: Localização (se houver)
        if (location) {
            const locText = `Lat: ${location.lat.toFixed(5)} | Lng: ${location.lng.toFixed(5)}`;
            context.fillText(locText, padding, canvas.height - footerHeight + padding + (fontSize + 10) * 2);
        } else {
            context.fillText('Localização não disponível', padding, canvas.height - footerHeight + padding + (fontSize + 10) * 2);
        }

        // Linha 3: App Name (Opcional)
        context.font = `bold ${fontSize * 0.8}px sans-serif`;
        context.fillStyle = '#dddddd';
        context.fillText('RDO App - Registro Fotográfico', padding, canvas.height - padding);

        // Converter para Arquivo
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `foto_rdo_${Date.now()}.jpg`, { type: 'image/jpeg' });
                onCapture(file);
            }
        }, 'image/jpeg', 0.85); // Qualidade 85%
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="flex justify-between items-center p-4 bg-black/50 absolute top-0 w-full z-10">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <Camera className="w-5 h-5" /> Nova Foto
                </h3>
                <button onClick={onClose} className="p-2 bg-gray-800 rounded-full text-white" title="Fechar câmera" aria-label="Fechar câmera">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
                {loading && <p className="text-white absolute">Iniciando câmera...</p>}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Info overlay preview */}
                <div className="absolute bottom-24 left-4 right-4 text-white text-xs opacity-70 bg-black/40 p-2 rounded pointer-events-none">
                    <p>{new Date().toLocaleTimeString()}</p>
                    {location && (
                        <p className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </p>
                    )}
                </div>
            </div>

            <div className="p-6 bg-black flex justify-around items-center">
                <button
                    onClick={toggleCamera}
                    className="p-3 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition"
                    title="Trocar câmera"
                    aria-label="Trocar câmera"
                >
                    <RefreshCw className="w-6 h-6" />
                </button>

                <button
                    onClick={takePhoto}
                    className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:scale-105 transition shadow-lg"
                    title="Tirar foto"
                    aria-label="Tirar foto"
                />

                <div className="w-12" /> {/* Espaçador para centralizar */}
            </div>
        </div>
    );
};
