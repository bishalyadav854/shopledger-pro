import { asyncHandler } from '../utils/asyncHandler.js';
import * as invoiceService from '../services/invoiceService.js';

export const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.createInvoice(req.user._id, req.user._id, req.body);
  res.status(201).json({ success: true, data: invoice });
});

export const listInvoices = asyncHandler(async (req, res) => {
  const result = await invoiceService.listInvoices(req.user._id, req.query);
  res.status(200).json({ success: true, ...result });
});

export const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoice(req.user._id, req.params.id);
  res.status(200).json({ success: true, data: invoice });
});

export const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.updateInvoiceStatus(req.user._id, req.params.id, req.body);
  res.status(200).json({ success: true, data: invoice });
});

export const deleteInvoice = asyncHandler(async (req, res) => {
  await invoiceService.deleteInvoice(req.user._id, req.params.id);
  res.status(200).json({ success: true, message: 'Invoice deleted' });
});
