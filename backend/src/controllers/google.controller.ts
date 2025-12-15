import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// Initialize Google OAuth2 client
const getGoogleClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured in environment variables');
  }
  return new OAuth2Client(clientId);
};

// Google OAuth - Handle token from frontend
export const googleAuth = asyncHandler(
  async (req: Request, res: Response) => {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        status: 'error',
        message: 'Google credential is required'
      });
    }

    try {
      // Verify the Google ID token
      const client = getGoogleClient();
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error('Unable to verify Google token');
      }

      const { email, given_name, family_name, picture, sub: googleId } = payload;

      if (!email) {
        return res.status(400).json({
          status: 'error',
          message: 'Email not provided by Google'
        });
      }

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email }
      });

      if (user) {
        // Update Google ID if not set
        if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId,
              isEmailVerified: true, // Google emails are verified
              profilePicture: picture || user.profilePicture
            }
          });
        }
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email,
            firstName: given_name || 'User',
            lastName: family_name || '',
            googleId,
            password: '', // No password for Google users
            isEmailVerified: true,
            profilePicture: picture
          }
        });
      }

      // Generate JWT
      const jwtSecret = process.env.JWT_SECRET || 'secret';
      const jwtExpiration = process.env.JWT_EXPIRES_IN || '7d';
      const token = jwt.sign(
        { userId: user.id },
        jwtSecret,
        { expiresIn: jwtExpiration }
      );

      res.json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            isEmailVerified: user.isEmailVerified
          },
          token
        }
      });
    } catch (error) {
      console.error('Google auth error:', error);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid Google credential'
      });
    }
  }
);
