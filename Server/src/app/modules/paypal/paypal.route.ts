import express from 'express';
import {
  capturePaypalPayment,
  createAndSendInvoice,
  createPaypalInvoice,
  createPaypalOrder,
  trackPaypalOrder,
} from './paypal.controller';

const router = express.Router();

// 👉 Order Create
router.post('/order', createPaypalOrder);

// 👉 Order Track
router.get('/order/:orderId', trackPaypalOrder);

// 👉 Payment Capture
router.post('/order/:paypalOrderId/capture', capturePaypalPayment);

// 👉 Invoice Create
router.post('/invoice', createPaypalInvoice);

// 👉 Invoice Send (to email)
router.post('/invoice/send', createAndSendInvoice);

export const paypalRoutes= router;
