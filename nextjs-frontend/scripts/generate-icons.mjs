import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = resolve(__dirname, '../public/icons');

async function main() {
  for (const size of [192, 384, 512]) {
    const svg = readFileSync(`${iconsDir}/icon-${size}x${size}.svg`, 'utf-8');
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    writeFileSync(`${iconsDir}/icon-${size}x${size}.png`, png);
    console.log(`Generated icon-${size}x${size}.png (${(png.length / 1024).toFixed(1)} KB)`);
  }
}

main().catch(console.error);
