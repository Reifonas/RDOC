#!/usr/bin/env node

// Script de inicialização que funciona tanto localmente quanto em produção
import { spawn } from 'child_process';
const port = process.env.PORT || 4173;

console.log(`Starting preview server on port ${port}...`);

const child = spawn('npx', ['vite', 'preview', '--host', '0.0.0.0', '--port', port.toString()], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  child.kill('SIGTERM');
});