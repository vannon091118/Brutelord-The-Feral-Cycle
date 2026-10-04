import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { accountApi } from './scripts/server/plugin.mjs';

export default defineConfig({
  plugins: [react(), tailwindcss(), accountApi()],
  server: {
    host: '127.0.0.1',
  },
});
