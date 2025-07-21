
import express from 'express';
import { userRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { ProductRoutes } from '../modules/product/product.route';
import { ShippingRoutes } from '../modules/shipping/shipping.route';





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
        path: '/product',
        route: ProductRoutes
    },
    {
        path: '/shipping-cost',
        route: ShippingRoutes
    },
  

  

  

    
];

moduleRoutes.forEach(route => router.use(route.path, route.route))
export default router;