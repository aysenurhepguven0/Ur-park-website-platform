import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getUserById
} from '../controllers/user.controller';

const router = Router();

// Public routes
router.get('/:id', getUserById);

// Protected routes
router.use(authenticate);

router.get('/me/profile', getProfile);
router.patch(
  '/me/profile',
  [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('phone').optional().trim(),
    body('bio').optional().trim(),
    body('profilePicture').optional().isURL()
  ],
  validate,
  updateProfile
);

router.patch(
  '/me/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters')
  ],
  validate,
  changePassword
);

router.delete(
  '/me/account',
  [body('password').notEmpty().withMessage('Password is required')],
  validate,
  deleteAccount
);

export default router;
