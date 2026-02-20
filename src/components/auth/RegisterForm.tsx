import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { register, loading, error, clearError } = useAuthContext();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    telefone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }

    if (formData.cpf && !/^\d{11}$/.test(formData.cpf.replace(/\D/g, ''))) {
      errors.cpf = 'CPF deve ter 11 dígitos';
    }

    if (formData.telefone && !/^\d{10,11}$/.test(formData.telefone.replace(/\D/g, ''))) {
      errors.telefone = 'Telefone deve ter 10 ou 11 dígitos';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormErrors({});

    if (!validateForm()) {
      return;
    }

    const result = await register({
      nome: formData.nome,
      email: formData.email,
      password: formData.password,
      cpf: formData.cpf || undefined,
      telefone: formData.telefone || undefined
    });

    if (result.success) {
      alert('Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.');
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Cadastrar</h2>
          <p className="text-blue-200">Crie sua conta</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl backdrop-blur-sm">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-white mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
                formErrors.nome ? 'border-red-400/50' : 'border-white/20'
              }`}
              placeholder="Seu nome completo"
            />
            {formErrors.nome && (
              <p className="text-red-300 text-xs mt-1">{formErrors.nome}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
                formErrors.email ? 'border-red-400/50' : 'border-white/20'
              }`}
              placeholder="seu@email.com"
            />
            {formErrors.email && (
              <p className="text-red-300 text-xs mt-1">{formErrors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-white mb-2">
                CPF
              </label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={formatCPF(formData.cpf)}
                onChange={(e) => handleChange({ ...e, target: { ...e.target, value: e.target.value.replace(/\D/g, '') } })}
                maxLength={14}
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
                  formErrors.cpf ? 'border-red-400/50' : 'border-white/20'
                }`}
                placeholder="000.000.000-00"
              />
              {formErrors.cpf && (
                <p className="text-red-300 text-xs mt-1">{formErrors.cpf}</p>
              )}
            </div>

            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-white mb-2">
                Telefone
              </label>
              <input
                type="text"
                id="telefone"
                name="telefone"
                value={formatPhone(formData.telefone)}
                onChange={(e) => handleChange({ ...e, target: { ...e.target, value: e.target.value.replace(/\D/g, '') } })}
                maxLength={15}
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
                  formErrors.telefone ? 'border-red-400/50' : 'border-white/20'
                }`}
                placeholder="(11) 99999-9999"
              />
              {formErrors.telefone && (
                <p className="text-red-300 text-xs mt-1">{formErrors.telefone}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Senha *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200 pr-10 ${
                  formErrors.password ? 'border-red-400/50' : 'border-white/20'
                }`}
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-200 hover:text-white"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {formErrors.password && (
              <p className="text-red-300 text-xs mt-1">{formErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
              Confirmar Senha *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200 pr-10 ${
                  formErrors.confirmPassword ? 'border-red-400/50' : 'border-white/20'
                }`}
                placeholder="Confirme sua senha"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-200 hover:text-white"
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="text-red-300 text-xs mt-1">{formErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium backdrop-blur-sm"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cadastrando...
              </div>
            ) : (
              'Cadastrar'
            )}
          </button>
        </form>

        {onSwitchToLogin && (
          <div className="mt-4 text-center">
            <p className="text-blue-200 text-sm">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-white hover:text-blue-200 font-medium underline transition-colors duration-200"
              >
                Entrar
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;