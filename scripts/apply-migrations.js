import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ler .env
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

// IMPORTANTE: Para aplicar migrations, você precisa da SERVICE_ROLE_KEY
// Descomente a linha abaixo e adicione a chave no .env
// const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Credenciais do Supabase não encontradas no .env');
  process.exit(1);
}

console.log('⚠️  ATENÇÃO: Este script precisa da SERVICE_ROLE_KEY para funcionar!');
console.log('📝 Por segurança, recomendamos usar o Supabase CLI ou o Dashboard.\n');
console.log('Para usar este script:');
console.log('1. Descomente a linha SUPABASE_SERVICE_ROLE_KEY no .env');
console.log('2. Adicione sua service role key (encontre em: Dashboard > Settings > API)');
console.log('3. Execute novamente\n');

// Se você quiser usar este script, descomente o código abaixo:
/*
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigrations() {
  console.log('🚀 Iniciando aplicação de migrations...\n');
  
  const migrationsDir = join(__dirname, 'supabase', 'migrations');
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  console.log(`📁 Encontradas ${files.length} migrations:\n`);
  files.forEach(f => console.log(`   - ${f}`));
  console.log('');
  
  for (const file of files) {
    console.log(`⏳ Aplicando: ${file}...`);
    
    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        console.error(`❌ Erro ao aplicar ${file}:`);
        console.error(error);
        process.exit(1);
      }
      
      console.log(`✅ ${file} aplicada com sucesso!\n`);
    } catch (err) {
      console.error(`❌ Erro ao aplicar ${file}:`);
      console.error(err.message);
      process.exit(1);
    }
  }
  
  console.log('🎉 Todas as migrations foram aplicadas com sucesso!');
  console.log('\n📊 Verificando estrutura criada...\n');
  
  // Verificar tabelas criadas
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .order('table_name');
  
  if (!tablesError && tables) {
    console.log('✅ Tabelas criadas:');
    tables.forEach(t => console.log(`   - ${t.table_name}`));
  }
}

applyMigrations().catch(console.error);
*/

console.log('💡 RECOMENDAÇÃO: Use o Supabase CLI para aplicar as migrations:');
console.log('');
console.log('   1. supabase link --project-ref bbyzrywmgjiufqtnkslu');
console.log('   2. supabase db push');
console.log('');
console.log('Ou use o Dashboard do Supabase (SQL Editor) para executar manualmente.');
console.log('');
console.log('Veja instruções completas em: INSTRUCOES_DEPLOY_SUPABASE.md');
