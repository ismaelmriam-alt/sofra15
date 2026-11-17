// Wires photo files you have placed in client/public/assets/images/ into the app.
//   npm run photos:scan        (from project root)
// Naming convention (extensions: jpg, jpeg, png, webp, avif):
//   assets/images/dishes/<dish-slug>.jpg        e.g. hummus.jpg, baba-ghanouj.jpg, kibbeh-bil-sanieh.jpg
//   assets/images/categories/<category-slug>.jpg e.g. cold-mezza.jpg; manakish.jpg and shisha.jpg are the SHARED photos
//   assets/images/site/hero.jpg  story.jpg  rakwe.png  jarn.png  lantern.png  jug.png  cedar.png
// Then run `npm run seed -- --force` (server) so the database picks up the new dish photos.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const IMG = path.resolve(here, '../../client/public/assets/images');
const SEED = path.resolve(here, '../src/seed');
const SITE_JSON = path.resolve(here, '../../client/src/config/sitePhotos.json');
const EXTS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const find = (dir, base) => {
  for (const e of EXTS) if (fs.existsSync(path.join(IMG, dir, `${base}.${e}`))) return `/assets/images/${dir}/${base}.${e}`;
  return '';
};

function fill(file, dir) {
  const p = path.join(SEED, file);
  const json = JSON.parse(fs.readFileSync(p, 'utf8'));
  let found = 0;
  for (const name of Object.keys(json)) {
    json[name] = find(dir, slug(name));
    if (json[name]) found++;
  }
  fs.writeFileSync(p, JSON.stringify(json, null, 2) + '\n');
  console.log(`${dir.padEnd(10)} ${found}/${Object.keys(json).length} photos found`);
  const missing = Object.keys(json).filter((n) => !json[n]).map((n) => `${slug(n)}.jpg`);
  if (missing.length) console.log(`           missing: ${missing.join(', ')}`);
}

fill('dishImages.json', 'dishes');
fill('categoryImages.json', 'categories');

const site = JSON.parse(fs.readFileSync(SITE_JSON, 'utf8'));
for (const k of Object.keys(site)) site[k] = find('site', k);
fs.writeFileSync(SITE_JSON, JSON.stringify(site, null, 2) + '\n');
console.log(`site       ${Object.values(site).filter(Boolean).length}/${Object.keys(site).length} found (${Object.entries(site).filter(([, v]) => !v).map(([k]) => k).join(', ') || 'all set'})`);
console.log('\nNext: npm run photos:check, then (in server) npm run seed -- --force');
