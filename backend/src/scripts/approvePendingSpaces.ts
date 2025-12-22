import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function approvePendingSpaces() {
  try {
    console.log('🔍 Pending park yerlerini arıyorum...\n');

    const pendingSpaces = await prisma.parkingSpace.findMany({
      where: { status: 'PENDING' },
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (pendingSpaces.length === 0) {
      console.log('✅ Onay bekleyen park yeri bulunamadı.\n');
      return;
    }

    console.log(`📋 ${pendingSpaces.length} adet onay bekleyen park yeri bulundu:\n`);

    pendingSpaces.forEach((space, index) => {
      console.log(`${index + 1}. ${space.title}`);
      console.log(`   Sahibi: ${space.owner.firstName} ${space.owner.lastName} (${space.owner.email})`);
      console.log(`   Konum: ${space.city}, ${space.state}`);
      console.log(`   Fiyat: ₺${space.pricePerHour}/saat\n`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚡ Tüm park yerleri onaylanıyor...\n');

    const result = await prisma.parkingSpace.updateMany({
      where: { status: 'PENDING' },
      data: { status: 'APPROVED' }
    });

    console.log('✅ BAŞARILI!');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✓ ${result.count} park yeri onaylandı`);
    console.log(`✓ Artık Find Parking sayfasında görünecekler`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

approvePendingSpaces();
