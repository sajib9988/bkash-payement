
import express from 'express';
import { userRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { ProductRoutes } from '../modules/product/product.route';

import { PathaoShippingRoutes } from '../modules/pathao/pathao.route';
import { districtRoutes } from '../modules/district/district.route';
import { paypalRoutes } from '../modules/paypal/paypal.route';
import { OrderRoutes } from '../modules/order/order.route';



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
        path: '/pathao',
        route: PathaoShippingRoutes
    },
    {
        path: '/',
        route: districtRoutes
    },
  
    {
        path: '/paypal',
        route: paypalRoutes
    },
    {
        path: '/orders',
        route: OrderRoutes
    },
  

  
 
  

    
];

moduleRoutes.forEach(route => router.use(route.path, route.route))
export default router;