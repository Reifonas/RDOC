import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';

// https://vite.dev/config/
export default defineConfig({
  // Base path - usar '/' para Netlify, '/RDO/' apenas para GitHub Pages
  base: process.env.GITHUB_PAGES === 'true' ? '/RDO/' : '/',
  build: {
    sourcemap: 'hidden',
  },
  preview: {
    allowedHosts: ['ts-rdo.onrender.com'],
  },
  plugins: [dyadComponentTagger(), 
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths()
  ],
})
