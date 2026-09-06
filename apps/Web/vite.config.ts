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
    // Force a single React instance across the app and every workspace
    // package (@workspace/ui, @workspace/core, ...) — without this, Vite's
    // dependency pre-bundler can end up producing a second, disconnected
    // copy of React's internals when it optimizes react-native-web pulled
    // in transitively from a symlinked monorepo package, which breaks every
    // hook call inside react-native-web components with
    // "Cannot read properties of null (reading 'useContext'/'useEffect')".
    dedupe: ['react', 'react-dom', 'react-native-web'],
  },
  optimizeDeps: {
    // Explicitly pre-bundle react-native-web (and any other package pulled
    // in transitively through the workspace symlinks, e.g. lucide-react via
    // @workspace/ui) instead of letting Vite discover it ad-hoc — same
    // duplicate-React-instance issue as the dedupe setting above.
    include: ['react-native-web', 'lucide-react'],
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
