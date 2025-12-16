import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getOwnerAnalytics,
  getRevenueTrends,
  getSpaceAnalytics,
  getPopularTimes
} from '../controllers/analytics.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get overall owner analytics
router.get('/overview', getOwnerAnalytics);

// Get revenue trends over time
router.get('/revenue-trends', getRevenueTrends);

// Get analytics for a specific space
router.get('/spaces/:spaceId', getSpaceAnalytics);

// Get popular booking times
router.get('/popular-times', getPopularTimes);

export default router;
