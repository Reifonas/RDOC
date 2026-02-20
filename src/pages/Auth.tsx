import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import NeuralNetworkBackground from '../components/NeuralNetworkBackground';
import tracksteelLogo from '../assets/tracksteel-logo.png';

type AuthMode = 'login' | 'register';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuthContext();
  const [mode, setMode] = useState<AuthMode>('login');



  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const state = location.state as LocationState;
      const from = state?.from?.pathname || '/dashboard';
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
    const state = location.state as LocationState;
    const from = state?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
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
            {/* Card discreto para o logo */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 mb-4 inline-block">
              <div className="w-40 h-30 flex items-center justify-center">
                <img
                  src={tracksteelLogo}
                  alt="TrackSteel Logo"
                  width="160"
                  height="120"
                  className="mx-auto drop-shadow-2xl"
                  onLoad={() => console.log('✅ Logo carregado com sucesso via importação!')}
                  onError={(e) => {
                    console.log('❌ Erro ao carregar logo via importação:', e);
                    // Mostrar fallback
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    const fallback = img.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                {/* Fallback SVG */}
                <div className="hidden text-white text-center">
                  <svg className="w-40 h-30 mx-auto mb-2" viewBox="0 0 160 120" fill="none">
                    <rect width="160" height="120" rx="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" />
                    <text x="80" y="65" textAnchor="middle" className="fill-white text-lg font-bold">LOGO</text>
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent w-32 mx-auto"></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-1 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === 'login'
              ? 'bg-white/20 text-white shadow-lg'
              : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === 'register'
              ? 'bg-white/20 text-white shadow-lg'
              : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
          >
            Cadastrar
          </button>
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