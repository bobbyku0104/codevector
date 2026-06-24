import { Router } from 'express';
import { listProducts, listCategories } from '../controllers/product.controller.js';

const router = Router();

// GET /api/products/categories
router.get('/categories', listCategories);

// GET /api/products
router.get('/', listProducts);

export default router;
