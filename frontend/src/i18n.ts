import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// TÜRKÇE ÇEVİRİLER - TÜM SAYFALARI KAPSAYAN TAM ÇÖZÜM
const tr = {
  translation: {
    // Header
    header: {
      findParking: 'Park Yeri Bul',
      listYourSpace: 'Yerinizi Kirala',
      mySpaces: 'Park Yerlerim',
      myBookings: 'Rezervasyonlarım',
      messages: 'Mesajlar',
      analytics: 'Analitik',
      corporate: 'Kurumsal',
      logout: 'Çıkış',
      login: 'Giriş',
      signUp: 'Kayıt Ol'
    },

    // Login
    login: {
      title: 'Tekrar Hoş Geldiniz',
      subtitle: 'Ur-Park\'a devam etmek için giriş yapın',
      googleButton: 'Google ile Devam Et',
      divider: 'veya e-posta ile devam edin',
      email: 'E-posta',
      emailPlaceholder: 'E-posta adresinizi girin',
      password: 'Şifre',
      passwordPlaceholder: 'Şifrenizi girin',
      submit: 'Giriş Yap',
      submitting: 'Giriş yapılıyor...',
      noAccount: 'Hesabınız yok mu?',
      signUpLink: 'Kayıt olun',
      googleNotConfigured: 'Google Giriş henüz yapılandırılmamış. Lütfen e-posta girişi kullanın.'
    },

    // Register
    register: {
      title: 'Hesap Oluştur',
      subtitle: 'Bugün Ur-Park\'a katılın',
      googleButton: 'Google ile Kayıt Ol',
      divider: 'veya e-posta ile kayıt olun',
      firstName: 'Ad',
      firstNamePlaceholder: 'Adınız',
      lastName: 'Soyad',
      lastNamePlaceholder: 'Soyadınız',
      email: 'E-posta',
      emailPlaceholder: 'ornek@email.com',
      phone: 'Telefon (opsiyonel)',
      phonePlaceholder: '+90 (555) 123-4567',
      password: 'Şifre',
      passwordPlaceholder: 'Min. 6 karakter',
      submit: 'Hesap Oluştur',
      submitting: 'Hesap oluşturuluyor...',
      haveAccount: 'Zaten hesabınız var mı?',
      loginLink: 'Giriş yapın',
      googleNotConfigured: 'Google Kayıt henüz yapılandırılmamış. Lütfen e-posta kaydı kullanın.'
    },

    // Create Parking Space
    createSpace: {
      title: 'Park Yerinizi Listeleyin',
      basicInfo: 'Temel Bilgiler',
      titleLabel: 'Başlık',
      titlePlaceholder: 'Örn: Şehir merkezine yakın kapalı otopark',
      description: 'Açıklama',
      descriptionPlaceholder: 'Park yerinizi tanımlayın...',
      spaceType: 'Park Yeri Tipi',
      types: {
        COVERED_SITE_PARKING: 'Kapalı Site Otoparkı',
        OPEN_SITE_PARKING: 'Açık Site Otoparkı',
        SITE_GARAGE: 'Site Garajı',
        COMPLEX_PARKING: 'Kompleks Otoparkı'
      },
      location: 'Konum',
      address: 'Adres',
      addressPlaceholder: 'Örn: Büyükdere Caddesi No:101',
      city: 'Şehir',
      cityNote: 'Platform şu anda sadece İstanbul\'da hizmet vermektedir',
      district: 'İlçe/Bölge',
      districtPlaceholder: 'Örn: Beşiktaş, Kadıköy, Taksim',
      zipCode: 'Posta Kodu',
      zipCodePlaceholder: 'Örn: 34400',
      findOnMap: 'Haritada Konumu Bul',
      mapHint: 'Butona tıklayarak adresi geocode edin veya haritada direkt tıklayın',
      selectedLocation: 'Seçilen Konum:',
      pricing: 'Fiyatlandırma',
      pricePerHour: 'Saatlik Fiyat (₺)',
      pricePerHourPlaceholder: 'Örn: 25.00',
      pricePerHourNote: 'Türk Lirası (TL) cinsinden',
      pricePerDay: 'Günlük Fiyat (₺)',
      pricePerDayPlaceholder: 'Örn: 180.00',
      pricePerDayNote: 'Opsiyonel - Günlük kiralama için',
      pricePerMonth: 'Aylık Fiyat (₺)',
      pricePerMonthPlaceholder: 'Örn: 4500.00',
      pricePerMonthNote: 'Opsiyonel - Uzun süreli kiralama için',
      amenities: 'Özellikler ve Olanaklar',
      amenitiesLabel: 'Özellikler (virgülle ayırarak)',
      amenitiesPlaceholder: 'Örn: Güvenlik kamerası, EV şarj, 7/24 erişim, WC, Kapalı alan',
      amenitiesNote: 'Her özelliği virgülle ayırın',
      photos: 'Fotoğraflar',
      photosHint: 'Park yerinizin fotoğraflarını ekleyin (opsiyonel). Fotoğraflar kiracıların karar vermesine yardımcı olur.',
      uploadButton: 'Fotoğraf yüklemek için tıklayın veya sürükleyip bırakın',
      uploadHint: 'PNG, JPG, GIF - her biri max 10MB',
      uploadProgress: 'Yükleniyor',
      uploadingImages: 'fotoğraf yükleniyor...',
      creatingSpace: 'Park yeri oluşturuluyor...',
      submit: 'Park Yeri Oluştur',
      submitting: 'Oluşturuluyor...',
      success: 'Park yeri başarıyla oluşturuldu!',
      error: 'Park yeri oluşturulamadı',
      locationNotFound: 'Konum bulunamadı. Lütfen tekrar deneyin veya haritada tıklayın.'
    },

    // Home
    home: {
      badge: 'Akıllı Park Çözümü',
      hero: {
        title: 'Mükemmel',
        titleHighlight: 'Park Yerinizi',
        titleEnd: 'Bulun',
        subtitle: 'Park yeri sahipleriyle bağlantı kurun ve yakınınızdaki uygun yerleri keşfedin. Zamandan tasarruf edin, para biriktirin, Ur-Park ile akıllıca park edin.',
        findParking: 'Park Yeri Bul',
        listSpace: 'Yerinizi Kirala'
      },
      stats: {
        parkingSpots: 'Site Otoparkı',
        happyUsers: 'Aktif Site Yönetimi',
        cities: 'İstanbul İlçesi'
      },
      features: {
        badge: 'Nasıl Çalışır',
        title: '3 Basit Adımda Park Edin',
        subtitle: 'Park yeri bulmak ve rezervasyon yapmak hiç bu kadar kolay olmamıştı',
        step1: 'Ara',
        step1Desc: 'Gideceğiniz yeri girin ve yakınlardaki müsait park yerlerini gerçek zamanlı görün',
        step2: 'Rezerve Et',
        step2Desc: 'Güvenli ödeme ile anında yerinizi rezerve edin ve saniyeler içinde onay alın',
        step3: 'Park Edin',
        step3Desc: 'Rezerve ettiğiniz yere stressiz varın ve tam güvenle park edin'
      },
      map: {
        badge: 'Yakınınızı Keşfedin',
        title: 'Size Yakın Park Yerleri',
        subtitle: 'Popüler lokasyonlardaki müsait park yerlerini keşfedin',
        explore: 'Tüm Yerleri Keşfet'
      },
      benefits: {
        saveTime: 'Zamandan Tasarruf',
        saveTimeDesc: 'Artık park yeri aramak için blokları dolaşmayın',
        saveMoney: 'Paradan Tasarruf',
        saveMoneyDesc: 'Geleneksel otoparka göre rekabetçi fiyatlar',
        secure: 'Güvenli',
        secureDesc: 'Doğrulanmış yerler ve güvenli ödemeler',
        support: '7/24 Destek',
        supportDesc: 'Yardıma ihtiyacınız olduğunda her zaman buradayız'
      },
      corporate: {
        badge: 'Servis Firmaları İçin',
        title: 'Okul & İşyeri Servisleri için Akıllı Park Çözümü',
        subtitle: 'Servis saatleri dışında (09:00-17:00) site otoparklarında güvenli ve ekonomik park alanı',
        fleet: 'Servis Araç Yönetimi',
        fleetDesc: 'Okul ve işyeri servis araçlarınızı kolayca kaydedin ve güzergah üzerindeki site otoparklarına erişin',
        bulk: 'Toplu Site Rezervasyonu',
        bulkDesc: 'Sabah-akşam servis saatleri dışında (09:00-17:00) birden fazla servis aracı için toplu rezervasyon',
        reporting: 'Güzergah Optimizasyonu',
        reportingDesc: 'Servis rotaları üzerindeki uygun site otoparklarını harita üzerinde görün ve rezerve edin',
        priority: 'Site Yönetimleriyle Anlaşma',
        priorityDesc: 'Kadıköy, Beşiktaş ve Ataşehir\'deki anlaşmalı site yönetimleri ile garantili park',
        goToCorporate: 'Servis Paneline Git'
      },
      cta: {
        title: 'Sitenizde boş otopark alanı mı var?',
        subtitle: 'Site otoparkınızı servis saatleri dışında kiraya verin, ekstra gelir elde edin. İstanbul\'daki site yönetimlerine katılın.',
        button: 'Site Yönetimi Olarak Başlayın'
      }
    },

    // Parking Space List
    parkingList: {
      title: 'Park Yerlerini Keşfet',
      search: 'Ara...',
      filters: 'Filtreler',
      sortBy: 'Sırala',
      sortOptions: {
        distance: 'Mesafe',
        price: 'Fiyat',
        createdAt: 'En Yeni'
      },
      filterCity: 'Şehir',
      filterDistrict: 'İlçe',
      filterType: 'Tip',
      filterPrice: 'Fiyat Aralığı',
      minPrice: 'Min',
      maxPrice: 'Maks',
      apply: 'Uygula',
      clear: 'Temizle',
      noResults: 'Park yeri bulunamadı',
      showing: 'Gösteriliyor',
      of: '/',
      results: 'sonuç',
      perHour: 'saat',
      perDay: 'gün',
      perMonth: 'ay',
      away: 'uzaklıkta',
      reviews: 'değerlendirme',
      geolocationNotSupported: 'Tarayıcınız konum özelliğini desteklemiyor',
      permissionDenied: 'Konum izni reddedildi',
      positionUnavailable: 'Konum bilgisi alınamadı',
      timeout: 'Konum isteği zaman aşımına uğradı',
      unknownError: 'Bilinmeyen bir hata oluştu',
      foundResults: '{{count}} park yeri bulundu ({{radius}} mil içinde)',
      noImage: 'Fotoğraf Yok',
      milesAway: '{{distance}} mil uzakta',
      viewDetails: 'Detayları Gör',
      searchNearby: 'Yakınımda Ara',
      clearLocation: 'Konumu Temizle',
      gettingLocation: 'Konum Alınıyor...',
      locationSet: 'Konum Belirlendi',
      useMyLocation: 'Konumumu Kullan',
      within: 'İçinde',
      showingWithin: '{{radius}} mil içindeki park yerlerini gösteriliyor',
      cityPlaceholder: 'Şehir',
      statePlaceholder: 'İlçe/Bölge',
      allTypes: 'Tüm Tipler',
      types: {
        COVERED_SITE_PARKING: 'Kapalı Site Otoparkı',
        OPEN_SITE_PARKING: 'Açık Site Otoparkı',
        SITE_GARAGE: 'Site Garajı',
        COMPLEX_PARKING: 'Kompleks Otoparkı'
      },
      newestFirst: 'Önce En Yeni',
      sortByPrice: 'Fiyata Göre',
      sortByDistance: 'Mesafeye Göre',
      listView: 'Liste Görünümü',
      mapView: 'Harita Görünümü',
      splitView: 'Bölünmüş Görünüm',
      loading: 'Yükleniyor...'
    },

    // Parking Space Detail
    parkingDetail: {
      backToList: 'Listeye Dön',
      bookNow: 'Hemen Rezerve Et',
      addToFavorites: 'Favorilere Ekle',
      removeFromFavorites: 'Favorilerden Çıkar',
      contactOwner: 'Sahibi ile İletişime Geç',
      description: 'Açıklama',
      amenities: 'Özellikler',
      location: 'Konum',
      availability: 'Müsaitlik',
      reviews: 'Değerlendirmeler',
      noReviews: 'Henüz değerlendirme yok',
      leaveReview: 'Değerlendirme Bırak',
      rating: 'Puan',
      avgRating: 'Ortalama',
      pricePerHour: 'Saatlik',
      pricePerDay: 'Günlük',
      pricePerMonth: 'Aylık',
      startDate: 'Başlangıç Tarihi',
      endDate: 'Bitiş Tarihi',
      totalPrice: 'Toplam Fiyat',
      confirmBooking: 'Rezervasyonu Onayla'
    },

    // My Bookings
    myBookings: {
      title: 'Rezervasyonlarım',
      tabs: {
        active: 'Aktif',
        past: 'Geçmiş',
        cancelled: 'İptal Edilenler'
      },
      noBookings: 'Henüz rezervasyonunuz yok.',
      bookingId: 'Rezervasyon No',
      parkingSpace: 'Park Yeri',
      date: 'Tarih',
      time: 'Saat',
      duration: 'Süre',
      totalPaid: 'Toplam Ödenen',
      status: 'Durum',
      statuses: {
        pending: 'Beklemede',
        confirmed: 'Onaylandı',
        completed: 'Tamamlandı',
        cancelled: 'İptal Edildi'
      },
      paymentStatus: 'Ödeme',
      payment: 'Ödeme',
      paymentStatuses: {
        pending: 'Beklemede',
        paid: 'Ödendi',
        refunded: 'İade Edildi',
        failed: 'Başarısız'
      },
      viewDetails: 'Detayları Gör',
      cancelBooking: 'Rezervasyonu İptal Et',
      cancelConfirm: 'Bu rezervasyonu iptal etmek istediğinizden emin misiniz?',
      loading: 'Rezervasyonlarınız yükleniyor...',
      findParkingSpaces: 'Park Yerleri Bul',
      start: 'Başlangıç',
      end: 'Bitiş',
      total: 'Toplam',
      owner: 'Sahibi',
      viewSpace: 'Yeri Görüntüle',
      payNow: 'Şimdi Öde',
      cancel: 'İptal Et',
      requestRefund: 'İade Talep Et',
      cancelSuccess: 'Rezervasyon başarıyla iptal edildi',
      cancelError: 'Rezervasyon iptal edilemedi',
      refundConfirm: 'İade talep etmek istediğinizden emin misiniz? Bu rezervasyonunuzu iptal edecektir.',
      refundSuccess: 'İade talebi başarıyla oluşturuldu. İşlem 5-10 iş günü sürebilir.',
      refundError: 'İade talebi oluşturulamadı'
    },

    // My Spaces
    mySpaces: {
      title: 'Park Yerlerim',
      addNew: 'Yeni Park Yeri Ekle',
      noSpaces: 'Henüz park yeri eklememişsiniz',
      getStarted: 'İlk park yerinizi ekleyerek kazanmaya başlayın',
      status: 'Durum',
      statuses: {
        pending: 'Onay Bekliyor',
        approved: 'Onaylandı',
        rejected: 'Reddedildi'
      },
      available: 'Müsait',
      unavailable: 'Müsait Değil',
      bookings: 'Rezervasyon',
      avgRating: 'Ortalama Puan',
      edit: 'Düzenle',
      delete: 'Sil',
      deleteConfirm: 'Bu park yerini silmek istediğinizden emin misiniz?',
      manageAvailability: 'Müsaitliği Yönet'
    },

    // Profile
    profile: {
      title: 'Profilim',
      personalInfo: 'Kişisel Bilgiler',
      firstName: 'Ad',
      lastName: 'Soyad',
      email: 'E-posta',
      phone: 'Telefon',
      bio: 'Biyografi',
      bioPlaceholder: 'Kendinizden bahsedin...',
      profilePicture: 'Profil Fotoğrafı',
      changePhoto: 'Fotoğrafı Değiştir',
      verification: 'Doğrulama',
      emailVerified: 'E-posta doğrulandı',
      emailNotVerified: 'E-posta doğrulanmadı',
      phoneVerified: 'Telefon doğrulandı',
      phoneNotVerified: 'Telefon doğrulanmadı',
      verifyEmail: 'E-postayı Doğrula',
      verifyPhone: 'Telefonu Doğrula',
      changePassword: 'Şifre Değiştir',
      currentPassword: 'Mevcut Şifre',
      newPassword: 'Yeni Şifre',
      confirmPassword: 'Şifreyi Onayla',
      save: 'Kaydet',
      saving: 'Kaydediliyor...',
      updateSuccess: 'Profil başarıyla güncellendi',
      updateError: 'Profil güncellenemedi'
    },

    // Analytics
    analytics: {
      title: 'Analitik Paneli',
      subtitle: 'Park alanlarınızın performansını ve kazançlarını takip edin',
      loading: 'Analitik verileri yükleniyor...',
      error: 'Analitik verileri yüklenemedi',
      noData: 'Henüz analitik verisi yok',
      overview: 'Genel Bakış',
      earnings: 'Kazanç',
      bookings: 'Rezervasyonlar',
      views: 'Görüntülenme',
      totalSpaces: 'Toplam Alan',
      totalEarnings: 'Toplam Kazanç',
      thisMonth: 'Bu Ay',
      lastMonth: 'Geçen Ay',
      growth: 'Büyüme',
      totalBookings: 'Toplam Rezervasyon',
      completedBookings: 'Tamamlanan',
      cancelledBookings: 'İptal Edilen',
      upcomingBookings: 'Yaklaşan Rezervasyonlar',
      averageRating: 'Ortalama Puan',
      reviews: 'değerlendirme',
      occupancyRate: 'Doluluk Oranı',
      avgBookingValue: 'Ort. Rezervasyon Değeri',
      topPerformingSpaces: 'En Çok Kazandıran Yerler',
      recentActivity: 'Son Aktiviteler',
      popularTimes: {
        title: 'Popüler Rezervasyon Saatleri',
        subtitle: 'En çok tercih edilen saatler',
        bookings: 'rezervasyon'
      },
      insights: {
        title: 'İçgörüler & Öneriler',
        firstSpace: 'İlk park alanınızı ekleyerek kazanmaya başlayın!',
        lowRating: 'Ortalama puanınız iyileştirilebilir. Alan kalitesini artırmayı düşünün.',
        upcomingBookings: '{{count}} yaklaşan rezervasyonunuz var. Harika iş çıkarıyorsunuz!',
        monthlyEarnings: 'Bu ay ₺{{amount}} kazandınız!',
        milestone: 'Tebrikler! Toplam ₺1,000\'ın üzerinde kazandınız!'
      }
    },

    // Corporate Dashboard
    corporate: {
      title: 'Kurumsal Panel',
      tabs: {
        overview: 'Genel Bakış',
        fleet: 'Filo',
        reservations: 'Rezervasyonlar',
        schedule: 'Program'
      },
      overview: {
        totalVehicles: 'Toplam Araç',
        parkingSpaces: 'Park Yerleri',
        activeReservations: 'Aktif Rezervasyonlar',
        spentHours: 'Harcanan Saat'
      },
      fleet: {
        title: 'Araç Filosu Yönetimi',
        addVehicle: 'Araç Ekle',
        plateNumber: 'Plaka',
        vehicleType: 'Araç Tipi',
        driverName: 'Sürücü Adı',
        actions: 'İşlemler',
        noVehicles: 'Henüz araç eklenmedi',
        addFirst: 'İlk aracınızı ekleyin'
      },
      reservations: {
        title: 'Toplu Rezervasyon',
        selectSpaces: 'Park Yerleri Seç',
        dateRange: 'Tarih Aralığı',
        startDate: 'Başlangıç',
        endDate: 'Bitiş',
        frequency: 'Frekans',
        frequencies: {
          daily: 'Günlük',
          weekly: 'Haftalık',
          monthly: 'Aylık'
        },
        timeSlots: 'Zaman Dilimleri',
        createReservation: 'Rezervasyon Oluştur',
        selectAtLeastOne: 'En az bir park yeri seçin',
        selectDates: 'Başlangıç ve bitiş tarihleri seçin'
      }
    },

    // Messages
    messages: {
      title: 'Mesajlar',
      conversations: 'Konuşmalar',
      noConversations: 'Henüz konuşma yok',
      searchConversations: 'Konuşmalarda ara...',
      typeMessage: 'Mesaj yazın...',
      send: 'Gönder',
      online: 'Çevrimiçi',
      offline: 'Çevrimdışı',
      typing: 'yazıyor...',
      read: 'Okundu',
      delivered: 'İletildi',
      newMessage: 'Yeni Mesaj',
      loading: 'Konuşmalar yükleniyor...',
      error: 'Konuşmalar yüklenemedi',
      justNow: 'Şimdi',
      minutesAgo: 'd önce',
      hoursAgo: 's önce',
      daysAgo: 'g önce',
      connected: 'Bağlı',
      disconnected: 'Bağlantı Kesildi',
      startConversation: 'Bir park yeri sahibiyle iletişime geçerek konuşma başlatın.'
    },

    // Checkout
    checkout: {
      title: 'Ödeme',
      bookingSummary: 'Rezervasyon Özeti',
      parkingSpace: 'Park Yeri',
      startTime: 'Başlangıç',
      endTime: 'Bitiş',
      duration: 'Süre',
      hours: 'saat',
      subtotal: 'Ara Toplam',
      serviceFee: 'Hizmet Bedeli',
      total: 'Toplam',
      paymentDetails: 'Ödeme Bilgileri',
      cardHolder: 'Kart Üzerindeki İsim',
      cardNumber: 'Kart Numarası',
      expiryDate: 'Son Kullanma',
      month: 'Ay',
      year: 'Yıl',
      cvc: 'CVC',
      testCard: 'Test Kartı',
      payNow: 'Öde',
      paying: 'Ödeme yapılıyor...',
      securePayment: 'Ödemeniz güvenli bir şekilde iyzico ile işlenir',
      success: 'Ödeme başarılı! Rezervasyonunuz onaylandı.',
      error: 'Ödeme başarısız. Lütfen tekrar deneyin.'
    },

    // Notifications
    notifications: {
      title: 'Bildirimler',
      markAllRead: 'Tümünü Okundu İşaretle',
      noNotifications: 'Henüz bildirim yok',
      settings: 'Bildirim Ayarları',
      email: 'E-posta Bildirimleri',
      push: 'Push Bildirimleri',
      inApp: 'Uygulama İçi Bildirimler',
      bookingConfirmed: 'Rezervasyon onaylandı',
      bookingCancelled: 'Rezervasyon iptal edildi',
      bookingReminder: 'Rezervasyon hatırlatması',
      newMessage: 'Yeni mesaj',
      newReview: 'Yeni değerlendirme',
      paymentReceived: 'Ödeme alındı'
    },

    // Corporate Dashboard
    corporateDash: {
      title: 'Servis Araçları Paneli',
      subtitle: 'Okul ve işyeri servis araçları için site otoparkı rezervasyonu',
      corporateAccount: 'Servis Firması Hesabı',
      tabs: {
        overview: 'Genel Bakış',
        fleet: 'Araç Filosu',
        reservations: 'Toplu Rezervasyonlar',
        schedule: 'Planlama'
      },
      stats: {
        vehicles: 'Kayıtlı Araç',
        activeReservations: 'Aktif Rezervasyon',
        savingsThisMonth: 'Bu Ay Tasarruf',
        parkingTimeSlot: 'Park Zaman Dilimi'
      },
      overview: {
        title: 'İstanbul Site Otoparklarında Servis Araç Parkı',
        description: 'Kadıköy, Beşiktaş ve Ataşehir\'deki anlaşmalı site yönetimlerinin otoparklarında, servis saatleri dışında (09:00-17:00) güvenli ve uygun fiyatlı park alanı. Sabah-akşam yolcu taşıma saatlerinde araçlarınız güzergah üzerinde park edilir.',
        serviceHours: 'Servis Saatleri',
        serviceHoursTime: '07:00 - 09:00 & 17:00 - 19:00',
        serviceHoursDesc: 'Okul/İşyeri Yolcu Taşıma',
        parkingHours: 'Site Otoparkı Saatleri',
        parkingHoursTime: '09:00 - 17:00',
        parkingHoursDesc: 'Anlaşmalı Sitelerde Park',
        quickActions: 'Hızlı İşlemler',
        newBulkReservation: 'Yeni Toplu Rezervasyon',
        addVehicle: 'Araç Ekle',
        parkingSpaces: 'Park Yerleri',
        reports: 'Raporlar'
      },
      fleet: {
        title: 'Servis Araç Filosu Yönetimi',
        subtitle: 'Okul ve işyeri servis minibüs/otobüslerinizi kaydedin',
        addVehicle: 'Yeni Servis Aracı Ekle',
        platePlaceholder: 'Plaka (örn: 34 ABC 123)',
        driverPlaceholder: 'Sürücü Adı',
        vehicleTypes: {
          shuttleMinibus: 'Servis Minibüsü (14-19 kişilik)',
          shuttleBus: 'Servis Otobüsü (20+ kişilik)',
          staffVehicle: 'Personel Servisi'
        },
        addButton: 'Ekle',
        registeredVehicles: 'Kayıtlı Servis Araçları'
      },
      reservations: {
        title: 'Site Otoparkı Toplu Rezervasyonu',
        subtitle: 'Servis güzergahınız üzerindeki anlaşmalı site otoparklarından seçim yapın',
        dateRange: 'Rezervasyon Tarihleri',
        frequency: 'Tekrarlama',
        frequencyOptions: {
          daily: 'Hafta İçi Her Gün (Pzt-Cum)',
          weekly: 'Haftalık (Belirli Günler)',
          monthly: 'Aylık (Belirli Tarihler)'
        },
        timeSlots: 'Park Saatleri (Servis Dışı 09:00-17:00)',
        selectSpaces: 'Güzergah Üzerindeki Site Otoparklarını Seçin',
        selectedCount: 'seçili',
        summary: 'Rezervasyon Özeti',
        selectedVehicles: 'Seçilen Servis Araçları:',
        selectedSpaces: 'Seçilen Site Otoparkları:',
        timeSlotsLabel: 'Park Saatleri:',
        notSelected: 'Seçilmedi',
        createButton: 'Toplu Site Rezervasyonu Oluştur',
        creating: 'Rezervasyon yapılıyor...',
        selectSpaceError: 'Lütfen güzergahınız üzerinden en az bir site otoparkı seçin',
        selectDateError: 'Lütfen rezervasyon başlangıç ve bitiş tarihleri seçin',
        successMessage: 'servis aracı için site otoparkı arasında toplu rezervasyon oluşturuldu!'
      },
      schedule: {
        title: 'Planlama',
        subtitle: 'Servis araçlarınız için haftalık park programı',
        time: 'Saat',
        days: {
          monday: 'Pazartesi',
          tuesday: 'Salı',
          wednesday: 'Çarşamba',
          thursday: 'Perşembe',
          friday: 'Cuma'
        },
        service: 'Servis',
        parking: 'Park',
        legend: {
          serviceHours: 'Servis Saatleri (Yolcu Taşıma)',
          parkingHours: 'Park Saatleri (Ur-Park Rezervasyonu)'
        }
      }
    },

    // Common
    common: {
      required: 'Gerekli',
      optional: 'Opsiyonel',
      save: 'Kaydet',
      cancel: 'İptal',
      delete: 'Sil',
      edit: 'Düzenle',
      search: 'Ara',
      filter: 'Filtrele',
      loading: 'Yükleniyor...',
      error: 'Hata',
      success: 'Başarılı',
      confirm: 'Onayla',
      back: 'Geri',
      next: 'İleri',
      submit: 'Gönder',
      close: 'Kapat',
      yes: 'Evet',
      no: 'Hayır',
      perHour: '/saat',
      perDay: '/gün',
      perMonth: '/ay',
      currency: '₺',
      from: 'başlangıç',
      to: 'bitiş',
      date: 'Tarih',
      time: 'Saat',
      price: 'Fiyat',
      total: 'Toplam',
      viewMore: 'Daha Fazla Gör',
      viewLess: 'Daha Az Gör',
      selectAll: 'Tümünü Seç',
      deselectAll: 'Seçimi Kaldır'
    }
  }
};

