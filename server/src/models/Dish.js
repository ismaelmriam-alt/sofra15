import mongoose from 'mongoose';

const customizationSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 60 },
    price: { type: Number, default: 0, min: 0 },
  },
  { _id: true }
);

const dishSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Dish name is required'], trim: true, maxlength: 80 },
    nameAr: { type: String, trim: true, maxlength: 80, default: '' },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 500 },
    price: { type: Number, required: [true, 'Price is required'], min: [0.01, 'Price must be greater than 0'] },
    // true = the price is a temporary placeholder the owner has not confirmed yet (cleared automatically when the price is edited)
    pricePlaceholder: { type: Boolean, default: false },
    // Position inside its category (seed keeps the menu order; new dishes go last)
    sortOrder: { type: Number, default: 1000 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: [true, 'Category is required'], index: true },
    ingredients: { type: [String], default: [] },
    // Local path (/assets/images/...) or an https URL. Empty = "Photo coming soon" placeholder.
    image: { type: String, trim: true, default: '', match: [/^(\/assets\/images\/[\w\-./]+|https?:\/\/\S+)?$/, 'Image must be an uploaded file path or a full https:// URL'] },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    // Optional add-ons shown in the dish details view (e.g. "Extra garlic")
    customizations: { type: [customizationSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Dish', dishSchema);
