import { Request, Response, NextFunction } from 'express';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

export const addFavorite = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const { parkingSpaceId } = req.body;

    // Check if parking space exists
    const parkingSpace = await prisma.parkingSpace.findUnique({
      where: { id: parkingSpaceId }
    });

    if (!parkingSpace) {
      throw new AppError('Parking space not found', 404);
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_parkingSpaceId: {
          userId,
          parkingSpaceId
        }
      }
    });

    if (existingFavorite) {
      return res.json({
        status: 'success',
        message: 'Parking space already in favorites',
        data: { favorite: existingFavorite }
      });
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        parkingSpaceId
      },
      include: {
        parkingSpace: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      data: { favorite }
    });
  }
);

export const removeFavorite = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const { parkingSpaceId } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_parkingSpaceId: {
          userId,
          parkingSpaceId
        }
      }
    });

    if (!favorite) {
      throw new AppError('Favorite not found', 404);
    }

    await prisma.favorite.delete({
      where: {
        userId_parkingSpaceId: {
          userId,
          parkingSpaceId
        }
      }
    });

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);

export const getFavorites = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        parkingSpace: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            reviews: {
              select: {
                rating: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate average ratings
    const favoritesWithRatings = favorites.map(fav => {
      const avgRating =
        fav.parkingSpace.reviews.length > 0
          ? fav.parkingSpace.reviews.reduce((sum, r) => sum + r.rating, 0) /
            fav.parkingSpace.reviews.length
          : 0;

      return {
        id: fav.id,
        createdAt: fav.createdAt,
        parkingSpace: {
          ...fav.parkingSpace,
          averageRating: Math.round(avgRating * 10) / 10,
          reviewCount: fav.parkingSpace.reviews.length
        }
      };
    });

    res.json({
      status: 'success',
      data: { favorites: favoritesWithRatings }
    });
  }
);

export const checkFavorite = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const { parkingSpaceId } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_parkingSpaceId: {
          userId,
          parkingSpaceId
        }
      }
    });

    res.json({
      status: 'success',
      data: { isFavorite: !!favorite }
    });
  }
);
