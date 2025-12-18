import { Request, Response, NextFunction } from 'express';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { calculateDistance, getBoundingBox } from '../utils/distance';

export const createParkingSpace = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const {
      title,
      description,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      pricePerHour,
      pricePerDay,
      pricePerMonth,
      spaceType,
      amenities,
      images
    } = req.body;

    // Detailed logging
    console.log('📝 Creating parking space...');
    console.log('User ID:', userId);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('SpaceType received:', spaceType);

    // İstanbul kısıtlaması - Sadece İstanbul'da park yeri eklenebilir
    if (city?.toLowerCase() !== 'istanbul' && city?.toLowerCase() !== 'i̇stanbul') {
      console.error('❌ City validation failed:', city);
      throw new AppError('Park yerleri sadece İstanbul\'da eklenebilir', 400);
    }

    const parkingSpace = await prisma.parkingSpace.create({
      data: {
        title,
        description,
        address,
        city,
        state,
        zipCode,
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        pricePerHour: parseFloat(pricePerHour) || 0,
        pricePerDay: pricePerDay ? parseFloat(pricePerDay) : null,
        pricePerMonth: pricePerMonth ? parseFloat(pricePerMonth) : null,
        spaceType,
        amenities: amenities || [],
        images: images || [],
        ownerId: userId
      },
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

    console.log('✅ Parking space created successfully:', parkingSpace.id);

    res.status(201).json({
      status: 'success',
      data: { parkingSpace }
    });
  }
);

export const getParkingSpaces = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      city,
      state,
      spaceType,
      minPrice,
      maxPrice,
      latitude,
      longitude,
      radius,
      search,
      amenities,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      isAvailable: true,
      status: 'APPROVED'
    };

    // City and state filtering
    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (state) where.state = { contains: state as string, mode: 'insensitive' };

    // Space type filtering
    if (spaceType) where.spaceType = spaceType;

    // Price range filtering
    if (minPrice || maxPrice) {
      where.pricePerHour = {};
      if (minPrice) where.pricePerHour.gte = parseFloat(minPrice as string);
      if (maxPrice) where.pricePerHour.lte = parseFloat(maxPrice as string);
    }

    // Keyword search in title and description
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Amenities filtering
    if (amenities) {
      const amenitiesList = Array.isArray(amenities)
        ? amenities
        : (amenities as string).split(',');
      where.amenities = {
        hasEvery: amenitiesList
      };
    }

    // Distance-based filtering using bounding box
    const userLat = latitude ? parseFloat(latitude as string) : null;
    const userLon = longitude ? parseFloat(longitude as string) : null;
    const searchRadius = radius ? parseFloat(radius as string) : null;

    if (userLat && userLon && searchRadius) {
      const bbox = getBoundingBox(userLat, userLon, searchRadius);
      where.latitude = { gte: bbox.minLat, lte: bbox.maxLat };
      where.longitude = { gte: bbox.minLon, lte: bbox.maxLon };
    }

    // Determine sort field and order
    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.pricePerHour = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === 'distance' && userLat && userLon) {
      // Distance sorting will be done in memory after fetching
      orderBy.createdAt = 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [parkingSpaces, total] = await Promise.all([
      prisma.parkingSpace.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        skip: sortBy === 'distance' ? 0 : skip, // Don't skip if sorting by distance
        take: sortBy === 'distance' ? undefined : Number(limit), // Fetch all if sorting by distance
        orderBy
      }),
      prisma.parkingSpace.count({ where })
    ]);

    // Calculate average rating and distance for each space
    let spacesWithRatings = parkingSpaces.map(space => {
      const avgRating =
        space.reviews.length > 0
          ? space.reviews.reduce((sum, r) => sum + r.rating, 0) / space.reviews.length
          : 0;

      const { reviews, ...spaceData } = space;

      // Calculate distance if user coordinates provided
      const distance =
        userLat && userLon
          ? calculateDistance(userLat, userLon, space.latitude, space.longitude)
          : null;

      return {
        ...spaceData,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
        distance
      };
    });

    // Apply precise distance filter (bounding box is approximate)
    if (userLat && userLon && searchRadius) {
      spacesWithRatings = spacesWithRatings.filter(
        space => space.distance !== null && space.distance <= searchRadius
      );
    }

    // Sort by distance if requested
    if (sortBy === 'distance' && userLat && userLon) {
      spacesWithRatings.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return sortOrder === 'asc' ? a.distance - b.distance : b.distance - a.distance;
      });

      // Apply pagination after distance sorting
      spacesWithRatings = spacesWithRatings.slice(skip, skip + Number(limit));
    }

    res.json({
      status: 'success',
      data: {
        parkingSpaces: spacesWithRatings,
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

export const getParkingSpace = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const parkingSpace = await prisma.parkingSpace.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        reviews: {
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
        },
        availability: true
      }
    });

    if (!parkingSpace) {
      throw new AppError('Parking space not found', 404);
    }

    // Calculate average rating
    const avgRating =
      parkingSpace.reviews.length > 0
        ? parkingSpace.reviews.reduce((sum, r) => sum + r.rating, 0) /
          parkingSpace.reviews.length
        : 0;

    res.json({
      status: 'success',
      data: {
        parkingSpace: {
          ...parkingSpace,
          averageRating: Math.round(avgRating * 10) / 10,
          reviewCount: parkingSpace.reviews.length
        }
      }
    });
  }
);

