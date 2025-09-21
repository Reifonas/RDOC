import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

/**
 * Teste de conexão e operações básicas do banco de dados
 * Este arquivo testa a conectividade com o Supabase e operações CRUD básicas
 */

// Função para testar a conexão com o banco
export async function testDatabaseConnection() {
  console.log('🔄 Testando conexão com o banco de dados...');
  
  try {
    // Teste 1: Verificar se conseguimos conectar ao Supabase
    const { data, error } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com o banco estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro inesperado na conexão:', error);
    return false;
  }
}

// Função para testar operações básicas de leitura
export async function testBasicReadOperations() {
  console.log('🔄 Testando operações de leitura...');
  
  try {
    // Teste de leitura da tabela usuarios
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('*')
      .limit(5);
    
    if (usuariosError) {
      console.error('❌ Erro ao ler usuários:', usuariosError.message);
      return false;
    }
    
    console.log('✅ Leitura de usuários:', usuarios?.length || 0, 'registros');
    
    // Teste de leitura da tabela obras
    const { data: obras, error: obrasError } = await supabase
      .from('obras')
      .select('*')
      .limit(5);
    
    if (obrasError) {
      console.error('❌ Erro ao ler obras:', obrasError.message);
      return false;
    }
    
    console.log('✅ Leitura de obras:', obras?.length || 0, 'registros');
    
    // Teste de leitura da tabela rdos
    const { data: rdos, error: rdosError } = await supabase
      .from('rdos')
      .select('*')
      .limit(5);
    
    if (rdosError) {
      console.error('❌ Erro ao ler RDOs:', rdosError.message);
      return false;
    }
    
    console.log('✅ Leitura de RDOs:', rdos?.length || 0, 'registros');
    
    return true;
  } catch (error) {
    console.error('❌ Erro inesperado nas operações de leitura:', error);
    return false;
  }
}

// Função para testar operações de escrita (inserção)
export async function testBasicWriteOperations() {
  console.log('🔄 Testando operações de escrita...');
  
  try {
    // Teste de inserção na tabela empresas (tabela de referência)
    const testEmpresa = {
      nome: 'Empresa Teste',
      cnpj: '12345678000199',
      email: 'teste@empresa.com',
      telefone: '(11) 99999-9999',
      endereco: 'Rua Teste, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567'
    };
    
    const { data: empresaData, error: empresaError } = await supabase
      .from('empresas')
      .insert(testEmpresa)
      .select()
      .single();
    
    if (empresaError) {
      console.error('❌ Erro ao inserir empresa:', empresaError.message);
      return false;
    }
    
    console.log('✅ Empresa inserida com sucesso:', empresaData.id);
    
    // Teste de atualização
    const { error: updateError } = await supabase
      .from('empresas')
      .update({ nome: 'Empresa Teste Atualizada' })
      .eq('id', empresaData.id);
    
    if (updateError) {
      console.error('❌ Erro ao atualizar empresa:', updateError.message);
      return false;
    }
    
    console.log('✅ Empresa atualizada com sucesso');
    
    // Teste de exclusão (limpeza)
    const { error: deleteError } = await supabase
      .from('empresas')
      .delete()
      .eq('id', empresaData.id);
    
    if (deleteError) {
      console.error('❌ Erro ao excluir empresa:', deleteError.message);
      return false;
    }
    
    console.log('✅ Empresa excluída com sucesso (limpeza)');
    
    return true;
  } catch (error) {
    console.error('❌ Erro inesperado nas operações de escrita:', error);
    return false;
  }
}

// Função para testar autenticação
export async function testAuthentication() {
  console.log('🔄 Testando sistema de autenticação...');
  
  try {
    // Verificar se há um usuário logado
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Erro ao verificar autenticação:', error.message);
      return false;
    }
    
    if (user) {
      console.log('✅ Usuário autenticado:', user.email);
    } else {
      console.log('ℹ️ Nenhum usuário autenticado (modo anônimo)');
    }
    
    // Testar se conseguimos acessar dados com as políticas RLS
    const { data, error: rlsError } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);
    
    if (rlsError) {
      console.error('❌ Erro nas políticas RLS:', rlsError.message);
      return false;
    }
    
    console.log('✅ Políticas RLS funcionando corretamente');
    
    return true;
  } catch (error) {
    console.error('❌ Erro inesperado na autenticação:', error);
    return false;
  }
}

// Função para testar subscriptions em tempo real
export async function testRealtimeSubscriptions() {
  console.log('🔄 Testando subscriptions em tempo real...');
  
  try {
    // Criar uma subscription de teste
    const subscription = supabase
      .channel('test-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'usuarios'
        },
        (payload) => {
          console.log('📡 Mudança detectada em tempo real:', payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da subscription:', status);
      });
    
    // Aguardar um pouco para estabelecer a conexão
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Remover a subscription
    await supabase.removeChannel(subscription);
    
    console.log('✅ Sistema de tempo real funcionando');
    
    return true;
  } catch (error) {
    console.error('❌ Erro no sistema de tempo real:', error);
    return false;
  }
}

// Função principal para executar todos os testes
export async function runAllDatabaseTests() {
  console.log('🚀 Iniciando testes completos do banco de dados\n');
  
  const results = {
    connection: false,
    read: false,
    write: false,
    auth: false,
    realtime: false
  };
  
  // Executar testes sequencialmente
  results.connection = await testDatabaseConnection();
  console.log('');
  
  if (results.connection) {
    results.read = await testBasicReadOperations();
    console.log('');
    
    results.write = await testBasicWriteOperations();
    console.log('');
    
    results.auth = await testAuthentication();
    console.log('');
    
    results.realtime = await testRealtimeSubscriptions();
    console.log('');
  }
  
  // Resumo dos resultados
  console.log('📊 RESUMO DOS TESTES:');
  console.log('='.repeat(50));
  console.log(`Conexão: ${results.connection ? '✅' : '❌'}`);
  console.log(`Leitura: ${results.read ? '✅' : '❌'}`);
  console.log(`Escrita: ${results.write ? '✅' : '❌'}`);
  console.log(`Autenticação: ${results.auth ? '✅' : '❌'}`);
  console.log(`Tempo Real: ${results.realtime ? '✅' : '❌'}`);
  console.log('='.repeat(50));
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n${allPassed ? '🎉' : '⚠️'} Status geral: ${allPassed ? 'TODOS OS TESTES PASSARAM!' : 'ALGUNS TESTES FALHARAM'}`);
  
  return results;
}

// Executar testes automaticamente se este arquivo for executado diretamente
if (typeof window !== 'undefined') {
  // No browser, adicionar ao objeto global para acesso via console
  (window as any).databaseTests = {
    runAllDatabaseTests,
    testDatabaseConnection,
    testBasicReadOperations,
    testBasicWriteOperations,
    testAuthentication,
    testRealtimeSubscriptions
  };
  
  console.log('🔧 Testes de banco disponíveis no console via window.databaseTests');
}