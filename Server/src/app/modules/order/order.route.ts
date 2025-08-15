import express from 'express';
import { OrderController } from './order.controller';

const router = express.Router();

router.post('/draft', OrderController.createDraftOrder);
router.get('/:dbOrderId', OrderController.getOrderById);
router.get('/by-paypal-id/:paypalOrderId', OrderController.getOrderByPaypalId);

console.log('/by-paypal-id/:paypalOrderId', OrderController.getOrderByPaypalId);
// This route is for fetching order by PayPal ID



export const OrderRoutes = router;
