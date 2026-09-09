import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  fixedExtension: false,
  dts: false,
  clean: true,
  sourcemap: true,
  deps: {
    neverBundle: [
      'drizzle-orm',
      'drizzle-orm/neon-http',
      'drizzle-orm/node-postgres',
      '@neondatabase/serverless',
      'pg',
      'debug',
    ],
  },
});
