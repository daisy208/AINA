/**
 * Incidents Controller
 * Handles HTTP requests for incident operations
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as incidentService from './incidentService';

/**
 * POST /incidents
 */
export const createIncident = asyncHandler(async (req: Request, res: Response) => {
  const incident = await incidentService.createIncident(req.user!.id, req.body);

  res.status(201).json({
    success: true,
    data: incident,
  });
});

/**
 * GET /incidents/:id
 */
export const getIncident = asyncHandler(async (req: Request, res: Response) => {
  const incident = await incidentService.getIncident(req.params.id, req.user?.id);

  res.status(200).json({
    success: true,
    data: incident,
  });
});

/**
 * GET /incidents
 */
export const listIncidents = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    severity: req.query.severity as string,
    type: req.query.type as string,
    status: req.query.status as string,
    category: req.query.category as string,
    createdAfter: req.query.createdAfter ? new Date(req.query.createdAfter as string) : undefined,
    skip: parseInt(req.query.skip as string) || 0,
    take: Math.min(parseInt(req.query.take as string) || 20, 100),
  };

  const result = await incidentService.listIncidents(req.user!.id, filters);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * GET /incidents/nearby?latitude=...&longitude=...&radius=...
 */
export const getNearbyIncidents = asyncHandler(
  async (req: Request, res: Response) => {
    const { latitude, longitude, radius = 5, skip = 0, take = 20 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: { message: 'latitude and longitude are required', code: 400 },
      });
    }

    const incidents = await incidentService.getNearbyIncidents(
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      parseFloat(radius as string) || 5,
      parseInt(skip as string) || 0,
      Math.min(parseInt(take as string) || 20, 100)
    );

    res.status(200).json({
      success: true,
      data: incidents,
    });
  }
);

/**
 * PATCH /incidents/:id/status
 */
export const updateIncidentStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: { message: 'status is required', code: 400 },
    });
  }

  const incident = await incidentService.updateIncidentStatus(
    req.params.id,
    req.user!.id,
    status
  );

  res.status(200).json({
    success: true,
    data: incident,
  });
});

/**
 * GET /incidents/:id/insights
 */
export const getIncidentInsights = asyncHandler(async (req: Request, res: Response) => {
  const insights = await incidentService.getIncidentInsights(req.params.id);

  res.status(200).json({
    success: true,
    data: insights,
  });
});

/**
 * GET /incidents/hotspots
 */
export const getHotspots = asyncHandler(async (req: Request, res: Response) => {
  const hotspots = await incidentService.getHotspots();

  res.status(200).json({
    success: true,
    data: hotspots,
  });
});
