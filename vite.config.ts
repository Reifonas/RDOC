import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve';
  const isProd = mode === 'production';
  
  return {
  // Base path otimizado para Netlify
  base: '/',
  
  // Otimizações de build para Netlify
  build: {
    sourcemap: false, // Desabilitar sourcemaps em produção para reduzir tamanho
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    assetsInlineLimit: 4096, // Inline assets menores que 4KB
    emptyOutDir: true,
    
    // Configurações avançadas de chunk splitting
    rollupOptions: {
      output: {
        // Nomes de arquivo com hash para cache busting
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        
        // Estratégia de splitting otimizada
        manualChunks: {
          // Vendor chunks para melhor cache
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['lucide-react', 'framer-motion', 'sonner'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'state-vendor': ['zustand', 'dexie']
        }
      }
    },
    
    // Configurações de compressão otimizadas para Netlify
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    
    // Otimizações específicas para deploy
    modulePreload: {
      polyfill: false // Reduz o bundle size
    }
  },
  
  // Otimizações de desenvolvimento
  server: {
    hmr: {
      overlay: false // Reduz ruído visual durante desenvolvimento
    },
    // Configurações de performance
    fs: {
      strict: false
    }
  },
  
  // Configurações de preview otimizadas
  preview: {
    port: 4173,
    strictPort: true,
    host: true
  },
  
  // Otimizações de dependências para melhor performance
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'zustand',
      'lucide-react',
      'framer-motion',
      'sonner',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
      'dexie',
      'clsx',
      'tailwind-merge'
    ],
    exclude: [
      '@tanstack/react-query-devtools' // Excluir devtools em produção
    ],
    force: process.env.FORCE_OPTIMIZE === 'true'
  },
  
  // Configurações específicas para Netlify
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  
  // Configuração para ignorar erros de TypeScript no build
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    ...(isProd && {
      drop: ['console', 'debugger'],
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
    }),
  },
  };
});
