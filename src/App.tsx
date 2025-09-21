import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Cadastros from "@/pages/Cadastros";
import CreateRDO from "@/pages/CreateRDO";
import ObraDetails from "@/pages/ObraDetails";
import RDODetails from "@/pages/RDODetails";
import Configuracoes from "@/pages/Configuracoes";
import ObraTasks from "@/pages/ObraTasks";
import CreateTask from "@/pages/CreateTask";
import ManualInstrucoes from "@/pages/ManualInstrucoes";
import Reports from "@/pages/Reports";
import DatabaseTest from "@/pages/DatabaseTest";
import Auth from "@/pages/Auth";
import MainLayout from "@/layouts/MainLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import QueryProvider from "@/providers/QueryProvider";
import OfflineProvider from "@/providers/OfflineProvider";

export default function App() {
  return (
    <Router>
      <QueryProvider>
        <OfflineProvider>
          <AuthProvider>
        <Routes>
          {/* Rotas públicas (não requerem autenticação) */}
          <Route 
            path="/login" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Auth />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Auth />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cadastro" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Auth />
              </ProtectedRoute>
            } 
          />
          
          {/* Rotas protegidas (requerem autenticação) */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout><Dashboard /></MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <MainLayout><Dashboard /></MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cadastros" 
            element={
              <ProtectedRoute>
                <MainLayout><Cadastros /></MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cadastros/obras" 
            element={
              <ProtectedRoute>
                <MainLayout><Cadastros /></MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <MainLayout><Reports /></MainLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Rotas sem o layout principal (tela cheia) - protegidas */}
          <Route 
            path="/obra/:id" 
            element={
              <ProtectedRoute>
                <ObraDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/obra/:id/tarefas" 
            element={
              <ProtectedRoute>
                <ObraTasks />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/obra/:id/tarefa/nova" 
            element={
              <ProtectedRoute>
                <CreateTask />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/obra/:id/rdo/novo" 
            element={
              <ProtectedRoute>
                <CreateRDO />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/obra/:obraId/rdo/:rdoId" 
            element={
              <ProtectedRoute>
                <RDODetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/rdo/novo" 
            element={
              <ProtectedRoute>
                <CreateRDO />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/configuracoes" 
            element={
              <ProtectedRoute>
                <Configuracoes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manual" 
            element={
              <ProtectedRoute>
                <ManualInstrucoes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/database-test" 
            element={
              <ProtectedRoute>
                <MainLayout><DatabaseTest /></MainLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
          </AuthProvider>
        </OfflineProvider>
      </QueryProvider>
    </Router>
  );
}