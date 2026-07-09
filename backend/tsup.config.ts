import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/app.ts'],
  format: 'esm',
  outDir: 'dist',
  clean: true,
  target: 'node20',
  splitting: false,
});