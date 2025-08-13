import express from 'express';
import { OrderController } from './order.controller';

const router = express.Router();

router.post('/draft', OrderController.createDraftOrder);
console.log('Order routes initialized');

export const OrderRoutes = router;
