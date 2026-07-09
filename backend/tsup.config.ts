import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['api/index.ts'],
  format: 'esm',
  outDir: 'api',
  clean: false,
  target: 'node20',
  splitting: false,
  banner: {
    js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
  },
});