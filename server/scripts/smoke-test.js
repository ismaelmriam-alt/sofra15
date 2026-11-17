// End-to-end API check against a RUNNING server with a real MongoDB.
//   1) npm run seed    2) npm start    3) npm run test:api
// Creates temporary records and cleans them up afterwards.
const BASE = process.env.API_URL || 'http://localhost:5000/api';
const ADMIN = process.env.ADMIN_PASSWORD || 'sofra2026';
let passed = 0;
let failed = 0;

async function call(method, path, body, key = ADMIN) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(key ? { 'x-admin-key': key } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty */ }
  return { status: res.status, data };
}

function check(name, cond, extra = '') {
  if (cond) { passed++; console.log(`  ✔ ${name}`); }
  else { failed++; console.log(`  ✖ ${name} ${extra}`); }
}

const health = await call('GET', '/health').catch(() => null);
if (!health || health.data?.db !== 'connected') {
  console.error('✖ API is not reachable or MongoDB is not connected. Start MongoDB, run "npm run seed" and "npm start".');
  process.exit(1);
}
console.log('Health');
check('API up and MongoDB connected', true);

console.log('Read');
const cats = await call('GET', '/categories');
check('categories load (9 seeded)', cats.status === 200 && cats.data.length >= 9, `got ${cats.data?.length}`);
const dishes = await call('GET', '/dishes');
check('dishes load (50 seeded)', dishes.status === 200 && dishes.data.length >= 50, `got ${dishes.data?.length}`);
const search = await call('GET', '/dishes?search=hum');
check('search by name', search.data.some((d) => d.name === 'Hummus'));
const grill = await call('GET', '/dishes?category=lebanese-grill');
check('filter by category slug', grill.data.length === 5, `got ${grill.data?.length}`);

const manakish = await call('GET', '/dishes?category=manakish');
check('Manakish: 5 varieties, shared photo category', manakish.data.length === 5 && cats.data.find((c) => c.slug === 'manakish')?.layout === 'shared' && manakish.data.every((d) => !d.image));
const shisha = await call('GET', '/dishes?category=shisha');
check('Shisha: 6 flavours, shared photo category', shisha.data.length === 6 && cats.data.find((c) => c.slug === 'shisha')?.layout === 'shared');
check('seeded prices flagged as placeholders', dishes.data.some((d) => d.pricePlaceholder));

console.log('Category CRUD');
const newCat = await call('POST', '/categories', { name: 'Smoke Test Category', description: 'temp' });
check('create category', newCat.status === 201 && newCat.data.slug === 'smoke-test-category');
const dupCat = await call('POST', '/categories', { name: 'Smoke Test Category' });
check('duplicate category rejected (409)', dupCat.status === 409);
const updCat = await call('PUT', `/categories/${newCat.data._id}`, { description: 'updated' });
check('update category', updCat.status === 200 && updCat.data.description === 'updated');

console.log('Admin protection');
const anon = await call('POST', '/dishes', { name: 'x', price: 1, description: 'x' }, '');
check('customer cannot create dish (401)', anon.status === 401);
const anonDel = await call('DELETE', `/categories/${newCat.data._id}`, null, 'wrong');
check('wrong password cannot delete (401)', anonDel.status === 401);
check('customer cannot list orders (401)', (await call('GET', '/orders', null, '')).status === 401);

console.log('Dish CRUD');
const bad = await call('POST', '/dishes', { name: 'No price' });
check('invalid dish rejected (400)', bad.status === 400);
const cloudinaryPhoto = 'https://res.cloudinary.com/test-cloud/image/upload/v123/test-hummus.jpg';
const created = await call('POST', '/dishes', {
  name: 'Smoke Test Dish', nameAr: 'طبق تجريبي', description: 'Temporary dish', price: 9.5, category: newCat.data._id,
  ingredients: 'a, b, c', image: cloudinaryPhoto, isAvailable: true, isFeatured: false,
});
check('create dish (with Arabic name and Cloudinary image URL)', created.status === 201 && created.data.ingredients.length === 3 && created.data.nameAr === 'طبق تجريبي' && created.data.image === cloudinaryPhoto);
const dishId = created.data?._id;
const priced = await call('PUT', `/dishes/${dishId}`, { price: 11 });
check('editing price works', priced.status === 200 && priced.data.price === 11);
const got = await call('GET', `/dishes/${dishId}`);
check('get dish by ID', got.status === 200 && got.data.name === 'Smoke Test Dish');
const upd = await call('PUT', `/dishes/${dishId}`, { price: 11 });
check('update dish price', upd.status === 200 && upd.data.price === 11);
const reread = await call('GET', `/dishes/${dishId}`);
check('update persisted', reread.data.price === 11);

console.log('Category protection');
const delBlocked = await call('DELETE', `/categories/${newCat.data._id}`);
check('cannot delete category that has dishes (409)', delBlocked.status === 409);

console.log('Orders');
const emptyOrder = await call('POST', '/orders', { customerName: 'x', phone: '123', orderType: 'Pickup', items: [] });
check('empty/invalid order rejected', emptyOrder.status === 400);
const noAddr = await call('POST', '/orders', { customerName: 'Test', phone: '+961 70 000 000', orderType: 'Delivery', items: [{ dishId, quantity: 1 }] });
check('delivery without address rejected', noAddr.status === 400);
const order = await call('POST', '/orders', {
  customerName: 'Smoke Tester', phone: '+961 70 000 000', orderType: 'Pickup',
  items: [{ dishId, quantity: 2, price: 0.01 }],
});
check('order created with generated ID', order.status === 201 && /^SOF-/.test(order.data.orderId));
check('server uses DB price, not client price', order.data.total === 22, `total=${order.data?.total}`);
await call('PUT', `/dishes/${dishId}`, { isAvailable: false });
const unavailable = await call('POST', '/orders', {
  customerName: 'Smoke Tester', phone: '+961 70 000 000', orderType: 'Pickup', items: [{ dishId, quantity: 1 }],
});
check('unavailable dish cannot be ordered', unavailable.status === 400);
const status = await call('PATCH', `/orders/${order.data._id}/status`, { status: 'Preparing' });
check('update order status', status.status === 200 && status.data.status === 'Preparing');
const badStatus = await call('PATCH', `/orders/${order.data._id}/status`, { status: 'Flying' });
check('invalid status rejected', badStatus.status === 400);
const list = await call('GET', '/orders');
check('orders listed', list.data.some((o) => o.orderId === order.data.orderId));
const stats = await call('GET', '/orders/stats');
check('stats come from the database', stats.status === 200 && stats.data.totalDishes >= 34);

console.log('Cleanup / Delete');
await call('DELETE', `/orders/${order.data._id}`);
const delDish = await call('DELETE', `/dishes/${dishId}`);
check('delete dish', delDish.status === 200);
const gone = await call('GET', `/dishes/${dishId}`);
check('deleted dish is gone (404)', gone.status === 404);
const delCat = await call('DELETE', `/categories/${newCat.data._id}`);
check('delete empty category', delCat.status === 200);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
