import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ler .env manualmente
const envContent = readFileSync(join(__dirname, '..', '.env'), 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Credenciais do Supabase não encontradas no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseStatus() {
  console.log('🔍 Verificando status do Supabase...\n');
  console.log('📍 URL:', supabaseUrl);
  console.log('🔑 Anon Key:', supabaseKey.substring(0, 20) + '...\n');

  try {
    // 1. Testar conexão básica
    console.log('1️⃣ Testando conexão...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('_supabase_health_check')
      .select('*')
      .limit(1);

    if (healthError && healthError.code !== 'PGRST116') {
      console.log('⚠️  Conexão estabelecida (tabela de health check não existe, mas isso é normal)\n');
    } else {
      console.log('✅ Conexão estabelecida com sucesso!\n');
    }

    // 2. Listar todas as tabelas existentes
    console.log('2️⃣ Verificando tabelas existentes...');

    // Tentar listar tabelas conhecidas
    const knownTables = [
      'usuarios',
      'organizacoes',
      'obras',
      'rdos',
      'rdo_atividades',
      'rdo_mao_obra',
      'rdo_equipamentos',
      'rdo_ocorrencias',
      'rdo_anexos',
      'tarefas',
      'task_logs'
    ];

    console.log('📋 Verificando tabelas conhecidas:\n');
    const existingTables = [];

    for (const table of knownTables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (!error) {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        existingTables.push(table);
        console.log(`   ✅ ${table.padEnd(25)} (${count || 0} registros)`);
      } else if (error.code === '42P01') {
        console.log(`   ❌ ${table.padEnd(25)} (não existe)`);
      } else {
        console.log(`   ⚠️  ${table.padEnd(25)} (erro: ${error.message})`);
      }
    }

    console.log('\n3️⃣ Resumo:');
    console.log(`   📊 Tabelas encontradas: ${existingTables.length}/${knownTables.length}`);
    console.log(`   🗄️  Banco de dados: ${existingTables.length > 0 ? 'POPULADO' : 'VAZIO'}`);

    if (existingTables.length === 0) {
      console.log('\n💡 O banco está vazio. Precisamos executar as migrations!');
    } else {
      console.log('\n💡 O banco já tem algumas tabelas. Vamos verificar se precisa de ajustes.');
    }

    // 4. Verificar autenticação
    console.log('\n4️⃣ Verificando sistema de autenticação...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('   ℹ️  Auth configurado:', !authError ? 'SIM' : 'NÃO');

  } catch (error) {
    console.error('❌ Erro ao verificar Supabase:', error.message);
    process.exit(1);
  }
}

checkSupabaseStatus();
