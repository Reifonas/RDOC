import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import QueryProvider from "@/providers/QueryProvider";
import OfflineProvider from "@/providers/OfflineProvider";
import { routeConfig, routeUtils, type RouteConfig } from "@/config/routes";
import { useAppStateStore } from "@/stores/useAppStateStore";
import ErrorBoundary from "@/components/ErrorBoundary";

import { Suspense, useEffect } from 'react';

// Componente de loading para Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Função para renderizar rotas dinamicamente
const renderRoute = (route: RouteConfig) => {
  const Component = route.component;
  
  const element = (
    <Suspense fallback={<PageLoader />}>
      <ProtectedRoute requireAuth={route.requireAuth}>
        {route.useLayout ? (
          <MainLayout>
            <Component />
          </MainLayout>
        ) : (
          <Component />
        )}
      </ProtectedRoute>
    </Suspense>
  );

  return (
    <Route 
      key={route.path} 
      path={route.path} 
      element={element}
    />
  );
};

// Componente interno para usar hooks
function AppContent() {
  const { initializeApp, setConnectivity } = useAppStateStore();

  useEffect(() => {
    // Inicializar estado da aplicação
    initializeApp();

    // Preload de rotas críticas após inicialização
    const preloadTimer = setTimeout(() => {
      routeUtils.preloadRoutes().catch(console.warn);
    }, 1000); // Delay para não impactar o carregamento inicial

    // Monitorar conectividade
    const handleOnline = () => setConnectivity(true);
    const handleOffline = () => setConnectivity(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(preloadTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [initializeApp, setConnectivity]);

  return (
    <Routes>
      {routeConfig.map(renderRoute)}
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <QueryProvider>
          <OfflineProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </OfflineProvider>
        </QueryProvider>
      </Router>
    </ErrorBoundary>
  );
}