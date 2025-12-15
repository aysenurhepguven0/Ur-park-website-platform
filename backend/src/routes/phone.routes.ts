import { Router } from 'express';
import {
  sendVerificationCode,
  verifyPhone,
  resendVerificationCode,
  removePhone,
  getPhoneStatus
} from '../controllers/phone.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Phone verification routes
router.get('/status', getPhoneStatus);
router.post('/send-code', sendVerificationCode);
router.post('/verify', verifyPhone);
router.post('/resend-code', resendVerificationCode);
router.delete('/', removePhone);

export default router;
