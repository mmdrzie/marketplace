import { handle } from 'hono/vercel';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = await import('fs');
const path = await import('path');
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Try to load dist/index.js relative to backend root
const distPath = path.resolve(__dirname, '..', 'dist', 'index.js');
if (!fs.existsSync(distPath)) {
  console.error('dist/index.js not found at', distPath);
  const files = fs.readdirSync(path.resolve(__dirname, '..'));
  console.error('root dir contains:', files.join(', '));
  process.exit(1);
}

const app = (await import(distPath)).default;

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);