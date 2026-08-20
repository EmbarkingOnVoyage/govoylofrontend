import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from "@tailwindcss/vite";
import path from 'path';

// This is your strict web compilation contract configuration
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
  // 🔑 FIX 1: Instructs the development scanner to parse JSX syntax inside .js extensions
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    // 🔑 FIX 2: Configures Vite v6's production parser (Rolldown) to allow JSX inside node_modules JavaScript files
    rolldownOptions: {
      moduleTypes: {
        '../Mobile/node_modules/expo-linear-gradient/build/**/*.js': 'jsx',
        '**/node_modules/expo-linear-gradient/**/*.js': 'jsx'
      }
    }
  }
});
