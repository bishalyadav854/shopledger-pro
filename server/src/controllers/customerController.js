import { asyncHandler } from '../utils/asyncHandler.js';
import * as customerService from '../services/customerService.js';

export const createCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.createCustomer(req.user._id, req.body);
  res.status(201).json({ success: true, data: customer });
});

export const listCustomers = asyncHandler(async (req, res) => {
  const result = await customerService.listCustomers(req.user._id, req.query);
  res.status(200).json({ success: true, ...result });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.getCustomer(req.user._id, req.params.id);
  res.status(200).json({ success: true, data: customer });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.updateCustomer(req.user._id, req.params.id, req.body);
  res.status(200).json({ success: true, data: customer });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  await customerService.deleteCustomer(req.user._id, req.params.id);
  res.status(200).json({ success: true, message: 'Customer deleted' });
});
