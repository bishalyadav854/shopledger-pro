import { asyncHandler } from '../utils/asyncHandler.js';
import * as productService from '../services/productService.js';

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.user._id, req.body);
  res.status(201).json({ success: true, data: product });
});

export const listProducts = asyncHandler(async (req, res) => {
  const result = await productService.listProducts(req.user._id, req.query);
  res.status(200).json({ success: true, ...result });
});

export const getProductByBarcode = asyncHandler(async (req, res) => {
  const product = await productService.getProductByBarcode(req.user._id, req.params.barcode);
  res.status(200).json({ success: true, data: product });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProduct(req.user._id, req.params.id);
  res.status(200).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.user._id, req.params.id, req.body);
  res.status(200).json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.user._id, req.params.id);
  res.status(200).json({ success: true, message: 'Product deleted' });
});
