import express from 'express';
import * as iyzicoController from '../controllers/iyzico.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Tüm route'lar authenticate gerektirir
router.use(authenticate);

// POST /api/payments/create - Ödeme yap
router.post('/create', iyzicoController.createPayment);

// GET /api/payments/:bookingId/status - Ödeme durumu
router.get('/:bookingId/status', iyzicoController.getPaymentStatus);

// POST /api/payments/refund - İade yap
router.post('/refund', iyzicoController.refundPayment);

export default router;
