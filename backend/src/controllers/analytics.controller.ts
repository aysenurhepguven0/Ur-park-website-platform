import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get owner analytics/statistics
export const getOwnerAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get all spaces owned by the user
    const spaces = await prisma.parkingSpace.findMany({
      where: { ownerId: userId },
      select: { id: true }
    });

    const spaceIds = spaces.map((s) => s.id);

    // Total bookings
    const totalBookings = await prisma.booking.count({
      where: { parkingSpaceId: { in: spaceIds } }
    });

    // Bookings by status
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      where: { parkingSpaceId: { in: spaceIds } },
      _count: true
    });

    // Total earnings (from completed bookings)
    const completedBookings = await prisma.booking.findMany({
      where: {
        parkingSpaceId: { in: spaceIds },
        status: 'COMPLETED',
        paymentStatus: 'PAID'
      },
      select: { totalPrice: true }
    });

    const totalEarnings = completedBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    // Earnings this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyBookings = await prisma.booking.findMany({
      where: {
        parkingSpaceId: { in: spaceIds },
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        createdAt: { gte: startOfMonth }
      },
      select: { totalPrice: true }
    });

    const monthlyEarnings = monthlyBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    // Upcoming bookings
    const upcomingBookings = await prisma.booking.count({
      where: {
        parkingSpaceId: { in: spaceIds },
        status: { in: ['PENDING', 'CONFIRMED'] },
        startTime: { gte: new Date() }
      }
    });

    // Total reviews
    const totalReviews = await prisma.review.count({
      where: { parkingSpaceId: { in: spaceIds } }
    });

    // Average rating
    const reviews = await prisma.review.findMany({
      where: { parkingSpaceId: { in: spaceIds } },
      select: { rating: true }
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      status: 'success',
      data: {
        overview: {
          totalSpaces: spaces.length,
          totalBookings,
          totalEarnings: totalEarnings.toFixed(2),
          monthlyEarnings: monthlyEarnings.toFixed(2),
          upcomingBookings,
          totalReviews,
          averageRating: averageRating.toFixed(1)
        },
        bookingsByStatus: bookingsByStatus.map((item) => ({
          status: item.status,
          count: item._count
        }))
      }
    });
  } catch (error) {
    console.error('Get owner analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve analytics'
    });
  }
};

// Get revenue trends over time
export const getRevenueTrends = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const period = (req.query.period as string) || 'month'; // week, month, year

    const spaces = await prisma.parkingSpace.findMany({
      where: { ownerId: userId },
      select: { id: true }
    });

    const spaceIds = spaces.map((s) => s.id);

    let startDate: Date;
    const now = new Date();

    if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'year') {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      // month (default)
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    }

    const bookings = await prisma.booking.findMany({
      where: {
        parkingSpaceId: { in: spaceIds },
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        createdAt: { gte: startDate }
      },
      select: {
        totalPrice: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by date
    const revenueByDate: { [key: string]: number } = {};
    bookings.forEach((booking) => {
      const date = booking.createdAt.toISOString().split('T')[0];
      revenueByDate[date] = (revenueByDate[date] || 0) + booking.totalPrice;
    });

    const trends = Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue: revenue.toFixed(2)
    }));

    res.json({
      status: 'success',
      data: { trends }
    });
  } catch (error) {
    console.error('Get revenue trends error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve revenue trends'
    });
  }
};

// Get space-specific analytics
export const getSpaceAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { spaceId } = req.params;

    // Verify ownership
    const space = await prisma.parkingSpace.findFirst({
      where: {
        id: spaceId,
        ownerId: userId
      }
    });

    if (!space) {
      return res.status(404).json({
        status: 'error',
        message: 'Parking space not found'
      });
    }

    // Total bookings for this space
    const totalBookings = await prisma.booking.count({
      where: { parkingSpaceId: spaceId }
    });

    // Completed bookings
    const completedBookings = await prisma.booking.count({
      where: {
        parkingSpaceId: spaceId,
        status: 'COMPLETED'
      }
    });

    // Total revenue
    const bookings = await prisma.booking.findMany({
      where: {
        parkingSpaceId: spaceId,
        status: 'COMPLETED',
        paymentStatus: 'PAID'
      },
      select: { totalPrice: true }
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

    // Reviews and rating
    const reviews = await prisma.review.findMany({
      where: { parkingSpaceId: spaceId },
      select: { rating: true }
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Occupancy rate (bookings in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBookings = await prisma.booking.findMany({
      where: {
        parkingSpaceId: spaceId,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        startTime: { gte: thirtyDaysAgo }
      },
      select: {
        startTime: true,
        endTime: true
      }
    });

    // Calculate total hours booked
    const totalHoursBooked = recentBookings.reduce((sum, booking) => {
      const hours = (booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    const totalHoursInPeriod = 30 * 24; // 30 days * 24 hours
    const occupancyRate = ((totalHoursBooked / totalHoursInPeriod) * 100).toFixed(1);

    res.json({
      status: 'success',
      data: {
        spaceId,
        spaceName: space.title,
        totalBookings,
        completedBookings,
        totalRevenue: totalRevenue.toFixed(2),
        averageRating: averageRating.toFixed(1),
        reviewCount: reviews.length,
        occupancyRate: `${occupancyRate}%`
      }
    });
  } catch (error) {
    console.error('Get space analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve space analytics'
    });
  }
};

// Get popular booking times
export const getPopularTimes = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const spaces = await prisma.parkingSpace.findMany({
      where: { ownerId: userId },
      select: { id: true }
    });

    const spaceIds = spaces.map((s) => s.id);

    const bookings = await prisma.booking.findMany({
      where: {
        parkingSpaceId: { in: spaceIds },
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      },
      select: {
        startTime: true
      }
    });

    // Group by hour of day
    const hourCounts: { [hour: number]: number } = {};
    bookings.forEach((booking) => {
      const hour = booking.startTime.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const popularTimes = Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count
      }))
      .sort((a, b) => b.count - a.count);

    res.json({
      status: 'success',
      data: { popularTimes }
    });
  } catch (error) {
    console.error('Get popular times error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve popular times'
    });
  }
};
