import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    alias: {
      // Bypasses raw native flow syntax by mapping imports to clean web primitives
      'react-native': path.resolve(__dirname, '../../node_modules/react-native-web'),
    },
  },
});
