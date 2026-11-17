import Category from '../models/Category.js';
import Dish from '../models/Dish.js';
import { HttpError } from '../middleware/errorHandler.js';
import { removeUploadedImage } from './uploadController.js';

const FIELDS = ['name', 'nameAr', 'layout', 'tagline', 'description', 'image', 'order'];
const pick = (body) => Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

export async function listCategories(req, res) {
  const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
  const counts = await Dish.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  const map = new Map(counts.map((c) => [String(c._id), c.count]));
  res.json(categories.map((c) => ({ ...c, dishCount: map.get(String(c._id)) || 0 })));
}

export async function getCategory(req, res) {
  const category = await Category.findById(req.params.id);
  if (!category) throw new HttpError(404, 'Category not found');
  res.json(category);
}

export async function createCategory(req, res) {
  const category = await Category.create(pick(req.body));
  res.status(201).json(category);
}

export async function updateCategory(req, res) {
  const category = await Category.findById(req.params.id);
  if (!category) throw new HttpError(404, 'Category not found');
  const oldImage = category.image;
  category.set(pick(req.body));
  await category.save();
  if (category.image !== oldImage && !(await Category.exists({ image: oldImage })) && !(await Dish.exists({ image: oldImage }))) {
    await removeUploadedImage(oldImage);
  }
  res.json(category);
}

export async function deleteCategory(req, res) {
  const category = await Category.findById(req.params.id);
  if (!category) throw new HttpError(404, 'Category not found');
  const dishCount = await Dish.countDocuments({ category: category._id });
  if (dishCount > 0) {
    throw new HttpError(
      409,
      `Cannot delete "${category.name}": it still contains ${dishCount} dish${dishCount === 1 ? '' : 'es'}. Move or delete them first.`
    );
  }
  await category.deleteOne();
  if (!(await Dish.exists({ image: category.image }))) await removeUploadedImage(category.image);
  res.json({ message: 'Category deleted', id: category._id });
}
