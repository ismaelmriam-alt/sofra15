// One-command local database for development — no MongoDB install needed.
//   npm run dev:local-db        (from /server, or `npm run server:local-db` from the project root)
// Starts a real MongoDB (mongod) managed by mongodb-memory-server, stores data in server/.data
// so it survives restarts, seeds the menu if empty, then starts the API.
// First run downloads the mongod binary (~100 MB) — internet access to fastdl.mongodb.org is required once.
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';

const dbPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.data');
fs.mkdirSync(dbPath, { recursive: true });

console.log('Starting local MongoDB (first run downloads the server binary, please wait)…');
const mongod = await MongoMemoryServer.create({ instance: { dbName: 'sofra', dbPath, storageEngine: 'wiredTiger' } });
process.env.MONGODB_URI = mongod.getUri('sofra');
console.log(`Local MongoDB ready at ${process.env.MONGODB_URI}`);
console.log('Data is stored in server/.data (delete that folder to start fresh).\n');

const stop = async () => { await mongod.stop(); process.exit(0); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

await import('../src/seed/seed.js');   // seeds only when the menu is empty
await import('../src/server.js');       // starts the API on PORT (default 5000)
