import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/auth.js';
import { categoryRules } from '../validators/categoryValidators.js';
import { validate } from '../validators/authValidators.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(categoryController.listCategories)
  .post(categoryRules, validate, authorize('admin', 'manager'), categoryController.createCategory);

router
  .route('/:id')
  .get(categoryController.getCategory)
  .put(categoryRules, validate, authorize('admin', 'manager'), categoryController.updateCategory)
  .delete(authorize('admin'), categoryController.deleteCategory);

export default router;
