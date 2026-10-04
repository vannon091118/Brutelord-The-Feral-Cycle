import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { accountApi } from './scripts/server/plugin.mjs';

export default defineConfig({
  plugins: [react(), tailwindcss(), accountApi()],
  server: {
    // Lokal bleibt der Dev-Server an die Schleifeadresse gebunden, weil er die
    // Kontodatenbank mitbringt. Wer ihn von aussen erreichen will, sagt es
    // ausdruecklich: DL_HOST=0.0.0.0 npm run dev
    host: process.env.DL_HOST ?? '127.0.0.1',
  },
});
