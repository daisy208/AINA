/**
 * Authentication Controller
 * Handles HTTP requests for auth operations
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as authService from './authService';
import logger from '../../config/logger';

/**
 * POST /auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);

  res.status(201).json({
    success: true,
    data: result,
  });
});

/**
 * POST /auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * POST /auth/refresh
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshAccessToken(refreshToken);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * POST /auth/logout
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await authService.logout(req.user!.id, refreshToken);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * GET /auth/profile
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getUserProfile(req.user!.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * PATCH /auth/profile
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.updateUserProfile(req.user!.id, req.body);

  res.status(200).json({
    success: true,
    data: user,
  });
});
