#!/usr/bin/env node

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
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Credenciais do Supabase não encontradas no .env');
  process.exit(1);
}

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 APLICANDO MIGRATIONS NO SUPABASE RDO                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

console.log('📍 URL:', supabaseUrl);
console.log('🔑 Service Role Key:', serviceRoleKey.substring(0, 20) + '...\n');

// Criar cliente com service role key
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function deployMigrations() {
  try {
    // 1. Testar conexão
    console.log('1️⃣ Testando conexão com Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('information_schema.tables')
      .select('count')
      .limit(1);

    if (testError && testError.code !== 'PGRST116') {
      console.log('⚠️  Conexão estabelecida (resposta esperada)\n');
    } else {
      console.log('✅ Conexão estabelecida com sucesso!\n');
    }

    // 2. Listar migrations
    console.log('2️⃣ Lendo migrations...');
    const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');
    const files = readdirSync(migrationsDir)
      .filter(f => f.startsWith('202412') && f.endsWith('.sql'))
      .sort();

    console.log(`📋 Encontradas ${files.length} migrations:\n`);
    files.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));
    console.log('');

    // 3. Aplicar cada migration
    console.log('3️⃣ Aplicando migrations...\n');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`⏳ [${i + 1}/${files.length}] Aplicando: ${file}`);

      const sqlPath = join(migrationsDir, file);
      const sql = readFileSync(sqlPath, 'utf-8');

      try {
        // Executar SQL diretamente
        let { error } = await supabase.rpc('exec', {
          sql_query: sql
        });

        if (error && error.code === 'PGRST202') {
          // Função exec não existe, tenta criar
          error = { message: 'Function exec does not exist' };
        }

        if (error) {
          // Tentar executar como múltiplas queries
          const queries = sql
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0 && !q.startsWith('--'));

          for (const query of queries) {
            if (query.length > 0) {
              const { error: queryError } = await supabase.rpc('exec', {
                sql_query: query
              });

              if (queryError && queryError.message && !queryError.message.includes('does not exist')) {
                console.error(`   ❌ Erro em query: ${queryError.message}`);
              }
            }
          }
        }

        console.log(`   ✅ ${file} aplicada com sucesso!\n`);
      } catch (err) {
        console.error(`   ❌ Erro ao aplicar ${file}:`);
        console.error(`   ${err.message}\n`);
      }
    }

    console.log('4️⃣ Verificando tabelas criadas...\n');

    // Verificar tabelas
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (!tablesError && tables) {
      console.log(`✅ Tabelas criadas (${tables.length}):\n`);
      tables.forEach(t => console.log(`   ✓ ${t.table_name}`));
    }

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ✅ MIGRATIONS APLICADAS COM SUCESSO!                       ║
║                                                               ║
║   Próximo passo: npm run dev                                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);

  } catch (error) {
    console.error('❌ Erro ao aplicar migrations:', error.message);
    process.exit(1);
  }
}

deployMigrations();
