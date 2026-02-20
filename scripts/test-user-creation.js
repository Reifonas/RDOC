import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://bbyzrywmgjiufqtnkslu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieXpyeXdtZ2ppdWZxdG5rc2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjE4MzgsImV4cCI6MjA3MDczNzgzOH0.O0Eksg4_cxKk7jbC3wYLWbwZ9FsoTzsztnPPpzGL3pE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  console.log('🔄 Criando usuário de teste...');
  
  const testEmail = 'teste@rdomain.com';
  const testPassword = 'teste123456';
  
  try {
    // Tentar registrar o usuário
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          nome: 'Usuário Teste',
          tipo: 'usuario'
        }
      }
    });
    
    if (error) {
      console.error('❌ Erro ao criar usuário:', error.message);
      return;
    }
    
    console.log('✅ Usuário criado com sucesso!');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Senha:', testPassword);
    console.log('👤 Dados:', data);
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar a função
createTestUser();