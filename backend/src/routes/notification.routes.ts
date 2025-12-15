import { Router } from 'express';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  subscribeToPush,
  unsubscribeFromPush,
  getPushSubscriptions,
  getVapidPublicKey
} from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// VAPID public key (public endpoint for push subscription)
router.get('/vapid-public-key', getVapidPublicKey);

// All other routes require authentication
router.use(authenticate);

// Notification preferences
router.get('/preferences', getNotificationPreferences);
router.patch('/preferences', updateNotificationPreferences);

// In-app notifications
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:notificationId/read', markNotificationAsRead);
router.patch('/read-all', markAllNotificationsAsRead);
router.delete('/:notificationId', deleteNotification);
router.delete('/', deleteAllNotifications);

// Push notification subscriptions
router.get('/push/subscriptions', getPushSubscriptions);
router.post('/push/subscribe', subscribeToPush);
router.post('/push/unsubscribe', unsubscribeFromPush);

export default router;
