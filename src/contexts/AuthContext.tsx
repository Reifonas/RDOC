import React, { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuth } from '../hooks/useAuth';

interface AuthContextType {
  // Estado
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Ações
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; data?: any; error?: string }>;
  register: (credentials: { email: string; password: string; nome: string; cpf?: string; telefone?: string }) => Promise<{ success: boolean; data?: any; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<{ nome: string; cpf: string; telefone: string }>) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  bypassLogin: () => Promise<{ success: boolean; data?: any; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthContext;