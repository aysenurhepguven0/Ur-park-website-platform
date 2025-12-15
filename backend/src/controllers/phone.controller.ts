import { Response, NextFunction } from 'express';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import smsService from '../services/sms.service';
import logger from '../services/logger.service';

// Verification code expiration time (10 minutes)
const VERIFICATION_CODE_EXPIRY_MINUTES = 10;

/**
 * Send phone verification code
 */
export const sendVerificationCode = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const { phone } = req.body;

    if (!phone) {
      return next(new AppError('Phone number is required', 400));
    }

    // Format and validate phone number
    const formattedPhone = smsService.formatPhoneNumber(phone);
    if (!smsService.isValidPhoneNumber(formattedPhone)) {
      return next(new AppError('Invalid phone number format', 400));
    }

    // Check if phone number is already verified by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        phone: formattedPhone,
        isPhoneVerified: true,
        id: { not: userId }
      }
    });

    if (existingUser) {
      return next(new AppError('This phone number is already verified by another account', 400));
    }

    // Generate verification code
    const verificationCode = smsService.generateVerificationCode();
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000);

    // Update user with phone and verification code
    await prisma.user.update({
      where: { id: userId },
      data: {
        phone: formattedPhone,
        phoneVerificationCode: verificationCode,
        phoneVerificationExpires: expiresAt,
        isPhoneVerified: false
      }
    });

    // Send SMS with verification code
    const smsSent = await smsService.sendVerificationCode(formattedPhone, verificationCode);

    if (!smsSent && process.env.NODE_ENV === 'production') {
      return next(new AppError('Failed to send verification code. Please try again.', 500));
    }

    // In development, include the code in the response for testing
    const responseData: any = {
      message: 'Verification code sent successfully',
      expiresIn: `${VERIFICATION_CODE_EXPIRY_MINUTES} minutes`
    };

    if (process.env.NODE_ENV === 'development') {
      responseData.devCode = verificationCode;
      logger.info(`[DEV] Phone verification code for ${formattedPhone}: ${verificationCode}`);
    }

    res.json({
      status: 'success',
      data: responseData
    });
  }
);

/**
 * Verify phone with code
 */
export const verifyPhone = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const { code } = req.body;

    if (!code) {
      return next(new AppError('Verification code is required', 400));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (!user.phone) {
      return next(new AppError('No phone number associated with this account', 400));
    }

    if (user.isPhoneVerified) {
      return next(new AppError('Phone number is already verified', 400));
    }

    if (!user.phoneVerificationCode || !user.phoneVerificationExpires) {
      return next(new AppError('No verification code found. Please request a new code.', 400));
    }

    // Check if code has expired
    if (new Date() > user.phoneVerificationExpires) {
      return next(new AppError('Verification code has expired. Please request a new code.', 400));
    }

    // Check if code matches
    if (user.phoneVerificationCode !== code) {
      return next(new AppError('Invalid verification code', 400));
    }

    // Mark phone as verified
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isPhoneVerified: true,
        phoneVerificationCode: null,
        phoneVerificationExpires: null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isPhoneVerified: true,
        isEmailVerified: true
      }
    });

    logger.info(`Phone verified for user ${userId}: ${user.phone}`);

    res.json({
      status: 'success',
      message: 'Phone number verified successfully',
      data: { user: updatedUser }
    });
  }
);

/**
 * Resend verification code
 */
export const resendVerificationCode = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (!user.phone) {
      return next(new AppError('No phone number associated with this account', 400));
    }

    if (user.isPhoneVerified) {
      return next(new AppError('Phone number is already verified', 400));
    }

    // Generate new verification code
    const verificationCode = smsService.generateVerificationCode();
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000);

    // Update user with new verification code
    await prisma.user.update({
      where: { id: userId },
      data: {
        phoneVerificationCode: verificationCode,
        phoneVerificationExpires: expiresAt
      }
    });

    // Send SMS with verification code
    const smsSent = await smsService.sendVerificationCode(user.phone, verificationCode);

    if (!smsSent && process.env.NODE_ENV === 'production') {
      return next(new AppError('Failed to send verification code. Please try again.', 500));
    }

    const responseData: any = {
      message: 'Verification code resent successfully',
      expiresIn: `${VERIFICATION_CODE_EXPIRY_MINUTES} minutes`
    };

    if (process.env.NODE_ENV === 'development') {
      responseData.devCode = verificationCode;
      logger.info(`[DEV] Phone verification code for ${user.phone}: ${verificationCode}`);
    }

    res.json({
      status: 'success',
      data: responseData
    });
  }
);

/**
 * Remove phone number from account
 */
export const removePhone = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        phone: null,
        isPhoneVerified: false,
        phoneVerificationCode: null,
        phoneVerificationExpires: null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isPhoneVerified: true,
        isEmailVerified: true
      }
    });

    res.json({
      status: 'success',
      message: 'Phone number removed successfully',
      data: { user: updatedUser }
    });
  }
);

/**
 * Get phone verification status
 */
export const getPhoneStatus = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        phone: true,
        isPhoneVerified: true
      }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.json({
      status: 'success',
      data: {
        phone: user.phone ? maskPhoneNumber(user.phone) : null,
        fullPhone: user.phone,
        isVerified: user.isPhoneVerified
      }
    });
  }
);

/**
 * Mask phone number for display (e.g., +1******7890)
 */
function maskPhoneNumber(phone: string): string {
  if (phone.length <= 4) return phone;
  const visibleStart = phone.slice(0, 3);
  const visibleEnd = phone.slice(-4);
  const masked = '*'.repeat(phone.length - 7);
  return visibleStart + masked + visibleEnd;
}
