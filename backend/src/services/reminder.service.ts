import cron from 'node-cron';
import prisma from '../lib/prisma';
import { emailService } from './email.service';
import notificationService from './notification.service';

export class ReminderService {
  private static instance: ReminderService;
  private cronJob: cron.ScheduledTask | null = null;

  private constructor() {}

  public static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService();
    }
    return ReminderService.instance;
  }

  public start() {
    // Run every hour to check for bookings that need reminders
    this.cronJob = cron.schedule('0 * * * *', async () => {
      console.log('Running booking reminder check...');
      await this.sendBookingReminders();
    });

    console.log('📧 Booking reminder service started');
  }

  public stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('Booking reminder service stopped');
    }
  }

  private async sendBookingReminders() {
    try {
      const now = new Date();
      const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find confirmed bookings that start in approximately 24 hours
      const upcomingBookings = await prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          startTime: {
            gte: now,
            lte: twentyFourHoursFromNow
          }
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          parkingSpace: {
            select: {
              id: true,
              title: true,
              address: true,
              owner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      console.log(`Found ${upcomingBookings.length} bookings needing reminders`);

      // Send reminder emails
      for (const booking of upcomingBookings) {
        // Send reminder to the renter
        await this.sendRenterReminder(booking);

        // Send reminder to the owner
        await this.sendOwnerReminder(booking);
      }
    } catch (error) {
      console.error('Error sending booking reminders:', error);
    }
  }

  private async sendRenterReminder(booking: any) {
    try {
      const startDate = new Date(booking.startTime);
      const endDate = new Date(booking.endTime);

      await emailService.sendBookingReminder(booking.user.email, {
        userName: `${booking.user.firstName} ${booking.user.lastName}`,
        spaceTitle: booking.parkingSpace.title,
        startTime: startDate.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        endTime: endDate.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        totalPrice: booking.totalPrice,
        bookingId: booking.id
      });
      console.log(`Sent reminder to renter: ${booking.user.email} for booking ${booking.id}`);

      // Send push/in-app notification
      await notificationService.notifyBookingReminder(
        booking,
        booking.user,
        booking.parkingSpace
      );
    } catch (error) {
      console.error(`Failed to send renter reminder for booking ${booking.id}:`, error);
    }
  }

  private async sendOwnerReminder(booking: any) {
    try {
      const startDate = new Date(booking.startTime);
      const endDate = new Date(booking.endTime);

      await emailService.sendBookingReminder(booking.parkingSpace.owner.email, {
        userName: `${booking.parkingSpace.owner.firstName} ${booking.parkingSpace.owner.lastName}`,
        spaceTitle: booking.parkingSpace.title,
        startTime: startDate.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        endTime: endDate.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        totalPrice: booking.totalPrice,
        bookingId: booking.id
      });
      console.log(`Sent reminder to owner: ${booking.parkingSpace.owner.email} for booking ${booking.id}`);
    } catch (error) {
      console.error(`Failed to send owner reminder for booking ${booking.id}:`, error);
    }
  }

  // Method to manually send a reminder for a specific booking (for testing or immediate needs)
  public async sendImmediateReminder(bookingId: string) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          parkingSpace: {
            select: {
              id: true,
              title: true,
              address: true,
              owner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      await this.sendRenterReminder(booking);
      await this.sendOwnerReminder(booking);

      return { success: true, message: 'Reminders sent successfully' };
    } catch (error) {
      console.error('Error sending immediate reminder:', error);
      throw error;
    }
  }
}

export default ReminderService.getInstance();
