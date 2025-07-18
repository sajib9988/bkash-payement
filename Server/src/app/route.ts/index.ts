import express from 'express';
import { userRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { PaymentRoutes } from '../modules/payment/payment.route';
import { ProductRoutes } from '../modules/product/product.route';





const router = express.Router();

const moduleRoutes = [
    {
        path: '/user',
        route: userRoutes
    },
    {
        path: '/auth',
        route: AuthRoutes
    },

    {
        path: '/payment',
        route: PaymentRoutes
    },
    {
        path: '/product',
        route: ProductRoutes
    },
  

  

  

    
];

moduleRoutes.forEach(route => router.use(route.path, route.route))
export default router;