import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeUserAdmin() {
  try {
    // Komut satırından email al
    const email = process.argv[2];

    if (!email) {
      console.log('❌ Kullanım: npm run make:admin <email>');
      console.log('Örnek: npm run make:admin ahmet@example.com');
      return;
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`❌ ${email} adresine sahip kullanıcı bulunamadı.`);
      return;
    }

    // Zaten admin mi kontrol et
    if (user.role === 'ADMIN') {
      console.log(`⚠️  ${email} zaten ADMIN.`);
      return;
    }

    // Admin yap
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });

    console.log('✅ Kullanıcı başarıyla ADMIN yapıldı!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${updatedUser.email}`);
    console.log(`👤 İsim: ${updatedUser.firstName} ${updatedUser.lastName}`);
    console.log(`⚡ Yeni Role: ${updatedUser.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Kullanıcı tekrar login olmalı!');
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeUserAdmin();
