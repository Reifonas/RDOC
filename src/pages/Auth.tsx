import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { supabase } from '../lib/supabase';
import NeuralNetworkBackground from '../components/NeuralNetworkBackground';
import tracksteelLogo from '/tracksteel-logo.png';

type AuthMode = 'login' | 'register';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, bypassLogin } = useAuthContext();
  const [mode, setMode] = useState<AuthMode>('login');
  const [logoError, setLogoError] = useState(false);

  // Debug: verificar se o logo está sendo carregado
  console.debug('Logo path:', tracksteelLogo);
  console.debug('Logo exists:', !!tracksteelLogo);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location]);

  // Determinar modo inicial baseado na URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('register') || path.includes('cadastro')) {
      setMode('register');
    } else {
      setMode('login');
    }
  }, [location.pathname]);

  const handleAuthSuccess = () => {
    console.log('🎯 Auth: handleAuthSuccess chamado');
    console.log('🧭 Auth: Navegando para /dashboard');
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  };

  // Função para bypass temporário (desenvolvimento)
  const handleBypassLogin = async () => {
    console.log('🔥 BOTÃO BYPASS CLICADO!');
    try {
      console.log('🚧 Chamando bypassLogin do contexto...');
      const result = await bypassLogin();
      
      if (result.success) {
        console.log('✅ Bypass realizado com sucesso, navegando...');
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        console.error('❌ Falha no bypass:', result.error);
      }
    } catch (error) {
      console.error('❌ Erro no bypass:', error);
    }
  };

  const switchToLogin = () => {
    setMode('login');
    navigate('/login', { replace: true });
  };

  const switchToRegister = () => {
    setMode('register');
    navigate('/register', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <NeuralNetworkBackground />
      
      <div className="relative z-10 max-w-md w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-6">
            {!logoError ? (
              <img 
                src={tracksteelLogo}
                alt="TrackSteel Logo" 
                width="160" 
                height="120" 
                className="mx-auto drop-shadow-2xl"
                onLoad={() => console.debug('Logo carregado com sucesso')}
                onError={(e) => {
                  console.error('Erro ao carregar logo:', e);
                  console.error('Src atual:', tracksteelLogo);
                  setLogoError(true);
                }}
              />
            ) : (
              <svg 
                width="160" 
                height="120" 
                viewBox="0 0 160 120" 
                className="mx-auto drop-shadow-2xl"
              >
                <defs>
                  <linearGradient id="steelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e40af" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <g transform="translate(20, 20)">
                  <path d="M20 20 L100 20 L110 30 L30 30 Z" fill="url(#steelGradient)" opacity="0.9" />
                  <path d="M30 30 L110 30 L120 40 L40 40 Z" fill="url(#steelGradient)" opacity="0.8" />
                  <path d="M40 40 L120 40 L110 50 L30 50 Z" fill="url(#steelGradient)" opacity="0.7" />
                  <rect x="60" y="10" width="20" height="8" rx="2" fill="#1e3a8a" />
                  <text x="70" y="16" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">RDO</text>
                </g>
              </svg>
            )}
            
            <div className="mt-4">
              <h1 className="text-3xl font-bold text-white mb-2">TRACKSTEEL</h1>
              <h2 className="text-xl text-blue-200 mb-1">Sistema RDO</h2>
              <p className="text-sm text-blue-300">Relatório Diário de Obras</p>
              <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent w-32 mx-auto mt-2"></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-1 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === 'login'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-blue-200 hover:text-white hover:bg-white/10'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === 'register'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-blue-200 hover:text-white hover:bg-white/10'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {/* Botão de Bypass Temporário - APENAS DESENVOLVIMENTO */}
        <div className="mb-6">
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl backdrop-blur-sm p-4">
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-yellow-200">
                  Modo Desenvolvimento
                </h3>
              </div>
            </div>
            <div className="ml-8">
              <p className="text-sm text-yellow-100 mb-3">
                Botão temporário para acesso direto ao sistema sem autenticação.
              </p>
              <button
                onClick={handleBypassLogin}
                className="bg-yellow-300/90 hover:bg-yellow-200 text-yellow-900 font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 shadow-lg hover:shadow-xl"
              >
                🚧 Entrar sem Login (DEV)
              </button>
            </div>
          </div>
        </div>

        {/* Forms */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 transition-all duration-300 hover:bg-white/15 animate-slide-up">
          {mode === 'login' ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={switchToRegister}
            />
          ) : (
            <RegisterForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={switchToLogin}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-300">
          <p className="italic">Desenvolvido por TrackSteel</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;