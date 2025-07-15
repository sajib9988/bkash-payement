import { Router } from 'express';
import { initiatePayment, bkashCallback } from './payment.controller';

const router = Router();

router.post('/bkash/initiate', initiatePayment);
router.post('/bkash/callback', bkashCallback);

export default router;
