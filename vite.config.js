import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: ['es2022', 'chrome100', 'safari15', 'firefox100'],
    cssTarget: ['chrome100', 'safari15', 'firefox100'],
  },
  define: {
    // Usa la versión del proyecto sin depender de imports JSON con sintaxis no compatible.
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