// İNGİLİZCE ÇEVİRİLER
const en = {
  translation: {
    // Header
    header: {
      findParking: 'Find Parking',
      listYourSpace: 'List Your Space',
      mySpaces: 'My Spaces',
      myBookings: 'My Bookings',
      messages: 'Messages',
      analytics: 'Analytics',
      corporate: 'Corporate',
      logout: 'Logout',
      login: 'Login',
      signUp: 'Sign Up'
    },

    // Login
    login: {
      title: 'Welcome Back',
      subtitle: 'Sign in to continue to Ur-Park',
      googleButton: 'Continue with Google',
      divider: 'or continue with email',
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      submit: 'Sign In',
      submitting: 'Signing in...',
      noAccount: 'Don\'t have an account?',
      signUpLink: 'Sign up',
      googleNotConfigured: 'Google Sign-In is not configured yet. Please use email login.'
    },

    // Register
    register: {
      title: 'Create Account',
      subtitle: 'Join Ur-Park today',
      googleButton: 'Sign up with Google',
      divider: 'or sign up with email',
      firstName: 'First Name',
      firstNamePlaceholder: 'Your first name',
      lastName: 'Last Name',
      lastNamePlaceholder: 'Your last name',
      email: 'Email',
      emailPlaceholder: 'example@email.com',
      phone: 'Phone (optional)',
      phonePlaceholder: '+90 (555) 123-4567',
      password: 'Password',
      passwordPlaceholder: 'Min. 6 characters',
      submit: 'Create Account',
      submitting: 'Creating account...',
      haveAccount: 'Already have an account?',
      loginLink: 'Sign in',
      googleNotConfigured: 'Google Sign-Up is not configured yet. Please use email registration.'
    },

    // Create Parking Space
    createSpace: {
      title: 'List Your Parking Space',
      basicInfo: 'Basic Information',
      titleLabel: 'Title',
      titlePlaceholder: 'e.g., Covered parking near downtown',
      description: 'Description',
      descriptionPlaceholder: 'Describe your parking space...',
      spaceType: 'Space Type',
      types: {
        COVERED_SITE_PARKING: 'Covered Site Parking',
        OPEN_SITE_PARKING: 'Open Site Parking',
        SITE_GARAGE: 'Site Garage',
        COMPLEX_PARKING: 'Complex Parking'
      },
      location: 'Location',
      address: 'Address',
      addressPlaceholder: 'e.g., Büyükdere Avenue No:101',
      city: 'City',
      cityNote: 'Platform currently serves only Istanbul',
      district: 'District/Region',
      districtPlaceholder: 'e.g., Beşiktaş, Kadıköy, Taksim',
      zipCode: 'ZIP Code',
      zipCodePlaceholder: 'e.g., 34400',
      findOnMap: 'Find Location on Map',
      mapHint: 'Click button to geocode address or click directly on map',
      selectedLocation: 'Selected Location:',
      pricing: 'Pricing',
      pricePerHour: 'Price per Hour (₺)',
      pricePerHourPlaceholder: 'e.g., 25.00',
      pricePerHourNote: 'In Turkish Lira (TL)',
      pricePerDay: 'Price per Day (₺)',
      pricePerDayPlaceholder: 'e.g., 180.00',
      pricePerDayNote: 'Optional - For daily rental',
      pricePerMonth: 'Price per Month (₺)',
      pricePerMonthPlaceholder: 'e.g., 4500.00',
      pricePerMonthNote: 'Optional - For long-term rental',
      amenities: 'Amenities',
      amenitiesLabel: 'Amenities (comma-separated)',
      amenitiesPlaceholder: 'e.g., Security cameras, EV charging, 24/7 access, Restroom, Covered',
      amenitiesNote: 'Separate each amenity with a comma',
      photos: 'Photos',
      photosHint: 'Add photos of your parking space (optional). Images help renters make decisions.',
      uploadButton: 'Click to upload or drag and drop images here',
      uploadHint: 'PNG, JPG, GIF - max 10MB each',
      uploadProgress: 'Uploading',
      uploadingImages: 'image(s)...',
      creatingSpace: 'Creating parking space...',
      submit: 'Create Parking Space',
      submitting: 'Creating...',
      success: 'Parking space created successfully!',
      error: 'Failed to create parking space',
      locationNotFound: 'Could not find location. Please try again or click on the map.'
    },

    // Home
    home: {
      badge: 'Smart Parking Solution',
      hero: {
        title: 'Find Your Perfect',
        titleHighlight: 'Parking Spot',
        titleEnd: '',
        subtitle: 'Connect with parking space owners and discover convenient spots near you. Save time, save money, park smarter with Ur-Park.',
        findParking: 'Find Parking',
        listSpace: 'List Your Space'
      },
      stats: {
        parkingSpots: 'Residential Parking',
        happyUsers: 'Active Site Mgmt',
        cities: 'Istanbul Districts'
      },
      features: {
        badge: 'How It Works',
        title: 'Park in 3 Simple Steps',
        subtitle: 'Finding and booking parking has never been easier',
        step1: 'Search',
        step1Desc: 'Enter your destination and find available parking spaces nearby with real-time availability',
        step2: 'Book',
        step2Desc: 'Reserve your spot instantly with secure payment and get confirmation in seconds',
        step3: 'Park',
        step3Desc: 'Arrive at your reserved spot stress-free and park with complete confidence'
      },
      map: {
        badge: 'Explore Nearby',
        title: 'Parking Spots Near You',
        subtitle: 'Discover available parking spaces in popular locations',
        explore: 'Explore All Spots'
      },
      benefits: {
        saveTime: 'Save Time',
        saveTimeDesc: 'No more circling blocks looking for parking',
        saveMoney: 'Save Money',
        saveMoneyDesc: 'Competitive rates compared to traditional parking',
        secure: 'Secure',
        secureDesc: 'Verified spots with secure payments',
        support: '24/7 Support',
        supportDesc: 'Always here when you need help'
      },
      corporate: {
        badge: 'For Shuttle Services',
        title: 'Smart Parking Solution for School & Corporate Shuttles',
        subtitle: 'Secure and affordable parking at residential complexes during non-service hours (09:00-17:00)',
        fleet: 'Shuttle Fleet Management',
        fleetDesc: 'Easily register your school and corporate shuttle vehicles and access residential parking along your routes',
        bulk: 'Bulk Site Reservations',
        bulkDesc: 'Make bulk reservations for multiple shuttle vehicles outside service hours (09:00-17:00)',
        reporting: 'Route Optimization',
        reportingDesc: 'View and reserve available residential parking along your shuttle routes on the map',
        priority: 'Partnership with Site Mgmt',
        priorityDesc: 'Guaranteed parking through partnerships with site managements in Kadıköy, Beşiktaş and Ataşehir',
        goToCorporate: 'Go to Shuttle Panel'
      },
      cta: {
        title: 'Does your residential complex have empty parking spaces?',
        subtitle: 'Rent out your residential parking outside service hours and earn extra income. Join site managements in Istanbul.',
        button: 'Start as Site Management'
      }
    },

    // Parking Space List
    parkingList: {
      title: 'Explore Parking Spaces',
      search: 'Search...',
      filters: 'Filters',
      sortBy: 'Sort By',
      sortOptions: {
        distance: 'Distance',
        price: 'Price',
        createdAt: 'Newest'
      },
      filterCity: 'City',
      filterDistrict: 'District',
      filterType: 'Type',
      filterPrice: 'Price Range',
      minPrice: 'Min',
      maxPrice: 'Max',
      apply: 'Apply',
      clear: 'Clear',
      noResults: 'No parking spaces found',
      showing: 'Showing',
      of: 'of',
      results: 'results',
      perHour: 'hour',
      perDay: 'day',
      perMonth: 'month',
      away: 'away',
      reviews: 'reviews',
      geolocationNotSupported: 'Geolocation is not supported by your browser',
      permissionDenied: 'Location permission denied',
      positionUnavailable: 'Location information is unavailable',
      timeout: 'Location request timed out',
      unknownError: 'An unknown error occurred',
      foundResults: 'Found {count} parking spaces within {{radius}} miles',
      noImage: 'No Image',
      milesAway: '{{distance}} miles away',
      viewDetails: 'View Details',
      searchNearby: 'Search Nearby',
      clearLocation: 'Clear Location',
      gettingLocation: 'Getting Location...',
      locationSet: 'Location Set',
      useMyLocation: 'Use My Location',
      within: 'Within',
      showingWithin: 'Showing parking spaces within {{radius}} miles',
      cityPlaceholder: 'City',
      statePlaceholder: 'District/Region',
      allTypes: 'All Types',
      types: {
        COVERED_SITE_PARKING: 'Covered Site Parking',
        OPEN_SITE_PARKING: 'Open Site Parking',
        SITE_GARAGE: 'Site Garage',
        COMPLEX_PARKING: 'Complex Parking'
      },
      newestFirst: 'Newest First',
      sortByPrice: 'Sort by Price',
      sortByDistance: 'Sort by Distance',
      listView: 'List View',
      mapView: 'Map View',
      splitView: 'Split View',
      loading: 'Loading...'
    },

    // Parking Space Detail
    parkingDetail: {
      backToList: 'Back to List',
      bookNow: 'Book Now',
      addToFavorites: 'Add to Favorites',
      removeFromFavorites: 'Remove from Favorites',
      contactOwner: 'Contact Owner',
      description: 'Description',
      amenities: 'Amenities',
      location: 'Location',
      availability: 'Availability',
      reviews: 'Reviews',
      noReviews: 'No reviews yet',
      leaveReview: 'Leave a Review',
      rating: 'Rating',
      avgRating: 'Average',
      pricePerHour: 'Per Hour',
      pricePerDay: 'Per Day',
      pricePerMonth: 'Per Month',
      startDate: 'Start Date',
      endDate: 'End Date',
      totalPrice: 'Total Price',
      confirmBooking: 'Confirm Booking'
    },

    // My Bookings
    myBookings: {
      title: 'My Bookings',
      tabs: {
        active: 'Active',
        past: 'Past',
        cancelled: 'Cancelled'
      },
      noBookings: "You don't have any bookings yet.",
      bookingId: 'Booking ID',
      parkingSpace: 'Parking Space',
      date: 'Date',
      time: 'Time',
      duration: 'Duration',
      totalPaid: 'Total Paid',
      status: 'Status',
      statuses: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        completed: 'Completed',
        cancelled: 'Cancelled'
      },
      paymentStatus: 'Payment',
      payment: 'Payment',
      paymentStatuses: {
        pending: 'Pending',
        paid: 'Paid',
        refunded: 'Refunded',
        failed: 'Failed'
      },
      viewDetails: 'View Details',
      cancelBooking: 'Cancel Booking',
      cancelConfirm: 'Are you sure you want to cancel this booking?',
      loading: 'Loading your bookings...',
      findParkingSpaces: 'Find Parking Spaces',
      start: 'Start',
      end: 'End',
      total: 'Total',
      owner: 'Owner',
      viewSpace: 'View Space',
      payNow: 'Pay Now',
      cancel: 'Cancel',
      requestRefund: 'Request Refund',
      cancelSuccess: 'Booking cancelled successfully',
      cancelError: 'Failed to cancel booking',
      refundConfirm: 'Are you sure you want to request a refund? This will cancel your booking.',
      refundSuccess: 'Refund requested successfully. It may take 5-10 business days to process.',
      refundError: 'Failed to request refund'
    },

    // My Spaces
    mySpaces: {
      title: 'My Parking Spaces',
      addNew: 'Add New Space',
      noSpaces: 'You haven\'t added any parking spaces yet',
      getStarted: 'Add your first parking space to start earning',
      status: 'Status',
      statuses: {
        pending: 'Pending Approval',
        approved: 'Approved',
        rejected: 'Rejected'
      },
      available: 'Available',
      unavailable: 'Unavailable',
      bookings: 'Bookings',
      avgRating: 'Avg. Rating',
      edit: 'Edit',
      delete: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this parking space?',
      manageAvailability: 'Manage Availability'
    },

    // Profile
    profile: {
      title: 'My Profile',
      personalInfo: 'Personal Information',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      bio: 'Bio',
      bioPlaceholder: 'Tell us about yourself...',
      profilePicture: 'Profile Picture',
      changePhoto: 'Change Photo',
      verification: 'Verification',
      emailVerified: 'Email verified',
      emailNotVerified: 'Email not verified',
      phoneVerified: 'Phone verified',
      phoneNotVerified: 'Phone not verified',
      verifyEmail: 'Verify Email',
      verifyPhone: 'Verify Phone',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      save: 'Save',
      saving: 'Saving...',
      updateSuccess: 'Profile updated successfully',
      updateError: 'Failed to update profile'
    },

    // Analytics
    analytics: {
      title: 'Analytics Dashboard',
      subtitle: 'Track your parking space performance and earnings',
      loading: 'Loading analytics...',
      error: 'Failed to load analytics',
      noData: 'No analytics data available',
      overview: 'Overview',
      earnings: 'Earnings',
      bookings: 'Bookings',
      views: 'Views',
      totalSpaces: 'Total Spaces',
      totalEarnings: 'Total Earnings',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      growth: 'Growth',
      totalBookings: 'Total Bookings',
      completedBookings: 'Completed',
      cancelledBookings: 'Cancelled',
      upcomingBookings: 'Upcoming Bookings',
      averageRating: 'Average Rating',
      reviews: 'reviews',
      occupancyRate: 'Occupancy Rate',
      avgBookingValue: 'Avg. Booking Value',
      topPerformingSpaces: 'Top Performing Spaces',
      recentActivity: 'Recent Activity',
      popularTimes: {
        title: 'Popular Booking Times',
        subtitle: 'Most popular hours for bookings',
        bookings: 'bookings'
      },
      insights: {
        title: 'Insights & Recommendations',
        firstSpace: 'List your first parking space to start earning!',
        lowRating: 'Your average rating could be improved. Consider enhancing your spaces.',
        upcomingBookings: 'You have {{count}} upcoming bookings. Keep up the great work!',
        monthlyEarnings: 'You\'ve earned ₺{{amount}} this month!',
        milestone: 'Congratulations! You\'ve earned over ₺1,000 in total!'
      }
    },

    // Corporate Dashboard
    corporate: {
      title: 'Corporate Dashboard',
      tabs: {
        overview: 'Overview',
        fleet: 'Fleet',
        reservations: 'Reservations',
        schedule: 'Schedule'
      },
      overview: {
        totalVehicles: 'Total Vehicles',
        parkingSpaces: 'Parking Spaces',
        activeReservations: 'Active Reservations',
        spentHours: 'Spent Hours'
      },
      fleet: {
        title: 'Fleet Management',
        addVehicle: 'Add Vehicle',
        plateNumber: 'Plate Number',
        vehicleType: 'Vehicle Type',
        driverName: 'Driver Name',
        actions: 'Actions',
        noVehicles: 'No vehicles added yet',
        addFirst: 'Add your first vehicle'
      },
      reservations: {
        title: 'Bulk Reservation',
        selectSpaces: 'Select Parking Spaces',
        dateRange: 'Date Range',
        startDate: 'Start',
        endDate: 'End',
        frequency: 'Frequency',
        frequencies: {
          daily: 'Daily',
          weekly: 'Weekly',
          monthly: 'Monthly'
        },
        timeSlots: 'Time Slots',
        createReservation: 'Create Reservation',
        selectAtLeastOne: 'Select at least one parking space',
        selectDates: 'Select start and end dates'
      }
    },

    // Messages
    messages: {
      title: 'Messages',
      conversations: 'Conversations',
      noConversations: 'No conversations yet',
      searchConversations: 'Search conversations...',
      typeMessage: 'Type a message...',
      send: 'Send',
      online: 'Online',
      offline: 'Offline',
      typing: 'typing...',
      read: 'Read',
      delivered: 'Delivered',
      newMessage: 'New Message',
      loading: 'Loading conversations...',
      error: 'Failed to load conversations',
      justNow: 'Just now',
      minutesAgo: 'm ago',
      hoursAgo: 'h ago',
      daysAgo: 'd ago',
      connected: 'Connected',
      disconnected: 'Disconnected',
      startConversation: 'Start a conversation by contacting a parking space owner.'
    },

    // Checkout
    checkout: {
      title: 'Checkout',
      bookingSummary: 'Booking Summary',
      parkingSpace: 'Parking Space',
      startTime: 'Start',
      endTime: 'End',
      duration: 'Duration',
      hours: 'hours',
      subtotal: 'Subtotal',
      serviceFee: 'Service Fee',
      total: 'Total',
      paymentDetails: 'Payment Details',
      cardHolder: 'Cardholder Name',
      cardNumber: 'Card Number',
      expiryDate: 'Expiry Date',
      month: 'Month',
      year: 'Year',
      cvc: 'CVC',
      testCard: 'Test Card',
      payNow: 'Pay Now',
      paying: 'Processing payment...',
      securePayment: 'Your payment is securely processed with iyzico',
      success: 'Payment successful! Your booking is confirmed.',
      error: 'Payment failed. Please try again.'
    },

    // Notifications
    notifications: {
      title: 'Notifications',
      markAllRead: 'Mark All as Read',
      noNotifications: 'No notifications yet',
      settings: 'Notification Settings',
      email: 'Email Notifications',
      push: 'Push Notifications',
      inApp: 'In-App Notifications',
      bookingConfirmed: 'Booking confirmed',
      bookingCancelled: 'Booking cancelled',
      bookingReminder: 'Booking reminder',
      newMessage: 'New message',
      newReview: 'New review',
      paymentReceived: 'Payment received'
    },

    // Corporate Dashboard
    corporateDash: {
      title: 'Shuttle Vehicle Panel',
      subtitle: 'Residential parking reservation for school and corporate shuttles',
      corporateAccount: 'Shuttle Service Account',
      tabs: {
        overview: 'Overview',
        fleet: 'Vehicle Fleet',
        reservations: 'Bulk Reservations',
        schedule: 'Schedule Planning'
      },
      stats: {
        vehicles: 'Registered Vehicles',
        activeReservations: 'Active Reservations',
        savingsThisMonth: 'Savings This Month',
        parkingTimeSlot: 'Parking Time Slot'
      },
      overview: {
        title: 'Istanbul Residential Parking for Shuttle Vehicles',
        description: 'Secure and affordable parking at partner residential complexes in Kadıköy, Beşiktaş, and Ataşehir during non-service hours (09:00-17:00). Your vehicles are parked along routes during morning and evening passenger transport hours.',
        serviceHours: 'Shuttle Service Hours',
        serviceHoursTime: '07:00 - 09:00 & 17:00 - 19:00',
        serviceHoursDesc: 'School/Office Passenger Transport',
        parkingHours: 'Residential Parking Hours',
        parkingHoursTime: '09:00 - 17:00',
        parkingHoursDesc: 'Parking at Partner Sites',
        quickActions: 'Quick Actions',
        newBulkReservation: 'New Bulk Reservation',
        addVehicle: 'Add Vehicle',
        parkingSpaces: 'Parking Spaces',
        reports: 'Reports'
      },
      fleet: {
        title: 'Shuttle Fleet Management',
        subtitle: 'Register your school and corporate shuttle minibuses/buses',
        addVehicle: 'Add New Shuttle Vehicle',
        platePlaceholder: 'License Plate (e.g., 34 ABC 123)',
        driverPlaceholder: 'Driver Name',
        vehicleTypes: {
          shuttleMinibus: 'Shuttle Minibus (14-19 seats)',
          shuttleBus: 'Shuttle Bus (20+ seats)',
          staffVehicle: 'Staff Shuttle'
        },
        addButton: 'Add',
        registeredVehicles: 'Registered Shuttle Vehicles'
      },
      reservations: {
        title: 'Bulk Residential Parking Reservation',
        subtitle: 'Select from partner residential complexes along your shuttle route',
        dateRange: 'Reservation Dates',
        frequency: 'Recurrence',
        frequencyOptions: {
          daily: 'Every Weekday (Mon-Fri)',
          weekly: 'Weekly (Specific Days)',
          monthly: 'Monthly (Specific Dates)'
        },
        timeSlots: 'Parking Hours (Non-Service 09:00-17:00)',
        selectSpaces: 'Select Residential Parking Along Route',
        selectedCount: 'selected',
        summary: 'Reservation Summary',
        selectedVehicles: 'Selected Shuttle Vehicles:',
        selectedSpaces: 'Selected Residential Parking:',
        timeSlotsLabel: 'Parking Hours:',
        notSelected: 'Not Selected',
        createButton: 'Create Bulk Site Reservation',
        creating: 'Creating reservation...',
        selectSpaceError: 'Please select at least one residential parking along your route',
        selectDateError: 'Please select reservation start and end dates',
        successMessage: 'Bulk reservation created for shuttle vehicles across residential parking spaces!'
      },
      schedule: {
        title: 'Schedule Planning',
        subtitle: 'Weekly parking schedule for your service vehicles',
        time: 'Time',
        days: {
          monday: 'Monday',
          tuesday: 'Tuesday',
          wednesday: 'Wednesday',
          thursday: 'Thursday',
          friday: 'Friday'
        },
        service: 'Service',
        parking: 'Parking',
        legend: {
          serviceHours: 'Service Hours (Passenger Transport)',
          parkingHours: 'Parking Hours (Ur-Park Reservation)'
        }
      }
    },

    // Common
    common: {
      required: 'Required',
      optional: 'Optional',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      filter: 'Filter',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      close: 'Close',
      yes: 'Yes',
      no: 'No',
      perHour: '/hour',
      perDay: '/day',
      perMonth: '/month',
      currency: '₺',
      from: 'from',
      to: 'to',
      date: 'Date',
      time: 'Time',
      price: 'Price',
      total: 'Total',
      viewMore: 'View More',
      viewLess: 'View Less',
      selectAll: 'Select All',
      deselectAll: 'Deselect All'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      tr,
      en
    },
    fallbackLng: 'tr', // Varsayılan dil Türkçe
    debug: false,

    interpolation: {
      escapeValue: false
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
