import { Response, NextFunction } from 'express';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

export const getDashboardStats = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get overall statistics
    const [
      totalUsers,
      totalParkingSpaces,
      totalBookings,
      totalRevenue,
      newUsersThisMonth,
      newSpacesThisMonth,
      activeBookings,
      completedBookings,
      cancelledBookings,
      recentUsers,
      recentBookings,
      topSpaces
    ] = await Promise.all([
      // Total counts
      prisma.user.count(),
      prisma.parkingSpace.count(),
      prisma.booking.count(),

      // Total revenue from paid bookings
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalPrice: true }
      }),

      // New users in last 30 days
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),

      // New spaces in last 30 days
      prisma.parkingSpace.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),

      // Bookings by status
      prisma.booking.count({
        where: { status: { in: ['PENDING', 'CONFIRMED'] } }
      }),
      prisma.booking.count({
        where: { status: 'COMPLETED' }
      }),
      prisma.booking.count({
        where: { status: 'CANCELLED' }
      }),

      // Recent users
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          isEmailVerified: true,
          _count: {
            select: {
              bookings: true,
              parkingSpaces: true
            }
          }
        }
      }),

      // Recent bookings
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
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
              address: true
            }
          }
        }
      }),

      // Top parking spaces by bookings
      prisma.parkingSpace.findMany({
        take: 10,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          _count: {
            select: {
              bookings: true,
              reviews: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy: {
          bookings: {
            _count: 'desc'
          }
        }
      })
    ]);

    // Calculate top spaces with ratings
    const topSpacesWithRatings = topSpaces.map(space => {
      const avgRating =
        space.reviews.length > 0
          ? space.reviews.reduce((sum, r) => sum + r.rating, 0) / space.reviews.length
          : 0;

      return {
        id: space.id,
        title: space.title,
        address: space.address,
        city: space.city,
        state: space.state,
        pricePerHour: space.pricePerHour,
        owner: space.owner,
        bookingCount: space._count.bookings,
        reviewCount: space._count.reviews,
        averageRating: Math.round(avgRating * 10) / 10
      };
    });

    // Calculate daily bookings for last 30 days
    const dailyBookings = await prisma.$queryRaw<
      Array<{ date: Date; count: number }>
    >`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM bookings
      WHERE created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Calculate daily revenue for last 30 days
    const dailyRevenue = await prisma.$queryRaw<
      Array<{ date: Date; revenue: number }>
    >`
      SELECT DATE(created_at) as date, SUM(total_price)::float as revenue
      FROM bookings
      WHERE created_at >= ${thirtyDaysAgo}
        AND payment_status = 'PAID'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    res.json({
      status: 'success',
      data: {
        overview: {
          totalUsers,
          totalParkingSpaces,
          totalBookings,
          totalRevenue: totalRevenue._sum.totalPrice || 0,
          newUsersThisMonth,
          newSpacesThisMonth,
          activeBookings,
          completedBookings,
          cancelledBookings
        },
        recentUsers,
        recentBookings,
        topSpaces: topSpacesWithRatings,
        charts: {
          dailyBookings,
          dailyRevenue
        }
      }
    });
  }
);

export const getAllUsers = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { page = 1, limit = 20, search, role } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          createdAt: true,
          _count: {
            select: {
              bookings: true,
              parkingSpaces: true,
              reviews: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  }
);

export const updateUserRole = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN', 'MODERATOR'].includes(role)) {
      throw new AppError('Invalid role', 400);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    res.json({
      status: 'success',
      data: { user }
    });
  }
);

export const suspendUser = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { reason } = req.body;

    // Cancel all active bookings
    await prisma.booking.updateMany({
      where: {
        userId,
        status: { in: ['PENDING', 'CONFIRMED'] }
      },
      data: { status: 'CANCELLED' }
    });

    // Mark all parking spaces as unavailable
    await prisma.parkingSpace.updateMany({
      where: { ownerId: userId },
      data: { isAvailable: false }
    });

    // Note: In a real system, you might want a "suspended" flag on the user model
    // For now, we'll just return a success response

    res.json({
      status: 'success',
      message: `User suspended. Reason: ${reason || 'No reason provided'}`
    });
  }
);

export const deleteUser = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent deleting admin users
    if (user.role === 'ADMIN') {
      throw new AppError('Cannot delete admin users', 403);
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);

// Get pending parking spaces for admin review
export const getPendingSpaces = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [spaces, total] = await Promise.all([
      prisma.parkingSpace.findMany({
        where: { status: 'PENDING' },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'asc' }
      }),
      prisma.parkingSpace.count({ where: { status: 'PENDING' } })
    ]);

    res.json({
      status: 'success',
      data: {
        spaces,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  }
);

// Approve a parking space
export const approveSpace = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { spaceId } = req.params;

    const space = await prisma.parkingSpace.update({
      where: { id: spaceId },
      data: { status: 'APPROVED' },
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
    });

    res.json({
      status: 'success',
      message: 'Park yeri onaylandı',
      data: { space }
    });
  }
);

// Reject a parking space
export const rejectSpace = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { spaceId } = req.params;
    const { reason } = req.body;

    const space = await prisma.parkingSpace.update({
      where: { id: spaceId },
      data: { status: 'REJECTED' },
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
    });

    res.json({
      status: 'success',
      message: `Park yeri reddedildi. Sebep: ${reason || 'Belirtilmedi'}`,
      data: { space }
    });
  }
);

export const getPlatformStats = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const stats = await prisma.booking.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        paymentStatus: 'PAID'
      },
      _sum: { totalPrice: true },
      _avg: { totalPrice: true },
      _count: true
    });

    const userGrowth = await prisma.$queryRaw<
      Array<{ date: Date; count: number }>
    >`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM users
      WHERE created_at >= ${start} AND created_at <= ${end}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    res.json({
      status: 'success',
      data: {
        period: { start, end },
        revenue: {
          total: stats._sum.totalPrice || 0,
          average: stats._avg.totalPrice || 0,
          bookings: stats._count
        },
        userGrowth
      }
    });
  }
);
