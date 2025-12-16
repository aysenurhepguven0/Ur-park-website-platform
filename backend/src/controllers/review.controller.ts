import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import notificationService from '../services/notification.service';

const prisma = new PrismaClient();

export const createReview = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const { parkingSpaceId, rating, comment } = req.body;

    // Check if user has a completed booking for this space
    const completedBooking = await prisma.booking.findFirst({
      where: {
        userId,
        parkingSpaceId,
        status: 'COMPLETED'
      }
    });

    if (!completedBooking) {
      throw new AppError(
        'You can only review parking spaces you have booked and completed',
        400
      );
    }

    // Check if user already reviewed this space
    const existingReview = await prisma.review.findUnique({
      where: {
        parkingSpaceId_userId: {
          parkingSpaceId,
          userId
        }
      }
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this parking space', 400);
    }

    const review = await prisma.review.create({
      data: {
        parkingSpaceId,
        userId,
        rating,
        comment
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
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
        }
      }
    });

    // Send notification to the space owner about the new review
    await notificationService.notifyNewReview(
      review,
      review.parkingSpace.owner,
      review.parkingSpace,
      review.user
    );

    res.status(201).json({
      status: 'success',
      data: { review }
    });
  }
);

export const getSpaceReviews = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { spaceId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { parkingSpaceId: spaceId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({
      status: 'success',
      data: {
        reviews,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length
      }
    });
  }
);

export const updateReview = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId!;
    const { rating, comment } = req.body;

    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (review.userId !== userId) {
      throw new AppError('You can only update your own reviews', 403);
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { rating, comment },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      status: 'success',
      data: { review: updatedReview }
    });
  }
);

export const deleteReview = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId!;

    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (review.userId !== userId) {
      throw new AppError('You can only delete your own reviews', 403);
    }

    await prisma.review.delete({
      where: { id }
    });

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);
