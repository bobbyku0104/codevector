import { Router } from 'express';
import productRoutes from './product.routes.js';

const router = Router();

router.use('/products', productRoutes);

// Simple health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

export default router;
