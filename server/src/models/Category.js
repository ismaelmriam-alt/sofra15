import mongoose from 'mongoose';

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Category name is required'], trim: true, maxlength: 60, unique: true },
    nameAr: { type: String, trim: true, maxlength: 80, default: '' },
    // 'cards' = one photo per dish · 'shared' = ONE category photo with the items listed beneath it (Manakish, Shisha)
    layout: { type: String, enum: ['cards', 'shared'], default: 'cards' },
    tagline: { type: String, trim: true, maxlength: 100, default: '' },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    image: { type: String, trim: true, default: '', match: [/^(\/assets\/images\/[\w\-./]+|https?:\/\/\S+)?$/, 'Image must be an uploaded file path or a full https:// URL'] },
    slug: { type: String, unique: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.pre('validate', function (next) {
  if (this.name) this.slug = slugify(this.name);
  next();
});

export default mongoose.model('Category', categorySchema);
