import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { SocialLoginButtons } from './SocialLoginButtons';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { login, loading, error, clearError } = useAuthContext();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    console.log('🔍 LoginForm: handleSubmit chamado');
    console.log('📧 Email:', formData.email);
    console.log('🔒 Password length:', formData.password.length);

    if (!formData.email || !formData.password) {
      console.log('❌ LoginForm: Email ou senha vazios');
      return;
    }

    console.log('🚀 LoginForm: Chamando função login...');
    const result = await login(formData);
    console.log('📊 LoginForm: Resultado do login:', result);

    if (result.success && onSuccess) {
      console.log('✅ LoginForm: Login bem-sucedido, chamando onSuccess');
      onSuccess();
    } else {
      console.log('❌ LoginForm: Login falhou ou onSuccess não definido');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Entrar</h2>
          <p className="text-blue-200">Acesse sua conta</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl backdrop-blur-sm">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Social Login Buttons */}
        <SocialLoginButtons
          mode="login"
          onSuccess={onSuccess}
          onError={(err) => console.error('Social login error:', err)}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200 pr-12"
                placeholder="Sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-200 hover:text-white transition-colors duration-200"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.email || !formData.password}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Entrando...
              </div>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-blue-300 hover:text-white text-sm font-medium transition-colors duration-200"
            onClick={() => {
              // TODO: Implementar recuperação de senha
              alert('Funcionalidade de recuperação de senha será implementada em breve');
            }}
          >
            Esqueceu sua senha?
          </button>
        </div>

        {onSwitchToRegister && (
          <div className="mt-4 text-center">
            <p className="text-blue-200 text-sm">
              Não tem uma conta?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-300 hover:text-white font-medium transition-colors duration-200"
              >
                Cadastre-se
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;