/**
 * Notifications Service
 * Handles notification management and delivery
 */

import prisma from '../../lib/prisma';
import logger from '../../config/logger';
import { NotFoundError, AuthorizationError } from '../../utils/errors';

/**
 * Create a notification
 */
export async function createNotification(payload: {
  userId: string;
  title: string;
  message: string;
  type: string;
  deepLink?: string;
  metadata?: any;
}) {
  try {
    const notification = await prisma.notification.create({
      data: payload,
    });

    logger.info('notification_created', {
      notificationId: notification.id,
      userId: payload.userId,
      type: payload.type,
    });

    return notification;
  } catch (error) {
    logger.error('notification_creation_failed', {
      userId: payload.userId,
      error: (error as Error).message,
    });
    throw error;
  }
}

/**
 * Get user's notifications
 */
export async function getUserNotifications(
  userId: string,
  filters: {
    read?: boolean;
    skip?: number;
    take?: number;
  } = {}
) {
  const { skip = 0, take = 20 } = filters;

  const where: any = { userId };
  if (filters.read !== undefined) where.read = filters.read;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    data: notifications,
    pagination: { total, skip, take, hasMore: skip + take < total },
  };
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new NotFoundError('Notification');
  }

  if (notification.userId !== userId) {
    throw new AuthorizationError('Not authorized to access this notification');
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      read: true,
      readAt: new Date(),
    },
  });

  logger.info('notification_marked_read', { notificationId, userId });

  return updated;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: {
      read: true,
      readAt: new Date(),
    },
  });

  logger.info('all_notifications_marked_read', {
    userId,
    count: result.count,
  });

  return result;
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new NotFoundError('Notification');
  }

  if (notification.userId !== userId) {
    throw new AuthorizationError('Not authorized to delete this notification');
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  logger.info('notification_deleted', { notificationId, userId });
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string) {
  const count = await prisma.notification.count({
    where: { userId, read: false },
  });

  return count;
}
