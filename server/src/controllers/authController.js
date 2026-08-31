import { asyncHandler } from '../utils/asyncHandler.js';
import { setRefreshTokenCookie } from '../utils/tokens.js';
import * as authService from '../services/authService.js';

export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);
  setRefreshTokenCookie(res, refreshToken);
  res.status(201).json({ success: true, data: { user, accessToken } });
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
  setRefreshTokenCookie(res, refreshToken);
  res.status(200).json({ success: true, data: { user, accessToken } });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  const { accessToken } = await authService.refreshAccessToken(token);
  res.status(200).json({ success: true, data: { accessToken } });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user) await authService.logoutUser(req.user._id);
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const resetToken = await authService.requestPasswordReset(req.body.email);
  // In production this would be emailed via nodemailer instead of returned.
  res.status(200).json({
    success: true,
    message: 'If that email exists, a password reset link has been sent',
    ...(process.env.NODE_ENV !== 'production' && resetToken ? { resetToken } : {}),
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  res.status(200).json({ success: true, message: 'Password has been reset successfully' });
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
  res.status(200).json({ success: true, message: 'Password changed successfully' });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user.toSafeObject() });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, shopName, avatarUrl } = req.body;
  const user = req.user;
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (shopName !== undefined) user.shopName = shopName;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  await user.save();
  res.status(200).json({ success: true, data: user.toSafeObject() });
});
