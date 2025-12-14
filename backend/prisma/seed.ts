import { PrismaClient, SpaceType, SpaceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clear existing data (optional - comment out if you want to preserve existing data)
  await prisma.review.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.availability.deleteMany({});
  await prisma.favorite.deleteMany({});
  await prisma.parkingSpace.deleteMany({});
  await prisma.user.deleteMany({});

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        isEmailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        password: hashedPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1234567891',
        isEmailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike.wilson@example.com',
        password: hashedPassword,
        firstName: 'Mike',
        lastName: 'Wilson',
        phone: '+1234567892',
        isEmailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah.jones@example.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Jones',
        phone: '+1234567893',
        isEmailVerified: true,
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create parking spaces in Istanbul, Turkey
  const parkingSpaces = [
    {
      title: 'Taksim Square Parking Garage',
      description: 'Secure underground parking garage in the heart of Taksim. Perfect for tourists and business travelers. 24/7 access with security cameras.',
      address: 'Gümüşsuyu Mahallesi, İstiklal Caddesi No:12',
      city: 'Istanbul',
      state: 'Istanbul',
      zipCode: '34435',
      latitude: 41.0369,
      longitude: 28.9850,
      pricePerHour: 15,
      pricePerDay: 120,
      pricePerMonth: 2500,
      spaceType: SpaceType.GARAGE,
      status: SpaceStatus.APPROVED,
      isAvailable: true,
      amenities: ['24/7 Access', 'Security Cameras', 'Covered', 'Valet Service'],
      images: [],
      ownerId: users[0].id,
    },
    {
      title: 'Sultanahmet Historic District Lot',
      description: 'Outdoor parking lot near Blue Mosque and Hagia Sophia. Great location for sightseeing. Walking distance to major attractions.',
      address: 'Binbirdirek Mahallesi, Sultanahmet Meydanı',
      city: 'Istanbul',
      state: 'Istanbul',
      zipCode: '34122',
      latitude: 41.0082,
      longitude: 28.9784,
      pricePerHour: 12,
      pricePerDay: 100,
      spaceType: SpaceType.LOT,
      status: SpaceStatus.APPROVED,
      isAvailable: true,
      amenities: ['Security Guard', 'Well Lit'],
      images: [],
      ownerId: users[1].id,
    },
    {
      title: 'Beşiktaş Waterfront Covered Parking',
      description: 'Modern covered parking facility with Bosphorus views. Close to cafes, restaurants, and ferry terminals. Electric vehicle charging available.',
      address: 'Beşiktaş Mahallesi, Barbaros Bulvarı No:45',
      city: 'Istanbul',
      state: 'Istanbul',
      zipCode: '34353',
      latitude: 41.0422,
      longitude: 29.0075,
      pricePerHour: 18,
      pricePerDay: 150,
      pricePerMonth: 3000,
      spaceType: SpaceType.COVERED,
      status: SpaceStatus.APPROVED,
      isAvailable: true,
      amenities: ['EV Charging', 'Covered', 'Restroom', 'Car Wash'],
      images: [],
      ownerId: users[0].id,
    },
    {
      title: 'Kadıköy Residential Driveway',
      description: 'Private driveway in quiet residential neighborhood. Safe and secure. Easy access to Asian side attractions and ferry.',
      address: 'Caferağa Mahallesi, Moda Caddesi No:78',
      city: 'Istanbul',
      state: 'Istanbul',
      zipCode: '34710',
      latitude: 40.9875,
      longitude: 29.0281,
      pricePerHour: 8,
      pricePerDay: 60,
      spaceType: SpaceType.DRIVEWAY,
      status: SpaceStatus.APPROVED,
      isAvailable: true,
      amenities: ['Residential Area', 'Quiet', 'Safe Neighborhood'],
      images: [],
      ownerId: users[2].id,
    },
    {
      title: 'Levent Business District Garage',
      description: 'Corporate parking garage in the business district. Ideal for office workers and business meetings. Monthly rates available.',
      address: 'Levent Mahallesi, Büyükdere Caddesi No:101',
      city: 'Istanbul',
      state: 'Istanbul',
      zipCode: '34394',
      latitude: 41.0813,
      longitude: 29.0097,
      pricePerHour: 20,
      pricePerDay: 180,
      pricePerMonth: 3500,
      spaceType: SpaceType.GARAGE,
      status: SpaceStatus.APPROVED,
      isAvailable: true,
      amenities: ['24/7 Access', 'Security', 'Elevator', 'Business Center Nearby'],
      images: [],
      ownerId: users[1].id,
    },
    {
      title: 'Ortaköy Mosque Street Parking',
      description: 'Street parking near the famous Ortaköy Mosque and waterfront. Great for weekend visits and enjoying the local cuisine.',
      address: 'Ortaköy Mahallesi, Mecidiye Köprüsü Sokak',
      city: 'Istanbul',
      state: 'Istanbul',
      zipCode: '34347',
      latitude: 41.0475,
      longitude: 29.0267,
      pricePerHour: 10,
      pricePerDay: 80,
      spaceType: SpaceType.STREET,
      status: SpaceStatus.APPROVED,
      isAvailable: true,
      amenities: ['Waterfront', 'Restaurants Nearby', 'Weekend Market'],
      images: [],
      ownerId: users[3].id,
    },
    {
      title: 'Nişantaşı Shopping District Garage',
      description: 'Underground parking in upscale shopping district. Perfect for shopping trips and fine dining. Valet service available.',
      address: 'Teşvikiye Mahallesi, Vali Konağı Caddesi No:33',
      city: 'Istanbul',
      state: 'Istanbul',
      zipCode: '34365',
      latitude: 41.0464,
      longitude: 28.9933,
      pricePerHour: 25,
      pricePerDay: 200,
      spaceType: SpaceType.GARAGE,
      status: SpaceStatus.APPROVED,
      isAvailable: true,
      amenities: ['Valet Service', 'Luxury Brands Nearby', 'Covered', 'Security'],
      images: [],
      ownerId: users[2].id,
    },
    {
      title: 'Eminönü Bazaar Area Lot',
      description: 'Large parking lot near Grand Bazaar and Spice Bazaar. Convenient for shopping and exploring historic markets.',
      address: 'Rüstempaşa Mahallesi, Hasırcılar Caddesi',
      city: 'Istanbul',
      state: 'Istanbul',
      zipCode: '34116',
      latitude: 41.0170,
      longitude: 28.9706,
      pricePerHour: 10,
      pricePerDay: 85,
      spaceType: SpaceType.LOT,
      status: SpaceStatus.APPROVED,
      isAvailable: true,
      amenities: ['Near Markets', 'Security Guard', 'Easy Access'],
      images: [],
      ownerId: users[0].id,
    },
    {
      title: 'Bebek Coastal Parking',
      description: 'Premium parking spot in affluent Bebek neighborhood. Stunning Bosphorus views. Close to parks and upscale cafes.',
      address: 'Bebek Mahallesi, Cevdet Paşa Caddesi No:55',
      city: 'Istanbul',
      state: 'Istanbul',
      zipCode: '34342',
      latitude: 41.0779,
      longitude: 29.0431,
      pricePerHour: 22,
      pricePerDay: 180,
      spaceType: SpaceType.COVERED,
      status: SpaceStatus.APPROVED,
      isAvailable: true,
      amenities: ['Bosphorus View', 'Parks Nearby', 'Cafes', 'Safe Area'],
      images: [],
      ownerId: users[3].id,
    },
    {
      title: 'Maslak Office Complex Garage',
      description: 'Modern parking facility in major office complex. Great for daily commuters. Secure and well-maintained.',
      address: 'Maslak Mahallesi, Büyükdere Caddesi No:255',
      city: 'Istanbul',
      state: 'Istanbul',
      zipCode: '34398',
      latitude: 41.1086,
      longitude: 29.0225,
      pricePerHour: 18,
      pricePerDay: 160,
      pricePerMonth: 3200,
      spaceType: SpaceType.GARAGE,
      status: SpaceStatus.APPROVED,
      isAvailable: true,
      amenities: ['24/7 Access', 'Security', 'EV Charging', 'Car Wash'],
      images: [],
      ownerId: users[1].id,
    },
    {
      title: 'Galata Tower Area Street Parking',
      description: 'Street parking near the iconic Galata Tower. Perfect for exploring the historic Galata neighborhood and nightlife.',
      address: 'Bereketzade Mahallesi, Galata Kulesi Sokak',
      city: 'Istanbul',
      state: 'Istanbul',
      zipCode: '34421',
      latitude: 41.0256,
      longitude: 28.9744,
      pricePerHour: 12,
      pricePerDay: 95,
      spaceType: SpaceType.STREET,
      status: SpaceStatus.APPROVED,
      isAvailable: true,
      amenities: ['Historic Area', 'Restaurants', 'Nightlife', 'Art Galleries'],
      images: [],
      ownerId: users[2].id,
    },
    {
      title: 'Şişli Residential Garage',
      description: 'Quiet residential garage in central Şişli. Perfect for long-term parking. Safe and secure building.',
      address: 'Halaskargazi Mahallesi, Cumhuriyet Caddesi No:88',
      city: 'Istanbul',
      state: 'Istanbul',
      zipCode: '34371',
      latitude: 41.0588,
      longitude: 28.9861,
      pricePerHour: 14,
      pricePerDay: 110,
      pricePerMonth: 2800,
      spaceType: SpaceType.GARAGE,
      status: SpaceStatus.APPROVED,
      isAvailable: true,
      amenities: ['Residential', 'Security', 'Covered', 'Long-term Available'],
      images: [],
      ownerId: users[0].id,
    },
  ];

  const createdSpaces = await Promise.all(
    parkingSpaces.map((space) => prisma.parkingSpace.create({ data: space }))
  );

  console.log(`Created ${createdSpaces.length} parking spaces`);

  // Create some sample reviews
  const reviews = [
    {
      parkingSpaceId: createdSpaces[0].id,
      userId: users[2].id,
      rating: 5,
      comment: 'Excellent location and very secure. The valet service was exceptional!',
    },
    {
      parkingSpaceId: createdSpaces[0].id,
      userId: users[3].id,
      rating: 4,
      comment: 'Great parking spot, a bit pricey but worth it for the location.',
    },
    {
      parkingSpaceId: createdSpaces[1].id,
      userId: users[0].id,
      rating: 4,
      comment: 'Perfect for visiting the historic sites. Easy walk to all attractions.',
    },
    {
      parkingSpaceId: createdSpaces[2].id,
      userId: users[1].id,
      rating: 5,
      comment: 'Love the EV charging station! Very modern and clean facility.',
    },
    {
      parkingSpaceId: createdSpaces[3].id,
      userId: users[0].id,
      rating: 5,
      comment: 'Great value for money. The owner was very friendly and helpful.',
    },
    {
      parkingSpaceId: createdSpaces[4].id,
      userId: users[3].id,
      rating: 4,
      comment: 'Convenient for business meetings in Levent. Professional setup.',
    },
  ];

  const createdReviews = await Promise.all(
    reviews.map((review) => prisma.review.create({ data: review }))
  );

  console.log(`Created ${createdReviews.length} reviews`);

  // Update parking spaces with average ratings
  for (const space of createdSpaces) {
    const spaceReviews = await prisma.review.findMany({
      where: { parkingSpaceId: space.id },
    });

    if (spaceReviews.length > 0) {
      const avgRating =
        spaceReviews.reduce((sum, review) => sum + review.rating, 0) /
        spaceReviews.length;

      await prisma.parkingSpace.update({
        where: { id: space.id },
        data: {
          // Note: You'll need to add these fields to your Prisma schema if they don't exist
          // averageRating: avgRating,
          // reviewCount: spaceReviews.length,
        },
      });
    }
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
