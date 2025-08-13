import express from 'express';
import { OrderController } from './order.controller';

const router = express.Router();

router.post('/draft', OrderController.createDraftOrder);

export const OrderRoutes = router;
