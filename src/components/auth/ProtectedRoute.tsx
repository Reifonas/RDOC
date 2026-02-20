import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCurrentUser } from '../../stores/useUserStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, loading } = useAuthContext();
  const currentUser = useCurrentUser();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se requer autenticação mas não está autenticado
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // Definição de rotas isentas de redirecionamento automático
  const authExemptPaths = ['/auth/callback', '/selecionar-organizacao'];
  const isExemptPath = authExemptPaths.includes(location.pathname);

  // Se não requer autenticação mas está autenticado (ex: página de login)
  if (!requireAuth && isAuthenticated && !isExemptPath) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // Verificação de Organização
  // Se estiver autenticado e em rota protegida, verificar se possui organização
  if (requireAuth && isAuthenticated && !isExemptPath) {
    // Se o usuário não foi carregado corretamente (null) ou não tem organização,
    // Redireciona para a tela de seleção/ingresse com código
    if (!currentUser || !currentUser.organizacao_id) {
      console.log('🔒 ProtectedRoute: Usuário sem organização/perfil. Redirecionando...');
      return <Navigate to="/selecionar-organizacao" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;