#!/usr/bin/env node

/**
 * Auto-Sync Script para RDO Project
 * Monitora mudanças em tempo real e sincroniza com GitHub a cada 15 segundos
 * Autor: Sistema RDO
 * Versão: 3.0
 */

import chokidar from 'chokidar';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execAsync = util.promisify(exec);

// Configurações
const CONFIG = {
    REMOTE_REPO: 'https://github.com/Reifonas/TS_RDO.git',
    BRANCH: 'main',
    SYNC_INTERVAL: 15000, // 15 segundos
    PROJECT_PATH: process.cwd(),
    LOG_PATH: path.join(process.cwd(), 'logs'),
    WATCH_PATTERNS: [
        '**/*',
        '!node_modules/**',
        '!.git/**',
        '!dist/**',
        '!build/**',
        '!logs/**',
    
        '!*.log',
        '!.env.local'
    ]
};

// Estado do aplicativo
let hasChanges = false;
let isProcessing = false;
let lastSyncTime = 0;
let changeQueue = new Set();

// Criar diretório de logs se não existir
if (!fs.existsSync(CONFIG.LOG_PATH)) {
    fs.mkdirSync(CONFIG.LOG_PATH, { recursive: true });
}

/**
 * Função de logging com timestamp
 */
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    // Console com cores
    const colors = {
        ERROR: '\x1b[31m',   // Vermelho
        WARN: '\x1b[33m',    // Amarelo
        SUCCESS: '\x1b[32m', // Verde
        INFO: '\x1b[36m',    // Ciano
        RESET: '\x1b[0m'     // Reset
    };
    
    console.log(`${colors[level] || colors.INFO}${logMessage}${colors.RESET}`);
    
    // Salvar em arquivo
    const logFile = path.join(CONFIG.LOG_PATH, `auto-sync-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, logMessage + '\n');
}

/**
 * Verificar se é um repositório Git
 */
async function isGitRepository() {
    try {
        await execAsync('git rev-parse --git-dir');
        return true;
    } catch {
        return false;
    }
}

/**
 * Inicializar repositório Git
 */
async function initializeGitRepository() {
    try {
        log('Inicializando repositório Git...', 'INFO');
        
        await execAsync('git init');
        await execAsync(`git remote add origin ${CONFIG.REMOTE_REPO}`);
        await execAsync(`git branch -M ${CONFIG.BRANCH}`);
        
        log('Repositório Git inicializado com sucesso', 'SUCCESS');
        return true;
    } catch (error) {
        log(`Erro ao inicializar repositório: ${error.message}`, 'ERROR');
        return false;
    }
}

/**
 * Verificar se há mudanças no repositório
 */
async function checkForChanges() {
    try {
        const { stdout } = await execAsync('git status --porcelain');
        return stdout.trim().length > 0;
    } catch (error) {
        log(`Erro ao verificar mudanças: ${error.message}`, 'ERROR');
        return false;
    }
}

/**
 * Gerar mensagem de commit automática
 */
async function generateCommitMessage() {
    try {
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        
        // Obter estatísticas das mudanças
        const { stdout: modifiedFiles } = await execAsync('git diff --name-only HEAD').catch(() => ({ stdout: '' }));
        const { stdout: newFiles } = await execAsync('git ls-files --others --exclude-standard').catch(() => ({ stdout: '' }));
        const { stdout: deletedFiles } = await execAsync('git diff --name-only --diff-filter=D HEAD').catch(() => ({ stdout: '' }));
        
        const changes = [];
        if (modifiedFiles.trim()) changes.push(`Modified: ${modifiedFiles.trim().split('\n').length} files`);
        if (newFiles.trim()) changes.push(`Added: ${newFiles.trim().split('\n').length} files`);
        if (deletedFiles.trim()) changes.push(`Deleted: ${deletedFiles.trim().split('\n').length} files`);
        
        let message = `Auto-sync: ${timestamp}`;
        if (changes.length > 0) {
            message += ` - ${changes.join(', ')}`;
        }
        
        return message;
    } catch (error) {
        return `Auto-sync: ${new Date().toISOString().replace('T', ' ').substring(0, 19)}`;
    }
}

/**
 * Sincronizar com GitHub
 */
async function syncWithGitHub() {
    if (isProcessing) {
        log('Sincronização já em andamento, aguardando...', 'WARN');
        return false;
    }
    
    isProcessing = true;
    
    try {
        log('Iniciando sincronização com GitHub...', 'INFO');
        
        // Verificar se é repositório Git
        if (!(await isGitRepository())) {
            log('Não é um repositório Git. Inicializando...', 'WARN');
            if (!(await initializeGitRepository())) {
                return false;
            }
        }
        
        // Verificar mudanças
        if (!(await checkForChanges())) {
            log('Nenhuma mudança detectada', 'INFO');
            return true;
        }
        
        // Pull das mudanças remotas (se houver)
        try {
            await execAsync(`git pull origin ${CONFIG.BRANCH} --rebase`);
            log('Pull realizado com sucesso', 'INFO');
        } catch (error) {
            log('Primeira sincronização ou sem mudanças remotas', 'INFO');
        }
        
        // Adicionar arquivos
        await execAsync('git add .');
        log('Arquivos adicionados ao stage', 'INFO');
        
        // Commit
        const commitMessage = await generateCommitMessage();
        await execAsync(`git commit -m "${commitMessage}"`);
        log(`Commit realizado: ${commitMessage}`, 'INFO');
        
        // Push
        await execAsync(`git push origin ${CONFIG.BRANCH}`);
        log('Push realizado com sucesso!', 'SUCCESS');
        
        // Resetar estado
        hasChanges = false;
        changeQueue.clear();
        lastSyncTime = Date.now();
        
        return true;
        
    } catch (error) {
        log(`Erro durante sincronização: ${error.message}`, 'ERROR');
        return false;
    } finally {
        isProcessing = false;
    }
}

/**
 * Inicializar monitoramento de arquivos
 */
function initializeWatcher() {
    log('Inicializando monitoramento de arquivos...', 'INFO');
    log(`Padrões monitorados: ${CONFIG.WATCH_PATTERNS.join(', ')}`, 'INFO');
    
    const watcher = chokidar.watch(CONFIG.WATCH_PATTERNS, {
        ignored: /(^|[\/\\])\../, // Ignorar arquivos ocultos
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 1000,
            pollInterval: 100
        }
    });
    
    // Eventos de mudança
    watcher
        .on('add', path => {
            log(`Arquivo adicionado: ${path}`, 'INFO');
            hasChanges = true;
            changeQueue.add(path);
        })
        .on('change', path => {
            log(`Arquivo modificado: ${path}`, 'INFO');
            hasChanges = true;
            changeQueue.add(path);
        })
        .on('unlink', path => {
            log(`Arquivo removido: ${path}`, 'INFO');
            hasChanges = true;
            changeQueue.add(path);
        })
        .on('error', error => {
            log(`Erro no monitoramento: ${error}`, 'ERROR');
        })
        .on('ready', () => {
            log('Monitoramento de arquivos ativo!', 'SUCCESS');
        });
    
    return watcher;
}

/**
 * Loop principal de sincronização
 */
function startSyncLoop() {
    setInterval(async () => {
        if (hasChanges && !isProcessing) {
            const timeSinceLastSync = Date.now() - lastSyncTime;
            
            if (timeSinceLastSync >= CONFIG.SYNC_INTERVAL) {
                log(`Mudanças detectadas (${changeQueue.size} arquivos). Iniciando sincronização...`, 'INFO');
                await syncWithGitHub();
            } else {
                const remainingTime = Math.ceil((CONFIG.SYNC_INTERVAL - timeSinceLastSync) / 1000);
                log(`Aguardando ${remainingTime}s para próxima sincronização...`, 'INFO');
            }
        }
    }, 5000); // Verificar a cada 5 segundos
}

/**
 * Limpeza de logs antigos
 */
function cleanOldLogs() {
    try {
        const files = fs.readdirSync(CONFIG.LOG_PATH);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 7); // Manter logs por 7 dias
        
        files.forEach(file => {
            if (file.endsWith('.log')) {
                const filePath = path.join(CONFIG.LOG_PATH, file);
                const stats = fs.statSync(filePath);
                
                if (stats.mtime < cutoffDate) {
                    fs.unlinkSync(filePath);
                    log(`Log antigo removido: ${file}`, 'INFO');
                }
            }
        });
    } catch (error) {
        log(`Erro ao limpar logs antigos: ${error.message}`, 'ERROR');
    }
}

/**
 * Tratamento de sinais do sistema
 */
function setupSignalHandlers() {
    process.on('SIGINT', () => {
        log('Recebido SIGINT. Finalizando...', 'WARN');
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        log('Recebido SIGTERM. Finalizando...', 'WARN');
        process.exit(0);
    });
    
    process.on('uncaughtException', (error) => {
        log(`Erro não capturado: ${error.message}`, 'ERROR');
        process.exit(1);
    });
}

/**
 * Função principal
 */
async function main() {
    log('=== Auto-Sync RDO v3.0 ===', 'SUCCESS');
    log(`Repositório: ${CONFIG.REMOTE_REPO}`, 'INFO');
    log(`Branch: ${CONFIG.BRANCH}`, 'INFO');
    log(`Intervalo de sincronização: ${CONFIG.SYNC_INTERVAL / 1000}s`, 'INFO');
    log(`Diretório: ${CONFIG.PROJECT_PATH}`, 'INFO');
    
    // Configurar tratamento de sinais
    setupSignalHandlers();
    
    // Limpar logs antigos
    cleanOldLogs();
    
    // Mudar para o diretório do projeto
    process.chdir(CONFIG.PROJECT_PATH);
    
    // Inicializar monitoramento
    const watcher = initializeWatcher();
    
    // Iniciar loop de sincronização
    startSyncLoop();
    
    log('Sistema de auto-sync ativo! Pressione Ctrl+C para parar.', 'SUCCESS');
    
    // Manter o processo ativo
    process.stdin.resume();
}

// Executar automaticamente
main().catch(error => {
    console.error(`Erro fatal: ${error.message}`);
    process.exit(1);
});

export { main, syncWithGitHub, log };