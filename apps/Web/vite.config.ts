import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// This is your strict web compilation contract configuration
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Contract Enforcement: Map all mobile imports safely to web primitives
      'react-native': 'react-native-web',
      '@workspace/styles': path.resolve(__dirname, '../../packages/src/styles'),
      '@workspace/loginbuttonstyles': path.resolve(__dirname, '../../packages/src/styles/base/baseButtonstyles.ts')
    },
  },
});
