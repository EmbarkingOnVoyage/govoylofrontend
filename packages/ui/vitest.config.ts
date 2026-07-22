import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    alias: {
      // Directs the testing engine to map native imports to web counterparts
      'react-native': path.resolve(__dirname, '../../node_modules/react-native-web'),
    },
  },
});
