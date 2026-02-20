import { lazy } from 'react';
import type { ComponentType } from 'react';

// Lazy loading otimizado com preload para rotas críticas
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Cadastros = lazy(() => import('@/pages/Cadastros'));
const CreateRDO = lazy(() => import('@/pages/CreateRDO'));
const ObraDetails = lazy(() => import('@/pages/ObraDetails'));
const RDODetails = lazy(() => import('@/pages/RDODetails'));
const Configuracoes = lazy(() => import('@/pages/Configuracoes'));
const ObraTasks = lazy(() => import('@/pages/ObraTasks'));
const CreateTask = lazy(() => import('@/pages/CreateTask'));
const ManualInstrucoes = lazy(() => import('@/pages/ManualInstrucoes'));
const Reports = lazy(() => import('@/pages/Reports'));
const DatabaseTest = lazy(() => import('@/pages/DatabaseTest'));
const Auth = lazy(() => import('@/pages/Auth'));
const CreateObra = lazy(() => import('@/pages/CreateObra'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback').then(m => ({ default: m.AuthCallback })));
const SelectOrganization = lazy(() => import('@/pages/SelectOrganization'));

// Preload de rotas críticas para melhor UX
export const preloadCriticalRoutes = () => {
  // Preload das rotas mais utilizadas
  import('@/pages/Dashboard');
  import('@/pages/CreateRDO');
  import('@/pages/ObraDetails');
};

// Tipos para configuração de rotas
export interface RouteConfig {
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  requireAuth?: boolean;
  useLayout?: boolean;
  title?: string;
  description?: string;
  preload?: boolean; // Indica se deve fazer preload
  category?: 'auth' | 'main' | 'obra' | 'admin'; // Categoria da rota
}

// Configuração declarativa das rotas
export const routeConfig: RouteConfig[] = [
  // Rotas públicas (autenticação)
  {
    path: '/login',
    component: Auth,
    requireAuth: false,
    useLayout: false,
    title: 'Login',
    description: 'Página de login do sistema RDO',
    preload: true,
    category: 'auth'
  },
  {
    path: '/register',
    component: Auth,
    requireAuth: false,
    useLayout: false,
    title: 'Cadastro',
    description: 'Página de cadastro de usuário',
    preload: false,
    category: 'auth'
  },
  {
    path: '/cadastro',
    component: Auth,
    requireAuth: false,
    useLayout: false,
    title: 'Cadastro',
    description: 'Página de cadastro de usuário',
    preload: false,
    category: 'auth'
  },
  {
    path: '/auth/callback',
    component: AuthCallback,
    requireAuth: false,
    useLayout: false,
    title: 'Callback OAuth',
    description: 'Processamento de retorno OAuth',
    preload: false,
    category: 'auth'
  },
  {
    path: '/selecionar-organizacao',
    component: SelectOrganization,
    requireAuth: false,
    useLayout: false,
    title: 'Selecionar Organização',
    description: 'Seleção de organização via código de convite',
    preload: false,
    category: 'auth'
  },

  // Rotas protegidas com layout principal
  {
    path: '/',
    component: Dashboard,
    requireAuth: true,
    useLayout: true,
    title: 'Dashboard',
    description: 'Painel principal do sistema RDO',
    preload: true,
    category: 'main'
  },
  {
    path: '/dashboard',
    component: Dashboard,
    requireAuth: true,
    useLayout: true,
    title: 'Dashboard',
    description: 'Painel principal do sistema RDO',
    preload: true,
    category: 'main'
  },
  {
    path: '/cadastros',
    component: Cadastros,
    requireAuth: true,
    useLayout: true,
    title: 'Cadastros',
    description: 'Gerenciamento de cadastros',
    preload: false,
    category: 'admin'
  },
  {
    path: '/cadastros/obras',
    component: Cadastros,
    requireAuth: true,
    useLayout: true,
    title: 'Cadastro de Obras',
    description: 'Gerenciamento de obras',
    preload: false,
    category: 'admin'
  },
  {
    path: '/cadastros/obras/new',
    component: CreateObra,
    requireAuth: true,
    useLayout: false,
    title: 'Nova Obra',
    description: 'Cadastro de nova obra',
    preload: false,
    category: 'admin'
  },
  {
    path: '/reports',
    component: Reports,
    requireAuth: true,
    useLayout: true,
    title: 'Relatórios',
    description: 'Relatórios e análises do sistema',
    preload: false,
    category: 'admin'
  },
  {
    path: '/database-test',
    component: DatabaseTest,
    requireAuth: true,
    useLayout: true,
    title: 'Teste de Banco',
    description: 'Página de teste do banco de dados',
    preload: false,
    category: 'admin'
  },

  // Rotas protegidas sem layout (tela cheia)
  {
    path: '/obra/:id',
    component: ObraDetails,
    requireAuth: true,
    useLayout: false,
    title: 'Detalhes da Obra',
    description: 'Visualização detalhada da obra',
    preload: true,
    category: 'obra'
  },
  {
    path: '/obra/:id/tarefas',
    component: ObraTasks,
    requireAuth: true,
    useLayout: false,
    title: 'Tarefas da Obra',
    description: 'Gerenciamento de tarefas da obra',
    preload: false,
    category: 'obra'
  },
  {
    path: '/obra/:id/tarefa/nova',
    component: CreateTask,
    requireAuth: true,
    useLayout: false,
    title: 'Nova Tarefa',
    description: 'Criação de nova tarefa',
    preload: false,
    category: 'obra'
  },
  {
    path: '/obra/:id/rdo/novo',
    component: CreateRDO,
    requireAuth: true,
    useLayout: false,
    title: 'Novo RDO',
    description: 'Criação de novo RDO',
    preload: true,
    category: 'obra'
  },
  {
    path: '/obra/:obraId/rdo/:rdoId',
    component: RDODetails,
    requireAuth: true,
    useLayout: false,
    title: 'Detalhes do RDO',
    description: 'Visualização detalhada do RDO',
    preload: false,
    category: 'obra'
  },
  {
    path: '/rdo/novo',
    component: CreateRDO,
    requireAuth: true,
    useLayout: false,
    title: 'Novo RDO',
    description: 'Criação de novo RDO',
    preload: true,
    category: 'obra'
  },
  {
    path: '/configuracoes',
    component: Configuracoes,
    requireAuth: true,
    useLayout: false,
    title: 'Configurações',
    description: 'Configurações do sistema',
    preload: false,
    category: 'admin'
  },
  {
    path: '/manual',
    component: ManualInstrucoes,
    requireAuth: true,
    useLayout: false,
    title: 'Manual de Instruções',
    description: 'Manual de uso do sistema',
    preload: false,
    category: 'admin'
  }
];

// Utilitários para trabalhar com rotas
export const routeUtils = {
  // Encontrar rota por path
  findRoute: (path: string): RouteConfig | undefined => {
    return routeConfig.find(route => route.path === path);
  },

  // Obter rotas públicas
  getPublicRoutes: (): RouteConfig[] => {
    return routeConfig.filter(route => !route.requireAuth);
  },

  // Obter rotas protegidas
  getProtectedRoutes: (): RouteConfig[] => {
    return routeConfig.filter(route => route.requireAuth);
  },

  // Obter rotas com layout
  getLayoutRoutes: (): RouteConfig[] => {
    return routeConfig.filter(route => route.useLayout);
  },

  // Obter rotas sem layout
  getFullScreenRoutes: (): RouteConfig[] => {
    return routeConfig.filter(route => route.requireAuth && !route.useLayout);
  },

  // Obter rotas para preload
  getPreloadRoutes: (): RouteConfig[] => {
    return routeConfig.filter(route => route.preload);
  },

  // Obter rotas por categoria
  getRoutesByCategory: (category: RouteConfig['category']): RouteConfig[] => {
    return routeConfig.filter(route => route.category === category);
  },

  // Executar preload das rotas críticas
  preloadRoutes: async (): Promise<void> => {
    const preloadRoutes = routeUtils.getPreloadRoutes();
    const preloadPromises = preloadRoutes.map(route => {
      // Preload baseado no componente
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((route.component as any) === Dashboard) return import('@/pages/Dashboard');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((route.component as any) === CreateRDO) return import('@/pages/CreateRDO');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((route.component as any) === ObraDetails) return import('@/pages/ObraDetails');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((route.component as any) === Auth) return import('@/pages/Auth');
      return Promise.resolve();
    });

    await Promise.allSettled(preloadPromises);
  },

  // Gerar breadcrumbs baseado na rota atual
  generateBreadcrumbs: (currentPath: string): Array<{ label: string, path?: string }> => {
    const route = routeUtils.findRoute(currentPath);
    if (!route) return [];

    const breadcrumbs = [{ label: 'Home', path: '/' }];

    if (route.category === 'obra') {
      breadcrumbs.push({ label: 'Obras', path: '/obras' });
    } else if (route.category === 'admin') {
      breadcrumbs.push({ label: 'Administração', path: '/cadastros' });
    }

    breadcrumbs.push({ label: route.title || 'Página', path: currentPath });
    return breadcrumbs;
  }
};