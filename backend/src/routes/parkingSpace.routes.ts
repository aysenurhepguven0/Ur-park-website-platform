import { Router } from 'express';
import { body } from 'express-validator';
import {
  createParkingSpace,
  getParkingSpaces,
  getParkingSpace,
  updateParkingSpace,
  deleteParkingSpace,
  getMyParkingSpaces,
  getAvailability,
  setAvailability,
  getNearbyParkingSpaces
} from '../controllers/parkingSpace.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', getParkingSpaces);
router.get('/nearby', getNearbyParkingSpaces);
router.get('/my-spaces', authenticate, getMyParkingSpaces);
router.get('/:id', getParkingSpace);
router.get('/:id/availability', getAvailability);

router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('address').trim().notEmpty(),
    body('city').trim().notEmpty(),
    body('state').trim().notEmpty(),
    body('zipCode').trim().notEmpty(),
    body('latitude').isFloat(),
    body('longitude').isFloat(),
    body('pricePerHour').isFloat({ min: 0 }),
    body('spaceType').isIn(['DRIVEWAY', 'GARAGE', 'LOT', 'STREET', 'COVERED', 'UNCOVERED'])
  ],
  validate,
  createParkingSpace
);

router.post('/:id/availability', authenticate, setAvailability);

router.patch('/:id', authenticate, updateParkingSpace);
router.delete('/:id', authenticate, deleteParkingSpace);

export default router;
