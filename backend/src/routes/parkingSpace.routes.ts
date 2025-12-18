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
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('state').trim().notEmpty().withMessage('State is required'),
    body('zipCode').trim().notEmpty().withMessage('Zip code is required'),
    body('latitude').isFloat().withMessage('Valid latitude is required'),
    body('longitude').isFloat().withMessage('Valid longitude is required'),
    body('pricePerHour').isFloat({ min: 0 }).withMessage('Price per hour must be a positive number'),
    body('spaceType').isIn(['COVERED_SITE_PARKING', 'OPEN_SITE_PARKING', 'SITE_GARAGE', 'COMPLEX_PARKING']).withMessage('Invalid space type')
  ],
  validate,
  createParkingSpace
);

router.post('/:id/availability', authenticate, setAvailability);

router.patch('/:id', authenticate, updateParkingSpace);
router.delete('/:id', authenticate, deleteParkingSpace);

export default router;
