// Verifies every configured photo exists / loads and really is an image.
//   npm run photos:check
// Local files (/assets/...): must exist in client/public, be > 20 KB and start with a JPEG/PNG/WebP/AVIF signature.
// Remote URLs (https://...): must respond 200 with an image content-type.
// Exit code 1 if anything configured is broken. Also warns when one photo is reused for several items.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(here, '../../client/public');
const readJson = (p) => JSON.parse(fs.readFileSync(path.resolve(here, p), 'utf8'));

const entries = [
  ...Object.entries(readJson('../src/seed/dishImages.json')).map(([k, v]) => ['dish', k, v]),
  ...Object.entries(readJson('../src/seed/categoryImages.json')).map(([k, v]) => ['category', k, v]),
  ...Object.entries(readJson('../../client/src/config/sitePhotos.json')).map(([k, v]) => ['site', k, v]),
];

const isImage = (b) =>
  (b[0] === 0xff && b[1] === 0xd8) || // jpeg
  (b[0] === 0x89 && b[1] === 0x50) || // png
  (b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP') ||
  b.slice(4, 12).toString().includes('ftypavif');

let ok = 0, broken = 0, empty = 0;
const seen = new Map();
const line = (m, kind, name, msg) => console.log(`  ${m} ${kind.padEnd(8)} ${name.padEnd(22)} ${msg}`);

for (const [kind, name, url] of entries) {
  if (!url) { empty++; line('–', kind, name, 'not set'); continue; }
  try {
    let bytes;
    if (url.startsWith('/')) {
      const file = path.join(PUBLIC, url);
      if (!fs.existsSync(file)) throw new Error('file not found');
      const buf = fs.readFileSync(file);
      if (buf.length < 20_000) throw new Error(`only ${buf.length} bytes`);
      if (!isImage(buf)) throw new Error('not a valid image file');
      bytes = buf.length;
    } else {
      const res = await fetch(url, { redirect: 'follow' });
      const type = res.headers.get('content-type') || '';
      const buf = Buffer.from(await res.arrayBuffer());
      if (!res.ok || !type.startsWith('image/') || buf.length < 20_000) throw new Error(`HTTP ${res.status}, ${type}, ${buf.length} bytes`);
      bytes = buf.length;
    }
    if (kind === 'dish' && seen.has(url)) line('!', kind, name, `same photo as ${seen.get(url)}`);
    seen.set(url, name);
    ok++; line('✔', kind, name, `${(bytes / 1024).toFixed(0)} KB`);
  } catch (e) { broken++; line('✖', kind, name, e.message); }
}
console.log(`\n${ok} verified, ${broken} broken, ${empty} not set`);
console.log('This proves files load, not that each photo shows the right dish — look at every one before keeping it.');
process.exit(broken ? 1 : 0);
