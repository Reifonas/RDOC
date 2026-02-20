#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function setupSupabase() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🔗 CONFIGURAR CONEXÃO COM SUPABASE "RDO"                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);

  console.log('📋 Você vai precisar das credenciais do seu projeto Supabase "RDO"');
  console.log('   Acesse: https://supabase.com/dashboard');
  console.log('   Selecione o projeto "RDO"');
  console.log('   Vá em: Settings → API\n');

  // Obter credenciais
  const supabaseUrl = await question('🔗 Project URL (https://...supabase.co): ');
  const anonKey = await question('🔑 Anon Public Key: ');

  // Validar
  if (!supabaseUrl || !anonKey) {
    console.error('\n❌ Erro: Credenciais não podem estar vazias!');
    rl.close();
    process.exit(1);
  }

  if (!supabaseUrl.includes('supabase.co')) {
    console.error('\n❌ Erro: URL do Supabase inválida!');
    rl.close();
    process.exit(1);
  }

  if (!anonKey.startsWith('eyJ')) {
    console.error('\n❌ Erro: Anon Key parece inválida (deve começar com "eyJ")!');
    rl.close();
    process.exit(1);
  }

  // Atualizar .env
  console.log('\n⏳ Atualizando arquivo .env...');

  const envPath = join(process.cwd(), '.env');
  const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${anonKey}

# Service Role Key (Backend Only - Never use in frontend)
# SUPABASE_SERVICE_ROLE_KEY=
`;

  try {
    writeFileSync(envPath, envContent);
    console.log('✅ Arquivo .env atualizado com sucesso!\n');
  } catch (error) {
    console.error('❌ Erro ao atualizar .env:', error.message);
    rl.close();
    process.exit(1);
  }

  // Extrair project-ref
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  console.log('📊 Resumo da configuração:');
  console.log(`   Project URL: ${supabaseUrl}`);
  console.log(`   Project Ref: ${projectRef}`);
  console.log(`   Anon Key: ${anonKey.substring(0, 20)}...`);

  console.log('\n✅ Configuração concluída!\n');

  console.log('📝 Próximos passos:\n');
  console.log('1️⃣  Linkar projeto Supabase CLI:');
  console.log(`    supabase link --project-ref ${projectRef}\n`);

  console.log('2️⃣  Verificar conexão:');
  console.log('    node check-supabase-status.js\n');

  console.log('3️⃣  Aplicar migrations:');
  console.log('    supabase db push\n');

  console.log('4️⃣  Iniciar desenvolvimento:');
  console.log('    npm run dev\n');

  rl.close();
}

setupSupabase().catch(error => {
  console.error('❌ Erro:', error.message);
  rl.close();
  process.exit(1);
});
