// Script para confirmar o email de um usuário existente
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com service role
const supabaseUrl = 'https://bbyzrywmgjiufqtnkslu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieXpyeXdtZ2ppdWZxdG5rc2x1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE2MTgzOCwiZXhwIjoyMDcwNzM3ODM4fQ.TXeQHsvfiebRK2OFr0hhQIRaO7m6tPD7RwMmKvC36-g';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function confirmUserEmail() {
  console.log('✉️ Confirmando email do usuário existente...');
  
  const email = 'teste@rdomain.com';
  
  try {
    // Primeiro, vamos listar os usuários para encontrar o ID
    console.log('🔍 Buscando usuário por email...');
    
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message);
      return;
    }
    
    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.error('❌ Usuário não encontrado');
      return;
    }
    
    console.log('👤 Usuário encontrado:', user.id);
    console.log('📧 Email atual:', user.email);
    console.log('✉️ Email confirmado:', user.email_confirmed_at ? 'Sim' : 'Não');
    
    if (user.email_confirmed_at) {
      console.log('✅ Email já está confirmado!');
      return;
    }
    
    // Confirmar o email do usuário
    console.log('🔧 Confirmando email...');
    
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true
    });
    
    if (error) {
      console.error('❌ Erro ao confirmar email:', error.message);
      console.error('📋 Detalhes:', error);
    } else {
      console.log('✅ Email confirmado com sucesso!');
      console.log('👤 ID:', data.user?.id);
      console.log('📧 Email:', data.user?.email);
      console.log('✉️ Confirmado em:', data.user?.email_confirmed_at);
    }
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
  }
}

confirmUserEmail();