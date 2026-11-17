import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Category from '../models/Category.js';
import Dish from '../models/Dish.js';
import { categories, dishes } from './seedData.js';

// Usage:
//   npm run seed            -> seeds only if the database has no dishes
//   npm run seed -- --force -> wipes categories + dishes, then reseeds (orders are kept)
const force = process.argv.includes('--force');

await connectDB();

const existing = await Dish.countDocuments();
if (existing > 0 && !force) {
  console.log(`Database already has ${existing} dishes. Use "npm run seed -- --force" to reset the menu.`);
} else {
  if (force) {
    await Dish.deleteMany({});
    await Category.deleteMany({});
  }
  const cats = await Category.create(categories);
  const byName = new Map(cats.map((c) => [c.name, c._id]));
  await Dish.create(dishes.map((d) => ({ ...d, category: byName.get(d.category) })));
  console.log(`Seeded ${cats.length} categories and ${dishes.length} dishes.`);
}

await mongoose.disconnect();
