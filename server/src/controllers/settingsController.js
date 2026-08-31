import { asyncHandler } from '../utils/asyncHandler.js';
import * as settingsService from '../services/settingsService.js';

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getSettings(req.user._id);
  res.status(200).json({ success: true, data: settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateSettings(req.user._id, req.body);
  res.status(200).json({ success: true, data: settings });
});
