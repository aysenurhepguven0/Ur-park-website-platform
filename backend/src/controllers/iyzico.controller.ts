import { Request, Response, NextFunction } from 'express';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import * as iyzicoService from '../services/iyzico.service';

/**
 * Ödeme başlat (Create Payment)
 */
export const createPayment = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const { bookingId, cardDetails } = req.body;

    // Rezervasyonu bul
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        parkingSpace: true,
        user: true
      }
    });

    if (!booking) {
      throw new AppError('Rezervasyon bulunamadı', 404);
    }

    if (booking.userId !== userId) {
      throw new AppError('Bu rezervasyona erişim yetkiniz yok', 403);
    }

    if (booking.paymentStatus === 'PAID') {
      throw new AppError('Bu rezervasyon zaten ödenmiş', 400);
    }

    // İyzico ödeme isteği hazırla
    const paymentRequest: iyzicoService.IyzicoPaymentRequest = {
      locale: 'tr',
      conversationId: booking.id,
      price: booking.totalPrice.toFixed(2),
      paidPrice: booking.totalPrice.toFixed(2),
      currency: 'TRY',
      basketId: booking.id,
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      paymentCard: {
        cardHolderName: cardDetails.cardHolderName,
        cardNumber: cardDetails.cardNumber.replace(/\s/g, ''), // Boşlukları temizle
        expireMonth: cardDetails.expireMonth,
        expireYear: cardDetails.expireYear,
        cvc: cardDetails.cvc,
        registerCard: '0'
      },
      buyer: {
        id: booking.user.id,
        name: booking.user.firstName,
        surname: booking.user.lastName,
        gsmNumber: booking.user.phone || '+905555555555',
        email: booking.user.email,
        identityNumber: '11111111111', // Test için - gerçek uygulamada kullanıcıdan alınmalı
        registrationAddress: booking.parkingSpace.address,
        ip: req.ip || '127.0.0.1',
        city: booking.parkingSpace.city,
        country: 'Turkey'
      },
      billingAddress: {
        contactName: `${booking.user.firstName} ${booking.user.lastName}`,
        city: booking.parkingSpace.city,
        country: 'Turkey',
        address: booking.parkingSpace.address
      },
      basketItems: [
        {
          id: booking.parkingSpace.id,
          name: booking.parkingSpace.title,
          category1: 'Park Yeri',
          itemType: 'VIRTUAL',
          price: booking.totalPrice.toFixed(2)
        }
      ]
    };

    try {
      // İyzico ödeme yap
      const paymentResult = await iyzicoService.createPayment(paymentRequest);

      if (paymentResult.status === 'success') {
        // Rezervasyonu güncelle
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            paymentIntentId: paymentResult.paymentId
          }
        });

        res.json({
          status: 'success',
          message: 'Ödeme başarılı',
          data: {
            paymentId: paymentResult.paymentId,
            paymentStatus: paymentResult.status
          }
        });
      } else {
        throw new AppError(
          paymentResult.errorMessage || 'Ödeme başarısız',
          400
        );
      }
    } catch (error: any) {
      console.error('İyzico Payment Error:', error);
      throw new AppError(
        error.errorMessage || error.message || 'Ödeme işlemi sırasında hata oluştu',
        500
      );
    }
  }
);

/**
 * Ödeme durumu sorgula (Check Payment Status)
 */
export const getPaymentStatus = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { bookingId } = req.params;
    const userId = req.userId!;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new AppError('Rezervasyon bulunamadı', 404);
    }

    if (booking.userId !== userId) {
      throw new AppError('Bu rezervasyona erişim yetkiniz yok', 403);
    }

    if (!booking.paymentIntentId) {
      throw new AppError('Ödeme bilgisi bulunamadı', 404);
    }

    try {
      const paymentStatus = await iyzicoService.checkPaymentStatus(
        booking.paymentIntentId,
        booking.id
      );

      res.json({
        status: 'success',
        data: paymentStatus
      });
    } catch (error: any) {
      throw new AppError(
        error.message || 'Ödeme durumu sorgulanırken hata oluştu',
        500
      );
    }
  }
);

/**
 * İade işlemi (Refund)
 */
export const refundPayment = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { bookingId } = req.body;
    const userId = req.userId!;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { parkingSpace: true }
    });

    if (!booking) {
      throw new AppError('Rezervasyon bulunamadı', 404);
    }

    // Sadece park yeri sahibi veya rezervasyon yapan iptal edebilir
    if (booking.userId !== userId && booking.parkingSpace.ownerId !== userId) {
      throw new AppError('Bu işlemi yapmaya yetkiniz yok', 403);
    }

    if (booking.paymentStatus !== 'PAID') {
      throw new AppError('Bu rezervasyon ödenmiş değil', 400);
    }

    if (!booking.paymentIntentId) {
      throw new AppError('Ödeme bilgisi bulunamadı', 404);
    }

    try {
      // İade yap
      const refundResult = await iyzicoService.refundPayment(
        booking.paymentIntentId,
        booking.totalPrice.toFixed(2),
        'TRY',
        req.ip || '127.0.0.1'
      );

      if (refundResult.status === 'success') {
        // Rezervasyonu güncelle
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'REFUNDED',
            status: 'CANCELLED'
          }
        });

        res.json({
          status: 'success',
          message: 'İade işlemi başarılı',
          data: refundResult
        });
      } else {
        throw new AppError(
          refundResult.errorMessage || 'İade işlemi başarısız',
          400
        );
      }
    } catch (error: any) {
      console.error('İyzico Refund Error:', error);
      throw new AppError(
        error.errorMessage || error.message || 'İade işlemi sırasında hata oluştu',
        500
      );
    }
  }
);
