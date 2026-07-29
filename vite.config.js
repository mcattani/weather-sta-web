import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import packageJson from './package.json';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: ['es2022', 'chrome100', 'safari15', 'firefox100'],
    cssTarget: ['chrome100', 'safari15', 'firefox100'],
  },
  define: {
    // Inyecta la versión de package.json en la constante __APP_VERSION__
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
});
