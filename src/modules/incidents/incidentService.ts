/**
 * Incidents Service
 * Handles incident reporting, retrieval, and analysis
 */

import prisma from '../../lib/prisma';
import logger from '../../config/logger';
import {
  NotFoundError,
  ValidationError,
  AuthorizationError,
} from '../../utils/errors';
import { findNearbyIncidents, getBoundingBox } from '../../lib/geo';
import { generateIncidentInsight, detectHotspots } from '../ai/aiService';

/**
 * Create a new incident report
 */
export async function createIncident(
  userId: string,
  payload: {
    type: string;
    description?: string;
    severity?: string;
    category?: string;
    latitude?: number;
    longitude?: number;
    encryptedText?: string;
    encryptedFileUrl?: string;
    evidenceHash: string;
    evidenceMimeType?: string;
    encryptionMeta?: any;
  }
) {
  try {
    // Create location if coordinates provided
    let locationId: string | undefined;
    if (payload.latitude && payload.longitude) {
      const location = await prisma.location.create({
        data: {
          latitude: payload.latitude,
          longitude: payload.longitude,
        },
      });
      locationId = location.id;
    }

    // Create incident
    const incident = await prisma.incident.create({
      data: {
        userId,
        type: payload.type,
        description: payload.description,
        severity: payload.severity || 'medium',
        category: payload.category,
        latitude: payload.latitude,
        longitude: payload.longitude,
        encryptedText: payload.encryptedText,
        encryptedFileUrl: payload.encryptedFileUrl,
        evidenceHash: payload.evidenceHash,
        evidenceMimeType: payload.evidenceMimeType,
        encryptionMeta: payload.encryptionMeta,
        locationId,
      },
      include: { location: true },
    });

    // Generate AI insights asynchronously
    generateIncidentInsight(userId, incident.id).catch((error) => {
      logger.error('incident_ai_analysis_failed', {
        incidentId: incident.id,
        error: (error as Error).message,
      });
    });

    // Create alert for nearby users if high severity
    if (
      incident.severity === 'high' ||
      incident.severity === 'critical'
    ) {
      await createNearbyUserAlerts(incident);
    }

    logger.info('incident_created', {
      userId,
      incidentId: incident.id,
      severity: incident.severity,
    });

    return incident;
  } catch (error) {
    logger.error('incident_creation_failed', {
      userId,
      error: (error as Error).message,
    });
    throw error;
  }
}

/**
 * Get incident by ID
 */
export async function getIncident(incidentId: string, userId?: string) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      location: true,
      aiInsights: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
      alerts: true,
      reports: true,
    },
  });

  if (!incident) {
    throw new NotFoundError('Incident');
  }

  // Check authorization if userId provided
  if (userId && incident.userId !== userId) {
    throw new AuthorizationError('Not authorized to access this incident');
  }

  return incident;
}

/**
 * List incidents with filtering and pagination
 */
export async function listIncidents(
  userId: string,
  filters: {
    severity?: string;
    type?: string;
    status?: string;
    category?: string;
    createdAfter?: Date;
    skip?: number;
    take?: number;
  } = {}
) {
  const { skip = 0, take = 20 } = filters;

  const where: any = { userId };

  if (filters.severity) where.severity = filters.severity;
  if (filters.type) where.type = filters.type;
  if (filters.status) where.status = filters.status;
  if (filters.category) where.category = filters.category;
  if (filters.createdAfter) where.createdAt = { gte: filters.createdAfter };

  const [incidents, total] = await Promise.all([
    prisma.incident.findMany({
      where,
      include: {
        location: true,
        aiInsights: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { timestamp: 'desc' },
      skip,
      take,
    }),
    prisma.incident.count({ where }),
  ]);

  return {
    data: incidents,
    pagination: {
      total,
      skip,
      take,
      hasMore: skip + take < total,
    },
  };
}

/**
 * Find incidents nearby a location
 */
export async function getNearbyIncidents(
  latitude: number,
  longitude: number,
  radiusKm: number = 5,
  skip: number = 0,
  take: number = 20
) {
  const bbox = getBoundingBox({ latitude, longitude }, radiusKm);

  const incidents = await prisma.incident.findMany({
    where: {
      latitude: { gte: bbox.minLat, lte: bbox.maxLat },
      longitude: { gte: bbox.minLng, lte: bbox.maxLng },
    },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
      location: true,
      aiInsights: { take: 1, orderBy: { createdAt: 'desc' } },
    },
    orderBy: { timestamp: 'desc' },
    skip,
    take,
  });

  // Filter by distance using Haversine formula
  const nearby = findNearbyIncidents(
    { latitude, longitude },
    radiusKm,
    incidents as any
  );

  return nearby;
}

/**
 * Update incident status
 */
export async function updateIncidentStatus(
  incidentId: string,
  userId: string,
  status: string
) {
  const incident = await getIncident(incidentId, userId);

  const updated = await prisma.incident.update({
    where: { id: incidentId },
    data: { status },
    include: { location: true, aiInsights: { take: 1 } },
  });

  logger.info('incident_status_updated', {
    incidentId,
    userId,
    status,
  });

  return updated;
}

/**
 * Create alerts for nearby users
 */
async function createNearbyUserAlerts(incident: any) {
  try {
    if (!incident.latitude || !incident.longitude) return;

    const nearbyIncidents = await prisma.incident.findMany({
      where: {
        NOT: { id: incident.id },
        latitude: {
          gte: incident.latitude - 0.1,
          lte: incident.latitude + 0.1,
        },
        longitude: {
          gte: incident.longitude - 0.1,
          lte: incident.longitude + 0.1,
        },
      },
      select: { userId: true },
      distinct: ['userId'],
    });

    // Create alerts for nearby users
    const userIds = nearbyIncidents.map((i) => i.userId).slice(0, 10); // Limit to 10 users
    
    if (userIds.length > 0) {
      await prisma.alert.createMany({
        data: userIds.map((userId) => ({
          userId,
          incidentId: incident.id,
          title: `Alert: ${incident.type} reported nearby`,
          message: `A ${incident.severity} severity incident has been reported near your location`,
          alertType: 'nearby_incident',
          severity: incident.severity,
          radius: 5000, // 5km
          status: 'active',
        })),
      });

      logger.info('nearby_alerts_created', {
        incidentId: incident.id,
        alertCount: userIds.length,
      });
    }
  } catch (error) {
    logger.error('nearby_alerts_creation_failed', {
      incidentId: incident.id,
      error: (error as Error).message,
    });
  }
}

/**
 * Get AI insights for an incident
 */
export async function getIncidentInsights(incidentId: string) {
  const insights = await prisma.aIInsight.findFirst({
    where: { incidentId },
    orderBy: { createdAt: 'desc' },
  });

  if (!insights) {
    throw new NotFoundError('AI insights not found for this incident');
  }

  return insights;
}

/**
 * Get incident hotspots
 */
export async function getHotspots(cityOrCountry?: string) {
  return detectHotspots(cityOrCountry);
}
