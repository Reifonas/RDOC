// Script para testar o login com as credenciais criadas
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://bbyzrywmgjiufqtnkslu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieXpyeXdtZ2ppdWZxdG5rc2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjE4MzgsImV4cCI6MjA3MDczNzgzOH0.O0Eksg4_cxKk7jbC3wYLWbwZ9FsoTzsztnPPpzGL3pE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log('🧪 Testando login com credenciais criadas...');
  
  const email = 'teste@rdomain.com';
  const password = 'teste123456';
  
  try {
    console.log(`📧 Email: ${email}`);
    console.log(`🔒 Password: ${password}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) {
      console.error('❌ Erro no login:', error.message);
      console.error('📋 Detalhes do erro:', error);
    } else {
      console.log('✅ Login realizado com sucesso!');
      console.log('👤 Usuário:', data.user?.email);
      console.log('🎫 Session:', data.session ? 'Ativa' : 'Inativa');
      
      // Fazer logout
      await supabase.auth.signOut();
      console.log('🚪 Logout realizado');
    }
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
  }
}

testLogin();