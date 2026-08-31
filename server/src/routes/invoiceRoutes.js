import express from 'express';
import * as invoiceController from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/auth.js';
import { invoiceRules } from '../validators/invoiceValidators.js';
import { validate } from '../validators/authValidators.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(invoiceController.listInvoices)
  .post(invoiceRules, validate, authorize('admin', 'manager'), invoiceController.createInvoice);

router
  .route('/:id')
  .get(invoiceController.getInvoice)
  .put(invoiceController.updateInvoiceStatus)
  .delete(authorize('admin'), invoiceController.deleteInvoice);

export default router;
