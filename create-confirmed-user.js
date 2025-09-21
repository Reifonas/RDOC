// Script para criar um usuário já confirmado usando service role
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com service role (permite criar usuários confirmados)
const supabaseUrl = 'https://bbyzrywmgjiufqtnkslu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieXpyeXdtZ2ppdWZxdG5rc2x1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE2MTgzOCwiZXhwIjoyMDcwNzM3ODM4fQ.TXeQHsvfiebRK2OFr0hhQIRaO7m6tPD7RwMmKvC36-g';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createConfirmedUser() {
  console.log('🔧 Criando usuário confirmado com service role...');
  
  const email = 'teste@rdomain.com';
  const password = 'teste123456';
  
  try {
    // Primeiro, vamos tentar deletar o usuário existente se houver
    console.log('🗑️ Tentando remover usuário existente...');
    
    // Criar usuário já confirmado
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Confirma o email automaticamente
      user_metadata: {
        nome: 'Usuário Teste',
        tipo: 'teste'
      }
    });
    
    if (error) {
      console.error('❌ Erro ao criar usuário:', error.message);
      console.error('📋 Detalhes:', error);
    } else {
      console.log('✅ Usuário criado e confirmado com sucesso!');
      console.log('👤 ID:', data.user?.id);
      console.log('📧 Email:', data.user?.email);
      console.log('✉️ Email confirmado:', data.user?.email_confirmed_at ? 'Sim' : 'Não');
      console.log('📊 Metadata:', data.user?.user_metadata);
    }
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
  }
}

createConfirmedUser();