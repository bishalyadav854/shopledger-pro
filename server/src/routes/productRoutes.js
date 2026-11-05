import express from 'express';
import * as productController from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { productRules } from '../validators/productValidators.js';
import { validate } from '../validators/authValidators.js';

const router = express.Router();

router.use(protect);

router.get('/barcode/:barcode', productController.getProductByBarcode);

router
  .route('/')
  .get(productController.listProducts)
  .post(productRules, validate, authorize('admin', 'manager'), productController.createProduct);

router
  .route('/:id')
  .get(productController.getProduct)
  .put(productRules, validate, authorize('admin', 'manager'), productController.updateProduct)
  .delete(authorize('admin'), productController.deleteProduct);

export default router;
