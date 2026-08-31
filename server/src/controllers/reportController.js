import { asyncHandler } from '../utils/asyncHandler.js';
import * as reportService from '../services/reportService.js';

export const salesSummary = asyncHandler(async (req, res) => {
  const data = await reportService.salesSummary(req.user._id, req.query);
  res.status(200).json({ success: true, data });
});

export const customerDues = asyncHandler(async (req, res) => {
  const data = await reportService.customerDues(req.user._id);
  res.status(200).json({ success: true, ...data });
});

export const topProducts = asyncHandler(async (req, res) => {
  const data = await reportService.topProducts(req.user._id, req.query);
  res.status(200).json({ success: true, data });
});

export const collectionReport = asyncHandler(async (req, res) => {
  const data = await reportService.collectionReport(req.user._id, req.query);
  res.status(200).json({ success: true, data });
});
