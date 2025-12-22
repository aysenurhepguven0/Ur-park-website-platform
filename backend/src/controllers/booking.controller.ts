import { Request, Response, NextFunction } from 'express';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { emailService } from '../services/email.service';
import notificationService from '../services/notification.service';
import prisma from '../lib/prisma';

export const createBooking = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const { parkingSpaceId, startTime, endTime } = req.body;

    // Check if parking space exists and is available
    const parkingSpace = await prisma.parkingSpace.findUnique({
      where: { id: parkingSpaceId }
    });

    if (!parkingSpace) {
      throw new AppError('Parking space not found', 404);
    }

    if (!parkingSpace.isAvailable) {
      throw new AppError('Parking space is not available', 400);
    }

    // Check for conflicting bookings
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        parkingSpaceId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } }
            ]
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } }
            ]
          },
          {
            AND: [
              { startTime: { gte: new Date(startTime) } },
              { endTime: { lte: new Date(endTime) } }
            ]
          }
        ]
      }
    });

    if (conflictingBooking) {
      throw new AppError('Parking space is already booked for this time period', 400);
    }

    // Calculate total price with smart pricing
    const start = new Date(startTime);
    const end = new Date(endTime);
    const totalHours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));

    let totalPrice = 0;
    let remainingHours = totalHours;

    // Calculate months (if monthly pricing available and duration >= 30 days)
    if (parkingSpace.pricePerMonth && remainingHours >= 720) { // 30 days = 720 hours
      const months = Math.floor(remainingHours / 720);
      totalPrice += months * parkingSpace.pricePerMonth;
      remainingHours = remainingHours % 720;
      console.log(`💰 ${months} ay × ₺${parkingSpace.pricePerMonth} = ₺${months * parkingSpace.pricePerMonth}`);
    }

    // Calculate days (if daily pricing available and remaining hours >= 24)
    if (parkingSpace.pricePerDay && remainingHours >= 24) {
      const days = Math.floor(remainingHours / 24);
      totalPrice += days * parkingSpace.pricePerDay;
      remainingHours = remainingHours % 24;
      console.log(`💰 ${days} gün × ₺${parkingSpace.pricePerDay} = ₺${days * parkingSpace.pricePerDay}`);
    }

    // Calculate remaining hours
    if (remainingHours > 0) {
      totalPrice += remainingHours * parkingSpace.pricePerHour;
      console.log(`💰 ${remainingHours} saat × ₺${parkingSpace.pricePerHour} = ₺${remainingHours * parkingSpace.pricePerHour}`);
    }

    console.log(`💰 Toplam: ${totalHours} saat = ₺${totalPrice.toFixed(2)}`);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        parkingSpaceId,
        userId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        totalPrice,
        status: 'PENDING'
      },
      include: {
        parkingSpace: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Send notification emails
    const bookingData = {
      userName: `${booking.user.firstName} ${booking.user.lastName}`,
      spaceTitle: booking.parkingSpace.title,
      startTime: booking.startTime.toLocaleString(),
      endTime: booking.endTime.toLocaleString(),
      totalPrice: booking.totalPrice,
      bookingId: booking.id
    };

    // Notify the space owner via email
    await emailService.sendBookingNotificationToOwner(
      booking.parkingSpace.owner.email,
      bookingData
    );

    // Send in-app/push notification to the space owner
    await notificationService.notifyBookingRequest(
      booking,
      booking.parkingSpace.owner,
      booking.user,
      booking.parkingSpace
    );

    res.status(201).json({
      status: 'success',
      data: { booking }
    });
  }
);

export const getMyBookings = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const { status } = req.query;

    const where: any = { userId };
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        parkingSpace: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      status: 'success',
      data: { bookings }
    });
  }
);

export const getBooking = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId!;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        parkingSpace: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Check if user is either the booker or the space owner
    if (booking.userId !== userId && booking.parkingSpace.ownerId !== userId) {
      throw new AppError('You do not have permission to view this booking', 403);
    }

    res.json({
      status: 'success',
      data: { booking }
    });
  }
);

export const updateBookingStatus = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId!;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        parkingSpace: true
      }
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Only owner can confirm bookings, user can cancel their own
    if (status === 'CONFIRMED' && booking.parkingSpace.ownerId !== userId) {
      throw new AppError('Only the space owner can confirm bookings', 403);
    }

    if (status === 'CANCELLED' && booking.userId !== userId) {
      throw new AppError('Only the booker can cancel bookings', 403);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        parkingSpace: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Send notification emails based on status
    const bookingEmailData = {
      userName: `${updatedBooking.user.firstName} ${updatedBooking.user.lastName}`,
      spaceTitle: updatedBooking.parkingSpace.title,
      startTime: updatedBooking.startTime.toLocaleString(),
      endTime: updatedBooking.endTime.toLocaleString(),
      totalPrice: updatedBooking.totalPrice,
      bookingId: updatedBooking.id
    };

    if (status === 'CONFIRMED') {
      // Send email notification
      await emailService.sendBookingConfirmation(
        updatedBooking.user.email,
        bookingEmailData
      );
      // Send in-app/push notification
      await notificationService.notifyBookingConfirmed(
        updatedBooking,
        updatedBooking.user,
        updatedBooking.parkingSpace
      );
    } else if (status === 'CANCELLED') {
      // Send email notification
      await emailService.sendBookingCancellation(
        updatedBooking.user.email,
        bookingEmailData
      );
      // Send in-app/push notification
      await notificationService.notifyBookingCancelled(
        updatedBooking,
        updatedBooking.user,
        updatedBooking.parkingSpace
      );
    }

    res.json({
      status: 'success',
      data: { booking: updatedBooking }
    });
  }
);

export const getSpaceBookings = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const { spaceId } = req.params;

    // Verify ownership
    const parkingSpace = await prisma.parkingSpace.findUnique({
      where: { id: spaceId }
    });

    if (!parkingSpace) {
      throw new AppError('Parking space not found', 404);
    }

    if (parkingSpace.ownerId !== userId) {
      throw new AppError('You do not have permission to view these bookings', 403);
    }

    const bookings = await prisma.booking.findMany({
      where: { parkingSpaceId: spaceId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    res.json({
      status: 'success',
      data: { bookings }
    });
  }
);
