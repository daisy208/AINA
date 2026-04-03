/**
 * Reports Controller
 * Handles HTTP requests for report operations
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as reportService from './reportService';

/**
 * POST /reports
 */
export const createReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.createReport(req.user!.id, req.body);

  res.status(201).json({
    success: true,
    data: report,
  });
});

/**
 * GET /reports/:id
 */
export const getReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.getReport(req.params.id, req.user?.id);

  res.status(200).json({
    success: true,
    data: report,
  });
});

/**
 * GET /reports
 */
export const listReports = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    reportType: req.query.reportType as string,
    status: req.query.status as string,
    skip: parseInt(req.query.skip as string) || 0,
    take: Math.min(parseInt(req.query.take as string) || 20, 100),
  };

  const result = await reportService.listUserReports(req.user!.id, filters);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * PATCH /reports/:id
 */
export const updateReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.updateReport(
    req.params.id,
    req.user!.id,
    req.body
  );

  res.status(200).json({
    success: true,
    data: report,
  });
});

/**
 * POST /reports/:id/submit
 */
export const submitReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.submitReport(req.params.id, req.user!.id);

  res.status(200).json({
    success: true,
    data: report,
  });
});

/**
 * DELETE /reports/:id
 */
export const deleteReport = asyncHandler(async (req: Request, res: Response) => {
  await reportService.deleteReport(req.params.id, req.user!.id);

  res.status(204).send();
});
