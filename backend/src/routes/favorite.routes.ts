import { Router } from 'express';
import { body } from 'express-validator';
import {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite
} from '../controllers/favorite.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getFavorites);
router.get('/check/:parkingSpaceId', checkFavorite);
router.post(
  '/',
  [body('parkingSpaceId').trim().notEmpty()],
  validate,
  addFavorite
);
router.delete('/:parkingSpaceId', removeFavorite);

export default router;
