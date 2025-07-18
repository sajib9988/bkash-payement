import { Router } from 'express';
import { initiatePayment, bkashCallback } from './payment.controller';
import catchAsync from '../../utils/catchAsync';

const router = Router();

router.post('/bkash/initiate', catchAsync(initiatePayment));
router.post('/bkash/callback', catchAsync(bkashCallback));

export const PaymentRoutes = router; // ✅ export named
