// Tests that need NO database: admin protection, login, image upload rules, and Dish model validation.
//   npm run test:offline          (from /server)
// Starts the real Express app on a random port. The CRUD-with-MongoDB checks live in smoke-test.js.
import { Writable } from 'node:stream';
import { v2 as cloudinary } from 'cloudinary';
import { createApp } from '../src/app.js';
import Dish from '../src/models/Dish.js';
import mongoose from 'mongoose';
import { removeUploadedImage } from '../src/controllers/uploadController.js';

process.env.ADMIN_PASSWORD ||= 'sofra2026';
process.env.CLIENT_ORIGINS = 'http://localhost:5173,https://sofra.example';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-api-key';
process.env.CLOUDINARY_API_SECRET = 'test-api-secret';
let pass = 0, fail = 0;
const check = (name, cond, extra = '') => { cond ? pass++ : fail++; console.log(`  ${cond ? '✔' : '✖'} ${name} ${cond ? '' : extra}`); };

const server = createApp().listen(0);
const base = `http://localhost:${server.address().port}`;
const KEY = { 'x-admin-key': process.env.ADMIN_PASSWORD };
const j = (method, p, body, headers = {}) => fetch(base + p, { method, headers: { 'Content-Type': 'application/json', ...headers }, body: body ? JSON.stringify(body) : undefined });
const fakeId = '64b7f0f0f0f0f0f0f0f0f0f0';

console.log('Customers cannot change the menu or read admin data (no admin key)');
for (const [m, p] of [['POST', '/api/dishes'], ['PUT', `/api/dishes/${fakeId}`], ['DELETE', `/api/dishes/${fakeId}`], ['POST', '/api/categories'], ['PUT', `/api/categories/${fakeId}`], ['DELETE', `/api/categories/${fakeId}`], ['GET', '/api/orders'], ['GET', '/api/orders/stats'], ['PATCH', `/api/orders/${fakeId}/status`], ['DELETE', `/api/orders/${fakeId}`], ['POST', '/api/uploads/dish-image'], ['GET', '/api/admin/verify']]) {
  const r = await j(m, p, m === 'GET' || m === 'DELETE' ? undefined : {});
  check(`${m} ${p.replace(fakeId, ':id')} → 401`, r.status === 401, `got ${r.status}`);
}
const wrong = await j('POST', '/api/dishes', {}, { 'x-admin-key': 'nope' });
check('wrong key → 401', wrong.status === 401);

console.log('Customers can still order (route is public)');
const ord = await j('POST', '/api/orders', {});
check('POST /api/orders is not blocked (validation error, not 401)', ord.status === 400, `got ${ord.status}`);

console.log('Admin login');
const bad = await j('POST', '/api/admin/login', { password: 'wrong' });
check('wrong password → 401', bad.status === 401);
const good = await j('POST', '/api/admin/login', { password: process.env.ADMIN_PASSWORD });
check('correct password → 200', good.status === 200);
check('verify with key → 200', (await j('GET', '/api/admin/verify', undefined, KEY)).status === 200);

console.log('CORS');
const allowedOrigin = await fetch(base + '/api/health', { headers: { Origin: 'https://sofra.example' } });
check('configured frontend origin is allowed', allowedOrigin.headers.get('access-control-allow-origin') === 'https://sofra.example');
const blockedOrigin = await fetch(base + '/api/health', { headers: { Origin: 'https://untrusted.example' } });
check('unconfigured frontend origin is rejected', blockedOrigin.status === 403);

console.log('Cloudinary image upload');
const originalUploadStream = cloudinary.uploader.upload_stream;
const originalDestroy = cloudinary.uploader.destroy;
const deletedPublicIds = [];
cloudinary.uploader.upload_stream = (options, callback) => {
  const chunks = [];
  return new Writable({
    write(chunk, encoding, done) { chunks.push(Buffer.from(chunk)); done(); },
    final(done) {
      callback(null, {
        secure_url: `https://res.cloudinary.com/test-cloud/image/upload/v123/${options.public_id}.png`,
        public_id: options.public_id,
        bytes: Buffer.concat(chunks).length,
      });
      done();
    },
  });
};
cloudinary.uploader.destroy = async (publicId) => {
  deletedPublicIds.push(publicId);
  return { result: 'ok' };
};
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(200, 1)]);
const up = (buf, type, name) => { const f = new FormData(); f.append('image', new Blob([buf], { type }), name); return fetch(base + '/api/uploads/dish-image', { method: 'POST', headers: KEY, body: f }); };
const okUp = await up(png, 'image/png', 'My Hummus!.png');
const okBody = await okUp.json();
check('valid image → 201 with a Cloudinary secure URL', okUp.status === 201 && /^https:\/\/res\.cloudinary\.com\/test-cloud\/image\/upload\/v123\/sofra\/uploads\/upload-my-hummus-.+\.png$/.test(okBody.path), JSON.stringify(okBody));
check('uploaded file bytes are sent to Cloudinary', okBody.size === png.length);
check('Cloudinary URL is allowed by the Dish model', !new Dish({ name: 'Hummus', description: 'd', price: 6, category: new mongoose.Types.ObjectId(), image: okBody.path }).validateSync());
await removeUploadedImage(okBody.path);
check('only this app’s uploaded Cloudinary object is deleted', deletedPublicIds.length === 1 && deletedPublicIds[0].startsWith('sofra/uploads/upload-my-hummus-'));
await removeUploadedImage('https://res.cloudinary.com/test-cloud/image/upload/v123/external/other.jpg');
check('unmanaged Cloudinary images are not deleted', deletedPublicIds.length === 1);
const txt = await up(Buffer.from('hello'), 'text/plain', 'a.txt');
check('non-image type rejected (400)', txt.status === 400);
const fake = await up(Buffer.from('this is not a png at all'), 'image/png', 'fake.png');
check('fake image bytes rejected (400)', fake.status === 400);
const big = await up(Buffer.concat([png, Buffer.alloc(5.5 * 1024 * 1024)]), 'image/png', 'big.png');
check('file over 5 MB rejected (400)', big.status === 400);
const noFile = await fetch(base + '/api/uploads/dish-image', { method: 'POST', headers: KEY, body: new FormData() });
check('missing file rejected (400)', noFile.status === 400);
check('rejected uploads are not sent to Cloudinary', deletedPublicIds.length === 1);
cloudinary.uploader.upload_stream = originalUploadStream;
cloudinary.uploader.destroy = originalDestroy;

console.log('Dish model validation (Arabic name, image rules)');
const cat = new mongoose.Types.ObjectId();
const make = (o) => new Dish({ name: 'Hummus', description: 'd', price: 6, category: cat, ...o }).validateSync();
check('valid dish with Arabic name', !make({ nameAr: 'حمص' }));
check('nameAr saved on the document', new Dish({ name: 'x', nameAr: 'حمص' }).nameAr === 'حمص');
check('empty image allowed (placeholder)', !make({ image: '' }));
check('local path allowed', !make({ image: '/assets/images/dishes/hummus.jpg' }));
check('https URL allowed', !make({ image: 'https://example.com/a.jpg' }));
check('made-up path rejected', !!make({ image: 'hummus.jpg' })?.errors?.image);
check('price 0 rejected', !!make({ price: 0 })?.errors?.price);
check('missing name rejected', !!make({ name: '' })?.errors?.name);

server.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
