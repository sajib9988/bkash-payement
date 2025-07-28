import express from 'express';
import { PaymentController } from '../modules/payment/payment.controller';

const router = express.Router();

router.post('/create-payment', PaymentController.initiatePayment);

export const PaymentRoutes = router;