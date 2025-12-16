import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import { validate } from '../middleware/validate';
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  suspendUser,
  deleteUser,
  getPlatformStats,
  getPendingSpaces,
  approveSpace,
  rejectSpace
} from '../controllers/admin.controller';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Dashboard and statistics
router.get('/dashboard', getDashboardStats);
router.get('/stats', getPlatformStats);

// User management
router.get('/users', getAllUsers);
router.patch(
  '/users/:userId/role',
  [body('role').isIn(['USER', 'ADMIN', 'MODERATOR'])],
  validate,
  updateUserRole
);
router.post('/users/:userId/suspend', suspendUser);
router.delete('/users/:userId', deleteUser);

// Parking space approval management
router.get('/spaces/pending', getPendingSpaces);
router.patch('/spaces/:spaceId/approve', approveSpace);
router.patch('/spaces/:spaceId/reject', rejectSpace);

export default router;
