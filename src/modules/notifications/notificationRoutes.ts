/**
 * Notifications Routes
 */

import { Router } from 'express';
import * as notificationController from './notificationController';
import { requireAuth } from '../../middleware/authMiddleware';

const router = Router();
router.use(requireAuth); // All notification routes require auth

// Routes
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;
