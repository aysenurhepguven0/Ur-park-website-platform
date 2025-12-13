import webpush from 'web-push';
import prisma from '../lib/prisma';
import { NotificationType } from '@prisma/client';
import logger from './logger.service';

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || 'support@sharedparking.com'}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

interface NotificationData {
  bookingId?: string;
  spaceId?: string;
  conversationId?: string;
  reviewId?: string;
  amount?: number;
  [key: string]: unknown;
}

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
}

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: NotificationData;
  actions?: Array<{ action: string; title: string }>;
}

class NotificationService {
  /**
   * Create an in-app notification and optionally send push notification
   */
  async createNotification(params: CreateNotificationParams) {
    const { userId, type, title, message, data } = params;

    try {
      // Check user's notification preferences
      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId }
      });

      // Create in-app notification if enabled
      if (!preferences || preferences.inAppEnabled) {
        const notification = await prisma.notification.create({
          data: {
            userId,
            type,
            title,
            message,
            data: data || {}
          }
        });

        logger.info(`Created notification ${notification.id} for user ${userId}`);
      }

      // Send push notification if enabled
      if (this.shouldSendPush(preferences, type)) {
        await this.sendPushNotification(userId, {
          title,
          body: message,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: type,
          data
        });
      }
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Check if push notification should be sent based on user preferences
   */
  private shouldSendPush(preferences: any, type: NotificationType): boolean {
    if (!preferences || !preferences.pushEnabled) {
      return preferences === null; // Default to true if no preferences set
    }

    const pushPreferenceMap: Record<NotificationType, string> = {
      BOOKING_CONFIRMED: 'pushBookingConfirm',
      BOOKING_CANCELLED: 'pushBookingCancelled',
      BOOKING_REMINDER: 'pushBookingReminder',
      BOOKING_REQUEST: 'pushBookingConfirm',
      PAYMENT_RECEIVED: 'pushPaymentReceived',
      PAYMENT_REFUNDED: 'pushPaymentReceived',
      NEW_MESSAGE: 'pushNewMessage',
      NEW_REVIEW: 'pushReviewReceived',
      SPACE_UPDATE: 'pushEnabled',
      SYSTEM_ANNOUNCEMENT: 'pushEnabled'
    };

    const preferenceKey = pushPreferenceMap[type];
    return preferenceKey ? preferences[preferenceKey] !== false : true;
  }

  /**
   * Send push notification to all user's subscribed devices
   */
  async sendPushNotification(userId: string, payload: PushPayload) {
    try {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId }
      });

      if (subscriptions.length === 0) {
        logger.debug(`No push subscriptions found for user ${userId}`);
        return;
      }

      const pushPromises = subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
              }
            },
            JSON.stringify(payload)
          );
          logger.debug(`Push notification sent to ${subscription.endpoint}`);
        } catch (error: any) {
          // If subscription is expired or invalid, remove it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.delete({
              where: { id: subscription.id }
            });
            logger.info(`Removed expired push subscription ${subscription.id}`);
          } else {
            logger.error(`Failed to send push to ${subscription.endpoint}:`, error);
          }
        }
      });

      await Promise.allSettled(pushPromises);
    } catch (error) {
      logger.error('Error sending push notifications:', error);
    }
  }

  /**
   * Get user's notifications with pagination
   */
  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } })
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      unreadCount
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() }
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() }
    });
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return prisma.notification.delete({
      where: { id: notificationId }
    });
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string) {
    return prisma.notification.deleteMany({
      where: { userId }
    });
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false }
    });
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(
    userId: string,
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    userAgent?: string
  ) {
    // Check if subscription already exists
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint }
    });

    if (existing) {
      // Update existing subscription
      return prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          userId,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent
        }
      });
    }

    // Create new subscription
    return prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent
      }
    });
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(endpoint: string) {
    const subscription = await prisma.pushSubscription.findUnique({
      where: { endpoint }
    });

    if (subscription) {
      await prisma.pushSubscription.delete({
        where: { id: subscription.id }
      });
    }
  }

  /**
   * Get user's push subscriptions
   */
  async getUserPushSubscriptions(userId: string) {
    return prisma.pushSubscription.findMany({
      where: { userId },
      select: {
        id: true,
        endpoint: true,
        userAgent: true,
        createdAt: true
      }
    });
  }

  // Notification helper methods for specific events

  async notifyBookingConfirmed(booking: any, user: any, space: any) {
    await this.createNotification({
      userId: user.id,
      type: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmed',
      message: `Your booking for ${space.title} has been confirmed.`,
      data: { bookingId: booking.id, spaceId: space.id }
    });
  }

  async notifyBookingRequest(booking: any, owner: any, seeker: any, space: any) {
    await this.createNotification({
      userId: owner.id,
      type: 'BOOKING_REQUEST',
      title: 'New Booking Request',
      message: `${seeker.firstName} ${seeker.lastName} has booked your space "${space.title}".`,
      data: { bookingId: booking.id, spaceId: space.id, seekerId: seeker.id }
    });
  }

  async notifyBookingCancelled(booking: any, user: any, space: any) {
    await this.createNotification({
      userId: user.id,
      type: 'BOOKING_CANCELLED',
      title: 'Booking Cancelled',
      message: `Your booking for ${space.title} has been cancelled.`,
      data: { bookingId: booking.id, spaceId: space.id }
    });
  }

  async notifyBookingReminder(booking: any, user: any, space: any) {
    await this.createNotification({
      userId: user.id,
      type: 'BOOKING_REMINDER',
      title: 'Upcoming Booking Reminder',
      message: `Reminder: Your booking for ${space.title} starts soon.`,
      data: { bookingId: booking.id, spaceId: space.id }
    });
  }

  async notifyPaymentReceived(booking: any, owner: any, space: any, amount: number) {
    await this.createNotification({
      userId: owner.id,
      type: 'PAYMENT_RECEIVED',
      title: 'Payment Received',
      message: `You received a payment of $${amount.toFixed(2)} for ${space.title}.`,
      data: { bookingId: booking.id, spaceId: space.id, amount }
    });
  }

  async notifyPaymentRefunded(booking: any, user: any, space: any, amount: number) {
    await this.createNotification({
      userId: user.id,
      type: 'PAYMENT_REFUNDED',
      title: 'Payment Refunded',
      message: `Your payment of $${amount.toFixed(2)} for ${space.title} has been refunded.`,
      data: { bookingId: booking.id, spaceId: space.id, amount }
    });
  }

  async notifyNewMessage(conversationId: string, sender: any, receiver: any, messagePreview: string) {
    await this.createNotification({
      userId: receiver.id,
      type: 'NEW_MESSAGE',
      title: `New message from ${sender.firstName}`,
      message: messagePreview.length > 100 ? messagePreview.substring(0, 100) + '...' : messagePreview,
      data: { conversationId, senderId: sender.id }
    });
  }

  async notifyNewReview(review: any, owner: any, space: any, reviewer: any) {
    await this.createNotification({
      userId: owner.id,
      type: 'NEW_REVIEW',
      title: 'New Review Received',
      message: `${reviewer.firstName} left a ${review.rating}-star review for ${space.title}.`,
      data: { reviewId: review.id, spaceId: space.id, reviewerId: reviewer.id }
    });
  }

  async notifySystemAnnouncement(userId: string, title: string, message: string) {
    await this.createNotification({
      userId,
      type: 'SYSTEM_ANNOUNCEMENT',
      title,
      message
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
