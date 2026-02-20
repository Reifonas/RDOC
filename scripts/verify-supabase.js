
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read .env file
const envPath = path.resolve(__dirname, '../.env')
console.log('Lendo arquivo .env de:', envPath)

if (!fs.existsSync(envPath)) {
    console.error('Arquivo .env não encontrado!')
    process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf-8')
const envConfig = {}
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')
        envConfig[key] = value
    }
})

const supabaseUrl = envConfig.VITE_SUPABASE_URL
const supabaseAnonKey = envConfig.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Credenciais Supabase não encontradas no .env')
    console.log('Chaves encontradas:', Object.keys(envConfig))
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const tables = [
    'usuarios',
    'obras',
    'rdos',
    'rdo_atividades',
    'rdo_mao_obra',
    'rdo_equipamentos',
    'rdo_ocorrencias',
    'rdo_anexos',
    'rdo_inspecoes_solda',
    'rdo_verificacoes_torque',
    'tarefas',
    'task_logs'
]

async function verify() {
    console.log('Iniciando verificação de integridade do Supabase...')
    console.log(`URL: ${supabaseUrl}`)

    // Test connection first
    const { data: authData, error: authError } = await supabase.auth.getSession()
    if (authError) {
        console.warn('Aviso: Erro ao verificar sessão de auth (pode ser normal se não houver sessão persistida):', authError.message)
    }

    let allGood = true
    let summary = []

    for (const table of tables) {
        try {
            // Using head: true to avoid fetching data, just checking access/existence
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true })

            if (error) {
                console.error(`❌ Tabela '${table}': Erro - ${error.message} (Code: ${error.code})`)
                summary.push({ table, status: 'Erro', message: error.message })
                allGood = false
            } else {
                console.log(`✅ Tabela '${table}': OK (Registros: ${count})`)
                summary.push({ table, status: 'OK', count })
            }
        } catch (e) {
            console.error(`❌ Tabela '${table}': Exceção - ${e.message}`)
            summary.push({ table, status: 'Exceção', message: e.message })
            allGood = false
        }
    }

    console.log('\n--- Resumo ---')
    if (allGood) {
        console.log('Todas as tabelas verificadas parecem acessíveis.')
    } else {
        console.log('Foram encontrados problemas em algumas tabelas.')
    }
}

verify()
