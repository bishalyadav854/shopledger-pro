import { asyncHandler } from '../utils/asyncHandler.js';
import * as categoryService from '../services/categoryService.js';

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.user._id, req.body);
  res.status(201).json({ success: true, data: category });
});

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories(req.user._id, req.query);
  res.status(200).json({ success: true, count: categories.length, data: categories });
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategory(req.user._id, req.params.id);
  res.status(200).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.user._id, req.params.id, req.body);
  res.status(200).json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.user._id, req.params.id);
  res.status(200).json({ success: true, message: 'Category deleted' });
});
