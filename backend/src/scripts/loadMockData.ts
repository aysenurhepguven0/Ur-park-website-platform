import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function loadMockData() {
  try {
    console.log('📦 Mock data yükleniyor...');

    // SQL dosyasını oku
    const sqlPath = path.join(__dirname, '../../../MOCK_DATA.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // SQL'i satırlara böl ve -- ile başlayan yorumları temizle
    const lines = sql.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('--');
    });

    // SQL komutlarını ; ile ayır
    const sqlCommands = lines.join('\n').split(';').filter(cmd => cmd.trim());

    console.log(`📝 ${sqlCommands.length} SQL komutu bulundu`);

    // Her SQL komutunu çalıştır
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i].trim();
      if (command) {
        try {
          await prisma.$executeRawUnsafe(command);
          console.log(`✓ Komut ${i + 1}/${sqlCommands.length} başarılı`);
        } catch (error: any) {
          console.error(`✗ Komut ${i + 1} başarısız:`, error.message);
        }
      }
    }

    console.log('\n✅ Mock data başarıyla yüklendi!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Özet bilgiler
    const userCount = await prisma.user.count();
    const parkingSpaceCount = await prisma.parkingSpace.count();
    const reviewCount = await prisma.review.count();
    const bookingCount = await prisma.booking.count();

    console.log(`👥 Kullanıcılar: ${userCount}`);
    console.log(`🅿️  Park Yerleri: ${parkingSpaceCount}`);
    console.log(`⭐ Yorumlar: ${reviewCount}`);
    console.log(`📅 Rezervasyonlar: ${bookingCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

loadMockData();
