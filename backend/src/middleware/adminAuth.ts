import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AppError } from './errorHandler';
import prisma from '../lib/prisma';

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      throw new AppError('Admin access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
