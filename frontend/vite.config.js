import defineConfig from '@vitejs/plugin-react';
import { defineConfig as defineViteConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineViteConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
