import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { paymentRules } from '../validators/paymentValidators.js';
import { validate } from '../validators/authValidators.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(paymentController.listPayments)
  .post(paymentRules, validate, authorize('admin', 'manager'), paymentController.recordPayment);

router.get('/invoice/:invoiceId', paymentController.getPaymentsByInvoice);

export default router;
