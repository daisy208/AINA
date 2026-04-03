/**
 * Notifications Controller
 * Handles HTTP requests for notification operations
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as notificationService from './notificationService';

/**
 * GET /notifications
 */
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    read: req.query.read !== undefined ? req.query.read === 'true' : undefined,
    skip: parseInt(req.query.skip as string) || 0,
    take: Math.min(parseInt(req.query.take as string) || 20, 100),
  };

  const result = await notificationService.getUserNotifications(req.user!.id, filters);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * PATCH /notifications/:id/read
 */
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await notificationService.markAsRead(
    req.params.id,
    req.user!.id
  );

  res.status(200).json({
    success: true,
    data: notification,
  });
});

/**
 * PATCH /notifications/read-all
 */
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const result = await notificationService.markAllAsRead(req.user!.id);

  res.status(200).json({
    success: true,
    message: `${result.count} notifications marked as read`,
  });
});

/**
 * DELETE /notifications/:id
 */
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.deleteNotification(req.params.id, req.user!.id);

  res.status(204).send();
});

/**
 * GET /notifications/unread-count
 */
export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await notificationService.getUnreadCount(req.user!.id);

  res.status(200).json({
    success: true,
    data: { unreadCount: count },
  });
});
