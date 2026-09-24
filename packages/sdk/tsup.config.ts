import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  external: ['react', 'react-native', 'react-native-web', '@tanstack/react-query', 'zod'],
  dts: {
    // Inline the .d.ts content of the private workspace packages too —
    // otherwise the emitted types keep `from '@workspace/ui'` imports
    // that no external consumer of this package can resolve.
    resolve: [/^@workspace\//],
  },
  clean: true,
});
