import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from "@tailwindcss/vite";
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Contract Enforcement: Map all mobile imports safely to web primitives
      'react-native': 'react-native-web',
      '@workspace/styles': path.resolve(__dirname, '../../packages/src/styles'),
      '@workspace/loginbuttonstyles': path.resolve(__dirname, '../../packages/src/styles/base/baseButtonstyles.ts')
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    rolldownOptions: {
      moduleTypes: {
        '../Mobile/node_modules/expo-linear-gradient/build/**/*.js': 'jsx',
        '**/node_modules/expo-linear-gradient/**/*.js': 'jsx'
      }
    },
    sourcemap: true,
  }
});
