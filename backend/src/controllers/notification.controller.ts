import { Response, NextFunction } from 'express';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import notificationService from '../services/notification.service';

// ============================================
// Notification Preferences
// ============================================

export const getNotificationPreferences = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: { userId }
      });
    }

    res.json({
      status: 'success',
      data: { preferences }
    });
  }
);

export const updateNotificationPreferences = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const {
      // Email preferences
      emailBookingConfirm,
      emailBookingReminder,
      emailBookingCancelled,
      emailNewMessage,
      emailReviewReceived,
      emailPaymentReceived,
      emailMarketingUpdates,
      // Push preferences
      pushEnabled,
      pushBookingConfirm,
      pushBookingReminder,
      pushBookingCancelled,
      pushNewMessage,
      pushReviewReceived,
      pushPaymentReceived,
      // In-app preferences
      inAppEnabled
    } = req.body;

    const updateData: Record<string, boolean> = {};

    // Email preferences
    if (emailBookingConfirm !== undefined) updateData.emailBookingConfirm = emailBookingConfirm;
    if (emailBookingReminder !== undefined) updateData.emailBookingReminder = emailBookingReminder;
    if (emailBookingCancelled !== undefined) updateData.emailBookingCancelled = emailBookingCancelled;
    if (emailNewMessage !== undefined) updateData.emailNewMessage = emailNewMessage;
    if (emailReviewReceived !== undefined) updateData.emailReviewReceived = emailReviewReceived;
    if (emailPaymentReceived !== undefined) updateData.emailPaymentReceived = emailPaymentReceived;
    if (emailMarketingUpdates !== undefined) updateData.emailMarketingUpdates = emailMarketingUpdates;

    // Push preferences
    if (pushEnabled !== undefined) updateData.pushEnabled = pushEnabled;
    if (pushBookingConfirm !== undefined) updateData.pushBookingConfirm = pushBookingConfirm;
    if (pushBookingReminder !== undefined) updateData.pushBookingReminder = pushBookingReminder;
    if (pushBookingCancelled !== undefined) updateData.pushBookingCancelled = pushBookingCancelled;
    if (pushNewMessage !== undefined) updateData.pushNewMessage = pushNewMessage;
    if (pushReviewReceived !== undefined) updateData.pushReviewReceived = pushReviewReceived;
    if (pushPaymentReceived !== undefined) updateData.pushPaymentReceived = pushPaymentReceived;

    // In-app preferences
    if (inAppEnabled !== undefined) updateData.inAppEnabled = inAppEnabled;

    const preferences = await prisma.notificationPreference.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData
      }
    });

    res.json({
      status: 'success',
      data: { preferences }
    });
  }
);

// ============================================
// In-App Notifications
// ============================================

export const getNotifications = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

    const result = await notificationService.getUserNotifications(userId, page, limit);

    res.json({
      status: 'success',
      data: result
    });
  }
);

export const getUnreadCount = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;

    const count = await notificationService.getUnreadCount(userId);

    res.json({
      status: 'success',
      data: { unreadCount: count }
    });
  }
);

export const markNotificationAsRead = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const { notificationId } = req.params;

    const notification = await notificationService.markAsRead(notificationId, userId);

    res.json({
      status: 'success',
      data: { notification }
    });
  }
);

export const markAllNotificationsAsRead = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;

    await notificationService.markAllAsRead(userId);

    res.json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  }
);

export const deleteNotification = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const { notificationId } = req.params;

    await notificationService.deleteNotification(notificationId, userId);

    res.json({
      status: 'success',
      message: 'Notification deleted'
    });
  }
);

export const deleteAllNotifications = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;

    await notificationService.deleteAllNotifications(userId);

    res.json({
      status: 'success',
      message: 'All notifications deleted'
    });
  }
);

// ============================================
// Push Notification Subscriptions
// ============================================

export const subscribeToPush = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return next(new AppError('Invalid subscription object', 400));
    }

    const userAgent = req.headers['user-agent'];

    const pushSubscription = await notificationService.subscribeToPush(
      userId,
      subscription,
      userAgent
    );

    res.json({
      status: 'success',
      message: 'Successfully subscribed to push notifications',
      data: { subscriptionId: pushSubscription.id }
    });
  }
);

export const unsubscribeFromPush = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { endpoint } = req.body;

    if (!endpoint) {
      return next(new AppError('Endpoint is required', 400));
    }

    await notificationService.unsubscribeFromPush(endpoint);

    res.json({
      status: 'success',
      message: 'Successfully unsubscribed from push notifications'
    });
  }
);

export const getPushSubscriptions = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;

    const subscriptions = await notificationService.getUserPushSubscriptions(userId);

    res.json({
      status: 'success',
      data: { subscriptions }
    });
  }
);

// ============================================
// VAPID Public Key (for frontend)
// ============================================

export const getVapidPublicKey = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      return next(new AppError('Push notifications are not configured', 503));
    }

    res.json({
      status: 'success',
      data: { vapidPublicKey }
    });
  }
);
