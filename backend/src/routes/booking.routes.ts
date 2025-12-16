import { Router } from 'express';
import { body } from 'express-validator';
import {
  createBooking,
  getMyBookings,
  getBooking,
  updateBookingStatus,
  getSpaceBookings
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

router.get('/my-bookings', getMyBookings);
router.get('/space/:spaceId', getSpaceBookings);
router.get('/:id', getBooking);

router.post(
  '/',
  [
    body('parkingSpaceId').isUUID(),
    body('startTime').isISO8601(),
    body('endTime').isISO8601()
  ],
  validate,
  createBooking
);

router.patch(
  '/:id/status',
  [body('status').isIn(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'])],
  validate,
  updateBookingStatus
);

export default router;
