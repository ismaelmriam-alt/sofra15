import { Router } from 'express';
import mongoose from 'mongoose';
import { asyncHandler, validateObjectId } from '../middleware/errorHandler.js';
import * as cat from '../controllers/categoryController.js';
import * as dish from '../controllers/dishController.js';
import * as order from '../controllers/orderController.js';
import { requireAdmin, adminLogin } from '../middleware/auth.js';
import { uploadMiddleware, handleUpload } from '../controllers/uploadController.js';

const router = Router();
const id = validateObjectId('id');

router.get('/health', (req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Admin session check (shared-secret, see middleware/auth.js)
router.post('/admin/login', adminLogin);
router.get('/admin/verify', requireAdmin, (req, res) => res.json({ ok: true }));
router.post('/uploads/dish-image', requireAdmin, uploadMiddleware, asyncHandler(handleUpload));

// Categories — public read, admin write
router.get('/categories', asyncHandler(cat.listCategories));
router.post('/categories', requireAdmin, asyncHandler(cat.createCategory));
router.get('/categories/:id', id, asyncHandler(cat.getCategory));
router.put('/categories/:id', requireAdmin, id, asyncHandler(cat.updateCategory));
router.delete('/categories/:id', requireAdmin, id, asyncHandler(cat.deleteCategory));

// Dishes — public read, admin write
router.get('/dishes', asyncHandler(dish.listDishes));
router.post('/dishes', requireAdmin, asyncHandler(dish.createDish));
router.get('/dishes/:id', id, asyncHandler(dish.getDish));
router.put('/dishes/:id', requireAdmin, id, asyncHandler(dish.updateDish));
router.delete('/dishes/:id', requireAdmin, id, asyncHandler(dish.deleteDish));

// Orders — customers can place and look up an order; everything else is admin only
router.post('/orders', asyncHandler(order.createOrder));
router.get('/orders/lookup/:id', asyncHandler(order.getOrder));
router.get('/orders/stats', requireAdmin, asyncHandler(order.getStats));
router.get('/orders', requireAdmin, asyncHandler(order.listOrders));
router.patch('/orders/:id/status', requireAdmin, id, asyncHandler(order.updateOrderStatus));
router.delete('/orders/:id', requireAdmin, id, asyncHandler(order.deleteOrder));

export default router;