export const updateParkingSpace = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId!;

    const parkingSpace = await prisma.parkingSpace.findUnique({
      where: { id }
    });

    if (!parkingSpace) {
      throw new AppError('Parking space not found', 404);
    }

    if (parkingSpace.ownerId !== userId) {
      throw new AppError('You do not have permission to update this parking space', 403);
    }

    const updatedSpace = await prisma.parkingSpace.update({
      where: { id },
      data: req.body,
      include: {
        owner: {
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
      data: { parkingSpace: updatedSpace }
    });
  }
);

export const deleteParkingSpace = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId!;

    const parkingSpace = await prisma.parkingSpace.findUnique({
      where: { id }
    });

    if (!parkingSpace) {
      throw new AppError('Parking space not found', 404);
    }

    if (parkingSpace.ownerId !== userId) {
      throw new AppError('You do not have permission to delete this parking space', 403);
    }

    await prisma.parkingSpace.delete({
      where: { id }
    });

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);

export const getMyParkingSpaces = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;

    const parkingSpaces = await prisma.parkingSpace.findMany({
      where: { ownerId: userId },
      include: {
        reviews: {
          select: {
            rating: true
          }
        },
        bookings: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const spacesWithStats = parkingSpaces.map(space => {
      const avgRating =
        space.reviews.length > 0
          ? space.reviews.reduce((sum, r) => sum + r.rating, 0) / space.reviews.length
          : 0;

      const { reviews, bookings, ...spaceData } = space;
      return {
        ...spaceData,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
        bookingCount: bookings.length
      };
    });

    res.json({
      status: 'success',
      data: { parkingSpaces: spacesWithStats }
    });
  }
);

export const getAvailability = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const parkingSpace = await prisma.parkingSpace.findUnique({
      where: { id }
    });

    if (!parkingSpace) {
      throw new AppError('Parking space not found', 404);
    }

    const availability = await prisma.availability.findMany({
      where: { parkingSpaceId: id },
      orderBy: { date: 'asc' }
    });

    res.json({
      status: 'success',
      data: availability
    });
  }
);

export const setAvailability = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId!;
    const { availabilities } = req.body;

    const parkingSpace = await prisma.parkingSpace.findUnique({
      where: { id }
    });

    if (!parkingSpace) {
      throw new AppError('Parking space not found', 404);
    }

    if (parkingSpace.ownerId !== userId) {
      throw new AppError('You do not have permission to manage this parking space', 403);
    }

    // Delete existing availability and create new ones
    await prisma.availability.deleteMany({
      where: { parkingSpaceId: id }
    });

    if (availabilities && availabilities.length > 0) {
      await prisma.availability.createMany({
        data: availabilities.map((slot: any) => ({
          parkingSpaceId: id,
          date: new Date(slot.date),
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable !== false
        }))
      });
    }

    const updatedAvailability = await prisma.availability.findMany({
      where: { parkingSpaceId: id },
      orderBy: { date: 'asc' }
    });

    res.json({
      status: 'success',
      data: updatedAvailability
    });
  }
);

// Get nearby parking spaces based on user's location
export const getNearbyParkingSpaces = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      latitude,
      longitude,
      radius = 5, // Default 5 miles
      limit = 20
    } = req.query;

    if (!latitude || !longitude) {
      throw new AppError('Latitude and longitude are required', 400);
    }

    const userLat = parseFloat(latitude as string);
    const userLon = parseFloat(longitude as string);
    const searchRadius = parseFloat((radius as string) || '5');
    const resultLimit = Math.min(100, parseInt((limit as string) || '20'));

    // Validate parsed values
    if (isNaN(userLat) || isNaN(userLon)) {
      throw new AppError('Invalid latitude or longitude', 400);
    }

    // Get bounding box for initial DB query
    const bbox = getBoundingBox(userLat, userLon, searchRadius);

    const parkingSpaces = await prisma.parkingSpace.findMany({
      where: {
        isAvailable: true,
        latitude: { gte: bbox.minLat, lte: bbox.maxLat },
        longitude: { gte: bbox.minLon, lte: bbox.maxLon }
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      }
    });

    // Calculate distance and filter by precise radius
    const spacesWithDistance = parkingSpaces
      .map(space => {
        const distance = calculateDistance(userLat, userLon, space.latitude, space.longitude);
        const avgRating =
          space.reviews.length > 0
            ? space.reviews.reduce((sum, r) => sum + r.rating, 0) / space.reviews.length
            : 0;

        const { reviews, ...spaceData } = space;

        return {
          ...spaceData,
          distance,
          averageRating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length
        };
      })
      .filter(space => space.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, resultLimit);

    res.json({
      status: 'success',
      data: {
        parkingSpaces: spacesWithDistance,
        searchLocation: { latitude: userLat, longitude: userLon },
        radius: searchRadius,
        totalFound: spacesWithDistance.length
      }
    });
  }
);
