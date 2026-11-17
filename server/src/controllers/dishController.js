import Dish from '../models/Dish.js';
import Category from '../models/Category.js';
import { HttpError } from '../middleware/errorHandler.js';
import { removeUploadedImage } from './uploadController.js';

const FIELDS = ['name', 'nameAr', 'description', 'price', 'category', 'ingredients', 'image', 'isAvailable', 'isFeatured', 'customizations', 'pricePlaceholder', 'sortOrder'];

function pick(body) {
  const data = Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));
  if (typeof data.ingredients === 'string') {
    data.ingredients = data.ingredients.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (Array.isArray(data.ingredients)) {
    data.ingredients = data.ingredients.map((s) => String(s).trim()).filter(Boolean);
  }
  if (data.price !== undefined) data.price = Number(data.price);
  return data;
}

async function assertCategoryExists(id) {
  if (!id) return;
  const ok = await Category.exists({ _id: id }).catch(() => null);
  if (!ok) throw new HttpError(400, 'Selected category does not exist', { category: 'Category does not exist' });
}

export async function listDishes(req, res) {
  const filter = {};
  if (req.query.category) {
    const cat = await Category.findOne({ $or: [{ slug: req.query.category }, ...(req.query.category.match(/^[a-f\d]{24}$/i) ? [{ _id: req.query.category }] : [])] });
    if (!cat) return res.json([]);
    filter.category = cat._id;
  }
  if (req.query.featured === 'true') filter.isFeatured = true;
  if (req.query.available === 'true') filter.isAvailable = true;
  if (req.query.search) {
    const escaped = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.name = { $regex: escaped, $options: 'i' };
  }
  const dishes = await Dish.find(filter).populate('category', 'name slug layout').sort({ sortOrder: 1, createdAt: 1, name: 1 });
  res.json(dishes);
}

export async function getDish(req, res) {
  const dish = await Dish.findById(req.params.id).populate('category', 'name slug layout');
  if (!dish) throw new HttpError(404, 'Dish not found');
  res.json(dish);
}

export async function createDish(req, res) {
  const data = pick(req.body);
  await assertCategoryExists(data.category);
  const dish = await Dish.create(data);
  await dish.populate('category', 'name slug layout');
  res.status(201).json(dish);
}

export async function updateDish(req, res) {
  const dish = await Dish.findById(req.params.id);
  if (!dish) throw new HttpError(404, 'Dish not found');
  const data = pick(req.body);
  if (data.category) await assertCategoryExists(data.category);
  const oldImage = dish.image;
  // Editing the price confirms it: the 'placeholder price' flag clears unless explicitly kept
  if (data.price !== undefined && data.price !== dish.price && data.pricePlaceholder === undefined) data.pricePlaceholder = false;
  dish.set(data);
  await dish.save();
  if (data.image !== undefined && data.image !== oldImage && !(await Dish.exists({ image: oldImage })) && !(await Category.exists({ image: oldImage }))) {
    await removeUploadedImage(oldImage);
  }
  await dish.populate('category', 'name slug layout');
  res.json(dish);
}

export async function deleteDish(req, res) {
  const dish = await Dish.findByIdAndDelete(req.params.id);
  if (!dish) throw new HttpError(404, 'Dish not found');
  if (!(await Dish.exists({ image: dish.image })) && !(await Category.exists({ image: dish.image }))) {
    await removeUploadedImage(dish.image);
  }
  res.json({ message: 'Dish deleted', id: dish._id });
}
