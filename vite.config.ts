import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs/dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl() // Note: This only affects your local dev server
  ],
  // 👇 THE FIX IS HERE
  base: '/', 
  server: {
    host: true, // Note: This only affects your local dev server
    https: {}     // Note: This only affects your local dev server
  }
});