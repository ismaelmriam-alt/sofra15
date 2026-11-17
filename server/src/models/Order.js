import mongoose from 'mongoose';

export const ORDER_STATUSES = ['Pending', 'Preparing', 'Delivered'];

const orderItemSchema = new mongoose.Schema(
  {
    dish: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish' },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 50 },
    options: { type: [String], default: [] },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, index: true },
    customerName: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    phone: { type: String, required: [true, 'Phone is required'], trim: true, maxlength: 30 },
    orderType: { type: String, enum: ['Delivery', 'Pickup'], required: true },
    address: { type: String, trim: true, maxlength: 250, default: '' },
    notes: { type: String, trim: true, maxlength: 400, default: '' },
    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, 'An order needs at least one item'],
    },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: 'Pending' },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
