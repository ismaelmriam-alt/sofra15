import crypto from 'crypto';
import Order, { ORDER_STATUSES } from '../models/Order.js';
import Dish from '../models/Dish.js';
import Category from '../models/Category.js';
import { HttpError } from '../middleware/errorHandler.js';

const round2 = (n) => Math.round(n * 100) / 100;

function newOrderId() {
  const d = new Date();
  const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `SOF-${stamp}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export async function createOrder(req, res) {
  const { customerName, phone, orderType, address, notes, items } = req.body;

  const errors = {};
  if (!customerName || !String(customerName).trim()) errors.customerName = 'Name is required';
  if (!phone || !/^[+\d][\d\s\-()]{5,}$/.test(String(phone).trim())) errors.phone = 'Enter a valid phone number';
  if (!['Delivery', 'Pickup'].includes(orderType)) errors.orderType = 'Choose Delivery or Pickup';
  if (orderType === 'Delivery' && !(address && String(address).trim())) errors.address = 'Address is required for delivery';
  if (!Array.isArray(items) || items.length === 0) errors.items = 'Your cart is empty';
  if (Object.keys(errors).length) throw new HttpError(400, 'Validation failed', errors);

  // Prices always come from the database, never from the client.
  const ids = [...new Set(items.map((i) => String(i.dishId)))];
  const dishes = await Dish.find({ _id: { $in: ids.filter((id) => /^[a-f\d]{24}$/i.test(id)) } });
  const byId = new Map(dishes.map((d) => [String(d._id), d]));

  const orderItems = items.map((i) => {
    const dish = byId.get(String(i.dishId));
    if (!dish) throw new HttpError(400, 'One of the dishes in your cart no longer exists. Please review your cart.', { items: 'Dish no longer exists' });
    if (!dish.isAvailable) throw new HttpError(400, `"${dish.name}" is currently unavailable. Please remove it from your cart.`, { items: `${dish.name} is unavailable` });
    const quantity = Math.floor(Number(i.quantity));
    if (!(quantity >= 1 && quantity <= 50)) throw new HttpError(400, 'Invalid quantity', { items: 'Invalid quantity' });

    const chosen = dish.customizations.filter((c) => (i.optionIds || []).map(String).includes(String(c._id)));
    const unitPrice = round2(dish.price + chosen.reduce((s, c) => s + c.price, 0));
    return {
      dish: dish._id,
      name: dish.name,
      image: dish.image,
      unitPrice,
      quantity,
      options: chosen.map((c) => c.label),
      lineTotal: round2(unitPrice * quantity),
    };
  });

  const subtotal = round2(orderItems.reduce((s, i) => s + i.lineTotal, 0));

  let order;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      order = await Order.create({
        orderId: newOrderId(),
        customerName,
        phone,
        orderType,
        address: orderType === 'Delivery' ? address : '',
        notes,
        items: orderItems,
        subtotal,
        total: subtotal,
      });
      break;
    } catch (e) {
      if (e.code === 11000 && e.keyPattern?.orderId) continue;
      throw e;
    }
  }
  if (!order) throw new HttpError(500, 'Could not generate an order ID, please retry');
  res.status(201).json(order);
}

export async function listOrders(req, res) {
  const filter = {};
  if (req.query.status && ORDER_STATUSES.includes(req.query.status)) filter.status = req.query.status;
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json(orders);
}

export async function getOrder(req, res) {
  const order = await Order.findOne({ orderId: req.params.id });
  if (!order) throw new HttpError(404, 'Order not found');
  res.json(order);
}

export async function updateOrderStatus(req, res) {
  const { status } = req.body;
  if (!ORDER_STATUSES.includes(status)) {
    throw new HttpError(400, `Status must be one of: ${ORDER_STATUSES.join(', ')}`, { status: 'Invalid status' });
  }
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
  if (!order) throw new HttpError(404, 'Order not found');
  res.json(order);
}

export async function deleteOrder(req, res) {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) throw new HttpError(404, 'Order not found');
  res.json({ message: 'Order deleted', id: order._id });
}

export async function getStats(req, res) {
  const [totalDishes, totalCategories, totalOrders, recentOrders, pendingOrders, revenueAgg] = await Promise.all([
    Dish.countDocuments(),
    Category.countDocuments(),
    Order.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(5),
    Order.countDocuments({ status: 'Pending' }),
    Order.aggregate([{ $group: { _id: null, revenue: { $sum: '$total' } } }]),
  ]);
  res.json({ totalDishes, totalCategories, totalOrders, pendingOrders, revenue: revenueAgg[0]?.revenue || 0, recentOrders });
}
