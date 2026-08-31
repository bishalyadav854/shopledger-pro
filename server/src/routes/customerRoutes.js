import express from 'express';
import * as customerController from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/auth.js';
import { customerRules } from '../validators/customerValidators.js';
import { validate } from '../validators/authValidators.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(customerController.listCustomers)
  .post(customerRules, validate, authorize('admin', 'manager', 'staff'), customerController.createCustomer);

router
  .route('/:id')
  .get(customerController.getCustomer)
  .put(customerRules, validate, authorize('admin', 'manager', 'staff'), customerController.updateCustomer)
  .delete(authorize('admin'), customerController.deleteCustomer);

export default router;
