import { asyncHandler } from '../utils/asyncHandler.js';
import * as paymentService from '../services/paymentService.js';

export const recordPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.recordPayment(req.user._id, req.user._id, req.body);
  res.status(201).json({ success: true, data: payment });
});

export const listPayments = asyncHandler(async (req, res) => {
  const result = await paymentService.listPayments(req.user._id, req.query);
  res.status(200).json({ success: true, ...result });
});

export const getPaymentsByInvoice = asyncHandler(async (req, res) => {
  const payments = await paymentService.getPaymentsByInvoice(req.user._id, req.params.invoiceId);
  res.status(200).json({ success: true, count: payments.length, data: payments });
});
