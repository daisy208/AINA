/**
 * SOS Controller
 * Handles HTTP requests for emergency SOS operations
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as sosService from './sosService';

/**
 * POST /sos
 */
export const triggerSOS = asyncHandler(async (req: Request, res: Response) => {
  const sos = await sosService.triggerSOS(req.user!.id, req.body);

  res.status(201).json({
    success: true,
    data: sos,
  });
});

/**
 * GET /sos/:id
 */
export const getSOS = asyncHandler(async (req: Request, res: Response) => {
  const sos = await sosService.getSOS(req.params.id, req.user?.id);

  res.status(200).json({
    success: true,
    data: sos,
  });
});

/**
 * GET /sos
 */
export const listSOS = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    status: req.query.status as string,
    skip: parseInt(req.query.skip as string) || 0,
    take: Math.min(parseInt(req.query.take as string) || 20, 100),
  };

  const result = await sosService.listUserSOS(req.user!.id, filters);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * PATCH /sos/:id/resolve
 */
export const resolveSOS = asyncHandler(async (req: Request, res: Response) => {
  const sos = await sosService.resolveSOS(req.params.id, req.user!.id);

  res.status(200).json({
    success: true,
    data: sos,
  });
});
