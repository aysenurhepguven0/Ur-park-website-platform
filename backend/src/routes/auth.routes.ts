import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, verifyEmail, resendVerification } from '../controllers/auth.controller';
import { googleAuth } from '../controllers/google.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('phone').optional().trim()
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  validate,
  login
);

router.get('/profile', authenticate, getProfile);

router.post(
  '/verify-email',
  [
    body('token').notEmpty()
  ],
  validate,
  verifyEmail
);

router.post('/resend-verification', authenticate, resendVerification);

// Google OAuth
router.post(
  '/google',
  [
    body('credential').notEmpty()
  ],
  validate,
  googleAuth
);

export default router;
