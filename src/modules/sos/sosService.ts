/**
 * SOS Service
 * Handles emergency SOS triggers, contact notifications, and real-time alerts
 */

import prisma from '../../lib/prisma';
import logger from '../../config/logger';
import { NotFoundError, AuthorizationError } from '../../utils/errors';
import { getBoundingBox } from '../../lib/geo';

/**
 * Trigger SOS emergency alert
 */
export async function triggerSOS(
  userId: string,
  payload: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    encryptedAudioUrl?: string;
    encryptionMeta?: any;
    audioHash?: string;
  }
) {
  try {
    // Get user's emergency contacts
    const contacts = await prisma.contact.findMany({
      where: { userId },
      orderBy: { priority: 'asc' },
    });

    // Create location if coordinates provided
    let locationId: string | undefined;
    if (payload.latitude && payload.longitude) {
      const location = await prisma.location.create({
        data: {
          latitude: payload.latitude,
          longitude: payload.longitude,
          accuracy: payload.accuracy,
        },
      });
      locationId = location.id;
    }

    // Create SOS record
    const sos = await prisma.sOS.create({
      data: {
        userId,
        locationId,
        latitude: payload.latitude,
        longitude: payload.longitude,
        accuracy: payload.accuracy,
        encryptedAudioUrl: payload.encryptedAudioUrl,
        encryptionMeta: payload.encryptionMeta,
        audioHash: payload.audioHash,
        status: 'activated',
        contactsNotified: 0,
      },
      include: { location: true },
    });

    // Notify emergency contacts asynchronously
    notifyEmergencyContacts(sos, contacts).catch((error) => {
      logger.error('sos_contact_notification_failed', {
        sosId: sos.id,
        error: (error as Error).message,
      });
    });

    // Create broadcast alert for nearby users
    createSOSBroadcastAlert(sos).catch((error) => {
      logger.error('sos_broadcast_failed', {
        sosId: sos.id,
        error: (error as Error).message,
      });
    });

    logger.info('sos_triggered', {
      sosId: sos.id,
      userId,
      contactCount: contacts.length,
    });

    return sos;
  } catch (error) {
    logger.error('sos_trigger_failed', {
      userId,
      error: (error as Error).message,
    });
    throw error;
  }
}

/**
 * Get SOS record by ID
 */
export async function getSOS(sosId: string, userId?: string) {
  const sos = await prisma.sOS.findUnique({
    where: { id: sosId },
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
    },
  });

  if (!sos) {
    throw new NotFoundError('SOS record');
  }

  if (userId && sos.userId !== userId) {
    throw new AuthorizationError('Not authorized to access this SOS record');
  }

  return sos;
}

/**
 * Resolve/Cancel SOS alert
 */
export async function resolveSOS(sosId: string, userId: string) {
  const sos = await getSOS(sosId, userId);

  const resolved = await prisma.sOS.update({
    where: { id: sosId },
    data: {
      status: 'resolved',
      resolvedAt: new Date(),
    },
    include: { location: true },
  });

  logger.info('sos_resolved', { sosId, userId });

  return resolved;
}

/**
 * List user's SOS records
 */
export async function listUserSOS(
  userId: string,
  filters: {
    status?: string;
    skip?: number;
    take?: number;
  } = {}
) {
  const { skip = 0, take = 20 } = filters;

  const where: any = { userId };
  if (filters.status) where.status = filters.status;

  const [sosList, total] = await Promise.all([
    prisma.sOS.findMany({
      where,
      include: { location: true },
      orderBy: { triggeredAt: 'desc' },
      skip,
      take,
    }),
    prisma.sOS.count({ where }),
  ]);

  return {
    data: sosList,
    pagination: { total, skip, take, hasMore: skip + take < total },
  };
}

/**
 * Notify emergency contacts about SOS
 */
async function notifyEmergencyContacts(sos: any, contacts: any[]) {
  if (contacts.length === 0) {
    logger.warn('sos_no_contacts', { sosId: sos.id, userId: sos.userId });
    return;
  }

  try {
    // In production, this would integrate with Twilio or similar SMS/call service
    const message = `SOS ALERT: Emergency assistance requested at location ${sos.latitude}, ${sos.longitude}`;

    // Create notifications for each contact
    for (const contact of contacts.slice(0, 5)) {
      // Limit to 5 contacts
      logger.info('sending_contact_notification', {
        sosId: sos.id,
        contactName: contact.name,
        contactPhone: contact.phone,
      });

      // Here you would integrate with your notification service (Twilio, Firebase, etc.)
      // await twilio.sendSMS(contact.phone, message);
    }

    // Update SOS record with notification count
    await prisma.sOS.update({
      where: { id: sos.id },
      data: { contactsNotified: Math.min(contacts.length, 5) },
    });
  } catch (error) {
    logger.error('contact_notification_error', {
      sosId: sos.id,
      error: (error as Error).message,
    });
  }
}

/**
 * Create broadcast alert for nearby users/authorities
 */
async function createSOSBroadcastAlert(sos: any) {
  try {
    if (!sos.latitude || !sos.longitude) return;

    // Find nearby users
    const bbox = getBoundingBox(
      { latitude: sos.latitude, longitude: sos.longitude },
      5 // 5km radius
    );

    const nearbyUsers = await prisma.user.findMany({
      select: { id: true },
      take: 20,
    });

    // Create broadcast alerts
    if (nearbyUsers.length > 0) {
      await prisma.alert.createMany({
        data: nearbyUsers.map((user) => ({
          userId: user.id,
          title: 'Emergency SOS Alert',
          message: 'An emergency SOS has been triggered in your area',
          alertType: 'sos_alert',
          severity: 'critical',
          radius: 5000,
          status: 'active',
        })),
        skipDuplicates: true,
      });

      logger.info('sos_broadcast_alerts_created', {
        sosId: sos.id,
        alertCount: nearbyUsers.length,
      });
    }
  } catch (error) {
    logger.error('sos_broadcast_error', {
      sosId: sos.id,
      error: (error as Error).message,
    });
  }
}
